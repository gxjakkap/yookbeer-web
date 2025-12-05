import { db } from "@/db"
import { logs } from "@/db/schema"
import pino from "pino"

export enum LogAction {
	CREATE_NEW_STD = "create_new_std",
	EDIT_STD = "edit_std",
	EDIT_USER = "edit_usr",
	DELETE_STD = "delete_std",
	DELETE_USER = "delete_usr",
	CREATE_NEW_INVITE = "create_new_invite",
	CLAIM_INVITE = "claim_invite",
	DELETE_INVITE = "delete_invite",
	CREATE_API_KEY = "create_api_key",
	DELETE_API_KEY = "delete_api_key",
	EDIT_API_KEY = "edit_api_key",
	TAKEOUT = "takeout",
	LOGIN = "login",
}

interface LogArgs {
	action: LogAction
	actor: string
	target?: string
	details?: string
	timestamp?: Date
}

export const logger = pino({
	level: "info",
	transport: {
		target: "./vector-transport.js",
	},
})

export async function actionLog(args: LogArgs) {
	const { action, actor, target, details, timestamp = new Date() } = args

	await db
		.insert(logs)
		.values({
			action,
			actor,
			target: target || null,
			details: details || null,
			timestamp,
		})
		.onConflictDoNothing({
			target: logs.action,
		})
		.returning()
		.catch((err) => {
			console.error("Log Error:", err)
			throw new Error("Failed to log action")
		})

	logger.info(
		`[${action}] [${timestamp.toISOString()}] Actor: ${actor}${target ? `, Target: ${target}` : ""}${details ? `, Details: ${details}` : ""}`
	)
}
