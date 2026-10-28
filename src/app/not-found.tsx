import type { Metadata } from "next"
import { NotFoundMessage } from "@/components/not-found-message"

export const metadata: Metadata = {
	title: "not found | yookbeer",
}

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<NotFoundMessage />
		</div>
	)
}
