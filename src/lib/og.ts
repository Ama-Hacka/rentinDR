export interface OGData {
  title?: string
  description?: string
  images?: string[]
}

function absoluteUrl(url: string, base: string) {
  try {
    return new URL(url, base).toString()
  } catch {
    return url
  }
}

export async function fetchOG(url: string): Promise<OGData> {
  const proxied =
    url.startsWith('https://')
      ? `https://r.jina.ai/https://${url.replace(/^https?:\/\//, '')}`
      : `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`
  let html = ''
  try {
    const res = await fetch(proxied, { mode: 'cors' })
    if (res.ok) {
      html = await res.text()
    }
  } catch {}
  if (!html) return {}
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const base = url
  const meta = (prop: string) => doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || undefined
  const name = (n: string) => doc.querySelector(`meta[name="${n}"]`)?.getAttribute('content') || undefined
  const ogImages = Array.from(doc.querySelectorAll('meta[property="og:image"]')).map(m => m.getAttribute('content') || '').filter(Boolean)
  const images = ogImages.length > 0 ? ogImages.map(i => absoluteUrl(i, base)) : []
  const title = meta('og:title') || doc.querySelector('title')?.textContent || undefined
  const description = meta('og:description') || name('description') || undefined
  return { title, description, images }
}
