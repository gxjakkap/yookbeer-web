import type { Row } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { deleteStudent } from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { StudentEditDialog } from "./student-edit-dialog"
import { InstagramIcon } from "./svg/socials/ig"
import { LineIcon } from "./svg/socials/line"
import type { YookbeerColumn } from "./table/yookbeer-table-new"
import { Button } from "./ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog"
import { useStudentUpdate } from "./use-student-update"

/* const ImageDialog = ({
  isOpen,
  onClose,
  imageUrl,
  studentName,
}: {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
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
              className="max-h-[60vh] max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="text-gray-500">No image available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} */

interface DeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
	studentName: string
	isPending: boolean
}

const DeleteDialog = ({ isOpen, onClose, onConfirm, studentName, isPending }: DeleteDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Confirm deletion</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the record for {studentName}? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
						Cancel
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export const ActionCell = (row: Row<YookbeerColumn>, isAdmin: boolean) => {
	const data = row.original
	const { handleUpdate, isPending, isEditOpen, setIsEditOpen } = useStudentUpdate(data)
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
	const [isDeletePending, startDeleteTransition] = React.useTransition()
	const { toast } = useToast()
	const router = useRouter()

	const handleDelete = async () => {
		startDeleteTransition(async () => {
			try {
				const [, err] = await deleteStudent({ id: data.stdid })
				if (err) {
					toast({
						title: "Couldn't delete student",
						description: err.message,
						variant: "destructive",
					})
					return
				}
				toast({ title: "Student deleted" })
				setIsDeleteOpen(false)
				router.refresh()
			} catch (error) {
				toast({
					title: "Couldn't delete student",
					description: "Check your connection and try again.",
					variant: "destructive",
				})
				console.error(error)
			}
		})
	}

	/* const handleViewImage = async () => {
    if (imgName) {
      try {
        const url = await getPresignedURLForYookbeerPic(imgName)
        setImageUrl(url)
        setIsDialogOpen(true)
      } catch (error) {
        console.error("Error fetching image URL:", error)
        setImageUrl(null)
        setIsDialogOpen(true)
      }
    } else {
      setImageUrl(null)
      setIsDialogOpen(true)
    }
  } */

	return (
		<div className="action-cell flex" data-column="action">
			{/* <Button variant="ghost" size="icon" onClick={handleViewImage} className="h-8 w-8 p-0">
        <PersonIcon />
      </Button> */}

			{data.instagram ? (
				<Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
					<a
						href={`https://instagram.com/${data.instagram}`}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`${data.nicken} on Instagram`}
					>
						<InstagramIcon />
					</a>
				</Button>
			) : (
				<span className="h-8 w-8" aria-hidden="true" />
			)}

			{data.lineid ? (
				<Button variant="ghost" size="icon" className="h-8 w-8 p-0" asChild>
					<a
						href={`https://line.me/R/ti/p/~${data.lineid}`}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`${data.nicken} on LINE`}
					>
						<LineIcon />
					</a>
				</Button>
			) : (
				<span className="h-8 w-8" aria-hidden="true" />
			)}

			{isAdmin && (
				<>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsEditOpen(true)}
						className="h-8 w-8 p-0"
						disabled={isPending}
						aria-label={`Edit ${data.nicken}`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsDeleteOpen(true)}
						className="h-8 w-8 p-0 text-destructive-text hover:bg-destructive/10 hover:text-destructive-text"
						disabled={isDeletePending}
						aria-label={`Delete ${data.nicken}`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>

					<StudentEditDialog
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
						isPending={isDeletePending}
					/>
				</>
			)}
		</div>
	)
}
