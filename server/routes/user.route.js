import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { getCurrentUser, saveAssistant, getPublicAssistant, chatAssistant } from "../controllers/user.controller.js";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post("/save-assistant", isAuth, saveAssistant);
userRouter.get("/assistant/:id", getPublicAssistant);
userRouter.get("/public-assistant/:id", getPublicAssistant);
userRouter.post("/assistant/:id/chat", chatRateLimiter, chatAssistant);
userRouter.post("/chat", chatRateLimiter, chatAssistant);

export default userRouter;