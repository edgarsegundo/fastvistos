// updatable-editor.js
// This script enables in-place editing of divs with [updatable-section-uuid] using a modal UI.
// Usage: Inject this script into your HTML (e.g., via <script src="/path/to/updatable-editor.js"></script>)

(function () {
    let versionCombo = null;
    // Overlay utility: disables the whole screen and shows a label and throbber
    let overlayTimestamp = null;
    const OVERLAY_MIN_DURATION_MS = 1000; // ms

    function toggleScreenOverlay(show, label = 'Processando...') {
        let overlay = document.getElementById('global-throbber-overlay');
        if (show) {
            overlayTimestamp = performance.now();
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
                const elapsed = overlayTimestamp ? now - overlayTimestamp : 1000;
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

    // Utility to toggle disabled state with visual feedback
    function toggleDisabledState(textarea, publishBtn, previewBtn, disabled) {
        if (disabled) {
            textarea.disabled = true;
            publishBtn.disabled = true;
            // publishBtn.style.pointerEvents = 'none';
            previewBtn.style.display = 'none';
            publishBtn.style.display = 'none';

            // Add Tailwind-like classes for disabled look
            textarea.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // publishBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // Remove focus ring
            textarea.style.boxShadow = 'none';
            // publishBtn.style.boxShadow = 'none';
        } else {
            previewBtn.style.display = 'inline-block';
            publishBtn.style.display = 'inline-block';
            textarea.disabled = false;
            // publishBtn.disabled = false;
            // publishBtn.style.pointerEvents = 'auto';
            textarea.classList.remove('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // publishBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            textarea.style.boxShadow = '';
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

        document.querySelectorAll('div[updatable-section-uuid]').forEach((section_div_wrapper, idx) => {
            // Set base border and highlight styles dynamically
            section_div_wrapper.addEventListener('mouseenter', function () {
                const baseColor = borderColors[idx % borderColors.length];
                Object.assign(section_div_wrapper.style, {
                    border: `10px solid ${baseColor}`,
                    transition: 'border 0.1s',
                });
            });
            section_div_wrapper.addEventListener('mouseleave', function () {
                section_div_wrapper.style.border = '';
                section_div_wrapper.style.borderRadius = '';
                section_div_wrapper.style.transition = '';
                section_div_wrapper.style.boxShadow = '';
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
                showModal(section_div_wrapper);
                return false;
            });

            wrapper.appendChild(btn);
            section_div_wrapper.parentNode.insertBefore(wrapper, section_div_wrapper);
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
            const modalContent = document.createElement('div');
            Object.assign(modalContent.style, {
                background: '#fff',
                padding: '24px',
                borderRadius: '8px',
                width: '90vw',
                maxWidth: '700px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
                position: 'relative',
            });
            return modalContent;
        }

        function createCloseButton(modal) {
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            Object.assign(closeBtn.style, {
                position: 'absolute',
                top: '8px',
                right: '12px',
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#111',
            });
            closeBtn.onclick = () => modal.remove();
            return closeBtn;
        }

        function createModalTitle(section_div_wrapper) {
            const modalTitle = document.createElement('div');
            modalTitle.textContent = section_div_wrapper.getAttribute('updatable-section-title') || 'Editar HTML';
            Object.assign(modalTitle.style, {
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '1.3em',
                textAlign: 'center',
                color: '#000',
            });
            return modalTitle;
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

        function createTextarea(section_div_wrapper) {
            const textarea = document.createElement('textarea');
            textarea.id = 'uuid-html-editor';
            Object.assign(textarea.style, {
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
            textarea.addEventListener('focus', function() {
                textarea.style.borderColor = '#2563eb'; // blue-600
                textarea.style.boxShadow = '0 0 0 3px #3b82f633, 0 4px 32px 0 rgba(59,130,246,0.10)';
            });
            textarea.addEventListener('blur', function() {
                textarea.style.borderColor = '#3b82f6';
                textarea.style.boxShadow = '0 4px 32px 0 rgba(59,130,246,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.08)';
            });
            textarea.value = section_div_wrapper.innerHTML;
            return textarea;
        }

        async function createVersionComboBox(updatableSectionUuid, businessId, textarea, section_div_wrapper, modalContent) {
            // Only update the placeholder, never create or insert it here
           let lVersionCombo = null;
            let placeholder = modalContent.querySelector('#version-combobox-placeholder');
            if (!placeholder) {
                // Defensive: if not found, do nothing
                return null;
            }
            // Clear previous content
            placeholder.innerHTML = '<span style="opacity:0.7;">Selecione uma versão para editar</span>';

            if (updatableSectionUuid && businessId) {
                try {
                    const url = `https://p2digital.com.br/msitesapp/api/page-section-versions?updatable-section-uuid=${encodeURIComponent(updatableSectionUuid)}&business-id=${encodeURIComponent(businessId)}`;
                    const resp = await fetch(url);
                    const data = await resp.json();
                    // Expecting { list: [...], active_version: { id, file_content } }
                    if (data && Array.isArray(data.versions.list) && data.versions.list.length > 0) {
                        lVersionCombo = document.createElement('select');
                        lVersionCombo.style.margin = '0 auto 12px auto';
                        lVersionCombo.style.display = 'block';
                        lVersionCombo.style.width = '100%';
                        lVersionCombo.style.padding = '10px 14px';
                        lVersionCombo.style.fontSize = '1.08em';
                        lVersionCombo.style.borderRadius = '7px';
                        lVersionCombo.style.border = '2px solid #3b82f6';
                        lVersionCombo.style.color = '#222';
                        lVersionCombo.style.background = 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)';
                        lVersionCombo.style.boxShadow = '0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        lVersionCombo.style.fontWeight = '500';
                        lVersionCombo.style.transition = 'border-color 0.2s, box-shadow 0.2s';

                        // Add default option
                        const defaultOpt = document.createElement('option');
                        defaultOpt.textContent = 'Versão Original';
                        data.versions.list.forEach((ver, idx) => {
                            const opt = document.createElement('option');
                            opt.value = ver.id.toString();
                            defaultOpt.value = opt.value + ':original';
                            opt.textContent = `Versão de ` + (ver.created ? (new Date(ver.created)).toLocaleString() : '');
                            lVersionCombo.appendChild(opt);
                        });
                        lVersionCombo.appendChild(defaultOpt);
                        updateTextarea();

                        if (data.versions.active_version) {
                            lVersionCombo.value = data.versions.active_version.id;
                            textarea.value = data.versions.active_version.file_content;
                        }

                        lVersionCombo.addEventListener('focus', function() {
                            lVersionCombo.style.borderColor = '#2563eb';
                            lVersionCombo.style.boxShadow = '0 0 0 2.5px #3b82f633, 0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        });
                        lVersionCombo.addEventListener('blur', function() {
                            lVersionCombo.style.borderColor = '#3b82f6';
                            lVersionCombo.style.boxShadow = '0 1.5px 8px 0 rgba(59,130,246,0.04)';
                        });

                        async function  updateTextarea() {
                            const selected = lVersionCombo.options[lVersionCombo.selectedIndex];
                            const siteId = section_div_wrapper.getAttribute('updatable-section-siteid');
                            const url = `https://p2digital.com.br/msitesapp/api/page-section-version?site-id=${encodeURIComponent(siteId)}&id=${encodeURIComponent(selected.value)}`;
                            const resp = await fetch(url);
                            const data = await resp.json();
                            if (data && data.version.file_content) {
                                textarea.value = data.version.file_content;
                            }
                        }

                        lVersionCombo.addEventListener('change', async function(event) {
                            await updateTextarea();
                        });

                        // Replace placeholder content with the new combobox
                        placeholder.innerHTML = '';
                        placeholder.appendChild(lVersionCombo);
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
            return lVersionCombo;
        }

        function createCloneButton(section_div_wrapper, createVersionComboBoxLazy, toggleDisabledStateLazy) {
            const cloneBtn = document.createElement('button');
            cloneBtn.type = 'button';
            cloneBtn.textContent = 'Clonar';
            Object.assign(cloneBtn.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#00b894',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            cloneBtn.onclick = () => {
                toggleScreenOverlay(true, 'Clonando seção...');
                const uuid = section_div_wrapper.getAttribute('updatable-section-uuid');
                const title = section_div_wrapper.getAttribute('updatable-section-title');
                const filePath = section_div_wrapper.getAttribute('updatable-section-filepath');
                const siteId = section_div_wrapper.getAttribute('updatable-section-siteid');
                const businessId = section_div_wrapper.getAttribute('updatable-section-businessid');
                const htmlContent = document.getElementById('uuid-html-editor').value;
                if (!uuid || !title || !filePath || !businessId || !htmlContent) {
                    alert('Faltam atributos para clonar.');
                    console.error('Missing attributes for cloning:', { uuid, title, filePath, businessId, htmlContent });
                    return;
                }
                fetch('https://p2digital.com.br/msitesapp/api/webpage-section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        updatableUuid: uuid,
                        title: title,
                        webpageRelativePath: filePath,
                        businessId: businessId,
                        htmlContent: htmlContent,
                        siteId: siteId
                    }),
                })
                .then(response => response.json())
                .then(async data => {
                    versionCombo = await createVersionComboBoxLazy();
                    toggleDisabledStateLazy();
                    toggleScreenOverlay(false);
                })
                .catch(error => {
                    toggleScreenOverlay(false);
                    // TODO: Show error in modal, refactor to use a better alert system
                    alert('Erro ao clonar seção. Veja console para detalhes.');
                    console.error('Clonar error:', error);
                });
            };
            return cloneBtn;
        }

        function createPublishButton(section_div_wrapper, versionCombo) {
            const publishBtn = document.createElement('button');
            publishBtn.type = 'button';
            publishBtn.textContent = 'Publicar';
            Object.assign(publishBtn.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            publishBtn.onclick = () => {
                toggleScreenOverlay(true, 'Publicando seção...');
                const uuid = section_div_wrapper.getAttribute('updatable-section-uuid');
                const filePath = section_div_wrapper.getAttribute('updatable-section-filepath');
                const businessId = section_div_wrapper.getAttribute('updatable-section-businessid');
                const htmlContent = document.getElementById('uuid-html-editor').value;

                // versionCombo
                const versionId = versionCombo.value;
                console.log('Publishing version ID:', versionId);

                if (!uuid || !filePath || !businessId || !htmlContent) {
                    alert('Faltam atributos para publish.');
                    console.error('Missing attributes for publishing:', { uuid, filePath, businessId, htmlContent });
                    return;
                }
                fetch('https://p2digital.com.br/msitesapp/api/publish-section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        updatableUuid: uuid,
                        webpageRelativePath: filePath,
                        businessId: businessId,
                        htmlContent: htmlContent,
                        siteId: section_div_wrapper.getAttribute('updatable-section-siteid'),
                        versionId: versionId,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    toggleScreenOverlay(false);
                    console.log('Publish response:', data);
                })
                .catch(error => {
                    toggleScreenOverlay(false);
                    console.error('Publish error:', error);
                });
            };
            return publishBtn;
        }

        function createPreviewButton() {
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.textContent = 'Vizualizar';
            Object.assign(previewBtn.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            return previewBtn;
        }

        function createSaveButton(section_div_wrapper, textarea) {
            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.textContent = 'Salvar';
            Object.assign(saveBtn.style, {
                marginTop: '12px',
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });
            saveBtn.onclick = async () => {
                if (!versionCombo || !versionCombo.value) {
                    alert('Selecione uma versão para salvar.');
                    return;
                }
                const siteId = section_div_wrapper.getAttribute('updatable-section-siteid');
                const htmlContent = textarea.value;
                const webPageSectionVersionId = versionCombo.value;
                if (!siteId || !htmlContent || !webPageSectionVersionId) {
                    alert('Faltam parâmetros para salvar.');
                    return;
                }
                toggleScreenOverlay(true, 'Salvando...');
                try {
                    const resp = await fetch('https://p2digital.com.br/msitesapp/api/update-section-file-version', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            webPageSectionVersionId,
                            siteId,
                            htmlContent
                        })
                    });

                    const data = await resp.json();
                    toggleScreenOverlay(false);
                } catch (err) {
                    toggleScreenOverlay(false);
                    alert('Erro ao salvar. Veja o console para detalhes.');
                    console.error('Erro ao salvar seção:', err);
                }
            };
            return saveBtn;
        }

        // --- Main showModal function ---
        async function showModal(section_div_wrapper) {
            document.querySelectorAll('.uuid-modal').forEach((m) => m.remove());
            const modal = createModalContainer();
            const modalContent = createModalContent();
            const closeBtn = createCloseButton(modal);
            modal.addEventListener('mousedown', function (e) {
                if (!modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
            const modalTitle = createModalTitle(section_div_wrapper);
            const label = createLabel();
            const textarea = createTextarea(section_div_wrapper);
            const updatableSectionUuid = section_div_wrapper.getAttribute('updatable-section-uuid');
            const businessId = section_div_wrapper.getAttribute('updatable-section-businessid');

            // Always create and insert the placeholder for the combobox ONCE here
            const comboBoxPlaceholder = createPlaceholderForTheComboBox();
            // Insert before textarea for best UX
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(modalTitle);
            modalContent.appendChild(label);
            modalContent.appendChild(comboBoxPlaceholder);
            modalContent.appendChild(textarea);

            // Now create the combobox and update the placeholder
            const createVersionComboBoxLazy = () => createVersionComboBox(updatableSectionUuid, businessId, textarea, section_div_wrapper, modalContent);
            versionCombo = await createVersionComboBoxLazy();


            const toggleDisabledStateLazy = () => toggleDisabledState(textarea, publishBtn, previewBtn, false);

            const cloneBtn = createCloneButton(section_div_wrapper, createVersionComboBoxLazy, toggleDisabledStateLazy);
            const publishBtn = createPublishButton(section_div_wrapper, versionCombo);
            const saveBtn = createSaveButton(section_div_wrapper, textarea);
            const previewBtn = createPreviewButton();

            previewBtn.onclick = () => {
                modal.remove();
                section_div_wrapper.innerHTML = textarea.value.trim();
            };

            if (versionCombo === null) {
                // Visually and functionally disable textarea and publish button
                toggleDisabledState(textarea, publishBtn, previewBtn, true);
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
            } else {
                toggleDisabledState(textarea, publishBtn, previewBtn, false);
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
            }

            modalContent.appendChild(cloneBtn);
            modalContent.appendChild(publishBtn);
            modalContent.appendChild(saveBtn);
            modalContent.appendChild(previewBtn);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }
    });
})();
