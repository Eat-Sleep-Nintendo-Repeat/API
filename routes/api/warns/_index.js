const express = require("express");

const routes = express.Router();

routes.use("/", require("./warns"))

module.exports = routes;
