import { YookbeerTable } from "@/components/yookbeer-table"
import { db, thirtyeight } from "@/db/schema"
import localFont from "next/font/local"

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default async function Home() {
  const data = await db.select().from(thirtyeight).orderBy(thirtyeight.stdid)
  return (
    <div className={`flex flex-col w-screen ${geistMono.className}`}>
      <YookbeerTable data={data} />
    </div>
  )
}
