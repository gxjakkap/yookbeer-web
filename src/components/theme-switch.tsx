"use client"

import { useTheme } from "next-themes"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeSwitch() {
	const { resolvedTheme, setTheme } = useTheme()

	return (
		<AnimatedThemeToggler
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			onThemeChange={setTheme}
			className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full")}
		/>
	)
}
