// let Joi = require("joi");

// let authSchema = Joi.object({
//     productName: Joi.string().alphanum().min(6).max(30).required(),
//     productDescription: Joi.string().alphanum().min(30).max(90).required(),
//     stock: Joi.number().required(),
//     price: Joi.number().required(),
//     email: Joi.string().email().required(),
//     password: Joi.string(),
//     password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
//     confirmPassword: Joi.ref('password'),
//     birthdate: Joi.date().max('now').iso(),
// })