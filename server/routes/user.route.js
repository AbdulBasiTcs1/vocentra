import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { getCurrentUser, saveAssistant } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser)
userRouter.post("/save-assistant", isAuth, saveAssistant)

export default userRouter