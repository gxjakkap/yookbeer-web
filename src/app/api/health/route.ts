import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse(JSON.stringify({ status: 200 }), { status: 200 })
}
