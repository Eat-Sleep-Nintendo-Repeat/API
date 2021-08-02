const express = require("express");
var cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

//auth route
// const discord_oauth = require("./routes/discord-oauth")
// app.use("/discord", discord_oauth)

//session_token checker

app.get("/test", async (req, res) => {
  res.send("HEY");
});

app.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
