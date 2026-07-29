/*
 * Shell do editor visual. Três abas:
 *  - Página: <Puck> editando o documento de blocos (Page.blocks).
 *  - Tema: cores/fontes/radius do project.theme (aplicadas ao vivo no canvas).
 *  - Cabeçalho/Rodapé: project.chrome (header/footer).
 * Salvar (explícito) faz POST do estado pro Django, que grava e marca rebuild.
 */
import React, { useEffect, useState } from 'react';
import { Puck, registerOverlayPortal, type Data } from '@measured/puck';
import { puckConfig } from './puck.config';
import { buildBrandVars, fontLinksForKeys } from '../theme/theme';
import { FONT_NAMES } from '../theme/fonts';
import type { ProjectTheme } from '../theme/theme';
import type { ProjectChrome, NavLink, FooterColumn } from '../chrome/chrome';
import { collectBlockFontKeys } from '../blocks/style-runtime';

interface EditorData {
    pageId: number;
    projectId: number;
    pageTitle: string;
    blocks: Data;
    theme: ProjectTheme;
    chrome: ProjectChrome;
    saveUrl: string;
    csrf: string;
}

declare global {
    interface Window {
        __EDITOR_DATA__?: EditorData;
    }
}

const COLOR_TOKENS: { key: keyof NonNullable<ProjectTheme['colors']>; label: string }[] = [
    { key: 'primary', label: 'Primária' },
    { key: 'ink', label: 'Texto' },
    { key: 'muted', label: 'Texto secundário' },
    { key: 'canvas', label: 'Fundo' },
    { key: 'surface', label: 'Cards/seções' },
    { key: 'line', label: 'Bordas' },
];

// ---- helpers de form -------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</span>
            {children}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14,
};

// editor genérico de lista (add/remove linhas)
function Repeatable<T>({ items, onChange, empty, render }: {
    items: T[];
    onChange: (next: T[]) => void;
    empty: T;
    render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
    return (
        <div>
            {items.map((item, i) => (
                <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    {render(item, (patch) => {
                        const next = [...items];
                        next[i] = { ...item, ...patch };
                        onChange(next);
                    })}
                    <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
                        style={{ marginTop: 6, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                        remover
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => onChange([...items, { ...empty }])}
                style={{ fontSize: 13, padding: '4px 10px', border: '1px dashed #9ca3af', borderRadius: 6, background: 'none', cursor: 'pointer' }}>
                + adicionar
            </button>
        </div>
    );
}

// ---- painéis ---------------------------------------------------------------

function ThemePanel({ theme, onChange }: { theme: ProjectTheme; onChange: (t: ProjectTheme) => void }) {
    const colors = theme.colors ?? {};
    const fonts = theme.fonts ?? {};
    return (
        <div style={{ maxWidth: 420, padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Cores</h3>
            {COLOR_TOKENS.map(({ key, label }) => (
                <Field key={key} label={label}>
                    <input type="color" value={colors[key] || '#000000'}
                        onChange={(e) => onChange({ ...theme, colors: { ...colors, [key]: e.target.value } })} />
                </Field>
            ))}
            <h3 style={{ fontWeight: 700, margin: '16px 0 12px' }}>Fontes</h3>
            <Field label="Títulos">
                <select style={inputStyle} value={fonts.heading || ''}
                    onChange={(e) => onChange({ ...theme, fonts: { ...fonts, heading: e.target.value } })}>
                    <option value="">(padrão do sistema)</option>
                    {FONT_NAMES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
            </Field>
            <Field label="Corpo">
                <select style={inputStyle} value={fonts.body || ''}
                    onChange={(e) => onChange({ ...theme, fonts: { ...fonts, body: e.target.value } })}>
                    <option value="">(padrão do sistema)</option>
                    {FONT_NAMES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
            </Field>
            <Field label="Arredondamento (ex: 12px)">
                <input style={inputStyle} value={theme.radius || ''}
                    onChange={(e) => onChange({ ...theme, radius: e.target.value })} />
            </Field>
        </div>
    );
}

function ChromePanel({ chrome, onChange }: { chrome: ProjectChrome; onChange: (c: ProjectChrome) => void }) {
    const header = chrome.header ?? {};
    const footer = chrome.footer ?? {};
    const setHeader = (patch: Partial<typeof header>) => onChange({ ...chrome, header: { ...header, ...patch } });
    const setFooter = (patch: Partial<typeof footer>) => onChange({ ...chrome, footer: { ...footer, ...patch } });

    return (
        <div style={{ maxWidth: 520, padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Cabeçalho</h3>
            <Field label="Texto do logo"><input style={inputStyle} value={header.logoText || ''} onChange={(e) => setHeader({ logoText: e.target.value })} /></Field>
            <Field label="Imagem do logo (URL)"><input style={inputStyle} value={header.logoUrl || ''} onChange={(e) => setHeader({ logoUrl: e.target.value })} /></Field>
            <Field label="Links de navegação">
                <Repeatable<NavLink> items={header.links ?? []} empty={{ label: '', href: '' }}
                    onChange={(links) => setHeader({ links })}
                    render={(l, update) => (
                        <>
                            <input style={{ ...inputStyle, marginBottom: 4 }} placeholder="Texto" value={l.label} onChange={(e) => update({ label: e.target.value })} />
                            <input style={inputStyle} placeholder="Link" value={l.href} onChange={(e) => update({ href: e.target.value })} />
                        </>
                    )} />
            </Field>
            <Field label="Botão de ação (texto)"><input style={inputStyle} value={header.cta?.label || ''} onChange={(e) => setHeader({ cta: { label: e.target.value, href: header.cta?.href || '' } })} /></Field>
            <Field label="Botão de ação (link)"><input style={inputStyle} value={header.cta?.href || ''} onChange={(e) => setHeader({ cta: { label: header.cta?.label || '', href: e.target.value } })} /></Field>

            <h3 style={{ fontWeight: 700, margin: '16px 0 12px' }}>Rodapé</h3>
            <Field label="Colunas">
                <Repeatable<FooterColumn> items={footer.columns ?? []} empty={{ title: '', links: [] }}
                    onChange={(columns) => setFooter({ columns })}
                    render={(col, update) => (
                        <>
                            <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Título da coluna" value={col.title || ''} onChange={(e) => update({ title: e.target.value })} />
                            <Repeatable<NavLink> items={col.links ?? []} empty={{ label: '', href: '' }}
                                onChange={(links) => update({ links })}
                                render={(l, u) => (
                                    <>
                                        <input style={{ ...inputStyle, marginBottom: 4 }} placeholder="Texto" value={l.label} onChange={(e) => u({ label: e.target.value })} />
                                        <input style={inputStyle} placeholder="Link" value={l.href} onChange={(e) => u({ href: e.target.value })} />
                                    </>
                                )} />
                        </>
                    )} />
            </Field>
            <Field label="Copyright"><input style={inputStyle} value={footer.copyright || ''} onChange={(e) => setFooter({ copyright: e.target.value })} /></Field>
        </div>
    );
}

// ---- app -------------------------------------------------------------------

type Tab = 'page' | 'theme' | 'chrome';

// Page.blocks vem do Django sem o `props.id` que o Puck exige em cada item de
// `content` (o motor de drag-and-drop do Puck usa esse id na detecção de
// colisão; sem ele o drag quebra com "droppable.id is undefined"). Injeta um
// id estável só nos itens que ainda não têm.
function withBlockIds(data: Data): Data {
    return {
        ...data,
        content: (data.content ?? []).map((item, i) => ({
            ...item,
            props: {
                ...(item.props ?? {}),
                id: (item.props as any)?.id ?? `${item.type}-${i}-${Math.random().toString(36).slice(2, 10)}`,
            },
        })),
    };
}

export default function App() {
    const data = window.__EDITOR_DATA__;
    if (!data) return <div style={{ padding: 24 }}>Sem dados do editor.</div>;

    const [tab, setTab] = useState<Tab>('page');
    const [blocks, setBlocks] = useState<Data>(() => withBlockIds(data.blocks));
    const [theme, setTheme] = useState<ProjectTheme>(data.theme || {});
    const [chrome, setChrome] = useState<ProjectChrome>(data.chrome || {});
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    // aplica o tema do projeto ao vivo no canvas (iframe desligado no Puck)
    useEffect(() => {
        let el = document.getElementById('brand-vars') as HTMLStyleElement | null;
        if (!el) {
            el = document.createElement('style');
            el.id = 'brand-vars';
            document.head.appendChild(el);
        }
        el.textContent = buildBrandVars(theme);
    }, [theme]);

    // <link> de fonte (Google Fonts) pro tema (heading/body) + pras fontes
    // escolhidas por elemento (Aparência do Hero) — sem isso o `<select>` de
    // fonte "funciona" no editor mas a família não carrega, caindo no
    // fallback do CSS. Bônus: corrige uma lacuna pré-existente (o editor
    // nunca carregava nem as fontes de heading/body do tema).
    useEffect(() => {
        const hrefs = fontLinksForKeys([theme.fonts?.heading, theme.fonts?.body, ...collectBlockFontKeys(blocks)]);
        const existing = new Map(
            Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-editor-font-link]')).map((el) => [el.href, el]),
        );
        for (const href of hrefs) {
            if (existing.has(href)) {
                existing.delete(href);
                continue;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.editorFontLink = 'true';
            document.head.appendChild(link);
        }
        // sobrou no map = não está mais em uso, remove
        for (const stale of existing.values()) stale.remove();
    }, [theme, blocks]);

    // Restaura pointer-events/hover nos 4 campos `richText` (eyebrow/title/
    // subtitle/helperText do Hero centered) via a MESMA função que o
    // `InlineTextField` nativo do Puck chama sobre si mesmo
    // (`data-puck-overlay-portal`, ver `[data-puck-overlay-portal]` em
    // node_modules/@measured/puck/dist/index.css). Sem isso, `[data-puck-
    // component] * { pointer-events:none }` bloqueia até o hover (:hover do
    // CSS não dispara em elemento sem pointer-events), então esses 4 campos
    // nunca mostravam o tooltip individual — só o highlight do bloco Hero
    // inteiro (igual clicar numa área não-interativa).
    //
    // `registerOverlayPortal` sozinha NÃO evita a desseleção ao clicar (ela só
    // trata mouseover/pointerdown/focus, não click). O wrapper do bloco
    // (`[data-puck-component]`) sempre despacha a seleção no `click` nativo
    // (bubble, `el.addEventListener` direto no DOM — não é JSX/React), mas SÓ
    // chama `stopPropagation()` quando o alvo NÃO está num `[data-puck-
    // overlay-portal]` — presumindo que algo mais já parou a propagação
    // antes. Sem esse "algo mais", o clique continua borbulhando até o
    // `onClick` do `Puck.Preview`
    // (`if (!el.hasAttribute('data-puck-component') && ...) dispatch({itemSelector:null})`),
    // que desseleciona porque o alvo real (o span/h1/p, agora com pointer-
    // events restaurado) não carrega esse atributo.
    //
    // TENTATIVA DESCARTADA: `onClickCapture` do React nesses elementos (em
    // HeroCentered.tsx) parecia replicar o truque do `InlineTextField`, mas
    // React entrega BOTH fases (captura e bubble) via UM listener nativo só,
    // registrado na raiz — a fase de captura dele roda durante a CAPTURA
    // NATIVA do browser, ou seja ANTES do `el.addEventListener('click', ...)`
    // nativo do wrapper (que só dispara no BUBBLE nativo). `stopPropagation`
    // ali aborta o ciclo inteiro do evento, matando também o próprio
    // `dispatch` de seleção do wrapper — pior que o bug original (clique não
    // faz nada). Confirmado via Playwright lendo o painel de campos (caía no
    // painel do ROOT, não do Hero).
    //
    // FIX: um SEGUNDO listener nativo de `click`, no MESMO nó wrapper,
    // registrado DEPOIS do listener do Puck (mesma fase = ordem de
    // registro). Isso roda depois do `dispatch` de seleção do Puck já ter
    // disparado, mas antes do clique continuar borbulhando pro container
    // raiz do React (onde o `onClick` do `Puck.Preview` desselecionaria).
    useEffect(() => {
        if (tab !== 'page') return;

        const RICHTEXT_KEYS = ['eyebrow', 'title', 'subtitle', 'helperText'];
        const cleanups = new Map<Element, () => void>();
        const wrapperListeners = new Map<Element, () => void>();

        function scan() {
            for (const key of RICHTEXT_KEYS) {
                const el = document.querySelector<HTMLElement>(`.editor-canvas [data-el="${key}"]`);
                if (el && !cleanups.has(el)) {
                    const cleanup = registerOverlayPortal(el);
                    if (cleanup) cleanups.set(el, cleanup);

                    const wrapper = el.closest<HTMLElement>('[data-puck-component]');
                    if (wrapper && !wrapperListeners.has(wrapper)) {
                        const guard = (e: MouseEvent) => {
                            if ((e.target as HTMLElement | null)?.closest('[data-puck-overlay-portal]')) {
                                e.stopPropagation();
                            }
                        };
                        wrapper.addEventListener('click', guard);
                        wrapperListeners.set(wrapper, () => wrapper.removeEventListener('click', guard));
                    }
                }
            }
        }

        scan();
        // `.editor-canvas` é remontado internamente pelo Puck logo após o
        // mount inicial (confirmado: a referência capturada fica com um nó
        // órfão) — observar `document.body` em vez do canvas evita perder
        // esse remount.
        const mo = new MutationObserver(scan);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => {
            mo.disconnect();
            for (const cleanup of cleanups.values()) cleanup();
            for (const cleanup of wrapperListeners.values()) cleanup();
        };
    }, [tab]);

    // Clique num elemento do canvas (via `data-el`, já usado pros labels de
    // hover) só rola/expande a seção "Aparência → <elemento>" no painel de
    // campos já existente — SEM toolbar flutuante, SEM overlay de seleção
    // próprio: nunca compete com a seleção nativa de bloco do Puck (sem
    // stopPropagation/preventDefault). Ver editor/fields/ElementStylesField.tsx
    // (o `id="appearance-group-<key>"` usa a MESMA string do `data-el`).
    useEffect(() => {
        if (tab !== 'page') return;

        function onClick(e: Event) {
            const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-el]');
            const key = el?.dataset.el;
            if (!key) return;
            // abre o painel via o :focus-within já existente (editor-chrome.css) — sem CSS novo pra isso
            document.querySelector<HTMLElement>('.fields-tab')?.focus();
            // A seleção de bloco do Puck não comita no mesmo frame do clique
            // (mecanismo de drag-and-drop por baixo) — poll via rAF, até ~30
            // frames (~0.5s). Sem alvo até o limite = elemento sem campo
            // editável nesse bloco, no-op.
            let attempts = 0;
            const tryOpen = () => {
                // Prioriza o campo de CONTEÚDO (RichTextField, ex: título/
                // eyebrow) — é o alvo mais útil de "clicar pra editar este
                // texto", e a Aparência já fica logo abaixo dele (campos
                // interlear no registry). Cai pro grupo de Aparência
                // (appearance-group) só quando o elemento não tem campo de
                // conteúdo próprio (ex: ctas, heroVisual, rating, trustBar).
                const contentField = document.getElementById(`content-field-${key}`);
                const group = document.getElementById(`appearance-group-${key}`);
                const target = contentField ?? group;
                if (!target) {
                    attempts += 1;
                    if (attempts < 30) requestAnimationFrame(tryOpen);
                    return;
                }
                if (target === group && group instanceof HTMLDetailsElement) group.open = true;
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const flashClass = target === contentField ? 'content-field--flash' : 'appearance-group--flash';
                target.classList.add(flashClass);
                setTimeout(() => target.classList.remove(flashClass), 1200);
                if (target === contentField) contentField.querySelector('textarea')?.focus();
            };
            requestAnimationFrame(tryOpen);
        }

        // Anexado no `document`, não em `.editor-canvas`: o próprio sensor de
        // drag-and-drop do Puck chama `stopPropagation()` na fase de CAPTURA
        // já no nível do document (confirmado por instrumentação), então
        // qualquer listener num descendente (mesmo capture) nunca é
        // alcançado. `document` é o topo da cadeia de captura — sempre vê o
        // clique primeiro, antes de qualquer stopPropagation mais abaixo.
        // Também é o único jeito de pegar cliques em texto inline-editable
        // (Puck troca o filho por um overlay `_InlineTextField_`, mas ele
        // continua sendo descendente de `[data-el]`, então `closest` resolve
        // normalmente). Nunca chamamos stopPropagation/preventDefault aqui —
        // não compete com a seleção nativa do Puck.
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, [tab]);

    async function save() {
        setSaving(true);
        setStatus('');
        try {
            const res = await fetch(data.saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': data.csrf },
                body: JSON.stringify({ blocks, theme, chrome }),
            });
            setStatus(res.ok ? '✓ Salvo' : '✗ Erro ao salvar');
        } catch {
            setStatus('✗ Erro de rede');
        } finally {
            setSaving(false);
        }
    }

    const tabBtn = (t: Tab, label: string) => (
        <button onClick={() => setTab(t)} style={{
            padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
            fontWeight: tab === t ? 700 : 400,
            background: tab === t ? '#111827' : 'transparent', color: tab === t ? '#fff' : '#374151',
        }}>{label}</button>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                <strong style={{ marginRight: 12 }}>{data.pageTitle}</strong>
                {tabBtn('page', 'Página')}
                {tabBtn('theme', 'Tema')}
                {tabBtn('chrome', 'Cabeçalho/Rodapé')}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{status}</span>
                    <button onClick={save} disabled={saving} style={{
                        padding: '8px 18px', border: 'none', borderRadius: 6, cursor: 'pointer',
                        background: '#2563eb', color: '#fff', fontWeight: 600, opacity: saving ? 0.6 : 1,
                    }}>{saving ? 'Salvando…' : 'Salvar'}</button>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {tab === 'page' && (
                    <Puck
                        config={puckConfig}
                        data={blocks}
                        onChange={setBlocks}
                        iframe={{ enabled: false }}
                    >
                        {/* Interface custom (API de composição do Puck): paleta à
                            esquerda, canvas no centro, campos numa aba à direita
                            que revela no hover. Ver editor-chrome.css. */}
                        <div className="editor-shell">
                            <aside className="editor-left">
                                <Puck.Components />
                                <Puck.Outline />
                            </aside>
                            <main className="editor-canvas">
                                <Puck.Preview />
                            </main>
                            <div className="fields-hover-zone">
                                <div className="fields-tab" tabIndex={0} role="button" aria-label="Propriedades">
                                    PROPRIEDADES
                                </div>
                                <div className="fields-panel">
                                    <Puck.Fields />
                                </div>
                            </div>
                        </div>
                    </Puck>
                )}
                {tab === 'theme' && <ThemePanel theme={theme} onChange={setTheme} />}
                {tab === 'chrome' && <ChromePanel chrome={chrome} onChange={setChrome} />}
            </div>
        </div>
    );
}
