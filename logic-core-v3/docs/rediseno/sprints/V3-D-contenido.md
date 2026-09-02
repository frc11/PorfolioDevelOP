# V3-D — El contenido real

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`**: es un lane de contenido, no de descubrimiento.
- **Worktree:** `C:\v3-contenido`, rama **`v3/contenido`**. Sesión en `C:\v3-contenido\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con otros tres lanes.**

## ⚠️ REGLA DE MÁQUINA

**NO corras `npm run build`. Nunca.** Cuatro sesiones en 16 GB. **El build lo corre el humano después de mergear.**

Verificación: **`.\node_modules\.bin\tsc.cmd --noEmit`** + **eslint** + **invariantes con `npx tsx`**.

**NO corras el dev server, NO tomes capturas, NO abras navegador.**

---

## Qué hace este lane

**El home tiene 43 marcadores de contenido en pantalla** — `[CIFRA]`, `[MÉTRICA]`, `[CAPTURA]`, `[VIDEO]`, `[ENLACE]`. Son deliberados: la regla del proyecto es que **el contenido inventado tiene que parecer inventado**, porque develOP ya tiene deuda registrada por cifras fabricadas en sus landings viejas.

**Este lane reemplaza los que ya tienen dato real, y no toca los demás.**

### Lo que existe

El humano puso **capturas de los tres sitios en producción** en el repo. **Buscalas** — probablemente en `public/`. Los tres clientes son reales y sus nombres se usan:

- **Esquina**
- **El Garage**
- **Matsu Automotores**

### Lo que NO existe y no se inventa

- **Las métricas por proyecto.** `[MÉTRICA]` se queda.
- **Las cifras de la sección Números.** `[CIFRA]` se queda.
- **Los videos de Servicios.** `[VIDEO]` se queda.
- **Los precios.** No están cerrados.
- **Los datos de contacto y las redes.** `[ENLACE]` se queda.
- **Las fotos del equipo.**

⚠️ **Si un dato no está, el marcador se queda.** Un marcador visible es un pedido que no se puede ignorar; una cifra inventada se publica sin que nadie se acuerde. **El escáner de contenido inventado tiene que seguir en verde.**

---

## Parte 1 · Las capturas de Trabajos

- **Encontralas y conectalas** a las tres tarjetas.
- **Con el componente de imagen que ya existe** — el que exige `sizes` reales. Es una de las tres cosas en las que el proyecto le gana a la referencia y **no se puede saltear.**
- **Cada una con su `alt`** describiendo el sitio, no el archivo.
- **Y con las dimensiones declaradas**, para que no haya salto de layout.
- ⚠️ **Si una captura falta o está en un ancho chico, no la uses:** dejá su `[CAPTURA]` y reportá cuál.

**Reportá el peso de las tres**, y si alguna necesita otro formato o compresión. Es lo primero que pesa de verdad en el sitio.

## Parte 2 · Los enlaces reales

Las tres tarjetas tienen que **enlazar a los sitios en producción**, con su dominio real. Buscalos: dos están en el propio repo, en los créditos de los sitios de cliente.

**Si no encontrás alguno, dejá el marcador y reportalo.**

## Parte 3 · Repasá los textos

Los textos de las ocho secciones los escribieron cuatro subagentes distintos en dos sprints paralelos. **Leelos todos de corrido, como los va a leer una persona**, y reportá:

- **Repeticiones** entre secciones — la misma idea dicha dos veces con otras palabras.
- **Tono** que se sale del resto. La voz es rioplatense, directa, sin marketinés.
- **Cosas que prometen algo que develOP no puede sostener.**
- **Frases que quedaron de relleno** y suenan a relleno.

⚠️ **No los reescribas.** **Reportá la lista con la sección, la frase y qué le pasa.** El humano tiene un chat aparte para el copy y ahí se decide.

**La única excepción:** si un texto **contradice** un hecho —dice que son tres personas cuando son dos, o nombra un servicio que no existe— eso sí se arregla, y se reporta.

## Parte 4 · El inventario, al día

`docs/rediseno/CONTENIDO-PENDIENTE.md` tiene los 43 marcadores. **Actualizalo:**

- Cuáles se cerraron con este lane.
- Cuáles quedan, **agrupados por quién los tiene que traer** — Franco, el humano, o una decisión.
- **Cuál es el más caro de conseguir**, para que se pida primero.

Es el documento que le va a llegar a Franco. **Tiene que poder leerse sin abrir el código.**

---

## Reglas absolutas

1. **Rama `v3/contenido`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo pasa a CRLF. Para leer `HEAD`, `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Tu zona son los archivos de contenido de las ocho secciones, `public/`, y `CONTENIDO-PENDIENTE.md`.** Si necesitás tocar un componente, `theme-develop.css`, `_lib/escena/` o `home-intro/`, **frená y reportá**: son de los otros lanes.
3. **NO cambies la composición de ninguna sección.** Esto es contenido, no layout. Si un texto real no entra donde entraba el marcador, **reportalo, no muevas la caja.**
4. **NO toques `secciones.ts`, `anclaje.ts` ni `/v3/page.tsx`.**
5. **NO toques el home actual, `/probe-escena`, ni los frozen.**
6. **NO corras `npm run build`.**
7. **NADA INVENTADO.** Ni una cifra, ni un testimonio, ni un precio, ni una métrica. **El escáner tiene que seguir en verde.**
8. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No auto-confirmás que se ve bien.**

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `tsc` y eslint. **Sin build.**
- (b) El escáner de contenido inventado, en verde, con su control.
- (c) **Las tres capturas conectadas**, con su peso, su `sizes` y su `alt`.
- (d) **Los enlaces reales**, o cuáles faltan.
- (e) **La lista de problemas de texto**: sección, frase, y qué le pasa. **Sin reescribir.**
- (f) **El inventario al día**: cuántos marcadores quedan y de quién es cada uno.
- (g) Archivos y `git status`.
- (h) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "V3-D: contenido real"` → `git push -u origin v3/contenido`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/V3-D-contenido.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-contenido, rama v3/contenido. Corren OTROS TRES LANES en
  paralelo.
- ⚠️ NO CORRAS npm run build. NUNCA. Cuatro sesiones en una máquina de 16 GB.
  El build lo corro yo después de mergear. Tu verificación es tsc + eslint +
  invariantes con tsx.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Tu zona son los archivos de CONTENIDO de las ocho secciones, public/, y
  CONTENIDO-PENDIENTE.md. NO toques componentes, theme-develop.css,
  _lib/escena/, home-intro/, secciones.ts, anclaje.ts ni /v3/page.tsx.
- NO cambies la composición de ninguna sección. Si un texto real no entra
  donde entraba el marcador, REPORTALO, no muevas la caja.
- NADA INVENTADO: ni una cifra, ni un testimonio, ni un precio, ni una
  métrica. Si el dato no está, el marcador SE QUEDA. develOP ya tiene deuda
  registrada por cifras fabricadas y no se repite. El escáner tiene que
  seguir en verde.
- Puse capturas de los tres sitios en el repo: buscalas, probablemente en
  public/. Los clientes son Esquina, El Garage y Matsu Automotores, y sus
  nombres son reales.
- Las imágenes van con el componente que exige sizes reales: es una de las
  tres cosas en las que le ganamos a la referencia y no se saltea.
- Los textos los LEÉS y reportás qué les pasa —repeticiones, tono, promesas
  que no se sostienen, relleno— pero NO LOS REESCRIBAS. Tengo un chat aparte
  para el copy. La única excepción es un texto que CONTRADIGA un hecho.
- NUNCA git stash ni ninguna escritura de git en el árbol: con core.autocrlf
  convierte a CRLF. Para leer HEAD, git show HEAD:<ruta>.
- Git: commit y push en v3/contenido. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- Ninguna comprobación verde por vacío.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.

Arrancá. No me confirmes el entendimiento.
```
