import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function RequireAuth({ children, admin = false }) {
    const user = useSelector((state) => state.user);
    const location = useLocation();
    if (!user?.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (admin && user.role !== "admin") return <Navigate to="/chat" replace />;
    return children;
}

export default RequireAuth;
