const express = require("express");
const postRouter = express.Router()
const Posts = require("../../models/Post");
const validationMiddleware = require("../../lib/validation/validationMiddleware");
const schemas = require("../../lib/validation/validationSchema");
const postsParser = require("../../lib/utils/cloudinary/posts");
const cloudinary = require('cloudinary');



/* - GET https://yourapi.herokuapp.com/api/posts/
Retrieve posts */
postRouter.get("/", async(req,res,next)=>{
    try {
        await Posts.find().populate("user").exec(function (err, post) {
          if (err){
            console.log(err);
          } else {
            res.status(200).json(post);
            console.log("success");
          }
        });
      } catch (err) {
        const error = new Error("There are no Posts");
        error.code = "400";
        next(error);
      }
})


/* - POST https://yourapi.herokuapp.com/api/posts/
Creates a new post */
postRouter.post("/",validationMiddleware(schemas.PostSchema), async(req,res,next)=>{
    try{
      const newPost = new Posts(req.body)
      const savedPost = await newPost.save()
      res.status(200).send({savedPost})
    }
    catch(err){
        res.status(400).send(err)
    }
})

/* - GET https://yourapi.herokuapp.com/api/posts/{postId}
Retrieves the specified post */
postRouter.get("/:id", async(req,res,next)=>{
  const { id } = req.params
  try{
    await Posts.findById(id).populate("user").exec(function (err, post) {
      if (err){
        console.log(err);
      } else {
        res.status(200).json(post);
        console.log("success");
      }
    });
  }catch(err){
    res.status(400).send({err})
  }
    
})
/* - PUT https://yourapi.herokuapp.com/api/posts/{postId}
Edit a given post */
postRouter.put("/:id",validationMiddleware(schemas.PostSchema), async(req,res,next)=>{
  const { id } = req.params
  try{
    const updatedPost = await Posts.findByIdAndUpdate(id,req.body)
    res.status(200).send({updatedPost})
  }catch(err){
    res.status(400).send({err})
  }
})
/* - DELETE https://yourapi.herokuapp.com/api/posts/{postId}
Removes a post */
postRouter.delete("/:id", async(req,res,next)=>{
  const { id } = req.params
  try{
    const removedPost = await Posts.findByIdAndDelete(id)
    res.status(200).send("Deleted Post with Id: " + id)
  }catch(err){

  }
    
})
/* - POST https://yourapi.herokuapp.com/api/posts/{postId}
Add an image to the post under the name of "post" */
postRouter.post(
  "/:id",
  postsParser.single("img"),
  async (req, res, next) => {
    const { id } = req.params;
    console.log(id)
  try {
      console.log("req.file", req.file);
      const img = req.file && req.file.path;
      const updatePosts = await Posts.findByIdAndUpdate(id, {
        $push: { img },
      });
      res.status(201).json({ data: `Photo added to Post with ID ${id}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/* postRouter.post(
  "/:id",
  postsParser.single("image"),
  async (req, res, next) => {
    const { id } = req.params;
    try{
      cloudinary.uploader.upload(req.body.img, function(result){
        const updatePosts = Posts.findByIdAndUpdate(id,{
          $set:{img: result.url},
        })
      })
      res.status(201).json({ data: `Photo added to Post with ID ${id}`});
    }catch(error){
      console.log(error);
      next(error);
    }
  }) */

module.exports = postRouter