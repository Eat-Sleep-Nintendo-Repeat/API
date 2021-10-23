const express = require("express");

const route = express.Router();

//responses with simple user info about requesting user itself
route.get("/", (req, res) => {
    res.send(req.user)
})

module.exports = route;