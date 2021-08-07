const express = require("express");
var cookieParser = require("cookie-parser");
var jsw = require("jsonwebtoken")
var config = require("./config.json")
var cors = require('cors')


const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "*",
  optionsSuccessStatus: 200,
}))
app.options('*', cors())

//Cross-Origin Resource Sharing
app.use("/", (req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "*")
  // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
  // res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token")

  console.log(req.originalUrl)
  next();
})

//database
require("./database")

//// routes
// auth route
const auth = require("./routes/auth")
app.use("/auth", auth)

app.get("/test", (req, res) => {
  return res.send({message: "test passed"})
})

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

//users route
const users = require("./routes/api/user/users")
app.use("/users", users)

app.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
