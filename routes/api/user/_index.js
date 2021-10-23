const express = require("express");

const routes = express.Router();

routes.use("/@me", require("./@me"))

routes.use("/toplist", require("./toplist"))

routes.use("/", require("./usersearch"))

routes.use("/", require("./user"))

module.exports = routes;
