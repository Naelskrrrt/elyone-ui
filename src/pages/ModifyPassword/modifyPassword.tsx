import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/api/userApi";
import { AxiosError } from "axios";

// Schéma de validation Zod
const formSchema = z
    .object({
        currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
        newPassword: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .refine(
                (password) => /[A-Z]/.test(password),
                "Doit contenir une majuscule"
            )
            .refine(
                (password) => /[0-9]/.test(password),
                "Doit contenir un chiffre"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof formSchema>;

const ModifyPassword = () => {
    const [user] = useState<any>(
        JSON.parse(window.localStorage.getItem("user") as string)
    );
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const [visibility, setVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const toggleVisibility = (field: keyof typeof visibility) => {
        setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const onSubmit = async (data: FormValues) => {
        // Simulation d'une requête API
        console.log("Données du formulaire:", data);
        const { currentPassword, newPassword } = data;

        try {
            const response = await updatePassword({
                id: user.id,
                password: currentPassword,
                newPassword: newPassword,
            });

            if (response.status === 200) {
                toast.success(response?.data?.message);

                // Ajouter un délai avant la navigation (ex: 1 seconde)
                setTimeout(() => {
                    navigate("/panier");
                }, 1000);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error: AxiosError | any) {
            toast.error("Une erreur s'est produite", {
                description: error.response.data.message,
            });
            console.error("Une erreur s'est produite:", error.response.data);
        }
    };

    return (
        <div className="bg-bg-pattern w-full h-screen bg-cover flex flex-col py-4 px-3 overflow-y-auto">
            {/* <Link to={"/panier"}> */}
            <div>
                <Button variant={"link"} onClick={() => navigate(-1)}>
                    {" "}
                    <Icon icon={"solar:arrow-left-linear"} />
                    Retours
                </Button>
            </div>

            {/* </Link> */}
            <div className="container flex justify-center h-full items-center">
                <div className="w-fit h-min-[500px] border-2 rounded-xl bg-slate-50/30 backdrop-blur-sm flex items-center overflow-hidden p-1 gap-6">
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
                                    Modifier le mot de passe
                                </h1>
                                <p className="sm:text-md text-sm font-normal text-slate-500 text-center lg:text-left">
                                    Veuillez saisir votre mot de passe actuel et
                                    votre nouveau mot de passe de {user.email}.
                                </p>
                            </div>

                            <div className="w-full flex items-center justify-center lg:justify-start">
                                <div className="flex flex-col min-w-96 w-[500px] flex-wrap md:flex-nowrap gap-2">
                                    {/* Mot de passe actuel */}
                                    <div>
                                        <Label className="text-slate-500 text-xs font-semibold pl-2">
                                            Mot de passe actuel
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                {...register("currentPassword")}
                                                type={
                                                    visibility.current
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Mot de passe actuel..."
                                            />
                                            <button
                                                className="absolute right-3 top-3"
                                                type="button"
                                                onClick={() =>
                                                    toggleVisibility("current")
                                                }
                                            >
                                                <Icon
                                                    icon={
                                                        visibility.current
                                                            ? "lucide:eye"
                                                            : "lucide:eye-closed"
                                                    }
                                                    fontSize={20}
                                                    className="text-slate-600"
                                                />
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-red-500 text-sm pl-2">
                                                {errors.currentPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nouveau mot de passe */}
                                    <div>
                                        <Label className="text-slate-500 text-xs font-semibold pl-2">
                                            Nouveau mot de passe
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                {...register("newPassword")}
                                                type={
                                                    visibility.new
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Nouveau mot de passe..."
                                                onCopy={(e) =>
                                                    e.preventDefault()
                                                }
                                                onCut={(e) =>
                                                    e.preventDefault()
                                                }
                                                onPaste={(e) =>
                                                    e.preventDefault()
                                                }
                                                onContextMenu={(e) =>
                                                    e.preventDefault()
                                                }
                                            />
                                            <button
                                                className="absolute right-3 top-3"
                                                type="button"
                                                onClick={() =>
                                                    toggleVisibility("new")
                                                }
                                            >
                                                <Icon
                                                    icon={
                                                        visibility.new
                                                            ? "lucide:eye"
                                                            : "lucide:eye-closed"
                                                    }
                                                    fontSize={20}
                                                    className="text-slate-600"
                                                />
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-red-500 text-sm pl-2">
                                                {errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirmation mot de passe */}
                                    <div>
                                        <Label className="text-slate-500 text-xs font-semibold pl-2">
                                            Confirmer le mot de passe
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                {...register("confirmPassword")}
                                                type={
                                                    visibility.confirm
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Confirmer le mot de passe..."
                                            />
                                            <button
                                                className="absolute right-3 top-3"
                                                type="button"
                                                onClick={() =>
                                                    toggleVisibility("confirm")
                                                }
                                            >
                                                <Icon
                                                    icon={
                                                        visibility.confirm
                                                            ? "lucide:eye"
                                                            : "lucide:eye-closed"
                                                    }
                                                    fontSize={20}
                                                    className="text-slate-600"
                                                />
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-sm pl-2">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-2 flex-wrap w-full">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className={`w-60 ${
                                            isSubmitting
                                                ? "bg-slate-400"
                                                : "bg-blue-500"
                                        }`}
                                    >
                                        {isSubmitting
                                            ? "En cours..."
                                            : "Modifier"}
                                    </Button>
                                    <Button
                                        // type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="bg-red-100 text-red-500 hover:bg-red-100/85"
                                        type="reset"
                                        onClick={() => navigate(-1)}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                                <div>
                                    <span className="text-xs">
                                        Mot de passe oublié ?
                                    </span>
                                    <Button
                                        variant="link"
                                        className="text-blue-500 text-xs"
                                        size={"sm"}
                                    >
                                        <Link to="/reset-password">
                                            Recuperez votre compte !
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" closeButton richColors />
        </div>
    );
};

export default ModifyPassword;
