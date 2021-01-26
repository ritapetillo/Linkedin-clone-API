const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
      },
      user:{type: Schema.Types.ObjectId, ref: "User"},
      image: {
        type: String,
      },
      comments:
        [{type: Schema.Types.ObjectId,ref:"comments"}]
    },
    { timestamps: true }
  );

  module.exports = mongoose.model('Posts',PostSchema)