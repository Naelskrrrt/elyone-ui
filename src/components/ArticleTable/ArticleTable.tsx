import React from "react";
import {
    Table as TanstackTable,
    ColumnDef,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    RowData,
} from "@tanstack/react-table";
import { makeData, Person } from "./makeData";

declare module "@tanstack/react-table" {
    interface TableMeta<TData extends RowData> {
        updateData: (
            rowIndex: number,
            columnId: string,
            value: unknown
        ) => void;
    }
}

const defaultColumn: Partial<ColumnDef<Person>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue();
        const [value, setValue] = React.useState(initialValue);

        const onBlur = () => {
            table.options.meta?.updateData(index, id, value);
        };

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        return (
            <input
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                className="border rounded p-1"
            />
        );
    },
};

export const ArticleTable: React.FC = () => {
    const [data, setData] = React.useState(() => makeData(1000));

    const columns = React.useMemo<ColumnDef<Person>[]>(
        () => [
            {
                header: "Name",
                columns: [
                    { accessorKey: "firstName", header: "First Name" },
                    { accessorKey: "lastName", header: "Last Name" },
                ],
            },
            {
                header: "Info",
                columns: [
                    { accessorKey: "age", header: "Age" },
                    { accessorKey: "visits", header: "Visits" },
                    { accessorKey: "status", header: "Status" },
                    { accessorKey: "progress", header: "Progress" },
                ],
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            updateData: (rowIndex, columnId, value) => {
                setData((old) =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...row, [columnId]: value } : row
                    )
                );
            },
        },
    });

    return (
        <div>
            <table className="border-collapse border border-gray-200 w-full">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="border border-gray-300 p-2"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="border border-gray-300 p-2"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
                <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="border rounded px-2 py-1"
                >
                    {"<<"}
                </button>
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="border rounded px-2 py-1"
                >
                    {"<"}
                </button>
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border rounded px-2 py-1"
                >
                    {">"}
                </button>
                <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="border rounded px-2 py-1"
                >
                    {">>"}
                </button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
