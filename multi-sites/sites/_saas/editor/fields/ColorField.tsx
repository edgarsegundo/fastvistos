/*
 * Campo customizado do Puck (type:'custom') pra cor: <input type="color"> +
 * hex editável + "limpar" (volta a undefined = herda do tema). Valida contra
 * o mesmo HEX_RE de theme/validation.ts antes de propagar — inválido não
 * chama onChange, só marca erro local até o usuário corrigir.
 */
import React, { useEffect, useState } from 'react';
import { HEX_RE } from '../../theme/validation';

export function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: string;
    onChange: (v: string | undefined) => void;
}) {
    const [draft, setDraft] = useState(value ?? '');
    useEffect(() => setDraft(value ?? ''), [value]);
    const valid = draft === '' || HEX_RE.test(draft);

    function commit(next: string) {
        setDraft(next);
        if (next === '') {
            onChange(undefined);
        } else if (HEX_RE.test(next)) {
            onChange(next);
        }
    }

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="color"
                    value={HEX_RE.test(draft) ? draft : '#000000'}
                    onChange={(e) => commit(e.target.value)}
                    style={{ width: 32, height: 28, padding: 0, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}
                />
                <input
                    type="text"
                    value={draft}
                    placeholder="herdar do tema"
                    onChange={(e) => commit(e.target.value)}
                    style={{
                        flex: 1,
                        fontSize: 13,
                        padding: '4px 8px',
                        border: `1px solid ${valid ? '#d1d5db' : '#dc2626'}`,
                        borderRadius: 6,
                    }}
                />
                {value && (
                    <button
                        type="button"
                        aria-label={`Limpar ${label}`}
                        onClick={() => commit('')}
                        style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
                    >
                        limpar
                    </button>
                )}
            </div>
            {!valid && <span style={{ fontSize: 11, color: '#dc2626' }}>Hex inválido (ex: #2563eb)</span>}
        </div>
    );
}
