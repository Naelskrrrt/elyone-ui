import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@uidotdev/usehooks";
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UrlParams {
    ct_num: string;
    deal_id: string;
    hubspot_id: string;
    owner_email: string;
    uuid: string;
}

interface UrlParamsContextProps {
    params: UrlParams | null;
    setParams: React.Dispatch<React.SetStateAction<UrlParams | null>>;
}

// Créez le contexte
const UrlParamsContext = createContext<UrlParamsContextProps | undefined>(
    undefined
);

// Fournisseur du contexte
export const UrlParamsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [params, setParams] = useLocalStorage<UrlParams | null>(
        "params",
        null
    );
    const [missingParams, setMissingParams] = useState<string[]>([]);

    useEffect(() => {
        const checkParams = () => {
            const searchParams = new URLSearchParams(window.location.search);
            const requiredParams = [
                { key: "id_erp", name: "ID ERP" },
                { key: "deal_id", name: "ID Deal" },
                { key: "hubspot_id", name: "ID Hubspot" },
                // { key: "owner_email", name: "Email propriétaire" },
            ];

            const missing = requiredParams
                .filter((param) => !searchParams.has(param.key))
                .map((param) => param.name);

            setMissingParams(missing);
        };

        if (!params) {
            checkParams();
        }
    }, [params]);

    useEffect(() => {
        if (!params && missingParams.length === 0) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get("id_erp") === null) return;
            if (searchParams.get("deal_id") === null) return;
            if (searchParams.get("hubspot_id") === null) return;
            // if (searchParams.get("owner_email") === null) return;
            const ct_num =
                searchParams.get("id_erp") || searchParams.get("ct_num") || "";
            const deal_id = searchParams.get("deal_id") || "";
            const hubspot_id = searchParams.get("hubspot_id") || "";
            const owner_email = searchParams.get("owner_email") || "";
            const uuid = uuidv4();

            setParams({
                ct_num,
                deal_id,
                hubspot_id,
                owner_email,
                uuid,
            });
        }
    }, [params, setParams, missingParams]);
    return (
        <UrlParamsContext.Provider value={{ params, setParams }}>
            {/* Dialogue d'avertissement */}
            <Dialog open={missingParams.length > 0}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Paramètres manquants</DialogTitle>
                        <DialogDescription>
                            Les paramètres suivants sont requis mais manquants
                            dans l'URL :
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 py-4">
                        <ul className="list-disc pl-4 text-red-500">
                            {missingParams.map((param, index) => (
                                <li key={index}>{param}</li>
                            ))}
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            Utiliser le lien dans Hubspot pour vous connecter à
                            cette applications
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <a href="https://www.hubspot.com">
                            <Button
                                variant="default"
                                className="bg-hubspot-500 hover:bg-hubspot-500/80"
                            >
                                Allez vers Hubspot
                            </Button>
                        </a>
                    </div>
                </DialogContent>
            </Dialog>

            {children}
        </UrlParamsContext.Provider>
    );
};

// Hook pour utiliser le contexte
export const useUrlParams = () => {
    const context = useContext(UrlParamsContext);
    if (!context) {
        throw new Error("useUrlParams must be used within a UrlParamsProvider");
    }
    return context;
};
