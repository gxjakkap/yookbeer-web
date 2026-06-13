"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
	defaultValue?: string
}

export function SearchInput({ defaultValue }: SearchInputProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const updateQuery = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			if (value) {
				params.set("q", value)
			} else {
				params.delete("q")
			}
			startTransition(() => {
				router.push(`/search?${params.toString()}`)
			})
		},
		[router, searchParams]
	)

	const clearSearch = useCallback(() => {
		startTransition(() => {
			router.push("/search")
		})
	}, [router])

	return (
		<div className="relative w-full">
			<Search
				className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<Input
				id="global-search-input"
				type="search"
				placeholder="Search by name, nickname, student ID, Instagram, Discord…"
				defaultValue={defaultValue}
				className="h-12 pl-10 pr-10 text-base"
				onChange={(e) => updateQuery(e.target.value)}
				aria-label="Search students"
			/>
			{defaultValue && (
				<button
					type="button"
					onClick={clearSearch}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Clear search"
				>
					<X className="h-4 w-4" />
				</button>
			)}
			{isPending && (
				<div className="absolute right-10 top-1/2 -translate-y-1/2" aria-live="polite">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			)}
		</div>
	)
}
