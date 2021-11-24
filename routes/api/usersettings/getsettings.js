const MEMBER = require("../../../models/MEMBER")
const sanitize = require("mongo-sanitize");


const express = require("express");

const route = express.Router();

route.get("/", async (req, res) => {
    //fetch usersettings
    var member = await MEMBER.findOne({"id": sanitize(req.user.id)});

    res.json(member.settings)
})

module.exports = route;