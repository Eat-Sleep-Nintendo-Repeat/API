const express = require("express");

const routes = express.Router();

routes.use("/", require("./images"))

module.exports = routes;
