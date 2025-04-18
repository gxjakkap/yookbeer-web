import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { apiKey, thirtyeight } from "@/db/schema"
import { createZodRoute } from "next-zod-route"

const bodySchema = z.object({
    email: z.string().email(),
    id: z.string()
})

export const POST = createZodRoute()
    .body(bodySchema)
    .handler(async(r, ctx) => {
        const key = r.headers.get("Authorization")

        if (!key) {
            return new NextResponse(
                JSON.stringify({ status: 401, err: 'Missing API Key' }),
                { status: 401 }
            )
        }

        const apiQ = await db
            .select()
            .from(apiKey)
            .where(eq(apiKey.key, key))
            .limit(1)

        if (apiQ.length < 1) {
            return new NextResponse(
                JSON.stringify({ status: 403, err: 'Forbidden' }),
                { status: 403 }
            )
        }

        const { email, id } = ctx.body

        const stdq = await db.select().from(thirtyeight).where(eq(thirtyeight.stdid, id)).limit(1)

        if (stdq.length < 1) return new NextResponse(JSON.stringify({ status: 400, err: "Bad data" }), { status: 400 })

        const std = stdq[0]

        if (std.emailuni !== email) await db.update(thirtyeight).set({ emailuni: email }).where(eq(thirtyeight.stdid, std.stdid))
    
        return new NextResponse(JSON.stringify({ status: 200 }), { status: 200 })
    })