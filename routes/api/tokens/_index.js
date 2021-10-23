const express = require("express");
const MEMBER = require("../../../models/MEMBER")

const routes = express.Router();

routes.use("/", (req, res, next) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})
    if (req.user.type == 0) return res.status(403).send({message: "You dont have the right permissions to use this route"})
    next();
})

routes.use("/", require("./list"))

routes.use("/", require("./create"))

routes.use("/", require("./delete"))

routes.use("/", require("./edit"))


module.exports = routes;
