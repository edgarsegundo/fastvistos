// updatable-editor.js
// This script enables in-place editing of divs with [updatable-section-uuid] using a modal UI.
// Usage: Inject this script into your HTML (e.g., via <script src="/path/to/updatable-editor.js"></script>)

(function () {
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

        function showModal(section_div_wrapper) {
            document.querySelectorAll('.uuid-modal').forEach((m) => m.remove());
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
            // Close modal if user clicks outside modalContent
            modal.addEventListener('mousedown', function (e) {
                if (!modalContent.contains(e.target)) {
                    modal.remove();
                }
            });
            // Modal title using updatable-section-title
            const modalTitle = document.createElement('div');
            modalTitle.textContent =
                section_div_wrapper.getAttribute('updatable-section-title') || 'Editar HTML';
            Object.assign(modalTitle.style, {
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '1.3em',
                textAlign: 'center',
                color: '#000',
            });

            const label = document.createElement('div');
            label.textContent = `Edição de HTML`;
            Object.assign(label.style, {
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '0.95em',
                color: '#666',
                textAlign: 'center',
            });
            const textarea = document.createElement('textarea');
            textarea.id = 'uuid-html-editor';
            Object.assign(textarea.style, {
                width: '100%',
                height: '300px',
                color: '#222',
                background: '#fff',
            });
            textarea.value = section_div_wrapper.innerHTML;
            const updateBtn = document.createElement('button');
            updateBtn.type = 'button';
            updateBtn.textContent = 'Update';
            Object.assign(updateBtn.style, {
                marginTop: '12px',
                padding: '8px 16px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            });

            // Clonar button (htmx POST)
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
                // Prepare data for htmx POST
                const uuid = section_div_wrapper.getAttribute('updatable-section-uuid');
                const title = section_div_wrapper.getAttribute('updatable-section-title');
                const filePath = section_div_wrapper.getAttribute('updatable-section-filepath');
                const businessId = "5810c2b6-125c-402a-9cff-53fcc9d61bf5"; // Replace with actual businessId
                const htmlContent = document.getElementById('uuid-html-editor').value;
                if (!uuid || !title || !filePath || !businessId || !htmlContent) {
                    alert('Faltam atributos para clonar.');
                    // [CRITICAL][P0][DEV] Needs monitoring, logging, and notification
                    console.error('Missing attributes for cloning:', { uuid, title, filePath, businessId, htmlContent });
                    return;
                }
                // Use fetch to POST without reloading the page
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
                        html: htmlContent
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    // Optionally handle response
                    console.log('Clonar response:', data);
                })
                .catch(error => {
                    console.error('Clonar error:', error);
                });
            };

            modalContent.appendChild(updateBtn);
            modalContent.appendChild(cloneBtn);

            modalContent.appendChild(closeBtn);
            modalContent.appendChild(modalTitle);
            modalContent.appendChild(label);
            modalContent.appendChild(textarea);
            modalContent.appendChild(updateBtn);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }
    });
})();
