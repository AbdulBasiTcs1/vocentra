import express from "express";
import { googleAuth, logOut } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/google", authRateLimiter, googleAuth);
router.get("/logout", logOut);

export default router;