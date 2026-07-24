import { marked } from 'marked';
import type { RichTextProps } from './types';

/**
 * Bloco Texto Rico — sucessor do "modo markdown" de hoje.
 *
 * Converte markdown → HTML no build (marked, síncrono). Renderizado estático
 * pelo Astro (sem client:*), então não envia JS. Mantém a paridade com o
 * pipeline atual de [...slug].astro (gfm + breaks), sem sanitizar — igual a
 * hoje, o caminho markdown confia na saída do marked.
 */
export default function RichText({ markdown }: RichTextProps) {
    const html = marked.parse(markdown ?? '', { gfm: true, breaks: true }) as string;
    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* .block-richtext é estilizado em styles/saas.css com os tokens do tema */}
            <div className="block-richtext" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
