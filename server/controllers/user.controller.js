import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId || req.user?.userId || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const user = await User.findById(userId).select("-__v");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error in getCurrentUser controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};