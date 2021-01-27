const Joi = require("joi");
const schemas = {
  userSchema: Joi.object().keys({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    bio: Joi.string(),
    title: Joi.string().min(6).required(),
    area: Joi.string().required(),
  }),
  loginSchema: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  commentSchema: Joi.object().keys({
    text: Joi.string().required(),
    user: Joi.string().required(),
  }),
  experienceSchema: Joi.object().keys({
    role: Joi.string().required(),
    company: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    area: Joi.string().required(),
    image: Joi.string(),
    userId: Joi.string(),
  }),
  educationSchema: Joi.object().keys({
    school: Joi.string().required(),
    degree: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    startYear: Joi.number().required(),
    endYear: Joi.number().required(),
    activtiesSocieties: Joi.string(),
    description: Joi.string().required(),
    userId: Joi.string(),

  }),
  PostSchema: Joi.object().keys({
text: Joi.string().required(),
    img:Joi.string(),
    comments:Joi.string(),
    userId: Joi.string(),

  }),
  skillSchema: Joi.object().keys({
    text: Joi.string().required(),
    userId: Joi.string(),

  }),
};

module.exports = schemas;
