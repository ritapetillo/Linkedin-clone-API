const express = require("express");
const router = express.Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");

router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);

module.exports = router;
