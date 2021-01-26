const express = require("express");
const ExperienceModel = require("../../models/Experiences");
const ApiError = require("../../classes/apiError");
const experiencesRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const expParser = require("../../lib/utils/cloudinary/experiences");
const UserModel = require("../../models/User");

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
    const response = await ExperienceModel.findById(experienceId);
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


experiencesRouter.get("/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=expereinces.csv",
    });
    const experiences = await ExperienceModel.find().csv(res);
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
      const response = await UserModel.findById(userId);
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
  expParser.single("image"),
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
    const { username } = experience;
    const user = await UserModel.findOneAndUpdate(
      { username },
      { $pull: { experiences: experienceId } }
    );

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
