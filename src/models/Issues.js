const mongose = require("mongoose");
const Schema = mongose.Schema;

const IssuesSchema = Schema({
  _id: {
    type: String,
    default: mongose.Types.ObjectId,
  },
  user: {
    type: String,
  },
  anonymous: Boolean,
  author: {
    type: String,
    default: "Anónimo",
  },
  title: String,
  description: String,
  active: Boolean,
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
  created: { type: Date, default: Date.now },
});

module.exports = mongose.model("Issues", IssuesSchema);
