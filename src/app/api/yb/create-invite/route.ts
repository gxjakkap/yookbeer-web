import { NextRequest, NextResponse } from "next/server"
import { createZodRoute } from 'next-zod-route';
import { z } from 'zod';
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { apiKey, invite } from "@/db/schema"
import { generateRandomString } from "@/lib/utils";

const bodySchema = z.object({
    code: z.string().min(4).optional(),
    rnd: z.boolean()
});

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
        const rnd = ctx.body.rnd
        let code = ctx.body.code

        if (rnd){
            code = generateRandomString(10)
        }

        if (!code){
            return new NextResponse(
                JSON.stringify({ status: 400, err: 'Code Not Specified' }),
                { status: 400 }
            )
        }

        const insRes = await db.insert(invite).values({ code: code, createdBy: apiQ[0].owner }).onConflictDoNothing({ target: invite.code }).returning()
        
        if (insRes.length < 1){
            if (rnd){
                return new NextResponse(
                    JSON.stringify({ status: 500, err: 'Random Value Collision. Try again.' }),
                    { status: 500 }
                )
            }
            return new NextResponse(
                JSON.stringify({ status: 400, err: `Code ${code} already existed!` }),
                { status: 400 }
            )
        }

        return new NextResponse(JSON.stringify({ status: 201, code: code }), { status: 201 })
    })
  