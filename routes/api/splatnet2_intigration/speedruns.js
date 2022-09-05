const MEMBER = require("../../../models/MEMBER");
const RUN = require("../../../models/SPLOON2-SP-RUNS");
var sanitize = require("mongo-sanitize");
const { nanoid } = require("nanoid");
const fs = require("fs");

const express = require("express");
const { axios, baseUrl } = require("../splatnet2_intigration/splatnet_2_api");

const route = express.Router();

function sortruns(rung) {
  if (!rung.runs) return rung;
  rung.runs.sort((a, b) => {
    if (a.time === null && b.time === null) {
      return 0;
    }
    if (a.time === null) {
      return -1;
    }
    if (b.time === null) {
      return 1;
    }
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    } else return 0;
  });

  return rung;
}

var singleplayerstages = [
  {
    id: "1",
    area: "1",
    name: "Die Oktarianer können's nicht lassen!",
  },
  {
    id: "2",
    area: "1",
    name: "Willkommen in Oktopia!",
  },
  {
    id: "3",
    area: "1",
    name: "Oktokopter im Abendrot",
  },
  {
    id: "101",
    area: "1",
    name: "Brotzeit mit Oktoback",
  },
  {
    id: "4",
    area: "2",
    name: "Oktospeier-Feier",
  },
  {
    id: "5",
    area: "2",
    name: "Surfen im Oktopark",
  },
  {
    id: "6",
    area: "2",
    name: "Invasion der Oktozepps",
  },
  {
    id: "7",
    area: "2",
    name: "Mega-Putz in der Seitengasse",
  },
  {
    id: "8",
    area: "2",
    name: "Schmonzette voller Schnalz",
  },
  {
    id: "9",
    area: "2",
    name: "Oktoling-Hinterhalt im Korallenviertel",
  },
  {
    id: "102",
    area: "2",
    name: "Oktosamurei rollt an",
  },
  {
    id: "10",
    area: "3",
    name: "Vorbei an der Oktopatrouille",
  },
  {
    id: "11",
    area: "3",
    name: "Jäger und Gejagte",
  },
  {
    id: "12",
    area: "3",
    name: "Die Hüpfburg der Oktarianer",
  },
  {
    id: "13",
    area: "3",
    name: "Drehschalter und tanzende Flächen",
  },
  {
    id: "14",
    area: "3",
    name: "Parkhaus-Parkour",
  },
  {
    id: "15",
    area: "3",
    name: "Oktoling-Hinterhalt auf der Buckelwal-Piste",
  },
  {
    id: "103",
    area: "3",
    name: "Oktopressor wieder am Drücker",
  },
  {
    id: "16",
    area: "4",
    name: "Intermezzo auf der Bowlingbahn",
  },
  {
    id: "17",
    area: "4",
    name: "In der Festung der Oktokommandanten",
  },
  {
    id: "18",
    area: "4",
    name: "Turmhoch überlegen",
  },
  {
    id: "19",
    area: "4",
    name: "Das Experimentorium",
  },
  {
    id: "20",
    area: "4",
    name: "Auf und Ab im Propellerland",
  },
  {
    id: "21",
    area: "4",
    name: "Oktoling-Hinterhalt an den Muränentürmen",
  },
  {
    id: "104",
    area: "4",
    name: "Oktoplanscher schlägt Wellen",
  },
  {
    id: "22",
    area: "5",
    name: "Pfade ins Ungewisse",
  },
  {
    id: "23",
    area: "5",
    name: "Reise durch die Oktogalaxie",
  },
  {
    id: "24",
    area: "5",
    name: "Kreuz und quer über dem Meer",
  },
  {
    id: "25",
    area: "5",
    name: "Verschiebung gen Wahnsinn",
  },
  {
    id: "26",
    area: "5",
    name: "Unruhige Kugel am Strand",
  },
  {
    id: "27",
    area: "5",
    name: "Oktoling-Hinterhalt in der Molluskelbude",
  },
  {
    id: "105",
    area: "5",
    name: "Bomb Rush Blush der Herzen",
  },
];

//send stageimages
route.get("/stagepic/:levelid", async (req, res) => {
  var level = parseInt(req.params.levelid.replace(".png"));
  if (isNaN(level)) return res.status(400);
  if (level > 105 || level < 1) return res.status(400);

  var file = await fs.readFileSync(__dirname + `\\level_icons\\${level}.png`);

  var img = Buffer.from(file.buffer, "base64");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", img.length);
  res.send(img);
});

//admin route that creates a new run in database and returns it randomizes values IT ALSO CLOSES ALL OTHER OPEN RUNS
route.post("/newrun", async (req, res) => {
  if (req.user.type < 50) return res.status(403).json({ error: true, message: "You are not allowed to do this." });
  //set all other active runs to false
  var runs = await RUN.find({ isopen: true });
  runs.forEach(async (run) => {
    //set winner
    var winner = [];
    var sorted_runs = sortruns(run).runs;
    sorted_runs.filter((x) => x.time === null);
    sorted_runs.forEach((runresult) => {
      if (runresult.time === sorted_runs[0].time) {
        winner.push(runresult.user);
      }
    });

    await RUN.findOneAndUpdate({ id: run.id }, { isopen: false, winner: winner });
  });

  //create new run with random choosen stage
  var stage = singleplayerstages[Math.floor(Math.random() * singleplayerstages.length)];
  await new RUN({ stage_id: stage.id, id: nanoid(10), area: stage.area }).save().then((doc) => res.json(doc));
});

//admin route that adds member to the latest run
route.post("/np", async (req, res) => {
  //check if user has a his nso account linked
  var member = await MEMBER.findOne({ id: sanitize(req.user.id) });

  if (!member.nintendo_account.iksm_token) return res.status(400).json({ error: true, message: "Member has no Nintendo Account linked" });

  //fetch latest run
  var run = await RUN.findOne({ isopen: true });

  //check if user already participated
  if (run.participants.find((x) => x === req.user.id)) return res.status(400).json({ error: true, message: "Member is already participating in this run" });

  run.participants.push(req.user.id);

  run.runs.push({
    user: req.user.id,
    time: null,
    weapon: null,
  });

  await run.save().then((doc) => {
    res.json(doc);
  });
});

//route that lists all runs
route.get("/", async (req, res) => {
  //fetch all runs
  var runs = await RUN.find();

  res.json(
    runs.map((x) => ({
      id: x.id,
      isopen: x.isopen,
      stage_id: x.stage_id,
      winner: x.winner,
    }))
  );
});

// returns all Splatoon 2 Singeplayer Level that has a Run, and its best run
route.get("/stages", async (req, res) => {
  var data = [];

  var runs = await RUN.find();
  runs.forEach((run) => {
    if (run.winner.length === 0) return;
    run = sortruns(run);

    if (data.find((x) => x.stage_id === run.stage_id)) {
      var compareddata = data.find((x) => x.stage_id === run.stage_id);
      if (compareddata.time > run.runs[0].time) return; //there is already a run with better results
      data[data.indexOf(compareddata)] = { stage_id: run.stage_id, area: run.area, time: run.runs[0].time, winner: winner, weapon: run.runs[0].weapon };
    } else {
      if (run.winner.length === 0) return;
      //add stage to data
      data.push({ stage_id: run.stage_id, area: run.area, time: run.runs[0].time, winner: run.winner, weapon: run.runs[0].weapon });
    }
  });

  data.sort((a, b) => {
    return parseInt(a.stage_id) - parseInt(b.stage_id);
  });

  res.send(data);
});

//retuns all users that participated in any run and show huch often they participated and won an run
route.get("/users", async (req, res) => {
  var runs = await RUN.find();

  var datawinner = [];
  var dataparticipants = [];

  runs.forEach((run) => {
    run.winner.forEach((w) => {
      if (datawinner.find((x) => x.user === w)) {
        datawinner[datawinner.indexOf(datawinner.find((x) => x.user === w))] = {
          user: w,
          won: datawinner[datawinner.indexOf(datawinner.find((x) => x.user === w))].won + 1,
        };
      } else {
        datawinner.push({ user: w, won: 1 });
      }
    });

    run.runs.forEach((r) => {
      if (dataparticipants.find((x) => x.user === r.user)) {
        dataparticipants[dataparticipants.indexOf(dataparticipants.find((x) => x.user === r.user))] = {
          user: r.user,
          participated: dataparticipants[dataparticipants.indexOf(dataparticipants.find((x) => x.user === r.user))].participated + 1,
        };
      } else {
        dataparticipants.push({ user: r.user, participated: 1 });
      }
    });
  });
  res.json({ winner: datawinner, participants: dataparticipants });
});

// retuns all Levels of a User and their best run time
route.get("/users/:user", async (req, res) => {
  var runs = (await RUN.find()).filter((x) => x.participants.includes(req.params.user));
  var data = [];

  runs.forEach((run) => {
    var playerrun = run.runs.find((x) => x.user === req.params.user);
    if (!playerrun) return;

    if (data.find((x) => x.stage_id === run.stage_id) && data.find((x) => x.stage_id === run.stage_id).time < x.time) {
      data[data.indexOf(data.find((x) => x.stage_id === run.stage_id))].time = run.time;
    } else {
      data.push({ stage_id: run.stage_id, area: run.area, time: playerrun.time, weapon: playerrun.weapon });
    }
  });

  res.json(
    data.sort((a, b) => {
      return parseInt(a.stage_id) - parseInt(b.stage_id);
    })
  );
});

var lastfetch = new Date();
lastfetch.setHours(lastfetch.getHours() - 1);

//returns a single run
route.get("/:runid", async (req, res) => {
  if (req.params.runid === "@latest") {
    //fetch open run
    var run = await RUN.findOne({ isopen: true });

    //check if last fetch is older then 5 minutes
    var Datenow = new Date();
    Datenow.setMinutes(Datenow.getMinutes() - 5);

    if (lastfetch < Datenow) {
      run.runs = [];

      var promised = [];

      //fetch data of every participant from splatnet
      run.participants.forEach(async (p) => {
        promised.push(
          new Promise(async (resolve, reject) => {
            //fetch member
            var member = await MEMBER.findOne({ id: p });
            if (!member || !member.nintendo_account.iksm_token) {
              resolve();
              return;
            }

            await axios
              .get(baseUrl + "/records/hero", {
                user: p,
              })
              .then((splatnetres) => {
                if (splatnetres.error) throw splatnetres.error;
                if (!splatnetres.data && !splatnetres.data.stage_infos) return;
                //filter for runtage
                var stagedata = splatnetres.data.stage_infos.find((x) => x.stage.id === run.stage_id);
                if (!stagedata) return;

                stagedata.clear_weapons = Object.values(stagedata.clear_weapons).sort((a, b) => {
                  return a.clear_time - b.clear_time;
                });

                run.runs.push({
                  user: p,
                  time: stagedata.clear_weapons[0].clear_time,
                  weapon: stagedata.clear_weapons[0].weapon_category,
                });

                resolve();
              })
              .catch((err) => {
                console.log(err);
                resolve();
                // res.status(500).json({ error: true, message: "We are not able to fetch splatnet data. Please try again later" });
              });
          })
        );
      });
      // });

      Promise.all(promised).then(async () => {
        await run.save().then(async (doc) => {
          await res.send(sortruns(doc));
        });
        lastfetch = new Date();
      });
    } else {
      res.json(sortruns(run));
    }
  } else {
    //fetch all runs
    var run = await RUN.findOne({ id: sanitize(req.params.runid) });
    if (!run) return res.status(404).json({ error: true, message: "Not able to find run with this id" });

    res.json(sortruns(run));
  }
});

module.exports = route;
