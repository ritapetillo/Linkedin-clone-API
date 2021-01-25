const router = require("express").Router();
const experiencesRouter = require("./experiences")


router.use("/expereinces", experiencesRouter);
module.exports = router;
