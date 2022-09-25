const MEMBER = require("../../../models/MEMBER");

const express = require("express");
const { axios, baseUrl } = require("../splatnet3_intigration/splatnet_3_api");

const route = express.Router();

//returns splatfest data
route.get("/recentbattles", async (req, res) => {
  var reqw = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "7d8b560e31617e981cf7c8aa1ca13a00",
        },
      },
    },
    { headers: { user: req.user.id } }
  );
  res.send(reqw.data.data.latestBattleHistories);
});

route.get("/recentbattles/:battleid", async (req, res) => {
  var reqw = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "cd82f2ade8aca7687947c5f3210805a6",
        },
      },
      variables: {
        vsResultId: req.params.battleid,
      },
    },
    { headers: { user: req.user.id } }
  );
  res.send(reqw.data);
});

module.exports = route;
