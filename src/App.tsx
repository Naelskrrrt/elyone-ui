import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const HomeLayout = lazy(() => import("./pages/HomeLayout"));
const AddArticle = lazy(() => import("./pages/AddArticle/AddArticle"));
const SignIn = lazy(() => import("./pages/Auth/sign-in"));
const HistoriqueArticle = lazy(
    () => import("./pages/HistoriqueArticle/HistoriqueArticle")
);

const ModifyPassword = lazy(
    () => import("./pages/ModifyPassword/modifyPassword")
);

import { Toaster } from "sonner";
import Loader from "./components/loader/loader";
import { RecoveryProvider } from "./context/RecoveryContexte";
import ProtectedRoute from "./core/secure/ProtectedRoute";
import Error404 from "./ErrorNotFound";
import {
    GiveEmail,
    NewPassword,
    UseOtp,
} from "./pages/ResetPassword/GiveEmail";
import ErrorUnauthorized from "./ErrorUnauthorized";

const router = createBrowserRouter([
    {
        path: "/",
        element: <SignIn />,
    },
    {
        path: "/modify-password",
        element: <ModifyPassword />,
    },
    {
        path: "/unauthorized",
        element: <ErrorUnauthorized />,
    },
    {
        path: "/reset-password",
        element: (
            <RecoveryProvider>
                <Outlet />
                <Toaster position="top-right" closeButton richColors />
            </RecoveryProvider>
        ),
        children: [
            {
                path: "",
                element: <GiveEmail />,
            },
            {
                path: "otp",
                element: <UseOtp />,
            },
            {
                path: "new-password",
                element: <NewPassword />,
            },
        ],
    },
    {
        path: "/panier",
        element: (
            <ProtectedRoute>
                <HomeLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "",
                element: <HomePage />,
            },
            {
                path: "addArticle",
                element: <AddArticle />,
            },
            {
                path: "history",
                element: <HistoriqueArticle />,
            },
        ],
    },
    {
        path: "*",
        element: <Error404 />,
    },
]);

const App = () => {
    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
        </Suspense>
    );
};

export default App;
