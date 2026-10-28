import { eq } from "drizzle-orm"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
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
import { thaiNameFont } from "@/lib/fonts"
import { isAdmin } from "@/lib/rba"

import { getPresignedURLForYookbeerPic } from "../../actions"

interface Props {
	params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
	[StudentStatus.RESIGNED]: "Resigned",
}

const linkClass = "underline-offset-4 hover:underline"
const socialClass = "block h-12 w-12 rounded-md text-muted-foreground"

/** One label/value row; renders nothing when the value is empty. */
function Field({ label, children }: { label: string; children: ReactNode }) {
	if (children == null || children === "" || children === false) return null
	return (
		<div className="grid grid-cols-[8.5rem_1fr] gap-x-4 py-1.5 sm:grid-cols-[10rem_1fr]">
			<dt className="text-sm text-muted-foreground">{label}</dt>
			<dd className="min-w-0 break-words text-base">{children}</dd>
		</div>
	)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section>
			<h2 className="mb-1 text-lg font-semibold">{title}</h2>
			<dl>{children}</dl>
		</section>
	)
}

export default async function StudentProfilePage({ params }: Props) {
	const { id } = await params
	const [data] = await db.select().from(students).where(eq(students.stdid, id)).limit(1)
	if (!data) notFound()
	const imgUrl = await getPresignedURLForYookbeerPic(`${data.gen}/${data.img}` || "")
	const status = data.status
	const session = await auth()
	const userIsAdmin = isAdmin(session?.user.role || "")
	const hasSocials = data.lineid || data.instagram || data.facebook

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-y-6 px-4 pb-14">
			<header className="flex flex-col gap-y-1">
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-[1.875rem] font-medium lg:text-4xl">{data.nameen}</h1>
					{userIsAdmin && <StudentEditButton data={data as YookbeerColumn} />}
					<CopyMenu
						data={{
							stdid: data.stdid,
							nameth: data.nameth || "",
							nameen: data.nameen,
							phone: data.phone ?? "",
							nicken: data.nicken,
						}}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<p className="text-lg text-foreground/75 lg:text-xl">
						<span className="tabular-nums">{data.stdid}</span> · {data.nicken}
						{data.nickth && (
							<>
								{" "}
								(
								<span lang="th" className={thaiNameFont.className}>
									{data.nickth}
								</span>
								)
							</>
						)}
					</p>
					{status !== StudentStatus.ATTENDING && (
						<Badge variant="destructive">{STATUS_LABEL[status] ?? status}</Badge>
					)}
				</div>
			</header>

			<div className="flex flex-col gap-x-16 gap-y-8 lg:flex-row lg:items-start">
				<div className="mx-auto shrink-0 lg:mx-0">
					<Image
						className="rounded-md"
						src={imgUrl}
						alt={`${data.nicken}'s portrait`}
						width={0}
						height={0}
						sizes="(min-width: 1024px) 500px, 90vw"
						style={{
							width: "auto",
							height: "auto",
							maxWidth: "min(500px, 100%)",
							maxHeight: "450px",
						}}
						unoptimized
					/>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-y-6">
					<Section title="About">
						<Field label="Course">{COURSE_PRETTYNAME[data.course]}</Field>
						<Field label="Thai name">
							{data.nameth && (
								<span lang="th" className={thaiNameFont.className}>
									{data.nameth}
								</span>
							)}
						</Field>
						<Field label="Birthday">
							{data.birthDay &&
								data.birthMonth &&
								birthdayPrettifier(data.birthDay, data.birthMonth)}
						</Field>
					</Section>

					<Section title="Contact">
						<Field label="Phone">
							{data.phone && (
								<a href={`tel:${data.phone}`} className={`${linkClass} tabular-nums`}>
									{data.phone}
								</a>
							)}
						</Field>
						<Field label="University email">
							{data.emailuni && (
								<a href={`mailto:${data.emailuni}`} className={linkClass}>
									{data.emailuni.toLowerCase()}
								</a>
							)}
						</Field>
						<Field label="Personal email">
							{data.emailper && (
								<a href={`mailto:${data.emailper}`} className={linkClass}>
									{data.emailper.toLowerCase()}
								</a>
							)}
						</Field>
						<Field label="Discord">{data.discord}</Field>
						<Field label="Socials">
							{hasSocials && (
								<div className="flex gap-x-4">
									{data.lineid && (
										<a
											href={`https://line.me/R/ti/p/~${data.lineid}`}
											aria-label={`${data.nicken} on LINE`}
											className={`${socialClass} hover:text-[#06c755] dark:hover:text-[#06c755]`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<LineIcon className="h-12 w-12" />
										</a>
									)}
									{data.instagram && (
										<a
											href={`https://instagram.com/${data.instagram}`}
											aria-label={`${data.nicken} on Instagram`}
											className={`${socialClass} hover:text-[#d80055] dark:hover:text-[#d80055]`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<InstagramIcon className="h-12 w-12" />
										</a>
									)}
									{data.facebook && (
										<a
											href={`https://www.facebook.com/search/top/?q=${encodeURIComponent(data.facebook)}`}
											aria-label={`Find ${data.nicken} on Facebook`}
											className={`${socialClass} hover:text-[#0865fe] dark:hover:text-[#0865fe]`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<FacebookIcon className="h-12 w-12" />
										</a>
									)}
								</div>
							)}
						</Field>
					</Section>

					{(data.emerphone || data.emerrelation) && (
						<Section title="Emergency contact">
							<Field label="Phone">
								{data.emerphone && (
									<a href={`tel:${data.emerphone}`} className={`${linkClass} tabular-nums`}>
										{data.emerphone}
									</a>
								)}
							</Field>
							<Field label="Relation">
								{data.emerrelation && (
									<span className={thaiNameFont.className}>{data.emerrelation}</span>
								)}
							</Field>
						</Section>
					)}
				</div>
			</div>
		</div>
	)
}
