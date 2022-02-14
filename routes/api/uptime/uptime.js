const express = require("express");
const axios = require("axios")
const config = require("../../../config.json")
const io = require("../../socket/socketio")
const {nanoid} = require("nanoid")


const route = express.Router();

var fetch = null;

//fetch data from uptimerobot and returns services that are offline
route.get("/", (req, res) => {
    if (fetch === null) {
        axios.post("https://api.uptimerobot.com/v2/getMonitors?format=json", {
             "api_key": config.uptimerobot_api.api_key,
             "statuses": "8-9"
        }).then(resx => {
            if (resx.data.stat == "ok") {
                fetch = resx.data
                res.json({offline: resx.data.monitors.map(x => true ? {"name": x.friendly_name, id: x.id} : {})})
                setTimeout(() => {fetch = null}, 60000)
            }
            else {
                res.status(500).json({error: "Something went wrong on our side. The Developer of this API has been notified"})
                io.emit("log", {color: "#ED4245", title: "FEHLER! uptime_robot_api error:state not 'ok'", description: "```json\n" + resx.data + "```"})
            }
        }).catch(e => {
            res.status(500).json({error: "Something went wrong on our side. The Developer of this API has been notified"})
            io.emit("log", {color: "#ED4245", title: "FEHLER! uptime_robot_api error", description: "```" + e.message + "```"})
        })
    } else {
        res.json({offline: fetch.monitors.map(x => true ? {"name": x.friendly_name, id: x.id} : {})})
    }
})

//send 200 if Bot is reachable via socket.io
route.get("/bot", (req, res) => {

    //if bot isnt responding within 10 seconds send 500
    var timeout = setTimeout(() => {
        res.status(500).send()
    }, 10000)

    let oid = nanoid()
    io.emitter.once(`uptime_${oid}`, data => {
        res.status(200).send();
        clearTimeout(timeout);
    });

    io.to("system").emit("uptime", {oid});
    
})

module.exports = route;