const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const sendEmail = require("../../lib/utils/email");

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

//POST //api/users
//REGISTER A USER
userRoutes.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (id === "all") {
      await User.deleteMany();
      res.status(200).send("deleted all");
    } else {
      const { _id } = await User.findByIdAndDelete(id);
      res.status(200).send({ _id });
    }
  } catch (err) {
    console.log(err);
    const error = new Error("It was not possible to register a new user");
    error.code = "400";
    next(error);
  }
});
module.exports = userRoutes;
