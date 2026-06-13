import { eq, sql } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { db } from "@/db"
import { logs, users } from "@/db/schema"

export const dynamic = "force-dynamic"

interface LogDetailPageProps {
	params: Promise<{
		id: string
	}>
}

type LogDetailItemProps = {
	label: string
	value: React.ReactNode
}

function LogDetailItem({ label, value }: LogDetailItemProps) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[180px_1fr] sm:gap-4">
			<p className="text-muted-foreground font-medium">{label}</p>
			<div className="text-foreground break-words">{value}</div>
		</div>
	)
}

export default async function LogDetailPage({ params }: LogDetailPageProps) {
	const { id } = await params

	const parsedId = parseInt(id, 10)
	if (Number.isNaN(parsedId)) {
		notFound()
	}

	const [logRecord] = await db
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
		.where(eq(logs.id, parsedId))
		.limit(1)

	if (!logRecord) {
		notFound()
	}

	const formatDateTime = (value: Date) => {
		return new Intl.DateTimeFormat("th-TH", {
			dateStyle: "long",
			timeStyle: "medium",
		}).format(value)
	}

	return (
		<div className="container mx-auto space-y-6 px-6 py-8">
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="outline" size="sm" asChild>
					<Link href="/admin/logs">
						<ArrowLeft className="mr-1 h-4 w-4" />
						Back
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold">Log #{logRecord.id}</h1>
					<p className="text-muted-foreground text-sm">View details for this log entry.</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Log information</CardTitle>
					<CardDescription>Full record from the log table.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<LogDetailItem label="Log ID" value={logRecord.id} />
					<LogDetailItem
						label="Timestamp"
						value={<span className="tabular-nums">{formatDateTime(logRecord.timestamp)}</span>}
					/>
					<LogDetailItem
						label="Action"
						value={
							<span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted inline-block">
								{logRecord.action}
							</span>
						}
					/>
					<LogDetailItem label="Actor ID" value={logRecord.actor} />
					<LogDetailItem label="Actor name" value={logRecord.actorName} />

					<Separator />

					<LogDetailItem label="Target" value={logRecord.target ?? "—"} />

					{logRecord.details ? (
						<>
							<Separator />
							<div className="space-y-2">
								<p className="text-muted-foreground text-sm font-medium">Details</p>
								<pre className="bg-muted max-h-80 overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap break-words">
									{logRecord.details}
								</pre>
							</div>
						</>
					) : (
						<LogDetailItem label="Details" value="—" />
					)}
				</CardContent>
			</Card>
		</div>
	)
}
