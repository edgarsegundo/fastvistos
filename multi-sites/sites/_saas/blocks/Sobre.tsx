import type { SobreProps } from './types';
import { mediaStyleToCss, styleHtmlAttrs, textStyleToCss } from './style-runtime';

/**
 * Bloco Sobre/Apresentação — texto (parágrafos separados por linha em branco)
 * + imagem opcional ao lado. Estático (zero JS), estilizado com tokens do tema.
 * `data-el`/`data-el-label` inertes na produção — mesmo padrão do Hero.
 */
export default function Sobre({ heading, text, imageUrl, imagePosition = 'right', headingStyle, textStyle, imageStyle }: SobreProps) {
    const paragraphs = (text ?? '').split(/\n\s*\n/).filter(Boolean);
    const imageFirst = imagePosition === 'left';
    const headingAttrs = styleHtmlAttrs(headingStyle?.heading);
    const textAttrs = styleHtmlAttrs(textStyle?.text);
    const imageAttrs = styleHtmlAttrs(imageStyle?.image);

    const image = imageUrl && (
        <img
            src={imageUrl}
            alt={heading || ''}
            loading="lazy"
            data-el="image"
            data-el-label="Imagem"
            id={imageAttrs.id}
            className={`w-full rounded-brand ${imageAttrs.className ?? ''}`.trim()}
            style={mediaStyleToCss(imageStyle?.image)}
        />
    );

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
                {imageFirst && image}
                <div>
                    {heading && (
                        <h2
                            data-el="heading"
                            data-el-label="Título"
                            id={headingAttrs.id}
                            className={`mb-4 font-heading text-3xl font-bold text-ink ${headingAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(headingStyle?.heading)}
                        >
                            {heading}
                        </h2>
                    )}
                    {paragraphs.length > 0 && (
                        <div
                            data-el="text"
                            data-el-label="Texto"
                            id={textAttrs.id}
                            className={textAttrs.className}
                            style={textStyleToCss(textStyle?.text)}
                        >
                            {paragraphs.map((p, i) => (
                                <p key={i} className="mb-4 text-muted leading-relaxed">{p}</p>
                            ))}
                        </div>
                    )}
                </div>
                {!imageFirst && image}
            </div>
        </section>
    );
}
