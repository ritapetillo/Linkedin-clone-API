const router = require("express").Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");
const expRouter = require("./experiences");
const edRouter = require("./education")


router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);
router.use("/experiences", expRouter);
router.use("/education", edRouter);


module.exports = router;
