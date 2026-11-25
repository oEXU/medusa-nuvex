import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId")
  if (!sessionId || !/^payses_[a-zA-Z0-9_-]+$/.test(sessionId)) {
    return NextResponse.json({ error: "payment_not_found" }, { status: 404 })
  }

  try {
    const result = await sdk.client.fetch<{ payment: Record<string, unknown> }>(
      `/store/blackcat/payment-session/${encodeURIComponent(sessionId)}`,
      { method: "GET", cache: "no-store" }
    )
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json({ error: "payment_not_found" }, { status: 404 })
  }
}
