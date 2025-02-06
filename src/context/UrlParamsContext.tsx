import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSessionStorage } from "@uidotdev/usehooks";
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UrlParams {
    ct_num: string;
    deal_id: string;
    hubspot_id: string;
    owner_email: string;
}

interface UrlParamsContextProps {
    params: UrlParams | null;
    setParams: React.Dispatch<React.SetStateAction<UrlParams | null>>;
}

const UrlParamsContext = createContext<UrlParamsContextProps | undefined>(
    undefined
);

export const UrlParamsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // Génération d'un ID unique pour l'onglet
    const [tabId] = useState(() => {
        const storedTabId = sessionStorage.getItem("hubspotTabId");
        return storedTabId || uuidv4();
    });

    // Stockage dans sessionStorage avec la clé unique
    const [params, setParams] = useSessionStorage<UrlParams | null>(
        `params-${tabId}`,
        null
    );

    const [missingParams, setMissingParams] = useState<string[]>([]);

    // Synchronisation de l'ID d'onglet dans sessionStorage
    useEffect(() => {
        sessionStorage.setItem("hubspotTabId", tabId);
    }, [tabId]);

    // Vérification et initialisation des paramètres
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        const requiredParams = ["id_erp", "deal_id", "hubspot_id"];
        const missing = requiredParams.filter(
            (param) => !searchParams.get(param)
        );

        if (missing.length === 0 && !params) {
            // Si tous les paramètres sont présents et `params` n'est pas encore défini
            const newParams = {
                ct_num: searchParams.get("id_erp") || "",
                deal_id: searchParams.get("deal_id") || "",
                hubspot_id: searchParams.get("hubspot_id") || "",
                owner_email: searchParams.get("owner_email") || "",
            };
            setParams(newParams);
        } else if (missing.length > 0 && !params) {
            // Détection des paramètres manquants uniquement si `params` est vide
            setMissingParams(
                missing.map((param) => {
                    switch (param) {
                        case "id_erp":
                            return "ID ERP";
                        case "deal_id":
                            return "ID Deal";
                        case "hubspot_id":
                            return "ID Hubspot";
                        default:
                            return "";
                    }
                })
            );
        }
    }, [params, setParams]);

    // Logs pour débogage
    useEffect(() => {
        console.log("ID d'onglet actuel:", tabId);
        console.log("Paramètres stockés:", params);
    }, [params, tabId]);

    return (
        <UrlParamsContext.Provider value={{ params, setParams }}>
            {/* Affichage du dialogue uniquement si les paramètres sont manquants et non stockés */}
            {missingParams.length > 0 && !params && (
                <Dialog open={missingParams.length > 0 && !params}>
                    <DialogContent className="sm:max-w-[425px] backdrop:blur-md">
                        <DialogHeader>
                            <DialogTitle>Paramètres manquants</DialogTitle>
                            <DialogDescription>
                                Les paramètres suivants sont requis mais
                                manquants dans l'URL :
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-2 py-4">
                            <ul className="list-disc pl-4 text-red-500">
                                {missingParams.map((param, index) => (
                                    <li key={index}>{param}</li>
                                ))}
                            </ul>
                            <p className="text-sm text-muted-foreground">
                                Veuillez utiliser le lien généré par HubSpot
                                pour accéder à cette application.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <a href="https://www.hubspot.com">
                                <Button
                                    variant="default"
                                    className="bg-hubspot-500 hover:bg-hubspot-500/80"
                                >
                                    Allez vers HubSpot
                                </Button>
                            </a>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

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
