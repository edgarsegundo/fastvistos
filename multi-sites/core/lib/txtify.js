
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { Readability } from '@mozilla/readability'
import { htmlToText } from 'html-to-text'

export async function extractReadableText(url) {
    // return "** extractReadableText called.";
    let text = null;
    try {
        const response = await fetch(url)
        const html = await response.text()
        const dom = new JSDOM(html, { url })
        const article = new Readability(dom.window.document).parse()

        if (!article) {
            console.log('No readable content found.')
            return;
        }

        // Convert to text with spacing between blocks
        text = htmlToText(article.content, {
        wordwrap: 100,
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
        })

        // 🧹 Clean but keep readable structure
        text = text
        .replace(/https?:\/\/\S+/g, '')         // remove URLs
        .replace(/[^\w\sÀ-ÿ.,!?()\n]/g, '')     // remove symbols but keep line breaks
        .replace(/\n{3,}/g, '\n\n')             // collapse extra blank lines
        .replace(/[ \t]+/g, ' ')                // remove extra spaces/tabs
        .replace(/(\.)(?=[^\s\n])/g, '. ')      // ensure space after periods
        .trim()
    } catch (err) {
        console.error('Error extracting article:', err);
    }

    return text;
}
