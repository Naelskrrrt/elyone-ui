import axios from "axios";

export const fetchClient = async (params: {
    id_erp: string;
    hubspot_id: string;
}): Promise<{ client_name: string }> => {
    const { id_erp, hubspot_id } = params;
    const response = await axios.get<{ client_name: string }>(
        "http://137.74.220.203:8081/api/nomClient",
        {
            params: {
                id_erp,
                hubspot_id,
            },
        }
    );

    return response.data;
};
