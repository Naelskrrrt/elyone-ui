import TokenService from "@/services/TokenManagerService";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    // allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const session =
        TokenService.getAccessToken() || TokenService.getRefreshToken();
    const location = useLocation();

    if (!session) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
export default ProtectedRoute;
