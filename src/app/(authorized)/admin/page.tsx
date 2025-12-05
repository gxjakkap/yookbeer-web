import { auth } from "@/auth"
import { AdminAPIKeyTable } from "@/components/table/admin-apikey-table"
import { AdminInviteTable } from "@/components/table/admin-invite-table"
import { AdminUserTable } from "@/components/table/admin-users-table"
import TakeoutForm from "@/components/takeout-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VersionInfo } from "@/components/version-info"
import { db } from "@/db"
import { apiKey, invite, users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export default async function Admin() {
	const session = await auth()

	const userData = await db
		.select()
		.from(users)
		.orderBy(
			sql`
          CASE ${users.role}
              WHEN 'superadmin' THEN 1
              WHEN 'admin' THEN 2
              WHEN 'user' THEN 3
              WHEN 'unauthorized' THEN 4
              ELSE 5
          END
      `
		)
	const apiKeyRes = await db.select().from(apiKey)
	const inviteCodeRes = await db.select().from(invite)

	const inviter = await db
		.select({ id: users.id, name: users.name })
		.from(users)
		.leftJoin(invite, eq(users.id, invite.createdBy))
	const invitee = await db
		.select({ id: users.id, name: users.name })
		.from(users)
		.leftJoin(invite, eq(users.id, invite.usedBy))

	const inviteCodeData = inviteCodeRes.map((dat) => {
		const [cInviter] = inviter.filter((x) => x.id === dat.createdBy)
		const [cInvitee] = invitee.filter((x) => x.id === dat.usedBy)
		return {
			id: dat.id,
			code: dat.code,
			status: dat.status as "UNUSED" | "CLAIMED",
			usedBy: cInvitee?.name ?? null,
			createdBy: cInviter.name as string,
			creationDate: dat.creationDate,
			claimDate: dat.claimDate,
		}
	})

	const apiKeyData = apiKeyRes.map((dat) => {
		return {
			id: dat.id,
			name: dat.name,
			expiresAt: dat.expiresAt,
			owner: dat.owner,
			key: dat.owner === session?.user.id ? dat.key : "	********-****-****-****-************",
		}
	})

	return (
		<div className={`flex w-screen flex-col pb-20`}>
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>Version Info</CardTitle>
				</CardHeader>
				<CardContent>
					<VersionInfo
						sha={process.env.NEXT_PUBLIC_YB_SHA || "0"}
						commitMsg={process.env.NEXT_PUBLIC_YB_COMMIT || "-"}
						buildDate={new Date(Number(process.env.NEXT_PUBLIC_YB_BUILDDATE) || 0).toISOString()}
					/>
				</CardContent>
			</Card>
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>User Management</CardTitle>
				</CardHeader>
				<CardContent>
					<AdminUserTable data={userData} />
				</CardContent>
			</Card>
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader>
					<CardTitle>Invite Code</CardTitle>
				</CardHeader>
				<CardContent>
					<AdminInviteTable data={inviteCodeData} />
				</CardContent>
			</Card>
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>API Key</CardTitle>
					<CardDescription>To interact with YB API</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminAPIKeyTable data={apiKeyData} />
				</CardContent>
			</Card>
			<Card className="relative border-none bg-transparent shadow-none">
				<CardHeader className="pb-0">
					<CardTitle>Takeout</CardTitle>
					<CardDescription>Export data to CSV/JSON</CardDescription>
				</CardHeader>
				<CardContent>
					<TakeoutForm />
				</CardContent>
			</Card>
		</div>
	)
}
