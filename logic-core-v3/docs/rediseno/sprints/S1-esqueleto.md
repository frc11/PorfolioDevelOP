# S1 — El esqueleto

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-cimientos`, rama **`rediseno/cimientos`**. Sesión abierta en `C:\v3-cimientos\logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Insumos

Valentino te va a dar tres archivos del sprint S0, que corrió aparte:

- **`theme-develop.css`** — el sistema de diseño de develOP, 89 tokens, ya compilado y verificado contra Tailwind 4.3.1.
- **`REPORTE-S0.md`** — las tres mediciones y sus decisiones.
- **Los binarios de Chivo y Chivo Mono** — los mismos de los que salieron las métricas.

**Esos archivos son entrada, no propuesta.** No se rediscuten sus valores.

---

## Qué construye este sprint

**El esqueleto del sitio v3. Sin contenido, sin animación, sin 3D.**

El hallazgo estructural de la investigación de Franco es que la referencia **no es una pila de secciones con fondo: es un canvas permanente a viewport completo con paneles de DOM deslizándose encima.** Eso explica de una sola vez cinco mediciones que no cerraban, y tiene una consecuencia que vale más que la explicación: **la capa 3D se enchufa y se desenchufa sin tocar el resto.**

Este sprint construye ese esqueleto y nada más.

⚠️ **El canvas de este sprint es un marcador de posición, no la escena.** La escena 3D real existe, tiene catorce sprints y vive en otro worktree. Acá se construye el hueco donde va a entrar, y se demuestra que funciona. **No la importes, no la busques, no la referencies.**

---

## Parte 1 · La ruta

**El home nuevo vive en `/v3`. El home actual no se toca.**

Es la misma disciplina con la que se construyó la escena en `/probe-escena`: catorce sprints sin tocar el sitio vivo ni una vez. Y acá tiene una razón extra — esta rama va a recibir merges de `main` durante semanas, y tocar los mismos archivos que el otro socio produce conflictos caros.

El reemplazo del home es un sprint chico al final, y es reversible.

---

## Parte 2 · Los tokens y las fuentes

### `theme-develop.css` entra al proyecto

Al bloque `@theme` de `globals.css`. **Conservá los comentarios de cabecera y los de cada token**: dicen de dónde salió cada valor, con qué etiqueta de evidencia, y qué queda pendiente. Es lo que permite que una decisión futura entre como un cambio de archivo y no como una arqueología.

⚠️ **`@theme`, nunca `@theme inline`.** S0 verificó que con `inline` el override contextual del acento **no funciona**: el valor queda incrustado en la utilidad y redefinir la custom property no la retiñe. Es el mecanismo del que depende "un acento por contexto".

### Las fuentes

**Chivo y Chivo Mono, auto-hospedadas con `next/font/local`**, usando **los binarios exactos de S0**. No `next/font/google`.

La razón es de trazabilidad: las métricas del sistema —x-height 511, cap height 686, factor 0,998 contra Instrument Sans— se midieron sobre esos archivos. Si el proyecto sirve otros binarios, el sistema descansa sobre una medición que no corresponde a lo que el usuario descarga.

- **Variables**, con su eje `wght`. Chivo llega al peso 300, que el sistema de Franco no tenía.
- Declaradas como custom properties para que Tailwind las consuma por token.
- **Instrument Serif no entra en este sprint.** Tiene una sola aparición en todo el sitio y todavía no se sabe dónde.

### El foco, desde el primer componente

`--color-foco` existe y vale `var(--color-tinta)`, así que **se da vuelta solo** en las secciones invertidas.

Emitilo como regla global de `:focus-visible` **ahora**, no cuando haya componentes. La referencia tiene 88 reglas de hover contra 5 de foco y ningún indicador visible; es la ventaja más barata que hay disponible y solo es barata si se construye desde el principio.

---

## Parte 3 · El esqueleto de canvas y paneles

### La estructura

```
<Escenario>              ← canvas a viewport completo, fijo, z bajo
<Paneles>                ← el flujo del documento, encima
  <Panel superficie="…">  × 8
```

Las ocho secciones, en orden:

1. Hero · 2. Quiénes somos · 3. Números · 4. Trabajos · 5. Servicios · 6. Tu panel · 7. Por qué develOP · 8. Cierre

**Sin contenido.** Cada panel es un bloque con su altura declarada, su nombre visible como texto plano para poder identificarlo, y nada más.

### La superficie es un dato, no una arquitectura ⚠️

Acá hay una decisión de dirección que **nadie tomó todavía y este sprint no toma**.

En la referencia, los paneles claros son opacos y los oscuros son transparentes: se ve el canvas oscuro a través de ellos. **develOP invierte el tema por defecto** —papel claro, sección oscura como excepción— y su escena es **una sala clara**. Esa relación se da vuelta y hay que diseñarla, no asumirla.

**La solución del esqueleto es no decidir:** cada panel declara su superficie como propiedad, y el sistema soporta las tres.

| valor | qué hace |
|---|---|
| `papel-opaco` | fondo papel sólido; el canvas no se ve |
| `papel-transparente` | el canvas se ve; el contenido flota en la sala |
| `oscuro-opaco` | sección invertida sólida; el canvas no se ve |

**Todas arrancan en `papel-opaco`.** Cambiar el recorrido de superficies pasa a ser editar ocho valores, no reescribir el esqueleto. Es lo que hace que la decisión estética sea barata y reversible.

**Reportá el contraste** de la tinta sobre el canvas de prueba en el modo transparente. Si un panel transparente no puede sostener texto legible, eso condiciona la decisión y hay que saberlo con el número.

### El pinneado es CSS `sticky`, no JS

Está medido: 33 de 36 separaciones en 0px, cero `.pin-spacer`, y el ritmo vive en el pinneado. Y hay una consecuencia práctica grande — **el `sticky` sobrevive abajo de la compuerta**, porque no depende de JavaScript. Es lo que hace que mobile conserve el ritmo gratis.

**Construí una sección pinneada de demostración** —Servicios, que en la referencia es la más coreografiada— y verificá que el mecanismo funciona sin una línea de JS.

### El layout invierte lo que uno esperaría

De la medición, y es contraintuitivo:

- **Padding lateral fijo: 32px.** No fluido.
- **Columnas de grilla fluidas.**
- **Gaps fijos:** 12px compacto, 16px amplio.
- `max-width: 100%` domina con 66,2% — **los paneles son a sangre.**
- Tope global 1920px, columna lateral 140px.

Los tokens ya están en `theme-develop.css`. **Construir esto con el patrón habitual —padding fluido y columnas fijas— da algo que se parece y no se siente igual.**

---

## Parte 4 · La compuerta de 1025

**Es estructural, no cosmética.** No es una clase de CSS que esconde: **el bundle no se importa abajo del umbral.**

- **Por ancho, no por táctil.** Está medido: la compuerta responde al ancho del viewport.
- **1025px exactos**, medido y no interpolado.
- Abajo del umbral: sin canvas, sin coreografía. **El `sticky` sí cruza.**

### La verificación, que es la mitad del sprint

**Un chunk que no se descarga no se prueba mirando la página.** Se prueba sobre la salida del build.

- **Comprobación estática:** el chunk del escenario **no está** entre los que pide la carga inicial.
- **Control positivo obligatorio:** una versión con el import estático **sí** lo mete, y la comprobación lo detecta. Sin eso, el check pasa en verde aunque el escenario no exista todavía — que es exactamente el caso hoy, porque es un marcador de posición.
- **Sin salto de layout** al cruzar el umbral en cualquiera de los dos sentidos.
- **SSR:** el ancho no existe en el servidor. El escenario es cliente puro y **no puede causar hidratación distinta del HTML servido.**

### Presupuesto, abajo de 1025

`LCP < 2,5s` · `JS < 300 KB` · Lighthouse ≥ 80. Arriba del umbral el presupuesto no aplica, por decisión.

**Reportá el peso del bundle inicial arriba y abajo del umbral.**

---

## Lo que NO entra

- ❌ **Ninguna animación.** Ni entrada, ni scroll, ni hover. La coreografía es otro lane y **la compuerta tiene que existir antes**: si queda para el final, el peso ya se coló en el bundle base.
- ❌ **La escena 3D.** Marcador de posición.
- ❌ **Contenido, copy, imágenes, video.**
- ❌ **GSAP, Lenis, Sanity.** Ninguna decidida.
- ❌ **Instrument Serif.**
- ❌ **Tocar el home actual, `/probe-escena` o `home-intro/`.**

## Reglas absolutas

1. **Rama `rediseno/cimientos`.** No toques `main`, ni `rediseno/home`, ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **Zonas del otro socio — no se tocan:** `OsLead*`, `OsLeadSetterMeta`, `ActivityChannel`, `/setter`, `/leados/`.
4. **Cero `any`.** **Nunca `router.push` directo.** **Nada de base de datos ni migraciones.**
5. **No sumar dependencias.**
6. **Cero color fuera de los tokens.** Ni un hex suelto.
7. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio. En los últimos cinco sprints de este proyecto esa regla encontró cuatro cosas reales.
8. **Regla 11:** toda cifra del reporte tiene que tener un instrumento que la produzca en el repo.
9. **PowerShell:** no hay `&&`, no hay heredoc, rutas con paréntesis entre comillas. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3/`, nunca `npx tsc`.
10. **Errores de baseline conocidos, no los arregles:** `TS2307 @googleapis/webmasters`, y `react-hooks/set-state-in-effect` en `PreloaderContext`.
11. **No corras el dev server ni verifiques en pantalla. No auto-confirmás que se ve bien.**
12. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de construir:

- (a) La estructura de archivos que proponés, con qué hace cada uno.
- (b) **Cómo implementás la compuerta**, y cómo la verificás sobre la salida del build. Con su control positivo.
- (c) Cómo evitás el salto de layout y la discrepancia de hidratación.
- (d) Qué es el canvas de prueba, y por qué es suficiente para demostrar el mecanismo sin ser la escena.
- (e) Los tres modos de superficie, y el contraste de la tinta sobre el canvas de prueba en el transparente.
- (f) Cómo entran las fuentes y cómo verificás que se sirven los binarios de S0 y no otros.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) los tres gates, (b) todas las comprobaciones con sus controles positivos, (c) **el peso del bundle inicial arriba y abajo de 1025**, (d) que el chunk del escenario no está en la carga inicial, con su control, (e) archivos y `git status`, (f) qué quedó pendiente para el lane de motion. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S1: esqueleto de canvas y paneles, compuerta y tokens"` → `git push -u origin rediseno/cimientos`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S1-esqueleto.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Estás en el worktree C:\v3-cimientos, rama rediseno/cimientos. NO toques
  main, ni rediseno/home, ni otros worktrees.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente: usá
  NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- El home nuevo vive en /v3. NO toques el home actual, ni /probe-escena,
  ni home-intro/, ni ningún archivo frozen.
- Este sprint NO lleva animación, NI la escena 3D, NI contenido, NI GSAP,
  NI Lenis, NI Sanity. El canvas es un marcador de posición.
- theme-develop.css entra como @theme, NUNCA @theme inline: con inline el
  override contextual del acento no funciona, y está verificado.
- La compuerta de 1025 es estructural: el bundle no se importa abajo del
  umbral. Se verifica sobre la SALIDA DEL BUILD, no mirando la página, y
  con control positivo — una versión con import estático tiene que hacer
  fallar la comprobación. Sin eso el check pasa en verde aunque el
  escenario no exista.
- Las tres superficies de panel son un DATO por sección, no una
  arquitectura. Todas arrancan en papel-opaco. La decisión estética es de
  Valentino y este sprint no la toma.
- Cero color fuera de los tokens. Cero any. Sin dependencias nuevas.
- Ninguna comprobación queda verde por vacío: control positivo
  obligatorio. Regla 11: toda cifra del reporte tiene que tener un
  instrumento que la produzca.
- Git: commit y push en rediseno/cimientos. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios. Nunca git add . —
  archivo por archivo.
- PowerShell: no hay &&, no hay heredoc, rutas con paréntesis entre
  comillas. tsc es .\node_modules\.bin\tsc.cmd --noEmit
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
