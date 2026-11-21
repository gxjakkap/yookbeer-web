"use client"

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { useState, useTransition } from "react"
import { updateReportStatus } from "@/app/(authorized)/admin/actions"
import { DataTableFacetedFilter } from "@/components/table/tablecomponents/faceted-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	REPORT_FIELDS,
	REPORT_REASON_LABEL,
	REPORT_SOCIALS,
	REPORT_STATUS_LABEL,
	ReportReason,
	ReportStatus,
} from "@/lib/const"

export interface ReportRow {
	id: number
	stdid: string
	nameEn: string
	reporterName: string
	reasons: string[]
	deadSocials: string[]
	wrongFields: string[]
	newStdid: string | null
	note: string | null
	status: string
	createdAt: Date
	statusChangedByName: string | null
	statusChangedAt: Date | null
}

const label = (map: Record<string, string>, key: string) => map[key] ?? key

function StatusCell({ row }: { row: ReportRow }) {
	const { toast } = useToast()
	const [isPending, startTransition] = useTransition()

	const onChange = (status: string) =>
		startTransition(async () => {
			const [, err] = await updateReportStatus({ id: row.id, status: status as ReportStatus })
			if (err)
				toast({ title: "Couldn't update status", description: err.message, variant: "destructive" })
		})

	return (
		<div className="flex flex-col gap-1">
			<Select value={row.status} onValueChange={onChange} disabled={isPending}>
				<SelectTrigger className="h-8 w-36" aria-label={`Status of report #${row.id}`}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{Object.values(ReportStatus).map((s) => (
						<SelectItem key={s} value={s}>
							{REPORT_STATUS_LABEL[s]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{row.statusChangedAt && (
				<span className="text-xs text-muted-foreground">
					by {row.statusChangedByName ?? "(deleted user)"}, {row.statusChangedAt.toLocaleString()}
				</span>
			)}
		</div>
	)
}

const columns: ColumnDef<ReportRow>[] = [
	{
		accessorKey: "createdAt",
		header: "Reported",
		cell: ({ row }) => (
			<div className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
				{row.original.createdAt.toLocaleString()}
			</div>
		),
	},
	{
		accessorKey: "stdid",
		header: "Student",
		cell: ({ row }) => (
			<Link
				href={`/std/${row.original.stdid}`}
				className="whitespace-nowrap underline-offset-4 hover:underline"
			>
				<span className="flex flex-col gap-y-1">
					<span className="tabular-nums">{row.original.stdid}</span>
					<span>{row.original.nameEn}</span>
				</span>
			</Link>
		),
	},
	{
		accessorKey: "reporterName",
		header: "Reporter",
	},
	{
		accessorKey: "reasons",
		header: "Reasons",
		filterFn: (row, id, value: string[]) => row.getValue<string[]>(id).some((r) => value.includes(r)),
		cell: ({ row }) => {
			const r = row.original
			return (
				<ul className="flex flex-col gap-1 text-sm">
					{r.reasons.map((reason) => (
						<li key={reason}>
							<Badge variant="secondary">{label(REPORT_REASON_LABEL, reason)}</Badge>
							{reason === ReportReason.DEAD_SOCIALS && (
								<span className="ml-2 text-muted-foreground">
									{r.deadSocials.map((s) => label(REPORT_SOCIALS, s)).join(", ")}
								</span>
							)}
							{reason === ReportReason.WRONG_INFO && (
								<span className="ml-2 text-muted-foreground">
									{r.wrongFields.map((f) => label(REPORT_FIELDS, f)).join(", ")}
								</span>
							)}
							{reason === ReportReason.REASSIGNED && r.newStdid && (
								<span className="ml-2 tabular-nums text-muted-foreground">
									→ {r.newStdid}
								</span>
							)}
						</li>
					))}
				</ul>
			)
		},
	},
	{
		accessorKey: "note",
		header: "Note",
		cell: ({ row }) => (
			<p className="max-w-xs whitespace-pre-wrap break-words text-sm">{row.original.note ?? "—"}</p>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
		cell: ({ row }) => <StatusCell row={row.original} />,
	},
]

const statusOptions = Object.values(ReportStatus).map((s) => ({ label: REPORT_STATUS_LABEL[s], value: s }))
const reasonOptions = Object.values(ReportReason).map((r) => ({ label: REPORT_REASON_LABEL[r], value: r }))
const searchKeys = ["stdid", "nameEn", "reporterName", "note", "newStdid"] as const

export function AdminReportsTable({ data }: { data: ReportRow[] }) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState("")

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _id, value) => {
			const q = String(value).toLowerCase()
			return searchKeys.some((k) => (row.original[k] ?? "").toLowerCase().includes(q))
		},
		state: { columnFilters, globalFilter },
		initialState: { pagination: { pageSize: 25 } },
	})

	return (
		<div className="w-full">
			<div className="flex flex-wrap items-center gap-2 py-4">
				<Input
					placeholder="Search reports…"
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
				<DataTableFacetedFilter
					column={table.getColumn("status")}
					title="Status"
					options={statusOptions}
				/>
				<DataTableFacetedFilter
					column={table.getColumn("reasons")}
					title="Reason"
					options={reasonOptions}
				/>
			</div>
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((h) => (
									<TableHead key={h.id}>
										{flexRender(h.column.columnDef.header, h.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="align-top">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No reports found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end gap-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} report(s)
				</div>
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
	)
}
