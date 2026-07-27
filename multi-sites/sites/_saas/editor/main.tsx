/*
 * Ponto de entrada do bundle do editor (buildado por vite.config.editor.mjs →
 * core/static/editor/). Monta o app React do Puck no elemento que o template
 * do admin (core/editor.html) fornece. Importa o saas.css pro canvas do editor
 * mostrar os blocos com o mesmo Tailwind/tema da produção (single-source).
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/saas.css';
import '@measured/puck/dist/index.css';
import './editor-chrome.css';
import App from './App';

const el = document.getElementById('editor-root');
if (el) {
    createRoot(el).render(<App />);
}
