const express = require("express");

const routes = express.Router();

routes.use("/users", require("./api/user/_index"))

routes.use("/gems", require("./api/gems/_index"))

routes.use("/usemyvoice", require("./api/usemyvoice/_index"))

routes.use("/warns",  require("./api/warns/_index"))

routes.use("/tokens",  require("./api/tokens/_index"))

routes.use("/settings",  require("./api/usersettings/_index"))

routes.use("/uptime",  require("./api/uptime/_index"))




module.exports = routes;
