import { auth, signOut } from "@/auth"
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import localFont from "next/font/local"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "no access | yookbeer"
}
 
export default async function NoAccessPage() {
    const session = await auth()

    if (!session){
        redirect("/login")
    }
    return (
        <div className="flex flex-col bg-neutral-100 w-screen min-h-screen">
            <div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
                <div className="flex flex-col gap-y-3 py-auto z-50">
                    <h1 className={`${geistMono.className} text-4xl text-center`}>No Access</h1>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({
                                redirectTo: '/login'
                            })
                        }}
                        className="flex flex-col"
                    >
                        <Button type="submit" className="mx-auto">
                            <span>Sign out</span>
                        </Button>
                    </form>
                    <h2 className={`${geistMono.className} text-2xl text-center`}>Have an invite code?</h2>
                    <Link href="/invite" className="mx-auto">
                        <Button className="mx-auto">
                            Redeem an invite code
                        </Button>
                    </Link>
                </div>
                <AnimatedGridPattern
                    numSquares={30}
                    maxOpacity={0.1}
                    duration={3}
                    repeatDelay={1}
                    className={cn(
                        "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                        "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
                    )}
                />
            </div>
        </div>
    )
}