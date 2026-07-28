/*
 * Campo customizado do Puck (type:'custom') pra fonte: <select> das chaves
 * do FONT_CATALOG (theme/fonts.ts) — mesma fonte de verdade do painel de
 * Tema, nunca duplicada. "(herdar do tema)" = undefined.
 */
import React from 'react';
import { FONT_NAMES } from '../../theme/fonts';

export function FontField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: string;
    onChange: (v: string | undefined) => void;
}) {
    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value || undefined)}
                style={{ width: '100%', fontSize: 13, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}
            >
                <option value="">(herdar do tema)</option>
                {FONT_NAMES.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
}
