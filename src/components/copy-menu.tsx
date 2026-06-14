/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
"use client"

import { GlobeIcon, IdCardLanyardIcon, LanguagesIcon, PhoneIcon } from "lucide-react"
import type { ElementType } from "react"
import { useEffect, useRef, useState } from "react"
import { CommandDialog, CommandList } from "./ui/command"

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
	const [focusIndex, setFocusIndex] = useState<number>(0)

	const containerRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])

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

	useEffect(() => {
		if (open) {
			setFocusIndex(0)
			const id = setTimeout(() => {
				containerRef.current?.focus()
			}, 50)
			return () => clearTimeout(id)
		}
	}, [open])

	const handleSelect = (index: number) => {
		const item = ITEMS[index]
		if (!item) return
		navigator.clipboard.writeText(item.value(data))
		setOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Tab" || e.key === "ArrowDown") {
			e.preventDefault()
			setFocusIndex((prev) => {
				const next = (prev + 1) % ITEMS.length
				setTimeout(() => {
					itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
				}, 0)
				return next
			})
		}

		if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
			e.preventDefault()
			setFocusIndex((prev) => {
				const next = (prev - 1 + ITEMS.length) % ITEMS.length
				setTimeout(() => {
					itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
				}, 0)
				return next
			})
		}

		if (e.key === "Enter") {
			handleSelect(focusIndex)
		}

		if (e.key === "Escape") {
			setOpen(false)
		}
	}

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<div className="flex items-center justify-between border-b px-4 py-2">
				<span className="text-sm font-medium text-foreground/70">
					Copy data for <span className="font-semibold text-foreground">{data.nicken}</span>
				</span>
			</div>
			<CommandList>
				{/** biome-ignore lint/a11y/noNoninteractiveTabindex: <> */}
				<div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} className="outline-none">
					{ITEMS.map((item, i) => {
						// biome-ignore lint/complexity/noUselessFragments: <>
						if (item.key === "nameth" && item.value(data) === "-") return <></>
						else
							return (
								<div
									key={item.key}
									className={`flex cursor-pointer rounded p-2 pl-4 transition-colors space-x-4 items-center ${
										focusIndex === i
											? "bg-neutral-200 dark:bg-muted-foreground dark:text-background"
											: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
									}`}
									ref={(el) => {
										itemRefs.current[i] = el
									}}
									onClick={() => handleSelect(i)}
									onMouseEnter={() => setFocusIndex(i)}
									tabIndex={-1}
								>
									{item.icon && <item.icon />}
									<div className="flex flex-col">
										<span className="font-medium">{item.label(data.nicken)}</span>
										<span className="text-sm text-foreground/60">{item.value(data)}</span>
									</div>
								</div>
							)
					})}
				</div>
			</CommandList>
		</CommandDialog>
	)
}
