import { db } from "@/db"
import { apiKey } from "@/db/schema"
import { TAKEOUT_EXPORTABLE } from "@/lib/const"
import { actionLog, LogAction, logger } from "@/lib/log"
import { takeout } from "@/lib/takeout"
import { eq } from "drizzle-orm"
import { createZodRoute } from "next-zod-route"
import { NextResponse } from "next/server"
import { z } from "zod"

const bodySchema = z.object({
	onlyAttending: z.boolean().optional().default(true),
	including: z.array(z.enum(TAKEOUT_EXPORTABLE)),
	format: z.enum(["csv", "json"]).default("csv"),
	includedCourse: z.array(z.number()).optional().default([0, 1, 2, 3]),
	includedGen: z.array(z.number()),
	mode: z.enum(["plain", "s3"]).default("plain"),
})

export const POST = createZodRoute()
	.body(bodySchema)
	.handler(async (r, ctx) => {
		try {
			const key = r.headers.get("Authorization")

			if (!key) {
				return new NextResponse(JSON.stringify({ status: 401, err: "Missing API Key" }), {
					status: 401,
				})
			}

			const [apiU] = await db.select().from(apiKey).where(eq(apiKey.key, key)).limit(1)

			if (!apiU) {
				return new NextResponse(JSON.stringify({ status: 403, err: "Forbidden" }), { status: 403 })
			}

			const { onlyAttending, including, format, includedCourse, mode, includedGen } = ctx.body

			const res = await takeout({
				onlyAttending,
				including,
				format,
				includedCourse,
				createdBy: apiU.owner,
				mode,
				includedGen,
			})

			actionLog({
				action: LogAction.TAKEOUT,
				actor: apiU.owner,
				details: JSON.stringify({
					onlyAttending,
					including,
					format,
					includedCourse,
					includedGen,
					createdBy: apiU.owner,
					mode,
				}),
			})

			if (res.mode === "plain") {
				const contentType = res.contentType || (format === "csv" ? "text/csv" : "application/json")
				return new NextResponse(res.data, {
					headers: {
						"Content-Type": contentType,
						"Content-Disposition": `attachment; filename="${res.filename}"`,
					},
				})
			} else {
				return new NextResponse(JSON.stringify({ status: 200, url: res.url }), { status: 200 })
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				logger.error({ err }, "Export error")
			} else {
				logger.error({ err: String(err) }, "Export error")
			}
			return new NextResponse(JSON.stringify({ status: 500, err: "Internal Server Error" }), {
				status: 500,
			})
		}
	})
