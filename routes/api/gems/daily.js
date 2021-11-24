const MEMBER = require("../../../models/MEMBER")
var sanitize = require('mongo-sanitize');
const typetoword = require("../../../modules/member_type_to_word")


const express = require("express");

const route = express.Router();

//redeem daily
route.post("/:userid/daily", async (req, res) => {
    //fetch database
    var memberdb = await MEMBER.findOne({id: sanitize(req.params.userid)})
    if (!memberdb) return res.status(404).send({message: `Not Found - We were not able to find a user with id >${req.params.userid}<`})

    var datenow = new Date()
    var last_daily = memberdb.currencys.gems.last_daily
    if (last_daily == null || memberdb.currencys.gems.last_daily.setHours(last_daily.getHours() + 24) < datenow){
        //last daily was redeemed 24 Hours ago or was never redeemed before
        var newlog = memberdb.currencys.gems.log
        newlog.push({"description": "daily gems", "value": 150, "date": datenow})

    
        await MEMBER.findOneAndUpdate({"id": sanitize(req.params.userid)}, {"currencys.gems.amount": memberdb.currencys.gems.amount + 150, "currencys.gems.last_daily": datenow, "currencys.gems.log": newlog})
        res.send({})
    }
    else {
        var next_possible_daily = last_daily
            // next_possible_daily.setHours(next_possible_daily.getHours() + 24)
        res.status(400).send({message: `Daily was already redeemed`, tryagain: next_possible_daily})
    }
})
module.exports = route;