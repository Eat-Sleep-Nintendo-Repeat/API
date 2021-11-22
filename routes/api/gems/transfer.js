var sanitize = require('mongo-sanitize');
const MEMBER = require("../../../models/MEMBER")


const express = require("express");

const route = express.Router();

//Transfer gems to another user
route.put("/:userid", async (req, res) => {
    // if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})
    
    //check providet data
    if (req.body.receiver === undefined) return res.status(400).send({message: `Bad Request - Missing receiver in json body`})
    if (req.body.receiver == req.params.userid) return res.status(400).send({message: `Bad Request - Receiver can not be the same as ${req.params.userid}`})
    if (req.body.amount === undefined) return res.status(400).send({message: `Bad Request - Missing amount in json body`})
    if (isNaN(req.body.amount)) return res.status(400).send({message: `Bad Request - Amount must be an int that is greater then 0`})
    if (req.body.amount < 1) return res.status(400).send({message: `Bad Request - Amount musst be greater then 0`})

    //fetch members and make sure that all of them are returned from database
    var memberdbs = await MEMBER.find({id: [req.params.userid, sanitize(req.body.receiver)]})
    if (memberdbs.length == 0) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}< and also not able to find a user with an id of >${req.body.receiver}<`})
    if (memberdbs.length < 2 && !memberdbs.find(x => x.id === req.params.userid)) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})
    if (memberdbs.length < 2 && !memberdbs.find(x => x.id === req.body.receiver)) return res.status(400).send({message: `Bad Request - We were not able to find a user with id >${req.body.receiver}<`})

    //remove gems from senderdb
    req.body.amount = Math.round(req.body.amount)
    var receiver = memberdbs.find(x => x.id === req.body.receiver)
    var payer = memberdbs.find(x => x.id === req.params.userid)

    if (payer.currencys.gems.amount < req.body.amount) return res.status(400).send({message: `Bad Request - You have not enough gems to comppete this operation`})
    payer.currencys.gems.amount = payer.currencys.gems.amount - req.body.amount
    payer.currencys.gems.log.push({"description": `überweisung an ${receiver.informations.name}#${receiver.informations.discriminator}`, "value": 0 - req.body.amount, "date": new Date()})

    await MEMBER.findOneAndUpdate({id: sanitize(payer.id)}, {"currencys.gems.amount": payer.currencys.gems.amount, "currencys.gems.log": payer.currencys.gems.log})

    //add gems to receiverdb 
    receiver.currencys.gems.amount = receiver.currencys.gems.amount + req.body.amount
    receiver.currencys.gems.log.push({"description": `überweisung von ${payer.informations.name}#${payer.informations.discriminator}`, "value": req.body.amount, "date": new Date()})
    await MEMBER.findOneAndUpdate({id: sanitize(receiver.id)}, {"currencys.gems.amount": receiver.currencys.gems.amount, "currencys.gems.log": receiver.currencys.gems.log})

    res.send()



})

module.exports = route;