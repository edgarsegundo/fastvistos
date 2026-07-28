/*
 * Primitivo genérico de modal — sem nenhuma noção de imagem/mídia. Base
 * reutilizável pra qualquer diálogo futuro no editor (ex: um seletor de
 * logo em ChromePanel, um confirm dialog, etc. — não precisa saber quais
 * agora, só precisa que o primitivo esteja pronto pra isso).
 *
 * Sempre montado via createPortal(document.body): qualquer ancestral com
 * `transform` diferente de `none` vira containing block de descendentes
 * `position:fixed` (regra da spec CSS) — o painel de campos do Puck
 * (.fields-panel) tem transform o tempo todo, então um modal renderizado
 * como filho React normal dentro dele fica PRESO na caixa do painel em vez
 * de cobrir a tela. O portal monta fora dessa árvore DOM, imune a isso.
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({
    titleId,
    title,
    onClose,
    size = 'md',
    children,
    footer,
}: {
    titleId: string;
    title: string;
    onClose: () => void;
    size?: 'md' | 'lg';
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;
        const first = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? panel)?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;
            const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusable.length === 0) return;
            const firstEl = focusable[0];
            const lastEl = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused.current?.focus?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                ref={panelRef}
                className={`modal-panel modal-panel--${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="modal-header">
                    <span id={titleId} className="modal-title">{title}</span>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body,
    );
}
