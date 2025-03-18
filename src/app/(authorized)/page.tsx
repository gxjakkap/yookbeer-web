import localFont from "next/font/local"

import { auth } from "@/auth"
import { YookbeerTable } from "@/components/yookbeer-table"
import { YookbeerTable as NewTable } from "@/components/yookbeer-table-new"
import { db } from "@/db"
import { thirtyeight } from "@/db/schema"
import { Roles } from "@/lib/const"
import { SearchParams } from "@/types"
import { searchParamsCache } from "@/lib/validations";

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

interface HomeProps {
  s: Promise<SearchParams>;
}

export default async function Home({ s }: HomeProps) {
  const data = await db.select().from(thirtyeight).orderBy(thirtyeight.stdid)
  const session = await auth()
  const isAdmin = (session?.user.role === Roles.ADMIN)

  const searchParams = await s;
  const search = searchParamsCache.parse(searchParams);

  return (
    <div className={`flex flex-col w-screen ${geistMono.className}`}>
      {/* <YookbeerTable data={data} isAdmin={isAdmin} /> */}
      <div className="w-full max-w-[90vw] mx-auto">
        <NewTable
          data={data}
          isAdmin={isAdmin}
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
