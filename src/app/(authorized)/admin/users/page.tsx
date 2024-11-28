import { AdminUserTable } from "@/components/admin-users-table"
import { users } from "@/db/schema"
import { db } from "@/db"
import localFont from "next/font/local"

const geistMono = localFont({
  src: "../../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default async function Admin() {
    const data = await db.select().from(users)

    return (
        <div className={`flex flex-col w-screen ${geistMono.className}`}>
            <AdminUserTable data={data} />
        </div>
    )
}
