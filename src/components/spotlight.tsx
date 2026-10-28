"use client"

import { CommandLoading } from "cmdk"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { isMacOs } from "react-device-detect"
import { useDebounce } from "use-debounce"
import { nSearch } from "@/app/(authorized)/actions"
import type { students } from "@/db/schema"
import { COURSE_SHORTHAND } from "@/lib/const"

import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "./ui/command"

type SearchResult = typeof students.$inferSelect

export function Spotlight() {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
	const [results, setResults] = useState<SearchResult[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.code === "KeyK" && (isMacOs ? e.metaKey : e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	const performSearch = useCallback(async (term: string) => {
		if (term.trim() === "") {
			setResults([])
			return
		}
		setIsLoading(true)
		try {
			const data = await nSearch(term)
			setResults(data.sort((a, b) => a.gen - b.gen))
		} catch (error) {
			console.error("Search error:", error)
			setResults([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		performSearch(debouncedSearchTerm)
	}, [debouncedSearchTerm, performSearch])

	return (
		// results are already filtered server-side; cmdk's own fuzzy filter would hide matches on IG/Discord/etc.
		<CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
			<CommandInput placeholder="Search students..." value={searchTerm} onValueChange={setSearchTerm} />
			<CommandList>
				{isLoading && <CommandLoading>Searching...</CommandLoading>}
				{!isLoading && searchTerm.trim() !== "" && <CommandEmpty>No results found.</CommandEmpty>}
				{results.map((r) => (
					<CommandItem
						key={r.stdid}
						value={r.stdid}
						onSelect={() => {
							setOpen(false)
							router.push(`/std/${r.stdid}`)
						}}
						className="flex-col items-start gap-0 pl-10"
					>
						<span className="font-medium">{r.nameen}</span>
						<span className="text-sm">
							{r.nicken}: {COURSE_SHORTHAND[r.course]} {r.gen}
						</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	)
}
