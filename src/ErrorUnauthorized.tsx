import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./context/AuthProvider";
import { useNavigate } from "react-router";

const ErrorUnauthorized: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-extrabold text-nextblue-300">
                    403
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Oups, Vous n'avez pas accès à cette Transaction.
                </p>
                <p className="mt-2 text-gray-500">
                    Vous n'avez pas accès à cette transaction HubSpot. Veuillez
                    contacter votre administrateur.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                    <Button
                        variant="default"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        Se Deconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ErrorUnauthorized;
