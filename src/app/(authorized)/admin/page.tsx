import { AdminUserTable } from "@/components/table/admin-users-table"
import { apiKey, invite, users } from "@/db/schema"
import { db } from "@/db"
import localFont from "next/font/local"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminAPIKeyTable } from "@/components/table/admin-apikey-table"
import { AdminInviteTable } from "@/components/table/admin-invite-table"
import { eq } from "drizzle-orm"

const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default async function Admin() {
    const userData = await db.select().from(users)
    const apiKeyData = await db.select().from(apiKey)
    const inviteCodeRes = await db.select().from(invite)

    const inviter = await db.select({ id: users.id, name: users.name }).from(users).leftJoin(invite, eq(users.id, invite.createdBy))
    const invitee = await db.select({ id: users.id, name: users.name }).from(users).leftJoin(invite, eq(users.id, invite.usedBy))

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
            claimDate: dat.claimDate

        }
    })

    return (
        <div className={`flex flex-col w-screen ${geistMono.className}`}>
            <Card className="relative bg-transparent border-none shadow-none">
                <CardHeader className="pb-0">
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminUserTable data={userData} />
                </CardContent>
            </Card>
            <Card className="relative bg-transparent border-none shadow-none">
                <CardHeader>
                    <CardTitle>Invite Code</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminInviteTable data={inviteCodeData} />
                </CardContent>
            </Card>
            <Card className="relative bg-transparent border-none shadow-none">
                <CardHeader>
                    <CardTitle>API Key</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminAPIKeyTable data={apiKeyData} />
                </CardContent>
            </Card>
        </div>
    )
}
