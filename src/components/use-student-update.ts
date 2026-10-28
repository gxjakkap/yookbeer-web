"use client"

import React from "react"
import {
	finalizeStudentImage,
	getImageUploadPresignedUrl,
	updateStudent,
} from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"

import {
	ALLOWED_EXTENSIONS,
	type AllowedExtension,
	getExtension,
	mimeToExtension,
} from "./student-edit-dialog"
import type { YookbeerColumn } from "./table/yookbeer-table-new"

/**
 * Shared hook encapsulating the full student update flow:
 * - optional presigned-URL image upload to R2
 * - student record update via server action
 *
 * Returns { handleUpdate, isPending, isEditOpen, setIsEditOpen }
 */
export function useStudentUpdate(data: YookbeerColumn) {
	const [isEditOpen, setIsEditOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const { toast } = useToast()

	const handleUpdate = (updateData: Partial<YookbeerColumn>, imageFile: File | null) => {
		startTransition(async () => {
			try {
				if (imageFile) {
					const ext =
						mimeToExtension(imageFile.type) ?? (getExtension(imageFile.name) as AllowedExtension)

					if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
						toast({ title: "Use a JPG, PNG or WebP photo", variant: "destructive" })
						return
					}

					// step 1: get presigned PUT URL from server
					const [presignedRes, presignedErr] = await getImageUploadPresignedUrl({
						stdid: data.stdid,
						gen: data.gen as number,
						newExtension: ext,
					})

					if (presignedErr || !presignedRes) {
						toast({
							title: "Couldn't start the photo upload",
							description: presignedErr?.message,
							variant: "destructive",
						})
						return
					}

					// step 2: upload directly to R2 via presigned URL
					const uploadRes = await fetch(presignedRes.uploadUrl, {
						method: "PUT",
						body: imageFile,
						headers: { "Content-Type": presignedRes.contentType },
					})

					if (!uploadRes.ok) {
						toast({
							title: "Couldn't upload photo",
							description: `HTTP ${uploadRes.status}`,
							variant: "destructive",
						})
						return
					}

					// step 3: finalize — delete old R2 object + update DB img field
					const [, finalizeErr] = await finalizeStudentImage({
						stdid: data.stdid,
						gen: data.gen as number,
						currentImg: data.img,
						newFilename: presignedRes.newFilename,
					})

					if (finalizeErr) {
						toast({
							title: "Photo uploaded, but the record wasn't updated",
							description: finalizeErr.message,
							variant: "destructive",
						})
						return
					}
				}

				let bd: number | null = parseInt(updateData.birthDay?.toString() || "-1", 10)
				let bm: number | null = parseInt(updateData.birthMonth?.toString() || "-1", 10)

				if (bd === -1) bd = null
				if (bm === -1) bm = null

				const { img: _img, ...restData } = updateData as Partial<YookbeerColumn> & {
					img?: string | null
				}

				const [, updateErr] = await updateStudent({
					id: updateData.stdid as string,
					data: {
						...restData,
						birthDay: bd,
						birthMonth: bm,
					},
				})

				if (updateErr) {
					toast({
						title: "Couldn't update student",
						description: updateErr.message,
						variant: "destructive",
					})
					return
				}

				toast({ title: "Student updated" })
				setIsEditOpen(false)
			} catch (error) {
				toast({
					title: "Couldn't update student",
					description: "Check your connection and try again.",
					variant: "destructive",
				})
				console.error(error)
			}
		})
	}

	return { handleUpdate, isPending, isEditOpen, setIsEditOpen }
}
