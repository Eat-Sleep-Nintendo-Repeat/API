const express = require("express");
const MEMBER = require("../../../models/WARNS")

const api_route = express.Router();

//responses with all warns or filters warns if query is given
api_route.get("/", async (req, res) => {
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

module.exports = api_route;
