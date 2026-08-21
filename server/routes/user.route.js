import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { getCurrentUser, saveAssistant, getPublicAssistant, chatAssistant } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser)
userRouter.post("/save-assistant", isAuth, saveAssistant)
userRouter.get("/assistant/:id", getPublicAssistant)
userRouter.get("/public-assistant/:id", getPublicAssistant)
userRouter.post("/assistant/:id/chat", chatAssistant)
userRouter.post("/chat", chatAssistant)

export default userRouter