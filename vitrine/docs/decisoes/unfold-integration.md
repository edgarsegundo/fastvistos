# Django Unfold: Integração com Admin

**Data**: 2026-07-21  
**Status**: ✅ Implementado  
**Referência**: Padrão do projeto `emprego`

## O que é Django Unfold

[django-unfold](https://unfoldadmin.com) é uma modernização do Django admin com:
- UI/UX melhorada (sidebars, filtros, dark mode)
- Componentes customizados (forms, inlines, filters)
- Responsivo mobile
- Tema customizável (cores, logo, sidebar)

## Implementação no vitrine

### 1. Dependência

Adicionado `django-unfold>=0.91.0` em `pyproject.toml`:

```bash
uv sync  # Instala automaticamente
```

### 2. INSTALLED_APPS

Em `vitrine_core/settings.py`, unfold vem ANTES de `django.contrib.admin`:

```python
INSTALLED_APPS = [
    'core',
    'tenancy',

    'unfold',                          # antes de admin
    'unfold.contrib.filters',
    'unfold.contrib.forms',

    'django.contrib.admin',            # depois
    # ...
]
```

**Importante**: ordem importa — unfold precisa registrar seus templates antes do admin.

### 3. Configuração

Minimalista (sem dashboard customizado, sem sidebar complexa):

```python
UNFOLD = {
    'SITE_HEADER': 'Vitrine Admin',
    'SITE_TITLE': 'Vitrine',
    'SITE_SYMBOL': 'settings',
    'SHOW_HISTORY': True,
    'SIDEBAR': {
        'show_search': True,
        'show_all_applications': True,
    },
}
```

### 4. Admin Classes

Todos os `ModelAdmin` herdam de `unfold.admin.ModelAdmin`:

```python
from unfold.admin import ModelAdmin

@admin.register(ClientUser)
class ClientUserAdmin(BaseUserAdmin, ModelAdmin):  # Herda de ambos
    # fieldsets, list_display, etc. funcionam igual
    pass
```

**Vantagem**: herdar de `unfold.admin.ModelAdmin` + `BaseUserAdmin` combina os dois.

## Arquivos Modificados

- `pyproject.toml`: adicionado `django-unfold>=0.91.0`
- `vitrine_core/settings.py`: INSTALLED_APPS + UNFOLD config
- `core/admin.py`: `ClientUserAdmin` herda de `ModelAdmin`
- `tenancy/admin.py`: `ClientAdmin`, `ClientProfileAdmin`, `ClientScopedAdmin` herdam de `ModelAdmin`

## Próximas melhorias (opcionais)

- [ ] Customizar cores (brand color de vitrine/emprego)
- [ ] Logo customizado (SVG)
- [ ] Sidebar navigation customizada (modelos agrupados)
- [ ] Dark/light mode toggle
- [ ] Dashboard customizado com stats

## Referência: emprego

O projeto `emprego` tem config mais complexa:

```python
UNFOLD = {
    "SITE_HEADER": "EmpregoAqui Admin",
    "SITE_LOGO": lambda request: static("images/emprego-aqui-icone.svg"),
    "DASHBOARD_CALLBACK": "visibility.views.dashboard_callback",
    "COLORS": {
        "primary": {  # Coral (#F28B30) da marca
            "50": "#fef4ea",
            # ... paleta completa
            "950": "#3d2009",
        },
    },
    "SIDEBAR": {
        "navigation": [
            {
                "title": "Painel",
                "icon": "dashboard",
                "link": "/admin/",
            },
            # ... mais items
        ],
    },
}
```

Se vitrine virar SaaS/público, pode reutilizar esse padrão.

## Validação

✅ `uv sync` instalou django-unfold  
✅ `python manage.py runserver` sem erros  
✅ Admin interface carrega com Unfold UI
