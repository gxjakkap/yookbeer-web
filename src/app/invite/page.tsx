import { auth, signOut } from "@/auth"
import { RedeemForm } from "@/components/redeemform"
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Metadata } from "next"
import localFont from "next/font/local"
import { redirect } from "next/navigation"

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "redeem invite | yookbeer",
}

export default async function InvitePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen w-screen flex-col bg-neutral-100">
      <div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
        <div className="py-auto z-50 flex flex-col gap-y-3">
          <h1 className={`${geistMono.className} text-center text-4xl`}>Enter Invite Code.</h1>
          <RedeemForm />
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
