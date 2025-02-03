import { useSignInForm } from "./hooks/useSignInForm";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SignIn = () => {
    const {
        register,
        handleSubmit,
        toggleVisibility,
        onSubmit,
        isVisible,
        isSubmitting,
        errors,
    } = useSignInForm();

    return (
        <div className="bg-bg-pattern w-full h-screen bg-cover flex flex-col items-center justify-center overflow-y-auto">
            <div className="container flex justify-center">
                <div className="w-fit h-[500px] border-2 rounded-xl bg-slate-50/30 backdrop-blur-sm flex items-center overflow-hidden p-1 gap-6">
                    <div className="flex w-full h-full relative flex-col items-center lg:items-start p-3 px-8 py-4">
                        <form
                            className="w-full relative flex items-center justify-center lg:items-start py-2 flex-col gap-10"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Link to={"/"}>
                                <img
                                    src="https://www.elyone.com/hubfs/Design%20sans%20titre%20(77).svg"
                                    alt="logo"
                                    className="sm:w-36 w-24"
                                />
                            </Link>

                            <div className="w-[450px] flex flex-col items-center lg:items-start gap-1">
                                <h1 className="text-3xl font-display">
                                    Connectez-vous !
                                </h1>
                                <p className="sm:text-md text-sm font-normal text-slate-500 text-center lg:text-left">
                                    Pour commencer, vous devez d’abord vous
                                    connecter. Veuillez renseigner votre
                                    identifiant.
                                </p>
                            </div>
                            <div className="w-full flex items-center justify-center lg:justify-start">
                                <div className="flex flex-col min-w-96 w-[500px] flex-wrap md:flex-nowrap gap-2">
                                    <div className="">
                                        <Label className="text-slate-500 text-xs font-semibold pl-2">
                                            Email
                                        </Label>
                                        <Input
                                            {...register("email")}
                                            placeholder="Email..."
                                        />
                                        {errors.email && (
                                            <div className="pl-3 text-red-500 text-sm">
                                                {errors.email.message}
                                            </div>
                                        )}
                                    </div>
                                    <div className="">
                                        <div className="relative ">
                                            <Label className="text-slate-500 text-xs font-semibold pl-2">
                                                Mot de passe
                                            </Label>
                                            <Input
                                                {...register("password")}
                                                placeholder="Password..."
                                                // variant="flat"

                                                type={
                                                    isVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                            />
                                            <button
                                                className=" focus:outline-none right-3 top-7 absolute bottom-1"
                                                type="button"
                                                onClick={toggleVisibility}
                                                aria-label="toggle password visibility"
                                            >
                                                <Icon
                                                    icon={
                                                        isVisible
                                                            ? "lucide:eye"
                                                            : "lucide:eye-closed"
                                                    }
                                                    fontSize={20}
                                                    className="text-slate-600 pointer-events-none"
                                                />
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div className="pl-3 text-red-500 text-sm">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className={`w-60  ${
                                    isSubmitting
                                        ? "bg-slate-400"
                                        : "bg-blue-500"
                                } text-slate-50 font-medium text-md`}
                                size="lg"
                                disabled={isSubmitting}
                            >
                                Se Connecter
                            </Button>
                            {errors.root && (
                                <div className="text-red-500">
                                    {errors.root.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            {/* <Article /> */}
            <Toaster position="top-right" closeButton richColors />
        </div>
    );
};

export default SignIn;
