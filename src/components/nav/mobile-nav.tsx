"use client"

import { ChevronDown, Menu } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { getInitials } from "@/components/user-menu"
import { AVAILABLE } from "@/config/available-yearbook"
import { isAdmin } from "@/lib/rba"
import { cn } from "@/lib/utils"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: 3raphat
 *
 */

interface MobileNavProps {
	role?: string | null
	user: { name: string; email: string; role: string; image?: string }
}

export function MobileNav({ role, user }: MobileNavProps) {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button variant="ghost" size="icon">
					<Menu />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</DrawerTrigger>
			<DrawerContent className="max-h-[80svh] p-0">
				<DrawerHeader className="flex items-center gap-3 border-b px-6 py-4 text-left">
					<Avatar className="outline outline-1 outline-border">
						<AvatarImage src={user.image} alt="" />
						<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<DrawerTitle className="truncate text-base">{user.name}</DrawerTitle>
						<p className="text-sm capitalize text-muted-foreground">{user.role}</p>
					</div>
				</DrawerHeader>
				<div className="overflow-auto p-6">
					<div className="flex flex-col space-y-1">
						<MobileLink href="/" onOpenChange={setOpen} isActive={pathname === "/"}>
							Home
						</MobileLink>

						<Collapsible defaultOpen={pathname.startsWith("/gen")}>
							<CollapsibleTrigger className="w-full">
								<span
									className={cn(
										"flex items-center rounded-md px-4 py-3 text-[1.1rem] transition-all duration-200",
										pathname.startsWith("/gen")
											? "border-l-4 border-primary bg-primary/10 font-semibold text-primary"
											: "text-foreground/80 hover:bg-accent/50"
									)}
								>
									Year <ChevronDown />
								</span>
							</CollapsibleTrigger>
							<CollapsibleContent className="overflow-hidden pl-8 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out">
								{AVAILABLE.map((x) => (
									<MobileLink
										key={x.gen}
										href={x.home}
										onOpenChange={setOpen}
										isActive={pathname.startsWith(x.home)}
									>
										{x.label}
									</MobileLink>
								))}
							</CollapsibleContent>
						</Collapsible>

						<MobileLink
							href="/search"
							onOpenChange={setOpen}
							isActive={pathname.startsWith("/search")}
						>
							Search
						</MobileLink>

						{!!role && isAdmin(role) && (
							<>
								<MobileLink
									href="/not-attending"
									onOpenChange={setOpen}
									isActive={pathname.startsWith("/not-attending")}
								>
									Not attending
								</MobileLink>
								<MobileLink
									href="/admin"
									onOpenChange={setOpen}
									isActive={pathname === "/admin"}
								>
									Admin
								</MobileLink>
								<MobileLink
									href="/admin/logs"
									onOpenChange={setOpen}
									isActive={pathname.startsWith("/admin/logs")}
								>
									Logs
								</MobileLink>
							</>
						)}

						<button
							className="flex rounded-md px-4 py-3 text-left text-[1.1rem] text-foreground/80 transition-all duration-200 hover:bg-accent/50"
							onClick={() => {
								signOut()
								setOpen(false)
							}}
							type="button"
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
	return (
		<Link
			href={href}
			onClick={() => onOpenChange?.(false)}
			aria-current={isActive ? "page" : undefined}
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
