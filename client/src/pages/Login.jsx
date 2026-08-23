import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import { serverUrl } from "../App";
import axios from "axios";
import "./Login.css";

/* ---------------------------------- Icons ---------------------------------- */

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.6z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 009 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.16.27-1.7V4.97H.98A9 9 0 000 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 00.98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8A9296" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

/* ------------------------------------------------------------------ */
/*  Typewriter Effect — writes & erases phrases                         */
/* ------------------------------------------------------------------ */
const PHRASES = [
    "Create your AI voice assistant",
    "Train it on your content",
    "Embed it with one script tag",
    "Talk to your visitors",
];

const TypewriterText = () => {
    const [text, setText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pause, setPause] = useState(false);

    useEffect(() => {
        const currentPhrase = PHRASES[phraseIndex];
        let timer;

        if (pause) {
            timer = setTimeout(() => setPause(false), 1800);
        } else if (isDeleting) {
            timer = setTimeout(() => {
                setText(currentPhrase.slice(0, text.length - 1));
                if (text.length === 1) {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
                }
            }, 45);
        } else {
            timer = setTimeout(() => {
                setText(currentPhrase.slice(0, text.length + 1));
                if (text.length + 1 === currentPhrase.length) {
                    setPause(true);
                    setIsDeleting(true);
                }
            }, 90);
        }

        return () => clearTimeout(timer);
    }, [text, isDeleting, pause, phraseIndex]);

    return (
        <span className="typewriter">
            {text}
            <span className="typewriter-cursor" />
        </span>
    );
};

/* --------------------------------- Waveform ------------------------------- */

const WAVE_BARS = Array.from({ length: 56 }, (_, i) => ({
    h: 6 + Math.round(20 * Math.abs(Math.sin(i * 0.55))),
    d: ((i % 9) * 0.11).toFixed(2),
}));

const Waveform = () => (
    <div className="waveform" aria-hidden="true">
        {WAVE_BARS.map((bar, i) => (
            <span key={i} className="waveform-bar" style={{ "--h": `${bar.h}px`, "--d": `${bar.d}s` }} />
        ))}
    </div>
);

/* ------------------------------------------------------------------ */
/*  Ambient particle field behind the card                             */
/* ------------------------------------------------------------------ */
const ParticleField = () => {
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
                this.x = Math.random() * w; this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 1.5 + 0.5; this.alpha = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
                if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224,230,233,${this.alpha})`; ctx.fill();
            }
        }
        for (let i = 0; i < 40; i++) particles.push(new Particle());
        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(224,230,233,${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5; ctx.stroke();
                    }
                });
            });
            raf = requestAnimationFrame(animate);
        };
        animate();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return (
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.7 }} />
    );
};

/* ------------------------------------------------------------------ */
/*  3D Tilt Card wrapper                                               */
/* ------------------------------------------------------------------ */
const TiltCard = ({ children, className }) => {
    const ref = useRef(null);
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 });
    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width);
        y.set((e.clientY - rect.top) / rect.height);
    };
    const handleMouseLeave = () => { x.set(0.5); y.set(0.5); };
    return (
        <motion.div ref={ref} className={className} style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div style={{ transform: "translateZ(40px)" }}>{children}</div>
        </motion.div>
    );
};

/* ------------------------------------------------------------------ */
/*  Holographic mic icon                                               */
/* ------------------------------------------------------------------ */
const HolographicMic = () => (
    <motion.div className="mic-wrap" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
        <div className="mic-3d">
            <svg className="mic-svg" viewBox="0 0 120 160" fill="none">
                <defs>
                    <linearGradient id="micBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E0E6E9" /><stop offset="35%" stopColor="#B0B8BC" />
                        <stop offset="65%" stopColor="#4A5C63" /><stop offset="100%" stopColor="#1B2B2F" />
                    </linearGradient>
                    <linearGradient id="micStand" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8A9296" /><stop offset="100%" stopColor="#0C171B" />
                    </linearGradient>
                </defs>
                <rect x="38" y="4" width="44" height="82" rx="22" fill="url(#micBody)" stroke="#000" strokeOpacity="0.25" />
                <path d="M20 66 v14 a40 40 0 0080 0 v-14" fill="none" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
                <line x1="60" y1="120" x2="60" y2="146" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
                <line x1="36" y1="150" x2="84" y2="150" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
            </svg>
        </div>
        <div className="mic-shadow" />
        <motion.div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(224,230,233,0.08)", pointerEvents: "none" }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        <motion.div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(224,230,233,0.04)", pointerEvents: "none" }} animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
    </motion.div>
);

/* ---------------------------------- Login ------------------------------------ */

export default function Login({ setUser }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();
            const name = user.displayName || user.email;
            const email = user.email;
            const res = await axios.post(`${serverUrl}/api/auth/google`, { name, email, idToken }, { withCredentials: true });
            if (res.status === 200) {
                if (res.data.token) {
                    localStorage.setItem("vocentra_token", res.data.token);
                }
                if (setUser) setUser(res.data.user || res.data);
                setSuccess(true);
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            console.error("Google auth error:", error);
            setErrorMessage(error?.response?.data?.message || error?.message || "Failed to sign in with Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="ambient-glow" aria-hidden="true" />
            <Waveform />

            <div className="login-shell">
                {/* ---------------- Left: Hero Section (Refactored) ---------------- */}
                <section className="login-aside">
                    <motion.span
                        className="eyebrow"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        AI Voice Assistant Platform
                    </motion.span>

                    <motion.h1
                        className="hero-headline"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                    >
                        Your website,<br />
                        now with a voice.
                    </motion.h1>

                    <motion.div
                        className="hero-typewriter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <TypewriterText />
                    </motion.div>

                    <motion.p
                        className="hero-copy"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                    >
                        Vocentra listens, answers and guides every visitor.
                        Trained on your content, matched to your brand, and live in minutes.
                    </motion.p>

                    <motion.div
                        className="hero-cta"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                    >
                        <span className="hero-cta-line" />
                        <span className="hero-cta-text">Launch in minutes — no code required</span>
                        <span className="hero-cta-line" />
                    </motion.div>
                </section>

                {/* ---------------- Right: the sign-in card (Untouched) ---------------- */}
                <TiltCard className="login-card">
                    <ParticleField />

                    {/* Success overlay */}
                    <AnimatePresence>
                        {success && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(12,23,27,0.85)", backdropFilter: "blur(12px)", borderRadius: 28, gap: 16 }}
                            >
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                                    <CheckCircleIcon />
                                </motion.div>
                                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#E0E6E9", margin: 0 }}>
                                    Welcome aboard
                                </motion.h3>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                                    style={{ color: "#68757F", fontSize: 14, margin: 0 }}>
                                    Redirecting to your dashboard...
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <HolographicMic />

                    <motion.h2 className="login-word" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
                        Vocentra
                    </motion.h2>
                    <motion.p className="login-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        Sign in to start building
                    </motion.p>

                    <div className="login-actions">
                        {errorMessage && <div className="login-error">{errorMessage}</div>}
                        <motion.button onClick={handleGoogleLogin} type="button" className="btn-google" disabled={loading} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <GoogleIcon />
                            {loading ? "Signing in…" : "Continue with Google"}
                        </motion.button>
                        <motion.button type="button" className="btn-email" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Continue with email
                        </motion.button>
                        <motion.p className="login-legal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                            By continuing you agree to Vocentra's <a href="#terms">Terms</a> and{" "}
                            <a href="#privacy">Privacy Policy</a>.
                        </motion.p>
                    </div>

                    {/* Decorative corner accents */}
                    <div style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderTop: "1px solid rgba(224,230,233,0.15)", borderRight: "1px solid rgba(224,230,233,0.15)", borderRadius: "0 16px 0 0", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 20, left: 20, width: 40, height: 40, borderBottom: "1px solid rgba(224,230,233,0.15)", borderLeft: "1px solid rgba(224,230,233,0.15)", borderRadius: "0 0 0 16px", pointerEvents: "none" }} />
                </TiltCard>
            </div>
        </div>
    );
}

// ok