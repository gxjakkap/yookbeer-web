import { Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function Home() {
	return (
		<div className={`flex min-h-[90dvh] w-screen items-center justify-center`}>
			<div className="mx-4 w-full max-w-sm rounded-sm border p-6 sm:p-8">
				<header className="mb-8">
					<h1 className="text-center text-3xl font-bold text-foreground">Select Yearbook</h1>
				</header>

				<form action="/search" method="get" className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input type="search" name="q" placeholder="Search people..." className="pl-9" />
					</div>
				</form>

				<div className="space-y-4">
					<Button
						asChild
						className="w-full py-6 text-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
						variant="default"
					>
						<Link href="/gen/38">CPE 38</Link>
					</Button>

					<Button
						asChild
						className="w-full py-6 text-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
						variant="default"
					>
						<Link href="/gen/39">CPE 39</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
