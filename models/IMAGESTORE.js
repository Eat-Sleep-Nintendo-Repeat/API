const mongoose = require("mongoose")

const Schema = mongoose.Schema({
    type: String,
	filename: String,
    id: String,
    belong_to: String,
    image: Buffer,
    date: Date,
})

module.exports = mongoose.model("imagestore", Schema)