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
  experienceSchema: Joi.object().keys({
    role: Joi.string().required(),
    company: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    area: Joi.string().required(),
    image: Joi.string(),
    username: Joi.string().required(),
  })
};



module.exports = schemas
