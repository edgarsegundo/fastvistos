/*
 * Campo customizado do Puck (type:'custom') pra valores numéricos com ou sem
 * unidade (tamanho, peso, altura de linha, espaçamento, raio...). Sem
 * unidades (`units:[]`) = input puramente numérico (ex: peso de fonte,
 * altura de linha). Serializa sempre como string (ex: "18px", "1.4", "600").
 */
import React, { useEffect, useState } from 'react';

function splitValue(v?: string): { num: string; unit: string } {
    if (!v) return { num: '', unit: '' };
    const m = /^(-?[0-9.]+)\s*([a-z%]*)$/i.exec(v.trim());
    return m ? { num: m[1], unit: m[2] } : { num: '', unit: '' };
}

export function DimensionField({
    label,
    value,
    onChange,
    units = [],
    range,
}: {
    label: string;
    value?: string;
    onChange: (v: string | undefined) => void;
    units?: string[];
    range?: { min: number; max: number; step?: number };
}) {
    const [state, setState] = useState(() => splitValue(value));
    useEffect(() => setState(splitValue(value)), [value]);

    function commit(num: string, unit: string) {
        setState({ num, unit });
        if (num === '') {
            onChange(undefined);
            return;
        }
        onChange(units.length > 0 ? `${num}${unit || units[0]}` : num);
    }

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="number"
                    value={state.num}
                    min={range?.min}
                    max={range?.max}
                    step={range?.step ?? 1}
                    placeholder="herdar"
                    onChange={(e) => commit(e.target.value, state.unit || units[0] || '')}
                    style={{ flex: 1, fontSize: 13, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}
                />
                {units.length > 0 && (
                    <select
                        value={state.unit || units[0]}
                        onChange={(e) => commit(state.num, e.target.value)}
                        style={{ fontSize: 13, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }}
                    >
                        {units.map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </select>
                )}
                {value && (
                    <button
                        type="button"
                        aria-label={`Limpar ${label}`}
                        onClick={() => commit('', '')}
                        style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
                    >
                        limpar
                    </button>
                )}
            </div>
        </div>
    );
}
