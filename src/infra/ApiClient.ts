import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiPannier = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api/",
    headers: {
        "Content-Type": "application/json",
    },
});
