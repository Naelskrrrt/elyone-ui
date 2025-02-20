import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { resetPassword, sendOTP, verifyOTP } from "@/api/userApi";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"; // Import des composants OTP
import { useRecoveryData } from "@/context/RecoveryContexte";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

const formSchemaPassword = z
    .object({
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

type FormValuesPassword = z.infer<typeof formSchemaPassword>;

// Schéma de validation Zod pour l'OTP
const formSchemaOTP = z.object({
    otp: z
        .string()
        .length(6, "Le code OTP doit contenir exactement 6 caractères"), // Validation pour un OTP de 6 chiffres
});

// Schéma de validation Zod pour l'email
const formSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide"),
});

type FormValues = z.infer<typeof formSchema>;

type FormValuesOTP = z.infer<typeof formSchemaOTP>;

export const GiveEmail = () => {
    const navigate = useNavigate();
    const { setEmail } = useRecoveryData();

    const mutation = useMutation({
        mutationFn: sendOTP,

        onSuccess: () => {
            toast.success("Un code OTP a été envoyé à votre adresse email");
            navigate("/reset-password/otp");
        },
        onError: (error: AxiosError | any) => {
            setEmail("");
            console.log(error);
            if (error.status === 500) {
                toast.error("Erreur lors de l'envoi des données", {
                    description: (error.response?.data as any)?.message,
                });
                console.log(error.response?.data);
            } else if (error.status == 404) {
                toast.error("Erreur lors de l'envoi des données", {
                    description: error.response.data.message,
                });
            } else toast.error("Erreur lors de l'envoi des données");
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        // Simulation d'une requête API
        console.log("Email soumis:", data.email);
        setEmail(data.email);
        mutation.mutate(data.email);
    };

    return (
        <div className="bg-bg-pattern w-full h-screen bg-cover flex flex-col py-4 px-3 overflow-y-auto">
            <div>
                <Button variant={"link"} onClick={() => navigate(-1)}>
                    <Icon icon={"solar:arrow-left-linear"} />
                    Retour
                </Button>
            </div>

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
                                    Réinitialiser le mot de passe
                                </h1>
                                <p className="sm:text-md text-sm font-normal text-slate-500 text-center lg:text-left">
                                    Veuillez saisir votre adresse email pour
                                    réinitialiser votre mot de passe.
                                </p>
                            </div>

                            <div className="w-full flex items-center justify-center lg:justify-start">
                                <div className="flex flex-col min-w-96 w-[500px] flex-wrap md:flex-nowrap gap-2">
                                    {/* Champ Email */}
                                    <div>
                                        <Label className="text-slate-500 text-xs font-semibold pl-2">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                {...register("email")}
                                                type="email"
                                                placeholder="Entrez votre email..."
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm pl-2">
                                                {errors.email.message}
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
                                            : "Suivant"}
                                    </Button>
                                    <Button
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="bg-red-100 text-red-500 hover:bg-red-100/85"
                                        type="button"
                                        onClick={() => navigate(-1)}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UseOtp = () => {
    const navigate = useNavigate();
    const { email, setEmail, setOtp } = useRecoveryData();
    console.log(email);
    const mutation = useMutation({
        mutationFn: verifyOTP,
        onSuccess: () => {
            toast.success("Code OTP vérifié avec succès");
            navigate("/reset-password/new-password");
        },
        onError: (error: AxiosError | any) => {
            console.log(error);
            setOtp("");
            if (error.status === 500) {
                toast.error("Erreur lors de l'envoi des données", {
                    description: error.response.data.message,
                });
                console.log(error.response?.data);
            } else
                toast.error("Erreur lors de l'envoi des données", {
                    description: error.response.data.message,
                });
        },
    });

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<FormValuesOTP>({
        resolver: zodResolver(formSchemaOTP),
    });

    const onSubmit = async (data: FormValuesOTP) => {
        // Simulation d'une requête API
        console.log("OTP soumis:", data.otp);
        setOtp(data.otp);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        mutation.mutate({ email: email, otp: data.otp });
    };
    useEffect(() => {
        if (!email) {
            navigate("/reset-password");
        }
    }, []);

    return (
        <div className="bg-bg-pattern w-full h-screen bg-cover flex flex-col py-4 px-3 overflow-y-auto">
            <div>
                <Button variant="link" onClick={() => navigate(-1)}>
                    <Icon icon="solar:arrow-left-linear" />
                    Retour
                </Button>
            </div>

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
                                    Vérification OTP
                                </h1>
                                <p className="sm:text-md text-sm font-normal text-slate-500 text-center lg:text-left">
                                    Veuillez saisir le code OTP envoyé à votre
                                    adresse email.
                                </p>
                            </div>

                            <div className="w-full flex items-center justify-center lg:justify-start">
                                <div className="flex flex-col min-w-96 w-[500px] flex-wrap md:flex-nowrap gap-2">
                                    {/* Champ OTP */}
                                    <div className="w-full flex items-center flex-col justify-center">
                                        {/* <Label className="text-slate-500 text-xs font-semibold pl-2 w-full">
                                            Code OTP
                                        </Label> */}
                                        <div className="relative ">
                                            <InputOTP
                                                maxLength={6} // Longueur maximale de l'OTP
                                                value={watch("otp")} // Lie la valeur à react-hook-form
                                                onChange={(value) =>
                                                    setValue("otp", value)
                                                } // Met à jour la valeur dans react-hook-form
                                                title="Saisir le code Otp"
                                            >
                                                <InputOTPGroup>
                                                    {[...Array(3)].map(
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={`right-${index}`} // Clé unique
                                                                index={index}
                                                                className="w-12 h-12 border-slate-300"
                                                            />
                                                        )
                                                    )}
                                                </InputOTPGroup>
                                                -
                                                <InputOTPGroup>
                                                    {[...Array(3)].map(
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={`left-${
                                                                    index + 3
                                                                }`} // Clé unique
                                                                index={
                                                                    index + 3
                                                                }
                                                                className="w-12 h-12 border-slate-300"
                                                            />
                                                        )
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <div>
                                            <CountdownTimer
                                                onExpire={() => {
                                                    setEmail("");
                                                    setOtp("");
                                                    navigate("/reset-password");
                                                }}
                                            />
                                        </div>
                                        {errors.otp && (
                                            <p className="text-red-500 text-sm pl-2">
                                                {errors.otp.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex gap-2 flex-wrap flex-col w-full">
                                    <Button
                                        variant={"link"}
                                        className="text-xs text-orange-500"
                                        onClick={() => {
                                            navigate(-1);
                                            setEmail("");
                                            setOtp("");
                                        }}
                                    >
                                        Renvoyer le code OTP
                                    </Button>
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
                                            : "Vérifier"}
                                    </Button>

                                    {/* <Button
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="bg-red-100 text-red-500 hover:bg-red-100/85"
                                        type="button"
                                        onClick={() => navigate(-1)}
                                    >
                                        Annuler
                                    </Button> */}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NewPassword = () => {
    const navigate = useNavigate();
    const { email, setNewPassword, setEmail } = useRecoveryData();

    const mutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toast.success("Mot de passe modifié avec succès");
            navigate("/panier");
            setNewPassword("");
            setEmail("");
        },
        onError: (error: AxiosError | any) => {
            console.log(error);
            if (error.status === 500) {
                toast.error("Erreur lors de l'envoi des données", {
                    description: error.response.data.message,
                });
                console.log(error.response?.data);
            } else
                toast.error("Erreur lors de l'envoi des données", {
                    description: error.response.data.message,
                });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValuesPassword>({
        resolver: zodResolver(formSchemaPassword),
    });

    const [visibility, setVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const toggleVisibility = (field: keyof typeof visibility) => {
        setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const onSubmit = async (data: FormValuesPassword) => {
        // Simulation d'une requête API
        console.log("Données du formulaire:", data);
        console.log("email", email);
        mutation.mutate({ email: email, newPassword: data.newPassword });
        // Ici vous ajouteriez votre logique de modification de mot de passe
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
                                    Veuillez entrer votre nouveau mot de passe
                                    et puis confirmer.
                                </p>
                            </div>

                            <div className="w-full flex items-center justify-center lg:justify-start">
                                <div className="flex flex-col min-w-96 w-[500px] flex-wrap md:flex-nowrap gap-2">
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
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CountdownTimer = ({ onExpire }: { onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes en secondes

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire(); // Appelle la fonction lorsque le timer atteint 0
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer); // Nettoyage du timer
    }, [timeLeft, onExpire]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <p className="text-xs  text-slate-400">
            Expire dans :{" "}
            <span className="font-bold text-sm text-nextblue-500">
                {formatTime(timeLeft)}
            </span>
        </p>
    );
};
