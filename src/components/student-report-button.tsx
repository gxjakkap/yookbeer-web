"use client"

import { Flag } from "lucide-react"
import { useId, useState, useTransition } from "react"
import { createReport } from "@/app/(authorized)/actions"
import { useToast } from "@/hooks/use-toast"
import { REPORT_FIELDS, REPORT_REASON_LABEL, REPORT_SOCIALS, ReportReason } from "@/lib/const"
import { reportSchema } from "@/lib/report"

import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
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

type Social = keyof typeof REPORT_SOCIALS
type Field = keyof typeof REPORT_FIELDS

interface StudentReportButtonProps {
	stdid: string
	nicken: string
	/** Socials this student has; only these can be reported as dead. */
	socials: Social[]
}

const toggle = <T,>(list: T[], item: T, on: boolean) =>
	on ? [...list, item] : list.filter((x) => x !== item)

function CheckList<T extends string>({
	options,
	selected,
	onChange,
	error,
}: {
	options: [T, string][]
	selected: T[]
	onChange: (next: T[]) => void
	error?: string
}) {
	const id = useId()
	return (
		<div className="ml-6 flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2">
				{options.map(([value, label]) => (
					<div key={value} className="flex items-center gap-2">
						<Checkbox
							id={`${id}-${value}`}
							checked={selected.includes(value)}
							onCheckedChange={(on) => onChange(toggle(selected, value, on === true))}
						/>
						<Label htmlFor={`${id}-${value}`} className="font-normal">
							{label}
						</Label>
					</div>
				))}
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	)
}

export function StudentReportButton({ stdid, nicken, socials }: StudentReportButtonProps) {
	const id = useId()
	const { toast } = useToast()
	const [isPending, startTransition] = useTransition()
	const [open, setOpen] = useState(false)
	const [reasons, setReasons] = useState<ReportReason[]>([])
	const [deadSocials, setDeadSocials] = useState<Social[]>([])
	const [wrongFields, setWrongFields] = useState<Field[]>([])
	const [newStdid, setNewStdid] = useState("")
	const [note, setNote] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	const availableReasons = Object.values(ReportReason).filter(
		(r) => r !== ReportReason.DEAD_SOCIALS || socials.length
	)
	const isOther = reasons.includes(ReportReason.OTHER)

	const reset = () => {
		setReasons([])
		setDeadSocials([])
		setWrongFields([])
		setNewStdid("")
		setNote("")
		setErrors({})
	}

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		const input = { stdid, reasons, deadSocials, wrongFields, newStdid, note }
		const parsed = reportSchema.safeParse(input)
		if (!parsed.success) {
			setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])))
			return
		}
		setErrors({})
		startTransition(async () => {
			const [, err] = await createReport(input)
			if (err) {
				toast({ title: "Couldn't send report", description: err.message, variant: "destructive" })
				return
			}
			toast({ title: "Report sent", description: "An admin will review it." })
			setOpen(false)
			reset()
		})
	}

	return (
		<>
			<Button
				variant="outline"
				size="icon"
				onClick={() => setOpen(true)}
				className="h-8 w-8"
				aria-label={`Report a problem with ${nicken}'s entry`}
				title="Report a problem with this entry"
			>
				<Flag className="h-4 w-4" />
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Report {nicken}'s entry</DialogTitle>
						<DialogDescription>
							Tell the admins what needs fixing. Pick all that apply.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={submit} className="flex flex-col gap-4">
						<fieldset className="flex flex-col gap-3">
							<legend className="sr-only">Reasons</legend>
							{availableReasons.map((reason) => (
								<div key={reason} className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<Checkbox
											id={`${id}-${reason}`}
											checked={reasons.includes(reason)}
											onCheckedChange={(on) =>
												setReasons(toggle(reasons, reason, on === true))
											}
										/>
										<Label htmlFor={`${id}-${reason}`}>
											{REPORT_REASON_LABEL[reason]}
										</Label>
									</div>
									{reason === ReportReason.DEAD_SOCIALS && reasons.includes(reason) && (
										<CheckList
											options={socials.map((s) => [s, REPORT_SOCIALS[s]])}
											selected={deadSocials}
											onChange={setDeadSocials}
											error={errors.deadSocials}
										/>
									)}
									{reason === ReportReason.WRONG_INFO && reasons.includes(reason) && (
										<CheckList
											options={Object.entries(REPORT_FIELDS) as [Field, string][]}
											selected={wrongFields}
											onChange={setWrongFields}
											error={errors.wrongFields}
										/>
									)}
									{reason === ReportReason.REASSIGNED && reasons.includes(reason) && (
										<div className="ml-6 flex flex-col gap-1.5">
											<Label htmlFor={`${id}-newstdid`} className="font-normal">
												New student ID (if you know it)
											</Label>
											<Input
												id={`${id}-newstdid`}
												value={newStdid}
												onChange={(e) => setNewStdid(e.target.value)}
												maxLength={20}
												inputMode="numeric"
												className="max-w-48 tabular-nums"
											/>
										</div>
									)}
								</div>
							))}
							{errors.reasons && <p className="text-sm text-destructive">{errors.reasons}</p>}
						</fieldset>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`${id}-note`}>
								Details{" "}
								<span className="font-normal text-muted-foreground">
									{isOther ? "(required)" : "(optional)"}
								</span>
							</Label>
							<textarea
								id={`${id}-note`}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								maxLength={1000}
								rows={3}
								placeholder="e.g. the correct phone number, or what's wrong"
								aria-invalid={!!errors.note}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
							/>
							{errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
						</div>
						<DialogFooter className="gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Sending…" : "Send report"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}
