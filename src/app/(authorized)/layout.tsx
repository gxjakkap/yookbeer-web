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
        className={`antialiased flex flex-col bg-neutral-100 w-screen min-h-screen`}
      >
        <NavigationMenu className="max-h-[6rem] mt-5 ml-auto">
          <NavigationMenuList className="flex gap-x-3 pr-12 text-xl">
            <NavigationMenuItem>
              <Link href='/'>List</Link>
            </NavigationMenuItem>
            {(session.user.role === "admin") && (
              <>
                <NavigationMenuItem>
                  <Link href='/admin'>Admin</Link>
                </NavigationMenuItem>
              </>
            )}
            <NavigationMenuItem>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <button type="submit">Sign Out</button>
              </form>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="mt-12 flex flex-col lg:mt-0">
            {children} 
        </div>
        <Spotlight />
      </div>
  )
}
