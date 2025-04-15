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
import { editAPIKey, deleteAPIKey, addAPIKey } from "@/app/(authorized)/admin/actions"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { Checkbox } from "../ui/checkbox"
import { Calendar } from "../ui/calendar"
import { Input } from "../ui/input"


export interface YookbeerAPIKeyColumn {
    id: number,
    key: string,
    name: string,
    expiresAt: Date | null,
    owner: string
}

interface YookbeerAPIKeyTableProps {
    data: YookbeerAPIKeyColumn[]
}

interface AddDialogProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (data: Partial<YookbeerAPIKeyColumn>) => void
    isPending: boolean
}

const AddDialog = ({ 
    isOpen, 
    onClose, 
    onAdd,
    isPending 
}: AddDialogProps) => {
    const [formData, setFormData] = React.useState<Partial<YookbeerAPIKeyColumn>>({})
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [noExpire, setNoExpire] = React.useState(true)

    React.useEffect(() => {
        setFormData({ ...formData, expiresAt: noExpire ? null : date })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, noExpire])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col">
                            <Label className="mb-2">Expiration Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground",
                                            noExpire && "cursor-not-allowed"
                                        )}
                                        
                                    >
                                        <CalendarIcon />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="start"
                                    className="flex w-auto flex-col space-y-2 p-2"
                                >
                                    <Select
                                        onValueChange={(value) =>
                                            setDate(addDays(new Date(), parseInt(value)))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="90">3 months</SelectItem>
                                            <SelectItem value="180">6 months</SelectItem>
                                            <SelectItem value="365">1 Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="rounded-md border">
                                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={noExpire} />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="ned"
                                checked={noExpire}
                                onCheckedChange={() => setNoExpire(!noExpire)}
                            />
                            <Label htmlFor="ned" className="text-sm font-medium leading-none">
                                No expiration date
                            </Label>
                        </div>
                        <div>
                            <Label className="text-right capitalize" htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                className="mt-1" // Add margin for spacing
                            />
                        </div>
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
            </DialogContent>
        </Dialog>
    )
}

interface EditDialogProps {
    isOpen: boolean
    onClose: () => void
    data: YookbeerAPIKeyColumn
    onUpdate: (data: Partial<YookbeerAPIKeyColumn>) => void
    isPending: boolean
}

const EditDialog = ({ 
    isOpen, 
    onClose, 
    data, 
    onUpdate,
    isPending 
}: EditDialogProps) => {
    const [formData, setFormData] = React.useState<Partial<YookbeerAPIKeyColumn>>({
        id: data.id,
        expiresAt: data.expiresAt
    })

    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [noExpire, setNoExpire] = React.useState(!!data.expiresAt)

    React.useEffect(() => {
        setFormData({ ...formData, expiresAt: date})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                    <DialogTitle>Edit API Key Data</DialogTitle>
                    <DialogDescription>
                        {data.key} - Created by {data.owner}
                    </DialogDescription>
                </DialogHeader>
                <form action={() => onUpdate(formData)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right capitalize">
                                Expiration Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="start"
                                    className="flex w-auto flex-col space-y-2 p-2"
                                >
                                    <Select
                                        onValueChange={(value) =>
                                            setDate(addDays(new Date(), parseInt(value)))
                                        }
                                    >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="90">3 months</SelectItem>
                                        <SelectItem value="180">6 months</SelectItem>
                                        <SelectItem value="365">1 Year</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <div className="rounded-md border">
                                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={noExpire} />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="items-top flex space-x-2">
                        <Checkbox 
                            id="ned"
                            checked={noExpire}
                            onCheckedChange={() => setNoExpire(!noExpire)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="ned"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                No expiration date
                            </label>
                        </div>
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
    apiKey: string
    isPending: boolean
}

const DeleteDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    apiKey,
    isPending 
}: DeleteDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete API key {apiKey}? 
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

const ActionCell = (row: Row<YookbeerAPIKeyColumn>) => {
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
    const [isPending, startTransition] = React.useTransition()
    const data = row.original

    const { toast } = useToast()

    const handleUpdate = async (data: Partial<YookbeerAPIKeyColumn>) => {
        console.log(data)
        startTransition(async () => {
            try {
                if (!data.id) throw Error("No id")
                await editAPIKey(data.id, data)
                toast({
                    title: "Record updated succesfully"
                })
                setIsEditOpen(false)
                location.reload()
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
                await deleteAPIKey(data.id)
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
                apiKey={data.key}
                isPending={isPending}
            />
        </div>
    )
}

const createColumns = (): ColumnDef<YookbeerAPIKeyColumn>[] => [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const shrt = (row.getValue("id") as string)
            return <div>{shrt}</div>
        },
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
            <div>{row.getValue("key")}</div>
        ),
    },
    {
        accessorKey: "expiresAt",
        header: "Expiration Date",
        cell: ({ row }) => {
            const dateValue = row.getValue("expiresAt");
            return (
                <div>
                    {dateValue ? format(dateValue as Date, "PPP") : "No expiration"}
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

const filterKeys: Array<keyof YookbeerAPIKeyColumn> = [
    "id",
    "key",
]

export function AdminAPIKeyTable({ data }: YookbeerAPIKeyTableProps) {
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

    const handleCreate = async (data: Partial<YookbeerAPIKeyColumn>) => {
        console.log(data)
        startCreateTransition(async () => {
            try {
                if (!data.name || data.expiresAt === undefined) throw Error("Missing Data")
                await addAPIKey(data.name, data.expiresAt)
                toast({
                    title: "API key created"
                })
                setIsAddOpen(false)
                location.reload()
            } 
            catch (error) {
                toast({
                    title: "Failed to create API Key"
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
                    <Button onClick={() => setIsAddOpen(true)}><PlusIcon /> New Key</Button>
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