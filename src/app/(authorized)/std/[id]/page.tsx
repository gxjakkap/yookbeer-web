import { eq } from "drizzle-orm"
import { Noto_Sans_Thai_Looped } from "next/font/google"
import Image from "next/image"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { CopyMenu } from "@/components/copy-menu"
import { StudentEditButton } from "@/components/student-edit-button"
import { FacebookIcon } from "@/components/svg/socials/fb"
import { InstagramIcon } from "@/components/svg/socials/ig"
import { LineIcon } from "@/components/svg/socials/line"
import type { YookbeerColumn } from "@/components/table/yookbeer-table-new"
import { Badge } from "@/components/ui/badge"
import { db } from "@/db"
import { students } from "@/db/schema"
import { birthdayPrettifier } from "@/lib/bd"
import { COURSE_PRETTYNAME, StudentStatus } from "@/lib/const"
import { isAdmin } from "@/lib/rba"
import { cn } from "@/lib/utils"

import { getPresignedURLForYookbeerPic } from "../../actions"

interface Props {
	params: Promise<{ id: string }>
}

const nstl_reg = Noto_Sans_Thai_Looped({
	subsets: ["latin", "thai"],
	weight: "400",
})

export default async function StudentProfilePage({ params }: Props) {
	const { id } = await params
	const [data] = await db.select().from(students).where(eq(students.stdid, id)).limit(1)
	if (!data) notFound()
	const imgUrl = await getPresignedURLForYookbeerPic(`${data.gen}/${data.img}` || "")
	const status = data.status
	const session = await auth()
	const userIsAdmin = isAdmin(session?.user.role || "")

	return (
		<>
		<CopyMenu
			data={{
				stdid: data.stdid,
				nameth: data.nameth,
				nameen: data.nameen,
				phone: data.phone ?? "",
				nicken: data.nicken,
			}}
		/>
		<div className={`mx-auto flex flex-col gap-y-3 pb-14`}>
			<div className="flex flex-col text-center lg:gap-y-1 lg:text-left">
				<div className="flex items-center justify-center gap-3 lg:justify-start">
					<h1 className={`text-[1.875rem] font-medium text-foreground lg:text-4xl`}>
						{data.nameen}
					</h1>
					{userIsAdmin && <StudentEditButton data={data as YookbeerColumn} />}
				</div>
				<div className="flex flex-col lg:flex-row lg:gap-x-4">
					<p className="text-lg text-foreground/75 lg:text-xl">
						<span
							className={cn(
								`${status !== StudentStatus.ATTENDING ? "line-through" : ""}`,
								`font-normal`
							)}
						>
							{data.stdid}
						</span>{" "}
						- {data.nicken}
					</p>
					{status === StudentStatus.RESIGNED && <Badge variant="destructive">Resigned</Badge>}
				</div>
			</div>
			<div className="flex flex-col gap-x-20 lg:flex-row">
				<div className="mx-auto lg:mx-0">
					<Image
						className="rounded-md"
						src={imgUrl}
						alt={`${data.nicken}'s portrait`}
						width={0}
						height={0}
						sizes="(min-width: 1024px) 500px, 90vw"
						style={{ width: "auto", height: "auto", maxWidth: "500px", maxHeight: "450px" }}
					/>
				</div>
				<div className="mt-4 flex flex-col gap-y-8 text-center lg:mt-0 lg:text-left">
					<div className="flex flex-col">
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Course: </span>
							{COURSE_PRETTYNAME[data.course]}
						</p>
						<p className={`text-xl text-foreground`}>
							<span className={`font-medium`}>Thai name: </span>
							<span className={`${nstl_reg.className}`}>
								{data.nameth} ({data.nickth})
							</span>
						</p>
						{data.birthDay && data.birthMonth && (
							<p className={`text-xl font-normal text-foreground`}>
								<span className={`font-medium`}>Date of birth: </span>
								{birthdayPrettifier(data.birthDay, data.birthMonth)}
							</p>
						)}
					</div>
					<div className="flex flex-col">
						<p className={`text-xl font-bold text-foreground`}>Contact Info📱</p>
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Phone: </span>
							{data.phone}
						</p>
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Email: </span>
							<a
								href={`mailto:${data.emailuni}`}
								className="hover:text-blue-500 hover:underline"
							>
								{data.emailuni?.toLowerCase()}
							</a>
						</p>
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Personal Email: </span>
							<a
								href={`mailto:${data.emailper}`}
								className="hover:text-blue-500 hover:underline"
							>
								{data.emailper?.toLowerCase()}
							</a>
						</p>
						{data.discord && (
							<p className={`text-xl font-normal text-foreground`}>
								<span className={`font-medium`}>Discord: </span>
								{data.discord}
							</p>
						)}
					</div>
					<div className="mx-auto flex flex-col lg:mx-0">
						<p className={`text-xl font-bold text-foreground`}>Socials</p>
						<div className="mt-3 flex gap-x-6">
							{data.lineid && (
								<a
									href={`https://line.me/R/ti/p/~${data.lineid}`}
									className="h-10 w-10 text-neutral-400 hover:text-[#06c755] dark:text-foreground dark:hover:text-[#06c755]"
									target="_blank"
									rel="noopener noreferrer"
								>
									<LineIcon className="h-12 w-12" />
								</a>
							)}
							{data.instagram && (
								<a
									href={`https://instagram.com/${data.instagram}`}
									className="h-10 w-10 text-neutral-400 hover:text-[#d80055] dark:text-foreground dark:hover:text-[#d80055]"
									target="_blank"
									rel="noopener noreferrer"
								>
									<InstagramIcon className="h-12 w-12" />
								</a>
							)}
							{data.facebook && (
								<a
									href={`https://www.facebook.com/search/top/?q=${encodeURIComponent(data.facebook)}`}
									className="h-10 w-10 text-neutral-400 hover:text-[#0865fe] dark:text-foreground dark:hover:text-[#0865fe]"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FacebookIcon className="h-12 w-12" />
								</a>
							)}
						</div>
					</div>
					<div className="flex flex-col">
						<p className={`text-xl font-bold text-foreground`}>Emergency Contact🆘</p>
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Phone: </span>
							{data.emerphone}
						</p>
						<p className={`text-xl font-normal text-foreground`}>
							<span className={`font-medium`}>Relation: </span>
							<span className={`${nstl_reg.className}`}>{data.emerrelation}</span>
						</p>
					</div>
				</div>
			</div>
		</div>
		</>
	)
}
