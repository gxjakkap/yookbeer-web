import { NextRequest } from "next/server"

export const dynamic = "force-static"

export async function GET(req: NextRequest) {
  return Response.redirect(new URL(`${req.nextUrl.origin}/gen/39`))
}
