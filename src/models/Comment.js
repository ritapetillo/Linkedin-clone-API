const {Schema} = require("mongoose");
const mongoose = require("mongoose");

const CommentModel = new Schema({
    text: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: false
    },
    user: [{ 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    }],
    replies: {
        type: [
            {
                text: {
                    type: String,
                    required: true,
                },
                img: {
                    type: String,
                    required: false
                },
                user: [{
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                }],
            },
            { timestamps: true }
        ],
        default: []
    }
}, 
{
    timestamps: true
}
);

//schema exported as a model
module.exports = mongoose.model("Comment", CommentModel);