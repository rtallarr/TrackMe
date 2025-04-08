import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.json()

  const response = NextResponse.json({ ok: true })

  response.cookies.set("usernames", JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return response
}