import { verifyAccess } from "@/api/userApi";
import Loader from "@/components/loader/loader";
import Navbar from "@/components/Navbar";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

const HomeLayout = () => {
    const [user] = useState(
        JSON.parse(window.localStorage.getItem("user") || "{}")
    );

    const { params } = useUrlParams();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: verifyAccess,
        onSuccess: () => {
            console.log("success");
            return;
        },
        onError: (error: AxiosError | any) => {
            console.log(error);
            navigate("/unauthorized");
        },
    });

    useEffect(() => {
        setLoading(true);
        if (params?.hubspot_id) {
            mutation.mutate({
                email: user.email,
                hubspot_id: params.hubspot_id,
            });
        }
        setLoading(false);
    }, [user]);

    console.table(user);
    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <div className="w-screen h-screen  relative flex flex-col  overflow-hidden bg-slate-100">
                    <Navbar />
                    <Outlet />
                </div>
            )}
        </>
    );
};

export default HomeLayout;
