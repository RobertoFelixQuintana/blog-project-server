const mongose = require("mongoose");
const Schema = mongose.Schema;

const CommentsSchema = Schema({
  _id: {
    type: String,
    default: mongose.Types.ObjectId,
  },
  issuesId: String,
  user: String,
  anonymous: Boolean,
  author: {
    type: String,
    default: "Anónimo",
  },
  comment: String,
  created: { type: Date, default: Date.now },
});

module.exports = mongose.model("Comments", CommentsSchema);
