import { auth, signOut } from "@/auth"
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
	title: "no access | yookbeer",
}

export default async function NoAccessPage() {
	const session = await auth()

	if (!session) {
		redirect("/login")
	}
	return (
		<div className="flex min-h-screen w-screen flex-col bg-neutral-100">
			<div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
				<div className="py-auto z-50 flex flex-col gap-y-3">
					<h1 className={`text-center text-4xl`}>No Access</h1>
					<form
						action={async () => {
							"use server"
							await signOut({
								redirectTo: "/login",
							})
						}}
						className="flex flex-col"
					>
						<Button type="submit" className="mx-auto">
							<span>Sign out</span>
						</Button>
					</form>
					<h2 className={`text-center text-2xl`}>Have an invite code?</h2>
					<Link href="/invite" className="mx-auto">
						<Button className="mx-auto">Redeem an invite code</Button>
					</Link>
				</div>
				<AnimatedGridPattern
					numSquares={30}
					maxOpacity={0.1}
					duration={3}
					repeatDelay={1}
					className={cn(
						"[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
						"inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
					)}
				/>
			</div>
		</div>
	)
}
