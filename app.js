import express from "express";
import router from "./routes/route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const allowedOrigins = [
  "https://hamoudilaz.github.io", // GitHub Pages URL
  "https://chatwave-b0sx.onrender.com", // Render Backend URL (if needed for frontend-backend communication)
  "http://localhost:3000", // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from allowed origins or no origin (e.g., Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials (cookies, etc.)
};

app.use(cors(corsOptions));
// Parse JSON request bodies
app.use(express.json());

// Parse cookies before routes
app.use(cookieParser());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static("docs"));

// Use router after middleware
app.use("/", router);

export default app;
