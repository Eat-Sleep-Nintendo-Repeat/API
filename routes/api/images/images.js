const express = require("express");
const IMAGESTORE = require("../../../models/IMAGESTORE")
var sanitize = require('mongo-sanitize');
const route = express.Router();

//fetch image buffer from database and send it to client
route.get("/:id", async (req, res) => {
    try {
        var image = await IMAGESTORE.findOne(sanitize({ id: req.params.id }));
        if(image) {
            var img = Buffer.from(image.image, 'base64');
            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Length", img.length);
            res.send(img);
        } else {
            res.status(404).send({error: "Image not found"})
        }
    } catch(e) {
        res.status(500).send(e)
        console.log(e)
    }
})

module.exports = route;