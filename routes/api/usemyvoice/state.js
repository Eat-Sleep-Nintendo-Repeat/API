const MEMBER = require("../../../models/MEMBER")


const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

//responses with use my voice data of a user
route.get("/:userid", async  (req, res) => {
    //fetch iser from database
    var memberdb = await MEMBER.findOne({id: sanitize(req.params.userid)})

    if (!memberdb) return res.status(404).send({message: `Not Found - There is no Member with an ID of >${req.params.userid}<`})

    res.json(memberdb.usemyvoice)
})

module.exports = route;