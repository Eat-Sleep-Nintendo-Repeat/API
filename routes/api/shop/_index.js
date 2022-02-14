const express = require("express");

const routes = express.Router();

routes.use("/", require("./purchase"))

routes.use("/", require("./deactivate"))

routes.use("/", require("./activate"))

routes.use("/", require("./purchases"))

routes.use("/", require("./shop"))





module.exports = routes;
