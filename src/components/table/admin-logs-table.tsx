"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import * as React from "react"

export interface LogEntry {
  id: number
  action: string
  actor: string
  actorName: string
  target: string | null
  details: string | null
  timestamp: Date
}

interface AdminLogsTableProps {
  data: LogEntry[]
}

const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="tabular-nums">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      const ts = row.getValue("timestamp") as Date
      return (
        <div className="tabular-nums whitespace-nowrap text-xs text-muted-foreground">
          {ts.toLocaleString()}
        </div>
      )
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted inline-block">
        {row.getValue("action")}
      </div>
    ),
  },
  {
    accessorKey: "actorName",
    header: "Actor",
    cell: ({ row }) => <div className="text-sm">{row.getValue("actorName")}</div>,
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => {
      const val = row.getValue("target") as string | null
      return <div className="text-sm text-muted-foreground">{val ?? "—"}</div>
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const val = row.getValue("details") as string | null
      return (
        <div className="max-w-xs truncate text-xs text-muted-foreground" title={val ?? ""}>
          {val ?? "—"}
        </div>
      )
    },
  },
]

const filterKeys: Array<keyof LogEntry> = ["action", "actorName", "target", "details"]

export function AdminLogsTable({ data }: AdminLogsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "timestamp", desc: true }])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      return filterKeys.some((key) => {
        const cellValue = String(row.original[key] ?? "").toLowerCase()
        return cellValue.includes(searchValue)
      })
    },
    state: {
      sorting,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 25 },
    },
  })

  return (
    <div className="mx-10 w-[95vw]">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Search logs…"
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-neutral-100 dark:bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc"
                      ? " ↑"
                      : header.column.getIsSorted() === "desc"
                        ? " ↓"
                        : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => router.push(`/admin/logs/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No log entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
