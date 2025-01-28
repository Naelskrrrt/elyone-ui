import { useAuth } from "@/context/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    email: z.string().email("Le champ email est obligatoire."),
    password: z
        .string()
        .min(4, "Le mot de passe doit contenir au moins 4 caractères."),
});

type FormFields = z.infer<typeof schema>;

export const useSignInForm = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(schema),
    });
    const navigate = useNavigate();
    // const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        console.log(localStorage.getItem("access"));

        if (localStorage.getItem("access")) {
            navigate("/panier");
        }
    }, []);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await login(data);
            console.log(response);
            navigate("/panier");
        } catch (error: unknown) {
            if (error) {
                toast.error("Erreur lors de la connexion", {
                    description:
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (error as any)?.response?.data?.message ||
                        "Une erreur est survenue",
                });
            }
        }
    };

    return {
        register,
        handleSubmit,
        toggleVisibility,
        onSubmit,
        isVisible,
        isSubmitting,
        errors,
    };
};
