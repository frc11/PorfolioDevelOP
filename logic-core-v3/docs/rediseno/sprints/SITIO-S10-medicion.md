# SITIO-S10 — Lo que nadie miró

Mobile · accesibilidad · la composición del logo · la deuda

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **Antes de cada build**, el chequeo de cinco segundos de §6.1:

```powershell
$os = Get-CimInstance Win32_OperatingSystem
"node: $((Get-Process node -ErrorAction SilentlyContinue).Count) | comprometida: $([math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory)/1MB,1)) / $([math]::Round($os.TotalVirtualMemorySize/1MB,1)) GB"
```

Con `node` en 0 y comprometida abajo de 50, el build cierra a la primera con `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=4096`.

---

## Qué es este sprint

**Todo lo que se construyó se midió en un solo escenario: 1440×810, con mouse, con la escena puesta.** Este sprint mira las tres cosas que quedaron afuera, más la deuda.

Es un sprint de **medición**, no de dirección. Tres de los cuatro frentes terminan en números y opciones; **las decisiones estéticas son del humano.**

---

# FASE 0 — El contrato (el agente principal, sin subagentes)

## 0.1 Leer

`DIRECCION-ESCENA.md` entero, con foco en §7 completo — es donde está la deuda. `_lib/anclaje.ts`, `_lib/secciones.ts`, `_lib/escena/`, `_componentes/`, y los agregados de S1 a S9.

## 0.2 Escribir los instrumentos compartidos

Los cuatro frentes miden sobre el mismo marcado renderizado, en varios anchos. **Escribí vos el banco compartido**, antes de despachar:

- **Renderizar el home completo** a un ancho dado, en las dos ramas —con coreografía y sin ella— y devolver el marcado.
- **Los anchos de referencia**: **375** (el piso de la banda fluida), **390** (el iPhone que la investigación midió), **768** (tablet), **1024** (justo abajo del umbral) y **1025** (justo arriba).
- **Extraer del marcado**: cajas de texto, encabezados, elementos enfocables, y el orden del documento.

⚠️ **Es cálculo estático, no un navegador.** Toda cifra que salga de acá es un modelo y **tiene que declararse como tal**. Un `<img>` sin dimensiones o un `svh` que no se puede resolver son huecos, no ceros.

## 0.3 Reglas para todo subagente

1. **Escribís SOLO en tu carpeta.** Si necesitás algo de afuera, **reportalo.**
2. **No modificás el banco compartido, ni `secciones.ts`, ni `anclaje.ts`, ni `package.json`, ni `theme-develop.css`.**
3. **Tres de los cuatro frentes MIDEN y REPORTAN. No arreglan composición.** El único que cambia código de producto es D.
4. **Tu invariante propio, con controles positivos.**
5. **Reportás en formato fijo**: qué mediste, qué encontraste, qué opciones hay, y qué te hizo frenar.

---

# FASE 1 — Los cuatro frentes

---

## Subagente A · Mobile — el sitio que nadie vio

**Abajo de 1025 no hay escena ni coreografía.** Está decidido, medido y es correcto: la referencia manda 291 instancias arriba del umbral y 1 abajo, y encima nosotros tampoco mandamos la escena.

**Pero eso significa que abajo de 1025 hay un segundo sitio, y nadie lo miró nunca.** Todo lo que se construyó se juzgó a 1440.

### Qué medir, sección por sección, a 375 · 390 · 768

- **Que cada sección entre**, o que crezca sin romperse. `secciones.ts` declara altos en `svh` y abajo del umbral el contenido puede no caber.
- **Números es la de mayor riesgo.** Su composición es **dispersa y asimétrica a propósito** —cinco cifras en cinco tamaños, sin grilla— y eso es exactamente lo que se rompe primero cuando el ancho se achica. **Reportá qué le pasa a la dispersión.**
- **Trabajos se despinnea abajo del umbral** por decisión de S5: los tres proyectos toman una pantalla cada uno. Verificá que los 300svh se llenen y no queden dos pantallas de banda oscura vacía.
- **Servicios pierde su secuencia** —tres bloques hermanos, uno por servicio— y tiene que seguir teniendo sentido. Está afirmado; verificalo sobre el home compuesto, no sobre la sección aislada.
- **El pie**: siete anclas, tres columnas que se apilan. S8 midió que la columna del recorrido pasó a ser la más alta.
- **La pastilla de navegación**: su umbral se compone de `100svh − 96px`. **A 667px de alto eso es otra cosa que a 900.** Reportá dónde nace y dónde queda.
- **La escala tipográfica**: 375 es el piso de la banda fluida, así que ahí los seis niveles llegan a su valor mínimo. **Reportá los ocho tamaños resueltos a 375** y si alguno queda ilegible.

### El presupuesto, que hoy no se cumple

`LCP < 2,5s` · `JS < 300 KB` · `Lighthouse ≥ 80`. **Medido: 377,5 KiB gzip abajo del umbral.**

S9 ya cerró que el piso del framework son 248,3 y que Sentry no se puede diferir. **Reportá qué queda entre el piso y los 377,5**, archivo por archivo, y **si algo de eso no debería estar abajo de 1025.**

⚠️ `LCP` y `Lighthouse` **no se pueden medir sin navegador**. Declaralos como huecos, no los estimes.

## Subagente B · Accesibilidad — la ventaja que venimos declarando

La referencia tiene **cinco hallazgos independientes**, incluido que el foco de teclado no tiene ningún indicador visible. Este proyecto viene diciendo que ahí les gana. **Nunca se verificó sobre el home compuesto.**

Cada componente verificó lo suyo. **Nadie recorrió las ocho secciones juntas.**

### Qué medir

- **El orden de tabulación completo**, sección por sección. ⚠️ **La pastilla de navegación está al principio del documento y visualmente cerca del pie de la primera pantalla.** Un usuario de teclado la va a encontrar primero y no la va a ver. **Es un defecto real y hay que medirlo.**
- **La jerarquía de encabezados.** Ocho secciones, cada una escrita por un subagente distinto. **Reportá el árbol entero** y si hay saltos de nivel.
- **Los landmarks.** ¿Hay `<main>`? La referencia no lo tiene en cinco de seis URLs. Si nosotros tampoco, es el mismo defecto heredado.
- **El divisor de líneas sobre el home compuesto.** Cada titular partido lleva una copia accesible y las piezas van `aria-hidden`. Verificado por componente; **verificalo sobre las ocho juntas.**
- **El CTA con su segunda copia `aria-hidden`**, ídem.
- **⚠️ Los marcadores de contenido.** Hay 43 en pantalla —`[CIFRA]`, `[MÉTRICA]`, `[VIDEO]`— y **un lector de pantalla los va a leer en voz alta.** Reportá cómo suena el recorrido completo. No los arregles: es contenido provisional y su forma es deliberada.
- **`prefers-reduced-motion` sobre el home entero**, no por sección.
- **El foco visible**, elemento por elemento, en las dos ramas.
- **Contraste de texto** en las ocho, incluidas las secciones opacas que nadie midió — solo se midieron las dos transparentes.

**Reportá el inventario completo de hallazgos, con su gravedad.** No arregles nada: quiero verlo entero antes de decidir qué se toca.

## Subagente C · La composición del logo contra el texto

⚠️ **Esto salió de mirar el sitio, y es lo único visualmente mal que se ve hoy.**

En las dos secciones transparentes el logo compite con el texto:

- **En el Hero**, el logo entra por la derecha y **queda cortado por el borde del cuadro.** La pose tiene `target frameX 0,68`, que lo empuja a la derecha.
- **En el diferencial**, el logo es **una masa negra grande entrando por arriba a la derecha, encima del titular.** La pose `demos` es "la más íntima" del recorrido: cámara cerca, logo llenando el cuadro.

**No arregles nada. Medí y proponé.**

### Qué medir, en los cinco anchos

- **Qué fracción del logo queda dentro del cuadro** en cada una de las dos secciones, a lo largo de su ventana de progreso.
- **Cuánto se superpone el logo con las cajas de texto**, en porcentaje del área de cada bloque.
- **El contraste del texto donde se superpone con el logo.** El logo es tinta casi negra: **texto oscuro sobre logo oscuro es ilegible**, y las mediciones de contraste de S9 se hicieron contra el fondo, no contra el logo.
- **Si el recorte del logo es intencional o accidental.** Un logo cortado por el borde puede ser una decisión de encuadre; uno cortado a la mitad, no. **Reportá la fracción y dejá que la decisión la tome el humano.**

### Las palancas, sin usarlas

Enumerá qué se podría mover y qué costaría cada una: el `target` de la pose, la distancia, el ancho de la columna de texto, o dónde cae la sección en el progreso. **Con el número de cada una.** Ninguna se aplica en este sprint.

## Subagente D · La deuda

El único frente que cambia código. Cinco cosas que §7 tiene anotadas:

1. **`s7e` y `s10e` no tienen un solo control positivo** — 10 invariantes, 152 afirmaciones. **Escribiles controles.** ⚠️ Si al escribirlos alguno **falla**, es un hallazgo real: **reportalo aparte, no lo arregles.**
2. **`presupuesto.ts` identifica el chunk de Sentry por su nombre** (`'7149'`). Un renumerado de webpack convierte la cifra publicada en el total entero, sin rojo. **Identificalo por contenido**, con la huella que ya se usa en otro lado.
3. **El acoplamiento de tipo hacia `/probe-escena`** — §7.26, con el plan ya escrito. Resolvelo o declaralo con su razón.
4. **Dos archivos en 300 líneas exactas**, con cero margen: `s8-escena.invariant.ts` en 299 y `s8-montaje.invariant.ts` en 300. **El próximo que les agregue una línea los pone en rojo.** Partilos con costura real.
5. **El orden entre los dos `rAF`** —el del documento y el interno de r3f— se dedujo leyendo, no se midió, y de ahí sale que la reanudación cueste 2 cuadros y no 1. **Medilo si se puede sin navegador; si no, declaralo mejor.**

---

# FASE 2 — Integración (el agente principal)

1. **`npm run verificar` en cero** y el build cerrado.
2. **El inventario completo de hallazgos**, de los tres frentes de medición, **ordenado por gravedad y no por frente.** Es lo que voy a leer primero.
3. **Separá lo que es defecto de lo que es decisión.** Un encabezado saltado es un defecto; un logo cortado puede ser un encuadre. **No los mezcles.**
4. **Lo que se puede arreglar sin decidir nada** —un `<main>` que falta, un orden de tabulación— listado aparte, **con lo que costaría.** No lo arregles.
5. **Actualizá `DIRECCION-ESCENA.md`** con lo que este sprint cierra y lo que abre.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** No toques `main` ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **Solo el frente D cambia código de producto.** A, B y C miden y reportan. Si uno de ellos quiere arreglar algo, **frená y reportá**.
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques el home actual, `/probe-escena`, `home-intro/`, `src/app/layout.tsx` ni `instrumentation-client.ts`.**
5. **No cambies ni un valor de la escena, del preloader, de las secciones ni del anclaje.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja para que pase.**
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **Toda cifra que salga de cálculo estático se declara como tal.** No hay navegador: un modelo no es una medición y confundirlos es el modo de falla que este repo lleva diez sprints cazando.
11. **Regla 11:** toda cifra con su instrumento. **12:** frontera declara ventana. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
12. **PowerShell:** no hay `&&`, no hay heredoc.
13. **No corras el dev server. No auto-confirmás que se ve bien.**
14. Archivos de más de 300 líneas se parten. Los seis heredados de la mudanza, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` y `npm run build`.
- (b) **El inventario de hallazgos ordenado por gravedad**, con defectos y decisiones separados.
- (c) **Mobile**: las ocho secciones a 375, 390 y 768, con lo que se rompe. Y el reparto de los 377,5 KiB gzip contra el piso.
- (d) **Accesibilidad**: el orden de tabulación completo, el árbol de encabezados, los landmarks, y el inventario con su gravedad.
- (e) **El logo**: fracción dentro del cuadro, superposición con el texto, contraste donde se superponen, y las palancas con su número.
- (f) **La deuda**: las cinco, y si al escribir controles positivos apareció algo.
- (g) **Lo que se puede arreglar sin decidir nada**, con su costo.
- (h) **TODO LO QUE FRENÓ.**
- (i) Archivos y `git status`.
- (j) Qué queda abierto.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S10: mobile, accesibilidad, composicion y deuda"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S10-medicion.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Sprint LARGO y AUTÓNOMO en
  TRES FASES: la fase 0 la hacés vos solo —el banco de medición compartido—
  y nada se despacha hasta que esté; la fase 1 son cuatro subagentes; la
  fase 2 la integrás vos.
- Es un sprint de MEDICIÓN. Tres de los cuatro frentes miden y reportan y
  NO arreglan nada: si uno quiere arreglar algo, FRENÁ Y REPORTÁ. El único
  que cambia código de producto es el frente D.
- NO corras el dev server, NO tomes capturas, NO abras navegador. Antes de
  cada build, el chequeo de node.exe y memoria comprometida de §6.1.
- NO toques el home actual, /probe-escena, home-intro/, src/app/layout.tsx,
  instrumentation-client.ts ni los frozen. NO cambies un valor de la
  escena, del preloader, de las secciones ni del anclaje.
- TODA cifra que salga de cálculo estático se declara como tal. No hay
  navegador: un modelo no es una medición, y confundirlos es el modo de
  falla que este repo lleva diez sprints cazando. LCP y Lighthouse son
  huecos, no se estiman.
- El logo cortado en las dos secciones transparentes se MIDE, no se
  arregla: fracción dentro del cuadro, superposición con el texto, y
  contraste del texto DONDE SE SUPERPONE CON EL LOGO — que es tinta casi
  negra, y las mediciones anteriores se hicieron contra el fondo.
- Los 43 marcadores de contenido los lee un lector de pantalla en voz alta:
  reportá cómo suena, no los arregles. Su forma es deliberada.
- Si al escribir los controles positivos que le faltan a s7e y s10e alguno
  FALLA, es un hallazgo real: reportalo aparte, no lo arregles.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.
- EN EL REPORTE, lo que más me importa es el inventario de hallazgos
  ORDENADO POR GRAVEDAD y con los defectos separados de las decisiones.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
