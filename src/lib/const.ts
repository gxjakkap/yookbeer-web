export const COURSE_SHORTHAND = ["REG", "INT", "HDS", "RC"]
export const COURSE_PRETTYNAME = [
	"Regular Program",
	"International Program",
	"Health Data Science Program",
	"Residential College",
]

export enum Courses {
	REG = 0,
	INT = 1,
	HDS = 2,
	RC = 3,
}

export enum InviteStatus {
	UNUSED = "unused",
	CLAIMED = "claimed",
}

export enum StudentStatus {
	ATTENDING = "attending",
	RESIGNED = "resigned",
}
export const TAKEOUT_EXPORTABLE = [
	"stdid",
	"course",
	"nameth",
	"nameen",
	"nickth",
	"nicken",
	"phone",
	"emailper",
	"emailuni",
	"facebook",
	"lineid",
	"instagram",
	"discord",
	"status",
] as const

export const INCLUDABLE = [
	{
		id: "stdid",
		label: "Student ID",
	},
	{
		id: "course",
		label: "Course",
	},
	{
		id: "nameth",
		label: "Name (TH)",
	},
	{
		id: "nameen",
		label: "Name (EN)",
	},
	{
		id: "nickth",
		label: "Nickname (TH)",
	},
	{
		id: "nicken",
		label: "Nickname (EN)",
	},
	{
		id: "phone",
		label: "Phone",
	},
	{
		id: "emailper",
		label: "Personal email",
	},
	{
		id: "emailuni",
		label: "University email",
	},
	{
		id: "facebook",
		label: "Facebook",
	},
	{
		id: "lineid",
		label: "LINE ID",
	},
	{
		id: "instagram",
		label: "Instagram",
	},
	{
		id: "discord",
		label: "Discord",
	},
	{
		id: "status",
		label: "Status",
	},
] as const

export enum ReportStatus {
	UNRESOLVED = "unresolved",
	RESOLVED = "resolved",
	DISMISSED = "dismissed",
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
	[ReportStatus.UNRESOLVED]: "Unresolved",
	[ReportStatus.RESOLVED]: "Resolved",
	[ReportStatus.DISMISSED]: "Dismissed",
}

export enum ReportReason {
	DEAD_SOCIALS = "dead_socials",
	WRONG_INFO = "wrong_info",
	REASSIGNED = "reassigned",
	OTHER = "other",
}

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
	[ReportReason.DEAD_SOCIALS]: "Dead social links",
	[ReportReason.WRONG_INFO]: "Wrong/outdated info",
	[ReportReason.REASSIGNED]: "Resigned/reassigned to new cohort",
	[ReportReason.OTHER]: "Others",
}

export const REPORT_SOCIALS = {
	lineid: "LINE",
	instagram: "Instagram",
	facebook: "Facebook",
	discord: "Discord",
} as const

export const REPORT_FIELDS = {
	nameen: "Name (EN)",
	nameth: "Name (TH)",
	nicken: "Nickname (EN)",
	nickth: "Nickname (TH)",
	course: "Course",
	birthday: "Birthday",
	phone: "Phone",
	emailuni: "University email",
	emailper: "Personal email",
	emergency: "Emergency contact",
	photo: "Photo",
} as const
