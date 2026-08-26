# S13 — Las partículas del preloader

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- Worktree `C:\rediseno-home`, branch `rediseno/home`. Sesión abierta en `logic-core-v3`. El working tree está limpio.
- **DOS PARADAS 🛑** bloqueantes.
- **NO corras el dev server, NO tomes capturas, NO abras navegador, NO despaches `visual-qa`.** Verificación: `tsc --noEmit` exit 0, eslint limpio, comprobaciones estáticas con `npx tsx`, `npm run build` (necesita `NODE_OPTIONS=--max-old-space-size=8192`; el OOM es preexistente, no lo investigues).

## Lecturas obligatorias

1. `docs/rediseno/outputs/S8E-RITMO.md` — la línea de tiempo resuelta. Es el esqueleto de este sprint.
2. `docs/rediseno/outputs/S8-PRELOADER.md` y `S8D-SIMPLIFICACION.md` — los mecanismos: la transformación de color, la inversión de la tinta, el relevo 2D→3D, el cruce de contraste.
3. `docs/rediseno/DIRECCION-ESCENA.md` **§7.11** — el escalón de exposición. **Este sprint lo tiene que resolver o declarar.**
4. `docs/rediseno/outputs/S10-FONDO.md` §(f) — las partículas de la escena y el conteo en la pose inicial.
5. `src/components/layout/home-intro/` — el módulo entero.
6. `src/components/ui/Preloader.tsx` en `main` — el preloader clásico, **solo como referencia visual del campo de puntos**: tamaños, densidad, distribución. No adoptes su implementación.

---

## Qué se construye

El dueño del proyecto lo describió así, y es literal:

> Las pelotitas van apareciendo en el preloader, como en el viejo. Cuando llega el momento de desaparecer la letra, desaparece la letra, las pelotitas hacen el efecto de bajar — literalmente se van hacia abajo — y luego desaparece lo blanco. Y ahí está toda la magia: las pelotitas ya se encontraban flotando en el entorno.

Contra la línea de tiempo de S8e:

```
2,250  arranca la transformación de color   ← las partículas empiezan a aparecer acá
3,650  se va la letra                       ← y acá empiezan a bajar
4,250  se va el fondo                       ← el blanco se disuelve y aparece la escena
4,950  arranca el acomodamiento
```

## La idea que hace que esto sea barato

**No hace falta ningún relevo.** Las partículas bajan **antes** de que se vaya lo blanco: esa bajada es la tapadera.

Las que caen son las del intro. Las que quedan flotando son las de la escena, que ya estaban ahí desde siempre — S10 midió **1.008 en cuadro en la pose inicial** (924 de polvo + 84 de bokeh). Nadie puede notar que no son las mismas, porque nunca se ven las dos poblaciones a la vez.

Es el mismo truco que S8d usó con el cruce de contraste: no se resuelve la continuidad, se esconde el corte.

**El requisito que lo sostiene es uno solo:** en ningún instante pueden ser legibles dos poblaciones distintas de partículas. Si al disolverse el blanco todavía quedan partículas del intro visibles junto a las de la escena, el truco se rompe y se ve el corte. **Eso hay que medirlo, no estimarlo.**

Y de eso sale lo demás: las del intro tienen que ser **de la misma especie** que las de la escena — mismo rango de tamaños, mismo color, misma sensación de densidad — para que el ojo no registre un cambio de población.

---

## Parte 1 · Aparecen

- **Atadas a la transformación de color.** El fondo va de oscuro a claro entre 2,250 y 3,650, y las partículas emergen con ese mismo número. No es una fase nueva con su propio reloj: es un consumidor más del progreso que ya existe. Este proyecto ya usa ese patrón —`samplePlace` alimenta desplazamiento, rotación y entrada en la luz—; seguilo.
- **Son de tinta, no de luz.** Por eso aparecen cuando el fondo se aclara: sobre el fondo oscuro no tendrían contra qué recortarse. Es la misma razón por la que el disco del sol no se veía en S10.
- **Van apareciendo, escalonadas**, no todas juntas. El campo de puntos del clásico es la referencia de densidad y de tamaños.
- **Densidad completa antes de 3,650**, para que se registren como presentes antes de irse.

**Restricción dura: no toques la entrada de las letras.** "develOP" arriba y el slogan abajo entran por puro desvanecimiento y eso está **aprobado y cerrado**. Ni su timing ni su curva ni su opacidad.

## Parte 2 · Bajan

- **Arrancan a las 3,650**, cuando se va la letra.
- **Bajan de verdad** — se van hacia abajo, no se desvanecen en el lugar. Puede haber dispersión, pero la dirección dominante es hacia abajo.
- **Tienen que estar fuera antes de que la escena se lea.** El fondo se disuelve entre 4,250 y 4,950: reportá en qué instante la última partícula del intro deja de ser legible, y confirmá que no se superpone con el momento en que las de la escena se vuelven legibles. **Ése es el número que decide si el sprint funciona.**
- Escalonadas también al salir, no en bloque.

## Parte 3 · El escalón de exposición ⚠️

`DIRECCION-ESCENA.md` §7.11: el intro termina con el ambiente en `HEMI_INTENSITY` exacto y la escena arranca en `HEMI_INTENSITY × 0,6743`. Son **−32,6% de ambiente en un corte**, que sobre las mismas superficies son −1,1 puntos en el papel iluminado, −18,2 en el papel en sombra y −15 en el valor medio del hero.

Hasta ahora nadie lo miró porque nadie llegó a ver las dos cosas juntas. Este sprint sí.

**La ventana en la que se disuelve el fondo (4,250 → 4,950) es exactamente la tapadera que ese escalón necesita.** Si el ambiente del intro baja hasta el de la escena mientras el blanco se va, el corte se convierte en transición y desaparece gratis.

- **Evaluá resolverlo así y reportá el costo.**
- ⚠️ **`introShading.invariant.ts` compara `lit.hemiIntensity === HEMI_INTENSITY` por identidad.** Un ambiente que varía rompe esa comprobación. Si la tocás, tenés que reemplazarla por una que custodie la misma garantía — que el intro arranque en el valor pleno — y no aflojarla.
- **Si resolverlo resulta caro o riesgoso, declaralo y no lo hagas.** Es una decisión legítima con el número en la mano. Lo que no es aceptable es dejarlo sin decidir.

---

## Reglas que el preloader ya tiene y siguen valiendo

- **Nunca bloquea el scroll.** **No espera a que cargue nada.** **Solo primera visita de sesión.** **Sin sonido.**
- **El logo NUNCA cambia de tamaño.**
- **Honra `prefers-reduced-motion`** — las partículas también. Definí qué hacen ahí y reportalo.
- **Los seis predicados de `PROPERTIES`** —`ORDER`, `LETTER_BEFORE_VEIL`, `PLACE_IS_LAST`, `INK_INSIDE_COLOR`, `SWAP_INSIDE_INK`, `LINES_SETTLE`— no cambian. Si el sprint necesita un séptimo, proponelo en la Parada 1.

## Reglas absolutas

1. **No toques `probe-escena/`.** Las partículas de la escena ya existen y este sprint las **consume**: no las cambia, no las mueve, no cambia su conteo. Si necesitás algo de ahí, **frená y reportá**.
2. **No toques el home.**
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques el ritmo de S8e.** Ninguna de las siete perillas, ni `placeS` = 2,4. Las partículas se acomodan a la línea de tiempo, no al revés.
5. **No cambies el cruce de contraste** ni el relevo 2D→3D. Las partículas no participan de esa medición: verificá que las once calibraciones sigan dando lo mismo.
6. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.**
7. **Blanco y negro.** Sin color.
8. **Ninguna comprobación queda verde por vacío.** Control positivo obligatorio. En S10, S11 y S12 esa regla encontró tres cosas reales; en S12 destapó un instrumento que tiraba su propio parámetro. **Y aplicá la regla 11 de §3: una cifra que se publica sin instrumento que la produzca es prosa, no medición.** Todo número de este reporte tiene que tener productor en el repo.
9. **Git:** commit y push en `rediseno/home`. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte cambios, y todo lo que toque `main` u otros worktrees. **Nunca `git add .`**
10. **No corras el dev server ni verifiques en pantalla.**
11. **No auto-confirmás que se ve bien.** El juicio es del humano, por grabación.
12. Archivos de más de 300 líneas se parten. La deuda de §7.13 no se toca acá.

## Paradas

🛑 **PARADA 1** — antes de construir:

- (a) **Dónde viven las partículas del intro** y por qué: en el rig ortográfico que ya existe, en el canvas, o en DOM. Con el costo de cada opción.
- (b) **La especie**: tamaños, conteo, distribución y color, medidos contra las de la escena en la pose inicial. Cuánto se parecen, con número.
- (c) **La línea de tiempo de las partículas** encajada en la de S8e: cuándo aparece la primera, cuándo está la densidad completa, cuándo arranca la bajada, y **en qué instante deja de ser legible la última**.
- (d) **La superposición**: el instante en que las de la escena se vuelven legibles contra el instante en que las del intro dejan de serlo. Si se solapan, decilo antes de construir.
- (e) **El escalón de exposición**: resolverlo o declararlo, con el costo y con qué pasa con `introShading.invariant.ts`.
- (f) Qué hacen con `prefers-reduced-motion`.
- (g) Si hace falta un séptimo predicado en `PROPERTIES`.

Esperá el OK.

🛑 **PARADA 2** — al cerrar: (a) los tres gates, (b) todas las comprobaciones con los controles positivos declarados, incluidas las seis del intro y las once calibraciones del cruce, (c) archivos, (d) `git status`, (e) el número de la superposición, (f) qué pasó con el escalón de exposición, (g) cifras que este sprint invalida. Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "S13: particulas del preloader"` → `git push`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/S13-particulas.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Es un sprint del preloader, aislado en home-intro/.
- NO corras el dev server, NO tomes capturas, NO abras navegador, NO
  despaches visual-qa. Verificación: tsc exit 0, eslint, comprobaciones
  estáticas con tsx y npm run build. El OOM del build es preexistente:
  usá NODE_OPTIONS=--max-old-space-size=8192 y no lo investigues.
- NO toques probe-escena/: las partículas de la escena ya existen y este
  sprint las consume, no las cambia. Tampoco el home ni los frozen.
- NO toques el ritmo de S8e, ni el cruce de contraste, ni el relevo 2D→3D,
  ni la entrada de las letras (está aprobada y cerrada).
- NO hay relevo de partículas: las del intro BAJAN antes de que se vaya el
  blanco, y esa bajada es la tapadera. Las de la escena ya estaban ahí. El
  único requisito es que nunca se vean las dos poblaciones a la vez, y ESO
  SE MIDE.
- El escalón de exposición del §7.11 se resuelve o se declara, con el
  número. Sin decidir no se cierra el sprint.
- Ninguna comprobación queda verde por vacío: control positivo
  obligatorio. Y regla 11: una cifra sin instrumento que la produzca es
  prosa, no medición — todo número del reporte tiene que tener productor.
- Git: podés commitear y pushear en rediseno/home. PROHIBIDO merge, reset,
  rebase, push --force, checkout que descarte cambios, y cualquier cosa
  sobre main o sobre otros worktrees. Nunca git add . — archivo por archivo.
- Nada de base de datos. No sumás dependencias. Cero any. Cero setState
  por frame. Blanco y negro.
- Las paradas 🛑 son bloqueantes: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Parada 1. No me confirmes el entendimiento.
```
