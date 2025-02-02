import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import xss from "xss";
import { loginLimiter } from "../config.js"; // Import login limiter

const handleLogin = [
  loginLimiter,
  async (req, res, next) => {
    let { usernameInput, passwordInput } = req.body;

    usernameInput = xss(usernameInput);
    passwordInput = xss(passwordInput);

    try {
      const user = await User.findOne({ username: usernameInput });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const isPasswordValid = await bcrypt.compare(
        passwordInput,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        })
        .status(200)
        .json({ message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error logging in." });
    }
  },
];

const handleRegister = async (req, res) => {
  try {
    let { usernameInput, emailInput, passwordInput } = req.body;

    usernameInput = xss(usernameInput);
    emailInput = xss(emailInput);
    passwordInput = xss(passwordInput);

    if (!usernameInput || !emailInput || !passwordInput) {
      return res
        .status(400)
        .json({ message: "Please provide username, email, and password." });
    }

    const existingUserByUsername = await User.findOne({
      username: usernameInput,
    });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const existingUserByEmail = await User.findOne({ email: emailInput });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(passwordInput, 10);

    const newUser = new User({
      username: usernameInput,
      email: emailInput,
      password: hashedPassword,
      role: req.body.role || "user",
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error registering user." });
  }
};

export { handleLogin, handleRegister };
