/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: 3raphat
 *
 */

"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { isAdmin } from "@/lib/rba"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { signOut } from "next-auth/react"
import Link, { type LinkProps } from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useState } from "react"

/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: 3raphat
 *
 */

interface MobileNavProps {
  role?: string | null
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open)
  }, [])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80svh] p-0">
        <VisuallyHidden asChild>
          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
          </DrawerHeader>
        </VisuallyHidden>
        <div className="overflow-auto p-6">
          <div className="flex flex-col space-y-1">
            <MobileLink key="/" href="/" onOpenChange={setOpen} isActive={pathname === "/"}>
              Home
            </MobileLink>

            {!!role && isAdmin(role) && (
              <>
                <MobileLink
                  href="/not-attending"
                  onOpenChange={setOpen}
                  isActive={pathname === "/not-attending"}
                >
                  Not Attending
                </MobileLink>
                <MobileLink
                  href="/admin"
                  onOpenChange={setOpen}
                  isActive={pathname === "/admin" || pathname.startsWith("/admin/")}
                >
                  Admin
                </MobileLink>
              </>
            )}

            <button
              className="flex rounded-md px-4 py-3 text-left text-[1.1rem] text-foreground/80 transition-all duration-200 hover:bg-accent/50"
              onClick={() => {
                signOut()
                setOpen(false)
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
  isActive: boolean
}

function MobileLink({ href, onOpenChange, className, children, isActive, ...props }: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(
        "flex items-center rounded-md px-4 py-3 text-[1.1rem] transition-all duration-200",
        isActive
          ? "border-l-4 border-primary bg-primary/10 font-semibold text-primary"
          : "text-foreground/80 hover:bg-accent/50",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
