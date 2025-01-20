import React, { CSSProperties } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
    Table,
    Row,
} from "@tanstack/react-table";
import { makeData } from "./makeData";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    type UniqueIdentifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "../ui/button";

export type Person = {
    userId: string;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
    progress: number;
};

const DraggableRow = ({ row }: { row: Row<Person> }) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.userId,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
        display: "flex",
    };
    return (
        // connect row ref to dnd-kit, apply important styles
        <tr ref={setNodeRef} style={style}>
            {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
}: {
    columns: ColumnDef<any>[];
    data: any;
    dataId?: UniqueIdentifier[];
    handleDragEnd: (event: DragEndEvent) => void;
}) {
    const rerender = React.useReducer(() => ({}), {})[1];

    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
            minSize: 50,
            maxSize: 800,
        },
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.userId, //required because row indexes will change
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
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
                <div className="w-full flex justify-between h-fit sticky left-0 top-0 z-50">
                    <Button className="bg-slate-500 hover:bg-slate-500/90">
                        Afficher les Filtres
                    </Button>
                    <Button title="Colonne à afficher dans le tableau">
                        Colonnes
                    </Button>
                </div>
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
                                {headerGroup.headers.map((header) => (
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
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
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
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* When resizing any column we will render this special memoized version of our table body */}
                    {table.getState().columnSizingInfo.isResizingColumn &&
                    enableMemo ? (
                        <MemoizedTableBody table={table} dataIds={dataId} />
                    ) : (
                        <TableBody table={table} dataIds={dataId} />
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
}: {
    table: Table<Person>;
    dataIds?: UniqueIdentifier[];
}) {
    return (
        <div
            {...{
                className: "tbody ",
            }}
            className="h-full relative overflow-y-auto"
        >
            {dataIds ? (
                <SortableContext
                    items={dataIds as UniqueIdentifier[]}
                    strategy={verticalListSortingStrategy}
                >
                    {table.getRowModel().rows.map((row) => (
                        <div
                            {...{
                                key: row.id,
                                className: "tr",
                            }}
                        >
                            <DraggableRow key={row.id} row={row} />
                        </div>
                    ))}
                </SortableContext>
            ) : (
                table.getRowModel().rows.map((row) => (
                    <div
                        {...{
                            key: row.id,
                            className: "tr",
                        }}
                    >
                        <DraggableRow key={row.id} row={row} />
                    </div>
                ))
            )}
        </div>
    );
}

//special memoized wrapper for our table body that we will use during column resizing
export const MemoizedTableBody = React.memo(
    TableBody,
    (prev, next) => prev.table.options.data === next.table.options.data
) as typeof TableBody;
