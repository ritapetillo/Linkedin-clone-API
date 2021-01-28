const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    
    image: {
      type: String,
      required: false,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Posts", PostSchema);
