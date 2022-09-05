const express = require("express");

const routes = express.Router();

routes.use("/singleplayer/runs", require("./speedruns"));

module.exports = routes;
