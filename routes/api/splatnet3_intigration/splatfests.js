const MEMBER = require("../../../models/MEMBER");
var sanitize = require("mongo-sanitize");
const { nanoid } = require("nanoid");

const express = require("express");
const { axios, baseUrl } = require("../splatnet3_intigration/splatnet_3_api");
const { isErrored } = require("nodemailer/lib/xoauth2");

const route = express.Router();

//returns splatfest data
route.get("/", async (req, res) => {
  var reqw = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "44c76790b68ca0f3da87f2a3452de986",
        },
      },
    },
    { headers: { user: "330380702505762817" } }
  );

  var retundata = [];

  reqw.data.data.festRecords.nodes.forEach((x) => {
    reqw.data.data.festRecords.nodes[reqw.data.data.festRecords.nodes.indexOf(x)].myTeam = null;
    retundata.push({
      id: x.id,
      state: x.state,
      startTime: x.startTime,
      endTime: x.endTime,
      title: x.title,
      image: x.image.url,
      teams: x.teams,
    });
  });
  res.send(retundata);
});

//returns data of a specific
route.get("/:festid", async (req, res) => {
  var reqw = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "2d661988c055d843b3be290f04fb0db9",
        },
      },
      variables: {
        festId: req.params.festid,
      },
    },
    { headers: { user: "330380702505762817" } }
  );

  //check vote of every member if type is over 50

  var promised = [];
  if (req.user.type >= 50) {
    reqw.data.data.fest.teams[0].dcvotes = [];
    reqw.data.data.fest.teams[1].dcvotes = [];
    reqw.data.data.fest.teams[2].dcvotes = [];
    var memberdb = await MEMBER.find();

    //filter all member that are on server and have linked nintendo account
    memberdb = memberdb.filter((x) => x.nintendo_account.session_token != null && x.delete_in === null);

    //get splatfestteam of every member

    memberdb.forEach(async (m) => {
      promised.push(
        new Promise(async (resolve, reject) => {
          var festfetch = await axios.post(
            baseUrl,
            {
              extensions: {
                persistedQuery: {
                  version: 1,
                  sha256Hash: "2d661988c055d843b3be290f04fb0db9",
                },
              },
              variables: {
                festId: req.params.festid,
              },
            },
            { headers: { user: m.id } }
          );
          if (festfetch.data && festfetch.data.data.fest.myTeam.id) {
            reqw.data.data.fest.teams.find((x) => x.id === festfetch.data.data.fest.myTeam.id).dcvotes.push(m.id);
          }
          resolve();
        })
      );
    });
  }

  reqw.data.data.fest.playerResult = undefined;
  reqw.data.data.fest.myTeam = undefined;
  Promise.all(promised)
    .then(() => {
      res.send(reqw.data.data.fest);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, message: "We were not able to fetch splatfest votes" });
    });
});

module.exports = route;
