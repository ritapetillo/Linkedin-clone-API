const express = require("express");
const router = express.Router();
const CommentsModel = require("../../models/Comment.js");
const commentParser = require("../../lib/utils/cloudinary/comments");
const q2m = require("query-to-mongo")

router.post("/", async (req, res, next) => {
  try {
    const newComment = new CommentsModel(req.body);
    const { _id } = await newComment.save();
    res.status(201).send({ id: _id });
  } catch (error) {
    console.log(error.status);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query)
    const total = await CommentsModel.countDocuments(query.criteria)
    const comment = await CommentsModel.find(query.criteria, query.options.fields)
          .sort(query.options.sort)
          .skip(query.options.skip)
          .limit(query.options.limit)
    res.send({links: query.links("/comments", total), comment});
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const comment = await CommentsModel.findById(id);
    if (comment) {
      res.send(comment);
    } else {
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id/user/:uid", async (req, res, next) => {
  try {
    const commentToUpdate = await CommentsModel.findById(req.params.id);
    if (commentToUpdate.user[0] == req.params.uid) {
      try {
        const comment = await CommentsModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            runValidators: true,
            new: true,
          }
        );
        console.log("COMMENT:::::", comment.user[0]);
        if (comment) {
          res.send(comment);
        } else {
          const error = new Error(`comment with id ${req.params.id} not found`);
          error.httpStatusCode = 404;
          next(error);
        }
      } catch (error) {
        next(error);
      }
    } else {
      const error = new Error(
        "only the author of the comment can update his/her comment"
      );
      error.httpStatusCode = 403;
      next(error);
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:id/user/:uid", async (req, res, next) => {
  try {
    const commmentToDelete = await CommentsModel.findById(req.params.id);
    if (commmentToDelete.user[0] == req.params.uid) {
      try {
        const comment = await CommentsModel.findByIdAndDelete(req.params.id);
        if (comment) {
          res.send(req.params.id);
        } else {
          const error = new Error(`comment with id ${req.params.id} not found`);
          error.httpStatusCode = 404;
          next(error);
        }
      } catch (error) {
        const er = new Error(`Something went wrong`);
        er.httpStatusCode = 400;
        next(er);
      }
    } else {
      const er = new Error(
        `only the author of the comment or the author can delete the comment`
      );
      er.httpStatusCode = 403;
      next(er);
    }
  } catch (error) {
    const e = new Error(
      `only the author of the comment or the author can delete the comment`
    );
    e.httpStatusCode = 403;
    next(e);
  }
});

router.post(
  "/:id/upload",
  commentParser.single("image"),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      console.log("req.file", req.file);
      const img = req.file && req.file.path;
      const updateComment = await CommentsModel.findByIdAndUpdate(id, {
        $set: { img },
      });
      res.status(201).json({ data: `Photo added to comment with ID ${id}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// /comments/:id/replies GET
router.get("/:id/replies", async (req, res, next) => {
  try {
    const { replies } = await CommentsModel.findById(req.params.id);
    res.status(200).send(replies);
  } catch (error) {
    const err = new Error("Something went wrong with GET.");
    err.httpStatusCode = 400;
    next(err);
  }
});

// /comments/:id/replies POST
router.post("/:id/replies", async (req, res, next) => {
  try {
    const replyText = req.body.text;
    const replyAuthorId = req.body.user;

    const replyToInsert = {
      text: replyText,
      user: replyAuthorId,
    };
    console.log("REPLY TO INSERT:::::::", replyToInsert);
    if (replyAuthorId) {
      const updatedComment = await CommentsModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            replies: replyToInsert,
          },
        },
        {
          runValidators: true,
          new: true,
        }
      );
    res.status(201).send(updatedComment);
    } else {
      throw new Error();
    }
  } catch (error) {
    const err = new Error("Something went wrong with POST.");
    err.httpStatusCode = 500;
    next(err);
  }
});

//   /comments/:cid/replies/:rid/user/:uid
// DOESNT WORK 
router.put("/:cid/replies/:rid/user/:uid", async (req, res, next) => {
  try {
    const { replies } = await CommentsModel.findById(req.params.cid, {
      _id: 0,
      replies: {
        $elemMatch: {
          _id: req.params.rid,
        },
      },
    });

    console.log("reply user id:::::::::::", replies[0].user[0]);

    if (replies && replies.length > 0 && req.params.uid == replies[0].user[0]) {
      const replyToUpdate = { ...replies[0].toObject(), ...req.body };
      console.log("reply to update:::::::", replyToUpdate);
      try {
        const modifiedReply = await CommentsModel.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.cid),
            "replies._id": mongoose.Types.ObjectId(req.params.rid),
          },
          { $set: { "replies.$": replyToUpdate } }
        );
        console.log("modifiedReply:::::::", modifiedReply);
      } catch (e) {
        const err = new Error("nooooooooooooooooo");
        next(err);
      }
      res.status(200).send(modifiedReply);
    } else {
      const error = new Error("Couldnt update reply with id=", req.params.rid);
      next(error);
    }
  } catch (error) {
    const err = new Error("hereeeeeeeeeeeeeeeeeee");
    next(err);
  }
});

// /comments/:cid/replies/:rid/user/:uid
router.delete("/:cid/replies/:rid/user/:uid", async (req, res, next) => {
  try {
    const { replies } = await CommentsModel.findById(req.params.cid, {
      _id: 0,
      replies: {
        $elemMatch: {
          _id: req.params.rid,
        },
      },
    });
    console.log(
      "REPLIES::::::::::::",
      replies[0].user[0],
      "USER:::::::",
      req.params.uid
    );

    if (replies[0].user[0] == req.params.uid) {
      try {
        const modifiedReply = await CommentsModel.findByIdAndUpdate(
          req.params.cid,
          {
            $pull: {
              replies: { _id: req.params.rid },
            },
          }
        );
        res.status(200).send(modifiedReply);
      } catch (error) {
        const err = new Error("Couldnt delete reply!");
        next(err);
      }
    } else {
      const err = new Error(
        "Only the author of the reply can delete the reply!"
      );
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

// /comments/:cid/replies/:rid/upload
// router.post(
//   "/:cid/replies/:rid/upload",
//   commentParser.single("image"),
//   async (req, res, next) => {
//     const { id } = req.params;
//     try {
//       console.log("req.file", req.file);
//       const img = req.file && req.file.path;
//       const updateComment = await CommentsModel.findByIdAndUpdate(id, {
//         $set: { img },
//       });
//       res.status(201).json({ data: `Photo added to comment with ID ${id}` });
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }
// );

module.exports = router;
