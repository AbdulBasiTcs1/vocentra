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

export const saveAssistant = async (req, res) => {
    try {
        const {
            assistantName,
            businessName,
            businessType,
            businessDescription,
            targetAudience,
            tone,
            theme,
            voiceEnabled,
            navigationEnabled,
            geminiApiKey,
            pages,
        } = req.body;

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        user.assistantName = assistantName;
        user.businessName = businessName;
        user.businessType = businessType;
        user.businessDescription = businessDescription;
        user.targetAudience = targetAudience;
        user.tone = tone;
        user.theme = theme;
        user.voiceEnabled = voiceEnabled;
        user.navigationEnabled = navigationEnabled;
        user.pages = pages || [];

        if (geminiApiKey) {
            user.geminiApiKey = geminiApiKey;
        }

        user.geminiStatus = user.geminiApiKey ? "active" : "inactive";
        user.isSetupComplete = true;

        await user.save();

        return res.status(200).json({ success: true, message: "Assistant saved successfully.",user });
    } catch (error) {
        console.error("Error in saveAssistant controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const getPublicAssistant = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await User.findById(id).select(
            "assistantName businessName businessType businessDescription tone theme enableVoice voiceEnabled enableNavigation navigationEnabled pages"
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "Assistant not found" });
        }

        return res.status(200).json({
            success: true,
            assistant: {
                assistantName: user.assistantName || "Vocentra AI",
                businessName: user.businessName || "",
                businessType: user.businessType || "",
                businessDescription: user.businessDescription || "",
                tone: user.tone || "friendly",
                theme: user.theme || "dark",
                voiceEnabled: user.voiceEnabled ?? user.enableVoice ?? true,
                navigationEnabled: user.navigationEnabled ?? user.enableNavigation ?? true,
                pages: user.pages || [],
            }
        });
    } catch (error) {
        console.error("Error in getPublicAssistant controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};