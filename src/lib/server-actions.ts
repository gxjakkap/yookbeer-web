import { createServerActionProcedure } from "zsa"

import { auth } from "@/auth"
import { Roles } from "./const"
import { AuthenticationError, ForbiddenError, PublicError } from "./errors";


/**
 * Shamelessly borrowed from gxjakkap/cc36staffapp
 * 
 * Original author: beambeambeam
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shapeErrors({ err }: any) {
    const isAllowedError = err instanceof PublicError;
    const isDev = process.env.NODE_ENV === "development";
    if (isAllowedError || isDev) {
        console.error(err)
        return {
            code: err.code ?? "ERROR",
            message: `${!isAllowedError && isDev ? "[DEV] " : ""}${
                err.message
            }`,
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
            session
        }
    })

export const adminProcedure = createServerActionProcedure(authedProcedure)
    .experimental_shapeError(shapeErrors)
    .handler(async ({ ctx }) => {
        const isAdmin = (ctx.session?.user.role === Roles.ADMIN)

        if (!isAdmin) throw new ForbiddenError()

        return {
            session: ctx.session
        }
    })