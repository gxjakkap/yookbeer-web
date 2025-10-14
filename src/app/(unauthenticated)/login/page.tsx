import { signIn } from "@/auth"
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Metadata } from "next"
import { AuthError } from "next-auth"
import localFont from "next/font/local"
import { redirect } from "next/navigation"

const MsftIcons = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M7.462 0H0v7.19h7.462zM16 0H8.538v7.19H16zM7.462 8.211H0V16h7.462zm8.538 0H8.538V16H16z" />
    </svg>
  )
}

const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "log in | yookbeer",
}

export default async function SignInPage(props: { searchParams: { callbackUrl: string | undefined } }) {
  const spr = await props.searchParams
  return (
    <div className="flex min-h-screen w-screen flex-col bg-neutral-100">
      <div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
        <div className="py-auto z-50 flex flex-col gap-y-3">
          <h1 className={`${geistMono.className} text-center text-4xl`}>yookbeer</h1>
          <form
            action={async () => {
              "use server"
              try {
                await signIn("microsoft-entra-id", {
                  redirectTo: spr.callbackUrl ?? "",
                })
              } catch (error) {
                // Signin can fail for a number of reasons, such as the user
                // not existing, or the user not having the correct role.
                // In some cases, you may want to redirect to a custom error
                if (error instanceof AuthError) {
                  return redirect(`/login/err?error=${error.type}`)
                }

                // Otherwise if a redirects happens Next.js can handle it
                // so you can just re-thrown the error and let Next.js handle it.
                // Docs:
                // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
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
