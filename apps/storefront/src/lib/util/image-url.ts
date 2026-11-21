const isLoopbackHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "0.0.0.0" ||
  hostname === "[::1]"

export const resolveImageUrl = (imageUrl: string) => {
  if (!/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  const parsedUrl = new URL(imageUrl)

  if (!isLoopbackHost(parsedUrl.hostname)) {
    return imageUrl
  }

  const imagePath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`

  if (parsedUrl.pathname.startsWith("/static/")) {
    const staticPath = parsedUrl.pathname.slice("/static/".length)
    return `/medusa-assets/${staticPath}${parsedUrl.search}${parsedUrl.hash}`
  }

  return imagePath
}
