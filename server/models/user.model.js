import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
    name: String,
    path: String,
    keywords: {
        type: [String],
        default: [],
    },
},
    { _id: false }

)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    assistantName: {
        type: String,
        default: "Vocentra AI"
    },
    businessName: {
        type: String,
        default: ""
    },
    businessType: {
        type: String,
        default: ""
    },
    businessDescription: {
        type: String,
        default: ""
    },
    tone: {
        type: String,
        enum: ["professional", "friendly", "sales"],
        default: "friendly"
    },
    theme: {
        type: String,
        enum: ["light", "glass", "dark", "neon"],
        default: "dark"
    },
    enableVoice: {
        type: Boolean,
        default: true
    },
    pages: {
        type: [pageSchema],
        default: [],
    },
    enableNavigation: {
        type: Boolean,
        default: true
    },
    geminiApiKey: {
        type: String,
        default: ""
    },
    geminiStatus: {
        type: String,
        enum: [
            "active",
            "quota_exceeded",
            "invalid",
        ],
        default: "active"
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    plan: {
        type: String,
        enum: [
            "free",
            "pro",
        ],
        default: "free"
    },
    requestLimit: {
        type: Number,
        default: 200,
    },
    proExpiresAt: {
        type: Date,
        default: null,
    },
    isSetupComplete: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
