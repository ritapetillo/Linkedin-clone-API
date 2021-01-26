const { Schema, model } = require("mongoose");
const mongoose_csv = require("mongoose-csv");

const ExperienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    image: { type: String, default: "https://res.cloudinary.com/youcancallmestevie/image/upload/v1611666010/experiences/default_ricn33.jpg" },

  },
  {
    timestamps: true,
  }
);
ExperienceSchema.plugin(mongoose_csv);

// ExperienceSchema.static("findExperiencesWithUser", async function (id) {
//   const book = await ExperienceModel.findById(id).populate("users");
//   return book;
// });

const ExperienceModel = model("Experience", ExperienceSchema);
module.exports = ExperienceModel;
