// api/articlesApi.js
import axios from "axios";
import {
    Article,
    FetchArticlesGlobalHistoryResponse,
    FetchArticlesHistoryResponse,
    FetchArticlesParams,
    FetchArticlesResponse,
} from "../types/Article";
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

export const fetchArticlesGlobalHistory = async (
    params: FetchArticlesParams
): Promise<FetchArticlesGlobalHistoryResponse> => {
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

    const response = await apiClient.get<FetchArticlesGlobalHistoryResponse>(
        "/history/global",
        {
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
        }
    );

    return response.data;
};

export const fetchArticleHistory = async (params: {
    reference: string;
    ct_num: string;
    hubspot_id: string;
    deal_id: string;
}): Promise<FetchArticlesHistoryResponse> => {
    const { reference, ct_num, hubspot_id, deal_id } = params;

    const response = await apiClient.get<FetchArticlesHistoryResponse>(
        "/history",
        {
            params: {
                reference,
                ct_num,
                hubspot_id,
                deal_id,
            },
        }
    );

    return response.data;
};

export const sendPannier = async (data: Article[]) => {
    const response = await apiClient.post("/pannier", data, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
