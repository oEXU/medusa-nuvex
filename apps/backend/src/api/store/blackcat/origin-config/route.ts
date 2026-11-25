import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const publicKey = process.env.BLACKCAT_PUBLIC_KEY
  if (!publicKey) {
    return res.status(503).json({ error: "blackcat_origin_not_configured" })
  }

  const scriptUrl = new URL("https://psmservices.blackmasterx.com/origem/v1.js")
  scriptUrl.searchParams.set("chave", publicKey)
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300")
  return res.json({ script_url: scriptUrl.toString() })
}
