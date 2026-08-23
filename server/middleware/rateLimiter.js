import rateLimit from "express-rate-limit";

// Rate limiter for public chat endpoints (40 requests per minute per IP)
export const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 40,
    message: {
        success: false,
        reply: "You are sending messages too quickly. Please wait a moment before trying again.",
        message: "Too many requests from this IP, please try again in a minute."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for auth endpoints (15 attempts per 15 minutes per IP)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
        success: false,
        message: "Too many authentication requests, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
