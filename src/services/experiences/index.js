const express = require("express");
const ExperienceModel = require("../../models/Experiences");
const ApiError = require("../../classes/apiError");
const experiencesRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
// const UserModel = require("../../models/User");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { Parser } = require("json2csv");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "experiences",
  },
});
const cloudinaryMulter = multer({ storage: storage });

experiencesRouter.get("/", async (req, res, next) => {
  try {
    const experiences = await ExperienceModel.find();
    res.send(experiences);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/:experienceId", async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const response = await ExperienceModel.findOne(experienceId);
    if (response == null) {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    } else {
      res.status(200).json({ data: response });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/CSV", async (req, res, next) => {
  const fields = [
    "Role",
    "Company",
    "Description",
    "Start Date",
    "End Date",
    "Area",
    "Image",
    "Username",
  ];
  const opts = { fields };
  const experiences = ExperienceModel.find().toObject();
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(experiences);
    console.log(csv);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.post(
  "/:userId",
  validationMiddleware(schemas.experienceSchema),
  async (req, res, next) => {
    try {
      const newExperiences = new ExperienceModel(req.body);
      const { _id } = await newExperiences.save();
      const { userId } = req.params;
      const response = await UserModel.findOne(userId);
      if (response) {
        const user = await UserModel.findByIdAndUpdate(userId, {
          $push: { experiences: _id },
        });
      } else {
        throw new ApiError(404, `No User ID ${userId} found`);
      }
      res
        .status(201)
        .json({ data: `Experience with ${_id} added to user ${userId}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.post(
  "/:experienceId/picture",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    const { experienceId } = req.params;
    try {
      const image = req.file && req.file.path;
      const updateExperience = await ExperienceModel.findByIdAndUpdate(
        experienceId,
        { $push: { image } }
      );
      res
        .status(201)
        .json({ data: `Photo added to Experience with ID ${experienceId}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.put(
  "/:experienceId",
  validationMiddleware(schemas.experienceSchema),
  async (req, res, next) => {
    const { experienceId } = req.params;
    try {
      const experience = await ExperienceModel.findByIdAndUpdate(
        experienceId,
        req.body
      );
      if (experience) {
        res
          .status(201)
          .json({ data: `Experience with ID ${experienceId} updated` });
      } else {
        throw new ApiError(404, `No experience with ID ${experienceId} found`);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

experiencesRouter.delete("/:experienceId", async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const experience = await ExperienceModel.findByIdAndDelete(experienceId);
    if (experience) {
      res
        .status(201)
        .json({ data: `Experience with ID ${experienceId} deleted` });
    } else {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = experiencesRouter;
