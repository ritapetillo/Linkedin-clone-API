const express = require("express");
const EducationModel = require("../../models/Education");
const ApiError = require("../../classes/apiError");
const educationRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const edParser = require("../../lib/utils/cloudinary/education.js");
const UserModel = require("../../models/User");

educationRouter.get("/", async (req, res, next) => {
  try {
    const studies = await EducationModel.find();
    res.send(studies);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.get("/:educationId", async (req, res, next) => {
  const { educationId } = req.params;
  try {
    const response = await EducationModel.findById(educationId);
    if (response == null) {
      throw new ApiError(404, `No education with ID ${educationId} found`);
    } else {
      res.status(200).json({ data: response });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.get("/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=education.csv",
    });
    const studies = await EducationModel.find().csv(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

educationRouter.post(
  "/:userId",
  validationMiddleware(schemas.educationSchema),
  async (req, res, next) => {
    try {
      const newEducation = new EducationModel(req.body);
      const { _id } = await newEducation.save();
      const { userId } = req.params;
      const response = await UserModel.findById(userId);
      if (response) {
        const user = await UserModel.findByIdAndUpdate(userId, {
          $push: { education: _id },
        });
      } else {
        throw new ApiError(404, `No User ID ${userId} found`);
      }
      res
        .status(201)
        .json({ data: `Education with ID ${_id} added to user ${userId}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

educationRouter.post(
  "/:educationId/picture",
  edParser.single("image"),

  async (req, res, next) => {
    const { educationId } = req.params;
    try {
      const image = req.file && req.file.path;
      const updateEducation = await EducationModel.findByIdAndUpdate(
        educationId,
        { $push: { image } }
      );
      res
        .status(201)
        .json({ data: `Photo added to Education with ID ${educationId}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

educationRouter.put(
  "/:educationId",
  validationMiddleware(schemas.educationSchema),
  async (req, res, next) => {
    const { educationId } = req.params;
    try {
      const education = await EducationModel.findByIdAndUpdate(
        educationId,
        req.body
      );
      if (education) {
        res
          .status(201)
          .json({ data: `Education with ID ${educationId} updated` });
      } else {
        throw new ApiError(404, `No education with ID ${educationId} found`);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

educationRouter.delete("/:educationId", async (req, res, next) => {
  const { educationId } = req.params;
  try {
    const education = await EducationModel.findByIdAndDelete(educationId);
    const { userId } = education;
    const _id = userId;
    if (education) {
      const user = await UserModel.findOneAndUpdate(
        { _id },
        { $pull: { education: educationId } }
      );
      res
        .status(201)
        .json({ data: `Education with ID ${educationId} deleted` });
    } else {
      throw new ApiError(404, `No education with ID ${educationId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = educationRouter;
