# SITIO-S3 — Chrome, layout y componentes

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-chrome`, rama **`rediseno/chrome`**. Sesión en `C:\v3-chrome\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo: construí todo y frená al final.
- **Corre en paralelo con SITIO-S2 (motion), en otro worktree.** No comparten un solo archivo. Si necesitás algo del sistema de motion, **frená y reportá**.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (con `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Insumos

Valentino te da **`LAYOUT.md`** y **`COMPONENTS.md`** — el sistema de layout medido y el inventario de 44 componentes con sus estados. **Son la especificación de este sprint.**

Ya están en el repo: `src/app/theme-develop.css` (los 89 tokens de develOP), `docs/rediseno/s0/REPORTE-S0.md` y el esqueleto de `/v3`.

---

## Qué construye este sprint

**Todo lo que se mueve con transiciones de CSS, más las primitivas de layout y tipografía.**

Hay una razón por la que esto es un sprint aparte y no parte del de motion: la medición encontró que el sitio de referencia mantiene **dos vocabularios de easing separados a propósito**. Las transiciones de CSS usan `cubic-bezier` propios que **no coinciden con ninguna de las 25 curvas de GSAP**. Unificarlos daría algo uniforme donde el original no lo es.

Ese corte es el que hace que estos dos sprints puedan correr al mismo tiempo.

**Este sprint usa exclusivamente el vocabulario de CSS:**

```css
--ease-principal: cubic-bezier(0.77, 0, 0.175, 1);
--ease-salida:    cubic-bezier(0.64, 0.1, 0, 1);
```

Con las cuatro duraciones: 300 · 400 · 500 · 700 ms. Y un dato que orienta el criterio: **la más frecuente es la más lenta.** La transición es narrativa, no de feedback.

**Nada de este sprint depende del scroll.** Si algo lo necesita, es de S2.

---

## Parte 1 · Las primitivas de layout

⚠️ **El sistema invierte lo que uno esperaría, y está medido.** Reconstruirlo con el patrón habitual —contenedor fijo y padding fluido— produce algo que se parece y no se siente igual.

| | valor |
|---|---|
| Padding lateral | **fijo, 32px** |
| Columnas de grilla | **fluidas** |
| Gaps | **fijos**: 12px compacto, 16px amplio |
| Envoltorio dominante | `max-width: 100%` — **los paneles son a sangre**, 66,2% de los casos |
| Tope global | 1920px |
| Columna lateral | 140px |

Los tokens ya están en `theme-develop.css`. **Construí las primitivas que los consumen** y verificá con comprobación estática que ningún componente del sprint escribe un valor de layout a mano.

**Los breakpoints son tres:** 768 tablet, 860 medio, 1025 escritorio. El de 1025 es el único estructural — concentra el 87,8% de las reglas de media query del sitio medido.

---

## Parte 2 · Tipografía

Los **ocho niveles**, seis de ellos fluidos con `clamp()` en banda 375→1440px, más los tres multiplicadores de interlineado y los cuatro de interletrado. Todo ya está en `theme-develop.css`.

Construí los componentes que los consumen: titulares, cuerpo, caption, micro, y la **etiqueta de sección** — la que en la referencia aparece 29 veces con `text.micro`, `leading.micro` y peso medio.

⚠️ **Chivo tiene el peso 300**, que la familia del sistema original no tenía. Está disponible y se puede usar.

### El pendiente que este sprint destraba

**Nadie miró los ocho niveles renderizados**, ni en la familia original ni en Chivo. Y hay un dato concreto que lo hace urgente: **el cap height de Chivo es 4,72% más chico** (686 contra 720). En los niveles de display, donde el texto suele ir en Title Case, la mayúscula domina el tamaño óptico percibido.

**Construí una ruta que los muestre todos**, con texto real en mayúsculas y minúsculas, para que Valentino cierre esa verificación mirando. Es la §6 de este sprint.

---

## Parte 3 · Los componentes

Del inventario de 44, construí los que el home necesita. Cada uno con sus estados: reposo, hover, **foco visible**, y deshabilitado donde aplique.

### 3.1 El CTA con rollover de dos copias

El componente más usado del sistema — 26 apariciones entre sus dos variantes. **No es un desplazamiento vertical simple.** Medido:

- Dos copias del texto dentro de un `span` con `overflow: hidden` que **crece de 24,5 a 28,5 px**.
- **Copia A sale** rotando **+6°** y trasladándose **(+20, −33,75) px**, con la opacidad a 0.
- **Copia B entra** desde **+10°** y **(−30, +24,75) px**, con `clip-path` de `inset(80% 0 0)` a `inset(0)` y la opacidad a 1.
- En paralelo, un **subrayado de 120×3 px, 0,6s, con 0,4s de retardo**.
- El intercambio completo: **1,3s con `--ease-salida`**.

⚠️ **Y acá arreglamos un defecto de ellos.** Su árbol de accesibilidad devuelve el rótulo duplicado sin espacio: un CTA de 20 caracteres reporta 40 y 5 palabras en vez de 3. **La segunda copia va `aria-hidden`**, con comprobación y control positivo.

**El CTA es siempre tinta, nunca acento.** Es regla cerrada de la paleta de develOP.

### 3.2 La navegación

**No es un header que se encoge: es una pastilla flotante que viaja.** Arranca cerca del pie de la primera pantalla y sube al tope al scrollear. En la referencia va de `top: 816` a `top: 24`, con umbral en 792px.

⚠️ **El umbral 792 es de su hero, no del nuestro.** Va como token derivado de nuestra composición, no copiado. Declaralo y decí de dónde sale.

El desplazamiento es por posición, no por scroll-driven animation: **no depende de S2.**

### 3.3 El cursor

Dos `div` de DOM, no canvas:

| capa | tamaño | radio | filtro | transición |
|---|---|---|---|---|
| núcleo | 4×4 px | 50% | ninguno | `opacity 0.4s --ease-salida` |
| halo | 36×36 px | 50% | `blur(4px)` | `width, height, opacity`, las tres `0.4s --ease-salida` |

Reglas medidas que transfieren:

- **Sobre cualquier control interactivo el cursor propio se apaga** —opacidad 0 en las dos capas— y el nativo toma el relevo.
- **El cursor nativo nunca se oculta.** El propio se dibuja encima, no en su lugar. Es lo que evita el problema de accesibilidad clásico del cursor custom.
- **Interpola hacia el puntero, no está clavado.**
- **Abajo de 1025 no se monta.** No es peso muerto: es montaje condicional, y ya tenés la compuerta de S1.
- El color acompaña **a la sección, no a la página**: sobre panel claro un valor, sobre sección invertida otro. Con la paleta de develOP eso sale del bloque `[data-seccion="invertida"]` que ya existe.

⚠️ **Con `prefers-reduced-motion` no se monta.** La interpolación es movimiento.

### 3.4 El pie

Es el componente más replicado: **la mitad de las instancias de animación del sitio medido son un pie repetido en cada página.** Sus piezas están en el inventario — links con icono, botones sociales, link de contacto, formulario de novedades, título de cierre.

**Construí la estructura y sus estados.** Sin contenido real: los textos y los enlaces vienen después.

### 3.5 El foco visible, en todo

S1 lo dejó acotado a `[data-v3]` porque `--color-foco` es `#111111` y el portal es casi negro — daba 1,0536:1, invisible.

**Todo componente de este sprint lleva `:focus-visible` con el anillo del sistema**, y una comprobación que lo verifique componente por componente, **con control positivo**.

Es la ventaja más barata que hay: la referencia tiene **88 reglas de hover contra 5 de foco**, y ningún indicador visible.

---

## Parte 4 · Lo que NO entra

- ❌ **Nada atado al scroll.** Ni entradas, ni parallax, ni resaltado progresivo. Todo eso es S2.
- ❌ **La escena 3D.** El marcador de posición de S1 se queda como está.
- ❌ **Contenido real**: copy, fotos, videos, métricas, precios. No existen todavía.
- ❌ **Las ocho secciones.** Este sprint hace las piezas, no la página.
- ❌ **GSAP, Lenis, Sanity.**
- ❌ **Instrument Serif.** Tiene una sola aparición en todo el sitio y todavía no se sabe dónde.

## Parte 5 · El pipeline de imagen

Es uno de los tres lugares donde se les gana, y está medido: **su `srcset` usa descriptores de densidad con `sizes` en `null`**, así que de 768 a 1920 el navegador descarga exactamente lo mismo, en las 134 imágenes.

**Construí el componente de imagen del sitio con descriptores de ancho y `sizes` reales**, y una comprobación que rechace un `sizes` ausente. Sin contenido: la pieza, no las fotos.

## Parte 6 · Las rutas de demostración

Dos, las dos con **`noindex`** y anotadas como deuda con fecha de baja:

- **`/v3/tipografia`** — los ocho niveles con texto real, en tres anchos. Es donde Valentino cierra la verificación óptica pendiente.
- **`/v3/componentes`** — cada componente con todos sus estados, incluido el foco por teclado.

⚠️ **No toques `/v3/page.tsx`.** Va a ser del sprint de secciones.

---

## Reglas absolutas

1. **Rama `rediseno/chrome`.** No toques `main`, ni `rediseno/home`, ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **No toques nada del sistema de motion**, que se está construyendo en paralelo: ni `useScroll`, ni `useTransform`, ni ningún módulo de coreografía. Si un componente parece necesitarlo, **frená y reportá**.
3. **No toques `/v3/page.tsx`**, el home actual, `/probe-escena` ni `home-intro/`.
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **No modifiques `theme-develop.css`.** Si falta un token, **frená y reportá**: el sistema se cerró en S0 y un token nuevo es una decisión.
6. **Zonas del otro socio:** `OsLead*`, `OsLeadSetterMeta`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.**
8. **Cero `any`.** **Nunca `router.push` directo.** **Nada de base de datos.**
9. **Cero color, tamaño, radio, duración o curva fuera de los tokens.** Ni un hex, ni un px suelto. Comprobación estática que lo verifique.
10. **No copiar implementación de la referencia:** ni selectores, ni nombres de clase, ni bloques de CSS. Los valores sí, escritos por nosotros. Es la postura transformativa declarada del proyecto.
11. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio. En los últimos seis sprints esa regla encontró siete cosas reales, todas de instrumento.
12. **Regla 11:** toda cifra del reporte tiene que tener un instrumento que la produzca en el repo.
13. **PowerShell:** no hay `&&`, no hay heredoc, rutas con paréntesis entre comillas. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`.
14. **Baseline conocido, no lo arregles:** `TS2307 @googleapis/webmasters`, `react-hooks/set-state-in-effect` en `PreloaderContext`.
15. **No corras el dev server. No auto-confirmás que se ve bien.**
16. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc`, eslint y `npm run build`.
- (b) Todas las comprobaciones, con sus controles positivos declarados uno por uno.
- (c) **El inventario de lo construido**, componente por componente, con sus estados.
- (d) **El rollover del CTA**: los valores aplicados contra los medidos, y la protección de accesibilidad con su control.
- (e) **El cursor**: que no se monta abajo de 1025 ni con `prefers-reduced-motion`, las dos con control.
- (f) **El foco**: la comprobación componente por componente, con su control.
- (g) **El umbral de la navegación**: de dónde sale el número, ya que 792 es de su hero.
- (h) **El peso** que agrega este sprint al bundle inicial de `/v3`, contra los 422,0 KiB gzip que midió S1.
- (i) Archivos y `git status`.
- (j) Qué queda pendiente para el sprint de secciones.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S3: chrome, layout y componentes"` → `git push -u origin rediseno/chrome`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S3-chrome.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Estás en el worktree C:\v3-chrome, rama rediseno/chrome. Corre EN
  PARALELO con el sprint de motion en otro worktree: no compartís archivos.
- Es un sprint LARGO y AUTÓNOMO. Construí todo y frená en la parada final.
  No me consultes en el medio salvo que tengas que tocar un archivo de la
  lista prohibida.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente: usá
  NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- Este sprint usa SOLO el vocabulario de easing de CSS (--ease-principal y
  --ease-salida). Nada atado al scroll: eso es del sprint paralelo. Si un
  componente parece necesitarlo, FRENÁ Y REPORTÁ.
- NO toques /v3/page.tsx, el home, /probe-escena, home-intro/ ni los
  frozen. NO modifiques theme-develop.css: si falta un token, FRENÁ Y
  REPORTÁ.
- El layout invierte lo esperado y está medido: padding lateral FIJO 32px,
  columnas FLUIDAS, gaps FIJOS. Construirlo al revés produce algo que se
  parece y no se siente igual.
- El rollover del CTA duplica el texto: la segunda copia va aria-hidden,
  con control positivo. Es un defecto de la referencia que no heredamos.
- El cursor no se monta abajo de 1025 ni con prefers-reduced-motion, las
  dos con control. Y nunca oculta el cursor nativo.
- Foco visible en TODOS los componentes, verificado uno por uno con
  control positivo. La referencia tiene 88 reglas de hover contra 5 de
  foco: es la ventaja más barata que hay.
- No copiar implementación de la referencia: ni selectores, ni clases, ni
  bloques de CSS. Los valores sí, escritos por nosotros.
- Cero valores fuera de los tokens: ni un hex, ni un px suelto, con
  comprobación que lo verifique.
- Ninguna comprobación queda verde por vacío. Regla 11: toda cifra del
  reporte tiene que tener un instrumento que la produzca.
- Git: commit y push en rediseno/chrome. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add . — archivo por archivo.
- Cero any. Nada de base de datos. Sin dependencias nuevas.
- PowerShell: no hay &&, no hay heredoc. tsc es
  .\node_modules\.bin\tsc.cmd --noEmit
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
