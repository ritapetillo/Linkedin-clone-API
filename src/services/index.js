const router = require("express").Router();
const userRoutes = require("./users");
const commentsRoutes = require("./comments");



router.use("/users", userRoutes);
router.use("/comments", commentsRoutes);



module.exports = router;
