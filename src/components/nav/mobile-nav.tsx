/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 * 
 * Original author: 3raphat
 * 
 */

"use client";

import { useCallback, useState } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";
import { Roles } from "@/lib/const";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  role?: string | null;
}

export function MobileNav({role }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

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
            <MobileLink
              key="/"
              href="/"
              onOpenChange={setOpen}
              isActive={pathname === "/"}
            >
              หน้าหลัก
            </MobileLink>

            {(!!role && role === Roles.ADMIN) && (
              <MobileLink
                href="/admin"/**
                * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
                * 
                * Original author: 3raphat
                * 
                */
                onOpenChange={setOpen}
                isActive={
                  pathname === "/admin" || pathname.startsWith("/admin/")
                }
              >
                แอดมิน
              </MobileLink>
            )}

            <button
              className="flex text-left rounded-md px-4 py-3 text-[1.1rem] transition-all duration-200 text-foreground/80 hover:bg-accent/50"
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
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  isActive,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(
        "flex items-center rounded-md px-4 py-3 text-[1.1rem] transition-all duration-200",
        isActive
          ? "text-primary bg-primary/10 border-primary border-l-4 font-semibold"
          : "text-foreground/80 hover:bg-accent/50",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}