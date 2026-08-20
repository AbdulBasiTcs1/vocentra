import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/connectDB.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use((req, res, next) => {
    if (
        req.path.startsWith("/assistant") ||
        req.path.startsWith("/logo") ||
        req.path.startsWith("/api/user/assistant") ||
        req.path.startsWith("/api/user/public-assistant")
    ) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }
    }
    next();
});

app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

// Serve static assets (assistant.js, assistant.css, logo.png, etc.) with open CORS for widget embeds
const clientPublicPath = path.join(__dirname, "../client/public");
app.use(express.static(clientPublicPath, {
    setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
    }
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Vocentra API is running");
});

app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRouter);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});