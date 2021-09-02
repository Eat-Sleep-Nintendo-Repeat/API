const express = require("express");
var cookieParser = require("cookie-parser");
var jsw = require("jsonwebtoken")
var config = require("./config.json")
var bodyParser = require('body-parser')
const MEMBER = require("./models/MEMBER")


const app = express();
app.use(cookieParser());
app.use(bodyParser.json())

//CORS Preflight request handler
app.options('*', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "authorization")
  res.setHeader("Access-Control-DEV-MESSAGE", "only * for preflight")
  res.send();
})

//CORS null origin handler
// app.options('*', (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*")
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
//   res.setHeader("Access-Control-Allow-Headers", "authorization")
//   res.setHeader("Access-Control-DEV-MESSAGE", "only * for preflight")
//   res.send();
// })

//database
require("./database")

//// routes
// auth route
const discord_oauth = require("./routes/api/auth/discord oauth")
const token_exchange = require("./routes/api/auth/token-exchange")
const api_key = require("./routes/api/auth/api-keys")
app.use("/auth", discord_oauth)
app.use("/auth", token_exchange)

//session_token checker
app.use("/", async (req, res, next) => {
  //check if Header is passed
  if (!req.header("Authorization")) return res.status(401).send({"message": "unauthorized - missing access_token"})

  switch (req.header("Authorization").split(" ")[0]) {
    case "Access":
      //Default access_token = user

      //verifying token
      var token = await jsw.verify(req.header("Authorization").split(" ")[1], config.key, (err, token) => {
        if (err) return res.status(401).send({"error": `unauthorized - access_token is invalid`})

        //add token to req objekt
        req.user = token
        req.user.isuser = true

        //forward request
        next();
      })
      break;
    case "Token":
      //api key = probably a bot

      //verifying key
      var memberdb = await MEMBER.findOne({"dev_accounts.api_key": req.header("Authorization").split(" ")[1]})


      if (!memberdb) return res.status(401).send({"error": `unauthorized - api_key is invalid`})
      var api_key = memberdb.dev_accounts.find(x => x.api_key === req.header("Authorization").split(" ")[1])

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
        res.setHeader("Access-Control-Allow-Headers", "authorization")
      }

      //forward request
      next();
      break;

    default:
      return res.status(401).send({"message": `unauthorized - unknown token type >${req.header("Authorization").split(" ")[0]}<`})
  }
})

app.use("/auth/keys", api_key)

//users route
const users = require("./routes/api/user/users")
app.use("/users", users)

// coins route
const coins = require("./routes/api/coins/coins")
app.use("/coins", coins)

// warns route
const warns = require("./routes/api/warns/warns");
const { request } = require("express");
app.use("/warns", warns)

app.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
