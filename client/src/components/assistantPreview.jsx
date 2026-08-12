import React, { useState } from "react";
import "./assistantPreview.css";

const themes = {
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

export default function AssistantPreview() {
    const [theme, setTheme] = useState("dark");
    const t = themes[theme];

    return (
        <div className="assistant-preview" style={{ background: t.pageBg }}>
            <div
                className={`preview-card ${theme === "glass" ? "preview-card--glass" : ""}`}
                style={{
                    background: t.cardBg,
                    borderColor: t.cardBorder,
                    boxShadow: t.shadow,
                }}
            >
                {/* Theme switcher */}
                <div className="preview-dots">
                    {THEME_DOTS.map((dot) => (
                        <button
                            key={dot.key}
                            className={`preview-dot ${theme === dot.key ? "preview-dot--active" : ""}`}
                            style={{ background: dot.bg, "--ring": dot.ring }}
                            onClick={() => setTheme(dot.key)}
                            aria-label={`${dot.key} theme`}
                        />
                    ))}
                </div>

                {/* Gradient Orb */}
                <div className="preview-orb-wrap">
                    <div className="preview-orb" style={{ background: t.orb }} />
                    <div className="preview-orb-glow" style={{ background: t.orb }} />
                </div>

                {/* Typography */}
                <h2 className="preview-title" style={{ color: t.text }}>
                    Hello! I'm Vocentra
                </h2>
                <p className="preview-sub" style={{ color: t.sub }}>
                    Your smart voice assistant.
                    <br />
                    Ask anything about your website.
                </p>

                {/* Listening state */}
                <div className="preview-listening" style={{ color: t.listening }}>
                    Listening...
                </div>

                {/* Waveform */}
                <div className="preview-waveform">
                    {WAVE_BARS.map((h, i) => (
                        <span
                            key={i}
                            className="preview-wave-bar"
                            style={{
                                background: t.wave,
                                height: `${10 + h * 28}px`,
                                animationDelay: `${i * 0.06}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Mic Button */}
                <div className="preview-mic-wrap">
                    <div className="preview-mic-glow" style={{ background: t.micGlow }} />
                    <button
                        className="preview-mic"
                        style={{ background: t.button }}
                        aria-label="Start voice input"
                    >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="8" y1="22" x2="16" y2="22" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}