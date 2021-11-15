const MEMBER = require("../../../models/MEMBER")


const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

//deletes use my voice declaration of consent
route.delete("/", async  (req, res) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})

    //fetch iser from database
    var memberdb = await MEMBER.findOne({id: sanitize(req.user.id)})

    if (!memberdb) return res.status(404).send({message: `Not Found - There is no Member with an ID of >${req.params.userid}<`})


    //save to database
    await MEMBER.findOneAndUpdate({id: sanitize(req.user.id)}, {usemyvoice: {accepted: false, state: "removed_by_user", signature: null, date: memberdb.usemyvoice.date}}, {new: true}).then(x => {
        res.send(x.usemyvoice)
    })


})

module.exports = route;