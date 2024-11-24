"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { deleteStudent, updateStudent } from "@/app/(authorized)/admin/actions"

export interface YookbeerColumn {
    stdid: string,
    course: number,
    nameth: string | null,
    nameen: string,
    nickth: string | null,
    nicken: string,
    phone: string,
    emailper: string | null,
    emailuni: string | null,
    emerphone: string | null,
    facebook: string | null,
    lineid: string | null,
    instagram: string | null,
    discord: string | null,
    img: string | null,
}

interface YookbeerTableProps {
    data: YookbeerColumn[]
}

interface EditDialogProps {
    isOpen: boolean
    onClose: () => void
    data: YookbeerColumn
    onUpdate: (data: Partial<YookbeerColumn>) => void
    isPending: boolean
}

const EditDialog = ({ 
    isOpen, 
    onClose, 
    data, 
    onUpdate,
    isPending 
}: EditDialogProps) => {
    const [formData, setFormData] = React.useState<Partial<YookbeerColumn>>({
        stdid: data.stdid,
        nameth: data.nameth,
        nameen: data.nameen,
        nickth: data.nickth,
        nicken: data.nicken,
        phone: data.phone,
        emailper: data.emailper,
        emailuni: data.emailuni,
        emerphone: data.emerphone,
        facebook: data.facebook,
        lineid: data.lineid,
        instagram: data.instagram,
        discord: data.discord,
        img: data.img
    })

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                    <DialogTitle>Edit Student Information</DialogTitle>
                    <DialogDescription>
                        {data.nameen} ({data.nicken}) - {data.stdid}
                    </DialogDescription>
                </DialogHeader>
                <form action={() => onUpdate(formData)}>
                    <div className="grid gap-4 py-4">
                        {Object.entries(formData).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={key} className="text-right capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                                <Input
                                    id={key}
                                    value={value || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [key]: e.target.value
                                    }))}
                                    className="col-span-3"
                                />
                            </div>
                        ))}
                    </div>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    studentName: string
    isPending: boolean
}

const DeleteDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    studentName,
    isPending 
}: DeleteDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the record for {studentName}? 
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}



const ActionCell = (row: Row<YookbeerColumn>) => {
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
    const [isPending, startTransition] = React.useTransition()
    const data = row.original

    const { toast } = useToast()

    const handleUpdate = async (data: Partial<YookbeerColumn>) => {
        console.log(data)
        startTransition(async () => {
            try {
                await updateStudent(data.stdid as string, data)
                toast({
                    title: "Record updated succesfully"
                })
                setIsEditOpen(false)
            } 
            catch (error) {
                toast({
                    title: "Failed to update record"
                })
                console.error(error)
            }
        })
    }

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                await deleteStudent(data.stdid)
                toast({
                    title: "Record deleted succesfully"
                })
                setIsDeleteOpen(false)
            } 
            catch (error) {
                toast({
                    title: "Failed to delete record"
                })
                console.error(error)
            }
        })
    }

    return (
        <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditOpen(true)}
                className="h-8 w-8 p-0"
                disabled={isPending}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                disabled={isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <EditDialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                data={data}
                onUpdate={handleUpdate}
                isPending={isPending}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                studentName={`${data.nameen} (${data.nicken})`}
                isPending={isPending}
            />
        </div>
    )
}

const createColumns = (): ColumnDef<YookbeerColumn>[] => [
    {
        accessorKey: "stdid",
        header: "ID",
        cell: ({ row }) => {
            const shrt = (row.getValue("stdid") as string).substring(7)
            return <div>{shrt}</div>
        },
    },
    {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => (
            <div>{courseName[row.getValue("course") as number]}</div>
        ),
    },
    {
        accessorKey: "nameth",
        header: "Name (TH)",
        cell: ({ row }) => {
            const x = (row.getValue("nameth") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "nameen",
        header: "Name",
        cell: ({ row }) => (
            <div>{row.getValue("nameen")}</div>
        ),
    },
    {
        accessorKey: "nickth",
        header: "Nick (TH)",
        cell: ({ row }) => {
            const x = (row.getValue("nickth") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "nicken",
        header: "Nick",
        cell: ({ row }) => (
            <div>{row.getValue("nicken")}</div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <div>{row.getValue("phone")}</div>
        ),
    },
    {
        accessorKey: "emailper",
        header: "Email (per)",
        cell: ({ row }) => <div className="lowercase">{row.getValue("emailper")}</div>,
    },
    {
        accessorKey: "emailuni",
        header: "Email (uni)",
        cell: ({ row }) => <div className="lowercase">{row.getValue("emailuni")}</div>,
    },
    {
        accessorKey: "facebook",
        header: "FB",
        cell: ({ row }) => {
            const x = (row.getValue("facebook") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "lineid",
        header: "LINE",
        cell: ({ row }) => {
            const x = (row.getValue("lineid") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "instagram",
        header: "IG",
        cell: ({ row }) => {
            const x = (row.getValue("instagram") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "discord",
        header: "Discord",
        cell: ({ row }) => {
            const x = (row.getValue("discord") || "-") as string
            return <div>{x}</div>
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => ActionCell(row),
    },
]

const courseName = ['REG', 'INT', 'HDS', 'RC']

const filterKeys: Array<keyof YookbeerColumn> = [
    "stdid",
    "nameth",
    "nameen",
    "nickth",
    "nicken",
    "phone",
    "instagram",
    "discord",
]

export function AdminYookbeerTable({ data }: YookbeerTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({ 'emailper': false })
    const [rowSelection, setRowSelection] = React.useState({})
    
    const columns = React.useMemo(
        () => createColumns(),
        []
    )
    
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        initialState: {
            sorting: [
                {
                    id: 'stdid',
                    desc: false
                }
            ]
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const searchValue = String(filterValue).toLowerCase();
            return filterKeys.some((key) => {
                const cellValue = String(row.original[key] || "").toLowerCase();
                return cellValue.includes(searchValue);
            })
        },
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })
    
    return (
        <div className="w-[95vw] mx-10">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search"
                    value={table.getState().globalFilter ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        table.setGlobalFilter(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-neutral-100">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-neutral-100">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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