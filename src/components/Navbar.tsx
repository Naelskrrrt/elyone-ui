import { Card } from "@/components/ui/card";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useFetchClient } from "@/hooks/useFetchUsers";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/AuthProvider";
import { usePannier } from "@/hooks/usePannier";
import { useEffect, useState } from "react";
import { Commandes } from "@/types/Article";
import { deleteCommandes } from "@/api/commandeApi";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const where = useLocation();
    const { params } = useUrlParams();
    const { logout } = useAuth();
    const queryClient = new QueryClient();

    const [commandeState, setCommande] = useState<Commandes[] | null>(null);
    const [userData, setUser] = useState<any | null>(null);

    useEffect(() => {
        const token = window.localStorage.getItem("access");
        const user = jwtDecode<any>(token as string);
        setUser(user);
    }, []);

    const { data: commande } = usePannier({
        uuid: userData?.email as string,
    });

    useEffect(() => {
        if (commande?.articles) {
            setCommande(commande.articles);
        }
        console.log(commande);
    }, [commande?.articles]);

    const handleDeleteRow = async (articleId: number[], uuid: string) => {
        if (!uuid) return;

        const response = await deleteCommandes(articleId.join(","), uuid);
        toast.success("Article supprimé !");
        queryClient.invalidateQueries({ queryKey: ["pannier"] });
        console.log(response);
        if (response.success == false) {
            toast.error("Échec de la suppression");
        }
        return response;
    };

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
            <div className="flex gap-16 items-center">
                <Link to={"/"}>
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
                            const articleIds =
                                commandeState?.map((item) => item.id) || [];
                            handleDeleteRow(
                                articleIds,
                                userData.email as string
                            );
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
