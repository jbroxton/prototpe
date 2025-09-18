"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
};

export function DataTable<TData, TValue>({ columns, data, className = "" }: DataTableProps<TData, TValue>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className={`bg-neutral-900 rounded-lg overflow-hidden ${className}`.trim()}>
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-neutral-800 bg-neutral-900/70">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left p-3 text-neutral-300">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 text-neutral-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td className="p-8 text-center text-neutral-500" colSpan={columns.length}>No data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

