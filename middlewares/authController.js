import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Adjust path as needed
import xss from "xss";

const loginAttempts = {};
const ATTEMPT_LIMIT = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

const handleLogin = async (req, res, next) => {
  const { usernameInput, passwordInput } = req.body;

  try {
    // Check if the user is locked out
    if (
      loginAttempts[usernameInput] &&
      loginAttempts[usernameInput].lockoutUntil > Date.now()
    ) {
      const remainingTime = Math.ceil(
        (loginAttempts[usernameInput].lockoutUntil - Date.now()) / 1000 / 60
      );
      return res.status(429).json({
        message: `Too many failed attempts. Please wait ${remainingTime} minutes.`,
      });
    }

    // Find the user in the database
    const user = await User.findOne({ username: usernameInput });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
    if (!isPasswordValid) {
      loginAttempts[usernameInput] = loginAttempts[usernameInput] || {
        count: 0,
      };
      loginAttempts[usernameInput].count++;

      if (loginAttempts[usernameInput].count >= ATTEMPT_LIMIT) {
        loginAttempts[usernameInput].lockoutUntil =
          Date.now() + LOCKOUT_DURATION;
        return res.status(429).json({
          message: "Too many failed attempts. Please wait 5 minutes.",
        });
      }

      return res.status(401).json({ message: "Invalid password." });
    }

    // Reset attempts on successful login
    if (loginAttempts[usernameInput]) {
      delete loginAttempts[usernameInput];
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, // Include role in token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in." });
  }
};

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

    // Check for existing username
    const existingUserByUsername = await User.findOne({
      username: usernameInput,
    });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Check for existing email
    const existingUserByEmail = await User.findOne({ email: emailInput });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(passwordInput, 10);

    // Create and save the new user
    const newUser = new User({
      username: usernameInput,
      email: emailInput,
      password: hashedPassword,
      role: req.body.role || "user", // Allow role assignment or default to "user"
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error registering user." });
  }
};

export { handleLogin, handleRegister };
