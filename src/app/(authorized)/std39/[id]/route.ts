import { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return Response.redirect(new URL(`${req.nextUrl.origin}/std/${id}`))
}