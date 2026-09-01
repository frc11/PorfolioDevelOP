# SITIO-S11 — Los arreglos

Los dieciocho defectos que S10 midió y no tocó.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **Antes de cada build**, el chequeo de §6.1. Y ojo: en S10 **el build murió una vez por el techo de tiempo del arnés, no por memoria** — `node` en 0 y comprometida en 44,9. Si vuelve a pasar, dale más margen al arnés, no más heap.

## Insumos

**`DIRECCION-ESCENA.md` §7.38, §7.39 y §7.40** tienen las tres tablas completas de S10, y `npm run test:s10-mobile`, `test:s10-acceso` y `test:s10-logo` las reproducen. **Son la especificación de este sprint: cada arreglo se verifica volviendo a correr el instrumento que lo encontró.**

---

## Qué hace este sprint

S10 midió y no tocó nada. Encontró **18 defectos y 3 defectos de instrumento**. Este sprint los arregla.

**Regla que gobierna todo:** un arreglo no está hecho hasta que **el instrumento que encontró el defecto lo confirme**. No se escriben comprobaciones nuevas para los arreglos: **se reusan las de S10**, que ya tienen sus controles positivos.

Y una consecuencia: **si arreglar algo hace fallar otra afirmación de S10, eso es un hallazgo**, no un estorbo. **Frená y reportá.**

---

# FASE 0 — Las superficies compartidas (el agente principal, sin subagentes)

**Tres archivos los tocan varios frentes. Los escribís vos, antes de despachar.**

## 0.1 El contrato de sección — el defecto crítico, mitad de abajo

**Defecto 1, abajo de 1025.** `_contrato/Seccion.tsx:101` le da a `pinneada:'siempre'` un hijo `sticky top-0 h-svh` — **alto fijo** — y adentro `ServiciosApilados` apila tres bloques de `min-h-svh`. **Los servicios 2 y 3 quedan recortados.**

El propio `servicios/geometria.ts` escribe la regla que el envoltorio viola: *"el alto de un bloque es `min-h-svh`, no `h-svh`"*. **La sección y su envoltorio se contradicen y gana el envoltorio.**

- **Arreglalo en el contrato**, no en Servicios: es el envoltorio el que está mal.
- ⚠️ **Es la doble contención que dejó la unificación de contratos de S7.** Verificá que el arreglo no rompa el pinneo de las otras secciones pinneadas: el mismo envoltorio las sirve a todas.
- **Reportá el alto de la tinta sola de Servicios** en los tres anchos, contra los 963 / 942 / 1583 px que midió S10.

## 0.2 Los dos pisos de la escala tipográfica

**Defectos 12 y 13**, los dos a 375:

- **`--text-fluido-micro` cae a 8 px** — un 20% por debajo del piso fijo del propio sistema.
- **`--text-fluido-titulo-s` resuelve a 16 px = `--text-base`**: la cifra más chica de Números deja de leerse como cifra.

**Una escala en la que dos niveles colisionan en un extremo no es una escala, y 8 px no es un tamaño de texto.**

- **Subí los dos pisos** con el cambio mínimo que deje `micro` legible y `titulo-s` distinguible de `base` a 375.
- ⚠️ **El techo de la banda no se toca.** Los valores a 1440 salen de medición y están anclados: **reportá que no se movieron.**
- **Reportá los ocho niveles resueltos a 375 antes y después.**

## 0.3 La tinta en las secciones invertidas

**Defecto 11, que es la causa del 5.** `[data-seccion="invertida"]` redefine `--color-tinta` pero **no** `--color-tinta-media` ni `--color-tinta-tenue`. El día que una sección invertida use tinta media, da 2,51:1.

- **Redefinilas las dos** en ese bloque, derivadas con el método espejado que ya usó S0.
- **Verificá que pasen AA como texto** sobre `#0E0E0E`.
- **Esto arregla el defecto 5 en su raíz**, así que el `<p>` de ayuda de novedades debería subir solo. **Confirmalo con el número** — S10 midió 2,80:1.

## 0.4 Reglas para todo subagente

1. **Escribís SOLO en tu carpeta.** Si necesitás algo de afuera, **reportalo.**
2. **No modificás lo de la Fase 0, ni `secciones.ts`, ni `anclaje.ts`, ni `package.json`.**
3. **Cada arreglo se confirma con el instrumento de S10 que lo encontró.**
4. **Si un arreglo hace fallar otra afirmación, FRENÁ Y REPORTÁ.**
5. **Reportás en formato fijo**: qué arreglaste, con qué instrumento lo confirmaste, y qué te hizo frenar.

---

# FASE 1 — Los cuatro frentes

---

## Subagente A · Servicios en el árbol de accesibilidad

**Defecto 1, mitad de arriba.** Arriba de 1025, `PanelDeSecuencia` renderiza `SERVICIOS[indice]` — **uno por vez**. Visualmente es correcto: es una secuencia sincronizada y así fue diseñada. **Pero para un lector de pantalla los otros dos no existen.** 26→24 encabezados, 43→33 marcadores.

- **Los tres servicios tienen que estar en el árbol**, aunque se vea uno.
- ⚠️ **Sin romper la secuencia visual.** El mecanismo —un `sticky` largo, un progreso, tres canales— es lo que hace a esa sección, y está medido. **Si el arreglo obliga a cambiarlo, frená y reportá.**
- **Confirmalo con `test:s10-acceso`**: los encabezados tienen que volver a 26 y los marcadores a 43.

**Defecto 16.** Servicios es la única sección sin un encabezado que la nombre. Dale uno, coherente con el árbol de las otras siete.

## Subagente B · Mobile

**Defecto 4 — la pastilla no entra en un teléfono.** 600 px de piso, `absolute; left:50%; translateX(-50%)`, sin `flex-wrap`, sin tope y **sin una sola media query**. Se sale 112 px por lado a 375 y 105 a 390.

- Que entre en 375 sin desbordar. **Cómo** —envolver, achicar, o cambiar de forma abajo del umbral— lo decidís vos con criterio, y lo reportás.
- ⚠️ **Arriba de 1025 no se toca.** Su geometría está medida y aprobada por grabación.

**Defecto 3 — Trabajos deja dos pantallas de banda oscura vacía entre 768 y 1024.** `tablet:grid-cols-3` aplica desde 768 y `escritorio:min-h-0` desde 1025: **entre esos anchos nadie sostiene los 300svh.**

- El despinneo tiene que aplicar **abajo de 1025**, no abajo de 768. Es la banda que nadie miró.
- **Confirmalo con `test:s10-mobile`** en los cinco anchos.

## Subagente C · Accesibilidad

**Defecto 6 — no hay landmark `contentinfo`.** El `<footer data-pieza="pie">` vive **adentro** de `<section id="cierre">`. Sacalo afuera. ⚠️ Verificá que el Cierre siga cerrando bien sin él adentro.

**Defecto 10 — 2 landmarks donde podría haber 10.** Las ocho `<section>` no tienen nombre accesible. `aria-labelledby` apuntando al encabezado de cada una.

**Defecto 9 — no hay enlace «saltar al contenido».** Uno, visible al enfocarlo, que salte al `<main>`.

**Defecto 8 — el orden de foco no es el visual.** Las paradas 1 a 5 de 15 son la pastilla, que está al **89–92% de la primera pantalla**. El «saltar al contenido» resuelve la mayor parte; **medí si alcanza o si además hay que mover la pastilla en el documento.**

**Defecto 15 — `navigation` anidado en `main`, y no hay `banner`.** Resolvé los dos.

**Y confirmá el defecto 5** — el `<p>` de ayuda de novedades a 2,80:1. La Fase 0 lo arregla en la raíz; si no subió, **reportalo**.

**Todo se confirma con `test:s10-acceso`**: los landmarks tienen que ir de 2 a 10, y el orden de foco tiene que empezar por el contenido.

## Subagente D · La escena y la composición

**Defecto 14 — `travelX` tiene un codo en cero.** En aspecto 1,213 / 1,162, el `frameX:1` de la pose `demos` **no corre el logo ni un píxel**. La perilla lateral de la pose más íntima está inerte a 1025×900.

- **Es un defecto de la matemática, no una decisión.** Arreglalo.
- ⚠️ **No cambies ninguna pose.** Arreglás la función, no los valores. Las poses están calibradas a ojo y aprobadas por grabación.
- **Confirmá con `test:s10-logo`** que la perilla vuelve a mover el logo en los cuatro aspectos.

**Defecto 7 — la superposición del logo con el titular del diferencial.** S10 midió que **la superposición mínima sobre todas las posiciones verticales es 6–16%**: no hay alto de pantalla que deje el titular limpio. Y **el contraste ahí es 1,11:1 en el mejor píxel** — invisible.

- ⚠️ **Volvé a medirlo DESPUÉS de arreglar `travelX`.** Puede que con la perilla funcionando el titular quede limpio y el defecto desaparezca solo.
- **Si sigue, NO lo arregles.** Reportá la superposición nueva y las palancas con su número. **Es decisión del humano**, y la regla que la gobierna ya está fijada: **el texto no puede quedar encima del logo.** 1,11:1 no es un matiz.

**Defecto 18** — el recorte por arriba de `demos` (≈1%) no está declarado en ninguna línea de `choreography.ts`. **Declaralo.** Un recorte no escrito se lee como error.

**`CUADROS_DE_REANUDACION` 2 → 1.** S10 lo midió y **contradijo a §7.34**: el orden entre los dos `rAF` **sí** está determinado y r3f va primero. **Bajalo a 1**, con la medición citada. Son 16,7 ms de 33.

**§7.36 — el acoplamiento de tipo hacia `/probe-escena`**, con el costo corregido: **1 archivo, 4 líneas y DOS instrumentos reescritos**, no uno. `s9-instrumentos §2` es el que mide el acoplamiento y el arreglo le borra la premisa a cuatro afirmaciones y deja tres verdaderas por vacío. **Resolvelo con el costo real, y reescribí esas afirmaciones — no las dejes verdes por vacío.**

---

# FASE 2 — Integración (el agente principal)

1. **`npm run verificar` en cero** y el build cerrado.
2. **Corré los tres instrumentos de S10 enteros** y **reportá la tabla de antes y después, defecto por defecto.** Es el gate del sprint.
3. **Defecto 17 — Lenis viaja a `/v3` y nunca se usa**: 5,5 KiB gzip, y el dueño es el layout raíz. ⚠️ **Ese layout lo comparte el sitio vivo con clientes reales.** Es una condición, no un cambio de comportamiento — pero **verificá que las rutas del sitio viejo sigan recibiéndola**, con control positivo. Si no se puede sin tocar comportamiento, **no lo hagas y reportalo**.
4. **Reportá el peso** de `/v3` después de todo, contra los 377,4 KiB gzip.
5. **Actualizá `DIRECCION-ESCENA.md`**: qué defecto se cerró, con qué número, y cuáles quedan abiertos por decisión.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** No toques `main` ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No cambies ninguna pose de la escena, ni el ritmo del preloader, ni el anclaje.** Este sprint arregla defectos: la geometría calibrada a ojo no es un defecto.
4. **No toques el home actual, `/probe-escena` ni `home-intro/`.** `src/app/layout.tsx` solo en la Fase 2 y solo para el punto 3.
5. **Ningún arreglo cambia contenido.** Los 43 marcadores se quedan como están.
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja para que pase.** Si arreglar algo hace fallar otra, **frená y reportá**.
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio en todo lo nuevo.
10. **Regla 11:** toda cifra con su instrumento. **12:** frontera declara ventana. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No corras el dev server. No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten. Los seis heredados de la mudanza, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` y `npm run build`.
- (b) **La tabla de antes y después, defecto por defecto**, con el instrumento que lo confirma. Es el gate.
- (c) **Servicios**: los tres visibles abajo de 1025 y los tres en el árbol arriba. Con los encabezados de vuelta en 26 y los marcadores en 43.
- (d) **Los ocho niveles a 375**, antes y después, y que el techo a 1440 no se movió.
- (e) **Los landmarks**, de 2 a 10, y el orden de foco.
- (f) **`travelX` arreglado**, y la superposición del diferencial **re-medida después** del arreglo.
- (g) **El peso** contra 377,4 KiB gzip, y qué pasó con Lenis.
- (h) **TODO LO QUE FRENÓ.**
- (i) Archivos y `git status`.
- (j) Qué queda abierto por decisión.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S11: arreglos de S10"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S11-arreglos.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Sprint LARGO y AUTÓNOMO en
  TRES FASES: la fase 0 la hacés vos solo —las tres superficies compartidas—
  y nada se despacha hasta que estén; la fase 1 son cuatro subagentes; la
  fase 2 la integrás vos.
- Este sprint ARREGLA los 18 defectos que S10 midió. Un arreglo NO está
  hecho hasta que el instrumento de S10 que lo encontró lo confirme. NO
  escribas comprobaciones nuevas para los arreglos: reusá test:s10-mobile,
  test:s10-acceso y test:s10-logo, que ya tienen sus controles.
- Si arreglar algo hace fallar OTRA afirmación de S10, eso es un HALLAZGO:
  FRENÁ Y REPORTÁ. No lo aflojes.
- NO cambies ninguna pose de la escena, ni el ritmo del preloader, ni el
  anclaje, ni el contenido. La geometría calibrada a ojo no es un defecto.
  En travelX arreglás la FUNCIÓN, no los valores.
- El defecto 7 —la superposición del logo con el titular— se RE-MIDE después
  de arreglar travelX, y si sigue NO se arregla: se reporta con las
  palancas. Es decisión mía. La regla ya está fijada: el texto no puede
  quedar encima del logo, porque ahí el contraste es 1,11:1.
- NO corras el dev server, NO tomes capturas, NO abras navegador. Antes de
  cada build, el chequeo de §6.1. Si el build muere por el techo de tiempo
  del arnés y no por memoria, dale más margen al arnés, no más heap.
- NO toques el home actual, /probe-escena, home-intro/ ni los frozen.
  src/app/layout.tsx solo en la fase 2 y solo para sacar Lenis de /v3, con
  control positivo de que las rutas del sitio viejo la siguen recibiendo.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.
- EL GATE DEL SPRINT es la tabla de antes y después, defecto por defecto,
  con el instrumento que lo confirma.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
