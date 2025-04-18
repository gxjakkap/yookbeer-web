import { apiKey } from "@/db/schema"
import { Roles } from "@/lib/const"
import z from "zod"

export interface CreateInviteProps {
    code?: string;
}

export enum CreateInviteStatus {
    "OK" = 0,
    "DUPLICATE" = 1,
    "FORBIDDEN" = 2,
    "FAILED" = 3,
    "TOO_SHORT" = 4
}

export interface CreateInviteRes {
    status: CreateInviteStatus
    code: string | null
}

export type APIKeyData = typeof apiKey.$inferSelect

export enum DeleteInviteStatus {
    "OK" = 0,
    "FORBIDDEN" = 1,
    "FAILED" = 2
}
export const zodYookbeerColumn = z.object({
    stdid: z.string(),
    course: z.number(),
    nameth: z.string().nullable(),
    nameen: z.string(),
    nickth: z.string().nullable(),
    nicken: z.string(),
    phone: z.string(),
    emailper: z.string().nullable(),
    emailuni: z.string().nullable(),
    emerphone: z.string().nullable(),
    facebook: z.string().nullable(),
    lineid: z.string().nullable(),
    instagram: z.string().nullable(),
    discord: z.string().nullable(),
    img: z.string().nullable(),
})

export const zodYookbeerUserColumn = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    role: z.enum([Roles.UNAUTHORIZED, Roles.USER, Roles.ADMIN]).nullable(),
})

export const zodAPIKeyColumn = z.object({
    name: z.string(),
    id: z.number(),
    expiresAt: z.date().nullable(),
    key: z.string(),
    owner: z.string()
})

