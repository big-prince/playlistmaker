const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jailLock = require("../maxretry");
const Account = require("../models/accounts");

//signup controller
exports.signup = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    //check if user exists
    const userExists = await Account.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create new user
    const newUser = new Account({
      name,
      username,
      password: hashedPassword,
    });
    const second = new User({
      username: username,
    });
    //save user
    const savedUser = await newUser.save();
    await second.save();

    //create token
    const token = jwt.sign(
      { username: newUser.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, { httpOnly: true });

    //store session data
    req.session.user = {
      name: savedUser.name,
      username: savedUser.username,
    };

    // If everything is fine, return the new user object
    console.log("Signup successful");
    return res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    console.log(error);
  }
};
let attempts = 0;
let array = [];
//login controller
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    //check if account exists
    const userExists = await Account.findOne({ username });

    if (!userExists) {
      attempts += 1;
      throw new Error("user does not exist");
    }
    //check password
    const validPassword = await bcrypt.compare(password, userExists.password);
    if (!validPassword) {
      console.log("Invalid password");
      throw new Error("invalid password");
    }

    //generate token
    const token = jwt.sign(
      { username: userExists.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set the token as an HTTP-only cookie
    res.cookie("token", token, { httpOnly: true });

    //store session data
    req.session.user = {
      name: userExists.name,
      username: userExists.username,
    };

    const userData = await User.findOne({ username: username });
    //reset values
    attempts = 0;
    userData.attempts = 0;
    userData.lastAttemptAt = null;
    await userData.save();

    console.log("Login successful");
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    //password error
    let userData = await User.findOne({ username: username });
    //update values
    userData.attempts += 1;
    userData.lastAttemptAt = Date.now();
    await userData.save();

    //send error messages
    if (error.message === "user does not exist") {
      console.log(attempts);
      if (attempts > 3) {
        return res.status(400).json({ message: "Account locked" });
      }
      return res.status(400).json({ message: "Account does not exist" });
    } else if (error.message === "invalid password") {
      return res.status(400).json({ message: "Invalid password" });
    }
  }
};

exports.homepage = (req, res) => {
  res.render("../views/home.ejs");
};
