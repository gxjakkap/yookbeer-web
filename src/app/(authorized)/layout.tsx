import type { Metadata } from "next"
import "../globals.css"
import { auth, signOut } from "@/auth"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Spotlight } from "@/components/spotlight"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "yookbeer",
}

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  if (!session){
    redirect("/login")
  }

  if (!(["admin", "user"].includes(session.user.role || "unauthorized"))){
    redirect("/noaccess")
  }

  return (

      <div
        className={`antialiased flex flex-col bg-neutral-100 w-screen min-h-screen gap-y-4`}
      >
        <Navbar session={session} role={session.user.role} />
        <div className="mt-12 flex flex-col lg:mt-0">
            {children} 
        </div>
        <Spotlight />
      </div>
  )
}
