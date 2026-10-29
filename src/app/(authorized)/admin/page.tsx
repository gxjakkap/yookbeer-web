import { eq, sql } from "drizzle-orm"
import { auth } from "@/auth"
import { AdminAPIKeyTable } from "@/components/table/admin-apikey-table"
import { AdminInviteTable } from "@/components/table/admin-invite-table"
import { AdminUserTable } from "@/components/table/admin-users-table"
import TakeoutForm from "@/components/takeout-form"
import { VersionInfo } from "@/components/version-info"
import { db } from "@/db"
import { apiKey, invite, users } from "@/db/schema"

function AdminSection({
	title,
	description,
	children,
}: {
	title: string
	description?: string
	children: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-y-3">
			<div>
				<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			{children}
		</section>
	)
}

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
		<div className="mx-auto flex w-full max-w-[90vw] flex-col gap-y-12 pb-20">
			<AdminSection title="User management">
				<AdminUserTable data={userData} />
			</AdminSection>
			<AdminSection title="Invite codes">
				<AdminInviteTable data={inviteCodeData} />
			</AdminSection>
			<AdminSection title="API keys" description="Keys for the yookbeer API">
				<AdminAPIKeyTable data={apiKeyData} />
			</AdminSection>
			<AdminSection title="Takeout" description="Export student data as CSV or JSON">
				<TakeoutForm />
			</AdminSection>
			<footer className="border-t pt-4">
				<VersionInfo
					sha={process.env.NEXT_PUBLIC_YB_SHA || "0"}
					commitMsg={process.env.NEXT_PUBLIC_YB_COMMIT || "-"}
					buildDate={new Date(
						Number(process.env.NEXT_PUBLIC_YB_BUILDDATE) * 1000 || 0
					).toISOString()}
				/>
			</footer>
		</div>
	)
}
