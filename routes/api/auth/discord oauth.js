const express = require("express");
const DiscordOauth2 = require("discord-oauth2");
const MEMBER = require("../../../models/MEMBER")
const axios = require("axios").default
const nanoid = require("nanoid").nanoid;
var jwt = require('jsonwebtoken');

const config = require("../../../config.json")

const app = express.Router();

var tls = false;

//redirect to Discord
app.get("/discord", (req, res) => {
res.redirect(
    `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${
      config.discord_api.client_id
    }&scope=${"identify email"}&redirect_uri=${`${tls == true ? "https" : "http"}://${req.headers.host}${req.headers.production_mode ? ":5670" : ""}/api/v1/auth/discord/callback`}`
  );
})

//callback from Discord 
app.get("/discord/callback", async (req, res) => {
    //check for code
    if (!req.query.code) return res.status(400).send("No Discord callback token found")
    var code = req.query.code

    //exchange callback code to auth tokens
    var tokens = await new DiscordOauth2().tokenRequest({
        clientId: config.discord_api.client_id,
        clientSecret: config.discord_api.client_secret,
        code: code,
        scope: "identify email",
        grantType: "authorization_code",
        redirectUri: `${`${tls == true ? "https" : "http"}://${req.headers.host == "192.168.0.103" ? "192.168.0.103:5670" : req.headers.host}/api/v1/auth/discord/callback`}`
    }).catch(e => {
        res.status(500).send("[DISCORD CALLBACK] Ein Fehler ist während des Logins aufgetreten. Falls dies öfters passiert, schicke bitte einen Screenshot von diesen Text an einen verantwortlichen von Eat, Sleep, Nintendo, Repeat\n\n::: " + JSON.stringify(e.response))
      })

    if (!tokens) return;
    var access_token = tokens.access_token,
        refresh_token = tokens.refresh_token,
        scopes = tokens.scope.split(" "),
        expire_date = new Date();
        expire_date.setSeconds(expire_date.getSeconds() + (tokens.expires_in / 100 * 95))

    axios.get("https://discord.com/api/users/@me", {headers: {"Authorization": `Bearer ${tokens.access_token}`}}).then(async resd => {
      //fetch member from database
      var memberdb = await MEMBER.findOne({id: resd.data.id})
      if (!memberdb) return res.status(403).send(`Fehler: Der User "${resd.data.username}" ist nicht in der Eat, Sleep, Nintendo, Repeat Datenbank! Du musst dem Server erst joinen um einen Datemsatz erstellt zu bekommen. Bitte versuche NICHT dich erneut ein zu loggen"`)
      if (memberdb.oauth.blocking_state.is_blocked) return res.status(403).send(`You are being blocked from accessing our API. If you think that your API ban is unreasoned or unfair, contact a representative of Eat, Sleep, Nintendo, Repeat`)

      //generate cookie and save it to cookie storage
      var user_refresh_token = nanoid(64);
      //add to cookie storage
      memberdb.oauth.cookies.push({refresh_token: user_refresh_token})
      if (5 < memberdb.oauth.cookies.length) {
        memberdb.oauth.cookies.shift();
      } //if there are more then 5 cookies registered, remove the oldest one from db


      //save everything to database
      await MEMBER.findOneAndUpdate({id: resd.data.id}, {
        "oauth.access_token": access_token,
        "oauth.refresh_token": refresh_token,
        "oauth.expire_date": expire_date,
        "oauth.scopes": scopes,
        "oauth.redirect": `${`${tls == true ? "https" : "http"}://${req.headers.host == "192.168.0.103" ? "192.168.0.103:5670" : req.headers.host}/api/v1/auth/discord/callback`}`,
        "oauth.cookies": memberdb.oauth.cookies
      }).then(() => {
        //save cookie in browser storage
        var cookieexpire = new Date();
        cookieexpire.setMonth(cookieexpire.getMonth() + 1)
        res.cookie("refresh_token", user_refresh_token, { expires: cookieexpire});

        //redirect user to the page if UI has set a redirect
        if(req.cookies.redirect) {
           res.clearCookie("redirect")
           res.redirect(req.cookies.redirect)
        }

        //redirect user to UI Mainpage if UI didt set a redirect
        else {
          res.redirect("/")
        }
      })
    }).catch(err => {
      //‼ ADD METHOD TO SHOW AND VISUALISE AN ERROR TO AN USER
      if (err.response.status == 401) return res.status(500).send({message: "Something went wrong on our side. Or you changed the scopes from the Discord Login Page URI... Dont do that"})
      else console.log(err.response.status, err.response.data)
    })
})


module.exports = app;