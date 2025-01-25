import { useLocalStorage } from "@uidotdev/usehooks";
import React, { createContext, useContext, useEffect } from "react";
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

    useEffect(() => {
        // Vérifiez si les paramètres existent déjà dans le local storage
        if (!params) {
            // Récupérer les paramètres de l'URL
            const searchParams = new URLSearchParams(window.location.search);
            const ct_num = searchParams.get("id_erp") || "";
            const deal_id = searchParams.get("deal_id") || "";
            const hubspot_id = searchParams.get("hubspot_id") || "";
            const owner_email = searchParams.get("owner_email") || "";
            const uuid = uuidv4();

            // Stockez les paramètres uniquement s'ils n'existent pas déjà
            setParams({
                ct_num,
                deal_id,
                hubspot_id,
                owner_email,
                uuid,
            });
        }
    }, [params, setParams]); // Dépendances du useEffect

    return (
        <UrlParamsContext.Provider value={{ params, setParams }}>
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
