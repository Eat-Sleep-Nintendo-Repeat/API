const express = require("express");

const routes = express.Router();

routes.use("/users", require("./api/user/_index"))

routes.use("/coins", require("./api/coins/_index"))

routes.use("/usemyvoice", require("./api/usemyvoice/_index"))

routes.use("/warns",  require("./api/warns/_index"))

routes.use("/tokens",  require("./api/tokens/_index"))


module.exports = routes;
