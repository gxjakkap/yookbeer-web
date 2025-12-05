import { getPresignedURLForYookbeerPic } from "@/app/(authorized)/actions"
import { deleteStudent, updateStudent } from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { StudentStatus } from "@/lib/const"
import { cn } from "@/lib/utils"
import { Row } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import React from "react"

import { InstagramIcon } from "./svg/socials/ig"
import { LineIcon } from "./svg/socials/line"
import { YookbeerColumn } from "./table/yookbeer-table-new"
import { Button } from "./ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const PersonIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-foreground" viewBox="0 0 16 16">
		<path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
		<path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2v9.255S12 12 8 12s-5 1.755-5 1.755V2a1 1 0 0 1 1-1h5.5z" />
	</svg>
)

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

interface EditDialogProps {
	isOpen: boolean
	onClose: () => void
	data: YookbeerColumn
	onUpdate: (data: Partial<YookbeerColumn>) => void
	isPending: boolean
}

const EditDialog = ({ isOpen, onClose, data, onUpdate, isPending }: EditDialogProps) => {
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
		img: data.img,
		status: data.status,
		birthMonth: data.birthMonth,
		birthDay: data.birthDay,
	})

	const inputMapExcludeList = ["status", "birthMonth"]

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] overflow-y-scroll sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Student Information</DialogTitle>
					<DialogDescription>
						{data.nameen} ({data.nicken}) - {data.stdid}
					</DialogDescription>
				</DialogHeader>
				<form action={() => onUpdate(formData)}>
					<div className="grid gap-4 py-4">
						{Object.entries(formData).map(([key, value]) => {
							if (inputMapExcludeList.includes(key)) return
							return (
								<div key={key} className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor={key} className="text-right capitalize">
										{key.replace(/([A-Z])/g, " $1").trim()}
									</Label>
									<Input
										id={key}
										value={(value as any) || ""}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												[key]: e.target.value,
											}))
										}
										className="col-span-3"
									/>
								</div>
							)
						})}
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={"birthMonth"} className="text-right capitalize">
								Birth Month
							</Label>
							<Select
								value={formData.birthMonth ? String(formData.birthMonth) : ""}
								onValueChange={(val) =>
									setFormData((prev) => ({
										...prev,
										birthMonth: Number(val),
									}))
								}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Month" />
								</SelectTrigger>
								<SelectContent>
									{[
										"January",
										"February",
										"March",
										"April",
										"May",
										"June",
										"July",
										"August",
										"September",
										"October",
										"November",
										"December",
									].map((month, i) => (
										<SelectItem key={i + 1} value={String(i + 1)}>
											{month}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={"status"} className="text-right capitalize">
								Status
							</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										status: value as StudentStatus,
									}))
								}
								defaultValue={formData.status || StudentStatus.ATTENDING}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={StudentStatus.ATTENDING}>Attending</SelectItem>
									<SelectItem value={StudentStatus.RESIGNED}>Resigned</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
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

const DeleteDialog = ({ isOpen, onClose, onConfirm, studentName, isPending }: DeleteDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Confirm Deletion</DialogTitle>
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
	/* const imgName = row.original.img */
	const studentName = row.original.nameen
	const [isDialogOpen, setIsDialogOpen] = React.useState(false)
	/* const [imageUrl, setImageUrl] = React.useState<string | null>(null) */
	const [isEditOpen, setIsEditOpen] = React.useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const { toast } = useToast()
	const data = row.original

	const handleUpdate = async (data: Partial<YookbeerColumn>) => {
		console.log(data)
		startTransition(async () => {
			try {
				let bd: number | null = parseInt(data.birthDay?.toString() || "-1")
				let bm: number | null = parseInt(data.birthMonth?.toString() || "-1")

				if (bd === -1) bd = null
				if (bm === -1) bm = null

				await updateStudent({
					id: data.stdid as string,
					data: {
						...data,
						birthDay: bd,
						birthMonth: bm,
					},
				})
				toast({
					title: "Record updated succesfully",
				})
				setIsEditOpen(false)
			} catch (error) {
				toast({
					title: "Failed to update record",
				})
				console.error(error)
			}
		})
	}

	const handleDelete = async () => {
		startTransition(async () => {
			try {
				await deleteStudent({
					id: data.stdid,
				})
				toast({
					title: "Record deleted succesfully",
				})
				setIsDeleteOpen(false)
			} catch (error) {
				toast({
					title: "Failed to delete record",
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

			<Button
				variant="ghost"
				size="icon"
				className={cn(
					"h-8 w-8 p-0",
					row.original.instagram === null ? "cursor-not-allowed" : "cursor-pointer"
				)}
				disabled={row.original.instagram === null}
			>
				<Link
					href={
						row.original.instagram !== null
							? `https://instagram.com/${row.original.instagram}`
							: "#"
					}
					target="_blank"
					rel="noopener,noreferrer"
					className={
						row.original.instagram === null
							? "pointer-events-none cursor-not-allowed"
							: "cursor-pointer"
					}
					aria-disabled={row.original.instagram === null}
				>
					<InstagramIcon />
				</Link>
			</Button>

			<Button
				variant="ghost"
				size="icon"
				className={cn(
					"h-8 w-8 p-0",
					row.original.instagram === null ? "cursor-not-allowed" : "cursor-pointer"
				)}
				disabled={row.original.instagram === null}
			>
				<Link
					href={
						row.original.lineid !== null ? `https://line.me/R/ti/p/~${row.original.lineid}` : "#"
					}
					target="_blank"
					rel="noopener,noreferrer"
					className={
						row.original.lineid === null
							? "pointer-events-none cursor-not-allowed"
							: "cursor-pointer"
					}
					aria-disabled={row.original.lineid === null}
				>
					<LineIcon />
				</Link>
			</Button>

			{isAdmin ? (
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
			) : (
				<></>
			)}
			{/* <ImageDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        imageUrl={imageUrl}
        studentName={studentName}
      /> */}
			{isAdmin ? (
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
			) : (
				<></>
			)}
		</div>
	)
}
