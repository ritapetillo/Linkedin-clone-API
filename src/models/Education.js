const { Schema, model } = require("mongoose");
const mongoose_csv = require("mongoose-csv");

const EducationSchema = new Schema(
  {
    school: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endYear: {
      type: Number,
      required: true,
    },
    activtiesSocieties: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },

    image: { type: String, default: "https://image.shutterstock.com/image-photo/image-260nw-744810526.jpg" },
  },
  {
    timestamps: true,
  }
);
EducationSchema.plugin(mongoose_csv);

const EducationModel = model("Education", EducationSchema);
module.exports = EducationModel;
