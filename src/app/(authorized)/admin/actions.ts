"use server"

import { YookbeerColumn } from "@/components/yookbeer-table"
import { YookbeerUserColumn } from "@/components/admin-users-table"
import { thirtyeight, users } from "@/db/schema"
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