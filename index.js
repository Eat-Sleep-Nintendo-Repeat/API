const express = require("express");
var cookieParser = require("cookie-parser");
var jsw = require("jsonwebtoken")
var config = require("./config.json")
var bodyParser = require('body-parser')
const MEMBER = require("./models/MEMBER")
var http = require('http');


const app = express();
app.use(cookieParser());
app.use(bodyParser.json())

var server = http.createServer(app);
var io = require('socket.io')(server, {
  cors: {origin: "*"},
  path: "/api/socketio"
})
exports.io = io

//CORS Preflight request handler
app.options('*', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "authentication")
  res.setHeader("Access-Control-DEV-MESSAGE", "only * for preflight")
  res.send();
})

// CORS null origin handler
app.get('*', (req, res, next) => {
  if (req.headers.origin == "null") {
  res.setHeader("Access-Control-Allow-Origin", "null")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "authentication")
  next();
}
else {
  next();
}})

//database
require("./database")

//authentication
app.use("/", require("./authentication"))

// routes
app.use("/api", require("./routes/index"))

//socket.io
require("./routes/socket/socketio")

server.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
