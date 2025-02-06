import React from "react";
import { Button } from "@/components/ui/button";

const Error404: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-extrabold text-nextblue-300">
                    404
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Oups, la page que vous cherchez n'existe pas.
                </p>
                <p className="mt-2 text-gray-500">
                    Il est possible que vous ayez saisi une mauvaise URL ou que
                    la page ait été déplacée.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                    <Button
                        variant="default"
                        onClick={() => (window.location.href = "/panier")}
                    >
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Error404;
