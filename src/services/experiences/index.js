const express = require("express");
const q2m = require("query-to-mongo");
const ExperienceModel = require("../../models/experiences");
const ApiError = require("../../classes/apiError");
const experiencesRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");



experiencesRouter.get("/", (schemas, validationMiddleware), async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await ExperienceModel.countDocuments(query.criteria);
    const experiences = await ExperienceModel.find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate("users");
    res.send({ links: query.links("/experiences", total), experiences });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
experiencesRouter.get("/:experienceId",(schemas, validationMiddleware), async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const response = await ExperienceModel.findExperiencesWithUser(
      experienceId
    );
    // const response = await ExperienceModel.findById(experienceId).populate("users")
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

experiencesRouter.post("/", (schemas, validationMiddleware), async (req, res, next) => {
  try {
    const newExperiences = new ExperienceModel(req.body);
    const { _id } = await newExperiences.save();
    res.status(201).json({ data: `Experience with ${_id} added` });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.put("/:experienceId", (schemas, validationMiddleware), async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const experience = await ExperienceModel.findByIdAndUpdate(
      experienceId,
      req.body
    );
    if (experience) {
      res.status(201).json({ data: `Experience with ID ${_id} updated` });
    } else {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.delete("/:experienceId", (schemas, validationMiddleware), async (req, res, next) => {
  const { experienceId } = req.params;
  try {
    const experience = await ExperienceModel.findByIdAndDelete(experienceId);
    if (experience) {
      res.status(201).json({ data: `Experience with ID ${_id} deleted` });
    } else {
      throw new ApiError(404, `No experience with ID ${experienceId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});


module.exports = experiencesRouter
