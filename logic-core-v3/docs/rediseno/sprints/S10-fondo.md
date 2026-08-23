# S10 — Vaciar la escena, fondo de rendijas, sol visible

## Cómo correr esta instrucción

- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build`.

## Lecturas obligatorias

1. `docs/rediseno/outputs/S9-COREOGRAFIA.md` y `docs/rediseno/DIRECCION-ESCENA.md`.
2. `docs/rediseno/outputs/S7-*.md` — el moiré con `map` + `alphaMap`, el análisis de aliasing y el arco del sol.
3. `src/app/probe-escena/_components/` — el módulo entero.
4. **El vocabulario visual de develOP en el sitio actual.** Buscá en el repo los componentes de fondo del home vigente (retículas, campos de puntos, tramas). Son la fuente del revestimiento: **leelos antes de inventar nada.**

---

## El diagnóstico

El dueño del proyecto grabó el recorrido definitivo de S9. El movimiento funciona. La escena, no.

**Los planos suspendidos se van.** No significan nada: son rectángulos negros en ángulos arbitrarios que se leen como descarte, no como arquitectura. En el tramo de Números uno de ellos ocupa media pantalla. Fuera.

**El sol es invisible.** Tu medición de 33,4% es correcta: el sol está en cuadro. No se ve porque es un disco luminoso sobre un fondo casi blanco, y no tiene contra qué recortarse. Es un problema de contraste, no de geometría.

**El fondo es una pared gris plana.** El moiré de S7 existe pero es un detalle en un rincón. Tiene que pasar a ser el elemento principal de la escena.

La escena queda con **cinco cosas y nada más**: el piso, el fondo de rendijas, el sol, las partículas y el logo. Y tiene que estar llena.

---

## Parte 1 · Vaciar

Se eliminan:

- **Los planos suspendidos** (`probeArchitecture.ts` y lo que los consuma).
- **La retícula aérea** y **los pilares** — mismo argumento: geometría sin significado.
- **Los fragmentos del logo** (`LogoFragments.tsx`) — piezas sueltas que tampoco significan nada hoy.

Se conserva:

- **El piso** y **las marcas de replanteo**. Son planas, dan escala, y son lo único que ancla el logo al suelo.
- El logo, su sombra, y el sistema de luces.

**Consecuencias que tenés que medir y reportar**, porque este sprint invalida varias cifras de S9:

1. **La oclusión del logo pasa a 0% en todo el recorrido.** S9 publicó 9,8% de progreso con el entorno cruzando por delante, en cinco ventanas. Ese número muere. Actualizá las comprobaciones que lo publican.
2. **Las distancias de cámara quedan libres.** El anillo de planos le ponía techo a la cámara en 13–15 de distancia fuera de la cuña frontal, y ese fue el argumento para descartar el recorrido de 720°. Recalculá cuál es el techo real ahora y dejalo escrito: si desapareció, la decisión de 360° pasa a ser revisable y quiero saberlo.
3. **El corredor libre del Star Wars** deja de ser exclusivo de Trabajos y Números. Recalculalo con `occlusion.ts` y actualizá la nota de §7.1.
4. **El balance de negro.** Los planos eran la única masa oscura de la escena. Reportá qué fracción del cuadro queda en tinta en cada pose ahora, y decí explícitamente si la escena queda lavada. **Si queda lavada, el que tiene que resolverlo es el fondo de rendijas, no un plano nuevo.**
5. **La visibilidad del sol.** Los planos podían estar tapándolo. Recalculá.

---

## Parte 2 · El fondo de rendijas

Es el corazón del sprint.

### La especificación

**Dos tramas de cuadrados, superpuestas, con la de atrás desplazándose hacia abajo indefinidamente.**

- **Trama fina, fija:** cuadrados chicos — cuatro por cada cuadrado de la trama gruesa (subdivisión 2×2).
- **Trama gruesa, en movimiento:** cuadrados grandes, bajando de forma continua y sin fin.

### ⚠️ El punto crítico: 2:1 exacto NO produce moiré

Con la trama fina al doble exacto de la gruesa, el batido cae en el mismo período que la trama gruesa: no hay patrón lento, no hay efecto óptico, se ve una grilla sobre otra. Es aritmética, no una cuestión de calibración.

**El moiré aparece cuando la relación está apenas corrida de 2** — 2,04 en vez de 2,00, por ejemplo — o cuando una capa está mínimamente rotada respecto de la otra. Al ojo quieto se sigue leyendo como "cuatro cuadraditos en un cuadrado", y en movimiento produce el batido.

Lo que tenés que hacer:

- **Exponer el desajuste como parámetro** en el panel, para que se calibre mirando. Elegí un valor inicial con criterio y decí cuál es el período de batido que produce, en unidades de mundo y en píxeles de pantalla.
- **Verificar el aliasing** con el mismo método de S7 (que dio 29 px por período contra 2 de Nyquist). Las tramas de cuadrados tienen líneas en dos direcciones: el análisis vale para las dos.
- **Reportar qué pasa cuando la trama gruesa está en fase con la fina** — si hay instantes del ciclo donde el efecto desaparece, decilo.

### La geometría: envolvente, no una pared

**La cámara recorre 360° alrededor del logo.** Una pantalla plana detrás solo funciona para un ángulo. El fondo tiene que **rodear la escena** — un cilindro, o lo que resuelvas, pero visible desde todo el recorrido.

**Y las dos tramas van físicamente separadas en profundidad**, no como dos texturas en el mismo material. Es un cambio respecto de S7, y la razón es que la separación produce **paralaje**: al orbitar la cámara, las dos capas se desalinean solas y el moiré cambia con el movimiento, además del batido de la textura. Es lo que convierte el fondo en un efecto óptico de verdad en vez de un patrón animado.

El costo es un draw call más y **overdraw de dos superficies con alfa grandes**. Medilo y reportalo: junto con las partículas de la Parte 4, son las únicas superficies transparentes de la escena y ahora hay muchas más. Si el ordenamiento por profundidad produce artefactos entre las capas y las partículas, decilo antes de darlo por bueno.

### El revestimiento

Las tramas no se inventan: **salen del vocabulario visual del sitio actual de develOP** — la retícula de cuadrados del hero y el campo de puntos. Leé esos componentes en el repo y derivá las tramas de ahí, conservando proporciones y grosores de línea. Es lo que hace que el fondo sea de develOP y no un shader genérico.

---

## Parte 3 · El sol tiene que verse

**El arco del sol no se toca.** Azimut, elevación, nivel y kelvin quedan exactamente como los dejó S9, y `level = sin(elevación)/sin(36°)` sigue valiendo. La narrativa es **una tarde**, no un día entero: si el sol subiera y bajara, el hero arrancaría en penumbra y el cierre quedaría más claro que el medio.

Lo que cambia es que **se vea**. Hoy es un disco claro sobre un fondo casi blanco: no tiene contra qué recortarse.

**La solución es el fondo nuevo: el sol se lee porque borra la trama donde pasa.** Un disco que apaga localmente la rendija —washout, glare, como quieras resolverlo— se recorta sin necesidad de ser más brillante ni de romper el blanco y negro. La rendija le da al sol el fondo que le faltaba.

Restricciones:

- **Nunca entra completo en cuadro.** La regla se mantiene: parcial, asomando.
- **Reportá la visibilidad recalculada** contra el 33,4% de S9, y en qué tramos.
- **Reportá el contraste del sol contra el fondo** en los instantes donde está en cuadro, con un número. Es lo único que dice si el problema quedó resuelto.
- Si el disco pesa demasiado en el cierre, `SUN_CORE` y `SUN_SPRITE_RADIUS` siguen siendo las perillas. No las cambies por tu cuenta.

**La sensación de tiempo pasando la dan dos cosas que ya existen y hasta ahora eran invisibles:** el sol cruzando el cuadro y la sombra del logo estirándose. Verificá que la sombra efectivamente se alargue a lo largo del recorrido y reportá cuánto, en unidades de mundo.

---

## Parte 4 · Partículas: que esté llenísimo

Hoy la escena tiene dos campos de partículas heredados de S6, que las bajó en cantidad y las subió en tamaño. **Esa decisión se revierte parcialmente:** ahora las partículas no son un detalle atmosférico, son **el relleno de la escena** — lo único que ocupa el aire entre el logo y el fondo, y lo que da paralaje cuando la cámara orbita.

- **Muchas más.** El objetivo es que el espacio se sienta lleno, no que haya polvo.
- **Las dos escalas se conservan**: cercanas grandes y difusas, lejanas chicas y tenues. La profundidad la dan ellas ahora.
- **Que se muevan lento y con vida propia**, no estáticas.
- El conteo sigue vivo como parámetro del panel.

**Y hay un requisito nuevo, para un sprint posterior:** las partículas del preloader van a terminar cayendo dentro de este campo. Necesito que el campo esté lo bastante poblado cerca de la pose de entrada como para que eso funcione, y que reportes **cuántas partículas quedan en cuadro en la pose inicial** de la coreografía. Ese número lo va a consumir el sprint del preloader. **No construyas nada del preloader acá.**

**El costo hay que medirlo en serio.** Más partículas es más overdraw sobre superficies con alfa, encima de las dos capas del fondo. Reportá draw calls, triángulos, y **qué es lo primero que hay que apagar si mobile no rinde**.

---

## Reglas absolutas

1. **No toques el home.** Todo vive en `probe-escena`.
2. **No toques el preloader ni ningún archivo de `home-intro/`.** Hay trabajo sin commitear ahí que no es tuyo.
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques la coreografía.** Las poses de S9 quedan como están. Si algo del recorrido deja de funcionar sin los planos, **reportalo, no lo arregles**.
5. **No toques el arco del sol.** Solo su visibilidad.
6. **No construyas el efecto Star Wars.** Solo medís el corredor.
7. **No sumar dependencias.**
8. **Blanco y negro.** Sin iconografía de tecnología ni elementos orgánicos.
9. **Cero `any`.** **Cero `setState` por frame** en el loop.
10. **Nada de base de datos.**
11. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
12. **No corras el dev server ni verifiques en pantalla.**
13. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
14. Archivos de más de 300 líneas se parten.

## Paradas

🛑 **PARADA 1** — antes de construir:

- (a) Qué se borra exactamente y qué queda, archivo por archivo.
- (b) **El balance de negro sin los planos**: fracción del cuadro en tinta en cada una de las seis poses. Si la escena queda lavada, decilo con el número.
- (c) La geometría del fondo: forma, radios de las dos capas, separación, y por qué.
- (d) **El desajuste de las tramas**: qué valor elegiste, qué período de batido produce en mundo y en píxeles, y el análisis de aliasing en las dos direcciones.
- (e) Cómo hacés que el sol se recorte contra la rendija, y el contraste esperado con un número.
- (f) Conteo de partículas propuesto y el costo estimado de overdraw.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) `tsc`, eslint y `npm run build`, (b) todas las comprobaciones estáticas, (c) archivos, (d) `git status`, (e) las cinco cifras de S9 que este sprint invalida, recalculadas, (f) el número de partículas en cuadro en la pose inicial, para el sprint del preloader. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S10: fondo de rendijas, escena vaciada, sol visible"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S10-fondo.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint de escena, aislado en /probe-escena.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. Nada más.
- NO toques nada de home-intro/: hay trabajo sin commitear ahí que no es
  tuyo. Tampoco el home ni ningún archivo frozen.
- NO toques la coreografía de S9 ni el arco del sol. Si algo del recorrido
  deja de funcionar sin los planos, REPORTALO en vez de arreglarlo.
- Dos tramas al doble EXACTO no producen moiré: el desajuste va como
  parámetro. Si no entendés por qué, releé la Parte 2 antes de empezar.
- Las tramas salen del vocabulario visual del sitio actual de develOP:
  leé esos componentes en el repo antes de inventar nada.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame en el loop.
- Blanco y negro. Sin iconografía de tecnología ni elementos orgánicos.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
