import { auth } from "@/auth"
import { createServerActionProcedure } from "zsa"

import { AuthenticationError, ForbiddenError, PublicError } from "./errors"
import { logger } from "./log"
import { isAdmin, isSuperAdmin, Roles } from "./rba"

/**
 * Shamelessly borrowed from gxjakkap/cc36staffapp
 *
 * Original author: beambeambeam
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shapeErrors({ err }: any) {
	const isAllowedError = err instanceof PublicError
	const isDev = process.env.NODE_ENV === "development"
	if (isAllowedError || isDev) {
		if (err instanceof Error) {
			logger.error({ err })
		} else {
			logger.error({ err: String(err) })
		}
		return {
			code: err.code ?? "ERROR",
			message: `${!isAllowedError && isDev ? "[DEV] " : ""}${err.message}`,
		}
	} else {
		return {
			code: "ERROR",
			message: "Something went wrong",
		}
	}
}

export const authedProcedure = createServerActionProcedure()
	.experimental_shapeError(shapeErrors)
	.handler(async () => {
		const session = await auth()

		if (!session) throw new AuthenticationError()

		return {
			session,
		}
	})

export const adminProcedure = createServerActionProcedure(authedProcedure)
	.experimental_shapeError(shapeErrors)
	.handler(async ({ ctx }) => {
		if (!ctx.session.user.role || !isAdmin(ctx.session.user.role)) throw new ForbiddenError()

		return {
			session: ctx.session,
		}
	})

export const superAdminProcedure = createServerActionProcedure(authedProcedure)
	.experimental_shapeError(shapeErrors)
	.handler(async ({ ctx }) => {
		if (!ctx.session.user.role || !isSuperAdmin(ctx.session.user.role)) throw new ForbiddenError()

		return {
			session: ctx.session,
		}
	})
