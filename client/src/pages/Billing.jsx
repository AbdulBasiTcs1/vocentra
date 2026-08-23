import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic,
    Bot,
    CreditCard,
    Check,
    Sparkles,
    Zap,
    Building2,
    ArrowRight,
    X,
    MessageSquare,
    Mail,
    Phone,
    Calendar,
    ChevronDown,
    HelpCircle,
    Clock,
    Shield,
    Globe,
    Cpu,
    Headphones,
    Send,
    Copy,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Users,
    BarChart3,
    Layers,
} from "lucide-react";
import "./Billing.css";

/* ------------------------------------------------------------------ */
/*  Data constants                                                     */
/* ------------------------------------------------------------------ */

const PRICING_TIERS = [
    {
        id: "starter",
        name: "Free Starter",
        description: "Perfect for prototyping and personal projects.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "100 voice minutes / mo",
            "3 AI assistants",
            "5 GB storage",
            "Standard voices",
            "Community support",
        ],
        cta: "Current Plan",
        highlighted: false,
        icon: <Zap size={20} />,
    },
    {
        id: "pro",
        name: "Pro Creator",
        description: "For creators ready to scale their voice operations.",
        monthlyPrice: 29,
        yearlyPrice: 24,
        features: [
            "1,500 voice minutes / mo",
            "Unlimited assistants",
            "50 GB storage",
            "Custom voice cloning",
            "Priority support",
            "API access",
            "Webhook integrations",
        ],
        cta: "Upgrade Now",
        highlighted: true,
        badge: "Most Popular",
        icon: <Sparkles size={20} />,
    },
    {
        id: "agency",
        name: "Agency Scale",
        description: "Built for teams managing multiple client accounts.",
        monthlyPrice: 79,
        yearlyPrice: 66,
        features: [
            "Unlimited voice minutes",
            "Unlimited assistants",
            "250 GB storage",
            "White-label options",
            "Dedicated infrastructure",
            "SLA & 24/7 support",
            "Team collaboration",
            "Advanced analytics",
        ],
        cta: "Contact Sales",
        highlighted: false,
        icon: <Building2 size={20} />,
    },
];

const SERVICES = [
    {
        id: "agent-dev",
        icon: <Cpu size={28} />,
        title: "Custom Agent Development",
        subtitle: "End-to-end prompt engineering",
        description:
            "We architect, test, and deploy bespoke AI voice agents tailored to your brand voice, compliance requirements, and conversion goals.",
        price: "From $399",
        cta: "Request Quote",
        tags: ["Prompt Engineering", "Testing", "Deployment"],
    },
    {
        id: "crm-integration",
        icon: <Layers size={28} />,
        title: "CRM & Webhook Automation",
        subtitle: "Connect your entire stack",
        description:
            "Native integrations with HubSpot, Salesforce, Calendly, Twilio, and Zapier. We build the pipes so your data flows automatically.",
        price: "From $249",
        cta: "Request Integration",
        tags: ["HubSpot", "Zapier", "Twilio"],
    },
    {
        id: "voice-clone",
        icon: <Mic size={28} />,
        title: "Custom Voice Cloning",
        subtitle: "High-fidelity brand voice",
        description:
            "Studio-grade voice cloning with multi-lingual tuning, emotional range calibration, and pronunciation lexicon building.",
        price: "From $599",
        cta: "Book Studio Setup",
        tags: ["Multi-lingual", "Emotion Tuning", "Lexicon"],
    },
    {
        id: "consultation",
        icon: <Headphones size={28} />,
        title: "1-on-1 Strategy & Setup Call",
        subtitle: "45-min Zoom deep-dive",
        description:
            "A focused session with our senior AI architects to audit your current workflow and build a 90-day voice AI implementation roadmap.",
        price: "$100",
        cta: "Schedule Call",
        tags: ["Roadmap", "Audit", "Q&A"],
    },
];

const FAQS = [
    {
        question: "How do voice minutes work?",
        answer:
            "Voice minutes are calculated based on the total duration of AI-generated speech output. One minute equals roughly 150 words of synthesized audio. Unused minutes do not roll over on the Free plan, but Pro and Agency plans include rollover for up to 3 months.",
    },
    {
        question: "Can I bring my own API keys?",
        answer:
            "Yes. Pro and Agency plans allow you to connect your own OpenAI, Deepgram, Cartesia, or ElevenLabs API keys. This is ideal if you have existing vendor relationships or volume discounts. We simply orchestrate the pipeline — you maintain direct billing with providers.",
    },
    {
        question: "How does custom agent delivery work?",
        answer:
            "After you submit a service request, our team schedules a 30-min discovery call within 24 hours. We then deliver a functional prototype within 5–7 business days. Revisions are included for 14 days post-delivery.",
    },
    {
        question: "Is there a refund policy?",
        answer:
            "SaaS subscriptions can be cancelled anytime. We offer a 14-day money-back guarantee on your first Pro or Agency payment, no questions asked. Custom professional services are billed 50% upfront and 50% on delivery.",
    },
    {
        question: "Do you offer annual discounts?",
        answer:
            "Absolutely. Annual billing saves you 20% compared to month-to-month. Agency plans also include 2 free strategy calls per year when billed annually.",
    },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const ProgressBar = ({ used, total, label, unit = "" }) => {
    const pct = Math.min((used / total) * 100, 100);
    return (
        <div className="usage-card">
            <div className="usage-header">
                <span className="usage-label">{label}</span>
                <span className="usage-fraction">
                    {used}
                    {unit} / {total}
                    {unit}
                </span>
            </div>
            <div className="usage-track">
                <motion.div
                    className="usage-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
                />
            </div>
        </div>
    );
};

const PricingCard = ({ tier, cycle, onSelect }) => {
    const price = cycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
    const isFree = price === 0;

    return (
        <motion.div
            className={`pricing-card ${tier.highlighted ? "pricing-card--featured" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
        >
            {tier.badge && (
                <div className="pricing-badge">
                    <Sparkles size={12} />
                    {tier.badge}
                </div>
            )}

            <div className="pricing-icon-wrap">{tier.icon}</div>

            <h3 className="pricing-name">{tier.name}</h3>
            <p className="pricing-desc">{tier.description}</p>

            <div className="pricing-price-wrap">
                {isFree ? (
                    <span className="pricing-price">Free</span>
                ) : (
                    <>
                        <span className="pricing-price">${price}</span>
                        <span className="pricing-period">/mo</span>
                    </>
                )}
                {!isFree && cycle === "yearly" && (
                    <span className="pricing-saved">Save 20%</span>
                )}
            </div>

            <ul className="pricing-features">
                {tier.features.map((f, i) => (
                    <li key={i} className="pricing-feature">
                        <Check size={15} className="pricing-feature-icon" />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

            <motion.button
                className={`pricing-cta ${tier.highlighted ? "pricing-cta--primary" : "pricing-cta--secondary"}`}
                onClick={() => onSelect(tier)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                {tier.cta}
                <ArrowRight size={15} />
            </motion.button>
        </motion.div>
    );
};

const ServiceCard = ({ service, onOpen }) => {
    return (
        <motion.div
            className="service-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="service-card-glow" />
            <div className="service-icon-wrap">{service.icon}</div>

            <div className="service-meta">
                <h4 className="service-title">{service.title}</h4>
                <p className="service-subtitle">{service.subtitle}</p>
            </div>

            <p className="service-desc">{service.description}</p>

            <div className="service-tags">
                {service.tags.map((t) => (
                    <span key={t} className="service-tag">
                        {t}
                    </span>
                ))}
            </div>

            <div className="service-footer">
                <span className="service-price">{service.price}</span>
                <motion.button
                    className="service-btn"
                    onClick={() => onOpen(service)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {service.cta}
                    <ArrowRight size={14} />
                </motion.button>
            </div>
        </motion.div>
    );
};

const FAQItem = ({ item, index, openIndex, setOpenIndex }) => {
    const isOpen = openIndex === index;
    return (
        <motion.div
            className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <button className="faq-trigger" onClick={() => setOpenIndex(isOpen ? null : index)}>
                <span className="faq-question">{item.question}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={18} className="faq-chevron" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        className="faq-answer-wrap"
                    >
                        <p className="faq-answer">{item.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ServiceModal = ({ service, onClose }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        contactMethod: "email",
        timeline: "1-2 weeks",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!service) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const contactText = `Hi Vocentra Team,\n\nI'm interested in: ${service.title}\nBudget/Price: ${service.price}\nTimeline: ${form.timeline}\n\n${form.message}\n\n— ${form.name} (${form.email})`;

    const handleCopy = () => {
        navigator.clipboard.writeText(contactText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {!submitted ? (
                    <>
                        <div className="modal-header">
                            <div className="modal-icon">{service.icon}</div>
                            <h3 className="modal-title">{service.title}</h3>
                            <p className="modal-subtitle">{service.subtitle}</p>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preferred Contact</label>
                                    <div className="form-segmented">
                                        {[
                                            { id: "email", icon: <Mail size={14} />, label: "Email" },
                                            { id: "whatsapp", icon: <Phone size={14} />, label: "WhatsApp" },
                                            { id: "telegram", icon: <Send size={14} />, label: "Telegram" },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                className={`segment-btn ${form.contactMethod === opt.id ? "segment-btn--active" : ""}`}
                                                onClick={() => setForm({ ...form, contactMethod: opt.id })}
                                            >
                                                {opt.icon}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Timeline</label>
                                    <select
                                        value={form.timeline}
                                        onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                                    >
                                        <option>ASAP</option>
                                        <option>1-2 weeks</option>
                                        <option>1 month</option>
                                        <option>Flexible</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Project Details</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your requirements, existing stack, and goals..."
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    required
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="modal-submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Send size={16} />
                                Send Inquiry
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <motion.div
                        className="modal-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="success-ring">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3>Inquiry Received</h3>
                        <p>We typically reply within 24 hours. You can also reach us directly:</p>

                        <div className="success-actions">
                            <button className="success-btn success-btn--copy" onClick={handleCopy}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Details"}
                            </button>
                            <a
                                href={`mailto:abdulbasit.prodev@gmail.com?subject=${encodeURIComponent(
                                    `Inquiry: ${service.title}`
                                )}&body=${encodeURIComponent(contactText)}`}
                                className="success-btn success-btn--primary"
                            >
                                <Mail size={16} />
                                Open Email
                            </a>
                            <a
                                href={`https://wa.me/923474288135?text=${encodeURIComponent(contactText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="success-btn success-btn--whatsapp"
                            >
                                <MessageSquare size={16} />
                                WhatsApp
                            </a>
                        </div>

                        <p className="success-note">
                            Direct WhatsApp: <strong>+92 347 4288135</strong> &bull; Email: <strong>abdulbasit.prodev@gmail.com</strong>
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Billing({ user, setUser }) {
    const [billingCycle, setBillingCycle] = useState("monthly");
    const [modalService, setModalService] = useState(null);
    const [openFaq, setOpenFaq] = useState(0);
    const [showWaitlist, setShowWaitlist] = useState(null);

    // Dynamic metrics calculated from logged-in user
    const usedMessages = user?.totalMessages || 0;
    const maxMessages = user?.requestLimit || 200;
    const pagesCount = user?.pages?.length || 0;
    const maxPages = 10;
    const isPro = user?.plan === "pro";
    const hasCustomKey = Boolean(user?.geminiApiKey);

    const handleTierSelect = (tier) => {
        if (tier.id === "starter") return;
        if (tier.monthlyPrice > 0) {
            setShowWaitlist(tier);
        }
    };

    return (
        <div className="billing-page">
            {/* Ambient background */}
            <div className="billing-ambient" />
            <div className="billing-glow" />

            <div className="billing-container">
                {/* Header */}
                <motion.header
                    className="billing-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    <div className="eyebrow">
                        <CreditCard size={13} />
                        <span>Billing & Services</span>
                    </div>
                    <h1 className="billing-title">Manage your workspace</h1>
                    <p className="billing-lead">
                        {user?.email ? (
                            <>Workspace for <strong style={{ color: "var(--p0)" }}>{user.email}</strong>. </>
                        ) : null}
                        Track your live quotas, upgrade your plan, or book custom AI engineering.
                    </p>
                </motion.header>

                {/* Usage Overview */}
                <motion.section
                    className="usage-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    <div className="section-header">
                        <BarChart3 size={18} />
                        <h2>Usage & Quotas</h2>
                        <span className={`plan-badge ${isPro ? "plan-badge--pro" : "plan-badge--free"}`}>
                            {isPro ? "Pro Plan" : "Free Plan"}
                        </span>
                    </div>

                    <div className="usage-grid">
                        <ProgressBar
                            used={usedMessages}
                            total={maxMessages}
                            label="AI Interaction Quota"
                            unit=" reqs"
                        />
                        <ProgressBar
                            used={pagesCount}
                            total={maxPages}
                            label="Knowledge & Nav Pages"
                            unit=" pgs"
                        />
                        <div className="usage-card">
                            <div className="usage-header">
                                <span className="usage-label">AI Engine Model</span>
                                <span className="usage-fraction">
                                    {hasCustomKey ? "BYOK Gemini Active" : "Vocentra Standard"}
                                </span>
                            </div>
                            <div className="usage-track">
                                <div
                                    className="usage-fill"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Pricing Tiers */}
                <section className="pricing-section">
                    <div className="section-header section-header--center">
                        <div className="pricing-toggle-wrap">
                            <span className={`toggle-label ${billingCycle === "monthly" ? "toggle-label--active" : ""}`}>
                                Monthly
                            </span>
                            <button
                                className="billing-toggle"
                                onClick={() => setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
                                aria-label="Toggle billing cycle"
                            >
                                <motion.div
                                    className="billing-toggle-knob"
                                    animate={{ x: billingCycle === "yearly" ? 28 : 2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            </button>
                            <span className={`toggle-label ${billingCycle === "yearly" ? "toggle-label--active" : ""}`}>
                                Yearly
                            </span>
                            {billingCycle === "yearly" && (
                                <motion.span
                                    className="toggle-save"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    Save 20%
                                </motion.span>
                            )}
                        </div>
                    </div>

                    <div className="pricing-grid">
                        {PRICING_TIERS.map((tier) => (
                            <PricingCard key={tier.id} tier={tier} cycle={billingCycle} onSelect={handleTierSelect} />
                        ))}
                    </div>
                </section>

                {/* Professional Services */}
                <section className="services-section">
                    <div className="section-header">
                        <Users size={18} />
                        <h2>Done-For-You AI Services</h2>
                    </div>
                    <p className="section-lead">
                        Skip the learning curve. Our senior engineers build, integrate, and tune everything for you.
                    </p>

                    <div className="services-grid">
                        {SERVICES.map((service) => (
                            <ServiceCard key={service.id} service={service} onOpen={setModalService} />
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="faq-section">
                    <div className="section-header">
                        <HelpCircle size={18} />
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-list">
                        {FAQS.map((faq, i) => (
                            <FAQItem key={i} item={faq} index={i} openIndex={openFaq} setOpenIndex={setOpenFaq} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modalService && (
                    <ServiceModal service={modalService} onClose={() => setModalService(null)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showWaitlist && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowWaitlist(null)}
                    >
                        <motion.div
                            className="modal-content modal-content--compact"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setShowWaitlist(null)}>
                                <X size={20} />
                            </button>
                            <div className="waitlist-body">
                                <div className="waitlist-icon">
                                    <Sparkles size={32} />
                                </div>
                                <h3>{showWaitlist.name}</h3>
                                <p>
                                    We're finalizing our payment infrastructure. Join the early-access list and get{" "}
                                    <strong>2 months free</strong> when we launch.
                                </p>
                                <div className="waitlist-input-row">
                                    <input type="email" placeholder="Enter your email" defaultValue="" />
                                    <button className="waitlist-btn">Join Waitlist</button>
                                </div>
                                <p className="waitlist-note">No spam. Unsubscribe anytime.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative waveform footer */}
            <div className="billing-waveform">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="billing-waveform-bar"
                        style={{
                            "--h": `${Math.random() * 50 + 12}px`,
                            "--d": `${i * 0.07}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}