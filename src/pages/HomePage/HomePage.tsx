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
import { ArticleHistoryDialog } from "../AddArticle/ArticleHistoryModal/ArticleHistory";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const HomePage = () => {
    const [hideKeys] = useState<string[]>([
        "mise_en_sommeil",
        "prix_ttc",
        // "prix_vente",
        "prix_achat1",
        "dernier_prix_achat",
        // "stock",
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
        "remise_famille",
        // "remise_finale",
        // "prix_final",
        // "prix_net",
        // "actions",
    ]); // Gérer dynamiquement les colonnes masquées
    const { params } = useUrlParams();

    const [updatedRows, setUpdatedRows] = useLocalStorage<
        Record<string, Partial<Article>>
    >("updatedRows", {});

    const {
        data: commande,
        isLoading,
        // isError,
        // error,
        // refetch,
    } = usePannier({
        uuid: params?.uuid as string,
    });

    const [commandeState, setCommande] = useState<Commandes[] | null>(null);

    useEffect(() => {
        setCommande(commande?.articles || null);
    }, [commande]);

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

    const updateRowData = (rowId: string, rowData: Partial<Article>) => {
        setUpdatedRows((prev) => ({
            ...prev,
            [rowId]: {
                ...rowData,
            },
        }));
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

    const columns = React.useMemo<ColumnDef<Article>[]>(
        () => [
            {
                id: "drag-handle",
                header: "",
                cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
                size: 20,
            },
            {
                id: "reference_article",
                accessorKey: "reference_article",
                header: "Référence",
                cell: (info) => info.getValue(),
            },
            {
                id: "designation_article",
                accessorKey: "designation_article",
                header: "Désignation",
                cell: ({ row }) => {
                    const defaultValue =
                        updatedRows[row.original.reference_article as string]
                            ?.designation_article ||
                        row.original.designation_article ||
                        "";

                    const [design, setDesign] = useState<any>(defaultValue);

                    const onSubmit = (data: any) => {
                        toast.info("Désignation mise à jour");
                        updateRowData(
                            row.original.reference_article as string,
                            {
                                ...row.original,
                                designation_article: data.designation,
                            }
                        );
                    };

                    return (
                        <>
                            <Input
                                value={design}
                                className="mx-2 w-full"
                                onChange={(e) => setDesign(e.target.value)}
                            />

                            {design == row.original.designation_article ||
                            !updatedRows[
                                row.original.reference_article as string
                            ]?.designation_article ? (
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
                        </>
                    );
                },
                size: 400,
            },
            {
                id: "code_famille",
                accessorKey: "code_famille",
                header: "Code Famille",
                cell: (info) => info.getValue(),
                size: 200,
            },
            {
                id: "mise_en_sommeil",
                accessorKey: "mise_en_sommeil",
                header: "Mise en Sommeil",
                cell: (info) => info.getValue(),
            },
            {
                id: "prix_ttc",
                accessorKey: "prix_ttc",
                header: "Prix TTC (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                id: "prix_vente",
                accessorKey: "prix_vente",
                header: "Prix Vente HT (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },

            {
                id: "prix_achat1",
                accessorKey: "prix_achat1",
                header: "Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                id: "dernier_prix_achat",
                accessorKey: "dernier_prix_achat",
                header: "Dernier Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                id: "stock",
                accessorKey: "stock",
                header: " Qte Stock",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
            },
            {
                id: "Qtecommandeclient",
                accessorKey: "Qtecommandeclient",
                header: "Qté Commandée Client",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
            },
            {
                id: "QtecommandeAchat",
                accessorKey: "QtecommandeAchat",
                header: "Qté Commandée Achat",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
            },
            {
                id: "AR_StockTerme",
                accessorKey: "AR_StockTerme",
                header: "Stock à Terme",
                cell: (info) =>
                    parseFloat(info.getValue() as string).toFixed(2),
            },
            {
                id: "catalogue1_intitule",
                accessorKey: "catalogue1_intitule",
                header: "Catalogue 1",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                id: "catalogue2_intitule",
                accessorKey: "catalogue2_intitule",
                header: "Catalogue 2",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                id: "catalogue3_intitule",
                accessorKey: "catalogue3_intitule",
                header: "Catalogue 3",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                id: "catalogue4_intitule",
                accessorKey: "catalogue4_intitule",
                header: "Catalogue 4",
                cell: (info) => info.getValue() || "Non renseigné",
            },

            {
                id: "marque_commerciale",
                accessorKey: "marque_commerciale",
                header: "Marque Commerciale",
                cell: (info) => info.getValue(),
            },
            {
                id: "objectif_qtes_vendues",
                accessorKey: "objectif_qtes_vendues",
                header: "Objectif/Qtés Vendues",
                cell: (info) => info.getValue(),
            },
            {
                id: "pourcentage_or",
                accessorKey: "pourcentage_or",
                header: "Pourcentage OR",
                cell: (info) => info.getValue(),
            },
            {
                id: "premiere_commercialisation",
                accessorKey: "premiere_commercialisation",
                header: "Première Commercialisation",
                cell: (info) => info.getValue(),
            },
            {
                id: "AR_InterdireCommande",
                accessorKey: "AR_InterdireCommande",
                header: "Commande Interdite",
                cell: (info) => info.getValue(),
            },
            {
                id: "AR_Exclure",
                accessorKey: "AR_Exclure",
                header: "Exclure",
                cell: (info) => info.getValue(),
            },

            {
                id: "dossier_hs",
                accessorKey: "dossier_hs",
                header: "Dossier HS",
                cell: (info) => info.getValue(),
            },

            {
                id: "equivalent_75",
                accessorKey: "equivalent_75",
                header: "Équivalent 75",
                cell: (info) => info.getValue(),
            },
            {
                id: "ref_bis",
                accessorKey: "ref_bis",
                header: "Référence Bis",
                cell: (info) => info.getValue(),
            },
            {
                id: "remise_client",
                accessorKey: "remise_client",
                header: "Remise Client",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                id: "prix_vente_client",
                accessorKey: "prix_vente_client",
                header: "Prix Client",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                id: "remise_categorie",
                accessorKey: "remise_categorie",
                header: "Remise Catégorie",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                id: "prix_vente",
                accessorKey: "prix_vente",
                header: "Prix Catégorie",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                id: "remise_famille",
                accessorKey: "remise_famille",
                header: "Remise Famille",
                cell: (info) => info.getValue() || "Aucune",
            },

            {
                id: "remise_finale",
                accessorKey: "remise_finale",
                header: "Remise Finale (%)",
                cell: ({ row }) => {
                    const defaultValue =
                        updatedRows[row.original.reference_article as string]
                            ?.remise_finale ||
                        row.original.remise_finale ||
                        "";
                    const [remise, setRemise] = useState<any>(
                        parseFloat(defaultValue as string).toFixed(2) || 0
                    );

                    const onSubmit = (data: any) => {
                        toast.info("Remise Finale mise à jour");
                        updateRowData(
                            row.original.reference_article as string,
                            {
                                ...row.original,
                                remise_finale: data.remise,
                            }
                        );
                    };

                    return (
                        <>
                            <Input
                                type="number"
                                // {...field}
                                value={remise}
                                onChange={(e) => {
                                    setRemise(e.target.value);
                                }}
                                className="w-full text-left mr-2 "
                            />

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
                        </>
                    );
                },
                size: 250,
            },

            {
                id: "prix_final",
                accessorKey: "prix_final",
                header: "Prix Final (€)",
                cell: ({ row }) => {
                    const defaultValue =
                        updatedRows[row.original.reference_article as string]
                            ?.prix_final ||
                        row.original.prix_final ||
                        "";
                    const [prixFinal, setPrixFinal] = useState<any>(
                        parseFloat(defaultValue as string).toFixed(2) || 0
                    );

                    const onSubmit = (data: any) => {
                        toast.info("Prix Finale mise à jour");

                        updateRowData(
                            row.original.reference_article as string,
                            {
                                ...row.original,
                                prix_final: data.prixFinal,
                            }
                        );
                    };

                    return (
                        <>
                            <Input
                                className="w-full text-left mr-2 "
                                value={prixFinal}
                                onChange={(e) => setPrixFinal(e.target.value)}
                            />

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
                        </>
                    );
                },
                size: 250,
            },

            {
                id: "prix_net",
                accessorKey: "prix_net",
                header: "Prix Net (€)",
                cell: ({ row }) => {
                    return (
                        parseFloat(
                            (row.original.prix_net as string) || "0"
                        ).toFixed(2) + " €"
                    );
                },

                size: 200,
            },

            {
                id: "actions",
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    return (
                        <ArticleHistoryDialog
                            designation={row.original.designation_article}
                            reference={row.original.reference_article}
                            key={row.original.reference_article}
                        />
                    );
                },
            },
        ],
        [updateRowData, updatedRows]
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
                        <Link to={"/addArticle"}>
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
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
};

export default HomePage;
