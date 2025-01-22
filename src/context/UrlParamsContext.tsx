import React, { createContext, useContext, useState, useEffect } from "react";

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

// Créez le contexte
const UrlParamsContext = createContext<UrlParamsContextProps | undefined>(
    undefined
);

// Fournisseur du contexte
export const UrlParamsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [params, setParams] = useState<UrlParams | null>(null);

    useEffect(() => {
        // Récupérer les paramètres de l'URL
        const searchParams = new URLSearchParams(window.location.search);
        const ct_num = searchParams.get("id_erp") || "";
        const deal_id = searchParams.get("deal_id") || "";
        const hubspot_id = searchParams.get("hubspot_id") || "";
        const owner_email = searchParams.get("owner_email") || "";

        setParams({
            ct_num,
            deal_id,
            hubspot_id,
            owner_email,
        });
    }, []);

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
