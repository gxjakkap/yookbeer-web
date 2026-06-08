"use client"

import { updateStudent } from "@/app/(authorized)/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { StudentStatus } from "@/lib/const"
import { Pencil } from "lucide-react"
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

interface StudentEditButtonProps {
	data: YookbeerColumn
}

export function StudentEditButton({ data }: StudentEditButtonProps) {
	const [isEditOpen, setIsEditOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const { toast } = useToast()

	const handleUpdate = async (updateData: Partial<YookbeerColumn>) => {
		startTransition(async () => {
			try {
				let bd: number | null = parseInt(updateData.birthDay?.toString() || "-1")
				let bm: number | null = parseInt(updateData.birthMonth?.toString() || "-1")

				if (bd === -1) bd = null
				if (bm === -1) bm = null

				await updateStudent({
					id: updateData.stdid as string,
					data: {
						...updateData,
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
