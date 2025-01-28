import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const HomeLayout = lazy(() => import("./pages/HomeLayout"));
const AddArticle = lazy(() => import("./pages/AddArticle/AddArticle"));

import Loader from "./components/loader/loader";
import HistoriqueArticle from "./pages/HistoriqueArticle/HistoriqueArticle";

const router = createBrowserRouter([
    {
        path: "/",
        element: <p>Test</p>,
    },
    {
        path: "/panier",
        element: <HomeLayout />,
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
]);

const App = () => {
    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
        </Suspense>
    );
};

export default App;
