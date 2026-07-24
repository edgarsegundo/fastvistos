/* Aplica estilos customizados aos campos de SEO no admin Unfold.
   Problema: Unfold CSS é pré-compilado, não inclui todas as classes Tailwind.
   Solução: JS adiciona classes aos campos pra ativar CSS customizado. */

document.addEventListener('DOMContentLoaded', function() {
  /* Identifica inline de SEO (procura por h2 contendo "SEO") */
  document.querySelectorAll('fieldset.inline-related h2').forEach(function(h2) {
    if (h2.textContent.includes('SEO')) {
      const fieldset = h2.closest('fieldset.inline-related');
      if (!fieldset) return;

      /* Adiciona classe ao fieldset */
      fieldset.classList.add('seo-inline-fieldset');

      /* Estiliza o h2 */
      h2.classList.add('seo-inline-label');

      /* Estiliza cada form-row (campo individual) */
      fieldset.querySelectorAll('.form-row').forEach(function(row) {
        row.classList.add('seo-inline-row');

        /* Label do campo */
        const label = row.querySelector('label');
        if (label) {
          label.classList.add('seo-inline-field-label');
        }

        /* Input, textarea, select */
        row.querySelectorAll('input[type="text"], input[type="url"], input[type="email"]').forEach(function(input) {
          input.classList.add('seo-inline-input');
        });

        row.querySelectorAll('textarea').forEach(function(textarea) {
          textarea.classList.add('seo-inline-textarea');
        });

        row.querySelectorAll('select').forEach(function(select) {
          select.classList.add('seo-inline-select');
        });

        /* Checkbox e radio */
        row.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
          checkbox.classList.add('seo-inline-checkbox');
        });

        row.querySelectorAll('input[type="radio"]').forEach(function(radio) {
          radio.classList.add('seo-inline-radio');
        });

        /* Help text (p com classe help) */
        row.querySelectorAll('p.help').forEach(function(helpText) {
          helpText.classList.add('seo-inline-help-text');
        });
      });

      /* Checklist de SEO (readonly, aparece como <ul>) */
      fieldset.querySelectorAll('.readonly').forEach(function(ro) {
        if (ro.querySelector('ul')) {
          ro.classList.add('seo-inline-checklist');
        }
      });
    }
  });

  /* Quando um novo inline for adicionado dinamicamente (button "Add another"),
     reaplica os estilos ao novo fieldset criado. */
  const formContainer = document.querySelector('.inline-group');
  if (formContainer) {
    const observer = new MutationObserver(function() {
      /* Refaz a estilização de todos os fieldsets de SEO */
      document.querySelectorAll('fieldset.inline-related h2').forEach(function(h2) {
        if (h2.textContent.includes('SEO') && !h2.closest('fieldset.inline-related').classList.contains('seo-inline-fieldset')) {
          const fieldset = h2.closest('fieldset.inline-related');
          fieldset.classList.add('seo-inline-fieldset');
          h2.classList.add('seo-inline-label');

          fieldset.querySelectorAll('.form-row').forEach(function(row) {
            if (!row.classList.contains('seo-inline-row')) {
              row.classList.add('seo-inline-row');
              row.querySelectorAll('label').forEach(l => l.classList.add('seo-inline-field-label'));
              row.querySelectorAll('input[type="text"], input[type="url"], input[type="email"]').forEach(i => i.classList.add('seo-inline-input'));
              row.querySelectorAll('textarea').forEach(t => t.classList.add('seo-inline-textarea'));
              row.querySelectorAll('select').forEach(s => s.classList.add('seo-inline-select'));
              row.querySelectorAll('input[type="checkbox"]').forEach(c => c.classList.add('seo-inline-checkbox'));
              row.querySelectorAll('input[type="radio"]').forEach(r => r.classList.add('seo-inline-radio'));
              row.querySelectorAll('p.help').forEach(h => h.classList.add('seo-inline-help-text'));
            }
          });
        }
      });
    });

    observer.observe(formContainer, { childList: true, subtree: true });
  }
});
