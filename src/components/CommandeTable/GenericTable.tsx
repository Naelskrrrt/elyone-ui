import React, { CSSProperties, useEffect } from "react";

import "./index.css";

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    PointerSensor,
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

import {
    restrictToHorizontalAxis,
    restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Article, Commandes } from "@/types/Article";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocalStorage } from "@uidotdev/usehooks";
import Loader from "../loader/loader";
import { Input } from "../ui/input";

const DraggableRow = ({
    row,
    hideKeys,
}: {
    row: Row<Article[] | Commandes[]>;
    hideKeys?: string[];
}) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        zIndex: isDragging ? 1 : 0,
        display: "flex",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {row
                .getVisibleCells()
                .filter((cell) => !hideKeys?.includes(cell.column.id))
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
    handleSort,
    sortState,
    isSortable,
    isColumnDraggable = false,
    storageKey = "defaultColumnOrder",
}: {
    columns: ColumnDef<any>[];
    data?: any;
    dataId: UniqueIdentifier[];
    handleDragEnd?: (event: DragEndEvent) => void;
    isLoading?: boolean;
    handleFilterChange: (key: string, value: string) => void;
    filters?: Record<string, string>;
    showFilters?: boolean;
    hideKeys?: string[];
    handleSort: (columnId: string) => void;
    sortState?: { index?: number | string; value: "ASC" | "DESC" };
    isSortable?: boolean;
    isColumnDraggable?: boolean;
    storageKey?: string;
}) {
    const DraggableColumnHeader = ({
        header,
        hideKeys,
    }: {
        header: any;
        hideKeys?: string[];
    }) => {
        const { attributes, listeners, setNodeRef, transform, isDragging } =
            useSortable({
                id: header.column.id,
            });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition: "width 0.2s",
            opacity: isDragging ? 0.5 : 1,
            zIndex: isDragging ? 1 : 0,
            width: `calc(var(--header-${header.id}-size) * 1px)`,
        };

        if (hideKeys?.includes(header.column.id)) return null;

        return (
            <div
                ref={setNodeRef}
                style={style}
                className="th relative group"
                {...attributes}
                {...listeners}
            >
                <div className="flex flex-col gap-1 items-start pr-2">
                    <h1
                        className={
                            header.column.columnDef.enableSorting
                                ? "cursor-pointer"
                                : ""
                        }
                        // onClick={() => {
                        //     if (header.column.columnDef.enableSorting) {
                        //         handleSort(header.column.id);
                        //     }
                        // }}
                    >
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                        {/* {sortState?.index === header.column.id && (
                            <span>
                                {sortState?.value === "ASC" ? " 🔼" : " 🔽"}
                            </span>
                        )} */}
                    </h1>
                </div>
                <div onDoubleClick={() => header.column.resetSize()} />
            </div>
        );
    };

    const columnSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleColumnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);

        setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    };

    const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
        storageKey,
        columns.map((col) => col.id as string)
    );

    // Synchroniser si les colonnes changent
    useEffect(() => {
        if (isColumnDraggable) {
            const currentIds = columns.map((c) => c.id as string);
            const filteredOrder = columnOrder.filter((id: string) =>
                currentIds.includes(id)
            );
            const newIds = currentIds.filter((id) => !columnOrder.includes(id));

            setColumnOrder([...filteredOrder, ...newIds]);
        }
    }, [columns]);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnOrder,
        },
        defaultColumn: {
            minSize: 50,
            maxSize: 800,
        },
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
    });

    // reorder rows after drag & drop

    const rowSensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const columnSizeVars = React.useMemo(() => {
        const headers = table.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            // console.log(header);
            if (hideKeys?.includes(header.column.id)) {
                colSizes[`--header-${header.id}-size`] = 0;
                colSizes[`--col-${header.column.id}-size`] = 0;
            }

            // console.log(header.getSize());

            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] =
                header.column.getSize();
        }
        return colSizes;
    }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

    //demo purposes
    const [enableMemo] = React.useState(true);

    return (
        <DndContext
            sensors={columnSensors}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleColumnDragEnd}
        >
            {/* <div className="h-4" />({data.length} rows) */}
            <div className="flex flex-col w-full relative h-full gap-2 overflow-x-auto py-1 ">
                <div
                    {...{
                        className: "divTable",
                        style: {
                            ...columnSizeVars,
                            width: table
                                .getFlatHeaders()
                                .filter(
                                    (header) => !hideKeys?.includes(header.id)
                                )
                                .reduce(
                                    (total, header) => total + header.getSize(),
                                    0
                                ),
                        },
                    }}
                >
                    <div className="thead">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <div
                                {...{
                                    key: headerGroup.id,
                                    className: "tr",
                                }}
                            >
                                <SortableContext
                                    items={columnOrder}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    {isColumnDraggable
                                        ? headerGroup.headers.map((header) => (
                                              <DraggableColumnHeader
                                                  key={header.id}
                                                  header={header}
                                                  hideKeys={hideKeys}
                                              />
                                          ))
                                        : headerGroup.headers.map((header) => {
                                              console.log(header);
                                              console.log(hideKeys);
                                              if (
                                                  hideKeys?.includes(
                                                      header.id as string
                                                  ) ||
                                                  header.id == "id"
                                              ) {
                                                  return null;
                                              }

                                              return (
                                                  <div
                                                      key={header.id}
                                                      className="th"
                                                      style={{
                                                          width: `calc(var(--header-${header.id}-size) * 1px)`,
                                                      }}
                                                  >
                                                      <div className="flex flex-col gap-1 items-start pr-2">
                                                          <h1
                                                              className={
                                                                  isSortable
                                                                      ? "cursor-pointer"
                                                                      : ""
                                                              }
                                                              onClick={() => {
                                                                  if (
                                                                      header.id ===
                                                                          "checkbox" ||
                                                                      header.id ===
                                                                          "actions" ||
                                                                      header.id ===
                                                                          "drag-handle" ||
                                                                      header.id ===
                                                                          "id"
                                                                  ) {
                                                                      return;
                                                                  }

                                                                  if (
                                                                      isSortable
                                                                  ) {
                                                                      handleSort(
                                                                          header.id.toString()
                                                                      );
                                                                  }
                                                              }}
                                                          >
                                                              {header.isPlaceholder
                                                                  ? null
                                                                  : flexRender(
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .header,
                                                                        header.getContext()
                                                                    )}

                                                              {/* Afficher l'icône du tri */}
                                                              {sortState?.index ==
                                                                  header.id && (
                                                                  <span>
                                                                      {sortState.value ===
                                                                      "ASC"
                                                                          ? " 🔼"
                                                                          : " 🔽"}
                                                                  </span>
                                                              )}
                                                          </h1>
                                                      </div>
                                                      <div
                                                          onDoubleClick={() =>
                                                              header.column.resetSize()
                                                          }
                                                          onMouseDown={header.getResizeHandler()}
                                                          onTouchStart={header.getResizeHandler()}
                                                          className={`resizer ${
                                                              header.column.getIsResizing()
                                                                  ? "isResizing"
                                                                  : ""
                                                          }`}
                                                      />
                                                  </div>
                                              );
                                          })}
                                </SortableContext>
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
                                {headerGroup.headers.map((header) => {
                                    // Vérifie si l'id du header est dans le tableau des ids à exclure

                                    if (
                                        hideKeys?.includes(header.id) ||
                                        header.id == "actions" ||
                                        header.id == "id"
                                    ) {
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
                                                            filters
                                                                ? filters[
                                                                      header.id
                                                                  ] || ""
                                                                : ""
                                                        }
                                                        onChange={(e) => {
                                                            handleFilterChange(
                                                                header.id.toString(),
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
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={rowSensors}
                        >
                            <MemoizedTableBody
                                table={table}
                                dataIds={dataId}
                                hideKeys={hideKeys}
                            />
                        </DndContext>
                    ) : (
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={rowSensors}
                        >
                            <TableBody
                                table={table}
                                dataIds={dataId}
                                hideKeys={hideKeys}
                            />
                        </DndContext>
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
    dataIds: UniqueIdentifier[];
    hideKeys?: string[];
}) {
    // console.log(table.getAllColumns());
    return (
        <div
            {...{
                className: "tbody",
            }}
            className="max-h-[calc(100%-50px)] relative overflow-y-auto overflow-x-hidden w-full pb-14 mr-3"
        >
            {table.getRowModel() || table.getRowModel() !== undefined ? (
                table.getRowModel().rows &&
                table.getRowModel().rows.length !== 0 ? (
                    dataIds ? (
                        <SortableContext
                            key={dataIds.join("-") + Date.now()}
                            items={dataIds}
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
                    <div className="w-full h-full relative py-16 flex items-center justify-center">
                        <h1 className="text-2xl font-semibold text-slate-500 text-wrap">
                            Aucune Donnée
                        </h1>
                    </div>
                )
            ) : (
                <div className="w-full h-full relative flex py-16 items-center justify-center">
                    <h1 className="text-2xl font-medium text-slate-500 text-wrap">
                        Aucune Donnée
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
