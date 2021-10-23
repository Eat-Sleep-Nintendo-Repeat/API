const MEMBER = require("../../../models/MEMBER")


const express = require("express");

const route = express.Router();

route.get("/", async (req, res) => {
    var member = await MEMBER.findOne({id: req.user.id});

    return res.send(member.dev_accounts.map(x => ({
        id: x.id,
        name: x.name,
        creation_date: x.creation_date,
        cors_allowed: x.cors_allowed,
        cors: x.cors
    })))
    
})

module.exports = route;