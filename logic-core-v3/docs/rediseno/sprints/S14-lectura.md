# S14 — Que se lean como pelotitas

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`. El working tree está limpio.
- **UNA PARADA 🛑** bloqueante, al cerrar. Es un sprint corto: el diseño ya está decidido.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Lecturas obligatorias

1. `docs/rediseno/outputs/S13-PARTICULAS.md` — entero. Sobre todo §(b), la especie, y §2.1, la divergencia de la semilla.
2. `src/components/layout/home-intro/introParticles.ts`, `introParticleField.ts`, `introParticleSprites.ts`, `introParticleTiming.ts`, `IntroParticleCanvas.tsx`.
3. Las cuatro suites de partículas y `introParticleProbe.ts`.
4. `src/components/ui/Preloader.tsx` en `main` — el campo de puntos del clásico. **Es la referencia de lectura**, no de implementación.

---

## El diagnóstico

S13 quedó grabado y el humano lo juzgó cuadro a cuadro.

**El mecanismo funciona y no se toca.** Las partículas aparecen con la transformación de color, bajan cuando se va la letra, el campo se vacía de arriba hacia abajo, y para cuando aparece la escena no queda ninguna. Nunca se ven las dos poblaciones juntas. `INTRO_FALL_WORLD` = 1,9 se aprobó mirando: no estrobea y no se lee como desvanecimiento en el lugar.

**Lo que falla es la lectura.** No parecen pelotitas. Parecen grano, o suciedad en la pantalla. Casi todo lo que se ve son motas de dos o tres píxeles; las grandes y difusas están, pero apenas se distinguen del fondo.

### La causa

S13 hizo que el campo del intro **copiara la mezcla de la escena en la pose inicial** — 957 de polvo contra 76 de bokeh. Fue una decisión razonable y por eso pasó el gate: garantizaba que las dos poblaciones fueran de la misma especie.

Pero la lectura no depende solo de la especie: depende del fondo.

- **En la escena**, ese polvo tiene paralaje, se mueve con las conchas que giran, y cae sobre un piso con bandas y una pared con moiré. Se lee como atmósfera.
- **En el intro**, el mismo polvo está quieto, sobre papel blanco liso, sin nada más en el cuadro. Ahí no se lee como atmósfera: se lee como ruido de sensor.

**La misma especie no produce la misma lectura sobre los dos fondos.** Eso es lo que este sprint corrige.

---

## Qué se cambia

**El campo del intro se corre hacia la escala grande: menos motas, más grandes, más visibles.**

Y hay que soltar una restricción que S13 se puso de más: **la mezcla del intro NO tiene que coincidir con la de la escena.** Lo único que el relevo necesita es que al final de la caída no quede ninguna partícula del intro, y eso ya lo garantiza `PARTICLES_BEFORE_VEIL` con su control negativo. La correspondencia de población nunca fue el requisito — el requisito era que no se vieran las dos juntas.

Lo que sí se conserva de la especie: **el color, el material y la forma.** Las motas del intro tienen que ser reconociblemente los mismos objetos que después flotan en la escena, aunque el reparto de tamaños sea otro. Un cambio de tamaño se perdona; un cambio de sustancia, no.

### Referencia de lectura

El campo de puntos del preloader clásico es la referencia de **cuánto se tienen que ver**: puntos claramente visibles, contables, con presencia propia sobre el blanco. No es un patrón regular como el del clásico y no queremos que lo sea — la distribución sigue siendo la del campo actual. Lo que se toma de ahí es la escala de visibilidad.

### Lo que hay que reportar

- **El reparto nuevo**: conteo y tamaños de cada escala, contra los 957 / 76 y la distribución de S13 (polvo p10/mediana/p90 de 2,09 / 3,16 / 4,97 px; bokeh mediana 24,40).
- **Cuántas motas superan un umbral de visibilidad** que definas y declares, antes y después. Es el número que dice si el sprint hizo algo.
- **El contraste de la mota mediana contra el papel** en el instante de densidad completa, antes y después.
- Todo esto en las tres ventanas que S13 ya mide: 1440×810, 1920×1080 y 390×844. **En mobile hay 354 motas**: si el reparto nuevo las deja demasiado ralas, decilo.

---

## Lo que NO se toca

1. **La línea de tiempo entera.** Aparición 2,250 → 3,510, caída 3,650 → 4,190, y los **110,4 ms de margen** contra la primera partícula legible de la escena. Si el cambio de tamaños mueve el instante en que la última deja de ser legible —y lo va a mover, porque una mota más grande es legible más tiempo— **recalculá el margen y reportalo**. Si se come el margen, **frená y reportá**: la salida sería adelantar la caída, no achicar las motas de vuelta.
2. **`INTRO_FALL_WORLD` = 1,9.** Aprobado mirando. Con motas más grandes el paso por cuadro en diámetros propios **baja**, así que el argumento de `linear` contra `shift` se refuerza. Verificalo y reportá el número nuevo de diámetros por cuadro.
3. **`PARTICLES_BEFORE_VEIL`** y los seis predicados anteriores.
4. **El ritmo de S8e**, el cruce de contraste, el relevo 2D→3D, la entrada de las letras.
5. **`probe-escena/` entero.** El campo de la escena no se toca: este sprint solo cambia el del intro.
6. **La semilla distinta** y su control de divergencia en tres pasos.
7. **El escalón de exposición** resuelto en S13.

## Reglas absolutas

1. **No toques `probe-escena/`, ni el home, ni los frozen** (`3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`).
2. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.**
3. **Blanco y negro.**
4. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio.
5. **Regla 11 de §3:** una cifra publicada sin instrumento que la produzca es prosa, no medición. Todo número del reporte tiene que tener productor en el repo.
6. **Al mover código compartido entre módulos** (§8.2): se guarda la salida completa de las suites afectadas ANTES de tocar nada y se exige diff vacío. El conteo no es evidencia.
7. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
8. **No corras el dev server ni verifiques en pantalla.**
9. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
10. Archivos de más de 300 líneas se parten. La deuda de §7.13 y el pendiente de `harness.ts` (§7.15) no se tocan acá.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc`, eslint y `npm run build`.
- (b) Todas las comprobaciones, con los controles positivos declarados. Las seis del intro y las once calibraciones del cruce **con diff, no con conteo**.
- (c) **El reparto nuevo** contra el de S13, en las tres ventanas.
- (d) **Cuántas motas superan el umbral de visibilidad**, antes y después, con el umbral declarado.
- (e) **El margen recalculado** contra los 110,4 ms.
- (f) Los diámetros por cuadro de la caída, contra los 1,90 de S13.
- (g) Archivos y `git status`.
- (h) Cifras de S13 que este sprint invalida.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S14: lectura del campo de particulas del intro"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S14-lectura.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Es un sprint CORTO y quirúrgico: cambia el reparto de tamaños del campo
  de partículas del intro. El mecanismo funciona y no se toca.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente:
  usá NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- NO toques probe-escena/: el campo de la ESCENA no se toca, solo el del
  intro. Tampoco el home ni los frozen.
- NO toques la línea de tiempo, ni INTRO_FALL_WORLD, ni el ritmo de S8e,
  ni el cruce de contraste, ni la entrada de las letras.
- La mezcla del intro NO tiene que coincidir con la de la escena: esa
  restricción se suelta. Lo único que el relevo necesita es que al final
  de la caída no quede ninguna, y eso lo garantiza PARTICLES_BEFORE_VEIL.
  Lo que SÍ se conserva es el color, el material y la forma.
- Motas más grandes son legibles más tiempo, así que el margen de 110,4 ms
  se va a mover. Recalculalo. Si se lo come, FRENÁ Y REPORTÁ: la salida
  sería adelantar la caída, no achicar las motas de vuelta.
- Ninguna comprobación queda verde por vacío: control positivo obligatorio.
  Y regla 11: toda cifra del reporte tiene que tener productor en el repo.
- Si movés código compartido entre módulos, diff de la salida completa, no
  comparación de conteos.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Blanco y negro.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
