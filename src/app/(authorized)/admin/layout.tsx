import { auth } from "@/auth"
import { isAdmin } from "@/lib/rba"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

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

  if (!isAdmin(session.user.role!)) {
    redirect("/")
  }

  return <>{children}</>
}
