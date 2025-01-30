import GenericTable from "@/components/CommandeTable/GenericTable";
import { Icon } from "@iconify/react";
import React, { useCallback, useEffect, useState } from "react";

import { deleteCommandes, sendToHubspot } from "@/api/commandeApi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useArticles } from "@/hooks/useArticles";
import { usePannier } from "@/hooks/usePannier";
import { Article, Commandes } from "@/types/Article";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router";
import { toast, Toaster } from "sonner";

const HomePage = () => {
    const [hideKeys, setHideKeys] = useState<string[]>([
        "code_famille",
        "prix_ttc",
        "AR_StockTerme",
        "prix_vente",
    ]); // Gérer dynamiquement les colonnes masquées
    const { params } = useUrlParams();
    const [totalPrixNet, setTotalPrixNet] = useState<number>(0);
    const [totalRemise, setTotalRemise] = useState<number>(0);
    const [totalHorsTaxe, settotalHorsTaxe] = useState<number>(0);
    const [sendConfirm, setSendConfirm] = useState<any>({
        isSyncErp: false,
        isClearCart: false,
    });

    const [user, setUser] = useLocalStorage<any>("user", null);

    useEffect(() => {
        const token = window.localStorage.getItem("access");
        const user = jwtDecode<any>(token as string);
        setUser(user);
    }, []);

    const {
        data: commande,
        isLoading,
        refetch,
    } = usePannier({
        uuid: user?.email as string,
    });

    const { data: articles } = useArticles({
        ct_num: params?.ct_num || "EXAMPLE",

        hubspot_id: params?.hubspot_id || "",
        deal_id: params?.deal_id || "",
    });

    const queryClient = useQueryClient();

    const handleToggleColumnVisibility = (id: string) => {
        setHideKeys((prev) =>
            prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
        );
    };

    const [commandeState, setCommande] = useState<Commandes[] | null>(null);

    useEffect(() => {
        if (commande?.articles) {
            setCommande(commande.articles);
        }
    }, [commande?.articles]);

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () =>
            commandeState ? commandeState.map((item) => String(item.id)) : [],
        [commandeState]
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        console.log("Dragged ID:", active.id, "Over ID:", over.id);

        setCommande((prevCommande) => {
            if (!prevCommande) return null;

            const oldIndex = prevCommande.findIndex(
                (item) => String(item.id) === String(active.id)
            );
            const newIndex = prevCommande.findIndex(
                (item) => String(item.id) === String(over.id)
            );

            if (oldIndex === -1 || newIndex === -1) return prevCommande;

            return arrayMove(prevCommande, oldIndex, newIndex);
        });
    }, []);

    // console.log(commandeState);

    const handleSendHubspot = () => {
        if (!commandeState) return;

        const formattedCommande = commandeState.map((item) => ({
            reference: item.reference_article || "",
            designation: item.designation_article || "",
            prixNet: parseFloat(item.prix_vente || "0"),
            prixUnitaire: parseFloat(item.prix_net || "0"),
            quantity: parseInt(item.quantite || "1"),
            remise_finale: parseFloat(item.remise_finale || "0"),
        }));
        console.log("Commande formatée :", formattedCommande);
        mutation.mutate({
            articles: formattedCommande,
            hubspot_id: "8021036",
            transaction_id: "29895783826",
            sync_erp: sendConfirm.isSyncErp ? "OUI" : "",
            clear_cart: sendConfirm.isClearCart,
        });
        // return formattedCommande;
    };

    const updateRowData = (rowId: number, rowData: Partial<Commandes>) => {
        setCommande((prev) => {
            if (!prev) return null;

            const updatedCommande = prev.map((item) =>
                item.id === rowId
                    ? ({ ...item, ...rowData } as Commandes)
                    : item
            );

            // Trouver l'article mis à jour
            const updatedArticle = updatedCommande.find(
                (item) => item.id === rowId
            );

            // Envoyer la mise à jour à l'API
            if (updatedArticle) {
                updateSingleArticle(updatedArticle);
            }

            return updatedCommande;
        });
    };

    const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
        if (!rowId) {
            console.error("Row ID is missing for sortable row!");
            return null;
        }

        const { attributes, listeners } = useSortable({ id: rowId });

        return (
            <button {...attributes} {...listeners}>
                <Icon icon={"lsicon:drag-outline"} className="scale-150" />
            </button>
        );
    };

    const handleDeleteRow = (articleId: number[], uuid: string) => {
        if (!uuid) return;

        try {
            const response = deleteCommandes(articleId.join(","), uuid);
            console.log(response);
            toast.success("Article supprimé !");
            queryClient.invalidateQueries({ queryKey: ["pannier"] });
        } catch (error: any) {
            console.error("Erreur lors de la suppression de l'article", error);
        }
        refetch();
    };

    const updateSingleArticle = async (article: Commandes) => {
        if (!user?.email) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/pannier?articleId=${
                    article.id
                }&uuid=${user.email}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(article), // Envoyer l'article mis à jour
                }
            );

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour de l'article.");
            }

            toast.success(`Article ${article.reference_article} mis à jour !`);
            queryClient.invalidateQueries({ queryKey: ["pannier"] });
        } catch (error) {
            toast.error("Échec de la mise à jour de l'article !");
            console.error("Erreur:", error);
        }
    };

    useEffect(() => {
        const totalPrixNet = (commandeState || []).reduce(
            (sum, article) =>
                sum + parseFloat((article.total_ht_net as string) || "0"),
            0
        );

        const totalRemise = (commandeState || []).reduce(
            (sum, article) =>
                sum + parseFloat((article.remise_finale as string) || "0"),
            0
        );

        const totalHorsTaxe = (commandeState || []).reduce(
            (sum, articles) =>
                sum +
                parseFloat(articles.prix_final || "0") *
                    parseFloat(articles.quantite || "1"),
            0
        );
        console.log(totalPrixNet);
        setTotalPrixNet(totalPrixNet);
        setTotalRemise(totalRemise);
        settotalHorsTaxe(totalHorsTaxe);
    }, [updateRowData, commandeState]);
    const handleRefresh = () => {
        // updateCommandeOnServer();
        queryClient.invalidateQueries({ queryKey: ["pannier"] });
    };

    const mutation = useMutation({
        mutationFn: sendToHubspot,
        onSuccess: () => {
            toast.success("Les articles ont été ajoutés au panier");
            queryClient.invalidateQueries({ queryKey: ["pannier"] });
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            const articleIds = commandeState?.map((item) => item.id) || [];
            // TODO: Vider le panier dans le backend
            handleDeleteRow(articleIds, user.email);
            setIsConfirmDialogOpen(false);
        },
        onError: (error: AxiosError) => {
            if (error.status === 500)
                toast.error("Erreur lors de l'envoi des données", {
                    description: "Veuillez réessayer plus tard !",
                });
            else toast.error("Erreur lors de l'envoi des données");
        },
    });

    const columns = React.useMemo<ColumnDef<Article>[]>(
        () => [
            {
                id: "drag-handle",
                header: "",
                cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
                size: 20,
            },
            {
                // 0
                id: "reference_article",
                accessorKey: "reference_article",
                header: "Référence",
                cell: (info) => info.getValue(),
            },
            {
                // 1
                id: "designation_article",
                accessorKey: "designation_article",
                header: "Désignation",
                cell: ({ row }) => {
                    const defaultValue = row.original.designation_article || "";

                    const [design, setDesign] = useState<any>(defaultValue);

                    const onSubmit = (data: any) => {
                        updateRowData(row.original.id as number, {
                            ...row.original,
                            designation_article: data.designation,
                            prix_final: row.original.prix_final || "",
                            remise_finale: row.original.remise_finale || "",
                            prix_net: row.original.prix_net,
                            total_ht_net: row.original.total_ht_net,
                        });
                        toast.info("Désignation mise à jour");
                    };

                    const submitCondition =
                        design == row.original.designation_article;

                    return (
                        <div className="flex gap-4 w-full mr-2">
                            <div className="flex flex-col gap-1 w-full ">
                                <Input
                                    value={design}
                                    className="mx-2 w-full"
                                    onChange={(e) => setDesign(e.target.value)}
                                />

                                <p
                                    className={
                                        submitCondition
                                            ? "hidden"
                                            : "text-[9px] text-nextblue-500"
                                    }
                                >
                                    Enregistrer avant de continuer.
                                </p>
                            </div>

                            {submitCondition ? (
                                ""
                            ) : (
                                <Button
                                    disabled={!design}
                                    type="submit"
                                    onClick={() =>
                                        onSubmit({ designation: design })
                                    }
                                >
                                    <Icon icon={"lucide:save"} />
                                </Button>
                            )}
                        </div>
                    );
                },
                size: 350,
            },
            {
                // 2
                id: "code_famille",
                accessorKey: "code_famille",
                header: "Code Famille",
                cell: (info) => info.getValue(),
                size: 150,
            },

            {
                // 4
                id: "prix_ttc",
                accessorKey: "prix_ttc",
                header: "Prix TTC",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                // 5
                id: "prix_vente",
                accessorKey: "prix_vente",
                header: "Prix Vente HT",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
                size: 160,
            },

            {
                // 11 stock à terme
                id: "AR_StockTerme",
                accessorKey: "AR_StockTerme",
                header: "Stock à Terme",
                cell: (info) =>
                    parseFloat(info.getValue() as string).toFixed(2),
            },
            {
                // Quantité
                id: "quantite",
                accessorKey: "quantite",
                header: "Quantité",
                cell: ({ row }) => {
                    const defaultValue = row.original.quantite || "1";
                    const [quantite, setQuantite] = useState<any>(
                        parseInt(defaultValue as string) || 1
                    );

                    const onSubmit = (data: any) => {
                        toast.info("Quantité mise à jour");
                        updateRowData(row.original.id as number, {
                            ...row.original,
                            quantite: data.quantite,
                            remise_finale: row.original.remise_finale || "",
                            designation_article:
                                row.original.designation_article || "",
                            prix_final: row.original.prix_final || "",
                            prix_ttc: row.original.prix_ttc || "",
                            total_ht_net:
                                parseFloat(row.original.prix_ttc as string) *
                                data.quantite,
                        });
                    };

                    const submitCondition = quantite == row.original.quantite;

                    return (
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-1">
                                <Input
                                    type="number"
                                    // {...field}
                                    value={quantite}
                                    onChange={(e) => {
                                        setQuantite(e.target.value);
                                    }}
                                    className="w-full text-left mr-2 "
                                    min={1}
                                />
                                <p
                                    className={
                                        !submitCondition
                                            ? "text-[9px] text-nextblue-500"
                                            : "hidden"
                                    }
                                >
                                    Enregistrer avant de continuer.
                                </p>
                            </div>

                            {!submitCondition ? (
                                <Button
                                    type="submit"
                                    disabled={!quantite}
                                    onClick={() =>
                                        onSubmit({ quantite: quantite })
                                    }
                                >
                                    <Icon icon={"lucide:save"} />
                                </Button>
                            ) : (
                                ""
                            )}
                        </div>
                    );
                },
                size: 200,
            },

            {
                // 31
                id: "prix_final",
                accessorKey: "prix_final",
                header: "Prix Final (€)",
                cell: ({ row }) => {
                    const defaultValue = row.original.prix_final || "";
                    const [prixFinal, setPrixFinal] = useState<any>(
                        parseFloat(defaultValue as string).toFixed(2) || 0
                    );

                    const remiseFinale = parseFloat(
                        row.original.remise_finale || ""
                    );

                    const onSubmit = (data: any) => {
                        toast.info("Prix Finale mise à jour");

                        updateRowData(row.original.id as number, {
                            ...row.original,
                            prix_final: data.prixFinal,
                            designation_article:
                                row.original.designation_article || "",
                            quantite: row.original.quantite || "1",
                            remise_finale: row.original.remise_finale || "",
                            prix_net: (
                                data.prixFinal -
                                (data.prixFinal * remiseFinale) / 100
                            )
                                .toFixed(2)
                                .toString(),
                            total_ht_net:
                                (data.prixFinal -
                                    (data.prixFinal * remiseFinale) / 100) *
                                parseInt(row.original.quantite as string),
                        });
                    };

                    const submitCondition =
                        parseFloat(row.original.prix_final as string).toFixed(
                            2
                        ) === prixFinal;

                    return (
                        <div className=" flex gap-2">
                            <div className="flex flex-col gap-1">
                                <Input
                                    type="number"
                                    className="w-full text-left mr-2 "
                                    value={prixFinal}
                                    onChange={(e) =>
                                        setPrixFinal(e.target.value)
                                    }
                                    title="Enregistrer avant de continuer"
                                />
                                <p
                                    className={
                                        submitCondition
                                            ? "hidden"
                                            : "text-[9px] text-nextblue-500"
                                    }
                                >
                                    Enregistrer avant de continuer.
                                </p>
                            </div>

                            {parseFloat(
                                row.original.prix_final as string
                            ).toFixed(2) === prixFinal ? (
                                ""
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!prixFinal}
                                    onClick={() =>
                                        onSubmit({ prixFinal: prixFinal })
                                    }
                                >
                                    <Icon icon={"lucide:save"} />
                                </Button>
                            )}
                        </div>
                    );
                },
                size: 200,
            },

            {
                // 30
                id: "remise_finale",
                accessorKey: "remise_finale",
                header: "Remise Finale (%)",
                cell: ({ row }) => {
                    const defaultValue = row.original.remise_finale || "";
                    const [remise, setRemise] = useState<any>(
                        parseFloat(defaultValue as string).toFixed(2) || 0
                    );
                    const prixFinal = parseFloat(row.original.prix_final || "");

                    const onSubmit = (data: any) => {
                        toast.info("Remise Finale mise à jour");
                        updateRowData(row.original.id as number, {
                            ...row.original,
                            remise_finale: data.remise,
                            designation_article:
                                row.original.designation_article || "",
                            quantite: row.original.quantite || "1",
                            prix_final: row.original.prix_final || "",
                            prix_net: (
                                prixFinal -
                                (prixFinal * parseFloat(data.remise)) / 100
                            )
                                .toFixed(2)
                                .toString(),
                            // Prix Net = Prix Final – (Prix Final * Remise Final/100)
                            total_ht_net:
                                (prixFinal -
                                    (prixFinal * parseFloat(data.remise)) /
                                        100) *
                                parseInt(row.original.quantite as string),
                        });
                    };

                    const submitCondition =
                        remise ==
                        parseFloat(
                            row.original.remise_finale as string
                        ).toFixed(2);

                    return (
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-1">
                                <Input
                                    type="number"
                                    // {...field}
                                    value={remise}
                                    onChange={(e) => {
                                        setRemise(e.target.value);
                                    }}
                                    className="w-full text-left mr-2 "
                                    min={0}
                                    max={100}
                                />
                                <p
                                    className={
                                        submitCondition
                                            ? "hidden"
                                            : "text-[9px] text-nextblue-500"
                                    }
                                >
                                    Enregistrer avant de continuer.
                                </p>
                            </div>

                            {remise ==
                            parseFloat(
                                row.original.remise_finale as string
                            ).toFixed(2) ? (
                                ""
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!remise}
                                    onClick={() => onSubmit({ remise })}
                                >
                                    <Icon icon={"lucide:save"} />
                                </Button>
                            )}
                        </div>
                    );
                },
                size: 300,
            },

            {
                // 32
                id: "prix_net",
                accessorKey: "prix_net",
                header: "Prix U Remisé",
                cell: ({ row }) => {
                    return (
                        parseFloat(row.original.prix_net || "0").toFixed(2) +
                        " €"
                    );
                },

                size: 200,
            },

            {
                id: "total_ht_net",
                accessorKey: "total_ht_net",
                header: "Total HT Net",
                cell: ({ row }) => {
                    const prixNet = parseFloat(row.original.prix_net || "0");
                    const quantite = parseInt(row.original.quantite || "1");

                    return (prixNet * quantite).toFixed(2) + " €";
                },
            },

            {
                id: "actions",
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    return (
                        <Button
                            onClick={() => {
                                handleDeleteRow(
                                    [row.original.id as number],
                                    user.email
                                );
                            }}
                            size={"icon"}
                            className="bg-red-100 text-red-500 hover:bg-red-100/80"
                        >
                            <Icon icon={"lucide:trash"} />
                        </Button>
                    );
                },
                size: 100,
            },
        ],
        [
            updateRowData,
            commandeState,
            totalPrixNet,
            totalRemise,
            totalHorsTaxe,
            sendConfirm,
            dataIds,
        ]
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const handleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { id, checked } = event.target;
        setSendConfirm(
            (prevState: { isSyncErp: boolean; isClearCart: boolean }) => {
                const newState = { ...prevState, [id]: checked };
                if (id === "isSyncErp" && checked) {
                    setIsDialogOpen(true);
                }
                return newState;
            }
        );
    };
    console.log(sendConfirm);

    return (
        <>
            <div className="flex w-full relative h-full  flex-col gap-0  overflow-y-auto px-3  py-3">
                {/* <div className="py-4 px-5 flex flex-col h-fit w-fit gap-2  rounded-md border-2 bg-white border-slate-100">
                        <p className="text-slate-900 text-sm font-medium ">
                            {" "}
                            Article du client
                        </p>
                        <h2 className="text-3xl font-bold text-nextblue-500">
                            {"John Doe"}
                        </h2>
                    </div> */}
                <div className="w-full overflow-x-auto h-full px-2 py-1 flex flex-col gap-2 rounded-md border-2 bg-white border-slate-100">
                    <div className="w-full flex justify-between h-fit sticky left-0 top-0 z-50 pt-1 flex-wrap">
                        <Dialog
                            open={isConfirmDialogOpen}
                            onOpenChange={setIsConfirmDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-green-500  font-medium hover:bg-green-500/85 hover:text-slate-50"
                                    size={"sm"}
                                >
                                    <Icon
                                        icon={"solar:cart-check-broken"}
                                        width={24}
                                        height={24}
                                        className="scale-125"
                                    />
                                    Valider le panier
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Envoyer les données vers Hubspot
                                    </DialogTitle>
                                    <DialogDescription>
                                        Veuillez confirmer l'envoi des données
                                        avec les params à prendre en compte.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col">
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="isSyncErp"
                                            type="checkbox"
                                            className="w-4"
                                            checked={sendConfirm.isSyncErp}
                                            onChange={handleCheckboxChange}
                                        />
                                        <Label
                                            htmlFor="isSyncErp"
                                            className="text-right"
                                        >
                                            Synchronisé avec l'ERP.
                                        </Label>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="isClearCart"
                                            type="checkbox"
                                            className="w-4"
                                            checked={sendConfirm.isClearCart}
                                            onChange={handleCheckboxChange}
                                        />
                                        <Label
                                            htmlFor="isClearCart"
                                            className="text-right"
                                        >
                                            Effacer la cart avant d'ajouter les
                                            données.
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            onClick={() => {
                                                setSendConfirm({
                                                    isSyncErp: false,
                                                    isClearCart: false,
                                                });
                                            }}
                                            type="button"
                                            variant="destructive"
                                            className="bg-red-100 text-red-500 hover:bg-red-100/80"
                                        >
                                            Annuler
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        onClick={handleSendHubspot}
                                    >
                                        Envoyer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Confirmation requise
                                    </DialogTitle>
                                    <DialogDescription>
                                        Êtes-vous sûr de vouloir synchroniser
                                        avec l'ERP ? Cette action est
                                        irréversible.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                setSendConfirm(
                                                    (prev: {
                                                        isSyncErp: boolean;
                                                        isClearCart: boolean;
                                                    }) => ({
                                                        ...prev,
                                                        isSyncErp: false,
                                                    })
                                                )
                                            }
                                        >
                                            Annuler
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Confirmer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="flex items-center gap-4">
                            <Link to={"/panier/addArticle"}>
                                <Button
                                    className=" hover:text-slate-50"
                                    size={"sm"}
                                >
                                    <Icon
                                        icon={"lucide:plus"}
                                        width={24}
                                        height={24}
                                        // className="scale-125"
                                    />
                                    Ajouter un article
                                </Button>
                            </Link>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={"secondary"}>
                                        {" "}
                                        Colonnes à afficher
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-60 h-96 z-50 bg-white overflow-y-auto">
                                    <DropdownMenuLabel className="sticky -top-1 z-50 bg-white py-1">
                                        Colonnes à afficher
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {columns.map((col) => {
                                        if (
                                            (articles?.empty_columns &&
                                                Object.keys(
                                                    articles.empty_columns
                                                ).includes(col.id as string)) ||
                                            col.id == "checkbox" ||
                                            col.id == "actions" ||
                                            col.id == "drag-handle"
                                        )
                                            return null;
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={col.id}
                                                checked={
                                                    !hideKeys.includes(
                                                        col.id as string
                                                    )
                                                }
                                                onCheckedChange={() =>
                                                    handleToggleColumnVisibility(
                                                        col.id as string
                                                    )
                                                }
                                            >
                                                {typeof col.header === "string"
                                                    ? col.header
                                                    : col.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                size={"icon"}
                                variant={"outline"}
                                onClick={handleRefresh}
                            >
                                <Icon icon={"solar:refresh-linear"} />
                            </Button>
                        </div>
                    </div>

                    <GenericTable
                        handleSort={() => {}}
                        columns={columns}
                        data={commandeState || []}
                        handleDragEnd={handleDragEnd}
                        dataId={dataIds}
                        isLoading={isLoading}
                        hideKeys={[
                            ...hideKeys,
                            ...(commande?.empty_columns
                                ? Object.keys(commande.empty_columns)
                                : []),
                        ]}
                        handleFilterChange={() => {}}
                    />
                    <div className=" flex flex-wrap justify-between items-end  h-[50%] w-full overflow-hidden relative gap-1 pb-2">
                        <div className="bg-slate-100 w-1/5 min-w-[200px] h-fit py-2 px-3 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-lg">
                                Total HT
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-xl">
                                {totalHorsTaxe} €
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5  min-w-[200px] h-fit py-2 px-3 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-lg">
                                Total Remise
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-xl">
                                {totalRemise} %
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5 min-w-[200px] h-fit py-2 px-3 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-lg">
                                Total HT Net
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-xl">
                                {totalPrixNet.toFixed(2)} €
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5 min-w-[200px] h-fit py-2 px-3 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-lg">
                                Total TTC 20%
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-xl">
                                {(totalPrixNet * 1.2).toFixed(2)} €
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
};

export default HomePage;
