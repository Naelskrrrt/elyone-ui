import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import React from "react";
import { useAuth } from "./context/AuthProvider";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        // Met à jour l'état pour afficher une interface de repli
        return { hasError: true };
    }

    handleLogout = () => {
        const { logout } = useAuth();
        logout();
        window.localStorage.clear();
    };

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Loggez l'erreur si nécessaire (ex. Sentry, console, etc.)
        console.error("Erreur capturée par ErrorBoundary :", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
                        <Alert className="border-red-500 text-red-600">
                            <AlertTitle className="font-bold">
                                Une erreur est survenue
                            </AlertTitle>
                            <AlertDescription>
                                Il semble qu'une erreur inattendue soit
                                survenue. Déconnectez-vous ou réessayez.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-6 flex justify-end space-x-2">
                            <Button
                                variant="secondary"
                                onClick={() => window.location.reload}
                            >
                                Réessayer
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={this.handleLogout}
                            >
                                Se Déconnecter
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
