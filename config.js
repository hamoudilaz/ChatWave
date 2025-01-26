import rateLimit from "express-rate-limit";

const allowedOrigins = [
  "https://hamoudilaz.github.io", // GitHub Pages URL
  "https://chatwave-b0sx.onrender.com", // Render Backend URL
  "http://localhost:3000", // Local development frontend
  "https://dev-jvkh4vhh2aigi4aa.us.auth0.com", // Auth0 for local development
];

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "https://chatwave-b0sx.onrender.com",
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

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

export { allowedOrigins, authConfig, corsOptions, apiLimiter };
