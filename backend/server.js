console.log("SERVER FILE LOADED");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/loginSystem")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({ success: false, message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashed
  });

  await user.save();

  res.json({ success: true });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.json({ success: true });
    }

    res.json({ success: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// TEST
app.get("/test", (req, res) => {
  res.send("REGISTER ROUTE CHECK OK");
});

app.listen(3000, () => {
  console.log("Server running on http://127.0.0.1:3000");
});



mongoose.connect("mongodb://127.0.0.1:27017/loginSystem")