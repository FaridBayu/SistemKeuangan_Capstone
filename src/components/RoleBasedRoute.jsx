// src/components/RoleBasedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const RoleBasedRoute = ({ allowedRoles }) => {
    const role = Cookies.get("role");

  // Belum login sama sekali ➜ lempar ke halaman Login
    if (!role) return <Navigate to="/Login" replace />;

  // Role ada tapi bukan yang diizinkan ➜ lempar ke halaman Unauthorized
    if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  // Role cocok ➜ tampilkan anak-route di dalamnya
return <Outlet />;
};

export default RoleBasedRoute;
