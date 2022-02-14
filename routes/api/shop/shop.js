const SHOP_ARTIKEL = require("../../../models/SHOP-ARTIKEL")

const express = require("express");

const route = express.Router();

//fetch shop
route.get("/", async (req, res) => {
    //fetch database
    let db = await SHOP_ARTIKEL.find({canbebuyed: true})

    var response = []

    db.forEach(artikel => {
        //add categories of item to response object
        artikel.categories.forEach(cat => {
            if (!response.find(x => x.categorie === cat)) {
                //add categorie type if response dont contains it
                response.push({
                    categorie: cat,
                    items: []
                })
            }
        })

        //add item to all response > categories
        artikel.categories.forEach(cat => {
            response.find(x => x.categorie === cat).items.push({name: artikel.name, description: artikel.description, id: artikel.order_id, amount: artikel.amount})
        })

    })
    
    res.json(response)
})
module.exports = route;