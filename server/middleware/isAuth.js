import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies?.token || bearerToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized (No token provided)." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized (Invalid token)." });
        }

        req.user = decoded;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Error in isAuth middleware:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized (Token verification failed)." });
    }
};
