import { Row } from "@tanstack/react-table"
import { YookbeerColumn } from "./yookbeer-table"
import React from "react"
import { getPresignedURLForYookbeerPic } from "@/app/(authorized)/actions"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { deleteStudent, updateStudent } from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2 } from "lucide-react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

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
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-scroll">
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

export const ActionCell = (row: Row<YookbeerColumn>, isAdmin: boolean) => {
    const imgName = row.original.img
    const studentName = row.original.nameen
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState<string | null>(null)
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
    const [isPending, startTransition] = React.useTransition()
    const { toast } = useToast()
    const data = row.original

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
            {(isAdmin) ? (
                <>
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
                </>
            ) : (<></>)}
            <ImageDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                imageUrl={imageUrl}
                studentName={studentName}
            />
            {(isAdmin) ? (
                <>
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
                </>
            ) : (<></>)}
        </div>
    )
}