import React, { CSSProperties } from "react";

import "./index.css";

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    type UniqueIdentifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    Table,
    useReactTable,
} from "@tanstack/react-table";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Loader from "../loader/loader";
import { Input } from "../ui/input";
import { Article } from "@/types/Article";

export type Person = {
    userId: string;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
    progress: number;
};

const DraggableRow = ({
    row,
    hideKeys,
}: {
    row: Row<Person>;
    hideKeys: string[];
}) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.userId,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
        display: "flex",
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {row
                .getVisibleCells()
                .filter((cell) => !hideKeys.includes(cell.column.id)) // Exclure les colonnes masquées
                .map((cell) => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </td>
                ))}
        </tr>
    );
};

export default function GenericTable({
    columns,
    data,
    dataId,
    handleDragEnd,
    isLoading,
    handleFilterChange,
    filters,
    showFilters,
    hideKeys,
}: // columnVisibility,
// setColumnVisibility,
{
    columns: ColumnDef<any>[];
    data: any;
    dataId?: UniqueIdentifier[];
    handleDragEnd: (event: DragEndEvent) => void;
    isLoading: boolean;
    handleFilterChange: (key: string, value: string) => void;
    filters: Record<string, string>;
    showFilters?: boolean;
    hideKeys: string[];
    // columnVisibility: any;
    // setColumnVisibility: any;
}) {
    const rerender = React.useReducer(() => ({}), {})[1];

    const table = useReactTable({
        data,
        columns,

        defaultColumn: {
            minSize: 50,
            maxSize: 800,
        },
        // onColumnVisibilityChange: setColumnVisibility,
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.userId, //required because row indexes will change
    });

    // reorder rows after drag & drop

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const columnSizeVars = React.useMemo(() => {
        const headers = table.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            console.log(header);
            if (hideKeys.includes(header.column.id)) {
                colSizes[`--header-${header.id}-size`] = 0;
                colSizes[`--col-${header.column.id}-size`] = 0;
            }

            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] =
                header.column.getSize();
        }
        return colSizes;
    }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

    //demo purposes
    const [enableMemo, setEnableMemo] = React.useState(true);

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            {/* <div className="h-4" />({data.length} rows) */}
            <div className="flex flex-col w-full h-full gap-2 overflow-x-auto py-1 ">
                <div
                    {...{
                        className: "divTable",
                        style: {
                            ...columnSizeVars,
                            width: table.getTotalSize(),
                        },
                    }}
                >
                    <div className="thead  ">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <div
                                {...{
                                    key: headerGroup.id,
                                    className: "tr",
                                }}
                            >
                                {headerGroup.headers.map((header) => {
                                    console.log(hideKeys);
                                    if (hideKeys.includes(header.id)) {
                                        // return null; // Ignore cette colonne
                                        return null;
                                    }
                                    return (
                                        <div
                                            {...{
                                                key: header.id,
                                                className: "th",
                                                style: {
                                                    width: `calc(var(--header-${header?.id}-size) * 1px)`,
                                                },
                                            }}
                                            // className="bg-sky-50"
                                        >
                                            <div className="flex flex-col gap-1 items-start pr-2">
                                                <h1>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext()
                                                          )}
                                                </h1>
                                            </div>
                                            <div
                                                {...{
                                                    onDoubleClick: () =>
                                                        header.column.resetSize(),
                                                    onMouseDown:
                                                        header.getResizeHandler(),
                                                    onTouchStart:
                                                        header.getResizeHandler(),
                                                    className: `resizer ${
                                                        header.column.getIsResizing()
                                                            ? "isResizing"
                                                            : ""
                                                    }`,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className={showFilters ? "block thead" : "hidden"}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <div
                                {...{
                                    key: headerGroup.id,
                                    className: "tr",
                                }}
                            >
                                {headerGroup.headers.map((header, i) => {
                                    // Vérifie si l'id du header est dans le tableau des ids à exclure

                                    if (hideKeys.includes(header.id)) {
                                        // return null; // Ignore cette colonne
                                        return null;
                                    }

                                    return (
                                        <div
                                            {...{
                                                key: header.id,
                                                className: "th",
                                                style: {
                                                    width: `calc(var(--header-${header?.id}-size) * 1px)`,
                                                },
                                            }}
                                            className="bg-slate-50 pl-3"
                                        >
                                            <div className="flex flex-col gap-1 items-start pr-2 py-2">
                                                {header.column.columnDef.id ===
                                                "checkbox" ? (
                                                    ""
                                                ) : (
                                                    <Input
                                                        className="text-sm font-medium text-slate-500"
                                                        placeholder={
                                                            header.column
                                                                .columnDef
                                                                .header + "..."
                                                        }
                                                        value={
                                                            filters[i - 1] || ""
                                                        }
                                                        onChange={(e) => {
                                                            handleFilterChange(
                                                                (
                                                                    i - 1
                                                                ).toString(),
                                                                e.currentTarget
                                                                    .value
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* When resizing any column we will render this special memoized version of our table body */}
                    {isLoading ? (
                        <div className="flex flex-col w-full h-full relative gap-2 py-1 ">
                            <Loader />
                        </div>
                    ) : table.getState().columnSizingInfo.isResizingColumn &&
                      enableMemo ? (
                        <MemoizedTableBody
                            table={table}
                            dataIds={dataId}
                            hideKeys={hideKeys}
                        />
                    ) : (
                        <TableBody
                            table={table}
                            dataIds={dataId}
                            hideKeys={hideKeys}
                        />
                    )}
                </div>
            </div>
        </DndContext>
    );
}

//un-memoized normal table body component - see memoized version below
function TableBody({
    table,
    dataIds,
    hideKeys,
}: {
    table: Table<any>;
    dataIds?: UniqueIdentifier[];
    hideKeys: string[];
}) {
    // console.log(table.getAllColumns());
    return (
        <div
            {...{
                className: "tbody ",
            }}
            className="h-full relative overflow-y-auto"
        >
            {table.getRowModel() !== undefined ? (
                table.getRowModel().rows &&
                table.getRowModel().rows.length !== 0 ? (
                    dataIds ? (
                        <SortableContext
                            items={dataIds as UniqueIdentifier[]}
                            strategy={verticalListSortingStrategy}
                        >
                            {table.getRowModel().rows.map((row) => {
                                // console.table(row);
                                return (
                                    <div
                                        {...{
                                            key: row.id,
                                            className: "tr",
                                        }}
                                    >
                                        <DraggableRow
                                            key={row.id}
                                            row={row}
                                            hideKeys={hideKeys}
                                        />
                                    </div>
                                );
                            })}
                        </SortableContext>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <div
                                {...{
                                    key: row.id,
                                    className: "tr",
                                }}
                            >
                                <DraggableRow
                                    key={row.id}
                                    row={row}
                                    hideKeys={hideKeys}
                                />
                            </div>
                        ))
                    )
                ) : (
                    <div className="w-full h-full relative flex items-center justify-center">
                        <h1 className="text-3xl font-semibold text-slate-500 text-wrap">
                            Aucun Donnée Présent...
                        </h1>
                    </div>
                )
            ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                    <h1 className="text-3xl font-semibold text-slate-500 text-wrap">
                        Aucun Donnée Présent...
                    </h1>
                </div>
            )}
        </div>
    );
}

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTableBody = React.memo(
    TableBody,
    (prev, next) => prev.table.options.data === next.table.options.data
) as typeof TableBody;
