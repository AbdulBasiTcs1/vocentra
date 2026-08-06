import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"

const router = express.Router()
const PORT = process.env.PORT;

router.post("/google", googleAuth)
router.get("/logout", logOut)

export default router