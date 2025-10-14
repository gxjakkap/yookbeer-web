"use server"

import { auth } from "@/auth"
import { RedeemInviteCodeStatus } from "./types"
import { db } from "@/db"
import { invite, users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { InviteStatus } from "@/lib/const"
import { Roles } from "@/lib/rba"

export const redeemInviteCode = async(code: string) => {
    const session = await auth()

    if (!session || !session.user.id) return {
        status: RedeemInviteCodeStatus.UNAUTHORIZED,
        code: code
    }

    const [res] = await db.select().from(invite).where(eq(invite.code, code)).limit(1)

    if (!res) {
        return {
            status: RedeemInviteCodeStatus.INVALID,
            code: code
        }
    }

    if (res.status === InviteStatus.CLAIMED){
        return {
            status: RedeemInviteCodeStatus.USED,
            code: code
        }
    }

    const [uRes] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1)

    if (uRes.role !== Roles.UNAUTHORIZED){
        return {
            status: RedeemInviteCodeStatus.UNNECESSARY,
            code: code
        }
    }

    await db.update(users).set({ role: Roles.USER }).where(eq(users.id, uRes.id))
    await db.update(invite).set({ status: InviteStatus.CLAIMED, usedBy: uRes.id, claimDate: sql`NOW()` }).where(eq(invite.id, res.id))

    return {
        status: RedeemInviteCodeStatus.OK,
        code: code
    }

}