# develOP Design System

**Version:** 1.0
**Ultima actualizacion:** 2026-05-18

## Filosofia

- **Dark mode nativo** - fondo zinc-950, glassmorphism sutil
- **Spacing generoso** - productos premium respiran
- **Typography sobria** - sans-serif neutro, pesos sutiles
- **Color de acento unico** - cyan develOP (`#06b6d4`)
- **Border-radius rounded** - 16-24px (`rounded-2xl`/`rounded-3xl`)
- **Borders sutiles** - `border-white/10`
- **Motion suave** - easing custom, durations 0.15-0.5s

## Tokens

Importar desde `@/lib/design-tokens`:

```typescript
import { colors, spacing, radii, typography, motion } from '@/lib/design-tokens'
```

### Colores principales

- `colors.brand.primary` - `#06b6d4` (cyan-500)
- `colors.surface.glass` - `rgba(255,255,255,0.02)` - fondo de cards
- `colors.border.default` - `rgba(255,255,255,0.1)`
- `colors.text.primary` - `#fafafa` (zinc-50)

### Spacing

- `xs` (4px)
- `sm` (8px)
- `md` (12px)
- `base` (16px)
- `lg` (20px)
- `xl` (24px)
- `2xl` (32px)
- `3xl` (48px)

### Border Radius

- `sm` (8px)
- `md` (12px)
- `lg` (16px, DEFAULT cards)
- `xl` (24px, hero)

## Componentes

Importar desde `@/components/ui`:

```typescript
import { Card, Button, Input, StatCard, Modal, Badge } from '@/components/ui'
```

### Card

```tsx
<Card variant="default | elevated | interactive | dashed | glass" padding="sm | md | lg | xl">
  Contenido
</Card>
```

### Button

```tsx
<Button variant="primary | secondary | ghost | danger" size="sm | md | lg" loading icon={<Icon />}>
  Texto
</Button>
```

### Input

```tsx
<Input invalid={hasError} placeholder="..." />
```

### Field

```tsx
<Field label="Email" hint="Tu email principal" required>
  <Input />
</Field>
```

### StatCard

```tsx
<StatCard
  label="Conversaciones"
  value={1234}
  subtitle="este mes"
  icon={MessageSquare}
  accent="cyan"
  trend={{ direction: 'up', value: '+12%' }}
/>
```

### Section

```tsx
<Section
  eyebrow="METRICAS"
  title="Performance"
  description="Datos del ultimo mes"
  action={<Button size="sm">Ver mas</Button>}
>
  Contenido
</Section>
```

### Modal

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Titulo"
  description="Descripcion opcional"
  size="sm | md | lg | xl"
  footer={<><Button variant="secondary">Cancelar</Button><Button>Confirmar</Button></>}
>
  Body
</Modal>
```

### Badge

```tsx
<Badge variant="success | warning | danger | info | brand | default">
  Texto
</Badge>
```

### EmptyState

```tsx
<EmptyState
  icon={Users}
  title="Sin leads"
  description="Cuando capturen el primero aparece aca"
  cta={{ label: 'Configurar bot', href: '/admin/clients/new' }}
/>
```

### Typography helpers

```tsx
<Eyebrow>SECCION</Eyebrow>
<Heading level={1}>Titulo principal</Heading>
<Heading level={2}>Subtitulo</Heading>
<Muted>Texto secundario</Muted>
```

## Patterns canonicos

Usar `patterns` desde `@/lib/design-patterns` para hardcodear menos:

```tsx
import { patterns as p } from '@/lib/design-patterns'

<div className={p.card.base}>...</div>
<h1 className={p.text.h1}>...</h1>
<button className={p.button.primary}>...</button>
```

## Reglas

1. **NO hardcodear colores** - usar tokens o patterns
2. **NO hardcodear paddings** - usar `padding` prop o `patterns.section.lg`
3. **Default radius es `rounded-2xl`** (16px) - solo usar `rounded-3xl` para heroes
4. **Borders sutiles** - `border-white/10` por default
5. **Motion durations** - usar `motion.duration.fast` o `0.15-0.4s`
6. **Eyebrows en sections** - siempre uppercase tracking-wide

## Cuando usar cada componente

| Caso | Componente |
|---|---|
| Container con borde | `<Card>` |
| Stat con numero grande | `<StatCard>` |
| Form input | `<Input>` dentro de `<Field>` |
| Seccion con header | `<Section>` |
| Estado vacio | `<EmptyState>` |
| Dialogo overlay | `<Modal>` |
| Etiqueta de status | `<Badge>` |
| Accion primaria | `<Button variant="primary">` |
| Accion secundaria | `<Button variant="secondary">` |
| Accion destructiva | `<Button variant="danger">` |

## Anti-patterns

No hacer:

```tsx
<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
```

Hacer:

```tsx
<Card padding="md">
```

No hacer:

```tsx
<button className="px-4 py-2 bg-cyan-500 text-white rounded">
```

Hacer:

```tsx
<Button>
```

## Playground visual

Pagina interna con todos los componentes y variantes:

**URL:** `/admin/_design`

Solo accesible para SUPER_ADMIN. Sirve como:

- Referencia visual cuando armas features nuevas
- Contexto para IAs (Claude Code, Antigravity), usando capturas o snippets
- Documentacion viva que no se desactualiza

Cada seccion tiene:

- Ejemplo renderizado del componente
- Codigo de ejemplo copiable
- Variantes principales

Secciones disponibles:

- Tokens
- Typography
- Buttons
- Cards
- Forms
- Stats
- Modals
- Badges
- Empty States
- Patterns
