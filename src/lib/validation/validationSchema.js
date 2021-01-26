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
    text: Joi.string()
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
  }),
  educationSchema: Joi.object().keys({
    school: Joi.string().required(),
    degree: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    startYear: Joi.number().required(),
    endYear: Joi.number().required(),
    activtiesSocieties: Joi.string(),
    description: Joi.string().required(),
}),
  PostSchema: Joi.object().keys({
    text: Joi.string().required(),
    img:Joi.string(),
    user:Joi.string()
  }),
};

module.exports = schemas;
