import express from "express";
import router from "./routes/route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import pkg from "express-openid-connect";

const { auth, requiresAuth } = pkg;

const allowedOrigins = [
  "http://localhost:3000",
  "https://hamoudilaz.github.io",
  "https://chatwave.se",
  "https://www.chatwave.se", // ✅ Add www version
  "https://dev-jvkh4vhh2aigi4aa.us.auth0.com",
];

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "https://chatwave.se",
  clientID: "xia9JvjYsRl5URhTtaTzMbvJ0xS7L7WA",
  issuerBaseURL: "https://dev-jvkh4vhh2aigi4aa.us.auth0.com",
};

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming Origin:", origin); // Log the origin for debugging
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials (cookies, etc.)
};

const app = express();
app.use(auth(config));
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
