import { COURSE_PRETTYNAME, INCLUDABLE, REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/const"

export type DiffLine = { sign: "-" | "+"; text: string }

const diffLine = (sign: DiffLine["sign"], field: string, value: unknown): DiffLine => ({
	sign,
	text: `${field}: ${JSON.stringify(value)}`,
})

/**
 * Turns the details of an edit_std or edit_usr log into changed-field diff lines.
 * Returns null when the entry can't be diffed, e.g. older edit_std entries that only recorded the new values.
 */
export function editDiff(details: string): DiffLine[] | null {
	const image = details.match(/^image updated: (.+) → (.+)$/)
	if (image) {
		const [, from, to] = image
		if (from === to) return null
		return [...(from === "(none)" ? [] : [diffLine("-", "img", from)]), diffLine("+", "img", to)]
	}

	const userEdit = details.match(/^existing data: (.+), new data: (\{.*\})$/)

	let parsed: { before?: Record<string, unknown> | null; after?: Record<string, unknown> } | null
	try {
		parsed = userEdit
			? { before: JSON.parse(userEdit[1]), after: JSON.parse(userEdit[2]).data }
			: JSON.parse(details)
	} catch {
		return null
	}
	if (!parsed?.after) return null

	const before = parsed.before ?? {}
	return Object.entries(parsed.after).flatMap(([field, value]) => {
		if (before[field] === value) return []
		return [
			...(field in before ? [diffLine("-", field, before[field])] : []),
			diffLine("+", field, value),
		]
	})
}

export type DetailRow = { label: string; value: string }

export const formatDateTime = (value: Date) =>
	new Intl.DateTimeFormat("th-TH", {
		dateStyle: "long",
		timeStyle: "medium",
	}).format(value)

function parseJson<T>(text: string): T | null {
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

/** The functions below turn a log's details into labeled rows, or null if they aren't in the expected shape. */
export function takeoutRows(details: string): DetailRow[] | null {
	const parsed = parseJson<{
		onlyAttending: boolean
		including: string[]
		format: string
		includedCourse: number[]
		includedGen: number[]
		mode: string
	}>(details)
	if (!parsed?.including || !parsed.format || !parsed.includedCourse || !parsed.includedGen) return null

	return [
		{ label: "Students", value: parsed.onlyAttending ? "Only attending students" : "All students" },
		{ label: "Format", value: parsed.format.toUpperCase() },
		{ label: "Generations", value: parsed.includedGen.join(", ") },
		{
			label: "Courses",
			value: parsed.includedCourse.map((c) => COURSE_PRETTYNAME[c] ?? String(c)).join(", "),
		},
		{
			label: "Columns",
			value: parsed.including.map((f) => INCLUDABLE.find((i) => i.id === f)?.label ?? f).join(", "),
		},
		{ label: "Delivery", value: parsed.mode === "s3" ? "Download link" : "Direct download" },
	]
}

export function inviteRows(details: string): DetailRow[] | null {
	const code = details.match(/^(?:created|removed) invite (.+)$/)?.[1]
	return code ? [{ label: "Invite code", value: code }] : null
}

export function inviteClaimRows(details: string): DetailRow[] | null {
	const parsed = parseJson<{ code?: string; status?: string }>(details)
	if (!parsed?.code || !parsed.status) return null

	return [
		{ label: "Invite code", value: parsed.code },
		{ label: "Result", value: parsed.status[0].toUpperCase() + parsed.status.slice(1) },
	]
}

export function apiKeyCreatedRows(details: string): DetailRow[] | null {
	const key = details.match(/^key: (.+)$/)?.[1]
	return key ? [{ label: "API key", value: key }] : null
}

export function apiKeyDeletedRows(details: string): DetailRow[] | null {
	const match = details.match(/^deleted key (.+) owned by (.+)$/)
	if (!match) return null

	return [
		{ label: "API key", value: match[1] },
		{ label: "Owner ID", value: match[2] },
	]
}

export function apiKeyEditedRows(details: string): DetailRow[] | null {
	const prefix = "new data: "
	if (!details.startsWith(prefix)) return null
	const parsed = parseJson<{
		id: number
		data?: { name?: string; expiresAt?: string | null; owner?: string }
	}>(details.slice(prefix.length))
	if (!parsed?.data) return null

	const { name, expiresAt, owner } = parsed.data
	return [
		{ label: "Key ID", value: String(parsed.id) },
		...(name === undefined ? [] : [{ label: "Name", value: name }]),
		...(expiresAt === undefined
			? []
			: [{ label: "Expires", value: expiresAt ? formatDateTime(new Date(expiresAt)) : "Never" }]),
		...(owner === undefined ? [] : [{ label: "Owner ID", value: owner }]),
	]
}

export function reportStatusRows(details: string): DetailRow[] | null {
	const parsed = parseJson<{ report?: number; from?: ReportStatus; to?: ReportStatus }>(details)
	if (!parsed?.report || !parsed.from || !parsed.to) return null

	return [
		{ label: "Report ID", value: String(parsed.report) },
		{ label: "Status", value: `${REPORT_STATUS_LABEL[parsed.from]} → ${REPORT_STATUS_LABEL[parsed.to]}` },
	]
}
