


import User from "../models/user.model.js";
import { genToken } from "../configs/token.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email, idToken } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Cryptographic token validation with Google OAuth2
        if (idToken) {
            try {
                const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
                if (!verifyRes.ok) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid or expired Google authentication token"
                    });
                }
                const tokenData = await verifyRes.json();
                if (tokenData.email && tokenData.email.toLowerCase() !== normalizedEmail) {
                    return res.status(401).json({
                        success: false,
                        message: "Email does not match authentication token"
                    });
                }
            } catch (tokenErr) {
                console.error("Token verification check error:", tokenErr);
                return res.status(401).json({
                    success: false,
                    message: "Failed to verify authentication token"
                });
            }
        }

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await User.create({
                name: (name || normalizedEmail.split("@")[0]).trim(),
                email: normalizedEmail
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
            user: {
                id: user._id,
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