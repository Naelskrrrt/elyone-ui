import { apiPannier } from "@/infra/ApiClient";
import { FetchCommandesResponse, SendArticleToHubspot } from "@/types/Article";

export const fetchCommandes = async (params: {
    uuid: string;
}): Promise<FetchCommandesResponse> => {
    const { uuid } = params;

    const response = await apiPannier.get<FetchCommandesResponse>("/pannier", {
        params: {
            uuid,
        },
    });

    return response.data;
};

export const deleteCommandes = async (
    articleId: string,
    uuid: string
): Promise<FetchCommandesResponse> => {
    const response = await apiPannier.delete<FetchCommandesResponse>(
        "/pannier",
        {
            params: {
                articleId,
                uuid,
            },
        }
    );

    return response.data;
};

export const sendToHubspot = async (data: SendArticleToHubspot) => {
    const response = await apiPannier.post("/cart/sendToHubspot", data);

    return response.data;
};
