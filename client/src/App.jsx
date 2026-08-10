import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Builder from "./pages/Builder";
import Billing from "./pages/Billing";
import Navbar from "./pages/Navbar";
import ProtectedRoute from "./components/protectedRoute";

export const serverUrl = "http://localhost:8000";

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
            <Routes>
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
        </>
    );
}

export default App;
