const mongoose = require("mongoose");

const MemberSchema = mongoose.Schema({
  id: { required: true, type: String },
  informations: { name: String, discriminator: String, avatar: String },
  type: { default: 0, type: Number },
  serverbooster: { default: false, type: Boolean },

  currencys: {
    ranks: {
      rank: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
    },
    coins: {
      amount: { type: Number, default: 300 },
      log: Array,
      purchases: [
        {
          id: Number,
          date: { type: Date, default: new Date() },
          active: { type: Boolean, default: true },
        },
      ],
      last_daily: { type: Date, default: null },
    },
    gems: {
      amount: { type: Number, default: 300 },
      log: Array,
      purchases: [
        {
          id: Number,
          date: { type: Date, default: new Date() },
          active: { type: Boolean, default: true },
        },
      ],
      last_daily: { type: Date, default: null },
    },
  },

  oauth: {
    e_access_token: { default: null, type: String },
    e_refresh_token: String,
    e_iv: Buffer,
    expire_date: Date,
    scopes: Array,
    redirect: String,
    cookies: Array,
    blocking_state: {
      is_blocked: { type: Boolean, default: false },
      date: Date,
      reason: String,
    },
  },

  settings: {
    levelup_notify: { type: Boolean, default: false },
    page_private: { type: Boolean, default: false },
  },

  nintendo_account: {
    session_token: { type: String, default: null },
    iksm_token: { type: String, default: null },
  },

  dev_accounts: { type: Array, default: [] },

  usemyvoice: {
    accepted: { type: Boolean, default: false },
    state: { type: String, default: null },
    date: Date,
    signature: String,
  },

  delete_in: { default: null, type: Date },
  joined: { default: new Date(), type: Date },
});

module.exports = mongoose.model("Member-v2.0", MemberSchema);
