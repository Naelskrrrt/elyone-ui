// hooks/useArticles.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchArticles } from "../api/articleApi";
import { FetchArticlesParams, FetchArticlesResponse } from "@/types/Article";

// Hook pour récupérer les articles avec React Query
export const useArticles = (
    params: FetchArticlesParams
): UseQueryResult<FetchArticlesResponse> => {
    return useQuery({
        queryKey: ["articles", params], // La clé de cache inclut les paramètres
        queryFn: () => fetchArticles(params), // La fonction pour récupérer les données
        // keepPreviousData: true, // Garde les données précédentes pour un affichage fluide
        staleTime: 1000 * 60 * 5, // Données considérées fraîches pendant 5 minutes
        retry: 3, // Réessaye jusqu'à 3 fois en cas d'échec
    });
};
