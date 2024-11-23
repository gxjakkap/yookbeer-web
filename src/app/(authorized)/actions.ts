'use server'

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
    const url = await getSignedUrl(
        S3,
        new GetObjectCommand({ Bucket: "yookbeer", Key: `${imgName}` }),
        { expiresIn: 3600 },
    )
    return url
}