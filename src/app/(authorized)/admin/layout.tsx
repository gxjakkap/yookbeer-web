import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { isAdmin, Roles } from "@/lib/rba"

import "../../globals.css"

export const metadata: Metadata = {
	title: "yookbeer",
}

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth()

	if (!session) {
		redirect("/login")
	}

	if (!isAdmin(session.user.role || Roles.UNAUTHORIZED)) {
		redirect("/")
	}

	return <>{children}</>
}
