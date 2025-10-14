import type { Metadata } from "next"
import "../../globals.css"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/rba"


export const metadata: Metadata = {
  title: "yookbeer",
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth()

    if (!session){
        redirect("/login")
    }

    if (!isAdmin(session.user.role!)){
        redirect("/")
    }

    return (
        <>
          {children}
        </>
    )
}
