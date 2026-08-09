import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import { serverUrl } from "../App";
import axios from "axios";
import "./Login.css";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.6z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 009 18z" />
        <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.16.27-1.7V4.97H.98A9 9 0 000 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 00.98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
);

const MicGlyph = () => (
    <svg viewBox="0 0 120 160" width="144" height="192" className="mic-svg">
        <defs>
            <linearGradient id="micBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0E6E9" />
                <stop offset="35%" stopColor="#B0B8BC" />
                <stop offset="65%" stopColor="#4A5C63" />
                <stop offset="100%" stopColor="#1B2B2F" />
            </linearGradient>
            <linearGradient id="micStand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8A9296" />
                <stop offset="100%" stopColor="#0C171B" />
            </linearGradient>
        </defs>
        <rect x="38" y="4" width="44" height="82" rx="22" fill="url(#micBody)" stroke="#000" strokeOpacity="0.25" />
        <path d="M20 66 v14 a40 40 0 0080 0 v-14" fill="none" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
        <line x1="60" y1="120" x2="60" y2="146" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
        <line x1="36" y1="150" x2="84" y2="150" stroke="url(#micStand)" strokeWidth="7" strokeLinecap="round" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const name = user.displayName || user.email;
            const email = user.email;

            const res = await axios.post(
                `${serverUrl}/api/auth/google`,
                { name, email },
                { withCredentials: true }
            );

            console.log(res.data);

            if (res.status === 200) {
                navigate("/");
            }
        } catch (error) {
            console.error("Google auth error:", error);
            setErrorMessage(
                error?.response?.data?.message || error?.message || "Failed to sign in with Google."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-glow" aria-hidden="true" />

            <div className="login-center">
                <div className="mic-wrap">
                    <div className="mic-3d">
                        <MicGlyph />
                    </div>
                    <div className="mic-shadow" />
                </div>

                <h1 className="login-word">Vocentra</h1>
                <p className="login-caption">Your website's voice, ready when you are.</p>
            </div>

            <div className="login-actions">
                {errorMessage && (
                    <div style={{ color: "#ff8a80", fontSize: "13px", textAlign: "center", marginBottom: "8px" }}>
                        {errorMessage}
                    </div>
                )}
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="btn-google"
                    disabled={loading}
                >
                    <GoogleIcon />
                    {loading ? "Signing in..." : "Continue with Google"}
                </button>
                <button
                    type="button"
                    className="btn-email"
                    disabled={loading}
                >
                    Continue with email
                </button>
                <p className="login-legal">
                    By continuing you agree to Vocentra's <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}