import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Navbar } from "@/components/nav/navbar"
import { Spotlight } from "@/components/spotlight"
import { isAuthorized, Roles } from "@/lib/rba"

import "../globals.css"

export const metadata: Metadata = {
	title: "yookbeer",
}

export default async function AuthorizedLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth()

	if (!session) {
		redirect("/login")
	}

	if (!isAuthorized(session.user.role || Roles.UNAUTHORIZED)) {
		redirect("/noaccess")
	}

	return (
		<div className={`bg-backgound flex min-h-screen w-screen flex-col gap-y-4 antialiased`}>
			<Navbar session={session} role={session.user.role} />
			<div className="mt-12 flex flex-col lg:mt-0">{children}</div>
			<Spotlight />
		</div>
	)
}
