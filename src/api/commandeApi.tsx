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

export const deleteCommandes = async (
    deleteRow: { id: string }[]
): Promise<FetchCommandesResponse> => {
    const response = await apiPannier.delete<FetchCommandesResponse>(
        "/pannier",
        { data: deleteRow }
    );

    return response.data;
};
