import { desc, eq, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { AdminReportsTable } from "@/components/table/admin-reports-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { reports, students, users } from "@/db/schema"

export const metadata = {
	title: "Reports | yookbeer",
}

export default async function AdminReportsPage() {
	const changer = alias(users, "changer")
	const data = await db
		.select({
			id: reports.id,
			stdid: reports.stdid,
			nameEn: students.nameen,
			reporterName: sql<string>`coalesce(${users.name}, ${users.email}, '(deleted user)')`,
			reasons: reports.reasons,
			deadSocials: reports.deadSocials,
			wrongFields: reports.wrongFields,
			newStdid: reports.newStdid,
			note: reports.note,
			status: reports.status,
			createdAt: reports.createdAt,
			statusChangedByName: changer.name,
			statusChangedAt: reports.statusChangedAt,
		})
		.from(reports)
		.innerJoin(students, eq(reports.stdid, students.stdid))
		.leftJoin(users, eq(reports.reporter, users.id))
		.leftJoin(changer, eq(reports.statusChangedBy, changer.id))
		.orderBy(desc(reports.createdAt))

	return (
		<div className="flex w-full flex-col pb-20">
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>Reports</CardTitle>
					<CardDescription>Problems users reported with student entries</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminReportsTable data={data} />
				</CardContent>
			</Card>
		</div>
	)
}
