const express = require("express");
const MEMBER = require("../../../models/MEMBER")

const api_route = express.Router();

//authenticates this route
api_route.use("/:userid", (req, res, next) => {
    //check if auth token is from a bot user
    if (req.user.type >= 50 || req.params.userid == req.user.id) return next();
    return res.status(403).send({message: `Missing Permissions - You dont have enough permissions to use this route`})
})

//Responses with coinstate Informations
api_route.get("/:userid", async (req, res) => {
    //fetch database
    var memberdb = await MEMBER.findOne({id: req.params.userid})

    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    var returningobject = {
        user: {
            id: memberdb.id,
            discriminator: memberdb.informations.discriminator,
            username: memberdb.informations.name,
            avatar: memberdb.informations.avatar,
            type: memberdb.type,
            booster: memberdb.serverbooster
        },
        coindata: memberdb.currencys.coins 
    }

    res.send(returningobject)
})

//Transfer Coins to another user
api_route.put("/:userid", async (req, res) => {
    // if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})
    
    //check providet data
    if (req.body.receiver === undefined) return res.status(400).send({message: `Bad Request - Missing receiver in json body`})
    if (req.body.receiver == req.params.userid) return res.status(400).send({message: `Bad Request - Receiver can not be the same as ${req.params.userid}`})
    if (req.body.amount === undefined) return res.status(400).send({message: `Bad Request - Missing amount in json body`})
    if (isNaN(req.body.amount)) return res.status(400).send({message: `Bad Request - Amount must be an int that is greater then 0`})
    if (req.body.amount < 1) return res.status(400).send({message: `Bad Request - Amount musst be greater then 0`})

    //fetch members and make sure that all of them are returned from database
    var memberdbs = await MEMBER.find({id: [req.params.userid, req.body.receiver]})
    if (memberdbs.length == 0) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}< and also not able to find a user with an id of >${req.body.receiver}<`})
    if (memberdbs.length < 2 && !memberdbs.find(x => x.id === req.params.userid)) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})
    if (memberdbs.length < 2 && !memberdbs.find(x => x.id === req.body.receiver)) return res.status(400).send({message: `Bad Request - We were not able to find a user with id >${req.body.receiver}<`})

    //remove coins from senderdb
    req.body.amount = Math.round(req.body.amount)
    var receiver = memberdbs.find(x => x.id === req.body.receiver)
    var payer = memberdbs.find(x => x.id === req.params.userid)

    if (payer.currencys.coins.amount < req.body.amount) return res.status(400).send({message: `Bad Request - You have not enough coins to comppete this operation`})
    payer.currencys.coins.amount = payer.currencys.coins.amount - req.body.amount
    payer.currencys.coins.log.push({"description": `überweisung an ${receiver.informations.name}#${receiver.informations.discriminator}`, "value": 0 - req.body.amount, "date": new Date()})

    await MEMBER.findOneAndUpdate({id: payer.id}, {"currencys.coins.amount": payer.currencys.coins.amount, "currencys.coins.log": payer.currencys.coins.log})

    //add coins to receiverdb 
    receiver.currencys.coins.amount = receiver.currencys.coins.amount + req.body.amount
    receiver.currencys.coins.log.push({"description": `überweisung von ${payer.informations.name}#${payer.informations.discriminator}`, "value": req.body.amount, "date": new Date()})
    await MEMBER.findOneAndUpdate({id: receiver.id}, {"currencys.coins.amount": receiver.currencys.coins.amount, "currencys.coins.log": receiver.currencys.coins.log})

    res.send()



})

//redeem daily
api_route.post("/:userid/daily", async (req, res) => {
    //fetch database
    var memberdb = await MEMBER.findOne({id: req.params.userid})
    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    var datenow = new Date()
    var last_daily = memberdb.currencys.coins.last_daily
    if (last_daily == null || memberdb.currencys.coins.last_daily.setHours(last_daily.getHours() + 24) < datenow){
        //last daily was redeemed 24 Hours ago or was never redeemed before
        var newlog = memberdb.currencys.coins.log
        newlog.push({"description": "daily coins", "value": 150, "date": datenow})

    
        await MEMBER.findOneAndUpdate({"id": req.params.userid}, {"currencys.coins.amount": memberdb.currencys.coins.amount + 150, "currencys.coins.last_daily": datenow, "currencys.coins.log": newlog})
        res.send()
    }
    else {
        var next_possible_daily = last_daily
            next_possible_daily.setHours(next_possible_daily.getHours() + 24)
        res.status(400).send({message: `Daily was already redeemed`, tryagain: next_possible_daily})
    }
})

module.exports = api_route;
