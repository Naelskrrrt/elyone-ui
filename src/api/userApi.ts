import axios from "axios";

export const fetchClient = async (params: {
    id_erp: string;
    hubspot_id: string;
}): Promise<{ client_name: string }> => {
    const { id_erp, hubspot_id } = params;
    const response = await axios.get<{ client_name: string }>(
        import.meta.env.VITE_API_URL + "/api/nomClient",
        {
            params: {
                id_erp,
                hubspot_id,
            },
        }
    );

    return response.data;
};
