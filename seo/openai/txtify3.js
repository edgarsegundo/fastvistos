import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { Readability } from '@mozilla/readability'
import { htmlToText } from 'html-to-text'

async function extractReadableText(url) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const dom = new JSDOM(html, { url })

    const article = new Readability(dom.window.document).parse()
    if (!article) return console.log('No readable content found.')

    const plainText = htmlToText(article.content, {
      wordwrap: 80,
      selectors: [
        { selector: 'p', format: 'block' },
        { selector: 'li', format: 'block' },
        { selector: 'h1', format: 'block' },
        { selector: 'h2', format: 'block' },
        { selector: 'h3', format: 'block' },
        { selector: 'h4', format: 'block' },
        { selector: 'h5', format: 'block' },
        { selector: 'h6', format: 'block' },
        { selector: 'div', format: 'block' }
      ]
    });

    console.log(plainText)
  } catch (err) {
    console.error(err)
  }
}

const url = 'https://g1.globo.com/turismo-e-viagem/noticia/2025/09/19/visto-americano-nova-regra-entrevista-presencial.ghtml'
extractReadableText(url)
