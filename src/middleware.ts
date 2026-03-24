import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
	if (!req.auth) {
		const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
		return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
	}
})

export const config = {
	matcher: [
		"/",
		"/gen/:path*",
		"/std/:path*",
		"/not-attending",
		"/admin/:path*",
		"/noaccess",
		"/invite/:path*",
	],
}
