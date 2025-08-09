import type { Metadata } from "next"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Spotlight } from "@/components/spotlight"
import { Navbar } from "@/components/nav/navbar"
import { isAuthorized } from "@/lib/rba"

import "../globals.css"

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

  if (!isAuthorized(session.user.role!)){
    redirect("/noaccess")
  }

  return (

      <div
        className={`antialiased flex flex-col bg-backgound w-screen min-h-screen gap-y-4`}
      >
        <Navbar session={session} role={session.user.role} />
        <div className="mt-12 flex flex-col lg:mt-0">
            {children} 
        </div>
        <Spotlight />
      </div>
  )
}
