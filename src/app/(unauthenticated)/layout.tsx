import { auth } from "@/auth"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import "../globals.css"

export const metadata: Metadata = {
  title: "yookbeer",
}

export default async function UnauthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (session) {
    redirect("/")
  }
  return <>{children}</>
}
