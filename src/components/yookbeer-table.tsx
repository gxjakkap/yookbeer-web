"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  /* ColumnFiltersState, */
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { getPresignedURLForYookbeerPic } from "@/app/(authorized)/actions"

interface YookbeerColumn {
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

const courseName = ['REG', 'INT', 'HDS', 'RC']

const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2 text-black" viewBox="0 0 16 16">
        <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2v9.255S12 12 8 12s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h5.5z"/>
    </svg>
)

const ImageDialog = ({ isOpen, onClose, imageUrl, studentName }: { 
    isOpen: boolean, 
    onClose: () => void, 
    imageUrl: string | null,
    studentName: string 
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{studentName}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-6">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={imageUrl} 
                            alt={`Photo of ${studentName}`}
                            className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        />
                    ) : (
                        <div className="text-gray-500">No image available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

const ActionCell = (row: Row<YookbeerColumn>) => {
    const imgName = row.original.img
    const studentName = row.original.nameen
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState<string | null>(null)
    const handleViewImage = async () => {
        if (imgName) {
            try {
                const url = await getPresignedURLForYookbeerPic(imgName)
                setImageUrl(url)
                setIsDialogOpen(true)
            } catch (error) {
                console.error('Error fetching image URL:', error)
                setImageUrl(null)
                setIsDialogOpen(true)
            }
        } else {
            setImageUrl(null)
            setIsDialogOpen(true)
        }
    }

    return (
        <div className="flex">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={handleViewImage}
                className="h-8 w-8 p-0"
            >
                <PersonIcon />
            </Button>
            <ImageDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                imageUrl={imageUrl}
                studentName={studentName}
            />
        </div>
    )
}

export const columns: ColumnDef<YookbeerColumn>[] = [
    {
        accessorKey: "stdid",
        header: "ID",
        cell: ({ row }) => {
            const shrt = (row.getValue("stdid") as string).substring(7)
            return (
                <div>{shrt}</div>
            )
        },
    },
    {
        accessorKey: "course",
        header: "ID",
        cell: ({ row }) => (
            <div>{courseName[row.getValue("course") as number]}</div>
        ),
    },
    {
        accessorKey: "nameth",
        header: "Name (TH)",
        cell: ({ row }) => {
            const x = (row.getValue("nameth") || "-") as string
            return (
                <div>{x}</div>
            )
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
            return (
                <div>{x}</div>
            )
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
            return (
                <div>{x}</div>
            )
        },
    },
    {
        accessorKey: "lineid",
        header: "LINE",
        cell: ({ row }) => {
            const x = (row.getValue("lineid") || "-") as string
            return (
                <div>{x}</div>
            )
        },
    },
    {
        accessorKey: "instagram",
        header: "IG",
        cell: ({ row }) => {
            const x = (row.getValue("instagram") || "-") as string
            return (
                <div>{x}</div>
            )
        },
    },
    {
        accessorKey: "discord",
        header: "Discord",
        cell: ({ row }) => {
            const x = (row.getValue("discord") || "-") as string
            return (
                <div>{x}</div>
            )
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => ActionCell(row),
    },
]

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
 

export function YookbeerTable({ data }: YookbeerTableProps){
    const [sorting, setSorting] = React.useState<SortingState>([])
    /* const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    ) */
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({ 'emailper': false })
    const [rowSelection, setRowSelection] = React.useState({})
    
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
        /* onColumnFiltersChange: setColumnFilters, */
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
            /* columnFilters, */
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })
    return (
        <div className="w-[95vw] mx-10">
          <div className="flex items-center py-4">
            {/* <Input
              placeholder="Filter id"
              value={(table.getColumn("stdid")?.getFilterValue() as string) ?? ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                table.getColumn("stdid")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            /> */}
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
                  Columns <ChevronDown />
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