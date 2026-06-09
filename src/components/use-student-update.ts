"use client"

import {
	finalizeStudentImage,
	getImageUploadPresignedUrl,
	updateStudent,
} from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import React from "react"

import { ALLOWED_EXTENSIONS, AllowedExtension, getExtension, mimeToExtension } from "./student-edit-dialog"
import { YookbeerColumn } from "./table/yookbeer-table-new"

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
						toast({ title: "Unsupported image format", variant: "destructive" })
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
							title: "Failed to initiate image upload",
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
							title: "Failed to upload image",
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
							title: "Image uploaded but failed to update record",
							description: finalizeErr.message,
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

				const [, updateErr] = await updateStudent({
					id: updateData.stdid as string,
					data: {
						...restData,
						birthDay: bd,
						birthMonth: bm,
					},
				})

				if (updateErr) {
					toast({ title: "Failed to update record", description: updateErr.message, variant: "destructive" })
					return
				}

				toast({ title: "Record updated successfully" })
				setIsEditOpen(false)
			} catch (error) {
				toast({ title: "Failed to update record" })
				console.error(error)
			}
		})
	}

	return { handleUpdate, isPending, isEditOpen, setIsEditOpen }
}
