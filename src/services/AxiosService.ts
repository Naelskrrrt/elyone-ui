import authService from "@/services/AuthService";
import TokenService from "@/services/TokenManagerService";
import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://192.168.56.26:8001",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = TokenService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401) {
            try {
                const newToken = await authService.refreshAccessToken();
                if (newToken) {
                    TokenService.setAccessToken(newToken.access);
                }
                error.config.headers.Authorization = `Bearer ${newToken?.access}`;
                return apiClient.request(error.config);
            } catch (refreshError) {
                console.error("Token refresh failed", refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export { apiClient };
