var sanitizeDB = require('mongo-sanitize');
const MEMBER = require("../../../models/MEMBER")
const SHOP_ARTIKEL = require("../../../models/SHOP-ARTIKEL")



const express = require("express");

const route = express.Router();

//Transfer gems to another user
route.get("/purchased", async (req, res) => {
    //fetch databases
    var memberdb = await MEMBER.findOne({id: sanitizeDB(req.user.id)})
    let artikeldb = await SHOP_ARTIKEL.find()

    let response = []


    memberdb.currencys.gems.purchases.forEach(x => {
        //get artikel
        const artikel = artikeldb.find(y => y.order_id === x.id)
        if (!artikel) return;

        //add missing categorie
        artikel.categories.forEach(cat => {
            if (!response.find(x => x.categorie === cat)) {
                //add categorie type if response dont contains it
                response.push({
                    categorie: cat,
                    items: []
                })
            }
        })

        artikel.categories.forEach(cat => {
            response.find(z => z.categorie === cat).items.push({name: artikel.name, description: artikel.description, id: artikel.order_id, active: x.active, date: x.date})
        })


    })

    res.json(response)

})

module.exports = route;