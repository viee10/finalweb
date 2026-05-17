console.log("🔥 SERVER STARTING");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

/* =========================
   REQUEST LOGGER
========================= */
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

/* =========================
   DATABASE
========================= */
mongoose.connect("mongodb://127.0.0.1:27017/loginSystem")
  .then(() => console.log("MongoDB OK"))
  .catch(err => console.log("MongoDB ERROR:", err));

/* =========================
   MODELS
========================= */
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String
}));

const Report = mongoose.model("Report", new mongoose.Schema({
  reporter: String,
  area: String,
  description: String,
  reportType: String,
  fareType: String,
  fare: String,
  time: Number,
  likes: { type: Number, default: 0 },
  vouches: { type: Number, default: 0 },
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    text: String
  }]
}));

/* =========================
   REGISTER (HASH PASSWORD)
========================= */
app.post("/register", async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new User({
      email,
      password: hashedPassword
    }).save();

    res.json({ success: true, message: "Registered successfully" });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Register failed" });
  }
});

/* =========================
   LOGIN (COMPARE PASSWORD)
========================= */
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    console.log("LOGIN ATTEMPT:", email);

    if (!email || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    res.json({ success: true, message: "Login successful" });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Login error" });
  }
});

/* =========================
   TEST ROUTE
========================= */
app.get("/test", (req, res) => {
  res.send("TEST OK WORKING");
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("http://127.0.0.1:3000");
});