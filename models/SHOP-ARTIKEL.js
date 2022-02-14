const mongoose = require("mongoose")

const Schema = mongoose.Schema({
	name: String,
	description: String,
    amount: Number,
	order_id: Number,
    categories: Array,


	canOnlyBuyedOnce: Boolean,
    canbebuyed: Boolean,

    state_changeable: Boolean,


    activate_code: String,
    deactivate_code: String
})

module.exports = mongoose.model("Shop-Artikel", Schema)