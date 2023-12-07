const User = require("./models/user");

// Function to unlock accounts that have passed the lock release time
const unlockAccounts = async (req, res, next) => {
  const lockedUsers = await User.find({
    isLocked: true,
    lockReleaseAt: { $lte: new Date() },
  });

  // Unlock the accounts
  for (const user of lockedUsers) {
    user.isLocked = false;
    user.lockReleaseAt = null;
    user.attempts = 0;
    await user.save();
  }
  if (lockedUsers.length > 0) {
    console.log("Unlocked " + lockedUsers.length + " accounts");
  }
  //if thelist is empty
  if (lockedUsers.length === 0) {
    console.log("No accounts to unlock");
  }
};

// Schedule the task to run every minute (adjust as needed)
setInterval(unlockAccounts, 60 * 1000); // Run every minute

const checkLoginAttempts = async (req, res, next) => {
  const username = req.body;
  const user = await User.findOne({ username: username.username });

  //check if user is locked
  if (user.isLocked === true) {
    console.log("Your account is locked");
    return res.status(401).json({ message: "Your account is locked" });
  }

  //check if user has exceeded max attempts
  if (user && user.attempts > 3) {
    //lock the account for a period of time
    user.isLocked = true;
    //release in the 2minutes
    user.lockReleaseAt = Date(Date.now() + 2 * 60 * 1000);
    console.log(user.lockReleaseAt);
    console.log(user);
    await user.save();
    return res.status(403).json({
      message: `Acount is locked please try again later. Will be unlocked in 30 minutes `,
    });
  }

  unlockAccounts();
  //continue
  next();
};

//export
module.exports = { unlockAccounts, checkLoginAttempts };
