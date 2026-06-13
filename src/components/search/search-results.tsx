"use client"

import { Users } from "lucide-react"
import Link from "next/link"
import type { YookbeerColumn } from "@/components/table/yookbeer-table-new"
import { Badge } from "@/components/ui/badge"
import { COURSE_SHORTHAND } from "@/lib/const"

interface SearchResultsProps {
	results: YookbeerColumn[]
	query: string
}

function StudentCard({ student }: { student: YookbeerColumn }) {
	return (
		<Link
			href={`/std/${student.stdid}`}
			className="block rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<div className="flex items-center gap-3 p-4">
				<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
					{(student.nicken?.[0] ?? student.nameen?.[0] ?? "?").toUpperCase()}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="truncate font-medium text-sm">{student.nameen}</p>
						{student.nameth && (
							<p className="truncate text-xs text-muted-foreground">{student.nameth}</p>
						)}
					</div>
					<div className="mt-0.5 flex flex-wrap items-center gap-2">
						<span className="text-xs text-muted-foreground">
							{student.nicken}
							{student.nickth ? ` / ${student.nickth}` : ""}
						</span>
						<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
							{COURSE_SHORTHAND[student.course]}
						</Badge>
						<Badge variant="outline" className="text-[10px] px-1.5 py-0">
							CPE {student.gen}
						</Badge>
					</div>
					<p className="mt-0.5 text-xs text-muted-foreground font-mono">
						{student.stdid.substring(7)}
					</p>
				</div>
			</div>
		</Link>
	)
}

export function SearchResults({ results, query }: SearchResultsProps) {
	if (!query) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
				<Search className="mb-4 h-12 w-12 opacity-30" aria-hidden="true" />
				<p className="text-lg font-medium">Start typing to search</p>
				<p className="mt-1 text-sm">Search across all generations by name, nickname, ID, and more</p>
			</div>
		)
	}

	if (results.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
				<Users className="mb-4 h-12 w-12 opacity-30" aria-hidden="true" />
				<p className="text-lg font-medium">No results found</p>
				<p className="mt-1 text-sm">
					No students matched &ldquo;<span className="font-medium text-foreground">{query}</span>
					&rdquo;
				</p>
			</div>
		)
	}

	// Group by gen
	const byGen = results.reduce<Record<number, YookbeerColumn[]>>((acc, student) => {
		const g = student.gen
		acc[g] ??= []
		acc[g].push(student)
		return acc
	}, {})

	const sortedGens = Object.keys(byGen)
		.map(Number)
		.sort((a, b) => a - b)

	return (
		<div className="space-y-8">
			<p className="text-sm text-muted-foreground">
				Found <span className="font-medium text-foreground">{results.length}</span> result
				{results.length !== 1 ? "s" : ""} for &ldquo;
				<span className="font-medium text-foreground">{query}</span>&rdquo;
			</p>
			{sortedGens.map((gen) => (
				<section key={gen} aria-labelledby={`gen-${gen}-heading`}>
					<div className="mb-3 flex items-center gap-3">
						<h2 id={`gen-${gen}-heading`} className="text-base font-semibold">
							CPE {gen}
						</h2>
						<Badge variant="secondary">{byGen[gen].length}</Badge>
						<div className="h-px flex-1 bg-border" />
					</div>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{byGen[gen].map((student) => (
							<StudentCard key={student.stdid} student={student} />
						))}
					</div>
				</section>
			))}
		</div>
	)
}

// Re-export the lucide icon used in the empty state so this module is self-contained
function Search(props: React.SVGProps<SVGSVGElement>) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	)
}
