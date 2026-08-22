const CANDIDATE_ENDPOINTS = [
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
];

/**
 * Calls the Gemini API with automatic model fallback and returns the generated text.
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
        for (const turn of conversationHistory.slice(-8)) {
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
            maxOutputTokens: 400,
        },
    };

    if (systemPrompt) {
        requestBody.systemInstruction = {
            parts: [{ text: systemPrompt }],
        };
    }

    let lastError = null;

    // Try candidate endpoints sequentially until one succeeds
    for (const endpoint of CANDIDATE_ENDPOINTS) {
        try {
            const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    user.geminiStatus = "active";
                    await user.save();
                    return text;
                }
            }

            const errBody = await response.json().catch(() => ({}));
            console.warn(`[Gemini] Endpoint ${endpoint} returned status ${response.status}:`, errBody?.error?.message || response.statusText);

            // If 404 (model not found on this endpoint/version), try next model candidate
            if (response.status === 404) {
                lastError = new Error(`Model not found on ${endpoint}`);
                continue;
            }

            if (response.status === 400 || response.status === 401 || response.status === 403) {
                user.geminiStatus = "invalid";
                await user.save();
                throw new Error("Gemini API Key is invalid or not authorized");
            }

            if (response.status === 429) {
                user.geminiStatus = "quota_exceeded";
                await user.save();
                throw new Error("Gemini API Key quota exceeded");
            }

            lastError = new Error(`Gemini API error: ${response.statusText}`);
        } catch (err) {
            if (err.message.includes("invalid") || err.message.includes("quota")) {
                throw err;
            }
            lastError = err;
        }
    }

    // If all endpoints failed
    user.geminiStatus = "error";
    await user.save();
    throw lastError || new Error("Failed to generate response from Gemini API");
};