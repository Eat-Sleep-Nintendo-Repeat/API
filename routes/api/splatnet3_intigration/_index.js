const express = require("express");

const routes = express.Router();

routes.use("/alterna/runs", require("./speedruns"));

routes.use("/splatfests", require("./splatfests"));

routes.use("/player", require("./player"));

routes.use("/dev", require("./save data"));

module.exports = routes;
