const express = require("express");

const routes = express.Router();

routes.use("/uptime", require("./api/uptime/_index"));

routes.use("/imagestore", require("./api/images/_index"));

//authentication
routes.use("/", require("../authentication"));

routes.use("/", require("../behalf_of"));

routes.use("/users", require("./api/user/_index"));

routes.use("/gems", require("./api/gems/_index"));

routes.use("/usemyvoice", require("./api/usemyvoice/_index"));

routes.use("/warns", require("./api/warns/_index"));

routes.use("/tokens", require("./api/tokens/_index"));

routes.use("/settings", require("./api/usersettings/_index"));

routes.use("/shop", require("./api/shop/_index"));

routes.use("/nintendo", require("./api/nintendo_intigration/_index"));

routes.use("/splatnet2", require("./api/splatnet2_intigration/_index"));

module.exports = routes;
