"use client"

import { Pencil } from "lucide-react"

import { StudentEditDialog } from "./student-edit-dialog"
import type { YookbeerColumn } from "./table/yookbeer-table-new"
import { Button } from "./ui/button"
import { useStudentUpdate } from "./use-student-update"

interface StudentEditButtonProps {
	data: YookbeerColumn
}

export function StudentEditButton({ data }: StudentEditButtonProps) {
	const { handleUpdate, isPending, isEditOpen, setIsEditOpen } = useStudentUpdate(data)

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
			<StudentEditDialog
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				data={data}
				onUpdate={handleUpdate}
				isPending={isPending}
			/>
		</>
	)
}
