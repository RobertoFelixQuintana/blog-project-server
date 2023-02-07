"use strict";

const mongose = require("mongoose");

const Schema = mongose.Schema;

const UserSchema = Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  created: { type: Date, default: Date.now },
  active: Boolean,
});

module.exports = mongose.model("Users", UserSchema);
