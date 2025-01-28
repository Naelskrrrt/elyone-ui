import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useFetchClient } from "@/hooks/useFetchUsers";
import { useUrlParams } from "@/context/UrlParamsContext";

// import ShadcnKit from "@/components/icons/shadcn-kit";
// import { nanoid } from "nanoid";
// import Link from "next/link";

const Navbar = () => {
    const where = useLocation();
    const { params } = useUrlParams();

    // console.log(where);
    const { data: user, isLoading } = useFetchClient({
        id_erp: params?.ct_num as string,
        hubspot_id: params?.hubspot_id as string,
    });

    return (
        <Card className="bg-card py-3 w-full px-4 border-0 flex items-center justify-between gap-6 sticky top-0 flex-wrap">
            <div className="flex gap-12 items-center flex-wrap">
                <img
                    src="https://www.elyone.com/hubfs/Design%20sans%20titre%20(77).svg"
                    alt="logo elyone"
                    className="h-10 w-26 pointer-events-none"
                />
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
            <div className="flex flex-col gap-0">
                <span className="text-slate-400 text-xs font-semibold">
                    Client
                </span>
                <h1 className="text-nextblue-500 font-bold text-xl">
                    {isLoading ? "-" : user?.client_name}
                    {/* {user?.client_name} */}
                </h1>
            </div>
        </Card>
    );
};

export default Navbar;
