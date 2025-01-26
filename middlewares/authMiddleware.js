import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js"; // Import your User model

dotenv.config();

const authenticateUser = async (req, res, next) => {
  try {
    // Check if the user is authenticated via Auth0
    if (req.oidc?.isAuthenticated()) {
      const auth0User = req.oidc.user;

      // Find the user in your database using their email
      let user = await User.findOne({ email: auth0User.email });

      // If the user doesn't exist, create a new one
      if (!user) {
        user = await User.create({
          username: auth0User.nickname || auth0User.name,
          email: auth0User.email,
          provider: "oauth", // Optional: Track that this user is from Auth0
        });
      }

      // Attach the database user data to req.user
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return next();
    }

    // Fallback to JWT token validation
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification error:", err.message);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      req.user = user; // Attach JWT user data to req.user
      next();
    });
  } catch (error) {
    console.error("Error in authenticateUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { authenticateUser };
