const express = require("express");
const DiscordOauth2 = require("discord-oauth2");
const MEMBER = require("../../../models/MEMBER")
const axios = require("axios").default
const nanoid = require("nanoid").nanoid;

const config = require("../../../config.json")
const app = express.Router();

app.use("/", (req, res, next) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})
    if (req.user.type == 0) return res.status(403).send({message: "You dont have the right permissions to use this route"})
    next();
})

app.get("/", async (req, res) => {
    var member = await MEMBER.findOne({id: req.user.id});

    return res.send(member.dev_accounts.map(x => ({
        id: x.id,
        name: x.name,
        creation_date: x.creation_date,
        cors_allowed: x.cors_allowed,
        cors: x.cors
    })))
    
})

app.post("/", async (req, res) => {
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

app.delete("/:id", async (req, res) => {
    var member = await MEMBER.findOne({id: req.user.id});

    if (!member.dev_accounts.find(x => req.params.id === x.id)) return res.status(404).send({message: `There is no API_Key with an id of >${req.params.id}<`})
    
    //filter key object
    for( var i = 0; i < member.dev_accounts.length; i++){ 
        if ( member.dev_accounts[i].id === req.params.id) {
            member.dev_accounts.splice(i, 1); 
        }
    }

    //save new key object to database
    await MEMBER.findOneAndUpdate({id: req.user.id}, {"dev_accounts": member.dev_accounts});
    res.status(200).send("OK")

})

app.put("/:id", async (req, res) => {
    var member = await MEMBER.findOne({id: req.user.id});

    if (!member.dev_accounts.find(x => req.params.id === x.id)) return res.status(404).send({message: `There is no API_Key with an id of >${req.params.id}<`})
    
    

    //filter key object
    for( var i = 0; i < member.dev_accounts.length; i++){ 
        if ( member.dev_accounts[i].id === req.params.id) {
            if (req.body.name) {
                if (req.body.name.length > 20) return res.status(400).send({message: `The name must be shorter than 20 characters. Its currently ${req.body.name.length} charachters long`})
                    member.dev_accounts[i].name = req.body.name
            } 
            if (req.body.cors) {
                if (member.dev_accounts[i].cors_allowed == false) return res.status(400).send({message: `This API Key is not allowed for CORS usage`})
                if (req.body.cors.includes("*")) return res.status(400).send({message: `Wildcards are not supportet`})
                
                member.dev_accounts[i].cors = req.body.cors.split(" ")[0]
            }
            if (req.body.cors === null)  member.dev_accounts[i].cors = null

            await MEMBER.findOneAndUpdate({id: req.user.id}, {"dev_accounts": member.dev_accounts});
            return res.send(member.dev_accounts.map(x => ({
                id: x.id,
                name: x.name,
                creation_date: x.creation_date,
                cors_allowed: x.cors_allowed,
                cors: x.cors
            }))[i])
        }
    }

})

module.exports = app;
