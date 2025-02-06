import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const HomeLayout = lazy(() => import("./pages/HomeLayout"));
const AddArticle = lazy(() => import("./pages/AddArticle/AddArticle"));
const SignIn = lazy(() => import("./pages/Auth/sign-in"));

import Loader from "./components/loader/loader";
import HistoriqueArticle from "./pages/HistoriqueArticle/HistoriqueArticle";
import ProtectedRoute from "./core/secure/ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";
import Error404 from "./ErrorNotFound";

const router = createBrowserRouter([
    {
        path: "/",
        element: <SignIn />,
    },
    {
        path: "/panier",
        element: (
            <ProtectedRoute>
                <ErrorBoundary>
                    <HomeLayout />
                </ErrorBoundary>
            </ProtectedRoute>
        ),
        children: [
            {
                path: "",
                element: (
                    <ErrorBoundary>
                        <HomePage />,
                    </ErrorBoundary>
                ),
            },
            {
                path: "addArticle",
                element: (
                    <ErrorBoundary>
                        <AddArticle />,
                    </ErrorBoundary>
                ),
            },
            {
                path: "history",
                element: (
                    <ErrorBoundary>
                        <HistoriqueArticle />,
                    </ErrorBoundary>
                ),
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
