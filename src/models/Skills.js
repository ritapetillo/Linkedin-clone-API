const {Schema} = require("mongoose");
const mongoose = require("mongoose");

const SkillSchema = new Schema({
    text: {
        type: String,
        required: true,
    }
    userId: {
        type: String,
        required: false,
      },
});

const SkillModel = model("Skills", SkillSchema);
module.exports = SkillModel;