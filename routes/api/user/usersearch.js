const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")

const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

//responses with informations of users that are definded by id in querys
route.get("/", async (req, res) => {
    if (req.query.ids) {
        //return several users by ids
        var ids = req.query.ids.split(",")
        if (ids > 50) return res.status(400).send({error: "not allowed to request more then 50 users per call"})
        var memberdb = await MEMBER.find({id: sanitize(ids)})

        res.send(memberdb.map(x => true ? {"id": x.id, "username": x.informations.name, "discriminator": x.informations.discriminator, "avatar": x.informations.avatar, "type": x.type, "typeword": typetoword(x.type),  "serverbooster": x.serverbooster}: {})) 
    }

    else {
        //return users by search query
        var dbquery = {}
        if (req.query.id) {dbquery.id = new RegExp(req.query.id, "i")};
        if (req.query.username) {dbquery["informations.name"] = new RegExp(req.query.username, "i")}
        if (req.query.discriminator) {dbquery["informations.discriminator"] = new RegExp(req.query.discriminator, "g")}
        if (req.query.type) {dbquery["type"] = req.query.type}
        if (req.query.serverbooster) {dbquery["serverbooster"] = req.query.serverbooster}

        await MEMBER.find(sanitize(dbquery)).then(memberdb => {
            res.send(memberdb.map(x => true ? {"id": x.id, "username": x.informations.name, "discriminator": x.informations.discriminator, "avatar": x.informations.avatar, "type": x.type, "typeword": typetoword(x.type),  "serverbooster": x.serverbooster}: {}))
        }).catch(e => {
            return res.status(400).send({error: "invalid format"})
        })
    }

})

module.exports = route;