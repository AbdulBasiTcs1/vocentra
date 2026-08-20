(function () {
    if (window.__VOCENTRA_ASSISTANT_INITIALIZED__) {
        return;
    }
    window.__VOCENTRA_ASSISTANT_INITIALIZED__ = true;

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

    const cssUrl = `${baseUrl}/assistant.css`;

    /* --------------------------------------------------------------------------
       2. Inject CSS Stylesheet
       -------------------------------------------------------------------------- */
    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    /* --------------------------------------------------------------------------
       3. Theme Definitions (Exact copy from Home AssistantPreview)
       -------------------------------------------------------------------------- */
    const THEMES = {
        dark: {
            pageBg: "radial-gradient(80% 60% at 50% 0%, #1a1630 0%, #0c0c14 40%, #000000 100%)",
            cardBg: "linear-gradient(180deg, #16122b 0%, #0d0d18 50%, #08080f 100%)",
            orb: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #6366f1 100%)",
            cardBorder: "rgba(255,255,255,0.08)",
            text: "#f8fafc",
            sub: "#94a3b8",
            listening: "#2dd4bf",
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
            listening: "#3b82f6",
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
            wave: "#34d399",
            button: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            micGlow: "rgba(16, 185, 129, 0.6)",
            shadow: "0 32px 64px -12px rgba(0,0,0,0.7), 0 0 24px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
        },
    };

    const THEME_DOTS = [
        { key: "dark", bg: "#1e1b2e", ring: "rgba(255,255,255,0.25)" },
        { key: "light", bg: "#f8fafc", ring: "rgba(0,0,0,0.15)" },
        { key: "glass", bg: "rgba(255,255,255,0.25)", ring: "rgba(255,255,255,0.45)" },
        { key: "neon", bg: "#10b981", ring: "rgba(16,185,129,0.5)" },
    ];

    const WAVE_BARS = [0.35, 0.8, 0.55, 0.95, 0.45, 0.75, 0.5, 0.9, 0.4, 0.7, 0.85, 0.5, 0.65, 0.4, 0.8, 0.55, 0.95, 0.45, 0.7, 0.6];

    // Standard vector mic SVG icon from AssistantPreview
    const MIC_SVG_ICON = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    `;

    /* --------------------------------------------------------------------------
       4. State Management
       -------------------------------------------------------------------------- */
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

    let isOpen = false;
    let isListening = false;
    let currentTheme = "dark";
    let recognition = null;

    /* --------------------------------------------------------------------------
       5. Initialize Widget DOM
       -------------------------------------------------------------------------- */
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

                <!-- Theme Switcher Dots -->
                <div class="vocentra-dots">
                    ${THEME_DOTS.map(dot => `
                        <button 
                            type="button" 
                            class="vocentra-dot ${currentTheme === dot.key ? 'active' : ''}" 
                            data-theme="${dot.key}" 
                            style="background: ${dot.bg}; --ring: ${dot.ring};"
                            title="${dot.key} theme"
                            aria-label="${dot.key} theme"
                        ></button>
                    `).join("")}
                </div>

                <!-- Gradient Orb -->
                <div class="vocentra-orb-wrap">
                    <div class="vocentra-orb" id="vocentra-orb"></div>
                    <div class="vocentra-orb-glow" id="vocentra-orb-glow"></div>
                </div>

                <!-- Typography -->
                <h2 class="vocentra-title" id="vocentra-title">Hello! I'm Vocentra</h2>
                <p class="vocentra-sub" id="vocentra-sub">
                    Your smart voice assistant.<br />
                    Ask anything about your website.
                </p>

                <!-- Listening state -->
                <div class="vocentra-listening" id="vocentra-status">Listening...</div>
                <div class="vocentra-transcript" id="vocentra-transcript"></div>

                <!-- Waveform -->
                <div class="vocentra-waveform" id="vocentra-waveform">
                    ${WAVE_BARS.map((h, i) => `
                        <span class="vocentra-wave-bar" style="height: ${10 + h * 28}px; animation-delay: ${i * 0.06}s;"></span>
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
                <div class="vocentra-launcher-badge" id="vocentra-launcher-badge">Talk with Vocentra</div>
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

    /* --------------------------------------------------------------------------
       6. Apply Theme Styling
       -------------------------------------------------------------------------- */
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
        const status = document.getElementById("vocentra-status");
        const transcript = document.getElementById("vocentra-transcript");
        if (title) title.style.color = t.text;
        if (sub) sub.style.color = t.sub;
        if (status) status.style.color = t.listening;
        if (transcript) transcript.style.color = themeKey === "light" ? "#0f172a" : "#ffffff";

        const waveBars = popup.querySelectorAll(".vocentra-wave-bar");
        waveBars.forEach(bar => {
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

        // Active dot
        const dots = popup.querySelectorAll(".vocentra-dot");
        dots.forEach(dot => {
            if (dot.getAttribute("data-theme") === themeKey) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    /* --------------------------------------------------------------------------
       7. Update Content based on User's Saved Assistant Data
       -------------------------------------------------------------------------- */
    function updateAssistantUI() {
        const title = document.getElementById("vocentra-title");
        const sub = document.getElementById("vocentra-sub");
        const badge = document.getElementById("vocentra-launcher-badge");

        const name = assistantData.assistantName || "Vocentra";
        const business = assistantData.businessName || "";
        const desc = assistantData.businessDescription || "";

        if (title) {
            title.textContent = `Hello! I'm ${name}`;
        }

        if (sub) {
            if (business) {
                sub.innerHTML = `Your smart voice assistant for <strong>${business}</strong>.<br/>${desc ? desc : 'Ask anything about your website.'}`;
            } else if (desc) {
                sub.innerHTML = `${desc}<br/>Ask anything about your website.`;
            } else {
                sub.innerHTML = `Your smart voice assistant.<br />Ask anything about your website.`;
            }
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

    /* --------------------------------------------------------------------------
       8. Speech Recognition & Voice Interaction
       -------------------------------------------------------------------------- */
    function initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            return null;
        }

        const sr = new SpeechRec();
        sr.continuous = false;
        sr.interimResults = true;
        sr.lang = "en-US";

        sr.onstart = () => {
            isListening = true;
            updateVoiceState("Listening...", true);
        };

        sr.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            const transcriptEl = document.getElementById("vocentra-transcript");
            if (transcriptEl) {
                transcriptEl.textContent = `"${transcript}"`;
            }

            if (event.results[0].isFinal) {
                handleUserQuery(transcript);
            }
        };

        sr.onerror = (e) => {
            console.warn("[Vocentra] Speech recognition error:", e);
            isListening = false;
            updateVoiceState("Listening...", false);
        };

        sr.onend = () => {
            isListening = false;
            updateVoiceState("Listening...", false);
        };

        return sr;
    }

    function updateVoiceState(statusText, active) {
        const status = document.getElementById("vocentra-status");
        const waveBars = document.querySelectorAll(".vocentra-wave-bar");
        const t = THEMES[currentTheme] || THEMES.dark;

        if (status) {
            status.textContent = statusText;
            status.style.color = t.listening;
        }

        waveBars.forEach(bar => {
            if (active) {
                bar.classList.remove("idle");
            } else {
                bar.classList.add("idle");
            }
        });
    }

    function toggleListening() {
        if (!recognition) {
            recognition = initSpeechRecognition();
        }

        if (!recognition) {
            speakResponse(`Hello! I'm ${assistantData.assistantName}. Voice input is not supported in this browser.`);
            return;
        }

        if (isListening) {
            try { recognition.stop(); } catch (e) {}
            isListening = false;
            updateVoiceState("Listening...", false);
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.warn("[Vocentra] Recognition start failed:", e);
            }
        }
    }

    function speakResponse(text) {
        if (!("speechSynthesis" in window) || !assistantData.voiceEnabled) {
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            updateVoiceState("Speaking...", true);
        };
        utterance.onend = () => {
            updateVoiceState("Listening...", false);
        };
        utterance.onerror = () => {
            updateVoiceState("Listening...", false);
        };

        window.speechSynthesis.speak(utterance);
    }

    function handleUserQuery(text) {
        const query = text.toLowerCase().trim();
        updateVoiceState("Thinking...", true);

        // Check for navigation intent if navigation is enabled
        if (assistantData.navigationEnabled && assistantData.pages && assistantData.pages.length > 0) {
            for (const page of assistantData.pages) {
                const pageName = (page.name || "").toLowerCase();
                const keywords = (page.keywords || []).map(k => k.toLowerCase());
                
                const matched = query.includes(pageName) || keywords.some(k => k && query.includes(k));
                if (matched && page.path) {
                    const response = `Navigating you to ${page.name || "the page"}.`;
                    speakResponse(response);
                    setTimeout(() => {
                        window.location.href = page.path;
                    }, 1200);
                    return;
                }
            }
        }

        // Conversational response based on business configuration
        let reply = `Hello! I am ${assistantData.assistantName}. `;
        if (assistantData.businessName) {
            reply += `We represent ${assistantData.businessName}. `;
        }
        if (assistantData.businessDescription) {
            reply += `${assistantData.businessDescription} `;
        }
        reply += "How can I help you today?";

        setTimeout(() => {
            speakResponse(reply);
        }, 500);
    }

    /* --------------------------------------------------------------------------
       9. Event Listeners & UI Binding
       -------------------------------------------------------------------------- */
    function setupEventListeners(container) {
        const launcherBtn = container.querySelector("#vocentra-launcher-btn");
        const closeBtn = container.querySelector("#vocentra-close-btn");
        const micBtn = container.querySelector("#vocentra-mic-btn");
        const dots = container.querySelectorAll(".vocentra-dot");

        function togglePopup() {
            isOpen = !isOpen;
            if (isOpen) {
                container.classList.add("vocentra-widget-open");
                if (assistantData.voiceEnabled && !isListening) {
                    speakResponse(`Hello! I'm ${assistantData.assistantName}. Ask anything about our website.`);
                }
            } else {
                container.classList.remove("vocentra-widget-open");
                if (isListening && recognition) {
                    try { recognition.stop(); } catch (e) {}
                }
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }
            }
        }

        launcherBtn.addEventListener("click", togglePopup);
        if (closeBtn) {
            closeBtn.addEventListener("click", togglePopup);
        }

        micBtn.addEventListener("click", () => {
            toggleListening();
        });

        dots.forEach(dot => {
            dot.addEventListener("click", () => {
                const themeKey = dot.getAttribute("data-theme");
                if (themeKey) {
                    applyTheme(themeKey);
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       10. Fetch User Assistant Data from Backend API
       -------------------------------------------------------------------------- */
    async function loadAssistantConfig() {
        if (!userId) {
            console.warn("[Vocentra] No user ID specified. Using default configuration.");
            updateAssistantUI();
            return;
        }

        try {
            const endpoint = `${baseUrl}/api/user/assistant/${userId}`;
            const response = await fetch(endpoint, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

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

    /* --------------------------------------------------------------------------
       11. Initialize on DOM Ready
       -------------------------------------------------------------------------- */
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