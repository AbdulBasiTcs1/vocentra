import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, loading, children }) {
    if(loading){
        return <div>Loading...</div>
    }
    if(!user){
        return <Navigate to="/login" replace />
    }
    return children;
}

export default ProtectedRoute;