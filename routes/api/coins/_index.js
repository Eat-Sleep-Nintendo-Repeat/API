const express = require("express");

const routes = express.Router();

//authenticate routes
routes.use("/:userid", (req, res, next) => {
    //check if auth token is from a bot user
    if (req.user.type >= 50 || req.params.userid == req.user.id) return next();
    return res.status(403).send({message: `Missing Permissions - You dont have enough permissions to use this route`})
})

routes.use("/", require("./state"))

routes.use("/", require("./transfer"))

routes.use("/", require("./daily"))





module.exports = routes;
