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
  PostSchema: Joi.object().keys({
    text: Joi.string().min(1).required(),
    user:Joi.string(),
    image: Joi.string(),
  }),
};

   


module.exports = schemas
