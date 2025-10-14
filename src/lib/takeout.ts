"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { StudentStatus, TAKEOUT_EXPORTABLE } from "@/lib/const"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { stringify } from "csv-stringify/sync"
import { sql, eq } from "drizzle-orm"

interface TakeoutArgs {
  onlyAttending?: boolean
  including: (typeof TAKEOUT_EXPORTABLE)[number][]
  format?: "csv" | "json"
  includedCourse?: number[]
  createdBy: string
  mode: "plain" | "s3"
}

interface BaseTakeoutResponse {
  mode: "plain" | "s3"
}

interface PlainTakeoutResponse extends BaseTakeoutResponse {
  mode: "plain"
  data: string
  filename: string
  contentType: string
}

interface S3TakeoutResponse extends BaseTakeoutResponse {
  mode: "s3"
  url: string
}

type TakeoutResponse = PlainTakeoutResponse | S3TakeoutResponse

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNTID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESSKEYID || "",
    secretAccessKey: process.env.R2_SECRET || "",
  },
})

export async function takeout({
  onlyAttending = true,
  including,
  format = "csv",
  includedCourse = [0, 1, 2, 3],
  createdBy,
  mode,
}: TakeoutArgs): Promise<TakeoutResponse> {
  const [u] = await db.select().from(users).where(eq(users.id, createdBy)).limit(1)

  if (!u || u.id === null || u.name === null) {
    throw new Error("TAKEOUT: User not found of invalid user")
  }

  const q = sql`
        SELECT ${sql.raw(including.join(", "))}
        FROM thirtyeight
        WHERE course IN (${sql.join(includedCourse, sql.raw(", "))})
        ${onlyAttending ? sql`AND status = ${StudentStatus.ATTENDING}` : sql``}
        ORDER BY stdid ASC
    `
  const data = await db.execute(q)

  const stringifiedData = format === "csv" ? stringify(data, { header: true }) : JSON.stringify(data)

  const timestamp = new Date().toISOString().replace(/:/g, "-")
  const filename = `yb-export-${u.name.replace(" ", "_")}-${timestamp}.${format === "csv" ? "csv" : "json"}`
  const contentType = format === "csv" ? "text/csv" : "application/json"

  if (mode === "s3") {
    const putRes = await S3.send(
      new PutObjectCommand({
        Bucket: "yookbeer",
        Key: `takeout/${filename}`,
        Body: stringifiedData,
        ContentEncoding: "utf-8",
        ContentType: contentType,
      })
    )

    if (putRes.$metadata.httpStatusCode !== 200) {
      throw new Error("TAKEOUT_ACT: Failed to upload file to S3")
    }

    const url = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: "yookbeer",
        Key: `takeout/${filename}`,
      }),
      { expiresIn: 3600 }
    )

    return {
      mode: "s3",
      url,
    }
  } else {
    return {
      mode: "plain",
      data: stringifiedData,
      filename,
      contentType,
    }
  }
}
