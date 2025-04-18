import type { Metadata } from "next"
import "../../globals.css"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Roles } from "@/lib/const"


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

    if (!(["admin"].includes(session.user.role || ""))){
        redirect("/")
    }

    return (
        <>
          {children}
        </>
    )
}
