import { ne } from "drizzle-orm"
import { auth } from "@/auth"
import type { YookbeerColumn } from "@/components/table/yookbeer-table-new"
import { YookbeerTable as NewTable } from "@/components/table/yookbeer-table-new"
import { db } from "@/db"
import { students } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { isAdmin } from "@/lib/rba"
import { searchParamsCache } from "@/lib/validations"
import type { SearchParams } from "@/types"

interface NotAttendingProps {
	searchParams: Promise<SearchParams>
}

export default async function NotAttending({ searchParams: searchParamsPromise }: NotAttendingProps) {
	const data = await db
		.select()
		.from(students)
		.where(ne(students.status, StudentStatus.ATTENDING))
		.orderBy(students.stdid)
	const session = await auth()

	const searchParams = await searchParamsPromise
	const search = searchParamsCache.parse(searchParams)

	return (
		<div className={`flex w-screen flex-col`}>
			<div className="mx-auto w-full max-w-[90vw]">
				<NewTable
					data={data as YookbeerColumn[]}
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
