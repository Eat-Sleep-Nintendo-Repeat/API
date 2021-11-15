const MEMBER = require("../../../models/MEMBER")


const express = require("express");
const sanitize = require("mongo-sanitize");

const route = express.Router();

route.put("/:id", async (req, res) => {
    var member = await MEMBER.findOne({id: sanitize(req.user.id)});

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

            await MEMBER.findOneAndUpdate({id: sanitize(req.user.id)}, {"dev_accounts": member.dev_accounts});
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

module.exports = route;