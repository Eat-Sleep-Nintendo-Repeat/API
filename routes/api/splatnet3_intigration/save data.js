const log = require("../../../models/returnstore");
var sanitize = require("mongo-sanitize");
const { nanoid } = require("nanoid");

const express = require("express");
const { axios, baseUrl } = require("../splatnet3_intigration/splatnet_3_api");

const route = express.Router();

route.post("/", async (req, res) => {
  var useCurrentFestQuery = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "c0429fd738d829445e994d3370999764",
        },
      },
    },
    { headers: { user: "330380702505762817" } }
  );

  var LatestBattleHistoriesQuery = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "7d8b560e31617e981cf7c8aa1ca13a00",
        },
      },
    },
    { headers: { user: "330380702505762817" } }
  );

  var DetailFestRecordDetailQuery = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "2d661988c055d843b3be290f04fb0db9",
        },
      },
      variables: {
        festId: "RmVzdC1FVTpKVUVBLTAwMDAx",
      },
    },
    { headers: { user: "330380702505762817" } }
  );

  await new log({
    logname: req.body.name,
    currentFestQuery: useCurrentFestQuery.data,
    LatestBattleHistoriesQuery: LatestBattleHistoriesQuery.data,
    DetailFestRecordDetailQuery: DetailFestRecordDetailQuery.data,
  })
    .save()
    .then(() => {
      res.status(200).send();
    });
});

module.exports = route;
