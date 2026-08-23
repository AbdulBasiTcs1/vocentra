import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import axios from "axios";
import { serverUrl } from "../App";
import "./Builder.css";

/* ---------------------------------- Icons ---------------------------------- */

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const CopyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
);

/* ---------------------------------- Animation / FX ------------------------------- */

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const viewExit = {
    opacity: 0,
    y: -18,
    transition: { duration: 0.28, ease: "easeIn" },
};

/* ------------------------------------------------------------------ */
/*  Mouse spotlight (same as Home)                                     */
/* ------------------------------------------------------------------ */
const MouseSpotlight = () => {
    const mouseX = useMotionValue(-500);
    const mouseY = useMotionValue(-500);
    const glowX = useSpring(mouseX, { stiffness: 45, damping: 30, mass: 1 });
    const glowY = useSpring(mouseY, { stiffness: 45, damping: 30, mass: 1 });

    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="builder-spotlight"
            style={{ left: glowX, top: glowY }}
        />
    );
};

/* ------------------------------------------------------------------ */
/*  Particle canvas (same as Home)                                     */
/* ------------------------------------------------------------------ */
const ParticleCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let w, h, particles = [], raf;

        const resize = () => {
            w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        };
        resize();
        window.addEventListener("resize", resize);

        class Particle {
            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.size = Math.random() * 1.2 + 0.4;
                this.alpha = Math.random() * 0.35 + 0.08;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0) this.x = w;
                if (this.x > w) this.x = 0;
                if (this.y < 0) this.y = h;
                if (this.y > h) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224,230,233,${this.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach((p) => { p.update(); p.draw(); });
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach((b) => {
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(224,230,233,${0.04 * (1 - dist / 140)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            raf = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
                opacity: 0.8,
            }}
        />
    );
};

/* ---------------------------------- Data ---------------------------------- */

const THEMES = ["Light", "Dark", "Glass", "Neon"];
const TONES = ["Friendly", "Professional", "Sales"];

const GEMINI_STATUS_META = {
    active: { label: "Active", tone: "ok" },
    quota_exceeded: { label: "Quota Exceeded", tone: "warn" },
    invalid: { label: "Invalid Key", tone: "bad" },
};

/* ---------------------------------- Toggle ------------------------------- */

function Toggle({ label, sub, enabled, onChange }) {
    return (
        <div className="builder-toggle">
            <div className="builder-toggle-text">
                <span className="builder-toggle-label">{label}</span>
                {sub && <span className="builder-toggle-sub">{sub}</span>}
            </div>
            <button
                type="button"
                className={`toggle-track ${enabled ? "active" : ""}`}
                onClick={() => onChange(!enabled)}
                aria-pressed={enabled}
            >
                <span className="toggle-knob" />
            </button>
        </div>
    );
}

/* ---------------------------------- Component ------------------------------- */

export default function Builder({ user, setUser }) {
    const setupComplete = Boolean(user?.isSetupComplete);

    // Dashboard when setup is complete, form otherwise / when editing
    const [isEditing, setIsEditing] = useState(!setupComplete);
    const showDashboard = setupComplete && !isEditing;

    const [assistantName, setAssistantName] = useState(user?.assistantName || "");
    const [businessName, setBusinessName] = useState(user?.businessName || "");
    const [businessType, setBusinessType] = useState(user?.businessType || "");
    const [businessDescription, setBusinessDescription] = useState(user?.businessDescription || "");
    const [targetAudience, setTargetAudience] = useState(user?.targetAudience || "");
    const [theme, setTheme] = useState(user?.theme ? user.theme.charAt(0).toUpperCase() + user.theme.slice(1) : "Dark");
    const [tone, setTone] = useState(user?.tone ? user.tone.charAt(0).toUpperCase() + user.tone.slice(1) : "Professional");
    const [voiceEnabled, setVoiceEnabled] = useState(user?.voiceEnabled ?? true);
    const [navigationEnabled, setNavigationEnabled] = useState(user?.navigationEnabled ?? true);
    const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || "");
    const [pages, setPages] = useState(user?.pages || []);
    const [newPage, setNewPage] = useState({ name: "", path: "", keywords: "" });

    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [copied, setCopied] = useState(false);

    // If the user object loads async and setup turns out complete, land on dashboard
    useEffect(() => {
        if (setupComplete) setIsEditing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setupComplete]);

    /* ------------------------------ Derived data ------------------------------ */

    const messagesLeft = Math.max(0, (user?.requestLimit ?? 200) - (user?.totalMessages ?? 0));
    const planLabel = user?.plan === "pro" ? "Pro" : "Free";
    const geminiMeta = !user?.geminiApiKey
        ? { label: "Not Connected", tone: "muted" }
        : GEMINI_STATUS_META[user?.geminiStatus] || GEMINI_STATUS_META.active;

    const embedCode = `<script src="${serverUrl}/assistant.js" data-user-id="${user?._id || ""}"></script>`;

    /* ------------------------------ Handlers ------------------------------ */

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = embedCode;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        setStatus({ type: "", message: "" });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setStatus({ type: "", message: "" });
        setIsEditing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddPage = () => {
        const { name, path } = newPage;
        if (!name.trim() || !path.trim()) {
            setStatus({ type: "error", message: "Page name and path are required." });
            return;
        }
        setPages([...pages, { ...newPage }]);
        setNewPage({ name: "", path: "", keywords: "" });
        setStatus({ type: "", message: "" });
    };

    const handleRemovePage = (idx) => {
        setPages(pages.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!assistantName.trim()) {
            setStatus({ type: "error", message: "Assistant name is required." });
            return;
        }

        setIsSaving(true);
        setStatus({ type: "", message: "" });

        try {
            const payload = {
                assistantName,
                businessName,
                businessType,
                businessDescription,
                targetAudience,
                tone: tone.toLowerCase(),
                theme: theme.toLowerCase(),
                voiceEnabled,
                navigationEnabled,
                geminiApiKey,
                pages,
            };

            const res = await axios.post(`${serverUrl}/api/user/save-assistant`, payload, {
                withCredentials: true,
            });

            if (res.data.success) {
                if (setUser && res.data.user) setUser(res.data.user);
                setStatus({
                    type: "success",
                    message: setupComplete
                        ? "Assistant updated successfully."
                        : "Assistant saved successfully.",
                });
                // Return to the dashboard view after a successful save/update
                setIsEditing(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setStatus({ type: "error", message: res.data.message || "Failed to save." });
            }
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message: err?.response?.data?.message || "Something went wrong. Try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    /* ---------------------------------- Render ------------------------------- */

    return (
        <div className="builder-page">
            <MouseSpotlight />
            <ParticleCanvas />
            <div className="builder-ambient" aria-hidden="true" />
            <div className="builder-ambient-bottom" aria-hidden="true" />

            <main className="builder-main">
                <AnimatePresence mode="wait">
                    {showDashboard ? (
                        /* ==================== DASHBOARD VIEW ==================== */
                        <motion.div
                            key="dashboard"
                            className="builder-container"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            exit={viewExit}
                        >
                            {/* Status */}
                            {status.message && (
                                <motion.div
                                    className={`builder-status builder-status--${status.type}`}
                                    variants={fadeUp}
                                >
                                    {status.message}
                                </motion.div>
                            )}

                            {/* Header */}
                            <motion.header className="builder-dash-header" variants={fadeUp}>
                                <h1 className="builder-dash-title">Assistant Builder</h1>
                                <p className="builder-dash-subtitle">Customize your virtual assistant</p>
                            </motion.header>

                            {/* Summary card */}
                            <motion.div className="builder-card builder-dash-card" variants={fadeUp}>
                                <div className="builder-dash-top">
                                    <div className="builder-dash-identity">
                                        <span className="builder-dash-label">
                                            <span className="builder-dash-label-dot" />
                                            Assistant
                                        </span>
                                        <h2 className="builder-dash-name">
                                            {user?.assistantName || "Vocentra AI"}
                                        </h2>
                                        <p className="builder-dash-ready">
                                            Your assistant is ready to use on your website.
                                        </p>
                                    </div>

                                    {/* Live voice-wave accent */}
                                    <div className="builder-dash-wave" aria-hidden="true">
                                        {Array.from({ length: 9 }).map((_, i) => (
                                            <span
                                                key={i}
                                                className="builder-dash-wave-bar"
                                                style={{ "--d": `${i * 0.12}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="builder-stats">
                                    <div className="builder-stat">
                                        <span className="builder-stat-label">Current Plan</span>
                                        <span className="builder-stat-value">{planLabel}</span>
                                    </div>
                                    <div className="builder-stat">
                                        <span className="builder-stat-label">Gemini Status</span>
                                        <span className={`builder-stat-value builder-stat-value--${geminiMeta.tone}`}>
                                            {geminiMeta.tone === "ok" && <span className="builder-stat-dot" />}
                                            {geminiMeta.label}
                                        </span>
                                    </div>
                                    <div className="builder-stat">
                                        <span className="builder-stat-label">Messages Left</span>
                                        <span className="builder-stat-value">{messagesLeft}</span>
                                    </div>
                                </div>

                                {/* Where to paste */}
                                <div className="builder-note">
                                    <h3 className="builder-note-title">Where to paste this script?</h3>
                                    <p className="builder-note-text">
                                        Paste this script before the closing <code>&lt;/body&gt;</code> tag
                                        of your website HTML file.
                                    </p>
                                    <span className="builder-note-example-label">Example:</span>
                                    <pre className="builder-code-block">
                                        <code>
                                            <span className="tk-tag">&lt;body&gt;</span>{"\n"}
                                            {"  "}<span className="tk-comment">Your Website Content</span>{"\n"}
                                            {"\n"}
                                            {"  "}<span className="tk-tag">&lt;script</span>{" "}
                                            <span className="tk-attr">src</span><span className="tk-punc">=</span>
                                            <span className="tk-str">"{serverUrl}/assistant.js"</span>{" "}
                                            <span className="tk-attr">data-user-id</span><span className="tk-punc">=</span>
                                            <span className="tk-str">"{user?._id || ""}"</span>
                                            <span className="tk-tag">&gt;&lt;/script&gt;</span>{"\n"}
                                            {"\n"}
                                            <span className="tk-tag">&lt;/body&gt;</span>
                                        </code>
                                    </pre>
                                </div>

                                {/* Embed code */}
                                <div className="builder-embed">
                                    <span className="builder-embed-label">Embed Code</span>
                                    <div className="builder-embed-box">
                                        <code className="builder-embed-code">{embedCode}</code>
                                        <button
                                            type="button"
                                            className={`builder-copy-btn ${copied ? "copied" : ""}`}
                                            onClick={handleCopy}
                                            aria-label={copied ? "Copied" : "Copy embed code"}
                                            title={copied ? "Copied!" : "Copy"}
                                        >
                                            {copied ? <CheckIcon /> : <CopyIcon />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Edit action */}
                            <motion.div className="builder-dash-actions" variants={fadeUp}>
                                <motion.button
                                    type="button"
                                    className="builder-btn-edit"
                                    onClick={handleEdit}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <EditIcon />
                                    Edit Assistant
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* ==================== FORM VIEW ==================== */
                        <motion.div
                            key="form"
                            className="builder-container"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            exit={viewExit}
                        >
                            {/* Status */}
                            {status.message && (
                                <motion.div
                                    className={`builder-status builder-status--${status.type}`}
                                    variants={fadeUp}
                                >
                                    {status.message}
                                </motion.div>
                            )}

                            {/* Header */}
                            <motion.header className="builder-dash-header" variants={fadeUp}>
                                <h1 className="builder-dash-title">Assistant Builder</h1>
                                <p className="builder-dash-subtitle">Customize your virtual assistant</p>
                            </motion.header>

                            {/* ==================== Basic Information ==================== */}
                            <motion.div className="builder-card" variants={fadeUp}>
                                <h2 className="builder-card-title">Basic Information</h2>

                                <div className="builder-field">
                                    <label>Assistant Name</label>
                                    <input
                                        type="text"
                                        value={assistantName}
                                        onChange={(e) => setAssistantName(e.target.value)}
                                        placeholder="e.g. Vocentra AI"
                                    />
                                </div>

                                <div className="builder-field">
                                    <label>Business Name</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div className="builder-field">
                                    <label>Business Type</label>
                                    <input
                                        type="text"
                                        value={businessType}
                                        onChange={(e) => setBusinessType(e.target.value)}
                                        placeholder="e.g. SaaS, E-commerce, Agency"
                                    />
                                </div>

                                <div className="builder-field">
                                    <label>Business Description</label>
                                    <textarea
                                        value={businessDescription}
                                        onChange={(e) => setBusinessDescription(e.target.value)}
                                        placeholder="Describe what your business does so the assistant can answer accurately."
                                        rows={3}
                                    />
                                </div>

                                <div className="builder-field">
                                    <label>Target Audience</label>
                                    <input
                                        type="text"
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        placeholder="e.g. College students preparing for placements"
                                    />
                                </div>
                            </motion.div>

                            {/* ==================== Appearance ==================== */}
                            <motion.div className="builder-card" variants={fadeUp}>
                                <h2 className="builder-card-title">Appearance</h2>

                                <div className="builder-field">
                                    <label>Theme</label>
                                    <div className="builder-pills">
                                        {THEMES.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={theme === t ? "selected" : ""}
                                                onClick={() => setTheme(t)}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="builder-field">
                                    <label>Assistant Tone</label>
                                    <div className="builder-pills">
                                        {TONES.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={tone === t ? "selected" : ""}
                                                onClick={() => setTone(t)}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="builder-toggles">
                                    <Toggle
                                        label="Enable Voice"
                                        sub="Speech input and output"
                                        enabled={voiceEnabled}
                                        onChange={setVoiceEnabled}
                                    />
                                    <Toggle
                                        label="Enable Navigation"
                                        sub="Assistant can navigate pages"
                                        enabled={navigationEnabled}
                                        onChange={setNavigationEnabled}
                                    />
                                </div>
                            </motion.div>

                            {/* ==================== Gemini API Key ==================== */}
                            <motion.div className="builder-card" variants={fadeUp}>
                                <div className="builder-card-header">
                                    <div>
                                        <h2 className="builder-card-title">Gemini API KEY</h2>
                                        <p className="builder-card-sub">Add your Gemini API key to power your assistant</p>
                                    </div>
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="builder-btn-gradient-sm"
                                    >
                                        Get API Key
                                    </a>
                                </div>

                                <div className="builder-field">
                                    <input
                                        type="password"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        placeholder="Paste your API key..."
                                    />
                                    <span className="builder-hint">
                                        Your API key is securely stored and only used for generating AI responses.
                                    </span>
                                </div>
                            </motion.div>

                            {/* ==================== Navigation Pages ==================== */}
                            <motion.div className="builder-card" variants={fadeUp}>
                                <div className="builder-card-header">
                                    <div>
                                        <h2 className="builder-card-title">Navigation Pages</h2>
                                        <p className="builder-card-sub">Assistant can redirect users</p>
                                    </div>
                                </div>

                                <div className="builder-page-add">
                                    <input
                                        type="text"
                                        placeholder="Page Name"
                                        value={newPage.name}
                                        onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
                                    />
                                    <input
                                        type="text"
                                        placeholder="/path"
                                        value={newPage.path}
                                        onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
                                    />
                                    <input
                                        type="text"
                                        placeholder="pricing, plans"
                                        value={newPage.keywords}
                                        onChange={(e) => setNewPage({ ...newPage, keywords: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
                                    />
                                    <button type="button" className="builder-btn-gradient-sm" onClick={handleAddPage}>
                                        <PlusIcon />
                                        Add
                                    </button>
                                </div>

                                {pages.length > 0 && (
                                    <div className="builder-page-list">
                                        {pages.map((page, idx) => (
                                            <div key={idx} className="builder-page-item">
                                                <div className="builder-page-info">
                                                    <span className="builder-page-name">{page.name}</span>
                                                    <span className="builder-page-path">{page.path}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="builder-page-delete"
                                                    onClick={() => handleRemovePage(idx)}
                                                    aria-label={`Remove ${page.name}`}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* ==================== Save / Update ==================== */}
                            <motion.div className="builder-save" variants={fadeUp}>
                                {setupComplete && (
                                    <button
                                        type="button"
                                        className="builder-btn-cancel"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="builder-btn-save"
                                    onClick={handleSave}
                                    disabled={isSaving || !assistantName ||
                                        !businessName ||
                                        !businessType ||
                                        !businessDescription ||
                                        !targetAudience ||
                                        !geminiApiKey}
                                >
                                    {isSaving
                                        ? setupComplete ? "Updating…" : "Saving…"
                                        : setupComplete ? "Update Assistant" : "Save Assistant"}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}