const express = require("express");
const DiscordOauth2 = require("discord-oauth2");
const MEMBER = require("../models/MEMBER")
const axios = require("axios").default
const nanoid = require("nanoid").nanoid;
var jwt = require('jsonwebtoken');

const config = require("../config.json")

const app = express.Router();

const tls = false

//redirect to Discord
app.get("/discord", (req, res) => {
res.redirect(
    `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${
      config.discord_api.client_id
    }&scope=${"identify email"}&redirect_uri=${`${tls == true ? "https" : "http"}://${req.headers.host}${req.header.host == "eat-sleep-nintendo-repeat.eu" ? "/api/v1" : ""}/auth/discord/callback`}`
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
        redirectUri: `${tls == true ? "https" : "http"}://${req.headers.host}/auth/discord/callback`
    }).catch(e => {
        res.status(500).send("[DISCORD CALLBACK] Ein Fehler ist während des Logins aufgetreten. Falls dies öfters passiert, schicke bitte einen Screenshot von diesen Text an einen verantwortlichen von Eat, Sleep, Nintendo, Repeat\n\n::: " + JSON.stringify(e.response))
      })

    if (!tokens) return;
    var access_token = tokens.access_token,
        refresh_token = tokens.refresh_token,
        scopes = tokens.scope.split(" "),
        redirect = `${tls == true ? "https" : "http"}://${req.headers.host}/auth/discord/callback`,
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
        "oauth.redirect": `${tls == true ? "https" : "http"}://${req.headers.host}/auth/discord/callback`,
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
          res.redirect("/ui")
        }
      })
    }).catch(err => {
      //‼ ADD METHOD TO SHOW AND VISUALISE AN ERROR TO AN USER
      if (err.response.status == 401) return res.status(500).send({message: "Something went wrong on our side. Or you changed the scopes from the Discord Login Page URI... Dont do that"})
      else console.log(err.response.status, err.response.data)
    })
})

//exchange a refresh_token to an json_web_token
app.use("/token-exchange", async (req, res) => {
  //check refresh_token
  var refresh_token = req.cookies.refresh_token
  if (!refresh_token) return res.status(401).send({message: "access_token generation failed. Your refresh_token is missing"})

  var memberdb = await MEMBER.findOne({"oauth.cookies.refresh_token": refresh_token})
  if (!memberdb) return res.status(401).send({message: "access_token generation failed. Your refresh_token is invalid"})

  //check if member is banned from the usage of the api
  if (memberdb.oauth.blocking_state.is_blocked) return res.status(403).send({message: `You are being blocked from accessing our API. If you think that your API bann is unreasoned or unfair, contact a representative of Eat, Sleep, Nintendo, Repeat`})
  
  //check if member has working discord access_token
  if (!memberdb.oauth.access_token) return res.status(401).send({message: `It seems like that you dont have an working discord access_token. Please redo the discord login process`})


  //function to refresh discord access_token
  async function refresh_discord_tokens(db, reason) {

    var oauth_client = new DiscordOauth2({
      clientId: config.discord_api.client_id,
      clientSecret: config.discord_api.client_secret,
      redirectUri: db.oauth.redirect})

    var tokens = await oauth_client.tokenRequest({
      refreshToken: db.oauth.refresh_token,
      grantType: "refresh_token",
      scope: db.oauth.scopes
    }).catch(async e => {
      res.status(400).send({message: "Error occurred while refreshing Discord Tokens. Please generate new refresh_token"})

      //set access_token to null in database
      await MEMBER.findOneAndUpdate({id: db.id}, {
        "oauth.access_token": null,
        "oauth.refresh_token": null,
        "oauth.expire_date": null
      })
    })

    //save new tokens to db
    if (!tokens) return;
    var access_token = tokens.access_token,
        refresh_token = tokens.refresh_token,
        expire_date = new Date();
        expire_date.setSeconds(expire_date.getSeconds() + (tokens.expires_in / 100 * 95))

        memberdb.oauth.access_token = access_token

        await MEMBER.findOneAndUpdate({id: db.id}, {
          "oauth.access_token": access_token,
          "oauth.refresh_token": refresh_token,
          "oauth.expire_date": expire_date
        })
  }

  //check if discord_access_token is natural expired
  if (memberdb.oauth.expire_date < new Date()) await refresh_discord_tokens(memberdb, "naturaly expired");
  
  //try to fetch user data from discord
  fetchuserdatafromdiscord(false)
  async function fetchuserdatafromdiscord(retry) {
  await axios.get("https://discord.com/api/users/@me", {headers: {"Authorization": `Bearer ${memberdb.oauth.access_token}`}}).then(async response => {
    //save data to database
    await MEMBER.findOneAndUpdate({"id": response.data.id}, {
      "informations.name": response.data.username,
      "informations.discriminator": response.data.discriminator,
      "informations.avatar": response.data.avatar
    })
    
    //generate JSW and respond with token
    jwt.sign({id: response.data.id, username: response.data.username, discriminator: response.data.discriminator, avatar: response.data.avatar, type: memberdb.type, serverbooster: memberdb.serverbooster}, config.key, {expiresIn: "15m"}, function(err, token) {
      if (err) return res.status(500).send({message: "Something went wrong on our side while we tried to generate your JSW Token. Please try again later"})
      res.send({token: token})
    });

  }).catch(async (error) => {
    //something went wrong while fetching user data
    if (error.response) {
      //Discord respondet with an errorcode that is not in range of 2xx
      if (error.response.status == 401 && retry == false){ 
        await refresh_discord_tokens(memberdb, "cant access user data")
        fetchuserdatafromdiscord(true)
    }
      else return res.status(500).send({message: "Something went wrong on our side. Please try again later"})
    }
    else if (error.request) {
      res.status(500).send({message: "something went wrong on our side. Please try again later"})
    }

  })

}



})


module.exports = app;