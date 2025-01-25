import { apiPannier } from "@/infra/ApiClient";
import { FetchCommandesResponse } from "@/types/Article";

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
