import { desc, eq, sql } from "drizzle-orm"
import { AdminLogsTable } from "@/components/table/admin-logs-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { logs, users } from "@/db/schema"

export const metadata = {
	title: "Logs | yookbeer",
}

/* interface LogEntry {
	id: number
	action: string
	actor: string
	actorName: string
	target: string | null
	details: string | null
	timestamp: Date
} */

export default async function AdminLogsPage() {
	const logsData = await db
		.select({
			id: logs.id,
			action: logs.action,
			actor: logs.actor,
			actorName: sql<string>`coalesce(${users.name}, ${logs.actor})`,
			target: logs.target,
			details: logs.details,
			timestamp: logs.timestamp,
		})
		.from(logs)
		.leftJoin(users, eq(logs.actor, users.id))
		.orderBy(desc(logs.timestamp))

	return (
		<div className="flex w-screen flex-col pb-20">
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>Action Logs</CardTitle>
					<CardDescription>All recorded actions in the system</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminLogsTable data={logsData} />
				</CardContent>
			</Card>
		</div>
	)
}
