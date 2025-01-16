"use server"

import { YookbeerColumn } from "@/components/yookbeer-table"
import { YookbeerUserColumn } from "@/components/admin-users-table"
import { apiKey, thirtyeight, users } from "@/db/schema"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"

export const updateStudent = async(id: string, data: Partial<YookbeerColumn>) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin') return
    await db.update(thirtyeight).set(data).where(eq(thirtyeight.stdid, id))
}

export const deleteStudent = async(id: string) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin') return
    await db.delete(thirtyeight).where(eq(thirtyeight.stdid, id))
}

export const updateUser = async(id: string, data: Partial<YookbeerUserColumn>) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin') return
    await db.update(users).set(data).where(eq(users.id, id))
}

export const deleteUser = async(id: string) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin') return
    await db.delete(users).where(eq(users.id, id))
}

export const addAPIKey = async(name: string, expiresAt: Date | null) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin' || !session.user.id) return
    const key = crypto.randomUUID()
    const data = { key: key, expiresAt: expiresAt, owner: session.user.id, name: name }
    console.log(data)
    await db.insert(apiKey).values(data)
    return key
}

export const deleteAPIKey = async(id: number) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin' || !session.user.id) return
    await db.delete(apiKey).where(eq(apiKey.id, id))
}

type APIKeyData = typeof apiKey.$inferSelect

export const editAPIKey = async(id: number, data: Partial<APIKeyData>) => {
    const session = await auth()
    if (!session || session.user.role !== 'admin' || !session.user.id) return
    await db.update(apiKey).set(data).where(eq(apiKey.id, id))
}

