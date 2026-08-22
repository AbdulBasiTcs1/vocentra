import User from "../models/user.model.js";
import { generateGeminiResponse } from "../configs/gemini.js";

export const getPublicAssistant = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await User.findById(id).select("-geminiApiKey");
        if (!user) {
            return res.status(404).json({ success: false, message: "Assistant not found" });
        }

        return res.status(200).json({
            success: true,
            assistant: {
                assistantName: user.assistantName || "Vocentra",
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
        console.error("[getPublicAssistant] Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

export const chatAssistant = async (req, res) => {
    try {
        const userId = req.params.id || req.body.userId;
        const { message, conversationHistory, currentPageUrl } = req.body;

        // ── 1. Input validation ────────────────────────────────────────────
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        // ── 2. Load user ───────────────────────────────────────────────────
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Assistant not found." });
        }

        // ── 3. Check assistant is active ───────────────────────────────────
        if (!user.geminiApiKey) {
            return res.status(400).json({ success: false, message: "Assistant is not configured yet." });
        }
        if (user.geminiStatus === "inactive") {
            return res.status(400).json({ success: false, message: "Assistant is currently inactive." });
        }

        // ── 4. Check message limit ─────────────────────────────────────────
        const limit = user.requestLimit || 200;
        const total = user.totalMessages || 0;
        if (total >= limit) {
            return res.status(429).json({
                success: false,
                reply: `This assistant has reached its monthly message limit. Please contact ${user.businessName || "the website administrator"}.`,
                limitReached: true,
            });
        }

        // ── 5. Build context variables ─────────────────────────────────────
        const assistantName = user.assistantName || "Vocentra";
        const businessName = user.businessName || "our company";
        const businessType = user.businessType || "Business";
        const businessDescription = user.businessDescription || "We provide quality products and services.";
        const targetAudience = user.targetAudience || "Visitors and customers";
        const tone = user.tone || "friendly";
        const pages = user.pages || [];
        const enableNavigation = user.navigationEnabled ?? user.enableNavigation ?? true;

        // Tone instructions
        let toneInstructions = "Speak warmly, casually, and helpfully with a friendly conversational demeanor.";
        if (tone === "professional") {
            toneInstructions = "Speak professionally, authoritatively, with precision and courtesy.";
        } else if (tone === "sales") {
            toneInstructions = "Speak persuasively, enthusiastically, and highlight benefits to encourage conversions.";
        }

        // Pages list for system prompt
        let pagesInfo = "No specific pages registered.";
        if (pages.length > 0) {
            pagesInfo = pages
                .map(p =>
                    `- "${(p.name || "").trim()}" (path: "${(p.path || "").trim()}", keywords: ${(p.keywords || []).map(k => `"${k.trim()}"`).join(", ") || "none"
                    })`
                )
                .join("\n");
        }

        // Navigation instructions block
        const navigationInstructions = enableNavigation
            ? `Navigation Instructions:
When the user asks to visit, open, view, or navigate to any page, you MUST include a navigation directive at the very end of your reply in this EXACT format:
[NAVIGATE: <exact_path>]
Example: "Sure! Taking you to the pricing page. [NAVIGATE: /pricing]"
Available pages:
${pagesInfo}`
            : "";

        // ── 6. Build system prompt ─────────────────────────────────────────
        const systemPrompt = `You are ${assistantName}, the voice AI assistant for "${businessName}" (${businessType}).
Business: ${businessDescription}
Target Audience: ${targetAudience}
Tone: ${tone} — ${toneInstructions}

STRICT VOICE RULES:
1. Provide a short, direct answer in 1 to 2 complete sentences.
2. ALWAYS finish every sentence and thought completely with proper punctuation. Never leave a sentence unfinished.
3. Answer the query directly with no fluff, long introductions, or filler.
4. Never use markdown, bullet points, headers, or asterisks (plain text only).

${navigationInstructions}

Current visitor page: ${currentPageUrl || "Unknown"}`;

        // ── 7. Call Gemini ─────────────────────────────────────────────────
        let replyText = "";
        let navigateTo = null;

        try {
            replyText = await generateGeminiResponse(
                message.trim(),
                user.geminiApiKey,
                user,
                systemPrompt,
                conversationHistory
            );
        } catch (geminiErr) {
            console.error("[chatAssistant] Gemini error:", geminiErr.message);
            // replyText stays empty — fallback below will handle it
        }

        // ── 8. Fallback if Gemini returned nothing ─────────────────────────
        if (!replyText) {
            const lower = message.toLowerCase().trim();

            // Try keyword-based navigation match first
            if (enableNavigation && pages.length > 0) {
                for (const page of pages) {
                    const rawName = (page.name || "").trim().toLowerCase();
                    const cleanName = rawName.replace(/page$/i, "").trim();
                    const kws = (page.keywords || []).map(k => (k || "").trim().toLowerCase()).filter(Boolean);
                    const nameMatch = rawName && (lower.includes(rawName) || lower.includes(cleanName));
                    const kwMatch = kws.some(k => lower.includes(k));

                    if (nameMatch || kwMatch) {
                        replyText = `Sure! Taking you to the ${page.name.trim()} page. [NAVIGATE: ${page.path.trim()}]`;
                        break;
                    }
                }
            }

            // Generic fallback replies
            if (!replyText) {
                if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
                    replyText = `Hi! I'm ${assistantName} for ${businessName}. How can I help?`;
                } else if (lower.includes("who are you") || lower.includes("what do you do")) {
                    replyText = `I'm ${assistantName}, voice assistant for ${businessName}.`;
                } else if (lower.includes("help") || lower.includes("contact") || lower.includes("support")) {
                    replyText = `I'm here to help! Ask me anything about ${businessName}.`;
                } else {
                    replyText = `I'm ${assistantName}. How can I assist you today?`;
                }
            }
        }

        // ── 9. Extract [NAVIGATE: path] directive from reply ───────────────
        const navMatch = replyText.match(/\[NAVIGATE:\s*([^\]]+)\]/i);
        if (navMatch) {
            navigateTo = navMatch[1].trim();
            replyText = replyText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, "").trim();
        }

        // ── 10. Increment message count and save ───────────────────────────
        user.totalMessages = (user.totalMessages || 0) + 1;
        await user.save();

        // ── 11. Return response ────────────────────────────────────────────
        return res.status(200).json({
            success: true,
            reply: replyText,
            navigateTo: navigateTo,
            totalMessages: user.totalMessages,
            messagesLeft: Math.max(0, limit - user.totalMessages),
        });

    } catch (error) {
        console.error("[chatAssistant] Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};
