/* eslint-disable @next/next/no-img-element */
import { FacebookIcon } from "@/components/svg/socials/fb"
import { InstagramIcon } from "@/components/svg/socials/ig"
import { LineIcon } from "@/components/svg/socials/line"
import { Badge } from "@/components/ui/badge"
import { db } from "@/db"
import { thirtyeight } from "@/db/schema"
import { COURSE_PRETTYNAME, StudentStatus } from "@/lib/const"
import { eq } from "drizzle-orm"
import { Prompt } from "next/font/google"
import { notFound } from "next/navigation"

import { getPresignedURLForYookbeerPic } from "../../actions"

interface Props {
  params: Promise<{ id: string }>
}

const promptReg = Prompt({
  weight: "400",
  subsets: ["latin", "thai"],
})

const promptMed = Prompt({
  weight: "500",
  subsets: ["latin", "thai"],
})

const promptBold = Prompt({
  weight: "700",
  subsets: ["latin", "thai"],
})

export default async function StudentProfilePage({ params }: Props) {
  const { id } = await params
  const dataArr = await db.select().from(thirtyeight).where(eq(thirtyeight.stdid, id)).limit(1)
  if (dataArr.length < 1) {
    notFound()
  }
  const data = dataArr[0]
  const imgUrl = await getPresignedURLForYookbeerPic(`38/${data.img}` || "")
  const status = data.status
  return (
    <div className={`${promptReg.className} mx-auto flex flex-col gap-y-3 pb-14`}>
      <div className="flex flex-col text-center lg:gap-y-1 lg:text-left">
        <h1 className={`${promptMed.className} text-[1.875rem] text-foreground lg:text-4xl`}>
          {data.nameen}
        </h1>
        <div className="flex flex-col lg:flex-row lg:gap-x-4">
          <p className="text-lg text-foreground/75 lg:text-xl">
            <span className={`${status !== StudentStatus.ATTENDING ? "line-through" : ""}`}>
              {data.stdid}
            </span>{" "}
            - {data.nicken}
          </p>
          {status === StudentStatus.RESIGNED && <Badge variant="destructive">Resigned</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-x-20 lg:flex-row">
        <div className="mx-auto lg:mx-0">
          <img
            className="max-h-[450px] max-w-[500px] rounded-md"
            src={imgUrl}
            alt={`${data.nicken}'s portrait`}
          />
        </div>
        <div className="mt-4 flex flex-col gap-y-8 text-center lg:mt-0 lg:text-left">
          <div className="flex flex-col">
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Course: </span>
              {COURSE_PRETTYNAME[data.course]}
            </p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Thai name: </span>
              {data.nameth} ({data.nickth})
            </p>
          </div>
          <div className="flex flex-col">
            <p className={`${promptBold.className} text-xl text-foreground`}>Contact Info📱</p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Phone: </span>
              {data.phone}
            </p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Email: </span>
              <a href={`mailto:${data.emailuni}`} className="hover:text-blue-500 hover:underline">
                {data.emailuni?.toLowerCase()}
              </a>
            </p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Personal Email: </span>
              <a href={`mailto:${data.emailper}`} className="hover:text-blue-500 hover:underline">
                {data.emailper?.toLowerCase()}
              </a>
            </p>
            {data.discord ? (
              <p className={`${promptReg.className} text-xl text-foreground`}>
                <span className={`${promptMed.className}`}>Discord: </span>
                {data.discord}
              </p>
            ) : (
              <></>
            )}
          </div>
          <div className="mx-auto flex flex-col lg:mx-0">
            <p className={`${promptBold.className} text-xl text-foreground`}>Socials</p>
            <div className="mt-3 flex gap-x-6">
              {data.lineid ? (
                <a
                  href={`https://line.me/R/ti/p/~${data.lineid}`}
                  className="h-10 w-10 text-neutral-400 hover:text-[#06c755] dark:text-foreground dark:hover:text-[#06c755]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LineIcon className="h-12 w-12" />
                </a>
              ) : (
                <></>
              )}
              {data.instagram ? (
                <a
                  href={`https://instagram.com/${data.instagram}`}
                  className="h-10 w-10 text-neutral-400 hover:text-[#d80055] dark:text-foreground dark:hover:text-[#d80055]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon className="h-12 w-12" />
                </a>
              ) : (
                <></>
              )}
              {data.facebook ? (
                <a
                  href={`https://www.facebook.com/search/top/?q=${encodeURIComponent(data.facebook)}`}
                  className="h-10 w-10 text-neutral-400 hover:text-[#0865fe] dark:text-foreground dark:hover:text-[#0865fe]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon className="h-12 w-12" />
                </a>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <p className={`${promptBold.className} text-xl text-foreground`}>Emergency Contact🆘</p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Phone: </span>
              {data.emerphone}
            </p>
            <p className={`${promptReg.className} text-xl text-foreground`}>
              <span className={`${promptMed.className}`}>Relation: </span>
              {data.emerrelation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
