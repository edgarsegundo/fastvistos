/*
 * Campo customizado do Puck (type:'custom') pra ID/classe HTML customizados
 * por elemento — hook pra CSS externo (ex: um bloco HtmlSafe/CodeEmbed já
 * existente na página mirando `#meu-id` ou `.minha-classe`). Valida contra
 * ID_CLASS_RE (theme/validation.ts) a cada keystroke; inválido não propaga.
 */
import React, { useEffect, useState } from 'react';
import { isValidIdOrClass } from '../../theme/validation';

interface AttrsValue {
    id?: string;
    className?: string;
}

export function AttrsField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: AttrsValue;
    onChange: (v: AttrsValue | undefined) => void;
}) {
    const [id, setId] = useState(value?.id ?? '');
    const [className, setClassName] = useState(value?.className ?? '');
    useEffect(() => {
        setId(value?.id ?? '');
        setClassName(value?.className ?? '');
    }, [value?.id, value?.className]);

    function commit(nextId: string, nextClassName: string) {
        setId(nextId);
        setClassName(nextClassName);
        const classes = nextClassName.split(/\s+/).filter(Boolean);
        const out: AttrsValue = {};
        if (nextId && isValidIdOrClass(nextId)) out.id = nextId;
        if (classes.length && classes.every(isValidIdOrClass)) out.className = classes.join(' ');
        onChange(Object.keys(out).length ? out : undefined);
    }

    const idValid = id === '' || isValidIdOrClass(id);
    const classValid = className === '' || className.split(/\s+/).filter(Boolean).every(isValidIdOrClass);

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                    type="text"
                    value={id}
                    placeholder="id (ex: meu-titulo)"
                    onChange={(e) => commit(e.target.value, className)}
                    style={{ fontSize: 12, padding: '4px 8px', border: `1px solid ${idValid ? '#d1d5db' : '#dc2626'}`, borderRadius: 6 }}
                />
                <input
                    type="text"
                    value={className}
                    placeholder="classe (ex: minha-classe outra)"
                    onChange={(e) => commit(id, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px', border: `1px solid ${classValid ? '#d1d5db' : '#dc2626'}`, borderRadius: 6 }}
                />
            </div>
            {(!idValid || !classValid) && (
                <span style={{ fontSize: 11, color: '#dc2626' }}>
                    só letras/números/hífen/underscore, começando com letra
                </span>
            )}
        </div>
    );
}
