const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
      },
      user:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
      image: {
        type: String,
      },
      comments:{
        type:Array,
      }
    },
    { timestamps: true }
  );

  module.exports = mongoose.model('Posts',PostSchema)