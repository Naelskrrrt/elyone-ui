import { fetchClient } from "@/api/userApi";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useFetchClient = (params: {
    id_erp: string;
    hubspot_id: string;
}): UseQueryResult<{ client_name: string }> => {
    return useQuery({
        queryKey: ["client", params], // La clé de cache inclut les paramètres
        queryFn: () => fetchClient(params), // La fonction pour récupérer les données
        // keepPreviousData: true, // Garde les données précédentes pour un affichage fluide
        staleTime: 1000 * 60 * 5, // Données considérées fraîches pendant 5 minutes
        retry: 3, // Réessaye jusqu'à 3 fois en cas d'échec
    });
};
