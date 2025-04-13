import { apiKey } from "@/db/schema";

export interface CreateInviteProps {
    code?: string;
}export enum CreateInviteStatus {
    "OK" = 0,
    "DUPLICATE" = 1,
    "FORBIDDEN" = 2,
    "FAILED" = 3
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

