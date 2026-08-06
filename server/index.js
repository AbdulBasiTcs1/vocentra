import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/connectDB.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/auth.routes.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use("/api/auth",AuthRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});