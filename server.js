const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const users = []; // In-memory DB
const JWT_SECRET = "yourjwtsecretkeyyyy";

app.get("/",(req,res)=>{
    res.send("Welcome to the Authentication Server");
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password) {
    return res.json({ msg: "Email and Password are required" });
  }

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.json({ msg: "Email already registered" });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  users.push({ name, email, password: hashedPass });

  res.json({ msg: "User registered successfully" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ msg: "Invalid credentials" });
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ msg: "Login successful", token });
});

// PROTECTED ROUTE
app.get("/profile", (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    res.json({ msg: "Profile data", email: decoded.email });
  } catch {
    res.json({ msg: "Invalid token" });
  }
});

app.listen(5009,() =>
  console.log("Server running at http://localhost:5009")
);
