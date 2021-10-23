const MEMBER = require("../../../models/WARNS")

const express = require("express");

const route = express.Router();

route.get("/", async (req, res) => {
    if (!req.query.id) {
    var warnsdb = await MEMBER.find()
    res.send(warnsdb)
}
else {
    var ids = req.query.id.split(",")
    var warnsdb = await MEMBER.find({victim: ids})
    res.send(warnsdb)
}

})

module.exports = route;
