const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Please enter your username"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    trim: true,
    unique: true,
  },
});

module.exports = mongoose.model("Account", userSchema);
