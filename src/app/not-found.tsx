import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "not found | yookbeer",
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex items-center gap-6">
        <h1 className="text-[48px] font-medium leading-none">404</h1>
        <div className="h-16 w-px bg-black/10" />
        <h2 className="text-[24px] leading-none">This page could not be found.</h2>
      </div>
    </div>
  )
}
