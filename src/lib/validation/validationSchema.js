const Joi = require("joi");
const schemas = {

  userSchema: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  loginSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  commentSchema: Joi.object().keys({
    text: Joi.string().required()
  })
};

   


module.exports = schemas
