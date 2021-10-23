const express = require("express");

const routes = express.Router();

//authenticate routes
routes.use("/:userid", (req, res, next) => {
    if (req.user.type == 0) return res.status(403).send({message: "You dont have the right permissions to use this route"})
    
    if (req.user.type >= 50 || req.params.userid == req.user.id) return next();
    return res.status(403).send({message: `Missing Permissions - You dont have enough permissions to use this route`})
})

routes.use("/", require("./state"))

routes.use("/", require("./create_declaration"))
//contains email.js file

routes.use("/", require("./delete_declaration"))

module.exports = routes;
