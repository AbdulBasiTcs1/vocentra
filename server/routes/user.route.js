import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { getCurrentUser, saveAssistant, getPublicAssistant } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser)
userRouter.post("/save-assistant", isAuth, saveAssistant)
userRouter.get("/assistant/:id", getPublicAssistant)
userRouter.get("/public-assistant/:id", getPublicAssistant)

export default userRouter