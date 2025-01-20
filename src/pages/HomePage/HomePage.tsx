import GenericTable, { Person } from "@/components/CommandeTable/GenericTable";
import React, { useState } from "react";
import Loader from "@/components/loader/loader";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { makeData } from "@/components/CommandeTable/makeData";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";

const HomePage = () => {
    const [loading, setLoading] = useState<Boolean>(false);

    const [data, _setData] = React.useState(() => makeData(5));

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ userId }) => userId),
        [data]
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            _setData((data) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                return arrayMove(data, oldIndex, newIndex); //this is just a splice util
            });
        }
    }

    const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
        const { attributes, listeners } = useSortable({
            id: rowId,
        });
        return (
            // Alternatively, you could set these attributes on the rows themselves
            <button {...attributes} {...listeners}>
                <Icon icon={"lsicon:drag-outline"} className="scale-150" />
            </button>
        );
    };

    const columns = React.useMemo<ColumnDef<Person>[]>(
        () => [
            {
                id: "drag-handle",
                header: "",
                cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
                size: 20,
            },
            {
                accessorKey: "firstName",
                cell: (info) => info.getValue(),
            },
            {
                accessorFn: (row) => row.lastName,
                id: "lastName",
                cell: (info) => info.getValue(),
                header: () => <span>Last Name</span>,
            },
            {
                accessorKey: "age",
                header: () => "Age",
            },
            {
                accessorKey: "visits",
                header: () => <span>Visits</span>,
            },
            {
                accessorKey: "status",
                header: "Status",
            },
            {
                accessorKey: "progress",
                header: "Profile Progress",
            },
        ],
        []
    );
    return (
        <>
            {loading ? (
                <Loader />
            ) : (
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
                    <div className="border-slate-100 bg-white border flex flex-col relative w-full h-full overflow-y-auto rounded-sm gap-1">
                        <div className="w-full h-fit px-2 py-2 relative flex justify-between flex-wrap gap-2">
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
                        <div className="w-full  h-fit px-3 ">
                            <GenericTable
                                columns={columns}
                                data={data}
                                handleDragEnd={handleDragEnd}
                                dataId={dataIds}
                            />
                        </div>

                        {/* <div className="flex flex-col gap-1 px-1 py-3">
                            <p>
                                Total HT:{" "}
                                <span className="font-bold text-nextblue-500">
                                    {"3291.08"}
                                </span>
                            </p>
                            <p>
                                Total Remise:{" "}
                                <span className="font-bold text-nextblue-500">
                                    {"0"}
                                </span>
                            </p>
                            <p>
                                Total HT Net:{" "}
                                <span className="font-bold text-nextblue-500">
                                    {"0"}
                                </span>
                            </p>
                            <p>
                                Total TTC (20%):{" "}
                                <span className="font-bold text-nextblue-500">
                                    {"2779.2"}
                                </span>
                            </p>
                        </div> */}
                    </div>
                </div>
            )}
        </>
    );
};

export default HomePage;
