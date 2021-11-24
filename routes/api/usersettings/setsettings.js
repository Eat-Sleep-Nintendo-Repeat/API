const MEMBER = require("../../../models/MEMBER")
const sanitize = require("mongo-sanitize");


const express = require("express");

const route = express.Router();

route.post("/", async (req, res) => {
    //fetch usersettings
    var member = await MEMBER.findOneAndUpdate({"id": sanitize(req.user.id)}, {"settings": sanitize(req.body)}).then(() => {
        res.send({})
    }).catch(e => {
        console.log(e);
        res.status(400).json({error: "The Input of your request is not correct"})
    })

    
})

module.exports = route;