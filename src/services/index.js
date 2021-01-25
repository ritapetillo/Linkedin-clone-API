const router = require("express").Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");
const experiencesRouter = require("./experiences")

router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);
router.use("/experiences", experiencesRouter);


module.exports = router;
