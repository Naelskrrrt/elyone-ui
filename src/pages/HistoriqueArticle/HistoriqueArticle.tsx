import GenericTable from "@/components/CommandeTable/GenericTable";
import React, { useEffect, useState } from "react";
// import { makeData } from "@/components/CommandeTable/makeData";
import { Button } from "@/components/ui/button";
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
import { useArticleGlobalHistory } from "@/hooks/useArticles";
import { GlobalHistory } from "@/types/Article";
import { ColumnDef } from "@tanstack/react-table";
import debounce from "lodash.debounce";
import ReactPaginate from "react-paginate";
import { Toaster } from "sonner";

import dayjs from "dayjs";
import "dayjs/locale/fr"; // Charger la locale française
import localizedFormat from "dayjs/plugin/localizedFormat";

const AddArticle = () => {
    const [articlePerPage, setArticlePerPage] = useState(25);
    const [search] = useState<string>("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    // const [order, setOrder] = useState<Record<string, string>>({});

    const { params } = useUrlParams();
    const [showFilters, setShowFilters] = useState<Boolean>(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationKey, setPaginationKey] = useState(Date.now());
    const [sortState, setSortState] = useState<{
        index: string;
        value: "ASC" | "DESC";
    }>({
        index: "0",
        value: "ASC",
    });

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

    const {
        data: history,
        isLoading,
        // isError,
        // error,
        refetch,
    } = useArticleGlobalHistory({
        ct_num: params?.ct_num || "EXAMPLE",
        filter: filters,
        search: search,
        page: currentPage + 1, // La pagination dans React Query est souvent 1-indexée
        per_page: articlePerPage,
        sqlOrder: sortState,
        hubspot_id: params?.hubspot_id || "",
        deal_id: params?.deal_id || "",
    });

    console.log("History", history);
    console.log("Trier", sortState);

    const totalArticles = history?.total;

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

    dayjs.extend(localizedFormat);
    dayjs.locale("fr");

    const columns = React.useMemo<ColumnDef<GlobalHistory>[]>(
        () => [
            {
                id: "id",
                // accessorKey: "id",
                size: 50,
            },
            {
                // 0
                id: "date_achat",
                accessorKey: "date_achat",
                header: "Date d'achat",
                cell: ({ row }) => {
                    const formattedDate = dayjs(row.original.date_achat).format(
                        "DD MMM YYYY"
                    );

                    return <span>{formattedDate}</span>;
                },
                size: 170,
            },

            {
                // 1
                id: "numero_document",
                accessorKey: "numero_document",
                header: "N° de document",
                cell: (info) => info.getValue(),
            },
            {
                // 2
                id: "reference_article",
                accessorKey: "reference_article",
                header: "Référence",
                cell: (info) => info.getValue(),
            },

            {
                // 3
                id: "designation_article",
                accessorKey: "designation_article",
                header: "Désignation",
                cell: (info) => info.getValue(),
                size: 350,
            },
            {
                // 4
                id: "quantite_achat",
                accessorKey: "quantite_achat",
                header: "Quantité",
                cell: (info) =>
                    parseInt(info.row.original.quantite_achat || ""),
            },
            {
                // 5
                id: "prix_achat",
                accessorKey: "prix_achat",
                header: "Prix Unit.",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2) +
                    " €",
            },
            {
                // 6
                id: "remise",
                accessorKey: "remise",
                header: "Rémise",
                cell: (info) => parseInt(info.getValue<string>() || "0") + " %",
                size: 160,
            },
            {
                // 7
                id: "prix_remise",
                accessorKey: "prix_remise",
                header: "Prix Rémisé",
                cell: (info) => parseInt(info.getValue<string>() || "0") + " €",
                size: 160,
            },
            {
                // 9
                id: "total_ht_net",
                accessorKey: "total_ht_net",
                header: "Total Net",
                cell: (info) => parseInt(info.getValue<string>() || "0") + " €",
                size: 160,
            },
        ],
        [
            showFilters,
            filters,
            paginationKey,
            currentPage,
            sortState,
            setSortState,
            handleSort,
        ]
    );

    console.log(history);

    return (
        <div className="flex w-full relative h-full bg-slate-200 flex-col gap-1 overflow-y-auto px-3 py-1">
            <div className="w-full overflow-x-auto h-full px-2 py-1 flex flex-col gap-2 rounded-md border-2 bg-white border-slate-100">
                <div className="w-full flex justify-between h-fit sticky left-0 top-0 z-50 pt-1">
                    <div className="flex gap-2">
                        <Button
                            className="bg-slate-500 hover:bg-slate-500/90"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVisibleFilter();
                            }}
                        >
                            Afficher les Filtres
                        </Button>
                    </div>

                    <div className="flex items-center gap-4"></div>
                </div>

                <GenericTable
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    isLoading={isLoading}
                    columns={columns}
                    data={history?.data}
                    handleDragEnd={() => {}}
                    showFilters={showFilters as boolean}
                    handleSort={handleSort}
                    sortState={sortState}
                    isSortable={true}
                    hideKeys={["id"]}
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
                                    ? Math.floor(totalArticles / articlePerPage)
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
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
};

export default AddArticle;
