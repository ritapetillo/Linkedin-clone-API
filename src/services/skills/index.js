const express = require("express");
const SkillModel = require("../../models/Skills");
const ApiError = require("../../classes/apiError");
const skillsRouter = express.Router();
const schemas = require("../../lib/validation/validationSchema");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const UserModel = require("../../models/User");
const auth = require("../../lib/utils/privateRoutes");

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
  "/",
  auth,
  validationMiddleware(schemas.skillSchema),
  async (req, res, next) => {
    const user = req.user;
    try {
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const newSkill = new SkillModel(req.body);
      const { _id } = await newSkill.save();
      const userModified = await UserModel.findByIdAndUpdate(userId, {
        $push: { skills: _id },
      });
      res.status(201).json({ data: `Skill with ID ${_id} added` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

skillsRouter.put(
  "/:skillId",
  auth,
  validationMiddleware(schemas.skillSchema),
  async (req, res, next) => {
    const { skillId } = req.params;
    const user = req.user;
    try {
      const currentUser = await UserModel.findById(user.id);
      if (!currentUser)
        throw new ApiError(403, `Only the owner of this profile can edit`);
      const skill = await SkillModel.findByIdAndUpdate(skillId, req.body);
      if (skill && currentUser) {
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

skillsRouter.delete("/:skillId", auth, async (req, res, next) => {
  const { skillId } = req.params;
  const user = req.user;
  try {
    const currentUser = await UserModel.findById(user.id);
    if (!currentUser)
      throw new ApiError(403, `Only the owner of this profile can edit`);
    const skill = await SkillModel.findByIdAndDelete(skillId);
    const { userId } = experience;
    if (skill) {
      const userModified = await UserModel.findByIdAndUpdate(
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
