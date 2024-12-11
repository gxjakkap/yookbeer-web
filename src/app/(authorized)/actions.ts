'use server'

import { auth } from "@/auth"
import { searchThirtyeight } from "@/lib/search"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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
    if (!session || !['admin', 'user'].includes(session.user.role!)) return ''
    const url = await getSignedUrl(
        S3,
        new GetObjectCommand({ Bucket: "yookbeer", Key: `${imgName}` }),
        { expiresIn: 3600 },
    )
    return url
}


export async function nSearch(q: string){
    if (!q.trim()) return []
    const results = await searchThirtyeight(q)
    return results
}