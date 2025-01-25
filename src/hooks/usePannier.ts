// hooks/useArticles.ts
import { fetchCommandes } from "@/api/commandeApi";
import { FetchCommandesResponse } from "@/types/Article";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchArticleHistory } from "../api/articleApi";

// Hook pour récupérer les articles avec React Query
export const usePannier = (params: {
    uuid: string;
}): UseQueryResult<FetchCommandesResponse> => {
    return useQuery({
        queryKey: ["pannier", params], // La clé de cache inclut les paramètres
        queryFn: () => fetchCommandes(params), // La fonction pour récupérer les données
        // keepPreviousData: true, // Garde les données précédentes pour un affichage fluide
        staleTime: 1000 * 60 * 5, // Données considérées fraîches pendant 5 minutes
        retry: 3, // Réessaye jusqu'à 3 fois en cas d'échec
    });
};

export const useArticleHistory = (params: any) => {
    return useQuery({
        queryKey: ["articleHistory", params],
        queryFn: () => fetchArticleHistory(params),
        staleTime: 1000 * 60 * 5,
        retry: 3,
    });
};
