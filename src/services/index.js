const router = require("express").Router();
const userRoutes = require("./users");
const experiencesRouter = require("./experiences")

router.use("/users", userRoutes);
router.use("/experiences", experiencesRouter);

module.exports = router;
