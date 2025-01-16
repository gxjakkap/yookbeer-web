import { AdminUserTable } from "@/components/admin-users-table"
import { apiKey, users } from "@/db/schema"
import { db } from "@/db"
import localFont from "next/font/local"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminAPIKeyTable } from "@/components/admin-apikey-table"

const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default async function Admin() {
    const userData = await db.select().from(users)
    const apiKeyData = await db.select().from(apiKey)

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
                    <CardTitle>API Key</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminAPIKeyTable data={apiKeyData} />
                </CardContent>
            </Card>
        </div>
    )
}
