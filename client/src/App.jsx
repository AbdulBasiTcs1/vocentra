import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Builder from "./pages/Builder";
import Billing from "./pages/Billing";
import Navbar from "./pages/Navbar";
import ProtectedRoute from "./components/protectedRoute";

export const serverUrl = "http://localhost:8000";

function AppRoutes({ user, setUser, loading }) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
                <Routes location={location}>
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute user={user} loading={loading}>
                                <Routes>
                                    <Route path="/" element={<Home user={user} />} />
                                    <Route path="/builder" element={<Builder user={user} setUser={setUser} />} />
                                    <Route path="/billing" element={<Billing user={user} setUser={setUser} />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/user/current-user`, {
                    withCredentials: true,
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error in checkUser:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    return (
        <>
            <Navbar user={user} setUser={setUser} />
            <AppRoutes user={user} setUser={setUser} loading={loading} />
        </>
    );
}

export default App;
