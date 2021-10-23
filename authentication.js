var jsw = require("jsonwebtoken")
var config = require("./config.json")
const MEMBER = require("./models/MEMBER")

const express = require("express");

const auth = express.Router();

//session_token checker
auth.use("/", async (req, res, next) => {
    //check if Header is passed
    if (!req.header("Authentication")) return res.status(401).send({"error": "unauthorized - missing auth token"})
  
    switch (req.header("Authentication").split(" ")[0]) {
      case "Access":
        //Default access_token = user
  
        //verifying token
        var token = await jsw.verify(req.header("Authentication").split(" ")[1], config.key, (err, token) => {
          if (err) return res.status(401).send({"error": `unauthorized - access_token is invalid`})
  
          //add token to req objekt
          req.user = token
          req.user.isuser = true
  
          //set cors for ui
          res.setHeader("Access-Control-Allow-Origin", "ui.eat-sleep-nintendo-repeat.eu")
          res.setHeader("Access-Control-Allow-Methods", "*")
          res.setHeader("Access-Control-Allow-Headers", "authentication")
  
          //forward request
          next();
        })
        break;
      case "Token":
        //api key = probably a bot
  
        //verifying key
        var memberdb = await MEMBER.findOne({"dev_accounts.api_key": req.header("Authentication").split(" ")[1]})
  
  
        if (!memberdb) return res.status(401).send({"error": `unauthorized - api_key is invalid`})
        var api_key = memberdb.dev_accounts.find(x => x.api_key === req.header("Authentication").split(" ")[1])
  
        req.user = {
          id: memberdb.id,
          username: memberdb.informations.name,
          discriminator: memberdb.informations.discriminator,
          avatar: memberdb.informations.avatar,
          type: memberdb.type,
          serverbooster: memberdb.serverbooster,
          isuser: false
        }
  
        //check for cors header
        if (api_key.cors_allowed && req.method === "GET" && api_key.cors != null) {
          res.setHeader("Access-Control-Allow-Origin", api_key.cors)
          res.setHeader("Access-Control-Allow-Methods", "GET")
          res.setHeader("Access-Control-Allow-Headers", "authentication")
        }
  
        //forward request
        next();
        break;
  
      default:
        return res.status(401).send({"error": `unauthorized - unknown token type >${req.header("Authentication").split(" ")[0]}<`})
    }
  })
  


module.exports = auth;