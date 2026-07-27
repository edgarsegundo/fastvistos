/*
 * Campo customizado do Puck (type:'custom') que renderiza um toggle switch
 * sutil à direita do nome do elemento — usado para Mostrar/Ocultar cada
 * elemento do Hero. Valor 'yes' | 'no' (undefined = ligado). Quando 'no', os
 * campos de conteúdo daquele elemento colapsam (via `hideWhen` no adapter).
 * Estilos inline de propósito: o painel do Puck é contexto próprio, fora do
 * Tailwind/tema dos blocos.
 */
import React from 'react';

export function ToggleField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
}) {
    const on = value !== 'no';
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '2px 0',
            }}
        >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? 'Ocultar' : 'Mostrar'} ${label}`}
                onClick={() => onChange(on ? 'no' : 'yes')}
                style={{
                    position: 'relative',
                    width: 36,
                    height: 20,
                    flex: 'none',
                    padding: 0,
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    background: on ? '#2563eb' : '#cbd5e1',
                    transition: 'background .15s ease',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: 2,
                        left: on ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                        transition: 'left .15s ease',
                    }}
                />
            </button>
        </div>
    );
}
