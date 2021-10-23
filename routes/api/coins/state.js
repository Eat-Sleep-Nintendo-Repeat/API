const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")


const express = require("express");

const route = express.Router();

//Responses with coinstate Informations
route.get("/:userid", async (req, res) => {
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
            typeword: typetoword(memberdb.type),
            booster: memberdb.serverbooster
        },
        coindata: memberdb.currencys.coins 
    }

    res.send(returningobject)
})

module.exports = route;