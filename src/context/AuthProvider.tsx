// contexts/AuthProvider.tsx
import authService from "@/services/AuthService";
import TokenService from "@/services/TokenManagerService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import React, {
    createContext,
    ReactNode,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";

interface User {
    user_id: number;
    email: string;
    user_name: string;
    stackholder_title: string;
    role_title: string | null;
    role_id: number;
    token_type: string;
}

interface Credentials {
    email: string;
    password: string;
}

interface LoginResponse {
    token?: string;
    message?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    // user: User | null;
    login: (credentials: Credentials) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // const [email, setEmail] = useState<string>("");
    const queryClient = useQueryClient();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const loginMutation = useMutation<LoginResponse, Error, Credentials>({
        mutationFn: async (
            credentials: Credentials
        ): Promise<LoginResponse> => {
            const response = await authService.login(credentials);

            console.log(response);
            // Correction des noms des tokens
            const { token, message } = response;

            if (!token) {
                throw new Error("No token received");
            }

            const decodeAccessToken = jwtDecode(token) as User;
            console.log(decodeAccessToken);

            const loginResponse: LoginResponse = {
                token,
                message,
            };

            return loginResponse;
        },
        onSuccess: (data) => {
            TokenService.setAccessToken(data.token as string);
            // TokenService.setRefreshToken(data.refresh);
            // setEmail(decodeAccessToken.email as string);
            setIsAuthenticated(true);
        },
        onError: (error) => {
            return error.message;
        },
    });

    const logoutMutation = useMutation<void, Error>({
        mutationFn: async () => {
            // await authService.logout();
            // setEmail("");
            setIsAuthenticated(false);
            TokenService.removeTokens();
            window.localStorage.removeItem("params");
            window.localStorage.removeItem("access");
            window.localStorage.removeItem("checkedRows");
            window.localStorage.removeItem("defaultColumnOrder");
            window.localStorage.removeItem("hideKeys");
            window.localStorage.removeItem("user");
            window.localStorage.removeItem("updatedRows");
            queryClient.clear();
        },

        onError: (error) => {
            console.error("Logout Failed", error);
        },
    });

    const refreshToken = async (): Promise<string | undefined> => {
        try {
            const response = await authService.refreshAccessToken();
            if (response) {
                const { access: accessToken } = response;
                TokenService.setAccessToken(accessToken);
                // const decodeAccessToken = jwtDecode(accessToken) as User;
                return accessToken;
            }
        } catch (error) {
            console.error("RefreshToken Failed", error);
        }
    };

    const login = async (credentials: Credentials): Promise<LoginResponse> => {
        return loginMutation.mutateAsync(credentials);
    };

    const logout = async (): Promise<void> => {
        await logoutMutation.mutateAsync();
    };

    useEffect(() => {
        const storedRefreshToken = TokenService.getRefreshToken();
        if (storedRefreshToken) {
            refreshToken();
        }
    }, []);

    useLayoutEffect(() => {
        const accessToken = TokenService.getAccessToken();

        console.log(accessToken);

        console.log(isTokenDecodable(accessToken as string));

        if (isTokenDecodable(accessToken as string)) {
            // setUser(jwtDecode(accessToken as string) as User);
            setIsAuthenticated(true);
        } else {
            console.log("No access token");
            TokenService.removeTokens();
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                // user,
                login,
                logout,
                refreshToken,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const isTokenDecodable = (token: string): boolean => {
    try {
        const decode = jwtDecode(token);
        return decode !== null;
    } catch (error) {
        console.error(error);
        return false;
    }
};
