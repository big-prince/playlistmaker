const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const expressLimit = require("express-rate-limit");

//http server
const app = express();
const server = http.createServer(app);

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
dotenv.config({ path: "config.env" });
app.use(express.static("public"));
//setup view engine
app.set("view engine", "ejs");
app.set("views", "views");
//setup session
sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);
//setup cookie
app.use(
  cookieParser(process.env.SESSION_SECRET, {
    maxAge: 3600000,
    httpOnly: true,
    secure: false,
    sameSite: true,
  })
);
expressLimit({
  windowsMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(expressLimit());

//setup routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);
//conncet to db
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {});
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};

const port = 5000 || process.env.PORT;
server.listen(port, () => {
  connectDB();
  console.log(`Server running on port ${port}`);
});
