const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  attempts: Number,
  isLocked: Boolean,
  lockReleaseAt: Date,
  lastAttemptAt: Date,
});

module.exports = mongoose.model("User", userSchema);
