"use server"

import { YookbeerColumn } from "@/components/admin-table"
import { YookbeerUserColumn } from "@/components/admin-users-table"
import { thirtyeight, users } from "@/db/schema"
import { db } from "@/db"
import { eq } from "drizzle-orm"

export const updateStudent = async(id: string, data: Partial<YookbeerColumn>) => {
    await db.update(thirtyeight).set(data).where(eq(thirtyeight.stdid, id))
}

export const deleteStudent = async(id: string) => {
    await db.delete(thirtyeight).where(eq(thirtyeight.stdid, id))
}

export const updateUser = async(id: string, data: Partial<YookbeerUserColumn>) => {
    await db.update(users).set(data).where(eq(users.id, id))
}

export const deleteUser = async(id: string) => {
    await db.delete(users).where(eq(users.id, id))
}