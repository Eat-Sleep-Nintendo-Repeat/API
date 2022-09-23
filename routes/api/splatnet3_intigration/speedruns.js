const MEMBER = require("../../../models/MEMBER");
const RUN = require("../../../models/SPLOON2-SP-RUNS");
var sanitize = require("mongo-sanitize");
const { nanoid } = require("nanoid");

const express = require("express");
const { axios, baseUrl } = require("../splatnet3_intigration/splatnet_3_api");

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

var altera = {
  "SGVyb1NpdGUtMQ==": {
    siteNumber: 1,
    siteName: "Future Utopia Island",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797511301709844/1.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Get to Know Alterna, Your Only Choice",
        description: "Show off your skills and reach the goal.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "Octopods at Rest Tend to FLIP OUT!",
        description: "Remain in one piece and reach the goal.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Splat You on the Flip Side",
        description: "Outwit the Octarians and reach the goal!",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Doors, Doors, Doors! And More! (Doors)",
        description: "Find all the keys and reach the goal.",
        inkColor: "#ffef1e",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "Relic Restoration",
        description: "Cover as much as you can with ink.",
        inkColor: "#2de8f7",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Zip, Splat, and Jump",
        description: "Zipcast your way to the goal!",
        inkColor: "#edbd2b",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "Become One with Your Smallfry",
        description: "Work with Smallfry to reach the goal.",
        inkColor: "#45ff26",
      },
      8: {
        stageNumber: 8,
        isBoss: false,
        stageName: "What Caused the Big Bang? YOU!",
        description: "Destroy all of the targets in one shot.",
        inkColor: "#1f0ce2",
      },
      9: {
        stageNumber: 9,
        isBoss: false,
        stageName: "The String's the Thing",
        description: "Reach the goal using the Tri-Stringer.",
        inkColor: "#e5fcf2",
      },
    },
  },
  "SGVyb1NpdGUtMg==": {
    siteNumber: 2,
    siteName: "Cozy & Safe Factory",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797510852907088/2.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Twirling, Swirling, Whirling",
        description: "Navigate rotating platforms to reach the goal.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "Absorbency and You",
        description: "Reach the goal using sponges.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Soak It to Me!",
        description: "Reach the goal using soaker blocks.",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Splitting Crosshairs",
        description: "Break the targets to reach the goal.",
        inkColor: "#F1AA41",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "Tread Heavily",
        description: "Reach the goal using the Crab Tank!",
        inkColor: "#28EE38",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Getting Lost in Three Easy Steps",
        description: "Navigate the maze to reach the goal.",
        inkColor: "#4B39F5",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "The Ink-Conservation Project",
        description: "Reach the goal without running out of ink.",
        inkColor: "#E5FDF3",
      },
      8: {
        stageNumber: 8,
        isBoss: false,
        stageName: "Switching Things Up",
        description: "Hit the splat switches to reach the goal.",
        inkColor: "#4BEDFF",
      },
      9: {
        stageNumber: 99,
        isBoss: true,
        stageName: "The Future Stares Back",
        description: "Fight your way to the exit.",
        inkColor: "#3025CB",
      },
    },
  },
  "SGVyb1NpdGUtMw==": {
    siteNumber: 3,
    siteName: "Cryogenic Hopetown",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797510097948693/3.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Climbing the Corporate Splatter",
        description: "Take down Octarians and climb to the goal.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "They Said We'd Have Flying Cars, and We Do! Kinda!",
        description: "Keep an eye on the sky, and hitch a ride to the goal.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Ink Wheels—Experience Tomorrow's Technology Today!",
        description: "Reach the goal using ink wheels.",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Try Curling! Alterna's 11th Most Popular Athleisure Activity!",
        description: "Reach the goal by using Curling Bombs.",
        inkColor: "#EA873A",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "Conveyor-Belt Tightening",
        description: "Destroy all the targets.",
        inkColor: "#22C434",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Time Trial and Errors",
        description: "Break all targets before time runs out.",
        inkColor: "#422FFF",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "Rail Pass",
        description: "Reach the goal using inkrails.",
        inkColor: "#E5FDF3",
      },
    },
  },
  "SGVyb1NpdGUtNA==": {
    siteNumber: 4,
    siteName: "Landfill Dreamland",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797509720457316/4.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Propellered to Greatness",
        description: "Reach the goal using propellervators.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "Octohoppers Don't Have a Sense of Humor (and They Hate Puns)!",
        description: "Watch for hopstacles as you head toward the goal.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Let's Put a Pin in That",
        description: "Stay in your lane and reach the goal.",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Splash the Block Party",
        description: "Reach the goal using soaker blocks.",
        inkColor: "#0DB6FF",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "Amusing a Bemused Muse",
        description: "Aim carefully and copy the template.",
        inkColor: "#E65726",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Those Aren't Birds",
        description: "Break all of the targets.",
        inkColor: "#88F644",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "Charge Now, Splat Later",
        description: "Use charged shots to reach the goal.",
        inkColor: "#192DFF",
      },
      8: {
        stageNumber: 8,
        isBoss: false,
        stageName: "Easy Ride, Tricky Targets",
        description: "Destroy the targets and reach the goal.",
        inkColor: "#EEEDB7",
      },
      9: {
        stageNumber: 9,
        isBoss: false,
        stageName: "Flying Worst Class",
        description: "Hitch rides to reach the goal.",
        inkColor: "#40BCC7",
      },
      10: {
        stageNumber: 10,
        isBoss: false,
        stageName: "Ink Fast, Hotshot",
        description: "Destroy the targets to reach the goal.",
        inkColor: "#EC9324",
      },
      11: {
        stageNumber: 11,
        isBoss: false,
        stageName: "Stamp 'Em Out",
        description: "Use the Splatana Stamper to reach the goal.",
        inkColor: "#31D815",
      },
      12: {
        stageNumber: 12,
        isBoss: false,
        stageName: "The Path to Perfect Penmanship",
        description: "Use the splat switches to reach the goal within the time limit.",
        inkColor: "#0F27F3",
      },
      99: {
        stageNumber: 99,
        isBoss: true,
        stageName: "The Pursuit of the Precious",
        description: "Fight your way to the exit.",
        inkColor: "#C8EC41",
      },
    },
  },
  "SGVyb1NpdGUtNQ==": {
    siteNumber: 5,
    siteName: "Eco-Forest Treehills",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797509301018624/5.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Trouble Round Every Corner",
        description: "Suppress enemy fire and reach the goal.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "The Upside to Enemy Backsides",
        description: "Attack enemy backs to reach the goal.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Uh-Oh! Too Many Snipers!",
        description: "Avoid enemy fire and reach the goal.",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Barriers! They've Got You Covered",
        description: "Defeat Octodiscos and reach the goal.",
        inkColor: "#ffef1e",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "A Compulsive Collector's Paradise",
        description: "Grab all Power Eggs within the time limit.",
        inkColor: "#9FF1F3",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Zipping over the Neighborhood",
        description: "Use the Zipcaster to reach the goal.",
        inkColor: "#88F644",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "One-Way Ride through Target Town",
        description: "Destroy the targets to reach the goal.",
        inkColor: "#FF6817",
      },
      8: {
        stageNumber: 8,
        isBoss: false,
        stageName: "Making Waves with Splashdowns",
        description: "Use Splashdowns to reach the goal.",
        inkColor: "#27D141",
      },
      9: {
        stageNumber: 9,
        isBoss: false,
        stageName: "Low Viz, High Risk",
        description: "Cut through the fog and find the goal!",
        inkColor: "#6B52DA",
      },
      10: {
        stageNumber: 10,
        isBoss: false,
        stageName: "Shooter on Rails",
        description: "Reach the goal using ride rails and precision shooting.",
        inkColor: "#E7FDFE",
      },
      11: {
        stageNumber: 11,
        isBoss: false,
        stageName: "Simply Zipcastic!",
        description: "Use the Zipcaster to make your way up and reach the goal.",
        inkColor: "#26CFF8",
      },
      12: {
        stageNumber: 12,
        isBoss: false,
        stageName: "You'll Go Far If You Shoot Far",
        description: "Send ink flying in all directions, and reach the goal.",
        inkColor: "#F4B536",
      },
      13: {
        stageNumber: 13,
        isBoss: false,
        stageName: "Learn to Reflect, and This One Is in the Bank",
        description: "Use the Angle Shooter to reach the goal!",
        inkColor: "#87FE3B",
      },
    },
  },
  "SGVyb1NpdGUtNQ==": {
    siteNumber: 6,
    siteName: "Happiness Research Lab",
    image: "https://cdn.discordapp.com/attachments/770299663789457409/1021797511729532998/6.png",
    stages: {
      1: {
        stageNumber: 1,
        isBoss: false,
        stageName: "Bet You Mist Us!",
        description: "Defeat the enemies sneaking around in the mist, and reach the goal.",
        inkColor: "#ffef1e",
      },
      2: {
        stageNumber: 2,
        isBoss: false,
        stageName: "Octarian Heights",
        description: "Climb the enemy-filled tower to reach the goal.",
        inkColor: "#ffef1e",
      },
      3: {
        stageNumber: 3,
        isBoss: false,
        stageName: "Torture Tour",
        description: "Fight your way to the goal!",
        inkColor: "#ffef1e",
      },
      4: {
        stageNumber: 4,
        isBoss: false,
        stageName: "Conserve Ink—Splat Sustainably",
        description: "Reach the goal before running out of ink.",
        inkColor: "#412DFF",
      },
      5: {
        stageNumber: 5,
        isBoss: false,
        stageName: "The Enemy Ink Is Lava!",
        description: "Reach the goal without touching enemy ink at all.",
        inkColor: "#84FDFF",
      },
      6: {
        stageNumber: 6,
        isBoss: false,
        stageName: "Keep It Rolling",
        description: "Reach the goal using a roller.",
        inkColor: "#09F7FF",
      },
      7: {
        stageNumber: 7,
        isBoss: false,
        stageName: "That Sinking Feeling",
        description: "Reach the goal...quickly.",
        inkColor: "#EA976C",
      },
      8: {
        stageNumber: 8,
        isBoss: false,
        stageName: "Breathe In, Breathe Out",
        description: "Time your movements carefully to reach the goal.",
        inkColor: "#86FF48",
      },
      9: {
        stageNumber: 9,
        isBoss: false,
        stageName: "Dive and Dash",
        description: "Reach the goal within the time limit.",
        inkColor: "#6BBBF2",
      },
      10: {
        stageNumber: 10,
        isBoss: false,
        stageName: "Mission: Fly-Fishin'",
        description: "Fly with the Inkjet to reach the goal.",
        inkColor: "#CAF3E5",
      },
      11: {
        stageNumber: 11,
        isBoss: false,
        stageName: "Don't Tease with the Keys",
        description: "Find the keys, and unlock the path to the goal.",
        inkColor: "#49FDFF",
      },
      12: {
        stageNumber: 12,
        isBoss: false,
        stageName: "Enter the Stamp Gauntlet",
        description: "Smash all enemies within the time limit.",
        inkColor: "#ECBC36",
      },
      99: {
        stageNumber: 99,
        isBoss: true,
        stageName: "The Obscurest Chiaroscurist",
        description: "Fight your way to the exit.",
        inkColor: "#E56C5A",
      },
    },
  },
};

//admin route that creates a new run in database and returns it randomizes values IT ALSO CLOSES ALL OTHER OPEN RUNS
route.get("/dev", async (req, res) => {
  var reqw = await axios.post(
    baseUrl,
    {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "fbee1a882371d4e3becec345636d7d1c",
        },
      },
    },
    { headers: { user: req.user.id } }
  );
  res.send(reqw.data);
});

//admin route that creates a new run in database and returns it randomizes values IT ALSO CLOSES ALL OTHER OPEN RUNS
route.post("/newrun", async (req, res) => {});

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
