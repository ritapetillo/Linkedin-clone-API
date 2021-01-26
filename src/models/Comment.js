const {Schema} = require("mongoose");
const mongoose = require("mongoose");

const CommentModel = new Schema({
    text: {
        type: String,
        required: true,
    },
    img: [{
        type: String,
        required: false
    }]
});

//schema exported as a model
module.exports = mongoose.model("Comment", CommentModel);