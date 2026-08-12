import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import "./Navbar.css";

/* ---------------------------------- Icons ---------------------------------- */

// Same mic mark as the login screen, scaled down for the brand mark.
const MicGlyphSmall = () => (
    <svg viewBox="0 0 120 160" width="22" height="29" className="brand-mic-svg" aria-hidden="true">
        <defs>
            <linearGradient id="navMicBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0E6E9" />
                <stop offset="35%" stopColor="#B0B8BC" />
                <stop offset="65%" stopColor="#4A5C63" />
                <stop offset="100%" stopColor="#1B2B2F" />
            </linearGradient>
            <linearGradient id="navMicStand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8A9296" />
                <stop offset="100%" stopColor="#0C171B" />
            </linearGradient>
        </defs>
        <rect x="38" y="4" width="44" height="82" rx="22" fill="url(#navMicBody)" />
        <path d="M20 66 v14 a40 40 0 0080 0 v-14" fill="none" stroke="url(#navMicStand)" strokeWidth="9" strokeLinecap="round" />
        <line x1="60" y1="120" x2="60" y2="146" stroke="url(#navMicStand)" strokeWidth="9" strokeLinecap="round" />
        <line x1="36" y1="150" x2="84" y2="150" stroke="url(#navMicStand)" strokeWidth="9" strokeLinecap="round" />
    </svg>
);

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TABS = [
    { id: "builder", label: "Builder", path: "/builder" },
    { id: "billing", label: "Billing", path: "/billing" },
];

/**
 * Props
 *  user        { name?, displayName?, email?, photoURL? } — pass the signed-in user, or omit/null to render nothing
 *  setUser     function to update user state (set to null on logout)
 *  activeTab   "builder" | "billing" (optional override)
 *  onTabChange (tabId) => void
 *  onLogout    () => void
 */
export default function Navbar({ user, setUser, activeTab: propActiveTab, onTabChange, onLogout }) {
    const [open, setOpen] = useState(false);
    const popupRef = useRef(null);
    const triggerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine current active tab from prop or route
    const currentTab = propActiveTab || (location.pathname === "/billing" ? "billing" : "builder");
    const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === currentTab));

    // Close the profile popup on outside click or Escape.
    useEffect(() => {
        if (!open) return;

        const handleClick = (e) => {
            if (
                popupRef.current && !popupRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    if (!user) return null;

    const name = user.name || user.displayName || "";
    const email = user.email || "";
    const initial = (name || email || "?").trim().charAt(0).toUpperCase();

    const handleTabClick = (tab) => {
        if (onTabChange) {
            onTabChange(tab.id);
        }
        navigate(tab.path);
    };

    const handleLogout = async () => {
        setOpen(false);
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
        } catch (err) {
            console.error("Error during logout API call:", err);
        } finally {
            if (setUser) setUser(null);
            if (onLogout) onLogout();
        }
    };

    return (
        <header className="nav-bar">
            <div className="nav-inner">
                <div className="nav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <span className="brand-mic-wrap">
                        <MicGlyphSmall />
                    </span>
                    <span className="brand-word">Vocentra</span>
                </div>

                <nav className="nav-tabs" role="tablist" aria-label="Primary">
                    <span
                        className="nav-tabs-thumb"
                        style={{ transform: `translateX(${activeIndex * 100}%)` }}
                        aria-hidden="true"
                    />
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={currentTab === tab.id}
                            className={`nav-tab${currentTab === tab.id ? " is-active" : ""}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="nav-profile">
                    <button
                        type="button"
                        ref={triggerRef}
                        className="profile-avatar"
                        onClick={() => setOpen((v) => !v)}
                        aria-haspopup="true"
                        aria-expanded={open}
                        aria-label="Account menu"
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="profile-avatar-img" />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </button>

                    {open && (
                        <div className="profile-popup" ref={popupRef} role="menu">
                            <div className="profile-popup-header">
                                <span className="profile-popup-avatar">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" className="profile-avatar-img" />
                                    ) : (
                                        <span>{initial}</span>
                                    )}
                                </span>
                                <div className="profile-popup-info">
                                    <span className="profile-popup-name">{name || "Your account"}</span>
                                    {email && <span className="profile-popup-email">{email}</span>}
                                </div>
                            </div>

                            <div className="profile-popup-divider" />

                            <button
                                type="button"
                                role="menuitem"
                                className="profile-popup-logout"
                                onClick={handleLogout}
                            >
                                <LogoutIcon />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}