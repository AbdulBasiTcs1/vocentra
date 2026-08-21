import express from "express";
import { getPublicAssistant, chatAssistant } from "../controllers/assistant.controller.js";

const assistantRouter = express.Router();

assistantRouter.get("/:id", getPublicAssistant);
assistantRouter.post("/:id/chat", chatAssistant);
assistantRouter.post("/chat", chatAssistant);

export default assistantRouter;
