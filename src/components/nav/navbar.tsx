/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 * 
 * Original author: 3raphat
 * 
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import { MobileNav } from "@/components/nav/mobile-nav";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Roles } from "@/lib/const";
import UserMenu from "@/components/user-menu";
import { Session } from "next-auth";
import { ThemeSwitch } from "../theme-switch";
import SignOutButton from "../signout-button";

interface NavbarProps {
  role?: string | null;
  session: Session
}


export function Navbar({ role, session }: NavbarProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex border-b px-6 py-3 backdrop-blur">
        <nav className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <NavbarChild
              key="/"
              href="/"
              text="หน้าหลัก"
              isActive={pathname === "/"}
            />

            {(!!role && role === Roles.ADMIN) && (
                <NavbarChild
                  href="/admin"
                  text="Admin"
                  isActive={
                    pathname === "/admin" ||
                    pathname.startsWith("/admin/")
                  }
                />
              )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <UserMenu email={session.user.email ?? ""} name={session.user.name ?? ""} role={session.user.role ?? Roles.USER} />
          </div>
        </nav>
      </div>
    );
  }
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex border-b px-4 py-3 backdrop-blur">
      <nav className="flex w-full items-center justify-between">
        <MobileNav role={role} />
        <div className="flex items-center gap-2">
          <ThemeSwitch />
        </div>
      </nav>
    </div>
  );
}

const NavbarChild = ({
  href,
  text,
  isActive,
}: {
  href: string;
  text: string;
  isActive: boolean;
}) => (
  <Link key={href} href={href}>
    <Button
      className={cn(
        "relative px-4 text-sm font-medium transition-all",
        isActive
          ? "text-primary before:bg-primary hover:text-primary/90 font-bold before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-1/2 before:-translate-x-1/2 before:transform before:content-['']"
          : "text-foreground/80 hover:text-foreground hover:bg-accent/50",
      )}
      variant="ghost"
    >
      {text}
    </Button>
  </Link>
);