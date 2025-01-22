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

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

const AddArticle = () => {
    const [articlePerPage, setArticlePerPage] = useState(25);
    const [search] = useState<string>("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
        {}
    );
    const [order, setOrder] = useState<Record<string, string>>({});
    const [hideKeys, setHideKeys] = useState<string[]>([]); // Gérer dynamiquement les colonnes masquées
    const { params } = useUrlParams();
    const [showFilters, setShowFilters] = useState<Boolean>(false);
    const [currentPage, setCurrentPage] = useState(0);
    const {
        data: articles,
        isLoading,
        // isError,
        // error,
    } = useArticles({
        ct_num: params?.ct_num || "EXAMPLE",
        filter: filters,
        search: search,
        page: currentPage + 1, // La pagination dans React Query est souvent 1-indexée
        per_page: articlePerPage,
        sqlOrder: { "0": "ASC" },
        hubspot_id: params?.hubspot_id || "",
        deal_id: params?.deal_id || "",
    });
    const totalArticles = articles?.total;
    console.log("totalArticles:" + totalArticles);

    const handleToggleColumnVisibility = () => {
        setFilters({});
        setHideKeys((prev) =>
            prev.includes("designation_article")
                ? prev.filter((key) => key !== "designation_article")
                : [...prev, "designation_article"]
        );
    };

    const handleCheckboxChange = (userId: string) => {
        setCheckedState((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    const handleCancel = () => {
        setCheckedState({});
    };

    const handleAddArticle = () => {
        const selectedArticles = Object.keys(checkedState).filter(
            (key) => checkedState[key]
        );
        console.log("Articles sélectionnés :", selectedArticles);
    };

    const handlePageClick = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected);
    };

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
        [] // Dépendances vides pour s'assurer que debounce est stable
    );

    const handleOrderChange = React.useCallback(
        debounce((key: string | number, value: string) => {
            setOrder((prev) => ({
                ...prev,
                [key]: value,
            }));
        }, 0),
        [] // Dépendances vides pour s'assurer que debounce est stable
    );

    useEffect(() => {
        return () => {
            handleFilterChange.cancel();
        };
    }, [handleFilterChange]);

    const columns = React.useMemo<ColumnDef<Article>[]>(
        // Designation, remise finale, prix finale = prix net
        () => [
            {
                id: "checkbox",
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={
                            checkedState[
                                row.original.reference_article || ""
                            ] || false
                        }
                        onChange={() =>
                            handleCheckboxChange(
                                row.original.reference_article || ""
                            )
                        }
                    />
                ),
                size: 20,
                enableResizing: false,
                enableHiding: false,
            },
            {
                accessorKey: "reference_article",
                header: "Référence",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "designation_article",
                header: "Désignation",
                cell: ({ row }) => (
                    <Input
                        value={row.original.designation_article}
                        className="mx-2"
                    />
                ),
                size: 355,
            },
            {
                accessorKey: "code_famille",
                header: "Code Famille",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "categorie_article",
                header: "Catégorie Article",
                cell: (info) => info.getValue(),
                size: 200,
            },
            {
                accessorKey: "marque_commerciale",
                header: "Marque Commerciale",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "prix_vente",
                header: "Prix Vente HT (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                accessorKey: "prix_ttc",
                header: "Prix TTC (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                accessorKey: "remise_client",
                header: "Remise Client",
                cell: (info) => info.getValue() || "Aucune",
            },
            {
                accessorKey: "dernier_prix_achat",
                header: "Dernier Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                accessorKey: "prix_achat1",
                header: "Prix Achat 1 (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                accessorKey: "mise_en_sommeil",
                header: "Mise en Sommeil",
                cell: (info) => (info.getValue() ? "Oui" : "Non"),
            },
            {
                accessorKey: "stock",
                header: "Stock",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
            },
            {
                accessorKey: "Qtecommandeclient",
                header: "Qté Commandée Client",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
            },
            {
                accessorKey: "QtecommandeAchat",
                header: "Qté Commandée Achat",
                cell: (info) => parseInt(info.getValue<string>() || "0"),
                size: 200,
            },
            {
                accessorKey: "prix_final",
                header: "Prix Final (€)",
                cell: ({ row }) => {
                    const prixFinal = parseFloat(
                        row.original.prix_final || "0"
                    ).toFixed(2);
                    return (
                        <div className="mx-2">
                            <Input
                                value={prixFinal + " €"}
                                onChange={() => {}}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "remise_finale",
                header: "Remise Finale (%)",
                cell: ({ row }) => {
                    const remiseFinale = parseFloat(
                        row.original.remise_finale || "0"
                    ).toFixed(2);
                    return (
                        <div className="mx-2">
                            <Input
                                value={remiseFinale + " %"}
                                onChange={() => {}}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "prix_net",
                header: "Prix Net (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },

            {
                accessorKey: "AR_Exclure",
                header: "Exclu",
                cell: (info) => (info.getValue() ? "Oui" : "Non"),
            },
            {
                accessorKey: "AR_InterdireCommande",
                header: "Commande Interdite",
                cell: (info) => (info.getValue() ? "Oui" : "Non"),
            },
            {
                accessorKey: "dossier_hs",
                header: "Dossier HS",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "premiere_commercialisation",
                header: "Première Commercialisation",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                accessorKey: "equivalent_75",
                header: "Équivalent 75",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                accessorKey: "catalogue1_intitule",
                header: "Catalogue 1",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                accessorKey: "catalogue2_intitule",
                header: "Catalogue 2",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                accessorKey: "catalogue3_intitule",
                header: "Catalogue 3",
                cell: (info) => info.getValue() || "Non renseigné",
            },
            {
                accessorKey: "catalogue4_intitule",
                header: "Catalogue 4",
                cell: (info) => info.getValue() || "Non renseigné",
            },
        ],
        [checkedState, showFilters, filters]
    );

    const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
    const [showActivityBar, setShowActivityBar] =
        React.useState<Checked>(false);
    const [showPanel, setShowPanel] = React.useState<Checked>(false);

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
                    <Button
                        title="Colonne à afficher dans le tableau"
                        onClick={handleToggleColumnVisibility}
                    >
                        Colonnes
                    </Button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Open</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 h-56 overflow-y-auto">
                            <DropdownMenuLabel className="sticky -top-1 z-50 bg-white py-1">
                                Afficher le colonne
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {columns.map((column) => {
                                if (column.id === "checkbox") return null;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={showStatusBar}
                                        onCheckedChange={setShowStatusBar}
                                    >
                                        {typeof column.header === "string"
                                            ? column.header
                                            : "Column"}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                    <ReactPaginate
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
                </div>
                {Object.values(checkedState).some((isChecked) => isChecked) && (
                    <div className="flex gap-2 flex-row">
                        <Button
                            onClick={handleCancel}
                            className="bg-red-400/20 text-red-500 font-semibold hover:bg-red-400/30"
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleAddArticle}>Ajouter</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddArticle;
