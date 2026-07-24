import type { HtmlSafeProps } from './types';

/**
 * Bloco HTML Seguro — sucessor do "modo html_safe" de hoje.
 *
 * IMPORTANTE: o HTML já chega SANITIZADO daqui (bleach no Django, na
 * serialização dos blocos pra API de build — ver core/models.py). Este
 * componente NÃO é a fronteira de segurança; ele só injeta o HTML limpo.
 * Nunca mover a sanitização pra cá (client-side/build-side é burlável).
 */
export default function HtmlSafe({ html }: HtmlSafeProps) {
    return (
        <div
            className="block-htmlsafe"
            dangerouslySetInnerHTML={{ __html: html ?? '' }}
        />
    );
}
