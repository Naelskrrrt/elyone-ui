import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./context/AuthProvider";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { verifyAccess } from "./api/userApi";
import { AxiosError } from "axios";
import { useUrlParams } from "./context/UrlParamsContext";
import Loader from "./components/loader/loader";

const ErrorUnauthorized: React.FC = () => {
    const { logout } = useAuth();
    const [user] = useState(
        JSON.parse(window.localStorage.getItem("user") || "{}")
    );
    const [loading, setLoading] = useState(false);

    const { params } = useUrlParams();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: verifyAccess,
        onSuccess: () => {
            console.log("success");
            navigate("/");
            return;
        },
        onError: (error: AxiosError | any) => {
            console.log(error);
            navigate("/unauthorized");
        },
    });

    useEffect(() => {
        setLoading(true);
        if (params?.hubspot_id) {
            mutation.mutate({
                email: user.email,
                hubspot_id: params.hubspot_id,
            });
        }
        setLoading(false);
    }, [user]);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            {loading ? (
                <Loader />
            ) : (
                <div className="text-center">
                    <h1 className="text-6xl font-extrabold text-orange-300">
                        403
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Oups, Vous n'avez pas accès à cette Transaction.
                    </p>
                    <p className="mt-2 text-gray-500">
                        Vous n'avez pas accès à cette transaction HubSpot.
                        Veuillez contacter votre administrateur.
                    </p>
                    <div className="mt-6 flex justify-center space-x-4 gap-2">
                        <Button
                            variant="default"
                            className="bg-orange-500 hover:bg-orange-500/90"
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                        >
                            Se Deconnecter
                        </Button>
                        <Button
                            variant={"secondary"}
                            onClick={() => {
                                navigate("/");
                            }}
                        >
                            Rafraichir cette page
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorUnauthorized;
