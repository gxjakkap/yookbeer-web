"use client"

import { Upload, X } from "lucide-react"
import Image from "next/image"
import React from "react"
import { StudentStatus } from "@/lib/const"

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
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/webp", "image/png"]
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "webp", "png"] as const
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number]

export function getExtension(filename: string): string {
	return filename.split(".").pop()?.toLowerCase() ?? ""
}

export function mimeToExtension(mime: string): AllowedExtension | null {
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

export const ImageDropzone = ({ currentImg, onFileSelected, selectedFile }: ImageDropzoneProps) => {
	const [isDragOver, setIsDragOver] = React.useState(false)
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
	const [error, setError] = React.useState<string | null>(null)
	const errorId = React.useId()
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
			setError(`"${file.name}" isn't a supported image. Choose a JPG, PNG or WebP file.`)
			return
		}
		setError(null)
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
			{/** biome-ignore lint/a11y/useSemanticElements: <> */}
			<div
				role="button"
				tabIndex={0}
				aria-label="Upload student image"
				aria-describedby={error ? errorId : undefined}
				aria-invalid={error ? true : undefined}
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onKeyDown={(e) => e.key === "Enter" && handleClick()}
				className={[
					"relative flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
					isDragOver
						? "border-primary bg-primary/5"
						: error
							? "border-destructive-text"
							: "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
				].join(" ")}
				style={{ minHeight: "110px" }}
			>
				{/** biome-ignore lint/a11y/noAriaHiddenOnFocusable: <> */}
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
						<Image
							src={displayImage}
							alt="Preview"
							width={80}
							height={80}
							unoptimized
							className="h-20 w-20 rounded-md object-cover ring-1 ring-muted"
						/>
						<span className="text-xs text-muted-foreground">
							{selectedFile ? selectedFile.name : currentImg}
						</span>
						{selectedFile && (
							<button
								type="button"
								onClick={handleClear}
								className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-background shadow ring-1 ring-muted hover:bg-muted"
								aria-label="Remove selected image"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</>
				) : (
					<>
						<Upload className="h-6 w-6 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">
							{isDragOver ? "Drop to upload" : "Drag & drop or click to select"}
						</span>
						<span className="text-xs text-muted-foreground">JPG, JPEG, WebP, PNG</span>
						{currentImg && (
							<span className="text-xs text-muted-foreground">Current: {currentImg}</span>
						)}
					</>
				)}
			</div>
			{error && (
				<p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-destructive-text">
					{error}
				</p>
			)}
		</div>
	)
}

export interface StudentEditDialogProps {
	isOpen: boolean
	onClose: () => void
	data: YookbeerColumn
	onUpdate: (data: Partial<YookbeerColumn>, imageFile: File | null) => void
	isPending: boolean
}

// Field behaviour is inferred from the key so a new column renders without touching this dialog.
const READ_ONLY_KEYS = ["stdid"]
const inputPropsFor = (key: string): React.ComponentProps<"input"> => {
	if (READ_ONLY_KEYS.includes(key))
		return { readOnly: true, className: "col-span-3 bg-muted text-muted-foreground" }
	if (/email/i.test(key)) return { type: "email", inputMode: "email", autoComplete: "off" }
	if (/phone/i.test(key)) return { type: "tel", inputMode: "tel", autoComplete: "off" }
	return {}
}

const MONTHS = [
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
]

export const StudentEditDialog = ({ isOpen, onClose, data, onUpdate, isPending }: StudentEditDialogProps) => {
	const initialData = React.useMemo<Partial<YookbeerColumn>>(
		() => ({
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
		}),
		[data]
	)
	const [formData, setFormData] = React.useState<Partial<YookbeerColumn>>(initialData)
	const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
	const [confirmingDiscard, setConfirmingDiscard] = React.useState(false)
	const inputMapExcludeList = ["status", "birthMonth", "birthDay", "img"]

	// start every open from the current record (also clears a picked image after a successful save)
	// biome-ignore lint/correctness/useExhaustiveDependencies: only on open, so a background refresh can't wipe edits in progress
	React.useEffect(() => {
		if (!isOpen) return
		setFormData(initialData)
		setSelectedImageFile(null)
		setConfirmingDiscard(false)
	}, [isOpen])

	// String() on both sides: inputs store edits as strings while initial values may be numbers/null
	const isDirty =
		selectedImageFile !== null ||
		Object.keys(formData).some(
			(k) =>
				String(formData[k as keyof YookbeerColumn] ?? "") !==
				String(initialData[k as keyof YookbeerColumn] ?? "")
		)

	const discardAndClose = () => {
		setConfirmingDiscard(false)
		onClose()
	}

	const requestClose = () => {
		if (isPending) return
		if (isDirty) setConfirmingDiscard(true)
		else discardAndClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-scroll sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit student information</DialogTitle>
					<DialogDescription>
						{data.nameen} ({data.nicken}) - {data.stdid}
					</DialogDescription>
				</DialogHeader>
				{/* noValidate: type=email/tel are for mobile keyboards; a malformed legacy value must not block saving other fields */}
				<form noValidate action={() => onUpdate(formData, selectedImageFile)}>
					<div className="grid gap-4 py-4">
						{/** biome-ignore lint/suspicious/useIterableCallbackReturn: <> */}
						{Object.entries(formData).map(([key, value]) => {
							if (inputMapExcludeList.includes(key)) return
							return (
								<div key={key} className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor={key} className="text-right capitalize">
										{key.replace(/([A-Z])/g, " $1").trim()}
									</Label>
									<Input
										id={key}
										value={value == null ? "" : String(value)}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												[key]: e.target.value,
											}))
										}
										className="col-span-3"
										{...inputPropsFor(key)}
									/>
								</div>
							)
						})}
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="birthDay" className="text-right">
								Birthday
							</Label>
							<div className="col-span-3 flex gap-2">
								<Input
									id="birthDay"
									type="number"
									inputMode="numeric"
									min={1}
									max={31}
									placeholder="Day"
									aria-label="Birth day"
									value={formData.birthDay == null ? "" : String(formData.birthDay)}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											birthDay: e.target.value === "" ? null : Number(e.target.value),
										}))
									}
									className="w-20"
								/>
								<Select
									value={formData.birthMonth ? String(formData.birthMonth) : ""}
									onValueChange={(val) =>
										setFormData((prev) => ({
											...prev,
											birthMonth: Number(val),
										}))
									}
								>
									<SelectTrigger aria-label="Birth month" className="flex-1">
										<SelectValue placeholder="Month" />
									</SelectTrigger>
									<SelectContent>
										{MONTHS.map((month, i) => (
											<SelectItem key={month} value={String(i + 1)}>
												{month}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
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
								<SelectTrigger id="status" className="col-span-3">
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
					{confirmingDiscard ? (
						<div
							role="alert"
							className="flex flex-col gap-3 rounded-md border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<p className="text-sm">Discard your unsaved changes?</p>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setConfirmingDiscard(false)}
								>
									Keep editing
								</Button>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={discardAndClose}
								>
									Discard changes
								</Button>
							</div>
						</div>
					) : (
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={requestClose}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending || !isDirty}>
								{isPending ? "Saving..." : "Save changes"}
							</Button>
						</DialogFooter>
					)}
				</form>
			</DialogContent>
		</Dialog>
	)
}
