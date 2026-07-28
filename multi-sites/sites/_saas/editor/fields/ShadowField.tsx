/*
 * Campo customizado do Puck (type:'custom') pra sombra: presets rápidos +
 * form editável (cor/x/y/blur/spread). Valor é OBJETO estruturado, nunca
 * string CSS crua (evita ter que parsear `box-shadow` livre).
 */
import React from 'react';
import { HEX_RE } from '../../theme/validation';

interface ShadowValue {
    color?: string;
    x?: string;
    y?: string;
    blur?: string;
    spread?: string;
}

const PRESETS: Record<string, ShadowValue | undefined> = {
    Nenhuma: undefined,
    Suave: { color: '#00000022', x: '0px', y: '1px', blur: '2px', spread: '0px' },
    Média: { color: '#00000033', x: '0px', y: '4px', blur: '8px', spread: '0px' },
    Forte: { color: '#00000044', x: '0px', y: '10px', blur: '20px', spread: '-3px' },
};

export function ShadowField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: ShadowValue;
    onChange: (v: ShadowValue | undefined) => void;
}) {
    function set(patch: Partial<ShadowValue>) {
        onChange({ ...value, ...patch });
    }

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                {Object.entries(PRESETS).map(([name, preset]) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onChange(preset)}
                        style={{
                            fontSize: 12,
                            padding: '3px 8px',
                            borderRadius: 999,
                            border: '1px solid #d1d5db',
                            background: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        {name}
                    </button>
                ))}
            </div>
            {value && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <input
                        type="text"
                        value={value.color ?? ''}
                        placeholder="cor (#000000aa)"
                        onChange={(e) => set({ color: HEX_RE.test(e.target.value) || e.target.value === '' ? e.target.value : value.color })}
                        style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6, gridColumn: '1 / -1' }}
                    />
                    <input type="text" value={value.x ?? ''} placeholder="x (0px)" onChange={(e) => set({ x: e.target.value })}
                        style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                    <input type="text" value={value.y ?? ''} placeholder="y (2px)" onChange={(e) => set({ y: e.target.value })}
                        style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                    <input type="text" value={value.blur ?? ''} placeholder="blur (4px)" onChange={(e) => set({ blur: e.target.value })}
                        style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                    <input type="text" value={value.spread ?? ''} placeholder="spread (0px)" onChange={(e) => set({ spread: e.target.value })}
                        style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                </div>
            )}
        </div>
    );
}
