// api/articlesApi.js
import axios from "axios";
import { FetchArticlesParams, FetchArticlesResponse } from "../types/Article";
console.log();
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchArticles = async (
    params: FetchArticlesParams
): Promise<FetchArticlesResponse> => {
    const {
        ct_num,
        filter,
        search,
        page,
        per_page,
        sqlOrder,
        hubspot_id,
        deal_id,
    } = params;

    const response = await apiClient.get<FetchArticlesResponse>("/articles", {
        params: {
            ct_num,
            filter: JSON.stringify(filter),
            search,
            page,
            per_page,
            sqlOrder,
            hubspot_id,
            deal_id,
        },
    });

    return response.data;
};
