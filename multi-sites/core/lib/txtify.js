import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { Readability } from '@mozilla/readability'
import { htmlToText } from 'html-to-text'

export async function extractReadableText(url) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const dom = new JSDOM(html, { url })
    const article = new Readability(dom.window.document).parse()

    if (!article) {
      console.warn('No readable content found.')
      return null
    }

    // Convert HTML to readable plain text with spacing between logical blocks
    let text = htmlToText(article.content, {
      wordwrap: 100,
      selectors: [
        { selector: 'p', format: 'block' },
        { selector: 'li', format: 'block' },
        { selector: 'h1,h2,h3', format: 'block' },
      ],
    })

    // 🧹 Clean text — preserve structure but remove noise
    text = text
      .replace(/https?:\/\/\S+/g, '')          // remove URLs
      .replace(/[^\w\sÀ-ÿ.,!?()\n]/g, '')      // remove stray symbols
      .replace(/\n{3,}/g, '\n\n')              // collapse excess blank lines
      .replace(/[ \t]+/g, ' ')                 // remove extra spaces/tabs
      .replace(/(\.)(?=[^\s\n])/g, '. ')       // ensure space after periods
      .trim()

    // ✂️ Deduplicate identical or near-identical lines
    const uniqueLines = []
    const seen = new Set()

    text.split('\n').forEach(line => {
      const clean = line.trim()
      if (!clean) return

      // Use normalized lowercase line for duplicate detection
      const key = clean.toLowerCase().replace(/\s+/g, ' ')
      if (!seen.has(key)) {
        seen.add(key)
        uniqueLines.push(clean)
      }
    })

    return uniqueLines.join('\n')

  } catch (err) {
    console.error('Error extracting article:', err)
    return null
  }
}
