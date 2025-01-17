import axios from "axios";

export const apiAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});
