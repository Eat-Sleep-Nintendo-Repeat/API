const express = require("express");

const routes = express.Router();

routes.use("/", require("./linkaccount").route);

module.exports = routes;
