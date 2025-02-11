import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const authenticateUser = async (req, res, next) => {
  try {
    if (req.oidc?.isAuthenticated()) {
      const auth0User = req.oidc.user;

      let user = await User.findOne({ email: auth0User.email });

      if (!user) {
        user = await User.create({
          username: auth0User.nickname || auth0User.name,
          email: auth0User.email,
          provider: "oauth",
        });
      }

      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return next();
    }

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Nice try, No authorization" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification error:", err.message);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in authenticateUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { authenticateUser };
