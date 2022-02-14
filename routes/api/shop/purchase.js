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
route.post("/", async (req, res) => {
    //fetch databases
    var memberdb = await MEMBER.findOne({id: sanitizeDB(req.user.id)})
    if (!memberdb) return res.status(404).send({message: `If you ever get to see this error then something went horribly wrong or you are messing with the api. Anyway. Your UserID is not in the Database`})

    var artikeldb  = await SHOP_ARTIKEL.findOne({order_id: sanitizeDB(req.body.id), canbebuyed: true})
    if (!artikeldb) return res.status(404).json({message: `Not Found - We were not able to find a Shop_Artikel with id >${req.body.id}<`})

    //checks if this purchase is a gift
    let is_gift = false
    let gifted_member_db = null
    if (req.body.gift) {
        gifted_member_db = await MEMBER.findOne({id: sanitizeDB(req.body.gift)})
        if (!gifted_member_db) {
            return res.status(400).json({message: `Not Found - We were not able to find the Member >${req.body.id}< you want to gift to`})
        } else {
            is_gift = true
        }
    }

    var receiver = is_gift ? gifted_member_db : memberdb;

    //checks if reciver already has this item
    if (receiver.currencys.gems.purchases.find(x => x.id === artikeldb.order_id) && artikeldb.canOnlyBuyedOnce){
        return res.status(404).json({message: `${is_gift ? receiver.informations.name : "you"} already own${is_gift ? "s" : ""} this item`})
    }

    //checks if the member has enough gems
    if (memberdb.currencys.gems.amount >= artikeldb.amount == false) {
        return res.status(404).json({message: `You currently dont own enough gems for this purchase`})
    }

    //ads the item to the database of the member --> removes gems
    if (is_gift) {
        receiver.currencys.gems.purchases.push({id: artikeldb.order_id, date: new Date(), active: false})
        memberdb.currencys.gems.amount -= artikeldb.amount
        memberdb.currencys.gems.log.push({ description: `Geschenk an ${receiver.informations.name}: ${artikeldb.name}`, value: parseInt("-" + artikeldb.amount), date: new Date() });

        await MEMBER.findOneAndUpdate({id: memberdb.id}, {"currencys.gems.amount": memberdb.currencys.gems.amount, "currencys.gems.log": memberdb.currencys.gems.log})
        await MEMBER.findOneAndUpdate({id: receiver.id}, {"currencys.gems.purchases": receiver.currencys.gems.purchases})
    } else {
        memberdb.currencys.gems.purchases.push({id: artikeldb.order_id, date: new Date(), active: false})
        memberdb.currencys.gems.amount -= artikeldb.amount
        memberdb.currencys.gems.log.push({ description: `Shop: ${artikeldb.name}`, value: parseInt("-" + artikeldb.amount), date: new Date() });


        await MEMBER.findOneAndUpdate({id: memberdb.id}, {"currencys.gems.amount": memberdb.currencys.gems.amount, "currencys.gems.purchases": memberdb.currencys.gems.purchases, "currencys.gems.log": memberdb.currencys.gems.log})
    }

    //creates listener recall
    var oid = nanoid()
    if (!is_gift) {
        io.emitter.on(`shop_confirmation_${oid}`, async (data) => {

            let nMemberDB = await MEMBER.findOne({id: sanitizeDB(receiver.id)})
            for (var item in nMemberDB.currencys.gems.purchases) {
                if (nMemberDB.currencys.gems.purchases[item].id == artikeldb.order_id) {
                    nMemberDB.currencys.gems.purchases[item].active = true;
                  break;
                }
              }

            //update database 
            await MEMBER.findOneAndUpdate({id: sanitizeDB(receiver.id)}, {"currencys.gems.purchases": nMemberDB.currencys.gems.purchases})
        })
    }

    //sends purchase message to bot
    io.to("system").emit("shop_purchase", {oid, user: receiver.id, is_gift, giving_user: memberdb.id, item: artikeldb.order_id})
    

    //sends confirmation message
    res.status(200).send({})
})

module.exports = route;