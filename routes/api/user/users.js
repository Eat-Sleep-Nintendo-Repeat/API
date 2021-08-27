const express = require("express");
const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")

const api_route = express.Router();

//responses with simple user info about requesting user itself
api_route.get("/@me", (req, res) => {
    res.send(req.user)
})

//responses with user info that matches requested id
api_route.get("/:userid", async (req, res) => {
    var memberdb = await MEMBER.findOne({id: req.params.userid})

    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})
    var responseobject = {
        id: memberdb.id,
        username: memberdb.informations.name,
        discriminator: memberdb.informations.discriminator,
        avatar: memberdb.informations.avatar,
        type: memberdb.type,
        typeword: typetoword(memberdb.type),
        serverbooster: memberdb.serverbooster,

        currencys: {
            ranks: {
                rank: memberdb.currencys.ranks.rank,
                xp: memberdb.currencys.ranks.xp
            },
            
            coins: {
                amount: memberdb.currencys.coins.amount,
                log: memberdb.currencys.coins.log.reverse().slice(0, 3)
            }, 
        },

        delete_in: memberdb.delete_in,
        joined: memberdb.joined


    }
    res.send(responseobject)
})

//responses with informations of users that are definded by id in querys
api_route.get("/", async (req, res) => {
    if (!req.query.id) return res.status(400).send({message: `Bad Request - Missing ID Query`})

    var ids = req.query.id.split(",")
    var memberdb = await MEMBER.find({id: ids})

    if (memberdb.length == 0) return res.status(404).send({message: `Not Found - We were not able to find a any users with one of the following ids: ${ids.join(", ")}`})


    res.send(memberdb.map(x => true ? {"id": x.id, "username": x.informations.name, "discriminator": x.informations.discriminator, "avatar": x.informations.avatar, "type": x.type, "serverbooster": x.serverbooster}: {}))
})

module.exports = api_route;
