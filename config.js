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
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 login attempts per IP
  message: { message: "Too many login attempts. Try again in 5 minutes." },
  standardHeaders: true, // Include rate limit headers
  legacyHeaders: false, // Disable old headers
});

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'", // Optional if you use inline scripts
      ],
      styleSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com", // ✅ Allow Cloudflare for styles
        "https://cdn.jsdelivr.net", // ✅ Allow jsDelivr
        "'unsafe-inline'", // Needed if inline styles are used
      ],
      imgSrc: ["'self'", "data:", "https://your-image-cdn.com"], // Adjust as needed
    },
  },
};

export { allowedOrigins, config, corsOptions, loginLimiter, helmetConfig };
