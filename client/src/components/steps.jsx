import React from "react";
import { motion } from "framer-motion";
import "./steps.css";

const STEPS = [
    { n: "01", title: "Sign up free", copy: "Continue with Google and create your assistant instantly." },
    { n: "02", title: "Customize assistant", copy: "Set your business name, tone, voice and theme." },
    { n: "03", title: "Train your assistant", copy: "Add business details and personalize responses." },
    { n: "04", title: "Embed anywhere", copy: "Copy one script tag and add it to your website." },
];

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
};

const cardReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function Steps() {
    return (
        <motion.section
            className="home-steps"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
        >
            <motion.div className="home-steps-header" variants={fadeUp}>
                <h2>Get started in minutes</h2>
                <p>Simple setup. No complicated integration.</p>
            </motion.div>

            <div className="home-steps-grid">
                {STEPS.map((step, i) => (
                    <motion.div
                        className="home-step"
                        key={step.n}
                        variants={cardReveal}
                        custom={i * 0.1}
                    >
                        <span className="home-step-number">{step.n}</span>
                        <h3>{step.title}</h3>
                        <p>{step.copy}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}