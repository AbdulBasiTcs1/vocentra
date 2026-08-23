import express from "express";
import { getPublicAssistant, chatAssistant } from "../controllers/assistant.controller.js";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

const assistantRouter = express.Router();

assistantRouter.get("/:id", getPublicAssistant);
assistantRouter.post("/:id/chat", chatRateLimiter, chatAssistant);
assistantRouter.post("/chat", chatRateLimiter, chatAssistant);

export default assistantRouter;
