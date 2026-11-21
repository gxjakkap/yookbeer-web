"use server"

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@/db"
import { reports } from "@/db/schema"
import { StudentStatus } from "@/lib/const"
import { ForbiddenError } from "@/lib/errors"
import { isAuthorized, Roles } from "@/lib/rba"
import { reportSchema } from "@/lib/report"
import { searchStudents } from "@/lib/search"
import { authedProcedure } from "@/lib/server-actions"

const S3 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNTID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESSKEYID || "",
		secretAccessKey: process.env.R2_SECRET || "",
	},
})

export async function getPresignedURLForYookbeerPic(imgName: string) {
	const session = await auth()
	if (!session || !isAuthorized(session.user.role || Roles.UNAUTHORIZED)) return ""
	const url = await getSignedUrl(S3, new GetObjectCommand({ Bucket: "yookbeer", Key: `${imgName}` }), {
		expiresIn: 3600,
	})
	return url
}

export async function nSearch(q: string) {
	if (!q.trim()) return []
	const results = await searchStudents(q)
	return results.filter((v) => v.status === StudentStatus.ATTENDING)
}

export const createReport = authedProcedure
	.createServerAction()
	.input(reportSchema)
	.handler(async ({ input, ctx }) => {
		if (!isAuthorized(ctx.session.user.role || Roles.UNAUTHORIZED)) throw new ForbiddenError()
		await db.insert(reports).values({ ...input, reporter: ctx.session.user.id })
		revalidatePath("/admin/reports")
	})
