import type { CodeEmbedProps } from './types';

/**
 * Bloco Code Embed — sucessor do "modo html_custom" de hoje (seção 7 da spec).
 * HTML+CSS+JS do usuário isolado num iframe sandbox.
 *
 * Nota: o React 19 SSR emite o atributo como `srcDoc` (camelCase); o parser
 * HTML5 minúscula nomes de atributo na tokenização, então vira `srcdoc` no
 * browser — funciona em todos os navegadores, é só cosmético no HTML gerado.
 *
 * TODO(fase 6 — nota de risco da seção 7): a combinação
 * `allow-scripts` + `allow-same-origin` neutraliza parte do isolamento do
 * sandbox (o iframe alcança o DOM/origin do documento pai). Herdada como
 * está do mecanismo atual só pra não regredir na fase 0 — NÃO deve
 * sobreviver ao v1. Revisar antes de liberar Code Embed pra usuário final.
 */
export default function CodeEmbed({ html, minHeight = 600 }: CodeEmbedProps) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <iframe
                className="block-codeembed w-full rounded-brand border-0"
                srcDoc={html ?? ''}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                style={{ minHeight: `${minHeight}px` }}
            />
        </div>
    );
}
