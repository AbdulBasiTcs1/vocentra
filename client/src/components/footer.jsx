import { motion } from "framer-motion";
import "./Footer.css";

/* ---------------------------------- Icons ---------------------------------- */

const LinkedInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

const YouTubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
);

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l11.7 16h3.6L8.3 4z" />
        <path d="M4 20L15.7 4h3.6L7.7 20z" opacity="0" />
        <path d="M18.2 4l-6.4 7.2L20 20h-3.6L9.8 11.2 4 20V4h3.6l6.2 7L18.2 4z" />
    </svg>
);

/* ---------------------------------- Data ---------------------------------- */

const LINKS = [
    {
        title: "Product",
        items: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Demo", href: "#demo" },
            { label: "Changelog", href: "#changelog" },
            { label: "Roadmap", href: "#roadmap" },
        ],
    },
    {
        title: "Company",
        items: [
            { label: "About", href: "#about" },
            { label: "Blog", href: "#blog" },
            { label: "Careers", href: "#careers" },
            { label: "Press", href: "#press" },
        ],
    },
    {
        title: "Resources",
        items: [
            { label: "Documentation", href: "#docs" },
            { label: "API Reference", href: "#api" },
            { label: "Support", href: "#support" },
            { label: "Community", href: "#community" },
            { label: "GitHub", href: "https://github.com" },
        ],
    },
    {
        title: "Legal",
        items: [
            { label: "Privacy", href: "#privacy" },
            { label: "Terms", href: "#terms" },
            { label: "Cookies", href: "#cookies" },
            { label: "Security", href: "#security" },
        ],
    },
];

const SOCIALS = [
    { icon: <XIcon />, label: "X / Twitter", href: "https://twitter.com" },
    { icon: <LinkedInIcon />, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: <GitHubIcon />, label: "GitHub", href: "https://github.com" },
    { icon: <YouTubeIcon />, label: "YouTube", href: "https://youtube.com" },
];

/* ---------------------------------- Component ------------------------------- */

export default function Footer() {
    return (
        <motion.footer
            className="site-footer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="footer-inner">
                {/* Top row: brand (left) + links (right) */}
                <div className="footer-top">
                    <div className="footer-brand">
                        <span className="footer-logo">Vocentra</span>
                        <p className="footer-tagline">
                            Voice AI for modern websites. Train, customize and deploy in minutes.
                        </p>
                        <div className="footer-socials">
                            {SOCIALS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    className="social-link"
                                    aria-label={s.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="footer-columns">
                        {LINKS.map((col) => (
                            <nav key={col.title} className="footer-col" aria-label={col.title}>
                                <h4>{col.title}</h4>
                                <ul>
                                    {col.items.map((item) => (
                                        <li key={item.label}>
                                            <a href={item.href}>{item.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                {/* Bottom row: copyright (left) + legal (right) */}
                <div className="footer-bottom">
                    <p>© 2026 Vocentra. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="#privacy">Privacy</a>
                        <a href="#terms">Terms</a>
                        <a href="#cookies">Cookies</a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}