import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

function getDimensions(filePath: string) {
  try {
    const buffer = fs.readFileSync(filePath)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), type: "png" }
    }
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break
        const marker = buffer[offset + 1]
        if (marker === 0xC0 || marker === 0xC2) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7), type: "jpeg" }
        }
        offset += 2 + buffer.readUInt16BE(offset + 2)
      }
    }
  } catch (e) {}
  return null
}

export default async function cleanLowResProductImages({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "images.*",
    ],
  })

  const staticDir = path.resolve(process.cwd(), "static")
  let updatedCount = 0

  for (const p of products) {
    if (!p.images || p.images.length === 0) continue

    const imagesWithDim = p.images.map((img: any) => {
      let dim = null
      if (img.url?.includes("/static/")) {
        const filename = decodeURIComponent(img.url.split("/static/")[1])
        dim = getDimensions(path.join(staticDir, filename))
      }
      return { id: img.id, url: img.url, dim }
    })

    // High-res: non-static images OR images where max(width, height) >= 500
    const highRes = imagesWithDim.filter(
      (img: any) => !img.dim || Math.max(img.dim.width, img.dim.height) >= 500
    )
    // Low-res: static images with max(width, height) < 500
    const lowRes = imagesWithDim.filter(
      (img: any) => img.dim && Math.max(img.dim.width, img.dim.height) < 500
    )

    // Only update if product has low-res images AND at least one high-res image
    if (lowRes.length > 0 && highRes.length > 0) {
      console.log(`Cleaning product: "${p.title}" (${p.handle})`)
      console.log(`  Current total images: ${imagesWithDim.length} (${lowRes.length} low-res, ${highRes.length} high-res)`)

      // Check current thumbnail
      let newThumbnail = p.thumbnail
      const currentThumbDim = p.thumbnail?.includes("/static/")
        ? getDimensions(path.join(staticDir, decodeURIComponent(p.thumbnail.split("/static/")[1])))
        : null

      if (!currentThumbDim || Math.max(currentThumbDim.width, currentThumbDim.height) < 500) {
        newThumbnail = highRes[0].url
        console.log(`  Updating thumbnail to high-res: ${newThumbnail}`)
      }

      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: p.id },
          update: {
            thumbnail: newThumbnail,
            images: highRes.map((img: any) => ({ url: img.url })),
          },
        },
      })
      updatedCount++
      console.log(`  Done: now has ${highRes.length} high-res images.\n`)
    }
  }

  console.log(`========================================`)
  console.log(`Successfully cleaned ${updatedCount} products!`)
  console.log(`========================================\n`)
}
