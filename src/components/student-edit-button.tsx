"use client"

import { updateStudent, updateStudentImage } from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { StudentStatus } from "@/lib/const"
import { Pencil, Upload, X } from "lucide-react"
import React from "react"

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

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/webp", "image/png"]
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "webp", "png"] as const
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number]

function getExtension(filename: string): string {
	return filename.split(".").pop()?.toLowerCase() ?? ""
}

function mimeToExtension(mime: string): AllowedExtension | null {
	const map: Record<string, AllowedExtension> = {
		"image/jpeg": "jpg",
		"image/webp": "webp",
		"image/png": "png",
	}
	return map[mime] ?? null
}

interface ImageDropzoneProps {
	currentImg: string | null
	onFileSelected: (file: File | null) => void
	selectedFile: File | null
}

const ImageDropzone = ({ currentImg, onFileSelected, selectedFile }: ImageDropzoneProps) => {
	const [isDragOver, setIsDragOver] = React.useState(false)
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
	const inputRef = React.useRef<HTMLInputElement>(null)

	React.useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(null)
			return
		}
		const url = URL.createObjectURL(selectedFile)
		setPreviewUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [selectedFile])

	const validateAndSet = (file: File) => {
		const ext = getExtension(file.name)
		if (
			!ALLOWED_MIME_TYPES.includes(file.type) ||
			!ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)
		) {
			alert(`Unsupported file type "${file.type || ext}". Only JPG, JPEG, WebP, and PNG are allowed.`)
			return
		}
		onFileSelected(file)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragOver(false)
		const file = e.dataTransfer.files[0]
		if (file) validateAndSet(file)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragOver(true)
	}

	const handleDragLeave = () => setIsDragOver(false)

	const handleClick = () => inputRef.current?.click()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) validateAndSet(file)
		// reset so the same file can be re-selected if cleared
		e.target.value = ""
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onFileSelected(null)
	}

	const displayImage = previewUrl

	return (
		<div className="col-span-3">
			<div
				role="button"
				tabIndex={0}
				aria-label="Upload student image"
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onKeyDown={(e) => e.key === "Enter" && handleClick()}
				className={[
					"relative flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
					isDragOver
						? "border-primary bg-primary/5"
						: "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
				].join(" ")}
				style={{ minHeight: "110px" }}
			>
				<input
					ref={inputRef}
					type="file"
					accept=".jpg,.jpeg,.webp,.png,image/jpeg,image/webp,image/png"
					className="hidden"
					onChange={handleInputChange}
					aria-hidden="true"
				/>

				{displayImage ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={displayImage}
							alt="Preview"
							className="h-20 w-20 rounded-md object-cover ring-1 ring-muted"
						/>
						<span className="text-xs text-muted-foreground">
							{selectedFile ? selectedFile.name : currentImg}
						</span>
						{selectedFile && (
							<button
								type="button"
								onClick={handleClear}
								className="absolute right-2 top-2 rounded-full bg-background p-0.5 shadow ring-1 ring-muted hover:bg-muted"
								aria-label="Remove selected image"
							>
								<X className="h-3 w-3" />
							</button>
						)}
					</>
				) : (
					<>
						<Upload className="h-6 w-6 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">
							{isDragOver ? "Drop to upload" : "Drag & drop or click to select"}
						</span>
						<span className="text-xs text-muted-foreground/60">JPG, JPEG, WebP, PNG</span>
						{currentImg && (
							<span className="text-xs text-muted-foreground">Current: {currentImg}</span>
						)}
					</>
				)}
			</div>
		</div>
	)
}

interface EditDialogProps {
	isOpen: boolean
	onClose: () => void
	data: YookbeerColumn
	onUpdate: (data: Partial<YookbeerColumn>, imageFile: File | null) => void
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
		status: data.status,
		birthMonth: data.birthMonth,
		birthDay: data.birthDay,
	})

	const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
	const inputMapExcludeList = ["status", "birthMonth", "img"]

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] overflow-y-scroll sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Student Information</DialogTitle>
					<DialogDescription>
						{data.nameen} ({data.nicken}) - {data.stdid}
					</DialogDescription>
				</DialogHeader>
				<form action={() => onUpdate(formData, selectedImageFile)}>
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
						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right capitalize">Image</Label>
							<ImageDropzone
								currentImg={data.img}
								selectedFile={selectedImageFile}
								onFileSelected={setSelectedImageFile}
							/>
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

interface StudentEditButtonProps {
	data: YookbeerColumn
}

export function StudentEditButton({ data }: StudentEditButtonProps) {
	const [isEditOpen, setIsEditOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const { toast } = useToast()

	const handleUpdate = async (updateData: Partial<YookbeerColumn>, imageFile: File | null) => {
		startTransition(async () => {
			try {
				if (imageFile) {
					const ext =
						mimeToExtension(imageFile.type) ?? (getExtension(imageFile.name) as AllowedExtension)

					if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
						toast({ title: "Unsupported image format", variant: "destructive" })
						return
					}

					const arrayBuffer = await imageFile.arrayBuffer()
					const fileBytes = new Uint8Array(arrayBuffer)

					const [, imgErr] = await updateStudentImage({
						stdid: data.stdid,
						gen: data.gen as number,
						currentImg: data.img,
						newExtension: ext,
						fileBytes,
					})

					if (imgErr) {
						toast({
							title: "Failed to upload image",
							description: imgErr.message,
							variant: "destructive",
						})
						return
					}
				}

				let bd: number | null = parseInt(updateData.birthDay?.toString() || "-1")
				let bm: number | null = parseInt(updateData.birthMonth?.toString() || "-1")

				if (bd === -1) bd = null
				if (bm === -1) bm = null

				const { img: _img, ...restData } = updateData as Partial<YookbeerColumn> & {
					img?: string | null
				}

				await updateStudent({
					id: updateData.stdid as string,
					data: {
						...restData,
						birthDay: bd,
						birthMonth: bm,
					},
				})

				toast({ title: "Record updated successfully" })
				setIsEditOpen(false)
			} catch (error) {
				toast({ title: "Failed to update record" })
				console.error(error)
			}
		})
	}

	return (
		<>
			<Button
				id="student-edit-btn"
				variant="outline"
				size="icon"
				onClick={() => setIsEditOpen(true)}
				disabled={isPending}
				className="h-8 w-8"
			>
				<Pencil className="h-4 w-4" />
			</Button>
			<EditDialog
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				data={data}
				onUpdate={handleUpdate}
				isPending={isPending}
			/>
		</>
	)
}
