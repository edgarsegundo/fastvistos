// updatable-editor.js
// This script enables in-place editing of divs with [updatable-section-uuid] using a modal UI.
// Usage: Inject this script into your HTML (e.g., via <script src="/path/to/updatable-editor.js"></script>)

(function () {

    // Overlay utility: disables the whole screen and shows a label and throbber
    function toggleScreenOverlay(show, label = 'Processando...') {
        let overlay = document.getElementById('global-throbber-overlay');
        if (show) {
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
                overlay.style.display = 'none';
            }
        }
    }

    // Utility to toggle disabled state with visual feedback
    function toggleDisabledState(textarea, publishBtn, previewBtn, disabled) {
        if (disabled) {
            textarea.disabled = true;
            publishBtn.disabled = true;
            publishBtn.style.pointerEvents = 'none';
            previewBtn.style.display = 'none';

            // Add Tailwind-like classes for disabled look
            textarea.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            publishBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            // Remove focus ring
            textarea.style.boxShadow = 'none';
            publishBtn.style.boxShadow = 'none';
        } else {
            previewBtn.style.display = 'inline-block';
            textarea.disabled = false;
            publishBtn.disabled = false;
            publishBtn.style.pointerEvents = 'auto';
            textarea.classList.remove('bg-gray-200', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            publishBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed', 'opacity-60');
            textarea.style.boxShadow = '';
            publishBtn.style.boxShadow = '';
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

        function createTextarea(section_div_wrapper) {
            const textarea = document.createElement('textarea');
            textarea.id = 'uuid-html-editor';
            Object.assign(textarea.style, {
                width: '100%',
                height: '300px',
                color: '#222',
                background: '#fff',
            });
            textarea.value = section_div_wrapper.innerHTML;
            return textarea;
        }

        async function createVersionComboBox(updatableSectionUuid, businessId, textarea, section_div_wrapper, modalContent) {
            let versionCombo = null;
            if (updatableSectionUuid && businessId) {
                try {
                    const url = `https://p2digital.com.br/msitesapp/api/page-section-versions?updatable-section-uuid=${encodeURIComponent(updatableSectionUuid)}&business-id=${encodeURIComponent(businessId)}`;
                    const resp = await fetch(url);
                    const data = await resp.json();
                    // Expecting { list: [...], active_version: { id, file_content } }
                    if (data && Array.isArray(data.versions.list) && data.versions.list.length > 0) {
                        versionCombo = document.createElement('select');
                        versionCombo.style.marginBottom = '12px';
                        versionCombo.style.display = 'block';
                        versionCombo.style.width = '100%';
                        versionCombo.style.padding = '6px';
                        versionCombo.style.fontSize = '1em';
                        versionCombo.style.borderRadius = '4px';
                        versionCombo.style.border = '1px solid #ccc';
                        versionCombo.style.color = '#222';
                        versionCombo.style.background = '#fff';                        
                        // Add default option
                        const defaultOpt = document.createElement('option');
                        // defaultOpt.value = '0';
                        defaultOpt.textContent = 'Versão Original';
                        data.versions.list.forEach((ver, idx) => {
                            const opt = document.createElement('option');
                            opt.value = ver.id.toString();
                            // I need to send any version so I can get the webpage section id 
                            // and then get the original version by sending :original suffix
                            defaultOpt.value = opt.value + ':original';
                            opt.textContent = `Versão de ` + (ver.created ? (new Date(ver.created)).toLocaleString() : '');
                            versionCombo.appendChild(opt);
                        });
                        versionCombo.appendChild(defaultOpt);

                        if (data.versions.active_version) {
                            console.log('[DEBUG] Active version ID:', data.versions.active_version.id);
                            // Pre-select the active version in the combo box
                            versionCombo.value = data.versions.active_version.id;
                        }

                        // Set textarea to active version content if available
                        if (data.versions.active_version && 
                            typeof data.versions.active_version.file_content === 'string' &&
                            data.versions.active_version.file_content.trim() !== '') {
                            textarea.value = data.versions.active_version.file_content;
                        }

                        versionCombo.addEventListener('change', async function(event) {
                            // event.preventDefault();
                            // event.stopPropagation();
                            // event.stopImmediatePropagation();

                            debugger;
                            const selected = versionCombo.options[versionCombo.selectedIndex];
                            const siteId = section_div_wrapper.getAttribute('updatable-section-siteid');
                            const url = `https://p2digital.com.br/msitesapp/api/page-section-version?site-id=${encodeURIComponent(siteId)}&id=${encodeURIComponent(selected.value)}`;
                            const resp = await fetch(url);
                            const data = await resp.json();
                            // Expecting { list: [...], active_version: { id, file_content } }
                            if (data && data.version.file_content) {
                                textarea.value = data.version.file_content;
                            }
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch section versions:', err);
                }
            }

            if (versionCombo) {
                modalContent.appendChild(versionCombo);
            }
            return versionCombo;
        }

        function createCloneButton(section_div_wrapper, createVersionComboBoxLazy) {
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
                    await createVersionComboBoxLazy();
                    toggleScreenOverlay(false);
                    console.log('Clonar response:', data);
                })
                .catch(error => {
                    toggleScreenOverlay(false);
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
                    console.log('Publish response:', data);
                })
                .catch(error => {
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
            // const versionCombo = await createVersionComboBox(updatableSectionUuid, businessId, textarea, section_div_wrapper);

            const createVersionComboBoxLazy = () => createVersionComboBox(updatableSectionUuid, businessId, textarea, section_div_wrapper, modalContent);
            const versionCombo = await createVersionComboBoxLazy();

            const cloneBtn = createCloneButton(section_div_wrapper, createVersionComboBoxLazy);
            const publishBtn = createPublishButton(section_div_wrapper, versionCombo);
            const previewBtn = createPreviewButton();

            previewBtn.onclick = () => {
                modal.remove();
                section_div_wrapper.innerHTML = textarea.value.trim();
            };

            if (versionCombo === null) {
                // Visually and functionally disable textarea and publish button
                toggleDisabledState(textarea, publishBtn, previewBtn, true);
            } else {
                toggleDisabledState(textarea, publishBtn, previewBtn, false);
            }
            
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(modalTitle);
            modalContent.appendChild(label);

            // if (versionCombo) {
            //     modalContent.appendChild(versionCombo);
            // }
            modalContent.appendChild(textarea);

            modalContent.appendChild(cloneBtn);
            modalContent.appendChild(publishBtn);
            modalContent.appendChild(previewBtn);


            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }
    });
})();
