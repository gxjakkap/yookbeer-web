import type { Metadata } from "next"
import { Suspense } from "react"
import { SearchInput } from "@/components/search/search-input"
import { SearchResults } from "@/components/search/search-results"
import type { YookbeerColumn } from "@/components/table/yookbeer-table-new"
import { searchStudents } from "@/lib/search"

interface SearchPageProps {
	searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
	const { q } = await searchParams
	return {
		title: q ? `Search "${q}" — yookbeer` : "Search — yookbeer",
		description: "Search for students across all CPE generations.",
	}
}

async function getSearchResults(query: string): Promise<YookbeerColumn[]> {
	if (!query.trim()) return []
	const results = await searchStudents(query)
	return results as YookbeerColumn[]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const { q = "" } = await searchParams
	const results = await getSearchResults(q)

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-8">
			<header className="mb-8">
				<h1 className="mb-1 text-2xl font-bold tracking-tight">Search</h1>
				<p className="text-sm text-muted-foreground">Search all students in yookbeer</p>
			</header>

			{/* useSearchParams() lives here, must be wrapped in Suspense */}
			<Suspense fallback={<div className="h-12 w-full animate-pulse rounded-md bg-muted" />}>
				<SearchInput defaultValue={q} />
			</Suspense>

			<div className="mt-8">
				<SearchResults results={results} query={q} />
			</div>
		</div>
	)
}
