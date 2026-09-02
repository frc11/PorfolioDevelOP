# SITIO-S12 — Los tres abiertos

Y el defecto que está en producción.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **Antes de cada build**, el chequeo de §6.1. Y del aprendizaje de S11: **el build se corre en segundo plano** para que el techo de tiempo del arnés no lo corte, con `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`.

⚠️ **Nunca `git stash` para consultar `HEAD`.** Con `core.autocrlf` convierte el árbol a CRLF y pone en rojo instrumentos sin que una línea de código cambie. Para eso está `git show HEAD:<ruta>`.

## Insumos

**`DIRECCION-ESCENA.md` §7.43, §7.44 y §7.45** tienen las tres decisiones ya tomadas y el defecto de producción. **`test:s10-logo`, `test:s10-acceso` y `test:s10-mobile`** son los instrumentos: cada arreglo se confirma volviendo a correr el que lo encontró.

---

# FASE 0 — El agente principal, sin subagentes

## 0.1 Leer

`DIRECCION-ESCENA.md` §7.36 a §7.45. `_lib/escena/encuadre.ts`, `_lib/__tests__/s10-banco.ts`, `_contrato/Seccion.tsx`, `_lib/secciones.ts`, `src/lib/scene-camera.ts`.

## 0.2 El patch al modelo del banco — primero, y solo vos

**Es el desbloqueo de todo el frente B, y está escrito en §7.43.**

`s10-banco.ts` compone el documento como *"todo adentro del `<main>`"*. Con ese modelo, **sacar el pie del `<main>` bajaría las cifras** — el instrumento contaría menos landmarks después de arreglar el landmark. **Un instrumento que penaliza el arreglo correcto no puede quedar de árbitro.**

- Aplicá el patch de ~6 líneas de §7.43.
- **Control positivo obligatorio**: un documento con el pie afuera del `<main>` tiene que contar **más** landmarks que uno con el pie adentro. Sin eso, el patch no se puede usar como gate del frente B.
- **Reportá las cifras del modelo viejo y del nuevo sobre el árbol de HOY**, sin haber movido nada. Si cambian, es el sesgo saliendo a la luz y hay que decirlo.

## 0.3 Reglas para todo subagente

1. **Escribís SOLO en tu carpeta.** Si necesitás algo de afuera, **reportalo.**
2. **Cada arreglo se confirma con el instrumento que encontró el defecto.**
3. **Si un arreglo hace fallar otra afirmación, FRENÁ Y REPORTÁ.**
4. **Cero valores fuera de los tokens. Tu invariante propio con controles positivos.**

---

# FASE 1 — Los cuatro frentes

---

## Subagente A · El defecto 7 — la columna del diferencial

**La decisión ya está tomada y está en §7.43:** la columna de texto del diferencial se acota a la izquierda, fuera de la silueta del logo.

**No es una invención: es lo que el Hero ya hace**, y por eso el Hero tiene superposición mínima 0 y el diferencial 6–16%.

- **El logo cubre 35,7% del cuadro; queda 64% libre.**
- ⚠️ **No toques la escena, ni la pose `demos`, ni `travelX`.** Las palancas de la escena ya se descartaron con el número: la mejor mueve 2,90% de cuadro contra una superposición mínima de 6–16%. **Esto es layout.**
- **Confirmalo con `test:s10-logo`**: la superposición del bloque de texto tiene que caer a **0** en los cuatro cuadros, y el contraste dejar de medirse sobre el logo.
- ⚠️ **Verificá que la composición nueva sobreviva a 375, 390 y 768**, donde no hay escena. Una columna acotada a la izquierda para dejarle lugar a un logo que abajo del umbral no existe **deja media pantalla vacía**. Reportá qué hace ahí.

## Subagente B · Los defectos 6 y 15 — el pie y los landmarks

**El orden está fijado y la Fase 0 ya hizo el primer paso.**

**El corte, decidido:** rótulo, `h2` y CTA **se quedan en la `<section id="cierre">`**; columnas y legal **salen a un `<footer>` hermano del `<main>`**.

- **`role="contentinfo"`** por estar afuera del `<main>`.
- **`role="banner"`** donde corresponda, y **la navegación deja de estar anidada en `main`** (defecto 15).
- ⚠️ **El alto del Cierre hay que recalcularlo.** `secciones.ts` lo declara en `100svh` y partir el pie deja un hueco. **Las cifras publicadas (532/218 px) valen para el corte que S11 evaluó, no para éste** — medilo de nuevo.
- **Confirmalo con `test:s10-acceso`**: los landmarks tienen que subir de 10, con `contentinfo` y `banner` presentes.
- ⚠️ **Y verificá que el Cierre siga cerrando** a 375, 390, 768 y 1440. Es la última pantalla del sitio.

## Subagente C · `travelX` — cinco copias y un defecto en producción

**§7.44: el aterrizaje del logo del preloader está mal HOY, en el sitio vivo.**

`src/lib/scene-camera.ts` tiene su propia copia de `travelX` **sin la corrección** y **sin compuerta de 1025**. A 375×812 el aspecto es 0,462, debajo del codo de 0,567, así que `travelX` vale 0 y el `frameX: 0,68` de la pose de entrada **no corre el logo ni un píxel**: aterriza centrado cuando la pose pide que caiga corrido.

### Primero: unificar

`travelX` está escrito **cinco veces** — el rig, `harness.ts`, `camaraDelCuadro.ts`, `scene-camera.ts` y `scene-framing.invariant.ts`. **Una sola fuente**, y las cinco la consumen.

- ⚠️ **`scene-camera.ts` es del sitio vivo.** Unificar la fórmula **cambia el aterrizaje del logo en vertical**, que es un cambio visual en producción.
- **Por eso: unificá las cuatro que NO son del sitio vivo, y a `scene-camera.ts` NO la toques.**
- **Comprobación de que las cinco coinciden**, que hoy fallaría por la quinta. **Que falle es correcto**: es la deuda visible.

### Después: medir §7.44 sin arreglarlo

- **Dónde aterriza el logo hoy** en 375×812, 390×844 y 393×852, y **dónde aterrizaría** con la fórmula corregida. En píxeles.
- **Qué más consume `scene-camera.ts`** y qué otras rutas del sitio vivo cambiarían.
- **NO lo arregles.** Es el sitio vivo y el cambio se ve: lo juzga el humano por grabación.

## Subagente D · Lo que quedó sin vigilar

**S11 dejó dos toques declarados en `/probe-escena` que hoy no vigila ningún instrumento.** Antes los reportaba `s3-frontera`, en rojo y por la razón equivocada; con el detector bien fechado, nadie los mira.

- **Escribí el check de frontera propio de S11** que S11 no tuvo. Con su ventana declarada y su control positivo.
- **Y revisá si hay otros sprints sin check de frontera propio.** Si los hay, listalos: es un hueco de método, no de este sprint.

**§7.36 — el acoplamiento de tipo**, si quedó abierto: resolvelo con el costo real ya medido, y **reescribí las afirmaciones que pierden premisa en vez de dejarlas verdes por vacío.**

**La contradicción `≤` contra `=` entre `s8-largos` y `s9-instrumentos §3`**, que quedó anotada y sin resolver. Dirimila con la medición.

---

# FASE 2 — Integración

1. **`npm run verificar` en cero** y el build cerrado.
2. **La tabla de antes y después** de los tres defectos, con su instrumento.
3. **Las cifras del modelo del banco viejo y nuevo** sobre el mismo árbol.
4. **§7.44 medido y no arreglado**, con los números de los tres teléfonos.
5. **El peso** contra los 377,6 KiB gzip.
6. **`DIRECCION-ESCENA.md`** actualizado.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **`src/lib/scene-camera.ts` se LEE y se MIDE. No se edita.**
4. **No toques la escena, ni las poses, ni el anclaje, ni el ritmo del preloader, ni el contenido.** Los 43 marcadores se quedan.
5. **No toques el home actual, `/probe-escena` ni `home-intro/`.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío.**
9. **Regla 11:** toda cifra con su instrumento. **12:** frontera declara ventana. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan. **15:** una afirmación se escribe contra la propiedad, no contra el literal que pidió la instrucción.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No corras el dev server. No auto-confirmás que se ve bien.**
12. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` y `npm run build`.
- (b) **La tabla de antes y después** de los defectos 6, 7 y 15.
- (c) **El modelo del banco**: cifras vieja y nueva sobre el árbol de hoy, con su control.
- (d) **El diferencial**: superposición en 0, y **qué hace la composición a 375, 390 y 768.**
- (e) **El Cierre**: el alto recalculado, y que cierra bien en los cuatro anchos.
- (f) **§7.44**: dónde aterriza hoy y dónde aterrizaría, en los tres teléfonos.
- (g) **Las cinco copias de `travelX`**: cuatro unificadas, la quinta declarada, y la comprobación que falla a propósito.
- (h) **TODO LO QUE FRENÓ.**
- (i) Archivos y `git status`.
- (j) Qué queda abierto.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S12: los tres abiertos"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S12-abiertos.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Sprint LARGO y AUTÓNOMO en
  TRES FASES: la fase 0 la hacés vos solo —el patch al modelo de s10-banco,
  que es lo que desbloquea el frente B— y nada se despacha hasta que esté
  con su control positivo.
- Las tres decisiones YA ESTÁN TOMADAS y están en §7.43. Este sprint las
  ejecuta, no las rediscute.
- El defecto 7 se arregla con LAYOUT, no con la escena: las palancas de la
  escena ya se descartaron con el número. No toques la pose demos ni travelX
  para esto.
- src/lib/scene-camera.ts se LEE y se MIDE, NO se edita: es del sitio vivo y
  arreglarlo cambia dónde aterriza el logo del preloader en un teléfono en
  vertical. Eso lo juzga el humano por grabación.
- Unificá las CUATRO copias de travelX que no son del sitio vivo. La
  comprobación de que las cinco coinciden va a fallar por la quinta, y que
  falle es correcto: es la deuda visible.
- NUNCA git stash para consultar HEAD: con core.autocrlf convierte el árbol
  a CRLF y pone instrumentos en rojo sin que una línea cambie. Usá
  git show HEAD:<ruta>.
- El build se corre EN SEGUNDO PLANO para que el techo de tiempo del arnés
  no lo corte, con CIRCLE_NODE_TOTAL=2 y --max-old-space-size=6144, y con
  el chequeo de §6.1 antes.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- NO toques la escena, ni las poses, ni el anclaje, ni el preloader, ni el
  contenido, ni el home actual, ni /probe-escena, ni los frozen.
- Cada arreglo se confirma con el instrumento que encontró el defecto. Si
  un arreglo hace fallar otra afirmación, FRENÁ Y REPORTÁ.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento. Regla 15: una afirmación se escribe contra la
  PROPIEDAD, no contra el literal que pidió la instrucción.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
