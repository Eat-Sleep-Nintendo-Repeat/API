const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")

const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

//responses with informations of users that are definded by id in querys
route.get("/", async (req, res) => {
    if (!req.query.id) return res.status(400).send({message: `Bad Request - Missing ID Query`})

    var ids = req.query.id.split(",")
    var memberdb = await MEMBER.find({id: sanitize(ids)})

    if (memberdb.length == 0) return res.status(404).send({message: `Not Found - We were not able to find a any users with one of the following ids: ${ids.join(", ")}`})


    res.send(memberdb.map(x => true ? {"id": x.id, "username": x.informations.name, "discriminator": x.informations.discriminator, "avatar": x.informations.avatar, "type": x.type, "typeword": typetoword(x.type),  "serverbooster": x.serverbooster}: {}))
})

module.exports = route;