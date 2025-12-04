import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
	return (
		<div className={`flex min-h-[90dvh] w-screen items-center justify-center`}>
			<div className="mx-4 w-full max-w-sm rounded-sm border p-6 sm:p-8">
				<header className="mb-8">
					<h1 className="text-center text-3xl font-bold text-foreground">Select Yearbook</h1>
				</header>

				<div className="space-y-4">
					<Link href={"/gen/38"} passHref legacyBehavior>
						<Button
							className="w-full py-6 text-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
							variant="default"
						>
							CPE 38
						</Button>
					</Link>

					<Link href={"/gen/39"} passHref legacyBehavior>
						<Button
							className="w-full py-6 text-lg shadow-md transition-shadow duration-200 hover:shadow-lg"
							variant="default"
						>
							CPE 39
						</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}
