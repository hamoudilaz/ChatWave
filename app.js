import express from "express";
import router from "./routes/route.js";
import cookieParser from "cookie-parser";

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Parse cookies before routes
app.use(cookieParser());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static("docs"));

// Use router after middleware
app.use("/", router);

export default app;
