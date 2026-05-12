console.log("SERVER LOADED - CHECKING ROUTES");
console.log("RUNNING FILE:", __filename);
console.log("SERVER FILE LOADED");


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/loginSystem")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// USER SCHEMA
const userSchema = new mongoose.Schema({
  email: String,
  password: String,

  savedRoutes: [
    {
      title: String,
      location: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const User = mongoose.model("User", userSchema);


// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed
    });

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (isMatch) {
      return res.json({ success: true });
    }

    res.json({ success: false });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});


// ================= RESET PASSWORD =================




// ================= TEST =================
app.get("/route-check", (req, res) => {
  console.log("ROUTE CHECK HIT");
  res.json({
    routes: [
      "/register",
      "/login",
      "/reset",
      "/test"
    ]
  });
});

// ================= RESET PASSWORD =================
app.post("/reset", async (req, res) => {
  try {
    console.log("🔥 RESET ROUTE HIT");

    const { email, newPassword } = req.body;

    // CHECK INPUTS
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    // HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // UPDATE PASSWORD
    user.password = hashedPassword;

    await user.save();

    return res.json({
      success: true,
      message: "Password updated"
    });

  } catch (err) {
    console.error("RESET ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});



// ================= START SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://127.0.0.1:3000");
});