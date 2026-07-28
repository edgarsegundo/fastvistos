/*
 * Campo customizado do Puck (type:'custom') pra borda: largura, estilo, cor.
 * Valor OBJETO estruturado.
 */
import React from 'react';
import { HEX_RE } from '../../theme/validation';

interface BorderValue {
    width?: string;
    style?: 'solid' | 'dashed' | 'dotted' | 'none';
    color?: string;
}

export function BorderField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: BorderValue;
    onChange: (v: BorderValue | undefined) => void;
}) {
    function set(patch: Partial<BorderValue>) {
        const next = { ...value, ...patch };
        onChange(next.width || next.color || (next.style && next.style !== 'none') ? next : undefined);
    }

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <input
                    type="text"
                    value={value?.width ?? ''}
                    placeholder="largura (1px)"
                    onChange={(e) => set({ width: e.target.value })}
                    style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
                <select
                    value={value?.style ?? ''}
                    onChange={(e) => set({ style: (e.target.value || undefined) as BorderValue['style'] })}
                    style={{ fontSize: 12, padding: '4px 4px', border: '1px solid #d1d5db', borderRadius: 6 }}
                >
                    <option value="">estilo</option>
                    <option value="solid">sólida</option>
                    <option value="dashed">tracejada</option>
                    <option value="dotted">pontilhada</option>
                    <option value="none">nenhuma</option>
                </select>
                <input
                    type="text"
                    value={value?.color ?? ''}
                    placeholder="cor (#e5e7eb)"
                    onChange={(e) => set({ color: HEX_RE.test(e.target.value) || e.target.value === '' ? e.target.value : value?.color })}
                    style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
            </div>
        </div>
    );
}
