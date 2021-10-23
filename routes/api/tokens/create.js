const MEMBER = require("../../../models/MEMBER")
const nanoid = require("nanoid").nanoid;


const express = require("express");

const route = express.Router();

route.post("/", async (req, res) => {
    var member = await MEMBER.findOne({id: req.user.id});

    if (member.dev_accounts.length >= 3) return res.status(400).send({message: `You cannot create more then ${member.dev_accounts.length} API Keys`})

    if (!req.body.name) return res.status(400).send({message: "There is no name in the Body"})
    if (req.body.name.length > 20) return res.status(400).send({message: `The name must be shorter than 20 characters. Its currently ${req.body.name.length} charachters long`})
    
    //create new key and save to database
    var key = {
        id: nanoid(20),
        name: req.body.name,
        creation_date: new Date(),
        cors_allowed: false,
        cors: null,
        api_key: nanoid(120)
    }
    
    member.dev_accounts.push(key)
    await MEMBER.findOneAndUpdate({id: req.user.id}, {"dev_accounts": member.dev_accounts});

    res.send(key)
})

module.exports = route;