// updatable-editor.js
// This script enables in-place editing of divs with [updatable-section-uuid] using a modal UI.
// Usage: Inject this script into your HTML (e.g., via <script src="/path/to/updatable-editor.js"></script>)

(function () {

    /**
     * UI State structure for updatable-editor.js
     *
     * state: {
     *   dom: {
     *     buttons: { closeBtn, cloneBtn, publishBtn, saveBtn, previewBtn },
     *     state.sectionTextarea, versionCombo, sectionDivWrapper
     *   },
     *   state.updatableSectionUuid, state.businessId, isVersionSaved, overlayTimestamp
     * }
     *
     * - All DOM element references are grouped under state.dom
     * - All button references are grouped under state.dom.buttons
     * - Use state fields for modal-wide or persistent state
     *
     * For most static UI, the object structure below is preferred for clarity and maintainability.
     */
    const state = {
        dom: {
            buttons: {
                closeBtn: null,
                cloneBtn: null,
                publishBtn: null,
                saveBtn: null,
                previewBtn: null,
            },
            sectionTextarea: null,
            versionCombo: null,
            sectionDivWrapper: null,
            modalContent: null,
        },
        sectionAttributes: {
            title: null,
            filePath: null,
            siteId: null,
            updatableSectionUuid: null,
            businessId: null,
        },
        populateAttributesFromDiv: function(div) {
            this.sectionAttributes.title = div.getAttribute('updatable-section-title') || null;
            this.sectionAttributes.filePath = div.getAttribute('updatable-section-filepath') || null;
            this.sectionAttributes.siteId = div.getAttribute('updatable-section-siteid') || null;
            this.sectionAttributes.updatableSectionUuid = div.getAttribute('updatable-section-uuid') || null;
            this.sectionAttributes.businessId = div.getAttribute('updatable-section-businessid') || null;
        },

        getHtmlContent: function() {
            return this.dom.sectionTextarea.value || null;
        },

        isVersionSaved: true,
        overlayTimestamp: null,

        /**
         * Recursively reset all properties of an object (including nested objects) to null.
         * Used to clear all DOM references in state.dom.
         */
        resetDomTree: function(obj) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        this.resetDomTree(obj[key]);
                    } else {
                        if (obj[key] instanceof Element && typeof obj[key].remove === 'function') {
                            obj[key].remove();
                        }
                        obj[key] = null;
                    }
                }
            }
        }        
    }

    // Overlay utility: disables the whole screen and shows a label and throbber
    const OVERLAY_MIN_DURATION_MS = 1000; // ms
    const SELECTED_VERSION_COMBO_LOCAL_STORAGE_KEY = 'selectedVersionComboValue';

    function toggleScreenOverlay(show, label = 'Processando...') {
        let overlay = document.getElementById('global-throbber-overlay');
        if (show) {
            state.overlayTimestamp = performance.now();
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'global-throbber-overlay';
                Object.assign(overlay.style, {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(31, 41, 55, 0.85)', // Tailwind gray-800 + opacity
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                });

                // Label
                const labelDiv = document.createElement('div');
                labelDiv.id = 'global-throbber-label';
                labelDiv.textContent = label;
                Object.assign(labelDiv.style, {
                    color: '#fff',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    marginBottom: '2.5rem',
                    letterSpacing: '0.05em',
                    textShadow: '0 2px 8px #000',
                    textAlign: 'center',
                });
                overlay.appendChild(labelDiv);

                // Throbber (Tailwind-inspired, creative)
                const throbber = document.createElement('div');
                throbber.className = 'throbber-spinner';
                Object.assign(throbber.style, {
                    width: '4rem',
                    height: '4rem',
                    border: '8px solid #d1d5db', // gray-300
                    borderTop: '8px solid #3b82f6', // blue-500
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 32px #3b82f6aa',
                });
                overlay.appendChild(throbber);

                // Add keyframes for spin
                if (!document.getElementById('throbber-spinner-style')) {
                    const style = document.createElement('style');
                    style.id = 'throbber-spinner-style';
                    style.textContent = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
                    document.head.appendChild(style);
                }

                document.body.appendChild(overlay);
            } else {
                // Update label if overlay already exists
                const labelDiv = overlay.querySelector('#global-throbber-label');
                if (labelDiv) labelDiv.textContent = label;
                overlay.style.display = 'flex';
            }
        } else {
            if (overlay) {
                const now = performance.now();
                const elapsed = state.overlayTimestamp ? now - state.overlayTimestamp : 1000;
                if (elapsed < OVERLAY_MIN_DURATION_MS) {
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, OVERLAY_MIN_DURATION_MS - elapsed);
                } else {
                    overlay.style.display = 'none';
                }
            }
        }
    }

    function toggleButton(element, toggle) {
        element.style.opacity = toggle ? '1' : '0.2';
        element.style.pointerEvents = toggle ? 'auto' : 'none';
        element.disabled = !toggle;
        if (toggle) {
            element.classList.remove('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
        } else {
            element.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
        }
    }

    function toggleUIElements(toggleClone = false, togglePublish = false, toggleSave = false, togglePreview = false, toggleTextarea = false) {
        toggleButton(state.dom.buttons.cloneBtn, toggleClone);
        toggleButton(state.dom.buttons.publishBtn, togglePublish);
        toggleButton(state.dom.buttons.saveBtn, toggleSave);
        toggleButton(state.dom.buttons.previewBtn, togglePreview);
        toggleButton(state.dom.sectionTextarea, toggleTextarea);
    }

    // Utility to toggle disabled state with visual feedback
    function toggleUIState() {
        if (state.isVersionSaved) {
            toggleUIElements(true, true, false, true, true);
        } else {
            toggleUIElements(false, false, true, false, true);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const borderColors = [
            '#0070f3', // blue
            '#00b894', // green
            '#ff9800', // orange
            '#a259f7', // purple
            '#e17055', // red
            '#00bcd4', // cyan
            '#fbc531', // yellow
            '#6c5ce7', // deep purple
        ];

        document.querySelectorAll('div[updatable-section-uuid]').forEach((div, idx) => {
            // Set base border and highlight styles dynamically
            div.addEventListener('mouseenter', function () {
                const baseColor = borderColors[idx % borderColors.length];
                Object.assign(div.style, {
                    border: `10px solid ${baseColor}`,
                    transition: 'border 0.1s',
                });
            });
            div.addEventListener('mouseleave', function () {
                div.style.border = '';
                div.style.borderRadius = '';
                div.style.transition = '';
                div.style.boxShadow = '';
            });

            // Create wrapper div for positioning
            const wrapper = document.createElement('div');
            wrapper.className = 'uuid-edit-link-wrapper';
            Object.assign(wrapper.style, {
                position: 'relative',
                height: '0',
                display: 'flex',
                justifyContent: 'flex-end',
            });

            // Create the button
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '✏️ Editar HTML';
            btn.className = 'uuid-edit-link';
            Object.assign(btn.style, {
                position: 'absolute',
                top: '0',
                right: '16px',
                zIndex: 1000,
                background: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                textDecoration: 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd',
                cursor: 'pointer',
            });

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                showModal(div);
                return false;
            });

            wrapper.appendChild(btn);
            div.parentNode.insertBefore(wrapper, div);
        });

        // --- Modal UI helpers ---
        function createModalContainer() {
            const div = document.createElement('div');
            div.className = 'uuid-modal';
            Object.assign(div.style, {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            });
            return div;
        }

        function createModalContent() {
            const div = document.createElement('div');
            Object.assign(div.style, {
                background: '#fff',
                padding: '24px',
                borderRadius: '8px',
                width: '90vw',
                maxWidth: '700px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
                position: 'relative',
            });
            return div;
        }

        function createCloseButton(modal) {
            const button = document.createElement('button');
            button.textContent = '×';
            Object.assign(button.style, {
                position: 'absolute',
                top: '8px',
                right: '12px',
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#111',
            });
            button.onclick = () => {
                if (!state.isVersionSaved) {
                    if (confirm('Você perderá as alterações não salvas. Deseja continuar?')) {
                        modal.remove();
                        state.isVersionSaved = true;
                    }
                } else {
                    modal.remove(); // Optionally close immediately if no unsaved changes
                }
            };
            return button;
        }

        function createModalTitle() {
            const div = document.createElement('div');
            div.textContent = state.sectionAttributes.title || 'Editar HTML';
            Object.assign(div.style, {
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '1.3em',
                textAlign: 'center',
                color: '#000',
            });
            return div;
        }

        function createLabel() {
            const label = document.createElement('div');
            label.textContent = `Edição de HTML`;
            Object.assign(label.style, {
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '0.95em',
                color: '#666',
                textAlign: 'center',
            });
            return label;
        }

        function createPlaceholderForTheComboBox() {
            const placeholder = document.createElement('div');
            placeholder.id = 'version-combobox-placeholder';
            // No styles at all, just a plain div
            placeholder.innerHTML = '<span style="opacity:0.7;">Selecione uma versão para editar</span>';
            return placeholder;
        }

        function createSectionTextarea() {
            const texta = document.createElement('textarea');
            texta.id = 'uuid-html-editor';
            Object.assign(texta.style, {
                width: '100%',
                minHeight: '320px',
                maxHeight: '60vh',
                color: '#222',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
                border: '2px solid #3b82f6', // blue-500
                borderRadius: '12px',
                boxShadow: '0 4px 32px 0 rgba(59,130,246,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.08)',
                fontSize: '1.08em',
                fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
                padding: '18px 20px',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                marginBottom: '18px',
                letterSpacing: '0.01em',
                lineHeight: '1.6',
                caretColor: '#3b82f6',
                backgroundClip: 'padding-box',
            });
            texta.addEventListener('focus', function() {
                texta.style.borderColor = '#2563eb'; // blue-600
                texta.style.boxShadow = '0 0 0 3px #3b82f633, 0 4px 32px 0 rgba(59,130,246,0.10)';
            });
            texta.addEventListener('blur', function() {
                texta.style.borderColor = '#3b82f6';
                texta.style.boxShadow = '0 4px 32px 0 rgba(59,130,246,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.08)';
            });

            texta.value = state.dom.sectionDivWrapper.innerHTML;
            return texta;
        }

        async function createVersionComboBox(isNewlyCreated = false) {
            // Only update the placeholder, never create or insert it here
            let selectElement = null;
            let placeholder = state.dom.modalContent.querySelector('#version-combobox-placeholder');
            if (!placeholder) {
                // Defensive: if not found, do nothing
                return null;
            }
            // Clear previous content
            placeholder.innerHTML = '<span style="opacity:0.7;">Selecione uma versão para editar</span>';

            if (state.sectionAttributes.updatableSectionUuid && state.sectionAttributes.businessId) {
                try {
                    const url = `https://p2digital.com.br/msitesapp/api/page-section-versions?updatable-section-uuid=${encodeURIComponent(state.sectionAttributes.updatableSectionUuid)}&business-id=${encodeURIComponent(state.sectionAttributes.businessId)}`;
                    const resp = await fetch(url);
                    const data = await resp.json();
                    // Expecting { list: [...], active_version: { id, file_content } }
                    if (data && Array.isArray(data.versions.list) && data.versions.list.length > 0) {
                        selectElement = document.createElement('select');
                        selectElement.style.margin = '0 auto 12px auto';
                        selectElement.style.display = 'block';
                        selectElement.style.width = '100%';
                        selectElement.style.padding = '10px 14px';
                        selectElement.style.fontSize = '1.08em';
                        selectElement.style.borderRadius = '7px';
                        selectElement.style.border = '2px solid #3b82f6';
                        selectElement.style.color = '#222';
                        selectElement.style.background = 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)';
                        selectElement.style.boxShadow = '0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        selectElement.style.fontWeight = '500';
                        selectElement.style.transition = 'border-color 0.2s, box-shadow 0.2s';

                        // Add default option
                        const defaultOpt = document.createElement('option');
                        defaultOpt.textContent = 'Versão Original';
                        data.versions.list.forEach((ver, idx) => {
                            const opt = document.createElement('option');
                            opt.value = ver.id.toString();
                            defaultOpt.value = opt.value + ':original';

                            let statusText = '';
                            if (data.versions.active_version && data.versions.active_version.id === ver.id) {
                                statusText = ` (Publicada) `;
                            }

                            opt.textContent = `${statusText}Versão de ` + (ver.created ? (new Date(ver.created)).toLocaleString() : '');
                            selectElement.appendChild(opt);
                        });
                        selectElement.appendChild(defaultOpt);

                        if (isNewlyCreated) {
                            localStorage.setItem(SELECTED_VERSION_COMBO_LOCAL_STORAGE_KEY, selectElement.value);
                        } else {
                            const savedValue = localStorage.getItem(SELECTED_VERSION_COMBO_LOCAL_STORAGE_KEY);
                            if (savedValue && selectElement.querySelector(`option[value="${savedValue}"]`)) {
                                selectElement.value = savedValue;
                            }
                        }

                        await updateTextarea();

                        selectElement.addEventListener('focus', function() {
                            selectElement.style.borderColor = '#2563eb';
                            selectElement.style.boxShadow = '0 0 0 2.5px #3b82f633, 0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        });
                        selectElement.addEventListener('blur', function() {
                            selectElement.style.borderColor = '#3b82f6';
                            selectElement.style.boxShadow = '0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        });

                        async function  updateTextarea() {
                            const selected = selectElement.options[selectElement.selectedIndex];
                            const url = `https://p2digital.com.br/msitesapp/api/page-section-version?site-id=${encodeURIComponent(state.sectionAttributes.siteId)}&id=${encodeURIComponent(selected.value)}`;
                            const resp = await fetch(url);
                            const data = await resp.json();
                            if (data && data.version.file_content) {
                                state.dom.sectionTextarea.value = data.version.file_content;
                            }
                        }

                        selectElement.addEventListener('change', async function(event) {
                            // Persist the selected value
                            localStorage.setItem(SELECTED_VERSION_COMBO_LOCAL_STORAGE_KEY, selectElement.value);
                            await updateTextarea();
                        });                        

                        // Replace placeholder content with the new combobox
                        placeholder.innerHTML = '';
                        placeholder.appendChild(selectElement);
                    } else {
                        // No versions found, show placeholder message
                        placeholder.innerHTML = '<span style="opacity:0.7;">Nenhuma versão disponível</span>';
                    }
                } catch (err) {
                    placeholder.innerHTML = '<span style="color:#e17055;">Erro ao buscar versões</span>';
                    console.error('Failed to fetch section versions:', err);
                }
            } else {
                placeholder.innerHTML = '<span style="opacity:0.7;">Selecione uma versão para editar</span>';
            }
            return selectElement;
        }

        function createCloneButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Clonar';
            Object.assign(button.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#00b894',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            button.onclick = () => {
                toggleScreenOverlay(true, 'Clonando seção...');
                if (!state.sectionAttributes.updatableSectionUuid || 
                    !state.sectionAttributes.title || 
                    !state.sectionAttributes.filePath || 
                    !state.sectionAttributes.businessId || 
                    !state.getHtmlContent()) {
                    alert('Faltam atributos para clonar.');
                    console.error('Missing attributes for cloning:', { uuid: state.sectionAttributes.updatableSectionUuid, 
                        title: state.sectionAttributes.title, 
                        filePath: state.sectionAttributes.filePath, 
                        businessId: state.sectionAttributes.businessId, 
                        htmlContent: state.getHtmlContent() });
                    return;
                }
                fetch('https://p2digital.com.br/msitesapp/api/webpage-section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        updatableUuid: state.sectionAttributes.updatableSectionUuid,
                        title: state.sectionAttributes.title,
                        webpageRelativePath: state.sectionAttributes.filePath,
                        businessId: state.sectionAttributes.businessId,
                        htmlContent: state.getHtmlContent(),
                        siteId: state.sectionAttributes.siteId
                    }),
                })
                .then(response => response.json())
                .then(async data => {
                    state.dom.versionCombo = await createVersionComboBox(true);
                    state.isVersionSaved = false;
                    toggleUIState();
                    toggleScreenOverlay(false);
                })
                .catch(error => {
                    toggleScreenOverlay(false);
                    // TODO: Show error in modal, refactor to use a better alert system
                    alert('Erro ao clonar seção. Veja console para detalhes.');
                    console.error('Clonar error:', error);
                });
            };
            return button;
        }

        function createSaveButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Salvar';
            Object.assign(button.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            button.onclick = async () => {
                if (!state.dom.versionCombo || !state.dom.versionCombo.value) {
                    alert('Selecione uma versão para salvar.');
                    return;
                }
                if (!state.sectionAttributes.siteId || !state.getHtmlContent() || !state.dom.versionCombo.value) {
                    alert('Faltam parâmetros para salvar.');
                    return;
                }
                toggleScreenOverlay(true, 'Salvando...');
                try {
                    const resp = await fetch('https://p2digital.com.br/msitesapp/api/update-section-file-version', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            webPageSectionVersionId: state.dom.versionCombo.value,
                            siteId: state.sectionAttributes.siteId,
                            htmlContent: state.getHtmlContent()
                        })
                    });

                    // const data = await resp.json();
                    state.isVersionSaved = true;
                    toggleUIState(false);
                    toggleScreenOverlay(false);
                } catch (err) {
                    toggleScreenOverlay(false);
                    alert('Erro ao salvar. Veja o console para detalhes.');
                    console.error('Erro ao salvar seção:', err);
                }
            };
            return button;
        }

        function createPublishButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Publicar';
            Object.assign(button.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            button.onclick = () => {
                toggleScreenOverlay(true, 'Publicando seção...');

                // versionCombo
                const versionId = state.dom.versionCombo.value;

                if (!state.sectionAttributes.updatableSectionUuid || 
                    !state.sectionAttributes.filePath || 
                    !state.sectionAttributes.businessId || 
                    !state.getHtmlContent()) {
                    alert('Faltam atributos para publicar.');
                    console.error('Missing attributes for publishing:', { updatableSectionUuid: state.sectionAttributes.updatableSectionUuid, 
                        filePath: state.sectionAttributes.filePath, 
                        businessId: state.sectionAttributes.businessId, 
                        htmlContent: state.getHtmlContent() });
                    return;
                }
                fetch('https://p2digital.com.br/msitesapp/api/publish-section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        updatableUuid: state.sectionAttributes.updatableSectionUuid,
                        webpageRelativePath: state.sectionAttributes.filePath,
                        businessId: state.sectionAttributes.businessId,
                        htmlContent: state.getHtmlContent(),
                        siteId: state.sectionAttributes.siteId,
                        versionId: versionId,
                    }),
                })
                .then(response => response.json())
                .then(async data => {
                    state.dom.versionCombo = await createVersionComboBox();
                    toggleScreenOverlay(false);
                })
                .catch(error => {
                    toggleScreenOverlay(false);
                    console.error('Publish error:', error);
                });
            };
            return button;
        }

        function createPreviewButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Vizualizar';
            Object.assign(button.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            return button;
        }

        // --- Main showModal function ---
        async function showModal(sectionDivWrapper) {
            state.resetDomTree(state.dom);
            state.dom.sectionDivWrapper = sectionDivWrapper;
            state.populateAttributesFromDiv(sectionDivWrapper);

            // Always remove existing modals first
            document.querySelectorAll('.uuid-modal').forEach((m) => m.remove());

            const modal = createModalContainer();
            state.dom.modalContent = createModalContent();

            state.dom.buttons.closeBtn = createCloseButton(modal);
            modal.addEventListener('mousedown', function (e) {
                if (!state.dom.modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
            const modalTitle = createModalTitle();
            const label = createLabel();

            state.dom.sectionTextarea = createSectionTextarea(sectionDivWrapper);

            // Always create and insert the placeholder for the combobox ONCE here
            const comboBoxPlaceholder = createPlaceholderForTheComboBox();
            // Insert before sectionTextarea for best UX
            state.dom.modalContent.appendChild(state.dom.buttons.closeBtn);
            state.dom.modalContent.appendChild(modalTitle);
            state.dom.modalContent.appendChild(label);
            state.dom.modalContent.appendChild(comboBoxPlaceholder);
            state.dom.modalContent.appendChild(state.dom.sectionTextarea);

            state.dom.versionCombo = await createVersionComboBox();

            // Detect changes
            state.dom.sectionTextarea.addEventListener('input', function(event) {
                state.isVersionSaved = false;
                toggleUIState(false);
            });

            state.dom.buttons.cloneBtn = createCloneButton();
            state.dom.buttons.saveBtn = createSaveButton();
            state.dom.buttons.publishBtn = createPublishButton();
            state.dom.buttons.previewBtn = createPreviewButton();

            state.dom.buttons.previewBtn.onclick = () => {
                modal.remove();
                state.dom.sectionDivWrapper.innerHTML = state.dom.sectionTextarea.value.trim();
            };

            if (state.dom.versionCombo === null) {
                toggleUIElements(true);
            } else {
                toggleUIState();
            }

            state.dom.modalContent.appendChild(state.dom.buttons.cloneBtn);
            state.dom.modalContent.appendChild(state.dom.buttons.publishBtn);
            state.dom.modalContent.appendChild(state.dom.buttons.saveBtn);
            state.dom.modalContent.appendChild(state.dom.buttons.previewBtn);

            modal.appendChild(state.dom.modalContent);
            document.body.appendChild(modal);
        }
    });
})({once: true});
