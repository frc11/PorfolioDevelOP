# SITIO-S2 — El sistema de motion

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-motion`, rama **`rediseno/motion`**. Sesión en `C:\v3-motion\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Es un sprint largo y autónomo: construí todo y frená al final.
- **Corre en paralelo con SITIO-S3 (chrome y componentes), en otro worktree.** No comparten un solo archivo. Si necesitás tocar algo de la lista de S3, **frená y reportá**.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (con `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Insumos

Valentino te da **`SCROLL.md`** — la medición de la coreografía del sitio de referencia, patrón por patrón. **Es la especificación de este sprint.**

Ya están en el repo, de S0 y S1: `src/app/theme-develop.css` (los 89 tokens), `docs/rediseno/s0/REPORTE-S0.md`, y el esqueleto de `/v3` con su compuerta de 1025.

---

## Qué construye este sprint

**El sistema de motion completo del sitio v3.** Sin contenido, sin secciones, sin componentes.

La investigación midió 291 instancias de animación en el sitio de referencia y las redujo a **nueve patrones**. Uno solo cubre el 64,6%; dos cubren el 90%; `power1.out` aparece en el 84,5% de los tweens. La conclusión, a la que llegaron la medición y el ojo humano por separado: **la sensación de caro viene de completitud, no de espectáculo.**

Este sprint construye esos nueve patrones como sistema, y una ruta de demostración donde juzgarlos.

---

## Parte 1 · La librería es `motion/react`

**No se usa GSAP, ni ScrollTrigger, ni SplitText, ni Lenis.**

El sitio de referencia los usa y ahí se midieron. La decisión para develOP es otra:

1. **Ya existe un sistema de motion sobre `motion/react`** en este repo, en producción. Sumar GSAP es mantener dos vocabularios.
2. **Los nueve patrones son `scrub`**: atados al scroll y exactamente reversibles. Es literalmente lo que hacen `useScroll` y `useTransform`.
3. **El pinneado no es de GSAP**: es CSS `sticky`, medido, con cero `.pin-spacer` en 18 capturas. Ya está construido en S1.
4. **Lenis está instalada y era global**; S1 la excluyó de `/v3` para que el `sticky` se pudiera juzgar sin JS. **No la vuelvas a meter.**

⚠️ **Nunca importes `framer-motion` directo. Siempre `motion/react`.** Es regla del repo.

### El costo real, y es la Parte 2

Lo que GSAP aporta y hay que reconstruir es **SplitText**. P1 son 142 instancias, el 58% del corpus, y opera **sobre líneas**, no sobre palabras.

---

## Parte 2 · El divisor de líneas

**Partir un bloque de texto en sus líneas visuales**, para animarlas por separado.

- Las líneas dependen del ancho, de la fuente y del tamaño: **hay que medirlas, no calcularlas.**
- **Se rehace en `resize`** y **cuando las fuentes terminan de cargar** (`document.fonts.ready`). Si corre antes, las líneas salen partidas con la fuente del sistema.
- Cada línea va en un contenedor con `overflow: hidden`: el patrón la sube desde abajo y tiene que quedar recortada.

### ⚠️ Accesibilidad — innegociable

Partir texto en `<span>` por línea **rompe los lectores de pantalla**: leen fragmentos sueltos en vez de una frase.

- **El contenedor conserva el texto accesible** (`aria-label` con el original, o una copia visualmente oculta).
- **Las piezas van `aria-hidden`.**
- **Comprobación estática con control positivo**: una versión sin la protección tiene que fallar el check.

La referencia tiene **cinco hallazgos de accesibilidad independientes**, incluido que el foco de teclado no tiene ningún indicador visible. **No le agregamos un sexto.**

### Rendimiento

Medir cajas de línea fuerza layout. **Nunca por cuadro.** Se mide al montar, en `resize` con debounce, y cuando cargan las fuentes. **Reportá cuántas mediciones ocurren en un ciclo de vida típico.**

---

## Parte 3 · Los nueve patrones

Todos **atados al progreso de scroll y exactamente reversibles**: al retroceder se reproducen al revés. Cero callbacks, cero disparos de una sola vez.

| # | qué hace | de → a | duración | escalonado | curva | instancias |
|---|---|---|---|---|---|---|
| **P1** | cada **línea** sube desde una altura de sí misma | `yPercent` 120 → 0 | 1s | 0,2s | `power1.out` | 142 |
| **P2** | el bloque entero sube desde media altura propia | `yPercent` 60 → 0 | 0,5s | 0,1s | `power1.out` | 77 |
| **P3** | resaltado progresivo **palabra por palabra**, sin desplazamiento | `opacity` 0,3 → 1 | 0,5s | 0,2s | `power1.inOut` | 11 |
| **P4** | ítems de lista entran desde 100px reales, muy frenados | `y` 100 → 0 + `opacity` | 2s | — | `power4.out` | 4 |
| **P5** | bloque crece desde el 80%, a velocidad constante | `scale` 0,8 → 1 | — | — | `none` | 3 |
| **P6** | texto cruza en horizontal | `x` 280 → 0 | — | — | `power1.out` | 3 |
| **P7** | planos vienen desde muy atrás hacia adelante | `translateZ` −3000 → +1000 | — | — | `power1.out` | 2 |
| **P8** | 32 piezas llegan volando, girando en tres ejes | rotación 3D | 2s | 0,2s | — | 1 |
| **P9** | 18 piezas crecen desde el 40% mientras aparecen | `scale` 0,4 → 1 | — | — | — | 1 |

**Construí los nueve.** P5 a P9 son pocos usos pero son parte del sistema, y **P7 es el mecanismo con el que van a entrar los proyectos** en la sección de Trabajos.

**Donde `SCROLL.md` tenga un valor y esta tabla otro, gana `SCROLL.md`** y lo reportás.

### Las curvas

`power1.out` es `1 − (1−t)²`. **No la aproximes con un `cubic-bezier`: escribí la función exacta.** `motion/react` acepta funciones de easing y la matemática es de una línea.

Las seis curvas del vocabulario de GSAP van como **constantes tipadas, no como tokens de CSS** — GSAP no lee custom properties y un `--ease-power1-out` sería un token muerto que parece vivo:

```
principal        power1.out        1 − (1−t)²
entrada          power1.in         t²
simetrica        power1.inOut
salida-fuerte    power4.out        1 − (1−t)⁴
lineal           none              t
simetrica-suave  power2.inOut
```

⚠️ **Las curvas de CSS son otro vocabulario y no se mezclan.** `--ease-principal` y `--ease-salida` viven en `theme-develop.css`, son para transiciones de CSS, y **no coinciden con ninguna curva de GSAP**. Está medido y es decisión, no accidente. **Ese vocabulario es de S3 y no lo tocás.**

### ⚠️ Las tres trampas medidas

Están en `SCROLL.md` y **romperían la reconstrucción en silencio**:

1. **El `ease` de un tween con escalonado dice `none` y miente.** En 235 de 278 casos. Si leés el easing de un patrón escalonado directo de la medición, vas a leer "sin easing" y es falso.
2. **La duración declarada no es la aplicada.** Un tween que declara 2s puede correr 8,2s. Si `SCROLL.md` da dos números para lo mismo, **vale el aplicado**.
3. **El plugin de CSS reescribe la propiedad.** `autoAlpha` no es CSS: anima `opacity` **y** conmuta `visibility`. `translateZ` se aplica como `z`. `rotationZ` se aplica como `rotation`. **Hay que reproducir la traducción, no la declaración.**

**La tercera es el trabajo real de no usar GSAP.** Documentá la tabla de traducción completa, con una comprobación por equivalencia.

### Dos modos

En la referencia todo está atado al scroll, así que la duración declarada se distorsiona. Soportá también **entrada en tiempo real** —para una carga, por ejemplo—, donde la duración se aplica tal cual. **Reportá la diferencia entre los dos modos.**

---

## Parte 4 · Reducción de movimiento

**La referencia falla acá**: su scroll suave sigue activo con `prefers-reduced-motion`. Es uno de sus cinco hallazgos.

Con la preferencia activa, **los nueve patrones no se montan**: el contenido aparece en su estado final. No es "más rápido": es que no existe. El divisor de líneas tampoco corre — el texto queda entero.

**Con control positivo**: una comprobación que verifique que sin la preferencia sí se montan.

---

## Parte 5 · La compuerta

S1 dejó la compuerta de **1025px** construida y verificada: estructural, por ancho, con el chunk fuera de la carga inicial.

**Todo este sistema entra por esa compuerta.** Abajo de 1025 no se importa: ni los patrones, ni el divisor, ni el motor de progreso. Es exactamente el motivo por el que la compuerta se construyó antes que la coreografía.

- **Reusá el mecanismo de S1**, no construyas otro.
- **Verificá sobre la salida del build** que el chunk de motion no está en la carga inicial de `/v3`, con el mismo patrón de marca y su control positivo.
- **Reportá el peso** del chunk, en crudo y en gzip.
- Abajo de 1025 lo único que sobrevive es el `sticky` de S1, que es CSS y cruza gratis.

---

## Parte 6 · La ruta de demostración

**`/v3/motion`** — donde Valentino va a juzgar los nueve patrones por grabación.

- Un bloque por patrón, con su nombre visible y texto de relleno neutro.
- Suficiente alto de scroll para que cada uno se lea completo, ida y vuelta.
- **P1 con bloques de una, tres y seis líneas** — es el rango medido en la referencia.
- **Controles para variar duración, escalonado y curva sin recompilar.** La calibración final la hace el ojo, y sin perillas no se puede calibrar.
- **`noindex`**, y anotada como deuda con fecha de baja: se borra cuando el sitio esté armado.

⚠️ **No toques `/v3/page.tsx`, ni `secciones.ts`, ni `superficies.ts`.**

---

## Reglas absolutas

1. **Rama `rediseno/motion`.** No toques `main`, ni `rediseno/home`, ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **No toques nada de la lista de S3:** `/v3/page.tsx`, `secciones.ts`, `superficies.ts`, `Panel.tsx`, `PanelPinneado.tsx`, `EscenarioCompuerta.tsx`, `EscenarioDePrueba.tsx`, el `layout.tsx` de `/v3`, ni `theme-develop.css`. Si necesitás uno, **frená y reportá**.
3. **No toques el home actual, `/probe-escena` ni `home-intro/`.**
4. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
5. **Zonas del otro socio:** `OsLead*`, `OsLeadSetterMeta`, `ActivityChannel`, `/setter`, `/leados/`. No se tocan.
6. **No sumar dependencias.** Ni GSAP, ni ScrollTrigger, ni SplitText, ni Lenis. `motion/react` ya está.
7. **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.**
8. **Cero color, tamaño o duración fuera de los tokens.** Ni un hex, ni un px suelto.
9. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio. En los últimos seis sprints de este proyecto esa regla encontró siete cosas reales, todas de instrumento y ninguna de código.
10. **Regla 11:** toda cifra del reporte tiene que tener un instrumento que la produzca en el repo.
11. **Al mover código compartido entre módulos:** diff de la salida completa antes y después, no comparación de conteos.
12. **PowerShell:** no hay `&&`, no hay heredoc, rutas con paréntesis entre comillas. `tsc` es `.\node_modules\.bin\tsc.cmd --noEmit`, nunca `npx tsc`.
13. **Baseline conocido, no lo arregles:** `TS2307 @googleapis/webmasters`, `react-hooks/set-state-in-effect` en `PreloaderContext`.
14. **No corras el dev server. No auto-confirmás que se ve bien.**
15. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc`, eslint y `npm run build`.
- (b) Todas las comprobaciones, con sus controles positivos declarados uno por uno.
- (c) **La tabla de traducción** de las claves de GSAP a propiedades reales, con la comprobación de cada equivalencia.
- (d) **Las tres trampas**: qué hiciste con cada una y cómo lo verificaste.
- (e) **El divisor de líneas**: cómo mide, cuándo se rehace, cuántas mediciones por ciclo de vida, y la protección de accesibilidad con su control.
- (f) **La compuerta**: peso del chunk de motion, y que no está en la carga inicial, con su control.
- (g) `prefers-reduced-motion`, con su control.
- (h) Archivos y `git status`.
- (i) Qué queda pendiente para el sprint de secciones.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S2: sistema de motion"` → `git push -u origin rediseno/motion`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S2-motion.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Estás en el worktree C:\v3-motion, rama rediseno/motion. Corre EN
  PARALELO con otro sprint en otro worktree: no compartís archivos.
- Es un sprint LARGO y AUTÓNOMO. Construí todo y frená en la parada final.
  No me consultes en el medio salvo que tengas que tocar un archivo de la
  lista prohibida.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente: usá
  NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- motion/react, NUNCA framer-motion directo. NO sumes GSAP, ScrollTrigger,
  SplitText ni Lenis. Ninguna dependencia nueva.
- NO toques /v3/page.tsx, secciones.ts, superficies.ts, Panel.tsx,
  PanelPinneado.tsx, EscenarioCompuerta.tsx, EscenarioDePrueba.tsx, el
  layout.tsx de /v3 ni theme-develop.css: son del sprint paralelo. Tampoco
  el home, /probe-escena, home-intro/ ni los frozen.
- Las curvas de CSS (--ease-principal, --ease-salida) son OTRO vocabulario
  y no se mezclan con las de GSAP. Está medido y es decisión.
- power1.out se escribe con su fórmula exacta, no con un cubic-bezier
  aproximado.
- Partir texto en líneas rompe lectores de pantalla: el contenedor conserva
  el texto accesible y las piezas van aria-hidden, CON control positivo. La
  referencia tiene cinco hallazgos de accesibilidad y no le agregamos uno.
- Medir cajas de línea fuerza layout: nunca por cuadro.
- Todo el sistema entra por la compuerta de 1025 que ya existe. Reusá su
  mecanismo, no construyas otro, y verificá sobre la SALIDA DEL BUILD con
  control positivo.
- Ninguna comprobación queda verde por vacío. Regla 11: toda cifra del
  reporte tiene que tener un instrumento que la produzca.
- Git: commit y push en rediseno/motion. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add . — archivo por archivo.
- Cero any. Cero setState por frame. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc. tsc es
  .\node_modules\.bin\tsc.cmd --noEmit
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
