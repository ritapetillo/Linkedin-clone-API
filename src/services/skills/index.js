const express = require("express");
const SkillModel = require("../../models/Skills");
const ApiError = require("../../classes/apiError");
const skillsRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const UserModel = require("../../models/User");

skillsRouter.get("/", async (req, res, next) => {
  try {
    const skills = await SkillModel.find();
    res.send(skills);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

skillsRouter.get("/:skillId", async (req, res, next) => {
  const { skillId } = req.params;
  try {
    const response = await SkillModel.findById(skillId);
    if (response == null) {
      throw new ApiError(404, `No skill with ID ${skillId} found`);
    } else {
      res.status(200).json({ data: response });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

skillsRouter.post(
  "/:userId",
  validationMiddleware(schemas.skillSchema),
  async (req, res, next) => {
    try {
      const newSkill = new SkillModel(req.body);
      const { _id } = await newSkill.save();
      const { userId } = req.params;
      if (response) {
        const user = await UserModel.findByIdAndUpdate(userId, {
          $push: { skills: _id },
        });
      } else {
        throw new ApiError(404, `No User ID ${userId} found`);
      }
      res
        .status(201)
        .json({ data: `Skill with ID ${_id} added to user ${userId}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

skillsRouter.put(
  "/:skillId",
  validationMiddleware(schemas.skillSchema),
  async (req, res, next) => {
    const { skillId } = req.params;
    try {
      const skill = await SkillModel.findByIdAndUpdate(skillId, req.body);
      if (skill) {
        res.status(201).json({ data: `Skill with ID ${skillId} updated` });
      } else {
        throw new ApiError(404, `No skill with ID ${skillId} found`);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

skillsRouter.delete("/:skillId", async (req, res, next) => {
  const { skillId } = req.params;
  try {
    const skill = await SkillModel.findByIdAndDelete(skillId);
    const { userId } = experience;
    if (skill) {
      const user = await UserModel.findByIdAndUpdate(
        { userId },
        { $pull: { skills: skillId } }
      );
      res.status(201).json({ data: `Skill with ID ${skillId} deleted` });
    } else {
      throw new ApiError(404, `No skill with ID ${skillId} found`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = skillsRouter;
