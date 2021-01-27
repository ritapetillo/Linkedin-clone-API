const router = require("express").Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");
const postRoutes = require("./posts")


router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);
router.use("/posts",postRoutes)

module.exports = router;
