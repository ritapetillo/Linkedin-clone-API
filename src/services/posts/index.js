const express = require("express");
const Post = require("../../models/Post");
const postRouter = express.Router()
const Posts = require("../../models/Post")



/* - GET https://yourapi.herokuapp.com/api/posts/
Retrieve posts */
postRouter.get("/", async(req,res,next)=>{
    try {
        const posts = await Posts.find();
        res.status(200).send({ posts });
      } catch (err) {
        const error = new Error("There are no posts");
        error.code = "400";
        next(error);
      }
})


/* - POST https://yourapi.herokuapp.com/api/posts/
Creates a new post */
postRouter.post("/", async(req,res,next)=>{
    try{
      const newpost = new Posts(req.body)
      const savedPost = await newpost.save()
      res.status(200).send({savedPost})
    }
    catch(err){
        res.status(400).send({err})
    }
})

/* - GET https://yourapi.herokuapp.com/api/posts/{postId}
Retrieves the specified post */
postRouter.get("/:id", async(req,res,next)=>{
  const { id } = req.params
  try{
    const post = await Posts.findById(id)
    res.status(200).send({post})
  }catch(err){
    res.status(400).send({err})
  }
    
})
/* - PUT https://yourapi.herokuapp.com/api/posts/{postId}
Edit a given post */
postRouter.put("/:id", async(req,res,next)=>{
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
    const removedPost = await Post.findByIdAndDelete(id)
    res.status(200).send("Deleted Post with Id: " + id)
  }catch(err){

  }
    
})
/* - POST https://yourapi.herokuapp.com/api/posts/{postId}
Add an image to the post under the name of "post" */
postRouter.post("/:id", async(req,res,next)=>{
    
})

module.exports = postRouter