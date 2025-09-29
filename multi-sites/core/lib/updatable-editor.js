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
            htmlContent: null,
            updatableSectionUuid: null,
            businessId: null,
        },
        populateAttributesFromDiv: function(div) {
            this.sectionAttributes.title = div.getAttribute('updatable-section-title') || null;
            this.sectionAttributes.filePath = div.getAttribute('updatable-section-filepath') || null;
            this.sectionAttributes.siteId = div.getAttribute('updatable-section-siteid') || null;
            this.sectionAttributes.htmlContent = document.getElementById('uuid-html-editor').value
            this.sectionAttributes.updatableSectionUuid = div.getAttribute('updatable-section-uuid');
            this.sectionAttributes.businessId = div.getAttribute('updatable-section-businessid');
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
        element.style.opacity = toggle ? '0.5' : '1';
        element.style.pointerEvents = toggle ? 'none' : 'auto';
        element.disabled = toggle ? true : false;
    }

    // Utility to toggle disabled state with visual feedback
    function toggleDisabledState(disabled) {
        if (!state.isVersionSaved) {
            toggleButton(state.publishBtn, true);
            toggleButton(state.previewBtn, true);
            toggleButton(state.cloneBtn, true);
        } else if (disabled) {
            state.sectionTextarea.disabled = true;
            toggleButton(state.publishBtn, true);
            // publishBtn.style.pointerEvents = 'none';
            state.previewBtn.style.display = 'none';
            state.publishBtn.style.display = 'none';

            // Add Tailwind-like classes for disabled look
            state.sectionTextarea.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // publishBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // Remove focus ring
            state.sectionTextarea.style.boxShadow = 'none';
            // publishBtn.style.boxShadow = 'none';
        } else {
            state.previewBtn.style.display = 'inline-block';
            state.publishBtn.style.display = 'inline-block';
            state.sectionTextarea.disabled = false;
            state.cloneBtn.disabled = false;
            state.previewBtn.disabled = false;
            state.publishBtn.disabled = false;
            toggleButton(state.publishBtn, false);
            toggleButton(state.previewBtn, false);
            toggleButton(state.cloneBtn, false);
            // publishBtn.disabled = false;
            // publishBtn.style.pointerEvents = 'auto';
            state.sectionTextarea.classList.remove('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // publishBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            state.sectionTextarea.style.boxShadow = '';
            // publishBtn.style.boxShadow = '';
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
            const modal = document.createElement('div');
            modal.className = 'uuid-modal';
            Object.assign(modal.style, {
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
            return modal;
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
            button.onclick = () => modal.remove();
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

            texta.value = state.sectionDivWrapper.innerHTML;
            return texta;
        }

        async function createVersionComboBox(isNewlyCreated = false) {
            // Only update the placeholder, never create or insert it here
            let selectElement = null;
            let placeholder = state.modalContent.querySelector('#version-combobox-placeholder');
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
                            if (data.versions.active_version.id === ver.id) {
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

                        // if (data.versions.active_version) {
                        //     selectElement.value = data.versions.active_version.id;
                        //     state.sectionTextarea.value = data.versions.active_version.file_content;
                        // }

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
                            const siteId = state.sectionDivWrapper.getAttribute('updatable-section-siteid');
                            const url = `https://p2digital.com.br/msitesapp/api/page-section-version?site-id=${encodeURIComponent(siteId)}&id=${encodeURIComponent(selected.value)}`;
                            const resp = await fetch(url);
                            const data = await resp.json();
                            if (data && data.version.file_content) {
                                state.sectionTextarea.value = data.version.file_content;
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
                    !state.sectionAttributes.htmlContent) {
                    alert('Faltam atributos para clonar.');
                    console.error('Missing attributes for cloning:', { uuid: state.sectionAttributes.updatableSectionUuid, 
                        title: state.sectionAttributes.title, 
                        filePath: state.sectionAttributes.filePath, 
                        businessId: state.sectionAttributes.businessId, 
                        htmlContent: state.sectionAttributes.htmlContent });
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
                        htmlContent: state.sectionAttributes.htmlContent,
                        siteId: state.sectionAttributes.siteId
                    }),
                })
                .then(response => response.json())
                .then(async data => {
                    state.versionCombo = await createVersionComboBox();
                    state.isVersionSaved = false;
                    toggleDisabledState();
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
                const versionId = state.versionCombo.value;

                if (!state.sectionAttributes.updatableSectionUuid || 
                    !state.sectionAttributes.filePath || 
                    !state.sectionAttributes.businessId || 
                    !state.sectionAttributes.htmlContent) {
                    alert('Faltam atributos para publicar.');
                    console.error('Missing attributes for publishing:', { updatableSectionUuid: state.sectionAttributes.updatableSectionUuid, 
                        filePath: state.sectionAttributes.filePath, 
                        businessId: state.sectionAttributes.businessId, 
                        htmlContent: state.sectionAttributes.htmlContent });
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
                        htmlContent: state.sectionAttributes.htmlContent,
                        siteId: state.sectionAttributes.siteId,
                        versionId: versionId,
                    }),
                })
                .then(response => response.json())
                .then(async data => {
                    state.versionCombo = await createVersionComboBox();
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
                if (!state.versionCombo || !state.versionCombo.value) {
                    alert('Selecione uma versão para salvar.');
                    return;
                }
                if (!state.sectionAttributes.siteId || !state.sectionAttributes.htmlContent || !state.versionCombo.value) {
                    alert('Faltam parâmetros para salvar.');
                    return;
                }
                toggleScreenOverlay(true, 'Salvando...');
                try {
                    const resp = await fetch('https://p2digital.com.br/msitesapp/api/update-section-file-version', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            webPageSectionVersionId: state.versionCombo.value,
                            siteId: state.sectionAttributes.siteId,
                            htmlContent: state.sectionAttributes.htmlContent
                        })
                    });

                    // const data = await resp.json();
                    state.isVersionSaved = true;
                    toggleDisabledState(false);
                    toggleScreenOverlay(false);
                } catch (err) {
                    toggleScreenOverlay(false);
                    alert('Erro ao salvar. Veja o console para detalhes.');
                    console.error('Erro ao salvar seção:', err);
                }
            };
            return button;
        }

        // --- Main showModal function ---
        async function showModal(sectionDivWrapper) {
            state.resetDomTree(state.dom);
            state.sectionDivWrapper = sectionDivWrapper;
            state.populateAttributesFromDiv(sectionDivWrapper);

            document.querySelectorAll('.uuid-modal').forEach((m) => m.remove());
            const modal = createModalContainer();
            state.modalContent = createModalContent();

            state.buttons.closeBtn = createCloseButton(modal);
            modal.addEventListener('mousedown', function (e) {
                if (!state.modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
            const modalTitle = createModalTitle();
            const label = createLabel();
            state.sectionTextarea = createSectionTextarea();

            // Always create and insert the placeholder for the combobox ONCE here
            const comboBoxPlaceholder = createPlaceholderForTheComboBox();
            // Insert before state.sectionTextarea for best UX
            state.modalContent.appendChild(state.buttons.closeBtn);
            state.modalContent.appendChild(modalTitle);
            state.modalContent.appendChild(label);
            state.modalContent.appendChild(comboBoxPlaceholder);
            state.modalContent.appendChild(state.sectionTextarea);

            state.versionCombo = await createVersionComboBox();

            // Detect changes
            state.sectionTextarea.addEventListener('input', function(event) {
                state.isVersionSaved = false;
                toggleDisabledState(false);
            });

            state.buttons.cloneBtn = createCloneButton();
            state.buttons.publishBtn = createPublishButton();
            state.buttons.saveBtn = createSaveButton();
            state.buttons.previewBtn = createPreviewButton();

            state.buttons.previewBtn.onclick = () => {
                modal.remove();
                state.sectionDivWrapper.innerHTML = state.sectionTextarea.value.trim();
            };

            if (state.versionCombo === null) {
                // Visually and functionally disable state.sectionTextarea and publish button
                toggleDisabledState(true);
                state.buttons.saveBtn.disabled = true;
                state.buttons.saveBtn.style.opacity = '0.5';
            } else {
                toggleDisabledState(false);
                state.buttons.saveBtn.disabled = false;
                state.buttons.saveBtn.style.opacity = '1';
            }

            state.modalContent.appendChild(state.buttons.cloneBtn);
            state.modalContent.appendChild(state.buttons.publishBtn);
            state.modalContent.appendChild(state.buttons.saveBtn);
            state.modalContent.appendChild(state.buttons.previewBtn);

            modal.appendChild(state.modalContent);
            document.body.appendChild(modal);
        }
    });
})();
