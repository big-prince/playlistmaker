const joi = require("joi");

//create for signup
const SignupSchema = joi.object({
  name: joi.string().min(3).max(20).required(),
  username: joi.string().min(3).max(20).required(),
  password: joi.string().min(5).max(100).required(),
});

//create for login
const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});

//validate signup
exports.signupValidator = (req, res, next) => {
  const { error } = SignupSchema.validate(req.body);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    console.log(errorMessage);
    return res
      .status(400)
      .json({ message: `There is an error: ${errorMessage}` });
  }

  next();
};

//validate login
exports.loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    console.log(errorMessage);
    return res
      .status(400)
      .json({ message: `There is an error: ${errorMessage}` });
  }

  next();
};
