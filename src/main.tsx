import "@fontsource-variable/dm-sans";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UrlParamsProvider } from "./context/UrlParamsContext.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
// import { HeroUIProvider } from "@heroui/react";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <UrlParamsProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </QueryClientProvider>
        </UrlParamsProvider>
    </StrictMode>
);
