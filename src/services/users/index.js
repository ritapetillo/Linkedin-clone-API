const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const sendEmail = require("../../lib/utils/email");
const { userParser } = require("../../lib/utils/cloudinary");
const expRoutes = require("../experiences/index");
userRoutes.use("/experiences", expRoutes);

//GET //api/users
//GET ALL USERS
userRoutes.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    //   .select("-_id");
    res.status(200).send({ users });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});
//GET //api/users
//GET ALL USERS
userRoutes.get("/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=users.csv",
    });
    const users = await User.find().csv(res);
    //   .select("-_id");
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//POST //api/users
//REGISTER A USER
userRoutes.post("/", async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    const email = await sendEmail(newUser);
    res.status(200).send({ savedUser });
  } catch (err) {
    console.log(err.code + Object.keys(err.keyValue));
    if (err.code === 11000)
      return next(new Error(`${Object.keys(err.keyValue)} already exist"`));
    const error = new Error("It was not possible to register a new user");
    error.code = "400";
    next(error);
  }
});

//POST //api/users
//REGISTER A USER
userRoutes.post(
  "/:id/upload",
  userParser.single("image"),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const image = req.file && req.file.path; // add the single
      const editedUser = await User.findByIdAndUpdate(
        id,
        { $set: { image } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).send({ editedUser });
    } catch (err) {
      console.log(err);
      const error = new Error("It was not possible to register a new user");
      error.code = "400";
      next(error);
    }
  }
);
module.exports = userRoutes;

//POST //api/users
//REGISTER A USER
userRoutes.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const editedUser = await User.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).send({ editedUser });
  } catch (err) {
    console.log(err);
    const error = new Error("It was not possible to register a new user");
    error.code = "400";
    next(error);
  }
});
module.exports = userRoutes;
