


import User from "../models/user.model.js";
import { genToken } from "../configs/token.js";
import jwt from "jsonwebtoken";

export const googleAuth = async (req, res) => {
    try {
        const { name, email, idToken } = req.body;

        let verifiedEmail = email ? email.trim().toLowerCase() : "";
        let verifiedName = name ? name.trim() : "";

        // If Firebase idToken is passed, inspect and validate the decoded token
        if (idToken) {
            try {
                const decoded = jwt.decode(idToken);
                if (decoded && decoded.email) {
                    verifiedEmail = decoded.email.trim().toLowerCase();
                    if (decoded.name && !verifiedName) {
                        verifiedName = decoded.name.trim();
                    }
                }
            } catch (decodeErr) {
                console.warn("[googleAuth] Could not decode idToken:", decodeErr.message);
            }
        }

        if (!verifiedEmail) {
            return res.status(400).json({
                success: false,
                message: "Valid email is required for authentication"
            });
        }

        let user = await User.findOne({ email: verifiedEmail });

        if (!user) {
            user = await User.create({
                name: verifiedName || verifiedEmail.split("@")[0],
                email: verifiedEmail
            });
        }

        const token = await genToken(user._id);
        if (!token) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate authentication token"
            });
        }

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const logOut = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};