/*
 * Campo customizado do Puck (type:'custom') pra formatação inline estilo
 * Carrd — toolbar de botões (negrito/itálico/link/cor/etc) que envolve a
 * seleção do `<textarea>` com a sintaxe reconhecida por
 * blocks/inline-markup.ts::parseInlineMarkup (mesmo parser formata o
 * preview aqui E a produção). O usuário nunca precisa digitar os símbolos
 * — a toolbar insere/envolve; digitar manualmente continua funcionando
 * como escape hatch (mesmo padrão de qualquer editor Markdown).
 *
 * `<textarea>` nativo (não contentEditable) — `selectionStart`/`selectionEnd`
 * já dão a seleção sem precisar de Range API. Isso é o que torna essa
 * feature Degrau 1/1.5 em vez de Degrau 2 (ver plano).
 */
import React, { useRef, useState } from 'react';
import { HEX_RE } from '../../theme/validation';

interface ToolbarAction {
    label: string;
    title: string;
    style?: React.CSSProperties;
    before: string;
    after: string;
}

const ACTIONS: ToolbarAction[] = [
    { label: 'B', title: 'Negrito', style: { fontWeight: 700 }, before: '**', after: '**' },
    { label: 'I', title: 'Itálico', style: { fontStyle: 'italic' }, before: '_', after: '_' },
    { label: 'B/I', title: 'Negrito + itálico', style: { fontWeight: 700, fontStyle: 'italic' }, before: '***', after: '***' },
    { label: 'U', title: 'Sublinhado', style: { textDecoration: 'underline' }, before: '__', after: '__' },
    { label: '</>', title: 'Código', style: { fontFamily: 'monospace' }, before: '`', after: '`' },
    { label: 'S', title: 'Riscado', style: { textDecoration: 'line-through' }, before: '~~', after: '~~' },
    { label: 'H', title: 'Highlight', style: { background: '#fef08a', borderRadius: 2 }, before: '==', after: '==' },
    { label: 'X₂', title: 'Subscrito', before: '~', after: '~' },
    { label: 'X²', title: 'Sobrescrito', before: '^', after: '^' },
    { label: '···', title: 'Spoiler (revela ao clicar)', before: '||', after: '||' },
];

function ColorPopover({
    label,
    onApply,
    onClose,
}: {
    label: string;
    onApply: (hex: string) => void;
    onClose: () => void;
}) {
    const [hex, setHex] = useState('#2563eb');
    const valid = HEX_RE.test(hex);
    return (
        <div
            style={{
                position: 'absolute', zIndex: 10, top: '100%', left: 0, marginTop: 4,
                background: '#fff', border: '1px solid #d1d5db', borderRadius: 8,
                padding: 10, boxShadow: '0 4px 14px rgba(0,0,0,.12)', display: 'flex',
                flexDirection: 'column', gap: 8, width: 180,
            }}
        >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                    type="color"
                    value={valid ? hex : '#2563eb'}
                    onChange={(e) => setHex(e.target.value)}
                    style={{ width: 28, height: 26, padding: 0, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}
                />
                <input
                    type="text"
                    value={hex}
                    onChange={(e) => setHex(e.target.value)}
                    style={{ flex: 1, fontSize: 12, padding: '4px 6px', border: `1px solid ${valid ? '#d1d5db' : '#dc2626'}`, borderRadius: 6 }}
                />
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ fontSize: 11, padding: '4px 8px', border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' }}>
                    cancelar
                </button>
                <button
                    type="button"
                    disabled={!valid}
                    onClick={() => valid && onApply(hex)}
                    style={{ fontSize: 11, padding: '4px 10px', border: 'none', borderRadius: 6, background: valid ? '#2563eb' : '#93c5fd', color: '#fff', cursor: valid ? 'pointer' : 'default' }}
                >
                    aplicar
                </button>
            </div>
        </div>
    );
}

export function RichTextField({
    label,
    value,
    onChange,
    id,
}: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
    /** `content-field-<key>` — alvo do clique-no-canvas (editor/App.tsx), mesmo padrão de `appearance-group-<key>`. */
    id?: string;
}) {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const [popover, setPopover] = useState<'fg' | 'bg' | null>(null);
    const [hint, setHint] = useState('');

    function applyToSelection(before: string, after: string) {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart: start, selectionEnd: end, value: current } = ta;
        const next = current.slice(0, start) + before + current.slice(start, end) + after + current.slice(end);
        onChange(next);
        const newStart = start + before.length;
        const newEnd = end + before.length;
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(newStart, newEnd);
        });
    }

    function insertLiteral(char: string) {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart: start, selectionEnd: end, value: current } = ta;
        const next = current.slice(0, start) + char + current.slice(end);
        onChange(next);
        const pos = start + char.length;
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(pos, pos);
        });
    }

    function applyColor(kind: 'fg' | 'bg', hex: string) {
        const ta = taRef.current;
        if (!ta || ta.selectionStart === ta.selectionEnd) {
            setHint('Selecione um trecho de texto antes de escolher a cor.');
            setPopover(null);
            return;
        }
        applyToSelection('[', `]{${kind}:${hex}}`);
        setPopover(null);
        setHint('');
    }

    function insertLink() {
        const url = window.prompt('Link (https://...):', 'https://');
        if (!url) return;
        applyToSelection('[', `](${url})`);
    }

    return (
        <div id={id} style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {ACTIONS.map((a) => (
                    <button
                        key={a.title}
                        type="button"
                        title={a.title}
                        onClick={() => applyToSelection(a.before, a.after)}
                        style={{
                            minWidth: 26, height: 26, padding: '0 5px', fontSize: 12,
                            border: '1px solid #d1d5db', borderRadius: 5, background: '#fff',
                            cursor: 'pointer', ...a.style,
                        }}
                    >
                        {a.label}
                    </button>
                ))}
                <button type="button" title="Link" onClick={insertLink}
                    style={{ minWidth: 26, height: 26, padding: '0 5px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 5, background: '#fff', cursor: 'pointer' }}>
                    🔗
                </button>
                <div style={{ position: 'relative' }}>
                    <button type="button" title="Cor do texto" onClick={() => setPopover(popover === 'fg' ? null : 'fg')}
                        style={{ minWidth: 26, height: 26, padding: '0 5px', fontSize: 12, fontWeight: 700, borderBottom: '2px solid #dc2626', border: '1px solid #d1d5db', borderRadius: 5, background: '#fff', cursor: 'pointer' }}>
                        A
                    </button>
                    {popover === 'fg' && (
                        <ColorPopover label="Cor do texto" onApply={(hex) => applyColor('fg', hex)} onClose={() => setPopover(null)} />
                    )}
                </div>
                <div style={{ position: 'relative' }}>
                    <button type="button" title="Cor de fundo" onClick={() => setPopover(popover === 'bg' ? null : 'bg')}
                        style={{ minWidth: 26, height: 26, padding: '0 5px', fontSize: 12, fontWeight: 700, background: '#fef08a', border: '1px solid #d1d5db', borderRadius: 5, cursor: 'pointer' }}>
                        A
                    </button>
                    {popover === 'bg' && (
                        <ColorPopover label="Cor de fundo" onApply={(hex) => applyColor('bg', hex)} onClose={() => setPopover(null)} />
                    )}
                </div>
                <button type="button" title="Espaço não-quebrável" onClick={() => insertLiteral(' ')}
                    style={{ minWidth: 26, height: 26, padding: '0 5px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 5, background: '#fff', cursor: 'pointer' }}>
                    ⎵
                </button>
            </div>
            <textarea
                ref={taRef}
                value={value ?? ''}
                onFocus={() => setHint('')}
                onChange={(e) => onChange(e.target.value)}
                rows={2}
                style={{ width: '100%', fontSize: 14, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {hint && <span style={{ fontSize: 11, color: '#dc2626', display: 'block', marginTop: 4 }}>{hint}</span>}
        </div>
    );
}
