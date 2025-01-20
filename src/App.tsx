import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const HomeLayout = lazy(() => import("./pages/HomeLayout"));
const AddArticle = lazy(() => import("./pages/AddArticle/AddArticle"));

import Loader from "./components/loader/loader";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                path: "",
                element: <Outlet />,
                children: [
                    {
                        path: "",
                        element: <HomePage />,
                    },
                    {
                        path: "addArticle",
                        element: <AddArticle />,
                    },
                ],
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
