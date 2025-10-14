import localFont from "next/font/local"

import { auth } from "@/auth"
import { YookbeerTable as NewTable } from "@/components/table/yookbeer-table-new"
import { db } from "@/db"
import { thirtyeight } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { isAdmin } from "@/lib/rba"
import { SearchParams } from "@/types"
import { searchParamsCache } from "@/lib/validations";
import { ne } from "drizzle-orm"

const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

interface NotAttendingProps {
  s: Promise<SearchParams>;
}

export default async function NotAttending({ s }: NotAttendingProps) {
  const data = await db.select().from(thirtyeight).where(ne(thirtyeight.status, StudentStatus.ATTENDING)).orderBy(thirtyeight.stdid)
  const session = await auth()

  const searchParams = await s;
  const search = searchParamsCache.parse(searchParams);

  return (
    <div className={`flex flex-col w-screen ${geistMono.className}`}>
      {/* <YookbeerTable data={data} isAdmin={isAdmin} /> */}
      <div className="w-full max-w-[90vw] mx-auto">
        <NewTable
          data={data}
          isAdmin={isAdmin(session?.user.role || "")}
          initialState={{
            pagination: {
              pageIndex: search.page,
              pageSize: search.perPage
            }
          }}
        />
      </div>
    </div>
  )
}
