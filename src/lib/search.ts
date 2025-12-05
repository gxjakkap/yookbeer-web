import { db } from "@/db"
import { students, thirtyeight } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function searchThirtyeight(searchTerm: string) {
	const columns = [
		thirtyeight.stdid,
		thirtyeight.nameth,
		thirtyeight.nameen,
		thirtyeight.nickth,
		thirtyeight.nicken,
		thirtyeight.emailuni,
		thirtyeight.emailper,
		thirtyeight.instagram,
		thirtyeight.discord,
	]

	const searchCondition = sql`${sql.join(
		columns.map((column) => sql`${column} ILIKE ${`%${searchTerm}%`}`),
		sql` OR `
	)}`

	const results = await db.select().from(thirtyeight).where(searchCondition).execute()

	return results
}

export async function searchStudents(searchTerm: string) {
	const columns = [
		students.stdid,
		students.nameth,
		students.nameen,
		students.nickth,
		students.nicken,
		students.instagram,
		students.discord,
	]

	const searchCondition = sql`${sql.join(
		columns.map((column) => sql`${column} ILIKE ${`%${searchTerm}%`}`),
		sql` OR `
	)}`

	const results = await db.select().from(students).where(searchCondition).execute()

	console.log(results)

	return results
}
