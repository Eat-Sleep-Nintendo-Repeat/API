const express = require("express");

const routes = express.Router();

routes.use("/", require("./getsettings"))

routes.use("/", require("./setsettings"))


module.exports = routes;
