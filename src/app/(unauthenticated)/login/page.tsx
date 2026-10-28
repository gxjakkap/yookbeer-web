import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MsftIcons = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			viewBox="0 0 16 16"
		>
			<title>Microsoft</title>
			<path d="M7.462 0H0v7.19h7.462zM16 0H8.538v7.19H16zM7.462 8.211H0V16h7.462zm8.538 0H8.538V16H16z" />
		</svg>
	)
}

export const metadata: Metadata = {
	title: "log in | yookbeer",
}

// Keys are Auth.js error codes: `?error=` from pages.error/pages.signIn, or AuthError.type from the action below.
const ERROR_MESSAGES: Record<string, string> = {
	AccessDenied: "This account isn't allowed to sign in. Use your KMUTT Microsoft account.",
	Configuration:
		"Sign-in isn't working on the server right now. Try again later, or tell a yookbeer admin.",
	OAuthAccountNotLinked:
		"This email is already linked to a different sign-in. Ask a yookbeer admin to fix it.",
	Verification: "That sign-in link has expired. Sign in again.",
}
const DEFAULT_ERROR = "Sign-in didn't complete. Try again, and tell a yookbeer admin if it keeps happening."

export default async function SignInPage(props: {
	searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
	const spr = await props.searchParams
	const errorMessage = spr.error ? (ERROR_MESSAGES[spr.error] ?? DEFAULT_ERROR) : null
	return (
		<div className="flex min-h-screen w-screen flex-col bg-muted">
			<div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
				<div className="py-auto z-50 flex max-w-sm flex-col gap-y-3">
					<h1 className={`text-center text-4xl`}>yookbeer</h1>
					{errorMessage && (
						<p
							role="alert"
							className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-foreground"
						>
							{errorMessage}
						</p>
					)}
					<form
						action={async () => {
							"use server"
							try {
								await signIn("microsoft-entra-id", {
									redirectTo: spr.callbackUrl ?? "",
								})
							} catch (error) {
								if (error instanceof AuthError) {
									const params = new URLSearchParams({ error: error.type })
									if (spr.callbackUrl) params.set("callbackUrl", spr.callbackUrl)
									return redirect(`/login?${params}`)
								}
								throw error
							}
						}}
					>
						<Button type="submit">
							<span>
								<MsftIcons />
							</span>
							<span>Sign in with KMUTT account</span>
						</Button>
					</form>
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
