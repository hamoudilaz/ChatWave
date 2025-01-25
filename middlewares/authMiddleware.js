import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    req.user = user; // Attach user data to the request
    next();
  });
};

export { authenticateUser };
