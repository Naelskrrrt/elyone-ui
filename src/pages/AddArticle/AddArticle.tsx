import React, { useEffect, useState } from "react";
import GenericTable, { Person } from "@/components/CommandeTable/GenericTable";
import { makeData } from "@/components/CommandeTable/makeData";
import Loader from "@/components/loader/loader";
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
import ReactPaginate from "react-paginate";
import { ColumnDef } from "@tanstack/react-table";
import { useArticles } from "@/hooks/useArticles";
import { Article } from "@/types/Article";

const AddArticle = () => {
    const [loading, setLoading] = useState(false);
    const [articlePerPage, setArticlePerPage] = useState(10);
    const [data, setData] = useState<Person[]>([]);
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
        {}
    );

    const [currentPage, setCurrentPage] = useState(0);
    const totalArticles = 100;
    const {
        data: articles,
        isLoading,
        isError,
        error,
    } = useArticles({
        ct_num: "EXAMPLE",
        // filter: { indexColumn: "value" },
        search: "test",
        page: currentPage + 1, // La pagination dans React Query est souvent 1-indexée
        per_page: articlePerPage,
        sqlOrder: "ASC",
    });

    useEffect(() => {
        setLoading(true);
        const loadPageData = async () => {
            const startIndex = currentPage * articlePerPage;
            const endIndex = startIndex + articlePerPage;
            const newData = makeData(totalArticles).slice(startIndex, endIndex);

            // Préserver les cases cochées pour les articles affichés
            const updatedCheckedState: Record<string, boolean> = {};
            newData.forEach((item) => {
                updatedCheckedState[item.userId] =
                    checkedState[item.userId] || false;
            });

            setCheckedState((prev) => ({ ...prev, ...updatedCheckedState }));
            setData(newData);
            setLoading(false);
        };

        loadPageData();
    }, [articlePerPage, currentPage, totalArticles]);

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

    const columns = React.useMemo<ColumnDef<Article>[]>(
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
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "code_famille",
                header: "Famille",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "prix_vente",
                header: "Prix Vente HT (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2),
            },
            {
                accessorKey: "prix_ttc",
                header: "Prix TTC (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2),
            },
            {
                accessorKey: "dernier_prix_achat",
                header: "Dernier Prix Achat (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2),
            },
            {
                accessorKey: "mise_en_sommeil",
                header: "Mise en Sommeil",
                cell: (info) => (info.getValue() ? "Oui" : "Non"),
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
                accessorKey: "prix_net",
                header: "Prix Net (€)",
                cell: (info) =>
                    parseFloat(info.getValue<string>() || "0").toFixed(2),
            },
            {
                accessorKey: "dossier_hs",
                header: "Dossier",
                cell: (info) => info.getValue(),
            },
        ],
        [checkedState]
    );

    return (
        <div className="flex w-full relative h-full bg-slate-200 flex-col gap-1 overflow-y-auto px-3 py-1">
            <div className="w-full overflow-x-auto h-full px-2 py-1 flex flex-col gap-2 rounded-md border-2 bg-white border-slate-100">
                {isLoading ? (
                    <div className="flex flex-col w-full h-full relative gap-2 py-1 ">
                        <Loader />
                    </div>
                ) : (
                    <GenericTable
                        columns={columns}
                        data={articles}
                        handleDragEnd={() => {}}
                    />
                )}
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
                        pageCount={Math.ceil(totalArticles / articlePerPage)}
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
