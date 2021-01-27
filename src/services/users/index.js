const express = require("express");
const userRoutes = express.Router();
const User = require("../../models/User");
const RefreshToken = require("../../models/RefreshToken");
const sendEmail = require("../../lib/utils/email");
const userParser = require("../../lib/utils/cloudinary/users");
const expRoutes = require("../experiences/index");
const edRoutes = require("../education/index");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { RETOKEN_SECRET } = process.env;
const auth = require("../../lib/utils/privateRoutes");

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

//GET //api/users/me
//GET MY PROFILE
userRoutes.get("/me", auth, async (req, res, next) => {
  try {
    const user = req.user;
    const currentUser = await User.findById(user.id);
    //   .select("-_id");
    res.status(200).send({ currentUser });
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

//DELETE /api/users/:userId
//DELETE a user
userRoutes.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ user });
  } catch (err) {
    const error = new Error("There eas a problem deleting this user");
  }
});

// /users/follow/:followId
//POST follow a user
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
    const { userId } = req.body;

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
});
//POST / / api/users/login;
//LOGIN
userRoutes.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validPass = await user.comparePass(password);
    if (validPass) {
      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        TOKEN_SECRET,
        {
          expiresIn: "1hr",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        RETOKEN_SECRET,
        {
          expiresIn: "6d",
        }
      );
      const saveReToken = new RefreshToken({ token: refreshToken });
      await saveReToken.save();

      // res.header("auth-token", accessToken);
      res.cookie("token", accessToken, {
        // expires: new Date(Date.now() + expiration),
        secure: false, // set to true if your using https
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        secure: false, // set to true if your using https
        httpOnly: true,
      });

      res.send({ accessToken, refreshToken, expiresIn: Date.now() + 3600000 });
    } else next(new Error("Username or password is wrong"));
    res.status(200).send({ validPass });
  } catch (err) {
    console.log(err);
    const error = new Error("It was not possible to login ");
    error.code = "400";
    next(error);
  }
});

//POST / / api / users / login;
//LOGIN
userRoutes.post("/renewToken", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const token = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshToken) return next(new Error("Unauthorized"));
    const user = await jwt.verify(refreshToken, RETOKEN_SECRET);
    const payload = { id: user.id, username: user.username };
    const accessToken = await jwt.sign(payload, TOKEN_SECRET, {
      expiresIn: "1hr",
    });
    res.cookie("token", accessToken, {
      // expires: new Date(Date.now() + expiration),
      secure: false, // set to true if your using https
      httpOnly: true,
    });
    res.status(200).json(" credential renewed");
  } catch (err) {
    console.log(err);
    const error = new Error("Unauthorized ");
    error.code = "404";
    next(error);
  }
});

//POST / / api / users / login;
//LOGIN
userRoutes.delete("/auth/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies.refreshToken;
    const token = RefreshToken.findOneAndDelete({ token: refreshToken });
    res.clearCookie("refreshToekn");
    res.clearCookie("token");

    res.status(200).send("logged out");
  } catch (err) {
    console.log(err);
    const error = new Error("Unauthorized ");
    error.code = "404";
    next(error);
  }
});

module.exports = userRoutes;
