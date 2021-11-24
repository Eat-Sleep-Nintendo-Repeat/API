const MEMBER = require("../../../models/MEMBER")
const typetoword = require("../../../modules/member_type_to_word")

const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

//responses with user info that matches requested id
route.get("/:userid", async (req, res) => {
    var memberdb = await MEMBER.findOne({id: sanitize(req.params.userid)})

    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    if (memberdb.settings.page_private && req.user.id != req.params.userid) {
        var responseobject = {
            id: memberdb.id,
            username: memberdb.informations.name,
            discriminator: memberdb.informations.discriminator,
            avatar: memberdb.informations.avatar,
            type: memberdb.type,
            typeword: typetoword(memberdb.type),
            private_page: true,
            serverbooster: memberdb.serverbooster,

            currencys: {
                ranks: {
                    rank: null,
                    xp: null
                },
                
                gems: {
                    amount: null,
                    log: null
                }, 
            },

            delete_in: memberdb.delete_in,
            joined: memberdb.joined
        }
        res.json(responseobject)
    }
    else {
        var responseobject = {
            id: memberdb.id,
            username: memberdb.informations.name,
            discriminator: memberdb.informations.discriminator,
            avatar: memberdb.informations.avatar,
            type: memberdb.type,
            typeword: typetoword(memberdb.type),
            private_page: false,
            serverbooster: memberdb.serverbooster,

            currencys: {
                ranks: {
                    rank: memberdb.currencys.ranks.rank,
                    xp: memberdb.currencys.ranks.xp
                },
                
                gems: {
                    amount: memberdb.currencys.gems.amount,
                    log: memberdb.currencys.gems.log.reverse().slice(0, 3)
                }, 
            },

            delete_in: memberdb.delete_in,
            joined: memberdb.joined


        }
        res.json(responseobject)
}
})

module.exports = route;