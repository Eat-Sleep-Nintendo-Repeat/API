const express = require("express");

const routes = express.Router();

routes.use("/alterna/runs", require("./speedruns"));

module.exports = routes;
