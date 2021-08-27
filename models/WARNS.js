const mongoose = require("mongoose")

const Schema = mongoose.Schema({
    "executor": String,
    "victim": Array,

    "type": Number,
    "date": {type: Date, default: new Date()},
    "deleted_in": Date,

    "reason": String,
    "proof": Object
})

module.exports = mongoose.model("warn", Schema)