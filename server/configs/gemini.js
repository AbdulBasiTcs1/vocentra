const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

/**
 * Calls the Gemini API and returns the generated text.
 *
 * @param {string}   prompt              - The current user message.
 * @param {string}   apiKey              - The user's Gemini API key.
 * @param {object}   user                - Mongoose user document (status is persisted here).
 * @param {string}   [systemPrompt]      - Optional system instruction for the model.
 * @param {Array}    [conversationHistory] - Prior turns: [{ role, text }]
 * @returns {Promise<string>}            - The AI-generated reply text.
 */
export const generateGeminiResponse = async (
    prompt,
    apiKey,
    user,
    systemPrompt = "",
    conversationHistory = []
) => {
    if (!apiKey) {
        throw new Error("Gemini API Key is required");
    }

    // Build contents array from conversation history + current message
    const contents = [];
    if (Array.isArray(conversationHistory)) {
        for (const turn of conversationHistory.slice(-6)) {
            if (turn.role && turn.text) {
                contents.push({
                    role: turn.role === "assistant" ? "model" : "user",
                    parts: [{ text: turn.text }],
                });
            }
        }
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const requestBody = {
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
        },
    };

    if (systemPrompt) {
        requestBody.systemInstruction = {
            parts: [{ text: systemPrompt }],
        };
    }

    let response;
    try {
        response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
    } catch (networkError) {
        console.error("[Gemini] Network error:", networkError);
        user.geminiStatus = "error";
        await user.save();
        throw new Error("Gemini API network error");
    }

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error("[Gemini] API error response:", errBody);

        if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
            user.geminiStatus = "invalid";
            await user.save();
            throw new Error("Gemini API Key is invalid or model not accessible");
        }

        if (response.status === 429) {
            user.geminiStatus = "quota_exceeded";
            await user.save();
            throw new Error("Gemini API Key quota exceeded");
        }

        // For all other errors, keep current status — don't write an invalid enum value
        throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        // Don't write invalid enum — just throw, status unchanged
        throw new Error("Gemini returned an empty response");
    }

    user.geminiStatus = "active";
    await user.save();
    return text;
};