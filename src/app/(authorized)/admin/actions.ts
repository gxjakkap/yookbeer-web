"use server"

import { eq } from "drizzle-orm"
import z from "zod"

import { apiKey, invite, thirtyeight, users } from "@/db/schema"
import { generateRandomString } from "@/lib/utils"
import { adminProcedure } from "@/lib/server-actions"
import { auth } from "@/auth"
import { db } from "@/db"

import { CreateInviteProps, CreateInviteRes, CreateInviteStatus, DeleteInviteStatus, zodAPIKeyColumn, zodYookbeerColumn, zodYookbeerUserColumn } from "@/app/(authorized)/admin/types"
import { AuthenticationError } from "@/lib/errors"

export const updateStudent = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string(),
        data: zodYookbeerColumn.partial()
    }))
    .handler(async({ input }) => {
        await db.update(thirtyeight).set(input.data).where(eq(thirtyeight.stdid, input.id))
    })

export const deleteStudent = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string()
    }))
    .handler(async({ input }) => {
        await db.delete(thirtyeight).where(eq(thirtyeight.stdid, input.id))
    })

export const updateUser = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string(),
        data: zodYookbeerUserColumn.partial()
    }))
    .handler(async({ input }) => {
        await db.update(users).set(input.data).where(eq(users.id, input.id))
    })

export const deleteUser = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string()
    }))
    .handler(async({ input }) => {
        await db.delete(users).where(eq(users.id, input.id))
    })

export const addAPIKey = adminProcedure
    .createServerAction()
    .input(z.object({
        name: z.string(),
        expiresAt: z.date().nullable()
    }))
    .handler(async({ input, ctx }) => {
        if (!ctx.session.user.id) throw new AuthenticationError()
        const key = crypto.randomUUID()
        const data = { key: key, expiresAt: input.expiresAt, owner: ctx.session.user.id, name: input.name }
        await db.insert(apiKey).values(data)
        return key
    })

export const deleteAPIKey = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.number()
    }))
    .handler(async({ input }) => {
        await db.delete(apiKey).where(eq(apiKey.id, input.id))
    })

export const editAPIKey = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.number(),
        data: zodAPIKeyColumn.partial()
    }))
    .handler(async({ input }) => {
        await db.update(apiKey).set(input.data).where(eq(apiKey.id, input.id))
    })

export const createInviteCode = async(props: CreateInviteProps) : Promise<CreateInviteRes> => {
    try {
        let code = props.code || null
        let randomGen = false

        const session = await auth()
        if (!session || session.user.role !== 'admin' || !session.user.id){
            return {
                status: CreateInviteStatus.FORBIDDEN,
                code: null
            }
        }

        if (!code){
            code = generateRandomString(10)
            randomGen = true
        }
        
        const res = await db.insert(invite).values({ code: code, createdBy: session.user.id }).onConflictDoNothing({ target: invite.code }).returning()

        if (res.length < 1){
            if (randomGen) {
                return createInviteCode(props)
            }
            return {
                status: CreateInviteStatus.DUPLICATE,
                code: null
            }
        }

        return {
            status: CreateInviteStatus.OK,
            code: code
        }
    }
    catch (err) {
        console.error(err)
        return {
            status: CreateInviteStatus.FAILED,
            code: null
        }
    }

}

export const deleteInviteCode = async(code: string) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin' || !session.user.id){
        return {
            status: DeleteInviteStatus.FORBIDDEN
        }
    }

    const [res] = await db.delete(invite).where(eq(invite.code, code)).returning()

    if (!res) {
        return {
            status: DeleteInviteStatus.FAILED
        }
    }
    
    return {
        status: DeleteInviteStatus.OK
    }
}
