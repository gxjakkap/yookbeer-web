import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { apiKey, thirtyeight } from "@/db/schema"

export async function POST(req: NextRequest) {
    const key = req.headers.get("authorization")
    if (!key) {
        return new NextResponse(
            JSON.stringify({ status: 401, err: 'Missing API Key' }),
            { status: 401 }
        )
    }

    const q = await db
        .select()
        .from(apiKey)
        .where(eq(apiKey.key, key))
        .limit(1)

    if (q.length < 1) {
        return new NextResponse(
            JSON.stringify({ status: 403, err: 'Forbidden' }),
            { status: 403 }
        )
    }

    const body = await req.json()
    const email = body.email
    const id = body.id

    const stdq = await db.select().from(thirtyeight).where(eq(thirtyeight.stdid, id)).limit(1)

    if (stdq.length < 1) return new NextResponse(JSON.stringify({ status: 400, err: "Bad data" }), { status: 400 })

    const std = stdq[0]

    if (std.emailuni !== email) await db.update(thirtyeight).set({ emailuni: email }).where(eq(thirtyeight.stdid, std.stdid))

    return new NextResponse(JSON.stringify({ status: 200 }), { status: 200 })
}