const express = require("express");

const routes = express.Router();

routes.use("/", require("./uptime"))

module.exports = routes;
