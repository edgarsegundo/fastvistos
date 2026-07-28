/*
 * Campo customizado do Puck (type:'custom') pro escape hatch de CSS
 * customizado: textarea de declarações `propriedade: valor;` (nunca um
 * bloco <style> com seletor livre). Usa `parseInlineCss` (theme/validation.ts
 * — MESMA função usada como defesa em profundidade no render e espelhada no
 * Django). Só propaga o subconjunto JÁ VALIDADO pro `onChange`; declarações
 * rejeitadas ficam listadas abaixo do textarea, mas nunca são salvas.
 */
import React, { useEffect, useState } from 'react';
import { parseInlineCss } from '../../theme/validation';

function camelToKebab(prop: string): string {
    return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toText(value?: Record<string, string>): string {
    if (!value) return '';
    return Object.entries(value)
        .map(([k, v]) => `${camelToKebab(k)}: ${v};`)
        .join('\n');
}

export function CssField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: Record<string, string>;
    onChange: (v: Record<string, string> | undefined) => void;
}) {
    const [draft, setDraft] = useState(() => toText(value));
    const [errors, setErrors] = useState<string[]>([]);
    useEffect(() => setDraft(toText(value)), [value]);

    function handleChange(raw: string) {
        setDraft(raw);
        const { style, errors: parseErrors } = parseInlineCss(raw);
        setErrors(parseErrors);
        onChange(Object.keys(style).length ? style : undefined);
    }

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <textarea
                value={draft}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={'text-shadow: 0 2px 4px rgba(0,0,0,.3);'}
                rows={3}
                style={{
                    width: '100%',
                    fontSize: 12,
                    fontFamily: 'ui-monospace, monospace',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    resize: 'vertical',
                }}
            />
            {errors.length > 0 && (
                <div style={{ marginTop: 4 }}>
                    {errors.map((e, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#dc2626', textDecoration: 'line-through' }}>
                            {e}
                        </div>
                    ))}
                    <div style={{ fontSize: 11, color: '#dc2626' }}>rejeitado (propriedade fora da lista ou valor perigoso)</div>
                </div>
            )}
        </div>
    );
}
