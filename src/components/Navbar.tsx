import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useFetchClient } from "@/hooks/useFetchUsers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { QueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";

const Navbar = () => {
    const where = useLocation();
    const { params } = useUrlParams();
    const { logout } = useAuth();
    const queryClient = new QueryClient();

    const {
        data: user,
        isLoading,
        error,
    } = useFetchClient({
        id_erp: params?.ct_num as string,
        hubspot_id: params?.hubspot_id as string,
    });

    console.log("Erreur Recup User", error);

    return (
        <Card className="bg-card py-3 w-full px-4 border-0 flex items-center justify-between gap-6 sticky top-0 flex-wrap">
            <div className="flex gap-12 items-center flex-wrap">
                <div className="flex gap-6 items-center">
                    <img
                        src="https://www.elyone.com/hubfs/Design%20sans%20titre%20(77).svg"
                        alt="logo elyone"
                        className="h-10 w-26 pointer-events-none"
                    />
                    <div className="flex flex-col">
                        {isLoading ? (
                            <span className="text-slate-400 text-xs animate-fade font-semibold">
                                Chargement...
                            </span>
                        ) : (
                            <>
                                <span className="text-slate-400 text-xs font-semibold">
                                    Client
                                </span>
                                <h1 className="text-nextblue-500 font-bold text-xl">
                                    {!user ? "-" : user?.client_name}
                                </h1>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Link
                        to={"/panier"}
                        className={
                            where.pathname == "/panier" ||
                            where.pathname == "/panier/addArticle"
                                ? "text-nextblue-500 text-sm font-semibold bg-nextblue-50 h-fit w-fit px-8 py-2 rounded-full"
                                : "text-slate-500 text-sm font-medium  h-fit w-fit px-8 py-2 rounded-full"
                        }
                    >
                        Panier
                    </Link>
                    <Link
                        to={"/panier/history"}
                        className={
                            where.pathname == "/panier/history"
                                ? "text-nextblue-500 text-sm font-semibold bg-nextblue-50 h-fit w-fit px-8 py-2 rounded-full"
                                : "text-slate-500 text-sm font-medium  h-fit w-fit px-8 py-2 rounded-full"
                        }
                    >
                        {" "}
                        Historique
                    </Link>
                </div>
            </div>
            <div className="flex gap-3 items-center">
                <Link
                    to={"/modify-password"}
                    title="Modifier le mot de passe de l'utilisateur"
                >
                    <Button
                        size={"icon"}
                        className="bg-nextblue-100 text-nextblue-500 hover:bg-nextblue-100/85"
                        onClick={() => {}}
                    >
                        <Icon icon={"lucide:cog"} />
                    </Button>
                </Link>
                <Link to={"/"} title="Déconnexion">
                    <Button
                        size={"icon"}
                        className="bg-red-100 text-red-500 hover:bg-red-100/85"
                        onClick={() => {
                            logout();
                            queryClient.invalidateQueries({
                                queryKey: ["pannier"],
                            });
                            queryClient.invalidateQueries({
                                queryKey: ["articles"],
                            });
                        }}
                    >
                        <Icon icon={"lucide:log-out"} />
                    </Button>
                </Link>
            </div>
        </Card>
    );
};

export default Navbar;
