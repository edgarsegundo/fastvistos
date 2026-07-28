/*
 * Campo customizado do Puck (type:'custom') que renderiza TODOS os grupos de
 * Aparência de um bloco (um <details> por elemento). É UM field único (não
 * `object` aninhado nativo do Puck) porque o `object` do Puck 0.20.2 não
 * expõe `id`/`data-*` estável (só classes hasheadas por CSS-module) — sem
 * isso não dá pra ancorar o clique-no-canvas→rolar/expandir (ver
 * editor/App.tsx) de forma determinística. Aqui o componente é dono do
 * próprio DOM, então `id="appearance-group-<key>"` usa a MESMA string do
 * `data-el` no render — zero tabela de tradução.
 *
 * Reaproveita `toPuckField` (adapter.tsx) pros campos-folha — mesmo
 * contrato controlado (`value`/`onChange`) usado em qualquer outro campo.
 * Recebido via prop (`renderField`), não importado direto: `adapter.tsx`
 * importa ESTE arquivo (pro case 'elementStyles'), então o inverso criaria
 * import circular — o adapter passa a própria função pra dentro.
 */
import React, { Fragment } from 'react';
import type { FieldSchema } from '../../blocks/registry';

/**
 * `renderField` (= `toPuckField`) só devolve `{render}` pra tipos `custom`.
 * Tipos NATIVOS do Puck (aqui só 'select'/'radio' aparecem dentro de um
 * grupo de estilo, ex: `align`) voltam `{type,label,options}` sem `render` —
 * fallback próprio pra esses, com o mesmo contrato controlado.
 */
function NativeSelectLeaf({
    schema,
    value,
    onChange,
}: {
    schema: FieldSchema;
    value?: string;
    onChange: (v: string | undefined) => void;
}) {
    const options = (schema.options ?? []).map((o) => (typeof o === 'string' ? { label: o, value: o } : o));
    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {schema.label}
            </span>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value || undefined)}
                style={{ width: '100%', fontSize: 13, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}
            >
                <option value="">(herdar do tema)</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function ElementStylesField({
    groups,
    value,
    onChange,
    renderField,
}: {
    groups: Record<string, FieldSchema>;
    value?: Record<string, any>;
    onChange: (v: Record<string, any>) => void;
    renderField: (f: FieldSchema) => { render: (props: any) => React.ReactNode };
}) {
    return (
        <div className="appearance-panel">
            {Object.entries(groups).map(([key, group]) => (
                <details key={key} id={`appearance-group-${key}`} className="appearance-group">
                    <summary>{group.label}</summary>
                    <div className="appearance-group-body">
                        {Object.entries(group.objectFields ?? {}).map(([leafKey, leafSchema]) => {
                            const leafValue = value?.[key]?.[leafKey];
                            const setLeaf = (v: any) => onChange({ ...value, [key]: { ...value?.[key], [leafKey]: v } });
                            if (leafSchema.type === 'select' || leafSchema.type === 'radio') {
                                return (
                                    <Fragment key={leafKey}>
                                        <NativeSelectLeaf schema={leafSchema} value={leafValue} onChange={setLeaf} />
                                    </Fragment>
                                );
                            }
                            const { render } = renderField(leafSchema);
                            return <Fragment key={leafKey}>{render({ value: leafValue, onChange: setLeaf })}</Fragment>;
                        })}
                    </div>
                    {value?.[key] != null && (
                        <button
                            type="button"
                            className="appearance-group-reset"
                            onClick={() => onChange({ ...value, [key]: undefined })}
                        >
                            Restaurar padrão
                        </button>
                    )}
                </details>
            ))}
        </div>
    );
}
