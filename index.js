const express = require("express");
var cookieParser = require("cookie-parser");
var jsw = require("jsonwebtoken")
var config = require("./config.json")

const app = express();
app.use(cookieParser());

//database
require("./database")

//// routes
// auth route
const auth = require("./routes/auth")
app.use("/auth", auth)

//session_token checker
app.use("/", async (req, res, next) => {
  //check if Header is passed
  if (!req.header("Authorization")) return res.status(401).send({"message": "unauthorized - missing access_token"})

  switch (req.header("Authorization").split(" ")[0]) {
    case "Access":
      //Default access_token = user

      //veryfing token
      var token = await jsw.verify(req.header("Authorization").split(" ")[1], config.key, (err, token) => {
        if (err) return res.status(401).send({"error": `unauthorized - access_token is invalid`})

        //add token to req objekt
        req.user = token

        //forward request
        next();
      })
      break;
  
    default:
      return res.status(401).send({"message": `unauthorized - unknown token type >${req.header("Authorization").split(" ")[0]}<`})
      break;
  }
})

app.get("/api/test", (req, res) => {
  res.send(req.user)
})

app.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
