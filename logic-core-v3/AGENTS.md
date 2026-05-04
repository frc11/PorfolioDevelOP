# develOP — Logic Core v3

## Contexto del proyecto

develOP es una agencia de desarrollo web y automatizaciones en Tucumán, Argentina. Este repo contiene:
1. **Landing pública** del sitio develop-portfolio.netlify.app
2. **Portal SaaS multi-tenant** para clientes (`/dashboard/*`)
3. **Panel admin** interno (`/admin/*`)

Cliente piloto principal: **Concesionaria San Miguel** (datos seed + caso real).

## Stack

- **Framework:** Next.js 16 con App Router
- **Lenguaje:** TypeScript ESTRICTO. Cero `any` types permitidos.
- **CSS:** Tailwind CSS 4
- **Animaciones:** Framer Motion (curva ease premium: `[0.25, 0.46, 0.45, 0.94]`)
- **3D:** Three.js + React Three Fiber + Drei + Postprocessing
- **DB:** Prisma + PostgreSQL Neon (region sa-east-1)
- **Auth:** NextAuth v5 con Prisma adapter
- **Deploy:** Netlify
- **IA:** Anthropic SDK (Claude Haiku 4.5: `claude-haiku-4-5-20251001`)

## Convenciones de código

### Imports
- Componentes UI base: `@/components/ui` (Card, Stat, Badge, EmptyState, LoadingState, ErrorState, Section, PageHeader, Tabs)
- Helpers: `@/lib/...`
- Utils: `@/lib/utils` (incluye `cn()` para className merge)

### Iconos
- Librería: `lucide-react`
- StrokeWidth estándar: `1.5`
- Tamaños comunes: 13 (timeline), 16 (sección), 18-20 (header), 24-28 (hero)

### Animaciones
- Spring estándar: `{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }`
- Ease premium: `[0.25, 0.46, 0.45, 0.94]`
- Duración estándar reveals: 0.5-0.7s
- Micro-interacciones: 150-200ms
- `AnimatePresence mode="wait"` para transiciones entre estados
- `pointer-events: none` en elementos decorativos
- `will-change: transform` en elementos animados complejos

### Glassmorphism (lenguaje visual base)
```css
background: rgba(255,255,255,0.04);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 1rem; /* rounded-2xl */
```

### Paleta por servicio
- Web Development: `#06b6d4` (cyan)
- Inteligencia Artificial: `#8b5cf6` (violet)
- Automatizaciones: `#10b981` (emerald)
- Software a medida: `#f59e0b` (amber)

### Backgrounds oscuros
- Base portal/admin: `zinc-950` / `zinc-900`
- Hero landing: `zinc-50` (único fondo claro)

### Tipografía
- Headlines: `font-black` o `font-bold` con `tracking-tight`
- Labels uppercase: `tracking-[0.2em]` o `tracking-widest`
- Body: `text-sm` (estándar), `text-xs` (etiquetas), `text-[10px]` (meta)

### Mobile-first
- Touch targets: mínimo 44×44px
- Breakpoints estándar Tailwind 4
- Sidebar admin se vuelve drawer en móvil

## Reglas absolutas

🔴 **NUNCA modificar `src/components/3d/HeroArtifact.tsx`** — es intocable. El artefacto 3D del hero está optimizado y cualquier cambio rompe la experiencia visual del landing.

🔴 **TypeScript estricto.** Cero `any` types. Si hay duda, declarar `unknown` y narrow.

🔴 **Server Components por defecto.** Solo usar `'use client'` cuando es estrictamente necesario (event handlers, hooks de estado).

🔴 **Internacionalización:** todo el copy en español rioplatense (vos, tenés, querés). NO usar tú/tienes/quieres.

🔴 **No exponer datos sensibles al cliente.** API keys, secrets, tokens van solo en server-side.

🔴 **`triggerTransition()`** para navegación entre secciones de landing (NO `router.push()` directo).

## Estructura de carpetas relevante

```
src/
├── app/
│   ├── (protected)/
│   │   ├── admin/         (rol SUPER_ADMIN)
│   │   └── dashboard/     (rol ORG_MEMBER)
│   ├── api/
│   └── (landing pública en raíz)
├── components/
│   ├── ui/                (primitives reusables)
│   ├── dashboard/
│   ├── admin/
│   ├── sections/          (secciones de landing)
│   └── 3d/
├── lib/
│   ├── data/             (catálogos type-safe, ej: premium-modules.ts)
│   ├── integrations/     (APIs externas: ga4, gbp, brevo, etc.)
│   ├── ai/               (helpers de Claude)
│   ├── modules/          (lógica de módulos premium)
│   └── utils.ts
├── actions/              (server actions)
└── prisma/
    ├── schema.prisma
    └── seeds/
```

## Modelos Prisma principales

- `Organization` — tenant raíz (tiene `dataConnections`, `googleRating`, etc.)
- `OrgMember` — usuarios del tenant
- `User` — auth + lastDashboardVisit
- `Service` — servicios contratados (web, IA, software, automatización)
- `Project + Task` — gestión de proyectos
- `Message` — mensajería bidireccional
- `Invoice` — facturación
- `Ticket` — soporte
- `ClientAsset` — Bóveda Digital (encrypted)
- `PremiumModule` — catálogo de módulos disponibles
- `OrganizationModule` — activación de módulos por org
- `OnboardingTask` — checklist de onboarding interno

## Variables de entorno

Las que ya existen y se usan:
- `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `RESEND_API_KEY` (notificaciones email)
- `ANTHROPIC_API_KEY` (Claude para AIBrief)
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `GOOGLE_SERVICE_ACCOUNT_KEY` (GA4 + Search Console)

Agregar según necesidad de cada prompt.

## Workflow de cambios a BD

1. Editar `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name [descriptive_name]`
3. SIEMPRE pegar el output del migrate en el reporte final
4. Si hay drift, FRENAR y reportar antes de hacer `migrate reset`

## Política de testing

- `npm run build` debe pasar al cierre de cada prompt (sin warnings de TS)
- Verificación visual la hace Franco manualmente, no Antigravity
- Codex puede ejecutar `npm run build` y `npx prisma migrate status` como healthcheck barato

## Política de errores

Si Codex encuentra:
- **Drift de Prisma:** parar y reportar. NO ejecutar `migrate reset`.
- **Conflictos de tipos:** parar y reportar.
- **Archivos legacy con código incompatible:** flagear pero no eliminar sin confirmación.
- **Migrations fallidas en BD remota:** parar y reportar con output completo.

## Reporte estándar al cierre de cada prompt

```markdown
## ✅ Sprint [ID] — Cierre

### Archivos modificados
- [lista exacta de paths]

### Comandos ejecutados
- $ [comando 1] → [ok/error]
- $ [comando 2] → [ok/error]

### Decisiones tomadas (que no estaban en el prompt)
- [si tomé una decisión técnica/UX no especificada, la listo acá]

### Flags / dudas
- [cualquier cosa que requiera atención de Franco]

### Listo para
[próximo Sprint ID o "verificación de Franco"]
```
````

---