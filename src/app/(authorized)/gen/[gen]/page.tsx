import { auth } from "@/auth"
import { YookbeerTable } from "@/components/table/yookbeer-table"
import { YookbeerTable as NewTable } from "@/components/table/yookbeer-table-new"
import { db } from "@/db"
import { students, thirtyeight } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { isAdmin, Roles } from "@/lib/rba"
import { searchParamsCache } from "@/lib/validations"
import { SearchParams } from "@/types"
import { and, eq } from "drizzle-orm"
import localFont from "next/font/local"
import { notFound } from "next/navigation"

const geistMono = localFont({
  src: "../../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

interface GenPageProps {
  s: Promise<SearchParams>
  params: Promise<{ gen: string }>
}

export default async function GenPage({ s, params }: GenPageProps) {
  const { gen } = await params
  const gi = parseInt(gen)

  console.log(gen)
  console.log(typeof gi)

  if (!gi) notFound()

  const data = await db
    .select()
    .from(students)
    .where(and(eq(students.gen, gi), eq(students.status, StudentStatus.ATTENDING)))
    .orderBy(students.stdid)

  const session = await auth()

  const searchParams = await s
  const search = searchParamsCache.parse(searchParams)

  return (
    <div className={`flex w-screen flex-col ${geistMono.className}`}>
      {/* <YookbeerTable data={data} isAdmin={isAdmin} /> */}
      <div className="mx-auto w-full max-w-[90vw]">
        <NewTable
          data={data as any}
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
