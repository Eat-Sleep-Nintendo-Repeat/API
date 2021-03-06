const MEMBER = require("../../../models/MEMBER")
var sanitizeDB = require('mongo-sanitize');
const typetoword = require("../../../modules/member_type_to_word")


const express = require("express");

const route = express.Router();

//Responses with gemstate Informations
route.get("/:userid", async (req, res) => {
    //fetch database
    var memberdb = await MEMBER.findOne({id: sanitizeDB(req.params.userid)})

    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    if (memberdb.settings.page_private && req.user.id != req.params.userid){
    var returningobject = {
        user: {
            id: memberdb.id,
            discriminator: memberdb.informations.discriminator,
            username: memberdb.informations.name,
            avatar: memberdb.informations.avatar,
            type: memberdb.type,
            typeword: typetoword(memberdb.type),
            page_private: true,
            booster: memberdb.serverbooster
        },
        gemdata: null 
    }

    res.json(returningobject)
    } else {
        var returningobject = {
            user: {
                id: memberdb.id,
                discriminator: memberdb.informations.discriminator,
                username: memberdb.informations.name,
                avatar: memberdb.informations.avatar,
                type: memberdb.type,
                typeword: typetoword(memberdb.type),
                page_private: false,
                booster: memberdb.serverbooster
            },
            gemdata: memberdb.currencys.gems
        }
    
        res.json(returningobject)        
    }
})

module.exports = route;