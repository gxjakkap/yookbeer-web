"use client"

import { Copy, GlobeIcon, IdCardLanyardIcon, LanguagesIcon, PhoneIcon } from "lucide-react"
import type { ElementType } from "react"
import { useEffect, useState } from "react"
import { thaiNameFont } from "@/lib/fonts"
import { Button } from "./ui/button"
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "./ui/command"

interface CopyMenuProps {
	data: {
		stdid: string
		nameth: string
		nameen: string
		phone: string
		nicken: string
	}
}

type CopyTarget = "stdid" | "nameth" | "nameen" | "phone"

const ITEMS: {
	key: CopyTarget
	label: (nicken: string) => string
	value: (data: CopyMenuProps["data"]) => string
	icon?: ElementType
}[] = [
	{
		key: "stdid",
		label: (nicken) => `Copy ${nicken}'s Student ID to clipboard`,
		value: (data) => data.stdid,
		icon: IdCardLanyardIcon,
	},
	{
		key: "nameth",
		label: (nicken) => `Copy ${nicken}'s Thai name to clipboard`,
		value: (data) => data.nameth,
		icon: LanguagesIcon,
	},
	{
		key: "nameen",
		label: (nicken) => `Copy ${nicken}'s English name to clipboard`,
		value: (data) => data.nameen,
		icon: GlobeIcon,
	},
	{
		key: "phone",
		label: (nicken) => `Copy ${nicken}'s Phone number to clipboard`,
		value: (data) => data.phone,
		icon: PhoneIcon,
	},
]

export function CopyMenu({ data }: CopyMenuProps) {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.code === "KeyC" && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				e.preventDefault()
				setOpen((prev) => !prev)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	const items = ITEMS.filter((item) => {
		const v = item.value(data)
		return v !== "" && v !== "-"
	})

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				aria-keyshortcuts="Alt+C"
				title="Copy (Alt+C / ⌥C)"
			>
				<Copy aria-hidden="true" />
				Copy…
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<div className="flex items-center justify-between border-b px-4 py-2">
					<span className="text-sm font-medium text-foreground/70">
						Copy data for <span className="font-semibold text-foreground">{data.nicken}</span>
					</span>
				</div>
				<CommandInput placeholder="Filter…" />
				<CommandList>
					<CommandEmpty>Nothing to copy.</CommandEmpty>
					{items.map((item) => (
						<CommandItem
							key={item.key}
							value={item.label(data.nicken)}
							onSelect={() => {
								navigator.clipboard.writeText(item.value(data))
								setOpen(false)
							}}
							className="gap-4 pl-4"
						>
							{item.icon && <item.icon aria-hidden="true" />}
							<div className="flex flex-col">
								<span className="font-medium">{item.label(data.nicken)}</span>
								<span
									className={`text-sm text-foreground/60 ${item.key === "nameth" ? thaiNameFont.className : ""}`}
								>
									{item.value(data)}
								</span>
							</div>
						</CommandItem>
					))}
				</CommandList>
			</CommandDialog>
		</>
	)
}
