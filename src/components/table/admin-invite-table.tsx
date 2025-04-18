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
import { CalendarIcon, ChevronDown, Pencil, PlusIcon, Trash2 } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
//import { Input } from "@/components/ui/input"
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
import { editAPIKey, deleteAPIKey, addAPIKey, createInviteCode, deleteInviteCode } from "@/app/(authorized)/admin/actions"
import { CreateInviteStatus } from "@/app/(authorized)/admin/types"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { Checkbox } from "../ui/checkbox"
import { Calendar } from "../ui/calendar"
import { Input } from "../ui/input"
import { InviteStatus } from "@/lib/const"
import { Badge } from "../ui/badge"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"


export interface YookbeerInviteColumn {
    id: number,
    code: string,
    status: keyof typeof InviteStatus,
    claimDate: Date | null,
    createdBy: string,
    usedBy: string | null,
    creationDate: Date,
}

interface YookbeerInviteTableProps {
    data: YookbeerInviteColumn[]
}

interface AddDialogProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (data: Partial<YookbeerInviteColumn>) => void
    isPending: boolean
}

const AddDialog = ({ 
    isOpen, 
    onClose, 
    onAdd,
    isPending 
}: AddDialogProps) => {
    const addFormSchema = z.object({
        code: z.string().min(4, { message: "Custom invite code must be at least 4 characters long" }).optional()
    })

    const handleSubmit = (val: z.infer<typeof addFormSchema>) => {
        onAdd(val)
    }

    const addForm = useForm<z.infer<typeof addFormSchema>>({
        resolver: zodResolver(addFormSchema),
        defaultValues: {
            code: ""
        }
    })

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Invite Code</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(handleSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={addForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-right capitalize">Code</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Custom invite code (leave blank to autogenerate)"
                                                className="mt-1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="flex justify-end space-x-2 mt-4">
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
                                {isPending ? "Processing..." : "Submit"}
                            </Button>
                        </DialogFooter>
                    </form>    
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    code: string
    isPending: boolean
}

const DeleteDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    code,
    isPending 
}: DeleteDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete invite code <span className="font-bold">{code}</span>? 
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

const ActionCell = (row: Row<YookbeerInviteColumn>) => {
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
    const [isPending, startTransition] = React.useTransition()
    const data = row.original

    const { toast } = useToast()

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                await deleteInviteCode(data.code)
                toast({
                    title: "Record deleted succesfully"
                })
                setIsDeleteOpen(false)
                location.reload()
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
                onClick={() => setIsDeleteOpen(true)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                disabled={isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                code={data.code}
                isPending={isPending}
            />
        </div>
    )
}

const createColumns = (): ColumnDef<YookbeerInviteColumn>[] => [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const shrt = (row.getValue("id") as string)
            return <div>{shrt}</div>
        },
    },
    {
        accessorKey: "code",
        header: "Invite Code",
        cell: ({ row }) => (
            <div>{row.getValue("code")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            (row.getValue("status") === "unused") ? <Badge variant={"default"}>Unused</Badge> : <Badge variant={"secondary"}>Claimed</Badge>
        )
    },
    {
        accessorKey: "creationDate",
        header: "Creation Date",
        cell: ({ row }) => {
            const dateValue = row.getValue("creationDate");
            return (
                <div>
                    {dateValue ? format(dateValue as Date, "PPP") : ""}
                </div>
            );
        },
    },
    {
        accessorKey: "createdBy",
        header: "Creator",
        cell: ({ row }) => (
            <div>{row.getValue("createdBy")}</div>
        ),
    },
    {
        accessorKey: "usedBy",
        header: "Used by",
        cell: ({ row }) => (
            (row.getValue("usedBy")) ? <div>{row.getValue("usedBy")}</div> : <></>
        )
    },
    {
        accessorKey: "claimDate",
        header: "Used Date",
        cell: ({ row }) => {
            const dateValue = row.getValue("claimDate");
            return (
                <div>
                    {dateValue ? format(dateValue as Date, "PPP") : ""}
                </div>
            );
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => ActionCell(row),
    },
]

const filterKeys: Array<keyof YookbeerInviteColumn> = [
    "id",
    "code",
]

export function AdminInviteTable({ data }: YookbeerInviteTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [isCreatePending, startCreateTransition] = React.useTransition()
    const [rowSelection, setRowSelection] = React.useState({})
    
    const { toast } = useToast()

    const columns = React.useMemo(
        () => createColumns(),
        []
    )

    const handleCreate = async (data: Partial<YookbeerInviteColumn>) => {
        console.log(data)
        startCreateTransition(async () => {
            try {
                const res = await createInviteCode({ 
                    code: data.code
                })
                if (res.status === CreateInviteStatus.OK){
                    toast({
                        title: `Invite code "${res.code}" created!`
                    })
                }
                else if (res.status === CreateInviteStatus.DUPLICATE){
                    toast({
                        title: `Invite code "${res.code}" already existed!`,
                        variant: "destructive"
                    })
                }
                else {
                    toast({
                        title: "Failed to create invite code.",
                        variant: "destructive"
                    })
                }
                setIsAddOpen(false)
                location.reload()
            } 
            catch (error) {
                toast({
                    title: "Failed to create invite code.",
                    variant: "destructive"
                })
                console.error(error)
            }
        })
    }
    
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        initialState: {
            sorting: [
                {
                    id: 'role',
                    desc: false,
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
        <>
            <div className="w-[95vw] mx-10">
                <div className="flex items-center py-4 gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                    <Button onClick={() => setIsAddOpen(true)}><PlusIcon /> New Code</Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-neutral-100 dark:bg-background">
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
            <AddDialog
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleCreate}
                isPending={isCreatePending}
            />
        </>
    )
}