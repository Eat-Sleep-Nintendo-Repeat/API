const MEMBER = require("../../../models/MEMBER")
const express = require("express")
const axios = require("axios")
const api_route = express.Router();
const io = require("../../socket/socketio")

//authenticate this route (no requests via token, no access to the data of others unless you are admin)
api_route.use("/:userid", (req, res, next) => {
    if (req.user.type == 0) return res.status(403).send({message: "You dont have the right permissions to use this route"})
    
    if (req.user.type >= 50 || req.params.userid == req.user.id) return next();
    return res.status(403).send({message: `Missing Permissions - You dont have enough permissions to use this route`})
})

//responses with use my voice data of a user
api_route.get("/:userid", async  (req, res) => {
    //fetch iser from database
    var memberdb = await MEMBER.findOne({id: req.params.userid})

    if (!memberdb) return res.status(404).send({message: `Not Found - There is no Member with an ID of >${req.params.userid}<`})

    res.send(memberdb.usemyvoice)
})

//creates new use my voice declaration of consent
api_route.post("/", async  (req, res) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})

    //fetch iser from database
    var memberdb = await MEMBER.findOne({id: req.user.id})

    if (!memberdb) return res.status(404).send({message: `Not Found - There is no Member with an ID of >${req.params.userid}<`})
    
    //check if last accept is past 24 Hours
    var checking_date = new Date()
    checking_date.setDate(checking_date.getDate() - 1)
    if (memberdb.usemyvoice.date && memberdb.usemyvoice.date > checking_date) return res.status(400).send({message: `To fast - There must be 24 hours between your last acceptance attempt and this one `})

    //check if his acceptence has been blocked by an admin
    if (memberdb.usemyvoice.state === "removed_by_admin") return res.status(400).send({message: `Missing Permission - Your acceptance got removed by a member of the admin team. It is not possible to renew it by yourself`})


    //validate body
    if (!req.body.signature) return res.status(400).send({message: "Missing signature in body"})
    if (req.body.signature.length > 70) return res.status(400).send({message: `signature has too many characters. I must be smaller then 70 charackters`})
    if (req.body.signature.length === 0) return res.status(400).send({message: `signature must have more then 0 charackters`})

    if (!req.body.accept === undefined) return res.status(400).send({message: "Missing accept in body"})
    if (req.body.accept == false) return res.status(400).send({message: `You have to accept the Declaration of consent in order to complete this process`})

    if (req.body.email === undefined) return res.status(400).send({message: "Missing email in body"})
    if (req.body.email && !memberdb.oauth.scopes.find(x => x === "email")) return res.status(400).send({message: "You did not gave us permission to send you emails :("})

    //save to database
    await MEMBER.findOneAndUpdate({id: req.user.id}, {usemyvoice: {accepted: true, state: "accepted", signature: req.body.signature, date: new Date()}}, {new: true}).then(x => {
        res.send(x.usemyvoice)
        io.emit("log", {color: "#EB459E", title: "Neue use my voice Einverständniss Erklärung!", fields: [{name: "User", value: memberdb.informations.name + "#" + memberdb.informations.discriminator, inline: true}, {name: "ID", value: memberdb.id, inline: true}, {name: "Signature", value: req.body.signature}]})

        //fetch email from discord api
        if (req.body.email === true) {
            axios.get("https://discord.com/api/users/@me", {headers: {"Authorization": `Bearer ${x.oauth.access_token}`}}).then(async resd => {
                //send email
                require("./emai").sendmail(x, resd.data.email)
            }).catch()
        }


    })


})

//deletes use my voice declaration of consent
api_route.delete("/", async  (req, res) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})

    //fetch iser from database
    var memberdb = await MEMBER.findOne({id: req.user.id})

    if (!memberdb) return res.status(404).send({message: `Not Found - There is no Member with an ID of >${req.params.userid}<`})


    //save to database
    await MEMBER.findOneAndUpdate({id: req.user.id}, {usemyvoice: {accepted: false, state: "removed_by_user", signature: null, date: memberdb.usemyvoice.date}}, {new: true}).then(x => {
        res.send(x.usemyvoice)
    })


})

module.exports = api_route;