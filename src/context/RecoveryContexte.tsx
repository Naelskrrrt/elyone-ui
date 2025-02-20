import { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextType {
    email: string;
    setEmail: (email: string) => void;
    otp: string;
    setOtp: (otp: string) => void;
    newPassword: string;
    setNewPassword: (newPassword: string) => void;
}

const RecoveryContext = createContext<AuthContextType | undefined>(undefined);

export const RecoveryProvider = ({ children }: { children: ReactNode }) => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    return (
        <RecoveryContext.Provider
            value={{
                email,
                setEmail,
                otp,
                setOtp,
                newPassword,
                setNewPassword,
            }}
        >
            {children}
        </RecoveryContext.Provider>
    );
};

export const useRecoveryData = () => {
    const context = useContext(RecoveryContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
