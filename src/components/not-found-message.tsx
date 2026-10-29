import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NotFoundMessage() {
	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex items-center gap-6">
				<h1 className="text-[48px] font-medium leading-none">404</h1>
				<div className="h-16 w-px bg-border" />
				<h2 className="text-[24px] leading-none">This page could not be found.</h2>
			</div>
			<Button asChild variant="outline">
				<Link href="/">Back to yookbeer</Link>
			</Button>
		</div>
	)
}
