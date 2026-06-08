"use server"

import {
	CreateInviteProps,
	CreateInviteRes,
	CreateInviteStatus,
	DeleteInviteStatus,
	zodAPIKeyColumn,
	zodYookbeerColumn,
	zodYookbeerUserColumn,
} from "@/app/(authorized)/admin/types"
import { auth } from "@/auth"
import { db } from "@/db"
import { apiKey, invite, students, thirtyeight, users } from "@/db/schema"
import { TAKEOUT_EXPORTABLE } from "@/lib/const"
import { AuthenticationError, ForbiddenError } from "@/lib/errors"
import { actionLog, LogAction } from "@/lib/log"
import { isAdmin, isSuperAdmin } from "@/lib/rba"
import { adminProcedure, superAdminProcedure } from "@/lib/server-actions"
import { takeout } from "@/lib/takeout"
import { generateRandomString } from "@/lib/utils"
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { eq } from "drizzle-orm"
import z from "zod"

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "webp", "png"] as const
const R2_BUCKET = "yookbeer"

const imageS3 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNTID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESSKEYID || "",
		secretAccessKey: process.env.R2_SECRET || "",
	},
})

export const updateStudent = adminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
			data: zodYookbeerColumn.partial(),
		})
	)
	.handler(async ({ input, ctx }) => {
		await db.update(students).set(input.data).where(eq(students.stdid, input.id))
		void actionLog({
			action: LogAction.EDIT_STD,
			actor: ctx.session.user.id || "",
			target: input.id,
			details: `new data: ${JSON.stringify(input)}`,
		})
	})

// replace student image on r2
export const updateStudentImage = adminProcedure
	.createServerAction()
	.input(
		z.object({
			stdid: z.string(),
			gen: z.number(),
			currentImg: z.string().nullable(),
			newExtension: z.enum(["jpg", "jpeg", "webp", "png"]),
			fileBytes: z.instanceof(Uint8Array),
		})
	)
	.handler(async ({ input, ctx }) => {
		const { stdid, gen, currentImg, newExtension, fileBytes } = input

		// validate extension
		if (!ALLOWED_IMAGE_EXTENSIONS.includes(newExtension as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
			throw new Error(
				`UPDATESTDIMG: Unsupported image extension "${newExtension}". Allowed: jpg, jpeg, webp, png.`
			)
		}

		const newFilename = `${stdid}.${newExtension}`
		const newKey = `${gen}/${newFilename}`
		const contentTypeMap: Record<string, string> = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			webp: "image/webp",
			png: "image/png",
		}
		const contentType = contentTypeMap[newExtension]

		// upload new image
		const putRes = await imageS3.send(
			new PutObjectCommand({
				Bucket: R2_BUCKET,
				Key: newKey,
				Body: fileBytes,
				ContentType: contentType,
			})
		)

		if (putRes.$metadata.httpStatusCode !== 200) {
			throw new Error(
				`UPDATESTDIMG: Failed to upload new image to R2 (HTTP ${putRes.$metadata.httpStatusCode})`
			)
		}

		// delete old image from r2 if it exists and differs from the new key
		if (currentImg && currentImg !== newFilename) {
			const oldKey = `${gen}/${currentImg}`
			await imageS3
				.send(
					new DeleteObjectCommand({
						Bucket: R2_BUCKET,
						Key: oldKey,
					})
				)
				.catch((err) => {
					console.warn(`UPDATESTDIMG: Could not delete old image "${oldKey}":`, err)
				})
		}

		// update DB only if the filename value changed
		if (currentImg !== newFilename) {
			await db.update(students).set({ img: newFilename }).where(eq(students.stdid, stdid))
		}

		void actionLog({
			action: LogAction.EDIT_STD,
			actor: ctx.session.user.id || "",
			target: stdid,
			details: `image updated: ${currentImg ?? "(none)"} → ${newFilename}`,
		})

		return newFilename
	})

export const deleteStudent = superAdminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
		})
	)
	.handler(async ({ input, ctx }) => {
		await db.delete(students).where(eq(students.stdid, input.id))
		void actionLog({
			action: LogAction.DELETE_STD,
			actor: ctx.session.user.id || "",
			target: input.id,
		})
	})

export const updateUser = adminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
			data: zodYookbeerUserColumn.partial(),
		})
	)
	.handler(async ({ ctx, input }) => {
		const [target] = await db.select().from(users).where(eq(users.id, input.id)).limit(1)
		if (!target) throw new Error(`UPDATEUSR_ACT: Target of id ${input.id} not found.`)
		if (isAdmin(target.role!) && !isSuperAdmin(ctx.session.user.role!)) throw new ForbiddenError()
		await db.update(users).set(input.data).where(eq(users.id, input.id))
		void actionLog({
			action: LogAction.EDIT_USER,
			actor: ctx.session.user.id || "",
			target: target.email,
			details: `existing data: ${JSON.stringify(target)}, new data: ${JSON.stringify(input)}`,
		})
	})

export const deleteUser = adminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
		})
	)
	.handler(async ({ ctx, input }) => {
		const [target] = await db.select().from(users).where(eq(users.id, input.id)).limit(1)
		if (!target) throw new Error(`DELETEUSR_ACT: Target of id ${input.id} not found.`)
		if (isAdmin(target.role!) && !isSuperAdmin(ctx.session.user.role!)) throw new ForbiddenError()
		await db.delete(users).where(eq(users.id, input.id))
		void actionLog({
			action: LogAction.DELETE_USER,
			actor: ctx.session.user.id || "",
			target: target.email,
		})
	})

export const addAPIKey = adminProcedure
	.createServerAction()
	.input(
		z.object({
			name: z.string(),
			expiresAt: z.date().nullable(),
		})
	)
	.handler(async ({ input, ctx }) => {
		if (!ctx.session.user.id) throw new AuthenticationError()
		const key = crypto.randomUUID()
		const data = { key: key, expiresAt: input.expiresAt, owner: ctx.session.user.id, name: input.name }
		await db.insert(apiKey).values(data)
		void actionLog({
			action: LogAction.CREATE_API_KEY,
			actor: ctx.session.user.id || "",
			details: `key: ${key}`,
		})
		return key
	})

export const deleteAPIKey = adminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.number(),
		})
	)
	.handler(async ({ ctx, input }) => {
		const [targetKey] = await db.select().from(apiKey).where(eq(apiKey.id, input.id)).limit(1)
		if (!targetKey) throw new Error(`DELETEPIKEY_ACT: Target API key with id ${input.id} not found.`)
		if (targetKey.owner !== ctx.session.user.id && !isSuperAdmin(ctx.session.user.id!))
			throw new ForbiddenError()
		await db.delete(apiKey).where(eq(apiKey.id, input.id))
		void actionLog({
			action: LogAction.DELETE_API_KEY,
			actor: ctx.session.user.id || "",
			target: targetKey.key,
			details: `deleted key ${targetKey.key} owned by ${targetKey.owner}`,
		})
	})

export const editAPIKey = adminProcedure
	.createServerAction()
	.input(
		z.object({
			id: z.number(),
			data: zodAPIKeyColumn.partial(),
		})
	)
	.handler(async ({ ctx, input }) => {
		const [targetKey] = await db.select().from(apiKey).where(eq(apiKey.id, input.id)).limit(1)
		if (!targetKey) throw new Error(`EDITAPIKEY_ACT: Target API key with id ${input.id} not found.`)
		if (targetKey.owner !== ctx.session.user.id && !isSuperAdmin(ctx.session.user.id!))
			throw new ForbiddenError()
		await db.update(apiKey).set(input.data).where(eq(apiKey.id, input.id))
		void actionLog({
			action: LogAction.EDIT_API_KEY,
			actor: ctx.session.user.id || "",
			target: targetKey.key,
			details: `new data: ${JSON.stringify(input)}`,
		})
	})

export const createInviteCode = async (props: CreateInviteProps): Promise<CreateInviteRes> => {
	try {
		let code = props.code || null
		let randomGen = false

		const session = await auth()
		if (!session || !isAdmin(session.user.role!) || !session.user.id) {
			return {
				status: CreateInviteStatus.FORBIDDEN,
				code: null,
			}
		}

		if (!code) {
			code = generateRandomString(10)
			randomGen = true
		}

		const res = await db
			.insert(invite)
			.values({ code: code, createdBy: session.user.id })
			.onConflictDoNothing({ target: invite.code })
			.returning()

		if (res.length < 1) {
			if (randomGen) {
				return createInviteCode(props)
			}
			return {
				status: CreateInviteStatus.DUPLICATE,
				code: null,
			}
		}

		void actionLog({
			action: LogAction.CREATE_NEW_INVITE,
			actor: session.user.id || "",
			details: `created invite ${res[0].code}`,
		})

		return {
			status: CreateInviteStatus.OK,
			code: code,
		}
	} catch (err) {
		console.error(err)
		return {
			status: CreateInviteStatus.FAILED,
			code: null,
		}
	}
}

export const deleteInviteCode = async (code: string) => {
	const session = await auth()
	if (!session || !isAdmin(session.user.role || "user") || !session.user.id) {
		return {
			status: DeleteInviteStatus.FORBIDDEN,
		}
	}

	const [res] = await db.delete(invite).where(eq(invite.code, code)).returning()

	if (!res) {
		return {
			status: DeleteInviteStatus.FAILED,
		}
	}

	void actionLog({
		action: LogAction.DELETE_INVITE,
		actor: session.user.id || "",
		details: `removed invite ${code}`,
	})

	return {
		status: DeleteInviteStatus.OK,
	}
}

export const takeoutAction = adminProcedure
	.createServerAction()
	.input(
		z.object({
			onlyAttending: z.boolean().optional().default(true),
			including: z.array(
				z
					.string()
					.refine(
						async (val) =>
							TAKEOUT_EXPORTABLE.includes(val as (typeof TAKEOUT_EXPORTABLE)[number]),
						{
							message: "Invalid field included in export",
						}
					)
			),
			format: z.enum(["csv", "json"]).default("csv"),
			includedCourse: z.array(z.number()).optional().default([0, 1, 2, 3]),
			includedGen: z.array(z.number()).default([38]),
		})
	)
	.handler(async ({ input, ctx }) => {
		if (!ctx.session.user.id) {
			throw new AuthenticationError()
		}

		const { onlyAttending, including, format, includedCourse, includedGen } = input

		const inc = including.map((field) => {
			if (!TAKEOUT_EXPORTABLE.includes(field as (typeof TAKEOUT_EXPORTABLE)[number])) {
				throw new Error(`TAKEOUT_ACT: Invalid field included in export: ${field}`)
			}
			return field as (typeof TAKEOUT_EXPORTABLE)[number]
		}) as (typeof TAKEOUT_EXPORTABLE)[number][]

		const res = await takeout({
			onlyAttending,
			including: inc,
			format,
			includedCourse,
			includedGen,
			createdBy: ctx.session.user.id,
			mode: "s3",
		})

		actionLog({
			action: LogAction.TAKEOUT,
			actor: ctx.session.user.id || "",
			details: JSON.stringify({
				onlyAttending,
				including,
				format,
				includedCourse,
				includedGen,
				createdBy: ctx.session.user.id || "",
				mode: "s3",
			}),
		})

		if (res.mode === "plain")
			throw new Error("TAKEOUT_ACT: invalid mode returned from takeout function, expected 's3'")

		return res.url
	})
