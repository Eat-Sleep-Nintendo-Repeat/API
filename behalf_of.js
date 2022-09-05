const MEMBER = require("./models/MEMBER");
var sanitize = require("mongo-sanitize");

const express = require("express");

const in_behalf_of = express.Router();

in_behalf_of.use("/", async (req, res, next) => {
  if (req.headers.in_behalf_of) {
    if (req.user.type >= 50) {
      //replace req.user with userinformation of behalf_of user
      var memb = await MEMBER.findOne({ id: sanitize(req.headers.in_behalf_of) });
      if (!memb) return res.status(403).json({ error: true, message: "not able to find user with in_behalf_of id" });

      req.user = {
        id: memb.id,
        username: memb.informations.name,
        discriminator: memb.informations.discriminator,
        avatar: memb.informations.avatar,
        type: memb.type,
        serverbooster: memb.serverbooster,
        isuser: false,
      };

      next();
    } else {
      return res.status(403).json({ error: true, message: "in_behalf_of headers can only be used by users with type of 50 or higher" });
    }
  } else {
    next();
  }
});

module.exports = in_behalf_of;
