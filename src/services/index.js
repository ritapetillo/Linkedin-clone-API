const router = require("express").Router();
const experiencesRouter = require("./experiences")


router.use("/experiences", experiencesRouter);
module.exports = router;
