const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const autheticator = require("../joi");
const authorizer = require("../jwt");
const { unlockAccounts, checkLoginAttempts } = require("../maxretry");

//signup route
router.post("/signup", autheticator.signupValidator, userController.signup);
//login route
router.post(
  "/login",
  autheticator.loginValidator,
  checkLoginAttempts,
  userController.login
);
//homepage route
router.get("/home", authorizer.authenticateToken, userController.homepage);
module.exports = router;
