# A2 — Superficie `/setter`: viabilidad de una sección de documentación

**Fecha:** 2026-08-13 · **Modo:** read-only, cero ediciones · **Base:** `main` @ 05ae1a87

> Relevamiento del terreno. Sin plan de implementación.

---

## 1. Mapa de `/setter` y archivos exactos a tocar para sumar una sección

### 1.1 Cadena de montaje

```
src/app/layout.tsx                       root layout (Preloader → SmoothScroll → TransitionProvider)
└─ src/app/(protected)/setter/layout.tsx    server: auth + rol + badge de novedades; arma el topbar
   └─ _components/setter-shell.tsx          'use client': geometría (fixed inset-0, rail 240px, drawer mobile)
      └─ _components/setter-nav.tsx         'use client': NAV_ITEMS + botón "Cargar prospecto" + ToolsRail
         └─ _components/tools-rail.tsx      links EXTERNOS (no rutas)
```

### 1.2 Rutas que existen hoy

| Ruta | Archivo |
|---|---|
| `/setter` | `setter/page.tsx` (home: foco + cartera + novedades + mis números) |
| `/setter/nuevo` | `setter/nuevo/page.tsx` |
| `/setter/nuevo/importar` | `setter/nuevo/importar/page.tsx` |
| `/setter/leads/[leadId]` | redirige a `…/manual` |
| `/setter/leads/[leadId]/manual` | índice sin pantalla: deriva posición y redirige |
| `/setter/leads/[leadId]/manual/[paso]` | las 16 pantallas del manual |

Además: `error.tsx`, `loading.tsx`, `not-found.tsx` en la raíz de `/setter`, y `error.tsx`/`loading.tsx` en `leads/[leadId]`.

### 1.3 Archivo exacto para sumar un ítem de navegación

**`src/app/(protected)/setter/_components/setter-nav.tsx`, líneas 29-31:**

```ts
const NAV_ITEMS: NavItem[] = [
  { href: '/setter', label: 'Cartera', icon: LayoutDashboard },
]
```

Es un array tipado `{ href, label, icon: LucideIcon }`. El docblock de `:21-28` dice explícitamente que es array "para que sprints posteriores agreguen destinos sin reescribir la barra; NO se inventan rutas".

**Detalles que condicionan cómo se agrega:**

1. **El activo se calcula por subárbol** — `setter-nav.tsx:81-82`:
   ```ts
   const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
   ```
   Con `NAV_ITEMS` teniendo hoy un solo ítem cuyo `href` es `/setter`, **cualquier ruta nueva bajo `/setter/` deja "Cartera" marcada como activa**. Agregar `/setter/docs` sin tocar esa lógica dejaría dos ítems activos a la vez.

2. **La navegación es por `triggerTransition()`, no `<Link>`** — `setter-nav.tsx:36-44`. Los ítems son `<button>`, no anchors. (Nota: esto contradice lo que dice `CLAUDE.md` sobre portales; ver A1 §7 #10.)

3. **El rail cierra el drawer mobile con `onNavigate`** — `setter-shell.tsx:70` pasa `() => setMobileOpen(false)`.

4. **Hay un `pill` animado con `layoutId="setter-sidebar-active-pill"`** (`setter-nav.tsx:101`). Con más de un ítem, Framer Motion animará el traslado del pill entre ítems — comportamiento nuevo, hoy nunca ejercitado (un solo ítem).

5. **Los links externos NO van en `NAV_ITEMS`** — viven en `tools-rail.tsx`, alimentado por `src/lib/leados/herramientas.ts`.

### 1.4 Archivos a tocar (mínimo) para una sección nueva

| Archivo | Qué cambia |
|---|---|
| `_components/setter-nav.tsx:29-31` | sumar el `NavItem` |
| `_components/setter-nav.tsx:81-82` | corregir el cálculo de activo (o el `href` de Cartera) |
| `app/(protected)/setter/<seccion>/page.tsx` | ruta nueva (no existe) |
| `app/(protected)/setter/<seccion>/[slug]/page.tsx` | detalle, si hay más de un documento |

El `layout.tsx` de `/setter` **no necesita tocarse**: ya cubre auth, rol y shell para todo el subárbol.

---

## 2. Gating por rol — veredicto explícito

### La autorización NO vive solo en el middleware. Es defensa en profundidad, en tres capas.

**Capa 1 — middleware (`src/proxy.ts`)**

- `:102` — `const isSetterRoute = pathname.startsWith(SETTER_PATH)`
- `:104-108` — sin sesión + ruta protegida → `/login` con `callbackUrl`
- `:117-122` — rama SETTER con retorno temprano: un SETTER en `/admin`, `/dashboard`, `/bienvenida` o `/login` es redirigido a `/setter`
- `:125-132` — no-SETTER en `/setter` → su zona habitual
- `:171-173` — `matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password']`

**Capa 2 — layout server-side (`setter/layout.tsx`)**

```
:26   const session = await auth()
:28-30  if (!session?.user) redirect('/login')
:32-34  if (session.user.role !== 'SETTER') redirect(...)
```

Es un Server Component con `export const dynamic = 'force-dynamic'` (`:10`) y `noStore()` (`:24`). Corre en cada request, en el servidor, **independientemente del middleware**.

**Capa 3 — guard por página y por server action (`requireSetter()`)**

`src/lib/auth-guards.ts:13-21`:
```ts
export async function requireSetter(): Promise<string> {
  const session = await auth()
  if (session?.user?.role !== 'SETTER' || !session.user.id) throw new Error('Unauthorized')
  return session.user.id
}
```

Presencia verificada, archivo por archivo:

| Archivo | `requireSetter` |
|---|---|
| `setter/page.tsx:29` | sí |
| `setter/nuevo/page.tsx:18` | sí (comentario: *"Gate server-side (no alcanza el middleware)"*) |
| `setter/nuevo/importar/page.tsx:16` | sí (mismo comentario) |
| `setter/leads/[leadId]/manual/_data.ts:134` | sí |
| `_actions/agenda.actions.ts` | 4 refs |
| `_actions/cartera.actions.ts` | 4 refs |
| `_actions/dossier.actions.ts` | 12 refs |
| `_actions/foco.actions.ts` | 4 refs |
| `_actions/novedades.actions.ts` | 3 refs |
| `_actions/outreach.actions.ts` | 5 refs |
| `_actions/prospecto.actions.ts` | 3 refs |
| `_actions/prospecto-bulk.actions.ts` | 3 refs |

**8/8 archivos de server actions y 4/4 páginas con datos** llaman `requireSetter()`. `dossier.actions.ts:7` lo dice literal: *"requireSetter() en TODAS — el middleware no alcanza"*.

**Sobre CVE-2025-29927:** el patrón "solo middleware" —el que ese CVE hace evitable con un header falso— **no se da acá**. Aunque el middleware fuese saltado por completo, `setter/layout.tsx:32` y `requireSetter()` siguen ejecutando `auth()` en el servidor y cortando. Una sección de documentación que siga el mismo patrón (guard en la página, no solo confiar en el layout) queda con la misma protección.

**Salvedad:** el gate es *binario por rol*, no por identidad. Cualquier `SETTER` ve todo `/setter`. No hay ningún mecanismo de permisos más fino (el aislamiento por `assignedToId` protege los *leads*, no las *rutas*).

**Salvedad 2 (fuera de scope estricto, se anota):** `next.config.ts:83-88` aplica `X-Frame-Options: DENY` a `/(admin|dashboard)(.*)` — **`/setter` queda afuera**, y la CSP con `frame-ancestors 'none'` está en modo `Report-Only` (`:66`). La zona del setter es hoy embebible en un iframe ajeno.

---

## 3. Inventario de dependencias de markdown

**Ya instaladas, en `package.json`:**

| Paquete | Versión | Estado |
|---|---|---|
| `react-markdown` | `^10.1.0` | **en uso** — 4 consumidores |
| `remark-gfm` | `^4.0.1` | **en uso** — tablas, checklists, autolinks |
| `@tailwindcss/typography` | `^0.5.19` | **instalado y cargado, sin usar** |

**NO instalados:** `next-mdx-remote`, `@next/mdx`, `marked`, `gray-matter`, `remark-frontmatter`, `rehype-*`, `shiki`, `prism`.

**Consumidores actuales de `react-markdown`:**
- `src/modules/chatbot/components/admin/kb/MarkdownEditor.tsx:4-5` (con `remark-gfm`)
- `src/modules/chatbot/components/chat/ChatWindow.tsx:5`
- `src/modules/chatbot/components/chat/StreamingMarkdown.tsx:4`
- `src/modules/chatbot/components/embed/ChatbotEmbed.tsx:6`

**Sobre `@tailwindcss/typography`:** está cargado en `src/app/globals.css:2` con `@plugin "@tailwindcss/typography";`. Un `grep` de la clase `prose` en `src/` devuelve **cero usos reales** — los 20 matches son `max-w-ds-prose`, que es un token propio del design system, no el plugin. O sea: el plugin de tipografía para prosa larga está pago y sin estrenar.

**Sin frontmatter parser.** Los 14 documentos de `docs/manual-usuario/` (`00-INDICE.md`, `01-…` a `13-…`) **no tienen frontmatter YAML** — arrancan directo en prosa. Título y orden hoy están implícitos en el nombre del archivo.

---

## 4. Assets estáticos y ubicación técnica del contenido

### 4.1 Cómo se maneja el contenido estático hoy

- `public/` (14 entradas): `widget.js`, `logodevelOP.{png,svg}`, `images/`, `video/`, `videos/`, `hdri/`, `maps/`, `test-widget.html`, SVGs de Next.
- **No hay lectura de archivos en runtime en código de aplicación.** `grep` de `readFileSync|readFile(|node:fs` en `src/` devuelve solo `modules/chatbot/evals/**` (scripts de evaluación) y un `*.invariant.ts` de tests. Ninguna ruta de `app/` lee del disco.
- El contenido largo del setter hoy **es TypeScript, no markdown**: `src/lib/leados/guidance-content.ts` (48 KB) con tipos `Segmento`/`LineaRica`, renderizado por `teach-panel.tsx`. Su docblock (`:1-33`) declara la regla de límite: *"Acá viven las PALABRAS… el CRITERIO sigue en flow.ts"*.
- `next.config.ts` **no define `outputFileTracingIncludes`** (las únicas claves del objeto son `distDir`, `serverExternalPackages`, `typescript`, `images`, `headers`, `redirects` + opciones de Sentry).

### 4.2 Restricciones del entorno que condicionan dónde poner la carpeta

**(a) Netlify + `@netlify/plugin-nextjs` → funciones serverless.**
`netlify.toml`: `command = "npx prisma generate && npm run build"`, `publish = ".next"`, plugin `@netlify/plugin-nextjs`, `node_bundler = "esbuild"`. Un archivo que solo exista en el repo **no está garantizado en el filesystem de la función** salvo que el file-tracing de Next lo incluya. Hoy no hay `outputFileTracingIncludes`, y **no existe ningún precedente en el repo de leer un archivo del disco en runtime**. Lo que sí está probado en este proyecto es el contenido *importado* (bundleado en build): `guidance-content.ts`, `flow-content.ts`, `copy-blocks.ts`, `herramientas.ts`.

**(b) Tailwind 4.3.1 escanea el proyecto entero por auto-detección.**
`globals.css` no declara ningún `@source` ni `@source not` — solo `@import "tailwindcss"` (`:1`). Con detección automática, Tailwind v4 escanea el árbol del proyecto excluyendo lo ignorado por `.gitignore`. `docs/` **está trackeado**, así que `docs/**/*.md` **se escanea**. Esto ya rompió el build una vez en este repo: citar en un `.md` una clase que contiene la función CSS de recurso externo (las tres letras `u`,`r`,`l` seguidas de paréntesis) hizo fallar la compilación con `Can't resolve './&'` atribuido a `globals.css`.

**Consecuencia:** cualquier carpeta de markdown que viva **dentro del proyecto Next** entra al scan de Tailwind salvo que se excluya explícitamente (`@source not` está disponible en 4.3.1) o se ignore por git. Un documento de capacitación que cite CSS o clases puede tumbar el build de producción.

**(c) Precedente de aislamiento de directorios ya resuelto:** `next.config.ts:24` parametriza `distDir` vía `E2E_DIST_DIR`, y `.gitignore` excluye `.next-setter/` y `.next-galeria/`. El repo ya tiene el hábito de aislar directorios que confunden al build.

### 4.3 Ubicación técnicamente sana (hecho del entorno, no decisión de producto)

`logic-core-v3/content/docs/**.md` — dentro del proyecto Next, **fuera de `src/`**, con dos condiciones no negociables:

1. **Excluir la carpeta del scan de Tailwind** con `@source not "../../content/**"` (o equivalente) en `globals.css`. Sin esto, un documento con un ejemplo de CSS rompe el build.
2. **Consumirla por import en build-time, no por `fs` en runtime** — es el único patrón con precedente en este repo y el único que no depende de configurar `outputFileTracingIncludes` para Netlify. Si se elige `fs`, hay que agregar `outputFileTracingIncludes` explícitamente y verificarlo en deploy, no en local.

Alternativa igualmente válida para la portabilidad que se busca: dejar el contenido donde ya está (`docs/manual-usuario/`) y aplicar las mismas dos condiciones. Ganás cero duplicación y perdés la separación "contenido de producto" vs "documentación de repo".

**Lo que NO conviene técnicamente:** `public/` (los `.md` quedarían servidos crudos a cualquiera con la URL, sin gate de rol — contradice el requisito de gating) y `src/` (mezcla contenido con código y garantiza el scan de Tailwind).

---

## 5. Riesgos técnicos para una vista de lectura larga en mobile

### 5.1 La geometría: `fixed inset-0` con scroll interno

`_components/setter-shell.tsx`:

```
:27-30   <div className="fixed inset-0 bg-[var(--color-void)]" style={{ zIndex: zIndex.appShell }}>
:74      <div className="relative h-full lg:pl-[240px]">
:75      <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-3 pt-16 sm:p-4 lg:pt-4">
:76      {topbar}
:78      <main className="relative mt-4 min-h-0 flex-1 overflow-y-auto py-8">
```

El documento **no scrollea**: scrollea `<main>`. Consecuencias concretas para una vista de lectura larga:

| # | Riesgo | Detalle |
|---|---|---|
| R1 | **La barra de URL del navegador móvil nunca se colapsa** | Con `fixed inset-0`, el body tiene altura de viewport. En iOS Safari / Chrome Android la chrome del navegador se queda visible todo el recorrido: se pierden ~60-110 px de alto útil de forma permanente. En una lectura de 200 líneas eso es ~15% más de scrolls |
| R2 | **`window.scrollTo()` y `scrollY` no sirven** | Un "volver arriba", un índice con anclas o una restauración de posición tienen que operar sobre el nodo `<main>`, no sobre `window`. Hoy **no hay ningún precedente**: `grep` de `scrollIntoView\|scrollTo\|sticky top-` en toda la carpeta `setter/` devuelve **cero matches** |
| R3 | **Los anclas `#id` de markdown no funcionan solas** | Navegar a `/setter/docs/tu-dia#los-toques` requiere scrollear el contenedor manualmente. `react-markdown` no genera `id` en los headings por defecto (haría falta `rehype-slug`, que no está instalado) |
| R4 | **`position: sticky` se ancla a `<main>`, no al viewport** | Un índice sticky o un header de documento pegajoso funcionan, pero relativos al contenedor scrolleable. Es distinto de lo que se asume al copiar patrones de una página normal |
| R5 | **Doble scrollbar en desktop** | `<main>` scrollea con la ventana ya fija; en desktop hay una sola barra visible (la interna), pero cualquier `overflow` extra dentro del documento (tablas anchas, bloques de código) suma una segunda |
| R6 | **La restauración de scroll de Next no aplica** | Volver atrás desde un documento a la lista reinicia la posición: el router restaura el scroll de la ventana, que siempre es 0 |
| R7 | **Sin `pt-16` de sobra en mobile** | `:75` reserva `pt-16` en mobile para el botón hamburguesa `fixed left-4 top-4` (`:35`). El contenido arranca 64 px abajo. En un documento largo eso está bien; en el índice, no hay margen para poner nada más arriba |
| R8 | **El drawer y el backdrop son `fixed` con z-index del design system** | `zIndex.appDrawer`, `appDrawerBackdrop`, `appNavTrigger` de `@/lib/design-tokens`. Cualquier overlay propio de la vista de lectura (buscador, TOC flotante) tiene que pedir su lugar en esa escala, no inventar un z |

**Veredicto sobre "si el scroll funcionaría bien en mobile":** funciona — el contenedor scrollea y es táctil — pero **con dos degradaciones reales**: la barra del navegador no se retrae (R1) y todo lo que sea navegación dentro del documento (índice, anclas, volver-arriba, restaurar posición) hay que programarlo contra el nodo, no contra la ventana (R2, R3, R6). Ninguna de esas tres cosas existe hoy en `/setter`.

### 5.2 Riesgo adicional: `react-markdown` es cliente

Los 4 consumidores actuales son `'use client'`. Renderizar el documento en el cliente significa mandar el markdown crudo en el payload RSC y parsearlo en el navegador. Para 14 documentos de 116-227 líneas es viable, pero es el patrón contrario al resto de `/setter`, donde todas las páginas son Server Components `force-dynamic`.

---

## 6. Precedentes reutilizables en el proyecto

| Precedente | Archivo | Qué aporta |
|---|---|---|
| **`PantallaManual`** — layout-tipo de lectura + acción | `setter/leads/[leadId]/manual/_components/pantalla-manual.tsx` | El patrón más cercano: cabecera + zonas (`contexto` / `municion` / `captura`) + navegación, todo Server Component. Su `Zona()` (`:20-30`) es literalmente un contenedor de contenido enmarcado |
| **`teach-panel.tsx` + `guidance-content.ts`** | `setter/_components/teach-panel.tsx`, `lib/leados/guidance-content.ts` | Contenido largo tipado, renderizado sin markdown. `LineaRicaText` (`:17-38`) resuelve el énfasis dentro de una línea. Es el precedente vigente de "contenido editable por Franco sin tocar componentes" |
| **`MarkdownEditor`** | `modules/chatbot/components/admin/kb/MarkdownEditor.tsx` | El único render real de markdown largo del repo: `ReactMarkdown` + `remarkGfm`, con modos edit/preview/split. Client component |
| **`ToolGuide` / `CopyBlock` / `EjemploIdeal`** | `setter/_components/{tool-guide,copy-block,ejemplo-ideal}.tsx` | Piezas de contenido explicativo ya con el lenguaje visual del setter |
| **`ArchivoManual`** | `setter/leads/[leadId]/manual/_components/archivo-manual.tsx` | Vista de solo lectura dentro del shell |
| **`/styleguide`** | `app/styleguide/page.tsx` | Página larga de solo lectura con índice de secciones (`GATE_ITEMS`, `:29+`) — pero **fuera** del shell del setter, con scroll de ventana normal. Su patrón de índice NO se traslada tal cual (ver R2/R4) |

**No hay precedente de:** leer markdown desde archivos, índice con anclas, buscador de contenido, ni restauración de posición de lectura.

---

## 7. Resumen de hallazgos

1. **Sumar una sección es de una línea + una corrección.** El ítem va en `setter-nav.tsx:29-31`; pero el cálculo de activo (`:81-82`, `startsWith('/setter')`) marca "Cartera" activa en cualquier subruta y hay que corregirlo.
2. **El gating es sólido y no depende del middleware.** Tres capas independientes: `proxy.ts`, `setter/layout.tsx:32`, y `requireSetter()` en 8/8 actions y 4/4 páginas con datos. El patrón que hace explotable a CVE-2025-29927 no está presente.
3. **El markdown ya está pago.** `react-markdown@10.1.0` + `remark-gfm@4.0.1` en uso, y `@tailwindcss/typography@0.5.19` cargado en `globals.css:2` sin un solo consumidor. Falta parser de frontmatter (no hay ninguno) y `rehype-slug` si se quieren anclas.
4. **Los documentos no tienen frontmatter.** Título y orden viven en el nombre del archivo.
5. **Son 14 documentos, no 8.** `docs/manual-usuario/` tiene `00-INDICE.md` + `01`–`13` = 14 archivos de capacitación (2.075 líneas), más 8 archivos de trabajo (hallazgos, baches, validaciones, progreso) que suman otras 3.607 líneas y no son material de lectura para el setter.
6. **Dos condiciones de entorno no negociables** para cualquier carpeta de contenido dentro del proyecto: excluirla del scan de Tailwind, y consumirla por import en build-time (o configurar `outputFileTracingIncludes` explícitamente para Netlify, sin precedente en el repo).
7. **El shell hace que la lectura larga en mobile pierda la retracción de la barra del navegador** y obliga a programar toda navegación intra-documento contra el nodo `<main>`, no contra `window`. Hoy no existe ni un `scrollIntoView` en toda la carpeta `/setter`.
8. **`/setter` no tiene `X-Frame-Options`** (`next.config.ts:83-88` solo cubre admin y dashboard) y la CSP está en `Report-Only`.
