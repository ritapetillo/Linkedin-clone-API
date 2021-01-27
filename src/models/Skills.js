const {Schema} = require("mongoose");
const mongoose = require("mongoose");

const SkillSchema = new Schema({
    text: {
        type: String,
        required: true,
    }
});

const SkillModel = model("Skills", SkillSchema);
module.exports = SkillModel;