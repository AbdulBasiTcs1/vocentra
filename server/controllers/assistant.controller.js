import User from "../models/user.model.js";

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
        console.error("Error in getPublicAssistant controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};


export const chatAssistant = async (req, res) => {
    try {
        const userId = req.params.id || req.body.userId;
        const { message, conversationHistory, currentPageUrl } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Assistant not found." });
        }

        // Check request limit
        const limit = user.requestLimit || 200;
        const total = user.totalMessages || 0;
        if (total >= limit) {
            return res.status(429).json({
                success: false,
                reply: `This assistant has reached its monthly message limit. Please contact ${user.businessName || "the website administrator"}.`,
                limitReached: true
            });
        }

        const assistantName = user.assistantName || "Vocentra";
        const businessName = user.businessName || "our company";
        const businessType = user.businessType || "Business";
        const businessDescription = user.businessDescription || "We provide quality products and services.";
        const targetAudience = user.targetAudience || "Visitors and customers";
        const tone = user.tone || "friendly";
        const pages = user.pages || [];
        const enableNavigation = user.enableNavigation ?? user.navigationEnabled ?? true;

        let toneInstructions = "Be polite, helpful, and concise.";
        if (tone === "professional") {
            toneInstructions = "Speak professionally, authoritatively, with precision and courtesy. Keep answers succinct.";
        } else if (tone === "sales") {
            toneInstructions = "Speak persuasively, enthusiastically, and highlight benefits to encourage conversions.";
        } else {
            toneInstructions = "Speak warmly, casually, and helpfully with a friendly conversational demeanor.";
        }

        let pagesInfo = "No specific pages registered.";
        if (pages.length > 0) {
            pagesInfo = pages.map(p => `- Page "${(p.name || "").trim()}" (Path: "${(p.path || "").trim()}", Keywords: ${(p.keywords || []).map(k => `"${k.trim()}"`).join(", ") || "none"})`).join("\n");
        }

        const systemPrompt = `You are ${assistantName}, the voice AI assistant for "${businessName}" (${businessType}).
Business Context & Description: ${businessDescription}
Target Audience: ${targetAudience}
Tone: ${tone} (${toneInstructions})

Voice output constraint: Speak in short, clear natural sentences suitable for text-to-speech audio. Keep answers under 2-3 sentences. Do NOT use markdown asterisks or lists.

Available Website Pages:
${pagesInfo}

${enableNavigation ? `Navigation Instructions:
When the user asks to visit, open, view, or navigate to any page matching the registered pages (or asks questions like "take me to builder", "open pricing", "how to login", etc.), you MUST include a navigation directive at the very end of your reply on a new line in this EXACT format:
[NAVIGATE: <exact_path>]
Example: "Sure! Let me take you to the builder page. [NAVIGATE: /builder]"` : ""}

Current visitor page: ${currentPageUrl || "Unknown"}`;

        let replyText = "";
        let navigateTo = null;

        // If Gemini API Key is configured on the user
        if (user.geminiApiKey) {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(user.geminiApiKey)}`;

                const contents = [];
                if (Array.isArray(conversationHistory)) {
                    for (const turn of conversationHistory.slice(-6)) {
                        if (turn.role && turn.text) {
                            contents.push({
                                role: turn.role === "assistant" ? "model" : "user",
                                parts: [{ text: turn.text }]
                            });
                        }
                    }
                }

                contents.push({
                    role: "user",
                    parts: [{ text: message }]
                });

                const response = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        contents: contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 250
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    user.geminiStatus = "active";
                } else {
                    const errData = await response.json().catch(() => ({}));
                    console.error("Gemini API Error:", errData);
                    if (response.status === 400 || response.status === 403) {
                        user.geminiStatus = "invalid";
                    } else if (response.status === 429) {
                        user.geminiStatus = "quota_exceeded";
                    }
                }
            } catch (geminiErr) {
                console.error("Error contacting Gemini API:", geminiErr);
            }
        }

        // Fallback intelligent response if Gemini is not connected or returned empty
        if (!replyText) {
            const lower = message.toLowerCase().trim();

            // Intelligent Page Navigation Detection
            if (enableNavigation && pages.length > 0) {
                for (const page of pages) {
                    const rawName = (page.name || "").trim().toLowerCase();
                    const cleanName = rawName.replace(/page$/i, "").trim();
                    const kws = (page.keywords || []).map(k => (k || "").trim().toLowerCase()).filter(Boolean);
                    
                    const nameMatch = rawName && (lower.includes(rawName) || lower.includes(cleanName));
                    const kwMatch = kws.some(k => lower.includes(k) || k.split(" ").some(word => word.length > 3 && lower.includes(word)));

                    if (nameMatch || kwMatch) {
                        replyText = `Sure! Navigating you to the ${page.name.trim()} page. [NAVIGATE: ${page.path.trim()}]`;
                        break;
                    }
                }
            }

            if (!replyText) {
                if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
                    replyText = `Hello! I'm ${assistantName} for ${businessName}. How can I assist you with our services today?`;
                } else if (lower.includes("who are you") || lower.includes("what is this") || lower.includes("what do you do")) {
                    replyText = `I am ${assistantName}, the AI assistant for ${businessName}. ${businessDescription}`;
                } else if (lower.includes("help") || lower.includes("contact") || lower.includes("support")) {
                    replyText = `We are here to help! ${businessDescription} Feel free to ask any questions or explore our website.`;
                } else {
                    replyText = `At ${businessName}, ${businessDescription} How can I help you today?`;
                }
            }
        }

        // Extract [NAVIGATE: path]
        const navMatch = replyText.match(/\[NAVIGATE:\s*([^\]]+)\]/i);
        if (navMatch) {
            navigateTo = navMatch[1].trim();
            replyText = replyText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, "").trim();
        }

        // Increment message count
        user.totalMessages = (user.totalMessages || 0) + 1;
        await user.save();

        return res.status(200).json({
            success: true,
            reply: replyText,
            navigateTo: navigateTo,
            totalMessages: user.totalMessages,
            messagesLeft: Math.max(0, limit - user.totalMessages)
        });

    } catch (error) {
        console.error("Error in chatAssistant controller:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};
