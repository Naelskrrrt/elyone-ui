import GenericTable from "@/components/CommandeTable/GenericTable";
import React, { useEffect, useState } from "react";
// import { makeData } from "@/components/CommandeTable/makeData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUrlParams } from "@/context/UrlParamsContext";
import { useArticles } from "@/hooks/useArticles";
import { Article } from "@/types/Article";
import { ColumnDef } from "@tanstack/react-table";
import debounce from "lodash.debounce";
import ReactPaginate from "react-paginate";
import { Toaster, toast } from "sonner";

import { sendPannier } from "@/api/articleApi";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import { AxiosError } from "axios";
import { ArticleHistoryDialog } from "./ArticleHistoryModal/ArticleHistory";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

// type Checked = DropdownMenuCheckboxItemProps["checked"];

const AddArticle = () => {
    const [articlePerPage, setArticlePerPage] = useState(25);
    const [search] = useState<string>("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [checkedState, setCheckedState] = useLocalStorage<
        Record<string, boolean>
    >("checkedRows", {});
    // const [order, setOrder] = useState<Record<string, string>>({});
    const [hideKeys, setHideKeys] = useState<string[]>([
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
        // "prix_vente",
        "remise_famille",
        // "remise_finale",
        // "prix_final",
        // "prix_net",
        // "actions",
    ]); // Gérer dynamiquement les colonnes masquées
    const { params } = useUrlParams();
    const [showFilters, setShowFilters] = useState<Boolean>(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationKey, setPaginationKey] = useState(Date.now());
    const [sortState, setSortState] = useState<{
        index: string;
        value: "ASC" | "DESC";
    }>({
        index: "0",
        value: "DESC",
    });
    //sqlOrder={"index":"index de colonnes", "value" : "DESC na ASC"}

    const handleSort = (columnId: string) => {
        setSortState((prev) => {
            if (prev.index === columnId) {
                return {
                    index: columnId,
                    value: prev.value === "ASC" ? "DESC" : "ASC",
                };
            }
            return { index: columnId, value: "ASC" };
        });
    };

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [updatedRows, setUpdatedRows] = useLocalStorage<
        Record<string, Partial<Article>>
    >("updatedRows", {});

    const {
        data: articles,
        isLoading,
        // isError,
        // error,
        refetch,
    } = useArticles({
        ct_num: params?.ct_num || "EXAMPLE",
        filter: filters,
        search: search,
        page: currentPage + 1, // La pagination dans React Query est souvent 1-indexée
        per_page: articlePerPage,
        sqlOrder: sortState,
        hubspot_id: params?.hubspot_id || "",
        deal_id: params?.deal_id || "",
    });

    const mutation = useMutation({
        mutationFn: sendPannier,
        onSuccess: () => {
            toast.success("Les articles ont été ajoutés au panier");
            setUpdatedRows({});
            setCheckedState({});
            queryClient.invalidateQueries({ queryKey: ["pannier"] });
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            refetch();
            navigate("/");
        },
        onError: (error: AxiosError) => {
            if (error.status === 500)
                toast.error("Erreur lors de l'envoi des données", {
                    description: "Veuillez réessayer plus tard !",
                });
            else toast.error("Erreur lors de l'envoi des données");
        },
    });

    const totalArticles = articles?.total;

    const handleToggleColumnVisibility = (id: string) => {
        setFilters({});
        setHideKeys((prev) =>
            prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
        );
    };

    const handleCheckboxChange = (articleId: string, row: Article) => {
        setCheckedState((prev) => ({
            ...prev,
            [articleId]: !prev[articleId],
        }));
        if (!checkedState[articleId]) {
            setUpdatedRows((prev) => ({
                ...prev,
                [articleId]: { ...row },
            }));
        } else {
            setUpdatedRows((prev) => {
                const { [articleId]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleCancel = () => {
        toast.warning("Vous avez annulé l'ajout des articles");
        setCheckedState({});
        setUpdatedRows({});
    };

    console.log(params);

    const handleSendArticle = () => {
        const dataToSend = Object.entries(updatedRows).map(([_, value]) => ({
            ...value,
            uuid: params?.uuid,
        })) as Article[];
        console.log(dataToSend);
        mutation.mutate(dataToSend);
    };

    const handlePageClick = (selectedItem: { selected: number }) => {
        if (isLoading) return;
        const newPage = selectedItem.selected;
        setCurrentPage(newPage); // Met à jour immédiatement l'état
    };

    useEffect(() => {
        refetch(); // Recharge les données à chaque changement de page
    }, [currentPage]);

    const handleVisibleFilter = () => {
        console.log("Toggling visibility", showFilters);
        setShowFilters((prevVisible) => !prevVisible);
    };

    const handleFilterChange = React.useCallback(
        debounce((key: string | number, value: string) => {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
            }));
        }, 0),
        []
    );

    useEffect(() => {
        setCurrentPage(0);
        setPaginationKey(Date.now());

        return () => {
            handleFilterChange.cancel();
        };
    }, [handleFilterChange, filters, sortState]);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["articles"] });
        setFilters({});
        setCurrentPage(0);
        setArticlePerPage(25);
        setPaginationKey(Date.now());
    };

    const updateRowData = (rowId: string, rowData: Partial<Article>) => {
        setUpdatedRows((prev) => ({
            ...prev,
            [rowId]: {
                ...rowData,
            },
        }));
    };

    console.log(updatedRows);

    const columns = React.useMemo<ColumnDef<Article>[]>(
        () => [
            {
                id: "checkbox",
                cell: ({ row }) => (
                    <Input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={
                            checkedState[
                                row.original.reference_article || ""
                            ] || false
                        }
                        onChange={() =>
                            handleCheckboxChange(
                                row.original.reference_article || "",
                                row.original
                            )
                        }
                    />
                ),
                size: 20,
                enableResizing: false,
                enableHiding: false,
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
                                prix_final:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.prix_final ||
                                    row.original.prix_final ||
                                    "",
                                remise_finale:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.remise_finale ||
                                    row.original.remise_finale ||
                                    "",
                            }
                        );
                    };

                    const isChecked =
                        checkedState[row.original.reference_article || ""];

                    if (isChecked)
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
                    return <span>{row.original.designation_article}</span>;
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
                // 30
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
                                designation_article:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.designation_article ||
                                    row.original.designation_article ||
                                    "",
                                prix_final:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.prix_final ||
                                    row.original.prix_final ||
                                    "",
                            }
                        );
                    };

                    const isChecked =
                        checkedState[row.original.reference_article || ""];

                    if (isChecked)
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
                    return (
                        <span>
                            {parseFloat(
                                row.original.remise_finale as string
                            ).toFixed(2) || 0}
                        </span>
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
                                designation_article:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.designation_article ||
                                    row.original.designation_article ||
                                    "",
                                remise_finale:
                                    updatedRows[
                                        row.original.reference_article as string
                                    ]?.remise_finale ||
                                    row.original.remise_finale ||
                                    "",
                            }
                        );
                    };

                    const isChecked =
                        checkedState[row.original.reference_article || ""];

                    if (isChecked)
                        return (
                            <>
                                <Input
                                    className="w-full text-left mr-2 "
                                    value={prixFinal}
                                    onChange={(e) =>
                                        setPrixFinal(e.target.value)
                                    }
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
                    return (
                        <span>
                            {parseFloat(
                                row.original.prix_final as string
                            ).toFixed(2) || 0}
                        </span>
                    );
                },
                size: 200,
            },

            {
                // 32
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

                size: 150,
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
                size: 125,
            },
        ],
        [
            checkedState,
            showFilters,
            filters,
            updateRowData,
            updatedRows,
            paginationKey,
            currentPage,
            sortState,
            setSortState,
            handleSort,
        ]
    );

    console.log(articles?.empty_columns);

    return (
        <div className="flex w-full relative h-full bg-slate-200 flex-col gap-1 overflow-y-auto px-3 py-1">
            <div className="w-full overflow-x-auto h-full px-2 py-1 flex flex-col gap-2 rounded-md border-2 bg-white border-slate-100">
                <div className="w-full flex justify-between h-fit sticky left-0 top-0 z-50 pt-1">
                    <Button
                        className="bg-slate-500 hover:bg-slate-500/90"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVisibleFilter();
                        }}
                    >
                        Afficher les Filtres
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={handleRefresh}
                        >
                            <Icon icon={"solar:refresh-linear"} />
                        </Button>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button> Colonnes à afficher</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60 h-96 overflow-y-auto">
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
                                        col.id == "actions"
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
                    </div>
                </div>

                <GenericTable
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    isLoading={isLoading}
                    columns={columns}
                    data={articles?.articles}
                    handleDragEnd={() => {}}
                    showFilters={showFilters as boolean}
                    hideKeys={[
                        ...hideKeys,
                        ...(articles?.empty_columns
                            ? Object.keys(articles.empty_columns)
                            : []),
                    ]}
                    handleSort={handleSort}
                    sortState={sortState}
                    isSortable={true}
                />

                <div className="flex items-center  justify-between flex-wrap">
                    <div className="flex gap-1 items-center">
                        <Select
                            value={articlePerPage.toString()}
                            onValueChange={(value) =>
                                setArticlePerPage(Number(value))
                            }
                        >
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder="Pages" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Articles</SelectLabel>
                                    <SelectItem value="10">
                                        10 Articles
                                    </SelectItem>
                                    <SelectItem value="25">
                                        25 Articles
                                    </SelectItem>
                                    <SelectItem value="50">
                                        50 Articles
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <p className="text-slate-800 text-sm">Par page</p>
                    </div>
                    {totalArticles && (
                        <ReactPaginate
                            forcePage={currentPage}
                            key={paginationKey}
                            previousLabel={"←"}
                            nextLabel={"→"}
                            breakLabel={"..."}
                            pageCount={
                                totalArticles
                                    ? Math.ceil(totalArticles / articlePerPage)
                                    : 0
                            }
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            containerClassName="flex justify-center gap-2 "
                            pageClassName="group"
                            pageLinkClassName="px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-blue-500 hover:text-white transition-all"
                            previousClassName="group"
                            previousLinkClassName="px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-blue-500 hover:text-white transition-all"
                            nextClassName="group"
                            nextLinkClassName="px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-blue-500 hover:text-white transition-all"
                            breakClassName="group"
                            breakLinkClassName="px-3 py-1 rounded-md border border-slate-300 text-slate-600 hover:bg-blue-500 hover:text-white transition-all"
                            activeClassName="active"
                            activeLinkClassName="bg-blue-500 text-white"
                        />
                    )}
                </div>
                {Object.values(checkedState).some((isChecked) => isChecked) && (
                    <div className="flex gap-2 flex-row">
                        <Button
                            onClick={handleCancel}
                            className="bg-red-400/20 text-red-500 font-semibold hover:bg-red-400/30"
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleSendArticle}>Ajouter</Button>
                    </div>
                )}
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};

export default AddArticle;
