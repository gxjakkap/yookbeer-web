"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Session } from "next-auth"
import { MobileNav } from "@/components/nav/mobile-nav"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import UserMenu from "@/components/user-menu"
import { AVAILABLE } from "@/config/available-yearbook"
import { isAdmin, Roles } from "@/lib/rba"
import { cn } from "@/lib/utils"

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
	image?: string | null
}

const NavbarChild = ({
	href,
	text,
	isActive,
	fullWidth,
}: {
	href: string
	text: string
	isActive: boolean
	fullWidth?: boolean
}) => (
	<NavigationMenuItem>
		<Button
			asChild
			className={cn(
				"relative px-4 text-sm font-medium transition-all",
				isActive
					? "font-bold text-primary before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-1/2 before:-translate-x-1/2 before:transform before:bg-primary before:content-[''] hover:text-primary/90"
					: "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
				fullWidth ? "w-full" : ""
			)}
			variant="ghost"
		>
			<Link href={href} aria-current={isActive ? "page" : undefined}>
				{text}
			</Link>
		</Button>
	</NavigationMenuItem>
)

const NavbarList = ({
	text,
	isActive,
	items,
	currentPath,
}: {
	text: string
	isActive: boolean
	items: { text: string; link: string }[]
	currentPath: string
}) => (
	<NavigationMenuItem>
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className={cn(
						"relative items-center px-4 text-sm font-medium transition-all focus-visible:ring-0 focus-visible:ring-offset-0",
						isActive
							? "font-bold text-primary before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-1/2 before:-translate-x-1/2 before:transform before:bg-primary before:content-[''] hover:text-primary/90"
							: "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
					)}
					variant="ghost"
				>
					{text}
					<ChevronDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-[200px] p-2">
				{items.map((x, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <>
					<DropdownMenuItem key={i} asChild>
						<Link
							href={x.link}
							className={cn(
								"flex w-full cursor-pointer items-center justify-start rounded-sm px-4 py-2 text-sm font-medium transition-colors",
								currentPath.startsWith(x.link)
									? "bg-accent/50 font-bold text-primary"
									: "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
							)}
						>
							{x.text}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	</NavigationMenuItem>
)

export function Navbar({ role, session }: NavbarProps) {
	const pathname = usePathname()
	const user = {
		email: session.user.email ?? "",
		name: session.user.name ?? "",
		role: session.user.role ?? Roles.USER,
		image: session.user.image ?? undefined,
	}

	// One markup for both sizes; CSS picks which nav shows, so there's no mobile→desktop flash on load.
	return (
		<div className="sticky top-0 z-50 flex border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
			<nav className="flex w-full items-center justify-between">
				<div className="md:hidden">
					<MobileNav role={role} user={user} />
				</div>
				<NavigationMenu className="hidden md:flex">
					<NavigationMenuList className="flex-wrap">
						<NavbarChild key="/" href="/" text="Home" isActive={pathname === "/"} />
						<NavbarList
							text="Year"
							isActive={pathname.startsWith("/gen/")}
							currentPath={pathname}
							items={AVAILABLE.map((x) => {
								return { text: x.label, link: x.home }
							})}
						/>
						<NavbarChild href="/search" text="Search" isActive={pathname.startsWith("/search")} />
						{!!role && isAdmin(role) && (
							<>
								<NavbarChild
									href="/not-attending"
									text="Not attending"
									isActive={pathname === "/not-attending"}
								/>
								<NavbarChild href="/admin" text="Admin" isActive={pathname === "/admin"} />
								<NavbarChild
									href="/admin/logs"
									text="Logs"
									isActive={pathname.startsWith("/admin/logs")}
								/>
							</>
						)}
					</NavigationMenuList>
				</NavigationMenu>
				<div className="flex items-center gap-3">
					<ThemeSwitch />
					<div className="hidden md:block">
						<UserMenu {...user} />
					</div>
				</div>
			</nav>
		</div>
	)
}
