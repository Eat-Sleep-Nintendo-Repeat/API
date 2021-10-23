const MEMBER = require("../../../models/MEMBER")


const express = require("express");

const route = express.Router();

route.delete("/:id", async (req, res) => {
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

module.exports = route;