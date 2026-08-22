(function () {
    if (window.__VOCENTRA_ASSISTANT_INITIALIZED__) {
        return;
    }
    window.__VOCENTRA_ASSISTANT_INITIALIZED__ = true;

    // ─── Detect Script & User ID ──────────────────────────────────────────────
    let script = document.currentScript;
    if (!script) {
        script = document.querySelector('script[data-user-id]') ||
            document.querySelector('script[src*="assistant.js"]');
    }

    let userId = script?.dataset?.userId ||
        script?.getAttribute("data-user-id") ||
        script?.getAttribute("data-userid");

    let baseUrl = "";
    if (script?.src) {
        try {
            const parsedUrl = new URL(script.src, window.location.href);
            baseUrl = parsedUrl.origin;
            if (!userId) {
                userId = parsedUrl.searchParams.get("userId") || parsedUrl.searchParams.get("data-user-id");
            }
        } catch (e) {
            console.error("[Vocentra] Failed to parse script URL:", e);
        }
    }

    if (!baseUrl) {
        baseUrl = window.location.origin;
    }

    // ─── Inject Stylesheet ───────────────────────────────────────────────────
    const cssUrl = `${baseUrl}/assistant.css`;
    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    // ─── Themes Configuration ────────────────────────────────────────────────
    const THEMES = {
        dark: {
            pageBg: "radial-gradient(80% 60% at 50% 0%, #1a1630 0%, #0c0c14 40%, #000000 100%)",
            cardBg: "linear-gradient(180deg, #16122b 0%, #0d0d18 50%, #08080f 100%)",
            orb: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #6366f1 100%)",
            cardBorder: "rgba(255,255,255,0.08)",
            text: "#f8fafc",
            sub: "#94a3b8",
            listening: "#2dd4bf",
            thinking: "#f59e0b",
            speaking: "#818cf8",
            wave: "#2dd4bf",
            button: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
            micGlow: "rgba(124, 58, 237, 0.5)",
            shadow: "0 32px 64px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        },
        light: {
            pageBg: "radial-gradient(80% 60% at 50% 0%, #f0f4f8 0%, #e2e8f0 40%, #f8fafc 100%)",
            cardBg: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
            orb: "linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #818cf8 100%)",
            cardBorder: "rgba(0,0,0,0.06)",
            text: "#0f172a",
            sub: "#64748b",
            listening: "#0891b2",
            thinking: "#d97706",
            speaking: "#4f46e5",
            wave: "#3b82f6",
            button: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            micGlow: "rgba(59, 130, 246, 0.4)",
            shadow: "0 32px 64px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        },
        glass: {
            pageBg: "radial-gradient(80% 60% at 50% 0%, #1e293b 0%, #0f172a 40%, #020617 100%)",
            cardBg: "rgba(255, 255, 255, 0.055)",
            orb: "linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fb7185 100%)",
            cardBorder: "rgba(255,255,255,0.15)",
            text: "#f8fafc",
            sub: "#cbd5e1",
            listening: "#a5b4fc",
            thinking: "#fbbf24",
            speaking: "#c084fc",
            wave: "#a5b4fc",
            button: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
            micGlow: "rgba(167, 139, 250, 0.5)",
            shadow: "0 32px 64px -12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
        },
        neon: {
            pageBg: "radial-gradient(80% 60% at 50% 0%, #064e3b 0%, #022c22 40%, #000000 100%)",
            cardBg: "linear-gradient(180deg, rgba(6,78,59,0.25) 0%, rgba(2,44,34,0.4) 50%, rgba(0,0,0,0.85) 100%)",
            orb: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #059669 100%)",
            cardBorder: "rgba(16, 185, 129, 0.25)",
            text: "#ecfdf5",
            sub: "#6ee7b7",
            listening: "#34d399",
            thinking: "#fbbf24",
            speaking: "#a78bfa",
            wave: "#34d399",
            button: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            micGlow: "rgba(16, 185, 129, 0.6)",
            shadow: "0 32px 64px -12px rgba(0,0,0,0.7), 0 0 24px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
        },
    };

    const WAVE_BARS = [0.35, 0.8, 0.55, 0.95, 0.45, 0.75, 0.5, 0.9, 0.4, 0.7, 0.85, 0.5, 0.65, 0.4, 0.8, 0.55, 0.95, 0.45, 0.7, 0.6];

    const MIC_SVG_ICON = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    `;

    // ─── Assistant State ─────────────────────────────────────────────────────
    const STATE = {
        IDLE: "idle",
        LISTENING: "listening",
        THINKING: "thinking",
        SPEAKING: "speaking",
    };

    const STATE_LABELS = {
        idle: "Tap mic to speak",
        listening: "Listening...",
        thinking: "Thinking...",
        speaking: "AI Speaking...",
    };

    let assistantData = {
        assistantName: "Vocentra",
        businessName: "",
        businessType: "",
        businessDescription: "",
        tone: "friendly",
        theme: "dark",
        voiceEnabled: true,
        navigationEnabled: true,
        pages: []
    };

    let currentState = STATE.IDLE;
    let currentTheme = "dark";
    let isOpen = false;
    let recognition = null;
    let conversationHistory = [];
    let currentUtterance = null;

    // ─── DOM Generation ──────────────────────────────────────────────────────
    function createWidgetDOM() {
        const container = document.createElement("div");
        container.id = "vocentra-widget-container";

        container.innerHTML = `
            <!-- Popup Modal Preview Card -->
            <div class="vocentra-popup ${currentTheme === 'glass' ? 'vocentra-popup--glass' : ''}" id="vocentra-popup-card">
                <!-- Close Button -->
                <button type="button" class="vocentra-close-btn" id="vocentra-close-btn" aria-label="Close Assistant">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <!-- Gradient Orb -->
                <div class="vocentra-orb-wrap">
                    <div class="vocentra-orb" id="vocentra-orb"></div>
                    <div class="vocentra-orb-glow" id="vocentra-orb-glow"></div>
                </div>

                <!-- Title & short subtitle -->
                <h2 class="vocentra-title" id="vocentra-title"></h2>
                <p class="vocentra-sub" id="vocentra-sub"></p>

                <!-- Status line: Listening / Thinking / AI Speaking / Tap mic to speak -->
                <div class="vocentra-listening" id="vocentra-status">Tap mic to speak</div>

                <!-- Spoken transcript / live response -->
                <div class="vocentra-transcript" id="vocentra-transcript"></div>

                <!-- Waveform -->
                <div class="vocentra-waveform" id="vocentra-waveform">
                    ${WAVE_BARS.map((h, i) => `
                        <span class="vocentra-wave-bar idle" style="height: ${10 + h * 28}px; animation-delay: ${i * 0.06}s;"></span>
                    `).join("")}
                </div>

                <!-- Mic Button -->
                <div class="vocentra-mic-wrap">
                    <div class="vocentra-mic-glow" id="vocentra-mic-glow"></div>
                    <button type="button" class="vocentra-mic-btn" id="vocentra-mic-btn" aria-label="Start voice input">
                        ${MIC_SVG_ICON}
                    </button>
                </div>
            </div>

            <!-- Floating Launcher Bubble -->
            <div class="vocentra-launcher-wrap">
                <div class="vocentra-launcher-badge" id="vocentra-launcher-badge"></div>
                <button type="button" class="vocentra-launcher-btn" id="vocentra-launcher-btn" aria-label="Open Voice Assistant">
                    <div class="vocentra-launcher-glow" id="vocentra-launcher-glow"></div>
                    <span class="vocentra-launcher-mic-icon">${MIC_SVG_ICON}</span>
                    <svg class="vocentra-launcher-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(container);
        setupEventListeners(container);
    }

    // ─── State Management & UI Synchronization ───────────────────────────────
    function setState(state) {
        currentState = state;

        const statusEl = document.getElementById("vocentra-status");
        const transcriptEl = document.getElementById("vocentra-transcript");
        const micBtn = document.getElementById("vocentra-mic-btn");
        const waveBars = document.querySelectorAll(".vocentra-wave-bar");
        const orb = document.getElementById("vocentra-orb");
        const orbGlow = document.getElementById("vocentra-orb-glow");
        const t = THEMES[currentTheme] || THEMES.dark;

        // 1. Update status text
        if (statusEl) {
            statusEl.textContent = STATE_LABELS[state] || STATE_LABELS.idle;
        }

        // 2. Update color per state
        applyStateColors(state);

        // 3. Update waveform active animation & color
        const isWaveActive = state === STATE.LISTENING || state === STATE.SPEAKING;
        waveBars.forEach(bar => {
            bar.classList.toggle("idle", !isWaveActive);
            bar.style.background = state === STATE.SPEAKING ? t.speaking : t.wave;
        });

        // 4. Update Orb animations / classes
        if (orb) {
            orb.classList.remove("orb--listening", "orb--thinking", "orb--speaking");
            if (state !== STATE.IDLE) {
                orb.classList.add(`orb--${state}`);
            }
        }
        if (orbGlow) {
            orbGlow.classList.remove("orb--listening", "orb--thinking", "orb--speaking");
            if (state !== STATE.IDLE) {
                orbGlow.classList.add(`orb--${state}`);
            }
        }

        // 5. Mic button interactive states & lock
        if (micBtn) {
            const isLocked = state === STATE.THINKING || state === STATE.SPEAKING;
            micBtn.disabled = isLocked;
            micBtn.style.opacity = isLocked ? "0.6" : "1";
            micBtn.style.cursor = isLocked ? "not-allowed" : "pointer";

            if (state === STATE.LISTENING) {
                micBtn.style.boxShadow = `0 0 0 4px ${t.listening}66, 0 10px 28px rgba(0, 0, 0, 0.3)`;
                micBtn.style.transform = "scale(1.05)";
            } else {
                micBtn.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.3)";
                micBtn.style.transform = "scale(1)";
            }
        }

        // 6. Transcript visibility
        if (transcriptEl) {
            transcriptEl.style.opacity = state === STATE.IDLE ? "0" : "0.9";
        }
    }

    function applyStateColors(state) {
        const statusEl = document.getElementById("vocentra-status");
        const t = THEMES[currentTheme] || THEMES.dark;
        if (!statusEl) return;

        const colorMap = {
            [STATE.IDLE]: t.sub,
            [STATE.LISTENING]: t.listening,
            [STATE.THINKING]: t.thinking,
            [STATE.SPEAKING]: t.speaking,
        };
        statusEl.style.color = colorMap[state] || t.sub;
    }

    // ─── Theme Application ────────────────────────────────────────────────────
    function applyTheme(themeKey) {
        currentTheme = themeKey;
        const t = THEMES[themeKey] || THEMES.dark;
        const popup = document.getElementById("vocentra-popup-card");
        if (!popup) return;

        if (themeKey === "glass") {
            popup.classList.add("vocentra-popup--glass");
        } else {
            popup.classList.remove("vocentra-popup--glass");
        }

        popup.style.background = t.cardBg;
        popup.style.borderColor = t.cardBorder;
        popup.style.boxShadow = t.shadow;

        const orb = document.getElementById("vocentra-orb");
        const orbGlow = document.getElementById("vocentra-orb-glow");
        if (orb) orb.style.background = t.orb;
        if (orbGlow) orbGlow.style.background = t.orb;

        const title = document.getElementById("vocentra-title");
        const sub = document.getElementById("vocentra-sub");
        const transcript = document.getElementById("vocentra-transcript");
        if (title) title.style.color = t.text;
        if (sub) sub.style.color = t.sub;
        if (transcript) transcript.style.color = themeKey === "light" ? "#0f172a" : "#ffffff";

        popup.querySelectorAll(".vocentra-wave-bar").forEach(bar => {
            bar.style.background = t.wave;
        });

        const micBtn = document.getElementById("vocentra-mic-btn");
        const micGlow = document.getElementById("vocentra-mic-glow");
        if (micBtn) micBtn.style.background = t.button;
        if (micGlow) micGlow.style.background = t.micGlow;

        const launcherBtn = document.getElementById("vocentra-launcher-btn");
        const launcherGlow = document.getElementById("vocentra-launcher-glow");
        if (launcherBtn) launcherBtn.style.background = t.button;
        if (launcherGlow) launcherGlow.style.background = t.micGlow;

        applyStateColors(currentState);
    }

    function updateAssistantUI() {
        const title = document.getElementById("vocentra-title");
        const sub = document.getElementById("vocentra-sub");
        const badge = document.getElementById("vocentra-launcher-badge");

        const name = assistantData.assistantName || "Vocentra";
        const business = assistantData.businessName || "";

        if (title) {
            title.textContent = `Hello! I'm ${name}`;
        }

        if (sub) {
            sub.textContent = business
                ? `Voice assistant for ${business}.`
                : `Your smart voice assistant.`;
        }

        if (badge) {
            badge.textContent = `Talk with ${name}`;
        }

        if (assistantData.theme && THEMES[assistantData.theme]) {
            applyTheme(assistantData.theme);
        } else {
            applyTheme("dark");
        }
    }

    // ─── Speech Recognition (STT) ─────────────────────────────────────────────
    let accumulatedTranscript = "";
    let silenceTimer = null;
    const SILENCE_TIMEOUT_MS = 1400; // Allow natural pauses up to 1.4s before finalizing query

    function initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            return null;
        }

        const sr = new SpeechRec();
        sr.continuous = true; // Stay listening across mid-sentence pauses
        sr.interimResults = true;
        sr.lang = "en-US";

        sr.onstart = () => {
            accumulatedTranscript = "";
            setState(STATE.LISTENING);
        };

        sr.onresult = (event) => {
            let sessionFinal = "";
            let interim = "";

            for (let i = 0; i < event.results.length; ++i) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    sessionFinal += text + " ";
                } else {
                    interim += text;
                }
            }

            accumulatedTranscript = (sessionFinal + interim).trim();

            const transcriptEl = document.getElementById("vocentra-transcript");
            if (transcriptEl && accumulatedTranscript) {
                transcriptEl.textContent = `You: ${accumulatedTranscript}`;
            }

            // Reset silence timer on every spoken word / phrase
            if (silenceTimer) clearTimeout(silenceTimer);
            if (accumulatedTranscript) {
                silenceTimer = setTimeout(() => {
                    commitSpeechQuery();
                }, SILENCE_TIMEOUT_MS);
            }
        };

        sr.onerror = (e) => {
            console.warn("[Vocentra] Speech recognition error:", e.error);
            if (silenceTimer) clearTimeout(silenceTimer);
            if (e.error === "not-allowed" || e.error === "service-not-allowed") {
                const transcriptEl = document.getElementById("vocentra-transcript");
                if (transcriptEl) transcriptEl.textContent = "Microphone access denied.";
            }
            if (currentState === STATE.LISTENING) {
                setState(STATE.IDLE);
            }
        };

        sr.onend = () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            if (currentState === STATE.LISTENING) {
                if (accumulatedTranscript.trim()) {
                    commitSpeechQuery();
                } else {
                    setState(STATE.IDLE);
                }
            }
        };

        return sr;
    }

    function commitSpeechQuery() {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
        const query = accumulatedTranscript.trim();
        accumulatedTranscript = "";

        if (recognition) {
            try { recognition.stop(); } catch (e) { }
        }

        if (query) {
            handleUserQuery(query);
        } else {
            setState(STATE.IDLE);
        }
    }

    function toggleListening() {
        if (!recognition) {
            recognition = initSpeechRecognition();
        }

        if (!recognition) {
            speakResponse(`Hello! I'm ${assistantData.assistantName}. Voice input is not supported in this browser.`);
            return;
        }

        if (currentState === STATE.LISTENING) {
            // If user taps while listening, commit what was said so far immediately (or cancel if empty)
            if (accumulatedTranscript.trim()) {
                commitSpeechQuery();
            } else {
                try { recognition.stop(); } catch (e) { }
                setState(STATE.IDLE);
                const transcriptEl = document.getElementById("vocentra-transcript");
                if (transcriptEl) transcriptEl.textContent = "";
            }
        } else if (currentState === STATE.IDLE) {
            accumulatedTranscript = "";
            try {
                recognition.start();
            } catch (e) {
                console.warn("[Vocentra] Recognition start failed:", e);
                setState(STATE.IDLE);
            }
        }
        // If thinking or speaking, user clicks are ignored because button is disabled
    }

    // ─── Speech Synthesis (TTS) ───────────────────────────────────────────────
    let speechKeepAliveInterval = null;

    function speakResponse(text, onComplete) {
        if (!("speechSynthesis" in window) || !assistantData.voiceEnabled) {
            if (onComplete) onComplete();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            if (speechKeepAliveInterval) {
                clearInterval(speechKeepAliveInterval);
                speechKeepAliveInterval = null;
            }
            window.speechSynthesis.resume();
        } catch (e) { }

        // Strip any residual bracket tags like [NAVIGATE: /path] just in case
        const cleanText = text.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, "").trim();
        if (!cleanText) {
            if (onComplete) onComplete();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        currentUtterance = utterance; // Prevent garbage collection in browser

        utterance.lang = "en-US";
        utterance.volume = 1;

        // Tone adjustments
        if (assistantData.tone === "professional") {
            utterance.rate = 1.0;
            utterance.pitch = 0.95;
        } else if (assistantData.tone === "sales") {
            utterance.rate = 1.08;
            utterance.pitch = 1.05;
        } else {
            utterance.rate = 1.02;
            utterance.pitch = 1.0;
        }

        let completed = false;
        let safetyTimer = null;

        function finish() {
            if (completed) return;
            completed = true;
            if (safetyTimer) {
                clearTimeout(safetyTimer);
                safetyTimer = null;
            }
            if (speechKeepAliveInterval) {
                clearInterval(speechKeepAliveInterval);
                speechKeepAliveInterval = null;
            }
            if (onComplete) onComplete();
        }

        utterance.onstart = () => {
            setState(STATE.SPEAKING);

            // Chrome speech synthesis keep-alive for longer sentences
            if (speechKeepAliveInterval) clearInterval(speechKeepAliveInterval);
            speechKeepAliveInterval = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                } else {
                    clearInterval(speechKeepAliveInterval);
                    speechKeepAliveInterval = null;
                }
            }, 10000);
        };

        utterance.onend = finish;
        utterance.onerror = (err) => {
            console.warn("[Vocentra] Speech synthesis error:", err);
            finish();
        };

        // Generous watchdog timeout (only triggers if browser audio completely hangs)
        const watchdogMs = Math.max(15000, (cleanText.length / 4) * 1000 + 10000);
        safetyTimer = setTimeout(() => {
            if (!completed) {
                console.warn("[Vocentra] Speech synthesis watchdog triggered");
                finish();
            }
        }, watchdogMs);

        window.speechSynthesis.speak(utterance);
    }

    // ─── Process User Query ──────────────────────────────────────────────────
    async function handleUserQuery(text) {
        const query = text.trim();
        if (!query) return;

        // Stop recognition
        try { if (recognition) recognition.stop(); } catch (e) { }

        // Show prompt and enter Thinking state
        const transcriptEl = document.getElementById("vocentra-transcript");
        if (transcriptEl) transcriptEl.textContent = `You: ${query}`;

        setState(STATE.THINKING);
        conversationHistory.push({ role: "user", text: query });

        let reply = "";
        let navigateTo = null;

        try {
            const chatEndpoint = `${baseUrl}/api/assistant/${userId || ""}/chat`;
            let response = await fetch(chatEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    message: query,
                    conversationHistory: conversationHistory,
                    currentPageUrl: window.location.href
                })
            });

            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/user/assistant/${userId || ""}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        message: query,
                        conversationHistory: conversationHistory,
                        currentPageUrl: window.location.href
                    })
                });
            }

            if (response.ok) {
                const data = await response.json();
                reply = data.reply || data.aiResponse || data.message || "";
                navigateTo = data.navigateTo || null;
            }
        } catch (error) {
            console.error("[Vocentra] Chat API error:", error);
        }

        // Fallback response if server error or offline
        if (!reply) {
            reply = `I am ${assistantData.assistantName} for ${assistantData.businessName || "our website"}. How can I assist you today?`;
        }

        conversationHistory.push({ role: "assistant", text: reply });

        // Show assistant preview text
        if (transcriptEl) {
            transcriptEl.textContent = `${assistantData.assistantName || "AI"}: ${reply}`;
        }

        speakResponse(reply, () => {
            // After speaking finishes:
            if (transcriptEl) transcriptEl.textContent = "";
            setState(STATE.IDLE);

            if (navigateTo && assistantData.navigationEnabled) {
                console.log("[Vocentra] Navigating to:", navigateTo);
                setTimeout(() => {
                    window.location.href = navigateTo;
                }, 500);
            }
        });
    }

    // ─── Setup Event Handlers ────────────────────────────────────────────────
    function setupEventListeners(container) {
        const launcherBtn = container.querySelector("#vocentra-launcher-btn");
        const closeBtn = container.querySelector("#vocentra-close-btn");
        const micBtn = container.querySelector("#vocentra-mic-btn");

        function openPopup() {
            isOpen = true;
            container.classList.add("vocentra-widget-open");
            setState(STATE.IDLE);
        }

        function closePopup() {
            isOpen = false;
            container.classList.remove("vocentra-widget-open");
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
            if (recognition) {
                try { recognition.stop(); } catch (e) { }
            }
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            setState(STATE.IDLE);
            const transcriptEl = document.getElementById("vocentra-transcript");
            if (transcriptEl) transcriptEl.textContent = "";
        }

        function togglePopup() {
            if (isOpen) {
                closePopup();
            } else {
                openPopup();
            }
        }

        launcherBtn.addEventListener("click", togglePopup);
        if (closeBtn) {
            closeBtn.addEventListener("click", closePopup);
        }

        micBtn.addEventListener("click", toggleListening);
    }

    // ─── Load Assistant Config ───────────────────────────────────────────────
    async function loadAssistantConfig() {
        if (!userId) {
            console.warn("[Vocentra] No user ID specified. Using default configuration.");
            updateAssistantUI();
            return;
        }

        try {
            const endpoint = `${baseUrl}/api/assistant/${userId}`;
            let response = await fetch(endpoint, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/user/assistant/${userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (response.ok) {
                const result = await response.json();
                if (result?.assistant) {
                    assistantData = {
                        ...assistantData,
                        ...result.assistant
                    };
                    console.log("[Vocentra] Loaded assistant data successfully:", assistantData);
                }
            } else {
                console.warn("[Vocentra] Could not fetch assistant data from server, status:", response.status);
            }
        } catch (error) {
            console.error("[Vocentra] Error loading assistant data:", error);
        } finally {
            updateAssistantUI();
        }
    }

    // ─── Bootstrap ────────────────────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            createWidgetDOM();
            loadAssistantConfig();
        });
    } else {
        createWidgetDOM();
        loadAssistantConfig();
    }
})();
