"use server"

import { eq, sql } from "drizzle-orm"
import { auth } from "@/auth"
import { db } from "@/db"
import { invite, users } from "@/db/schema"
import { InviteStatus } from "@/lib/const"
import { actionLog, LogAction } from "@/lib/log"
import { Roles } from "@/lib/rba"

import { RedeemInviteCodeStatus } from "./types"

export const redeemInviteCode = async (code: string) => {
	const session = await auth()

	if (!session?.user.id)
		return {
			status: RedeemInviteCodeStatus.UNAUTHORIZED,
			code: code,
		}

	const [res] = await db.select().from(invite).where(eq(invite.code, code)).limit(1)

	if (!res) {
		void actionLog({
			action: LogAction.CLAIM_INVITE_FAILED,
			actor: session.user.id,
			details: JSON.stringify({
				code: code,
				valid: false,
				status: "invalid invite code",
				usedBy: session.user.id,
				claimedDate: new Date(),
			}),
		})

		return {
			status: RedeemInviteCodeStatus.INVALID,
			code: code,
		}
	}

	if (res.status === InviteStatus.CLAIMED) {
		void actionLog({
			action: LogAction.CLAIM_INVITE_FAILED,
			actor: session.user.id,
			details: JSON.stringify({
				code: code,
				valid: false,
				status: "invite code already used",
				usedBy: session.user.id,
				claimedDate: new Date(),
			}),
		})

		return {
			status: RedeemInviteCodeStatus.USED,
			code: code,
		}
	}

	const [uRes] = await db
		.select({ id: users.id, role: users.role, email: users.email })
		.from(users)
		.where(eq(users.id, session.user.id))
		.limit(1)

	if (uRes.role !== Roles.UNAUTHORIZED) {
		return {
			status: RedeemInviteCodeStatus.UNNECESSARY,
			code: code,
		}
	}

	await db.update(users).set({ role: Roles.USER }).where(eq(users.id, uRes.id))
	await db
		.update(invite)
		.set({ status: InviteStatus.CLAIMED, usedBy: uRes.id, claimDate: sql`NOW()` })
		.where(eq(invite.id, res.id))

	void actionLog({
		action: LogAction.CLAIM_INVITE,
		actor: uRes.id,
		details: JSON.stringify({
			code: code,
			valid: true,
			status: "success",
			usedBy: uRes.id,
			claimedDate: new Date(),
		}),
	})

	return {
		status: RedeemInviteCodeStatus.OK,
		code: code,
	}
}
