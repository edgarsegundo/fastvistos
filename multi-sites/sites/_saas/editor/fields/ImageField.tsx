/*
 * Campo customizado do Puck (type:'custom') pra props de imagem: um único
 * controle clicável — placeholder tracejado quando vazio, thumbnail quando
 * preenchido — que abre o ImagePickerModal. Sem botão "Remover" separado
 * aqui: remover uma imagem já escolhida é uma ação de dentro da própria
 * modal (rodapé, só aparece quando há valor), pra este elemento nunca ter
 * mais de um controle competindo por atenção no painel.
 */
import React, { useState } from 'react';
import { ImagePickerModal } from '../media/ImagePickerModal';

export function ImageField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {label}
            </span>

            {!value ? (
                <button type="button" className="image-field-empty" onClick={() => setOpen(true)}>
                    <span className="image-field-empty-icon">🖼️</span>
                    <span>Escolher imagem</span>
                </button>
            ) : (
                <button type="button" className="image-field-thumb" onClick={() => setOpen(true)} aria-label="Trocar imagem">
                    <img src={value} alt="" />
                    <span className="image-field-thumb-hint">Trocar</span>
                </button>
            )}

            {open && (
                <ImagePickerModal
                    initialUrl={value}
                    onConfirm={(url) => { onChange(url); setOpen(false); }}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}
