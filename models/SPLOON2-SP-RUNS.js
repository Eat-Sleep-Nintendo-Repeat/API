const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  id: { type: String, required: true },

  stage_id: { type: String, required: true },
  area: { type: String, required: true },
  isopen: { type: Boolean, default: true },

  participants: { type: Array, default: [] },
  runs: { type: Array, default: [] },
  winner: { type: Array, default: null },

  created: { type: Date, default: new Date() },
});

module.exports = mongoose.model("spoon2-singleplayer-runs", Schema);
