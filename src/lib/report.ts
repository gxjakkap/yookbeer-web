import { z } from "zod"
import { REPORT_FIELDS, REPORT_SOCIALS, ReportReason } from "@/lib/const"

const keys = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]]

/** Shared by the report dialog and the createReport action; extras for unticked reasons are dropped. */
export const reportSchema = z
	.object({
		stdid: z.string().min(1).max(20),
		reasons: z.array(z.nativeEnum(ReportReason)).min(1, "Pick at least one reason"),
		deadSocials: z.array(z.enum(keys(REPORT_SOCIALS))).default([]),
		wrongFields: z.array(z.enum(keys(REPORT_FIELDS))).default([]),
		newStdid: z.string().trim().max(20).default(""),
		note: z.string().trim().max(1000).default(""),
	})
	.superRefine((r, ctx) => {
		const has = (reason: ReportReason) => r.reasons.includes(reason)
		if (has(ReportReason.DEAD_SOCIALS) && !r.deadSocials.length)
			ctx.addIssue({ code: "custom", path: ["deadSocials"], message: "Pick which links are dead" })
		if (has(ReportReason.WRONG_INFO) && !r.wrongFields.length)
			ctx.addIssue({ code: "custom", path: ["wrongFields"], message: "Pick which info is wrong" })
		if (has(ReportReason.OTHER) && !r.note)
			ctx.addIssue({ code: "custom", path: ["note"], message: "Describe the problem" })
	})
	.transform((r) => ({
		...r,
		deadSocials: r.reasons.includes(ReportReason.DEAD_SOCIALS) ? r.deadSocials : [],
		wrongFields: r.reasons.includes(ReportReason.WRONG_INFO) ? r.wrongFields : [],
		newStdid: r.reasons.includes(ReportReason.REASSIGNED) && r.newStdid ? r.newStdid : null,
		note: r.note || null,
	}))

export type ReportInput = z.input<typeof reportSchema>
