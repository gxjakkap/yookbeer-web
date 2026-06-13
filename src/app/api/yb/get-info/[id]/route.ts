import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { createZodRoute } from "next-zod-route"
import { z } from "zod"
import { getPresignedURLForYookbeerPic } from "@/app/(authorized)/actions"
import { db } from "@/db"
import { apiKey, students } from "@/db/schema"

const paramsSchema = z.object({
	id: z.string(),
})

export const GET = createZodRoute()
	.params(paramsSchema)
	.handler(async (r, ctx) => {
		const key = r.headers.get("Authorization")

		if (!key) {
			return new NextResponse(JSON.stringify({ status: 401, err: "Missing API Key" }), { status: 401 })
		}

		const apiQ = await db.select().from(apiKey).where(eq(apiKey.key, key)).limit(1)

		if (apiQ.length < 1) {
			return new NextResponse(JSON.stringify({ status: 403, err: "Forbidden" }), { status: 403 })
		}

		const { id } = ctx.params

		const stdq = await db.select().from(students).where(eq(students.stdid, id)).limit(1)

		if (stdq.length < 1)
			return new NextResponse(JSON.stringify({ status: 404, err: "Not Found" }), { status: 400 })

		const std = stdq[0]

		const imgUrl = await getPresignedURLForYookbeerPic(`${std.gen}/${std.img}` || "")

		return new NextResponse(
			JSON.stringify({
				status: 200,
				data: {
					id: std.stdid,
					gen: std.gen,
					tha_name: std.nameth,
					eng_name: std.nameen,
					tha_nick: std.nickth,
					eng_nick: std.nicken,
					personal_email: std.emailper,
					university_email: std.emailuni,
					phone: std.phone,
					socials: {
						id: std.instagram,
						fb: std.facebook,
						line: std.lineid,
						discord: std.discord,
					},
					img_url: imgUrl,
				},
			}),
			{ status: 200 }
		)
	})
