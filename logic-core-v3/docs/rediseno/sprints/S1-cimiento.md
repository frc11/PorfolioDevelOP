# S1 — Cimiento · Rediseño del Home develOP

## Cómo correr esta instrucción

- **Modelo:** Opus 5 (si no está disponible, Fable 5). **Esfuerzo:** `max`. **Modo rápido: OFF.** Modo NO autónomo.
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- PowerShell: no encadenar con `&&`; rutas con paréntesis — p. ej. `(protected)` — entre comillas; `tsc` siempre solo.
- **TRES PARADAS 🛑** bloqueantes. En cada una frenás, mostrás lo pedido y esperás confirmación humana.
- La skill `impeccable` está instalada. Usala en **modo brand** (esto es una landing de marca, no un producto). Su criterio estético queda subordinado a las decisiones de este documento: donde haya conflicto, manda este documento.

## Lecturas obligatorias antes de empezar

1. `docs/rediseno/outputs/B0b-DELTA-MAIN.md` — auditoría de estado real de main. Es tu mapa.
2. `docs/rediseno/outputs/PROBE-SERVICIOS.md` — solo la parte que explica por qué `OurServices` no se toca en este sprint.

## Contexto

develOP (agencia de web y software, Tucumán) rediseña el home. Pasa de identidad oscura con glassmorphism a **base clara**, estructura de 11 secciones a 8, y un ritmo cromático nuevo.

**Este sprint construye el andamio, no el diseño.** Al terminar, la página va a verse mezclada e inconsistente: secciones viejas dentro de una estructura nueva. **Eso es el resultado esperado.** Las secciones se reemplazan una por una en S2 a S6.

### Decisiones cerradas (no se rediscuten)

**Paleta** — todos los valores validados WCAG AA por cálculo:

| Rol | Hex |
|---|---|
| Papel (base clara) | `#F7F7F5` |
| Tinta (texto y CTA) | `#111111` |
| Sección oscura | `#0E0E0E` |
| Texto sobre oscuro | `#F7F7F5` |

| Servicio | Acento sólido (sobre papel) | Chip fondo | Chip texto | Wash de sección | Acento sobre oscuro |
|---|---|---|---|---|---|
| Web | `#1D5B8F` | `#DBE7F2` | `#134063` | `#F1F5FA` | `#8FC0E8` |
| IA + Automatización | `#1B6B4C` | `#DAEBE1` | `#124B33` | `#F1F7F3` | `#7FCBA4` |
| Software | `#57429E` | `#E3DEF1` | `#3E2E75` | `#F5F3FB` | `#AFA0E8` |

Reglas de color, no negociables:
- **El CTA es siempre tinta `#111111`.** Los acentos identifican servicios; nunca son color de acción.
- **Los washes son casi imperceptibles** — el color de servicio se siente, no se ve. Si un wash se nota como "sección de color", está mal calibrado.
- **El ámbar muere.** No queda ningún token de `automation` como servicio propio: IA y Automatización son un solo servicio, verde.
- **La paleta crema del rediseño abandonado (`#F2EEE6`, `#EAE5DA`) muere.** Si aparece en algo que recuperes, se reemplaza.

**Tipografía:**
- **Chivo** — sistema completo (títulos y texto), jerarquía por peso.
- **Chivo Mono** — datos, labels, detalles técnicos.
- **Instrument Serif** — NO se carga en este sprint. Se reserva para una única aparición en S6.
- Prohibidas: Inter, Roboto, Geist, Space Grotesk, Bricolage Grotesque. Si `layout.tsx` carga Geist hoy, se reemplaza.

**Estructura del home — 8 secciones, en este orden y con este tema:**

| # | Sección | Tema |
|---|---|---|
| 1 | Hero | claro |
| 2 | Quiénes somos | **oscuro** |
| 3 | Carrusel de palabras | claro |
| 4 | Trabajos | **oscuro** |
| 5 | Servicios | claro (con wash por servicio, en S5) |
| 6 | Tu panel | claro |
| 7 | Por qué develOP | claro (será inmersivo en S6) |
| 8 | Cierre | claro |

Muere del home actual: `InfiniteReviews`, `TodoIncluido`, `ModulosOpcionales`, `PortalDemoCTA`, `WhyDevelOP` en su forma actual. **En este sprint no se borran archivos**: simplemente dejan de estar en `page.tsx`.

## Reglas absolutas

1. **Archivos frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. `src/components/ui/*` se consume, no se edita.
2. **No tocar `OurServices.tsx`** en este sprint. Se monta tal cual está.
3. **No borrar archivos.** Los componentes que salen de `page.tsx` quedan en disco.
4. **Cero `any`.** TypeScript strict.
5. **No sumar dependencias.** Todo con lo instalado: `motion/react` (nunca `framer-motion` directo), Tailwind 4, Next 16.
6. **Nada de base de datos.** Ningún `prisma migrate` (y `migrate reset` está prohibido siempre).
7. **Git:** podés commitear y pushear en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y cualquier operación sobre `main` u otros worktrees. Nunca `git add .` — staging archivo por archivo.
8. **No auto-confirmás que funciona porque compila.** La verificación visual la hace el humano.
9. **DOS PARADAS de criterio:** si aparece (a) un cambio de permisos/autorización o (b) una decisión de lógica de negocio, contratos de datos o máquinas de estado → frenás y reportás, no decidís. Lo cosmético y de UX lo resolvés vos.

## El trabajo — 4 bloques

### Bloque 1 · Tokens y tipografía

`globals.css`: definí el sistema nuevo con la tabla de arriba. Nombres semánticos por rol (papel, tinta, superficie oscura, acento por servicio, chip, wash), no nombres de color.

**Antes de escribir**, reportá qué encontraste: el B0b dice que el árbol conserva tokens `ds-*` completos del rediseño abandonado, y que **`ui/Button.tsx` los usa y tiene 14 consumidores en el portal**. Decidí y justificá: ¿extendés el sistema `ds-*` existente o creás uno nuevo al lado? Criterio: **no romper el portal** y no dejar dos sistemas compitiendo en el sitio público.

`layout.tsx`: cargá Chivo y Chivo Mono (`next/font/google`), con los pesos que realmente vayas a usar. Sacá la fuente anterior si queda sin uso.

Definí también la **escala tipográfica** (títulos, cuerpo, labels mono) como tokens, no como clases sueltas por componente.

🛑 **PARADA 1:** mostrá (a) tu decisión sobre `ds-*` con su justificación, (b) los tokens definidos y (c) las fuentes cargadas con sus pesos. Esperá el OK.

### Bloque 2 · SectionShell con el sistema nuevo

Recuperá `src/components/design-system/SectionShell.tsx` (ya está en el árbol, huérfano) y adaptalo:

- Debe soportar los temas **claro** y **oscuro**, con **transición cromática suave al cruzar el punto** — no corte seco. Es el efecto central de la identidad nueva.
- Debe soportar, además, un **wash de servicio** opcional (los tres de la tabla) para que S5 lo consuma. Solo la capacidad; en este sprint no se usa.
- La paleta crema original muere: los valores son los de este documento.

**Un solo sistema de inversión de tema.** El B0b advierte que `HomeWrapper` tiene su propio mecanismo con hex propios (`#fafafa`/`#000000`) vía `useThemeObserver`. Reportá cuál conservás y por qué, y dejá uno solo vivo en el home. Si desmontás el otro, verificá que no lo consuma nada fuera del home.

Mirá también `ui/InfiniteReviews.tsx:293-298` antes de implementar: según el B0b es el único precedente de fondo interpolado por progreso de scroll que existe en el repo. Puede darte el patrón o mostrarte qué evitar.

🛑 **PARADA 2:** mostrá la API final de `SectionShell` (props, temas, cómo se dispara la transición) y qué decidiste con `HomeWrapper`. Esperá el OK.

### Bloque 3 · `page.tsx` sin `dynamic()`

Reescribí `src/app/page.tsx` con las 8 secciones en el orden y tema de la tabla, cada una envuelta en `SectionShell`.

- **Sin `dynamic()`**: imports estáticos, JS solo en las islas que de verdad lo necesitan. El B0b documenta que las 9 secciones con `dynamic()` son la causa del aterrizaje roto de anclas en carga fría.
- Como contenido de cada sección, montá **los componentes actuales tal cual**: Hero, About, Portfolio, OurServices, PortalDemo, Footer. Van a verse fuera de lugar. Está bien.
- **Ids de ancla:** el B0b reporta `#nosotros` duplicado y `#servicio-3/4` cruzados. Dejá **un id único por sección**. `id="servicios"` está hardcodeado en `TransitionContext` (frozen), Navbar y chatbot: **no lo renombres**.
- Para las secciones que todavía no tienen componente propio (carrusel de palabras, tu panel, por qué develOP), poné un placeholder mínimo: un `SectionShell` con su id, su tema y un título. Nada más.

Verificá que las 5 anclas del home resuelvan en carga fría y en navegación interna.

### Bloque 4 · Verificación y cierre

1. `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3\` — solo, sin encadenar. **EXIT 0 requerido.** El B0b dejó el baseline en cero errores: cualquier error es nuevo y lo arreglás.
2. Lint limpio en los archivos que tocaste.
3. Volcá al final de `docs/rediseno/outputs/S1-CIMIENTO.md`: qué cambiaste archivo por archivo, las decisiones de los bloques 1 y 2, y **qué queda pendiente para los sprints siguientes**.
4. `git status` para confirmar que no se coló nada.

🛑 **PARADA 3:** mostrá (a) salida de `tsc`, (b) lista de archivos modificados y (c) `git status`. Esperá el OK humano.

Con el OK: staging archivo por archivo (nunca `git add .`) → `git commit -m "S1: cimiento de tokens, tipografia y estructura del home"` → `git push`.

**Tu último mensaje debe decir, textual:** "El sprint compila y pasa tsc. La verificación visual la hace el humano en localhost."
