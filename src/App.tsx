import { useEffect, useState } from "react";
import Loader from "./components/loader/loader";
import Navbar from "./components/Navbar";
import { Icon } from "@iconify/react";
import { Button } from "./components/ui/button";

const App = () => {
    const [loading, setLoading] = useState<boolean>(true); // Loader activé initialement

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); // Désactiver le loader après le montage des composants
        }, 500); // Délai pour simuler le chargement des composants

        return () => clearTimeout(timer); // Nettoyage du timer
    }, []);

    return (
        <div className="w-screen h-screen relative flex flex-col gap-2 ">
            <Navbar />
            {loading ? (
                <Loader />
            ) : (
                <div className=" container flex w-full relative h-full flex-col gap-3 mb-1">
                    <div className="py-4 px-5 flex flex-col h-fit w-fit gap-2  rounded-md border border-slate-100">
                        <p className="text-slate-900 text-sm font-medium">
                            {" "}
                            Article du client
                        </p>
                        <h2 className="text-3xl font-bold text-nextblue-500">
                            {"John Doe"}
                        </h2>
                    </div>
                    <div className="border-slate-100 border flex flex-col relative w-full h-full rounded-sm ">
                        <div className="w-full h-fit p-3 relative flex justify-between flex-wrap gap-2">
                            <Button
                                className="bg-green-500  font-medium hover:bg-green-500/85 hover:text-slate-50"
                                size={"sm"}
                            >
                                <Icon
                                    icon={"solar:cart-check-broken"}
                                    width={24}
                                    height={24}
                                    className="scale-125"
                                />
                                Valider le panier
                            </Button>
                            <Button
                                className=" hover:text-slate-50"
                                size={"sm"}
                            >
                                <Icon
                                    icon={"lucide:plus"}
                                    width={24}
                                    height={24}
                                    className="scale-125"
                                />
                                Ajouter un article
                            </Button>
                        </div>
                        <div className="w-full h-full overflow-y-auto relative bg-slate-100/80 backdrop:blur-sm">
                            {/* Here is the data table */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
