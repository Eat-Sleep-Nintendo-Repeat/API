const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")

const express = require("express");

const route = express.Router();

//responses with informations of top 10 Ranklist Users
route.get("/", async (req, res) => {
    if (!req.query.max) req.query.max = 10
    var memberdb = await MEMBER.find().sort({"currencys.ranks.rank": -1})
        memberdb = memberdb.slice(0, req.query.max)
        res.send(memberdb.map(x => true ? {"id": x.id, "username": x.informations.name, "discriminator": x.informations.discriminator, "avatar": x.informations.avatar, "type": x.type, "typeword": typetoword(x.type), "serverbooster": x.serverbooster, rank: x.currencys.ranks.rank}: {}))
})

module.exports = route;