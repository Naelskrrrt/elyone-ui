// services/authService.ts
import { apiClient } from "@/infra/ApiClient";
import TokenService from "./TokenManagerService";

interface User {
    id: string;
    username: string;
}

interface Credentials {
    session: string;
    password: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

const authService = {
    login: async (credentials: Credentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>(
            "/login/",
            credentials
        );

        TokenService.setAccessToken(response.data.access);
        TokenService.setRefreshToken(response.data.refresh);

        // localStorage.setItem("user", "hello");

        return response.data;
    },
    logout: async (): Promise<void> => {
        try {
            const refreshToken = TokenService.getRefreshToken();

            const response = await apiClient.post("token/blacklist/", {
                refresh: refreshToken,
            });
            return response.data;
        } catch (error) {
            console.log("Logout Failed", error);
        }
    },
    refreshAccessToken: async (): Promise<{ access: string } | undefined> => {
        try {
            const refreshToken = TokenService.getRefreshToken();
            const response = await apiClient.post<LoginResponse>(
                "token/refresh/",
                {
                    refresh: refreshToken,
                }
            );

            console.log("Refresh Response: ", response);

            return { access: response.data.access };
        } catch (error) {
            console.log("Refresh Error: ", error);

            // return { error };
        }
        // Retourner uniquement le jeton d'accès
    },
};

export default authService;
