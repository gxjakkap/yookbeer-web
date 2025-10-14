/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: 3raphat
 *
 */

"use client"

import { MobileNav } from "@/components/nav/mobile-nav"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/user-menu"
import { isAdmin, Roles } from "@/lib/rba"
import { cn } from "@/lib/utils"
import { Session } from "next-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"

import SignOutButton from "../signout-button"
import { ThemeSwitch } from "../theme-switch"

/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: 3raphat
 *
 */

interface NavbarProps {
  role?: string | null
  session: Session
}

export function Navbar({ role, session }: NavbarProps) {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <div className="sticky top-0 z-50 flex border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <NavbarChild key="/" href="/" text="หน้าหลัก" isActive={pathname === "/"} />
            <NavbarChild key="/thirtynine" href="/thirtynine" text="CPE39" isActive={pathname === "/thirtynine" || pathname.startsWith("/std39/")} />

            {!!role && isAdmin(role) && (
              <>
                <NavbarChild
                  href="/not-attending"
                  text="Not Attending"
                  isActive={pathname === "/not-attending"}
                />
                <NavbarChild
                  href="/admin"
                  text="Admin"
                  isActive={pathname === "/admin" || pathname.startsWith("/admin/")}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <UserMenu
              email={session.user.email ?? ""}
              name={session.user.name ?? ""}
              role={session.user.role ?? Roles.USER}
            />
          </div>
        </nav>
      </div>
    )
  }
  return (
    <div className="sticky top-0 z-50 flex border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex w-full items-center justify-between">
        <MobileNav role={role} />
        <div className="flex items-center gap-2">
          <ThemeSwitch />
        </div>
      </nav>
    </div>
  )
}

const NavbarChild = ({ href, text, isActive }: { href: string; text: string; isActive: boolean }) => (
  <Link key={href} href={href}>
    <Button
      className={cn(
        "relative px-4 text-sm font-medium transition-all",
        isActive
          ? "font-bold text-primary before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-1/2 before:-translate-x-1/2 before:transform before:bg-primary before:content-[''] hover:text-primary/90"
          : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
      )}
      variant="ghost"
    >
      {text}
    </Button>
  </Link>
)
