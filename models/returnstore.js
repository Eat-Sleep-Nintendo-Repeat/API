const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  currentFestQuery: Object,
  LatestBattleHistoriesQuery: Object,
  DetailFestRecordDetailQuery: Object,

  logname: String,
});

module.exports = mongoose.model("splatnet3devdatastore", Schema);
