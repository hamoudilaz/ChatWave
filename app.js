import express from "express";
import router from "./routes/route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config, corsOptions, helmetConfig } from "./config.js";
import { auth } from "express-openid-connect";
import helmet from "helmet";

const app = express();

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(express.json());
app.use(auth(config));
app.use(cookieParser());
app.use(express.static("docs"));
app.use("/", router);

export default app;
