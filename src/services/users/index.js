const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const sendEmail = require("../../lib/utils/email");
const userParser = require("../../lib/utils/cloudinary/users");
const expRoutes = require("../experiences/index");
const edRoutes = require("../education/index");
const skillRoutes = require("../skills/index");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { RETOKEN_SECRET } = process.env;

const auth = require("../../lib/utils/privateRoutes");
const validation = require("../../lib/validation/validationMiddleware");
const valSchema = require("../../lib/validation/validationSchema");

userRoutes.use("/experiences", expRoutes);
userRoutes.use("/education", edRoutes);
userRoutes.use("/skills", skillRoutes);

//GET /api/users
//GET ALL USERS
userRoutes.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send({ users });
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//GET /api/users/me
//GET MY PROFILE
userRoutes.get("/me", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const currentUser = await User.findById(user.id)
      .select("-password")
      .populate("experiences skills education");
    res.status(200).send({ currentUser });
  } catch (err) {
    const error = new Error("You are not authorized to see this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users/csv
//GET ALL USERS in a cvs file
userRoutes.get("/csv", async (req, res, next) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=users.csv",
    });
    const users = await User.find().select("-password").csv(res);
  } catch (err) {
    const error = new Error("There are no users");
    error.code = "400";
    next(error);
  }
});

//POST //api/users
//REGISTER A USER

userRoutes.post(
  "/",
  validation(valSchema.userSchema),
  async (req, res, next) => {
    try {
      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      const email = await sendEmail(newUser);
      res.status(200).send({ savedUser });
    } catch (err) {
      if (err.code === 11000)
        return next(new Error(`${Object.keys(err.keyValue)} already exist"`));
      const error = new Error("It was not possible to register a new user");
      error.code = "400";
      next(error);
    }
    p;
  }
);

//POST //api/users/upload
//REGISTER A USER
userRoutes.post(
  "/upload",
  auth,
  userParser.single("image"),
  async (req, res, next) => {
    const { id } = req.user;
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
      const error = new Error("It was not possible to insert the user image");
      error.code = "400";
      next(error);
    }
  }
);

//PUT /api/users/
//EDIT A USER
userRoutes.put("/", auth, async (req, res, next) => {
  const { id } = req.user;
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

//PUT /api/users/
//EDIT A USER
// userRoutes.put("/:id", async (req, res, next) => {
//   const { id } = req.params.id;
//   try {
//     const editedUser = await User.findByIdAndUpdate(id, req.body, {
//       runValidators: true,
//       new: true,
//     });
//     res.status(200).send({ editedUser });
//   } catch (err) {
//     console.log(err);
//     const error = new Error("It was not possible to register a new user");
//     error.code = "400";
//     next(error);
//   }
// });

//DELETE /api/users
//DELETE a user
userRoutes.delete("/", auth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There was a problem deleting this user");
  }
});

//POST /users/follow/:followId
//POST follow a user
userRoutes.post("/follow/:followId", auth, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user.id;
    if (!(await User.findById(followId)))
      return next(
        new Error("The user you are trying to follow, does not exist")
      );

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
userRoutes.put("/unfollow/:followId", auth, async (req, res, next) => {
  try {
    const { followId } = req.params;
    const userId = req.user.id;

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
    const error = new Error("You cannot unfollow this user");
    error.code = "400";
    next(error);
  }
});

//GET //api/users
//GET ALL USERS
userRoutes.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password")
    .populate("experiences skills education");
    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There is no user with this id");
  }
});

module.exports = userRoutes;
