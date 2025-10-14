import { auth } from "@/auth"
import { YookbeerTable as NewTable } from "@/components/table/yookbeer-table-new"
import { db } from "@/db"
import { thirtynine } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { isAdmin } from "@/lib/rba"
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

export default async function ThirtyNineHome({ s }: HomeProps) {
  const data = await db
    .select()
    .from(thirtynine)
    .where(eq(thirtynine.status, StudentStatus.ATTENDING))
    .orderBy(thirtynine.stdid)
  const session = await auth()

  const searchParams = await s
  const search = searchParamsCache.parse(searchParams)

  return (
    <div className={`flex w-screen flex-col ${geistMono.className}`}>
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
          hrefPrefix="std39/"
        />
      </div>
    </div>
  )
}
