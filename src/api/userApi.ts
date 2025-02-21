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

export const updatePassword = async ({
    id,
    newPassword,
    password,
}: {
    id: number | string;
    newPassword: string;
    password: string;
}): Promise<any> => {
    const response = await axios.put<any>(
        import.meta.env.VITE_API_URL + "/api/change_password/" + id,
        {
            password: password,
            new_password: newPassword,
        }
    );

    return response;
};

export const sendOTP = async (email: string) => {
    const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/send-otp",
        { email: email },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response;
};

export const verifyOTP = async ({
    email,
    otp,
}: {
    email: string;
    otp: string | number;
}) => {
    const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/verify-otp",
        { email: email, otp: otp },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response;
};

export const resetPassword = async ({
    email,
    newPassword,
}: {
    email: string;
    newPassword: string;
}) => {
    const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/reset-password",
        { email: email, new_password: newPassword },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response;
};

export const verifyAccess = async ({
    email,
    hubspot_id,
}: {
    email: string;
    hubspot_id: string | number;
}) => {
    const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/verify-access",
        {
            email: email,
            hubspot_id: hubspot_id,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return response;
};
