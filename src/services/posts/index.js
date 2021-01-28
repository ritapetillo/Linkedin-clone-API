const express = require("express");
const postRouter = express.Router();
const Posts = require("../../models/Post");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const schemas = require("../../lib/validation/validationSchema");
const postsParser = require("../../lib/utils/cloudinary/posts");
const q2m = require("query-to-mongo");
const ApiError = require("../../classes/apiError");
const auth = require("../../lib/utils/privateRoutes");

/* - GET https://yourapi.herokuapp.com/api/posts/
Retrieve posts */
postRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await Posts.countDocuments(query.criteria);
    const post = await Posts.find(query.criteria, query.options.fields)
      .sort([["createdAt", -1]])
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate("userId")
      .populate("comments");
    res.send({ links: query.links("/posts", total), post });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/* - POST https://yourapi.herokuapp.com/api/posts/
Creates a new post */
postRouter.post(
  "/",
  auth,
  validationMiddleware(schemas.PostSchema),
  async (req, res, next) => {
    const user = req.user;
    try {
      const newPost = new Posts(req.body);
      newPost.userId = user.id;
      const { _id } = await newPost.save();
      res.status(201).json({ _id });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

/* - GET https://yourapi.herokuapp.com/api/posts/{postId}
Retrieves the specified post */
postRouter.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await Posts.findById(id)
      .populate("userId")
      .populate("comments")
      .exec(function (err, post) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json(post);
          console.log("success");
        }
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
/* - PUT https://yourapi.herokuapp.com/api/posts/{postId}
Edit a given post */
postRouter.put(
  "/:id",
  auth,
  validationMiddleware(schemas.PostSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const postToEdit = await Posts.findById(id);

    try {
      console.log("postToEdit.userId", postToEdit.userId);
      console.log("user.id", user.id);

      if (postToEdit.userId != user.id)
        throw new ApiError(403, `Only the owner of this comment can edit`);
      const updatedPost = await Posts.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true,
      });
      res.status(200).send({ updatedPost });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/* - DELETE https://yourapi.herokuapp.com/api/posts/{postId}
Removes a post */
postRouter.delete(
  "/:postId",
  auth,
  validationMiddleware(schemas.PostSchema),
  async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user;
    const postToDelete = await Posts.findById(postId);
    try {
      if (postToDelete.userId != user.id)
        throw new ApiError(403, `Only the owner of this comment can edit`);
      const removedPost = await Posts.findByIdAndDelete(postId);
      res.status(200).send("Deleted Post with Id: " + postId);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/* - POST https://yourapi.herokuapp.com/api/posts/{postId}
Add an image to the post under the name of "post" */
postRouter.post("/:id", postsParser.single("image"), async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
    console.log("req.file", req.file);
    const image = req.file && req.file.path;
    const updatePosts = await Posts.findByIdAndUpdate(id, {
      $push: { image },
    });
    res.status(201).json({ data: `Photo added to Post with ID ${id}` });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = postRouter;
