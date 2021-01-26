const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const sendEmail = require("../../lib/utils/email");
const userParser = require("../../lib/utils/cloudinary/users");
const expRoutes = require("../experiences/index");
const edRoutes = require("../education/index")

userRoutes.use("/experiences", expRoutes);
userRoutes.use("/education", edRoutes);

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

//PUT //api/users
//EDIT A USER
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

//GET //api/users
//GET ALL USERS
userRoutes.post("/follow/:followId", async (req, res, next) => {
  try {
    const { followId } = req.params;
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follow = await User.findByIdAndUpdate(followId, {
      $addToSet: { followers: userId },
    });
    res.status(201).send({ user });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});



//PUT //api/users/:userId/unfollow/:followId
//UNFOLLOW AN USER
userRoutes.put("/unfollow/:followId", async (req, res, next) => {
  try {
    const { followId } = req.params;
    const {userId} = req.body;

    const following = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { following: followId },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    const follower = await User.findByIdAndUpdate(followId, {
      $pull: { followers: userId },
    });
    res.status(201).send({ following });
  } catch (err) {
    const error = new Error("There was a problem unfollowing this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users
//GET ALL USERS
userRoutes.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There are no users");
  }
})
    //POST / / api/users/login;
    //REGISTER A USER
    userRoutes.post("/login", async (req, res, next) => {
      try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const validPass = await user.comparePass(password);
        console.log(validPass);
        res.status(200).send({ validPass });
      } catch (err) {
        console.log(err);
        const error = new Error("It was not possible to register a new user");
        error.code = "400";
        next(error);
      }
    });
  
module.exports = userRoutes;
