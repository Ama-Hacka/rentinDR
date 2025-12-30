const TARGET = "http://localhost:5174/owner/upload"
async function scrapeAndSend(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const meta = (p) => document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') || undefined
      const filterText = (t) => (t || '').trim()
      // Heuristic title extraction for Marketplace
      const candidates = []
      candidates.push(meta('og:title'))
      candidates.push(document.querySelector('h2')?.textContent)
      candidates.push(document.querySelector('[role="heading"]')?.textContent)
      candidates.push(document.querySelector('h1')?.textContent)
      const blacklist = /^(Chats|Marketplace|Facebook|Notificaciones?|Bandeja|Inbox)$/i
      let title = candidates
        .map(filterText)
        .filter((t) => t && !blacklist.test(t))
        .sort((a, b) => b.length - a.length)[0] || ''
      if (!title) {
        const altTitle = Array.from(document.querySelectorAll('img[alt]'))
          .map((i) => i.getAttribute('alt') || '')
          .map(filterText)
          .find((t) => /^Foto de\s+/i.test(t))
        if (altTitle) {
          title = altTitle.replace(/^Foto de\s+/i, '').trim()
        }
      }

      // Description: try og:description, or the largest paragraph/span block in the right panel
      let description = meta('og:description') || document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      if (!description) {
        const spans = Array.from(document.querySelectorAll('span[dir="auto"], div[dir="auto"], p'))
        const texts = spans.map((el) => el.textContent || '').map(filterText).filter((t) => t && t.length > 40)
        description = texts.sort((a, b) => b.length - a.length)[0] || ''
      }

      // Price and attributes
      const allText = Array.from(document.body.querySelectorAll('*'))
        .map((el) => (el instanceof HTMLElement ? el.innerText : ''))
        .join(' ')
      const priceMatch = allText.match(/[$€£]\s?([\d.,]+)/)
      const roomsMatch = allText.match(/(\d+)\s*(habitaciones|dormitorios)/i)
      const bathsMatch = allText.match(/(\d+)\s*bañ(o|os|os)/i)
      const sqftMatch = allText.match(/(\d+)\s*(pies cuadrados|sq\s?ft|ft²)/i)
      const sqmMatch = allText.match(/(\d+)\s*(m2|m²|metros cuadrados)/i)
      let price = undefined
      if (priceMatch) {
        price = parseInt(priceMatch[1].replace(/[^\d]/g, ''), 10)
      }
      let rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : undefined
      let squareMeters = undefined
      if (sqmMatch) {
        squareMeters = parseInt(sqmMatch[1], 10)
      } else if (sqftMatch) {
        const sqft = parseInt(sqftMatch[1], 10)
        if (!isNaN(sqft)) {
          squareMeters = Math.round(sqft * 0.092903)
        }
      }

      // Images: prefer og:image, else visible fbcdn images in carousel/right panel
      const ogImgs = Array.from(document.querySelectorAll('meta[property="og:image"]')).map(m => m.getAttribute('content')).filter(Boolean)
      let images = ogImgs
      if (images.length === 0) {
        const imgs = Array.from(document.querySelectorAll('img'))
          .map((i) => i.currentSrc || i.src)
          .filter((u) => u && /^https?:\/\//.test(u))
          .filter((u) => /fbcdn|scontent|fna\.fbcdn\.net/i.test(u))
        // dedupe and prefer larger urls
        const dedup = Array.from(new Set(imgs)).slice(0, 12)
        images = dedup
      }
      images = images.slice(0, 10)
      const data = { title, description, images, source_url: location.href, price, rooms, squareMeters }
      return data
    }
  })
  const data = result?.result || {}
  const encoded = btoa(JSON.stringify(data))
  const url = `${TARGET}?import=${encoded}`
  await chrome.tabs.create({ url })
}
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return
  await scrapeAndSend(tab.id)
})
