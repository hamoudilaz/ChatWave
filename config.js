import rateLimit from "express-rate-limit";

const allowedOrigins = [
  "http://localhost:3000",
  "https://chatwave.se",
  "https://www.chatwave.se",
  "https://dev-jvkh4vhh2aigi4aa.us.auth0.com",
];

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: "https://chatwave.se",
  clientID: "xia9JvjYsRl5URhTtaTzMbvJ0xS7L7WA",
  issuerBaseURL: "https://dev-jvkh4vhh2aigi4aa.us.auth0.com",
};

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS Request Origin:", origin);

    if (!origin || allowedOrigins.includes(origin) || origin === "null") {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Try again in 5 minutes." },
  keyGenerator: (req) => req.body.usernameInput || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'",
      ],
      styleSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'",
      ],
      imgSrc: ["'self'", "data:", "https://your-image-cdn.com"],
    },
  },
};

export { allowedOrigins, config, corsOptions, loginLimiter, helmetConfig };
