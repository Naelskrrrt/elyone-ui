import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

const HomeLayout = () => {
    return (
        <>
            <div className="w-screen h-screen relative flex flex-col  overflow-hidden bg-slate-100">
                <Navbar />
                <Outlet />
            </div>
        </>
    );
};

export default HomeLayout;
