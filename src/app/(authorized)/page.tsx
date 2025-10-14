import { auth } from "@/auth"
import { YookbeerTable } from "@/components/table/yookbeer-table"
import { YookbeerTable as NewTable } from "@/components/table/yookbeer-table-new"
import { db } from "@/db"
import { thirtyeight } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { isAdmin, Roles } from "@/lib/rba"
import { searchParamsCache } from "@/lib/validations"
import { SearchParams } from "@/types"
import { eq } from "drizzle-orm"
import localFont from "next/font/local"

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

interface HomeProps {
  s: Promise<SearchParams>
}

export default async function Home({ s }: HomeProps) {
  const data = await db
    .select()
    .from(thirtyeight)
    .where(eq(thirtyeight.status, StudentStatus.ATTENDING))
    .orderBy(thirtyeight.stdid)
  const session = await auth()

  const searchParams = await s
  const search = searchParamsCache.parse(searchParams)

  return (
    <div className={`flex w-screen flex-col ${geistMono.className}`}>
      {/* <YookbeerTable data={data} isAdmin={isAdmin} /> */}
      <div className="mx-auto w-full max-w-[90vw]">
        <NewTable
          data={data}
          isAdmin={isAdmin(session?.user.role || "")}
          initialState={{
            pagination: {
              pageIndex: search.page,
              pageSize: search.perPage,
            },
          }}
        />
      </div>
    </div>
  )
}
