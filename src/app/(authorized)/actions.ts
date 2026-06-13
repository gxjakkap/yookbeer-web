"use server"

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@/auth"
import { StudentStatus } from "@/lib/const"
import { isAuthorized, Roles } from "@/lib/rba"
import { searchStudents } from "@/lib/search"

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
