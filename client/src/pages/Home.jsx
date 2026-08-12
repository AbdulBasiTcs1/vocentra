import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AssistantPreview from "../components/assistantPreview.jsx";
import Steps from "../components/steps.jsx";
import "./Home.css";
import Footer from "../components/Footer.jsx";

/* ---------------------------------- Icons ---------------------------------- */

const WaveIcon = () => (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none" aria-hidden="true">
        <rect x="2" y="13" width="3" height="6" rx="1.5" fill="currentColor" />
        <rect x="8" y="8" width="3" height="16" rx="1.5" fill="currentColor" />
        <rect x="14" y="2" width="3" height="28" rx="1.5" fill="currentColor" />
        <rect x="20" y="8" width="3" height="16" rx="1.5" fill="currentColor" />
        <rect x="26" y="13" width="3" height="6" rx="1.5" fill="currentColor" />
    </svg>
);

const DocIcon = () => (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 3h10l6 6v20H9z" strokeLinejoin="round" />
        <path d="M19 3v6h6" strokeLinejoin="round" />
        <path d="M12.5 17h7M12.5 21.5h7M12.5 12.5h3" strokeLinecap="round" />
    </svg>
);

const EmbedIcon = () => (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M11 9 4 16l7 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 9l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 5.5l-5 21" strokeLinecap="round" />
    </svg>
);

const MicIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

/* ------------------------------- Animation presets ------------------------------- */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

const cardFadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } },
};

/* ---------------------------------- Data ---------------------------------- */

const FEATURES = [
    {
        icon: <WaveIcon />,
        title: "Talks in your tone",
        copy: "Match voice, personality and speaking style to your brand instantly.",
    },
    {
        icon: <DocIcon />,
        title: "Trained on your content",
        copy: "Point it at your docs or site. It learns and answers accurately.",
    },
    {
        icon: <EmbedIcon />,
        title: "One script tag to embed",
        copy: "Copy, paste, done. Live on your site in under two minutes.",
    },
];

/* ------------------------------------------------------------------ */
/*  Dual-layer mouse spotlight                                         */
/* ------------------------------------------------------------------ */
const MouseSpotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 55, damping: 28, mass: 0.8 };
    const glowX = useSpring(mouseX, springConfig);
    const glowY = useSpring(mouseY, springConfig);

    const fastSpring = { stiffness: 120, damping: 25 };
    const coreX = useSpring(mouseX, fastSpring);
    const coreY = useSpring(mouseY, fastSpring);

    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, [mouseX, mouseY]);

    return (
        <>
            <motion.div
                className="mouse-glow mouse-glow-outer"
                style={{ left: glowX, top: glowY }}
            />
            <motion.div
                className="mouse-glow mouse-glow-inner"
                style={{ left: coreX, top: coreY }}
            />
        </>
    );
};

/* ------------------------------------------------------------------ */
/*  Ambient floating particles                                         */
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
            // Draw faint connections
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

/* ---------------------------------- Page ---------------------------------- */

export default function Home({ user }) {
    const navigate = useNavigate();
    const previewRef = useRef(null);

    const handleScrollToPreview = () => {
        previewRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="home-page">
            <MouseSpotlight />
            <ParticleCanvas />

            {/* Static ambient glow (top center) */}
            <div className="home-ambient-glow" aria-hidden="true" />

            {/* Subtle grid overlay */}
            <div className="home-grid" aria-hidden="true" />

            <main className="home-main">
                {/* --------------------------- Hero --------------------------- */}
                <motion.section
                    className="home-hero"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.span className="home-eyebrow" variants={fadeUp}>
                        <span className="home-eyebrow-dot" />
                        Voice AI for modern websites
                    </motion.span>

                    <motion.h1 className="home-headline" variants={fadeUp}>
                        Add a <span className="gradient-text">Voice Assistant</span>
                        <br />
                        to your website
                    </motion.h1>

                    {/* Decorative voice wave */}
                    <motion.div className="home-voice-wave" variants={fadeUp} aria-hidden="true">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <span
                                key={i}
                                className="home-voice-bar"
                                style={{
                                    "--h": `${5 + Math.round(22 * Math.abs(Math.sin(i * 0.65 + 1)))}px`,
                                    "--d": `${(i % 7) * 0.14}s`,
                                }}
                            />
                        ))}
                    </motion.div>

                    <motion.p className="home-subtitle" variants={fadeUp}>
                        Create a smart voice-enabled assistant that talks to visitors,
                        answers questions and helps users navigate your website instantly.
                    </motion.p>

                    <motion.div className="home-cta-wrap" variants={fadeUp}>
                        <motion.button
                            className="home-cta"
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate("/builder")}
                        >
                            <MicIcon />
                            Build Your Assistant
                        </motion.button>
                        <motion.button
                            className="home-cta-secondary"
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleScrollToPreview}
                        >
                            View demo
                            <ArrowRightIcon />
                        </motion.button>
                    </motion.div>

                    <motion.p className="home-caption" variants={fadeUp}>
                        Free plan includes 200 AI responses
                    </motion.p>
                </motion.section>

                {/* ------------------------- Features ------------------------- */}
                <motion.section
                    className="home-features"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    {FEATURES.map((f, i) => (
                        <motion.div
                            className="home-feature"
                            key={f.title}
                            variants={cardFadeUp}
                            whileHover={{ y: -6, transition: { duration: 0.3 } }}
                        >
                            <div className="home-feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.copy}</p>
                            <div className="home-feature-shine" />
                        </motion.div>
                    ))}
                </motion.section>

                {/* ---------------------- Preview Area ---------------------- */}
                <section className="home-preview" ref={previewRef} id="preview">
                    <div className="home-preview-label">
                        <span className="home-preview-dot" />
                        Assistant Preview
                    </div>
                    <AssistantPreview user={user} />
                </section>
                <Steps />
                <Footer />
            </main>
        </div>
    );
}