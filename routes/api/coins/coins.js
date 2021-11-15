const express = require("express");
const MEMBER = require("../../../models/MEMBER")
var sanitize = require('mongo-sanitize');
const typetoword = require("../../../modules/member_type_to_word")

const api_route = express.Router();

//redeem daily
api_route.post("/:userid/daily", async (req, res) => {
    //fetch database
    var memberdb = await MEMBER.findOne({id: sanitize(req.params.userid)})
    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    var datenow = new Date()
    var last_daily = memberdb.currencys.coins.last_daily
    if (last_daily == null || memberdb.currencys.coins.last_daily.setHours(last_daily.getHours() + 24) < datenow){
        //last daily was redeemed 24 Hours ago or was never redeemed before
        var newlog = memberdb.currencys.coins.log
        newlog.push({"description": "daily coins", "value": 150, "date": datenow})

    
        await MEMBER.findOneAndUpdate({"id": sanitize(req.params.userid)}, {"currencys.coins.amount": memberdb.currencys.coins.amount + 150, "currencys.coins.last_daily": datenow, "currencys.coins.log": newlog})
        res.send()
    }
    else {
        var next_possible_daily = last_daily
            // next_possible_daily.setHours(next_possible_daily.getHours() + 24)
        res.status(400).send({message: `Daily was already redeemed`, tryagain: next_possible_daily})
    }
})

module.exports = api_route;
