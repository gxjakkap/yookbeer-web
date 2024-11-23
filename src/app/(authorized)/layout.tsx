import type { Metadata } from "next"
import "../globals.css"
import { auth, signOut } from "@/auth"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { redirect } from "next/navigation"

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
    <html lang="en">
      <body
        className={`antialiased flex flex-col bg-neutral-100 w-screen min-h-screen`}
      >
        <NavigationMenu className="mt-5 ml-auto">
          <NavigationMenuList className="flex gap-x-3 pr-12 text-xl">
            <NavigationMenuItem>
              List
            </NavigationMenuItem>
            <NavigationMenuItem>
              Admin
            </NavigationMenuItem>
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
        <div className="mt-12 flex flex-1 grow flex-col lg:mt-0">
            {children} 
        </div>
      </body>
    </html>
  )
}
