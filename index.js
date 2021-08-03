const express = require("express");
var cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

//database
require("./database")

// auth route
const auth = require("./routes/auth")
app.use("/auth", auth)

//session_token checker


app.listen(7869, () => {
  console.log("API is active and listenig on 7869");
});
