const MEMBER = require("../../models/MEMBER")
var jsw = require("jsonwebtoken")
var config = require("../../config.json")
var {io} = require("../../index")
const sanitize = require("mongo-sanitize")

const EventEmitter = require('events');
class Emitter extends EventEmitter {}
io.emitter = new Emitter();

//event groups
const EventGroups = [
    {
        name: "system", //this one is for communication between api and discord bot
        mintype: 99
    }
]

//handle authentication
io.use(async (socket, next) => {
    if (!socket.handshake.query || !socket.handshake.query.Authentication) return next(new Error('unauthorized - missing auth token'));
        switch (socket.handshake.query.Authentication.split(" ")[0]) {
            case "Access":
                //default access_token gererated by user authentication

                //verifying token
                //verifying token
                await jsw.verify(socket.handshake.query.Authentication.split(" ")[1], config.key, (err, token) => {
                    if (err) return next(new Error('unauthorized - access_token is invalid'));

                    //add token to req objekt
                    socket.user = token
                    socket.user.isuser = true

                    //forward request
                    next();
                })
            break;

            case "Token":
                //bot key

                //verifying key 
                var memberdb = await MEMBER.findOne({"dev_accounts.api_key": sanitize(socket.handshake.query.Authentication.split(" ")[1])})

                if (!memberdb) return next(new Error('unauthorized - token is invalid'));
                if (memberdb.oauth.blocking_state.is_blocked) return next(new Error('You are being blocked from accessing our API'));
                var api_key = memberdb.dev_accounts.find(x => x.api_key === socket.handshake.query.Authentication.split(" ")[1])

                socket.user = {
                    id: memberdb.id,
                    username: memberdb.informations.name,
                    discriminator: memberdb.informations.discriminator,
                    avatar: memberdb.informations.avatar,
                    type: memberdb.type,
                    serverbooster: memberdb.serverbooster,
                    isuser: false
                  }
                
                //check for cors header
                  if (socket.handshake.headers.origin) {
                      if (api_key.cors_allowed == false || api_key.cors != null) return next(new Error('cors - the api_key you are using has no cors permission or has no cors header specified'));
                      if (socket.handshake.headers.origin.toLowerCase() != api_key.cors.toLowerCase()) return next(new Error('cors - the origin of this request is not the same as the allowed cors origin from your api_key'));
                  }
                  next();
            break;
        
            default:
                return next(new Error('unauthorized - invalid auth type'));
        }
    
})

io.on("connection", (socket) => {
    //check every ten minutes if user is still allowed to use api
    var StillValidCheck = setInterval(async () => {
    var memberdb = await MEMBER.findOne({"id": sanitize(socket.user.id)})

    if (memberdb.oauth.blocking_state.is_blocked === true) io.in(socket.id).disconnectSockets();
    }, 600000)

    //adds user to his own log room
    socket.join("log_" + socket.user.id)

    socket.on("disconnect", () => {
        //ends StillValidCheck Interval when connection ends
        clearInterval(StillValidCheck)
    })

    //allows connected clients to join an event group
    socket.on("join", data => {
        if (!data.EventGroup) return socket.to(`log_${socket.user.id}`).emit("log", {error: `Missing Argument`});

       //search for requestest event group
        if (!EventGroups.find(x => x.name === data.EventGroup.split(" ")[0])) return socket.to(`log_${socket.user.id}`).emit("log", {error: `There is no Event Group called ${data.EventGroup}`});
        if (EventGroups.find(x => x.name === data.EventGroup.split(" ")[0]).mintype > socket.user.type) return socket.to(`log_${socket.user.id}`).emit("log", {error: `You dont have enough permissions to access ${data.EventGroup}`});

        socket.join(data.EventGroup)

        //Send join confirmation
        socket.to(`log_${socket.user.id}`).emit("log", {message: `successfully joined ${data.EventGroup}`})
    })

    //allows connected clients to leave an event group
    socket.on("leave", data => {
        if (!data.EventGroup) return socket.to(`log_${socket.user.id}`).emit("log", {error: `Missing Argument`});

       //search for requestest event group
        if (!EventGroups.find(x => x.name === data.EventGroup.split(" ")[0])) return socket.to(`log_${socket.user.id}`).emit("log", {error: `There is no Event Group called ${data.EventGroup}`});

        socket.leave(data.EventGroup)
    })



    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call (this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };

    socket.on("*",function(event,data) {
        io.emitter.emit(event, data);
    });
})

module.exports = io;
