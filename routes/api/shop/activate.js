const MEMBER = require("../../../models/MEMBER");
const SHOP_ARTIKEL = require("../../../models/SHOP-ARTIKEL");
var sanitizeDB = require('mongo-sanitize');
const io = require("../../socket/socketio")
const {nanoid} = require("nanoid")



const express = require("express");

const route = express.Router();

route.post("/", (req, res, next) => {
    if (!req.user.isuser) return res.status(400).send({message: "This API Route can only be used via the officiall UI"})
    if (req.user.type == 0) return res.status(403).send({message: "You dont have the right permissions to use this route"})
    next();
})

//Buy a product
route.post("/activate", async (req, res) => {
    //fetch databases
    var memberdb = await MEMBER.findOne({id: sanitizeDB(req.user.id)})
    if (!memberdb) return res.status(404).send({message: `If you ever get to see this error then something went horribly wrong or you are messing with the api. Anyway. Your UserID is not in the Database`})

    var artikeldb  = await SHOP_ARTIKEL.findOne({order_id: sanitizeDB(req.body.id)})
    if (!artikeldb) return res.status(404).json({message: `Not Found - We were not able to find a Shop_Artikel with id >${req.body.id}<`})

    //check if user owns this product
    if (!memberdb.currencys.gems.purchases.find(x => x.id === artikeldb.order_id)){
        return res.status(400).json({error: `${artikeldb.name} is not in your inventory`})
    }

    //check if product is already activated
    if (memberdb.currencys.gems.purchases.find(x => x.id === artikeldb.order_id).active == true){
        return res.status(400).json({error: `${artikeldb.name} is already activated`})
    }

    var oid = nanoid()
        io.emitter.on(`shop_confirmation_${oid}`, async (data) => {
            res.status(200).send({})


            let nMemberDB = await MEMBER.findOne({id: sanitizeDB(memberdb.id)})
            for (var item in nMemberDB.currencys.gems.purchases) {
                if (nMemberDB.currencys.gems.purchases[item].id == artikeldb.order_id) {
                    nMemberDB.currencys.gems.purchases[item].active = true;
                  break;
                }
              }

            //update database 
            await MEMBER.findOneAndUpdate({id: sanitizeDB(memberdb.id)}, {"currencys.gems.purchases": nMemberDB.currencys.gems.purchases})
        })

    //sends purchase message to bot
    io.to("system").emit("shop_activate", {oid, user: memberdb.id, item: artikeldb.order_id})
})

module.exports = route;