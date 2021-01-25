const express = require("express")
const router = express.Router()
const CommentsModel = require("../../models/Comment.js")

router.post('/', async (req, res, next) => {
    try{
        const newComment = new CommentsModel(req.body);
        const {_id} = await newComment.save()
        res.status(201).send({id: _id});
    } catch(error){
        console.log(error.status);
    }
})

router.get("/", async(req, res, next) => {
    try{
        const comment = await CommentsModel.find(req.query)
        res.send(comment)
    } catch(error){
        console.log(error)
        next(error)
    }
})

router.get("/:id", async(req, res, next) => {
    try{
        const id = req.params.id;
        const comment = await CommentsModel.findById(id)
        if(comment){
            res.send(comment)
        } else {
            next(error)
        }
    } catch (error){
        console.log(error)
        next(error)
    }
})

router.put("/:id", async (req, res, next) => {
    try {
      const comment = await CommentsModel.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true,
      })
      if (comment) {
        res.send(comment)
      } else {
        const error = new Error(`comment with id ${req.params.id} not found`)
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      next(error)
    }
  })

  router.delete("/:id", async (req, res, next) => {
    try {
      const comment = await CommentsModel.findByIdAndDelete(req.params.id)
      if (comment) {
        res.send(req.params.id)
      } else {
        const error = new Error(`comment with id ${req.params.id} not found`)
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      next(error)
    }
  })

module.exports = router
