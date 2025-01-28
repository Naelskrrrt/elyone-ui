import GenericTable from "@/components/CommandeTable/GenericTable";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUrlParams } from "@/context/UrlParamsContext";
import { usePannier } from "@/hooks/usePannier";
import { Article, Commandes } from "@/types/Article";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { ColumnDef } from "@tanstack/react-table";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Link } from "react-router";
import { toast, Toaster } from "sonner";
// import { ArticleHistoryDialog } from "../AddArticle/ArticleHistoryModal/ArticleHistory";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArticles } from "@/hooks/useArticles";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";

const HomePage = () => {
    const [hideKeys, setHideKeys] = useState<string[]>([
        "mise_en_sommeil",
        "prix_ttc",
        // "prix_vente",
        "prix_achat1",
        "dernier_prix_achat",
        "stock",
        "code_famille",
        "",
        "Qtecommandeclient",
        "QtecommandeAchat",
        "AR_StockTerme",
        "catalogue1_intitule",
        "catalogue2_intitule",
        "catalogue3_intitule",
        "catalogue4_intitule",
        "marque_commerciale",
        "objectif_qtes_vendues",
        "pourcentage_or",
        "premiere_commercialisation",
        "AR_InterdireCommande",
        "AR_Exclure",
        "dossier_hs",
        "equivalent_75",
        "ref_bis",
        "remise_client",
        "prix_vente_client",
        "remise_categorie",
        "prix_vente",
        "prix_cat",
        "remise_famille",
        // "remise_finale",
        // "prix_final",
        // "prix_net",
        // "actions",
    ]); // Gérer dynamiquement les colonnes masquées
    const { params } = useUrlParams();
    const [totalPrixNet, setTotalPrixNet] = useState<number>(0);
    const {
        data: commande,
        isLoading,
        // isError,
        // error,
        // refetch,
    } = usePannier({
        uuid: params?.uuid as string,
    });

    // useEffect(() => {
    //     if (commande) {
    //         setPanier(commande.articles);
    //     }
    //     return () => {
    //         setPanier([]);
    //     };
    // }, [commande]);

    const {
        data: articles,
        isLoading: articleLoading,
        // isError,
        // error,
        // refetch,
    } = useArticles({
        ct_num: params?.ct_num || "EXAMPLE",
        // filter: { ""},
        // search: search,
        // page: currentPage + 1, // La pagination dans React Query est souvent 1-indexée
        // per_page: articlePerPage,
        // sqlOrder: sortState,
        hubspot_id: params?.hubspot_id || "",
        deal_id: params?.deal_id || "",
    });

    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["pannier"] });
    };

    const handleToggleColumnVisibility = (id: string) => {
        // setFilters({});
        setHideKeys((prev) =>
            prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
        );
    };

    const [commandeState, setCommande] = useLocalStorage<Commandes[] | null>(
        "panier",
        commande?.articles || null
    );

    const addCommande = (newArticles: Commandes[]) => {
        if (!commandeState) {
            setCommande(newArticles); // Si `commandeState` est null, ajoute les articles directement
        } else {
            const articlesExistants = new Set(
                commandeState.map((item) => item.id)
            ); // Supposons que chaque article a un champ `id` unique
            const articlesAjouter = newArticles.filter(
                (item) => !articlesExistants.has(item.id)
            );

            if (articlesAjouter.length > 0) {
                setCommande([...commandeState, ...articlesAjouter]);
            }
        }
    };

    useEffect(() => {
        if (commande?.articles) {
            addCommande(commande.articles);
        }
    }, [commande?.articles]);

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => (commandeState ? commandeState.map((item) => item.id) : []),
        [commandeState]
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setCommande((prevCommande) => {
                if (!prevCommande) return null;

                const oldIndex = prevCommande.findIndex(
                    (item) => item.id === active.id
                );
                const newIndex = prevCommande.findIndex(
                    (item) => item.id === over.id
                );

                if (oldIndex === -1 || newIndex === -1) return prevCommande;

                const updatedCommande = arrayMove(
                    prevCommande,
                    oldIndex,
                    newIndex
                );
                return updatedCommande;
            });
        }
    }

    const updateRowData = (rowId: number, rowData: Partial<Commandes>) => {
        setCommande((prev) => {
            if (!prev) return null;
            return prev.map((item) =>
                item.id === rowId
                    ? ({ ...item, ...rowData } as Commandes)
                    : item
            );
        });
    };

    const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
        const { attributes, listeners } = useSortable({
            id: rowId || "",
        });
        return (
            <button {...attributes} {...listeners}>
                <Icon icon={"lsicon:drag-outline"} className="scale-150" />
            </button>
        );
    };

    useEffect(() => {
        const totalPrixNet = (commandeState || []).reduce(
            (sum, article) => sum + parseFloat(article.total_ht_net || "0"),
            0
        );
        setTotalPrixNet(totalPrixNet);
    }, [commandeState]);

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
                size: 400,
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
                // 2
                id: "code_famille",
                accessorKey: "code_famille",
                header: "Code Famille",
                cell: (info) => info.getValue(),
                size: 150,
            },
            {
                // 3
                id: "mise_en_sommeil",
                accessorKey: "mise_en_sommeil",
                header: "Mise en Sommeil",
                cell: (info) => info.getValue(),
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
                // 6
                id: "prix_achat1",
                accessorKey: "prix_achat1",
                header: "Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                // 7
                // PRIX UNITAIRE D'ACHAT
                id: "dernier_prix_achat",
                accessorKey: "dernier_prix_achat",
                header: "Dernier Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                // 8
                id: "stock",
                accessorKey: "stock",
                header: " Qte Stock",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
            },
            {
                // 9
                id: "Qtecommandeclient",
                accessorKey: "Qtecommandeclient",
                header: "Qté Commandée Client",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
            },
            {
                // 10
                id: "QtecommandeAchat",
                accessorKey: "QtecommandeAchat",
                header: "Qté Commandée Achat",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
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
                // 12
                id: "catalogue1_intitule",
                accessorKey: "catalogue1_intitule",
                header: "Catalogue 1",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                // 13
                id: "catalogue2_intitule",
                accessorKey: "catalogue2_intitule",
                header: "Catalogue 2",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                // 14
                id: "catalogue3_intitule",
                accessorKey: "catalogue3_intitule",
                header: "Catalogue 3",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                // 15
                id: "catalogue4_intitule",
                accessorKey: "catalogue4_intitule",
                header: "Catalogue 4",
                cell: (info) => info.getValue() || "Non renseigné",
            },

            {
                // 16
                id: "marque_commerciale",
                accessorKey: "marque_commerciale",
                header: "Marque Commerciale",
                cell: (info) => info.getValue(),
            },
            {
                // 17
                id: "objectif_qtes_vendues",
                accessorKey: "objectif_qtes_vendues",
                header: "Objectif/Qtés Vendues",
                cell: (info) => info.getValue(),
            },
            {
                // 18
                id: "pourcentage_or",
                accessorKey: "pourcentage_or",
                header: "Pourcentage OR",
                cell: (info) => info.getValue(),
            },

            {
                // 19
                id: "premiere_commercialisation",
                accessorKey: "premiere_commercialisation",
                header: "1ère Comm",
                cell: (info) => info.getValue(),
            },
            {
                // 20
                id: "AR_InterdireCommande",
                accessorKey: "AR_InterdireCommande",
                header: "Commande Interdite",
                cell: (info) => info.getValue(),
            },
            {
                // 21
                id: "AR_Exclure",
                accessorKey: "AR_Exclure",
                header: "Exclure",
                cell: (info) => info.getValue(),
            },

            {
                // 22
                id: "dossier_hs",
                accessorKey: "dossier_hs",
                header: "Dossier HS",
                cell: (info) => info.getValue(),
            },

            {
                // 23
                id: "equivalent_75",
                accessorKey: "equivalent_75",
                header: "Équivalent 75",
                cell: (info) => info.getValue(),
            },
            {
                // 24
                id: "ref_bis",
                accessorKey: "ref_bis",
                header: "Référence Bis",
                cell: (info) => info.getValue(),
            },
            {
                // 25
                id: "remise_client",
                accessorKey: "remise_client",
                header: "Remise Client",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                // 26
                id: "prix_vente_client",
                accessorKey: "prix_vente_client",
                header: "Prix Client",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                // 27
                id: "remise_categorie",
                accessorKey: "remise_categorie",
                header: "Remise Catégorie",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                // 28
                id: "prix_cat",
                accessorKey: "prix_cat",
                header: "Prix Catégorie",
                cell: ({ row }) =>
                    parseFloat(row.original.prix_vente || "0").toFixed(2) +
                    " €",
                size: 170,
            },
            {
                // 29
                id: "remise_famille",
                accessorKey: "remise_famille",
                header: "Remise Famille",
                cell: (info) => info.getValue() || "Aucune",
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
                            onClick={() => {}}
                            size={"icon"}
                            className="bg-red-100 text-red-500 hover:bg-red-100/80"
                        >
                            <Icon icon={"lucide:trash"} />
                        </Button>
                    );
                },
            },
        ],
        [updateRowData, commandeState]
    );
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
                    <div className="w-full flex justify-between h-fit sticky left-0 top-0 z-50 pt-1">
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
                    <div className=" flex flex-wrap justify-evenly  h-[50%] w-full overflow-hidden relative gap-1">
                        <div className="bg-slate-100 w-1/5 min-w-[300px] h-fit py-6 px-4 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-xl">
                                Total HT
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-3xl">
                                {totalPrixNet}
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5 min-w-[300px] h-fit py-6 px-4 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-xl">
                                Total Remise
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-3xl">
                                1000 $
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5 min-w-[300px] h-fit py-6 px-4 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-xl">
                                Total HT Net
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-3xl">
                                1000 $
                            </h1>
                        </div>
                        <div className="bg-slate-100 w-1/5 min-w-[300px] h-fit py-6 px-4 rounded-md">
                            <h1 className="font-semibold text-slate-400 text-xl">
                                Total TTC 20%
                            </h1>
                            <h1 className="text-nextblue-500 font-bold text-4xl">
                                1000 $
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
