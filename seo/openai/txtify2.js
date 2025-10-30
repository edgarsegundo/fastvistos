import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { Readability } from '@mozilla/readability'

async function extractReadableText(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)

    const html = await response.text()
    const dom = new JSDOM(html, { url })
    const article = new Readability(dom.window.document).parse()

    if (!article) {
      console.log('No readable content found.')
      return;
    }

    console.log(article.textContent.trim())
  } catch (err) {
    console.error('Error extracting article:', err.message)
  }
}

const url = 'https://g1.globo.com/turismo-e-viagem/noticia/2025/09/19/visto-americano-nova-regra-entrevista-presencial.ghtml'
extractReadableText(url)
