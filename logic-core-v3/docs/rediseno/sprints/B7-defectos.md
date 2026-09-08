# B7 — Los defectos abiertos

Quince que están anotados, y el primero es que el sitio no honra una preferencia de accesibilidad.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-defectos`, rama **`v3/defectos`**. Sesión en `C:\v3-defectos\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es corta y bloqueante: el inventario antes de despachar.
- **Corre en paralelo con B6-A (la escena persistente), en otro worktree.**

## ⚠️ El puerto es 3002

```powershell
npm run dev -- -p 3002
```

La otra sesión usa el 3001. Chrome **al frente** — con `visibilityState: "hidden"` no corre `requestAnimationFrame` y medís una página congelada. Receta en `docs/rediseno/MEDICION-NAVEGADOR.md`.

## ⚠️ La zona prohibida, y es lo que hace posible el paralelo

**La otra sesión está abriendo la escena en Trabajos y en el Cierre, y construyendo una superficie nueva.**

**No toques, por ninguna razón:**

- **`_secciones/trabajos/`** ni **`_secciones/cierre/`**
- **El pie**, que vive adentro del Cierre
- **`superficies.ts`**, la tabla de superficies, ni nada del contrato que las declare
- **`_lib/escena/`** — la escena es de ella

**Si un defecto de tu lista cae en esa zona, NO lo arregles: dejalo anotado como diferido con su razón.** Chocar acá cuesta más que el defecto.

⚠️ **El build en primer plano**, con `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`. El chequeo de procesos **por ruta de worktree, no por comando**: hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**, y el filtro por comando ya mató una vez el envoltorio de la sesión vecina.

⚠️ **Nunca `git stash`, `checkout`, `restore`, `reset` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

⚠️ **El búfer de WebGL no se lee desde la página.** Toda medición de la escena va por `Page.captureScreenshot`.

---

# FASE 0 — El inventario (el principal, sin subagentes)

**No listo los defectos acá a propósito: están escritos en el repo y la lista de memoria envejece.**

## 0.1 Leelos de donde viven

- **El reporte de B4-B** en `docs/rediseno/outputs/` — los trece, con su gravedad, su causa y su costo.
- **`DIRECCION-ESCENA.md` §7** — la deuda numerada de veinte sprints.
- **El reporte de B5** — `D-B5.1` a `D-B5.5`.
- **Los reportes de B4-A y B2** — lo que quedó anotado como pendiente.

## 0.2 Verificá que sigan vigentes

⚠️ **B5 tocó el scroll, la escena y el cursor. Algunos defectos pueden haberse arreglado solos, y otros pueden haber cambiado de forma.**

**Reproducí cada uno antes de darlo por cierto.** Un defecto que ya no se reproduce no se arregla: **se cierra con la medición que lo desmiente.**

## 0.3 Reportá la lista

Ordenada **por gravedad, no por origen**, y con tres columnas: **el defecto, si se reproduce hoy, y si cae en la zona prohibida.**

## 🛑 PARADA 1 — corta y bloqueante

Esperá el OK antes de despachar. **Es para que yo vea qué se arregla y qué se difiere**, no para discutir el plan.

---

# FASE 1 — Los frentes

**Repartilos vos según la lista real**, con estas cuatro familias como guía y con **`_lib/motion/` reservado enteramente al frente A** para que nadie más lo toque.

---

## Subagente A · Que el sitio honre `prefers-reduced-motion` 🔴

**Es el defecto más grave del inventario y no es cosmético: es accesibilidad.**

B4-B lo midió: **2.380 transformadas en línea, idénticas con y sin la preferencia**, con `matchMedia` devolviendo `true`. **El sitio ignora la preferencia.**

Y lo peor es cómo se sostuvo: `reducido.invariant.tsx` **estaba en verde** porque renderizaba a través de `<MotionConfig reducedMotion={preferencia}>` — **forzaba el valor que después afirmaba.** Probaba el mecanismo de forzado, no el sitio.

De ahí salió una regla nueva del proyecto:

> **«Verde por arnés»** — hermana de «verde por vacío» y distinta: aquél pasa porque no mide nada, éste porque **mide algo real que no es lo que se quería saber.**
> **El discriminador es una pregunta: ¿qué parte de esta afirmación la puso el propio instrumento?**
> **Ninguna entrada que venga de afuera del árbol —preferencia, breakpoint, `matchMedia`, variable de entorno— se puede cerrar en un render forzado.**

### Las dos mitades, y las dos son obligatorias

**Que la preferencia se honre de verdad.** Con ella activa, los nueve patrones no se montan y el contenido aparece en su estado final. **No es "más rápido": es que no existen.** El divisor de líneas tampoco corre.

**Y el invariante se fortalece, nunca se afloja.** La preferencia se lee del entorno —`Emulation.setEmulatedMedia` sobre un Chrome propio por CDP, como hizo B5— **jamás se fuerza en un render.**

⚠️ **B5 ya dejó tres piezas honrando la preferencia**: el scroll suave, el cursor y la escena. **No las rompas, y reusá su plomería** — `scripts-b5/cdp.ts` y `navegador.ts` ya resuelven la emulación.

⚠️ **Y verificá el contenido, no solo la ausencia de movimiento.** Un patrón que no se monta puede dejar su elemento en `opacity: 0` para siempre. **La prueba es que el texto esté visible y legible**, no que nada se mueva.

---

## Subagente B · El pin de Servicios

B4-B lo midió sin pegarse. **Pero fue honesto y no afirmó regresión:**

> *B1 publicó ese pin andando y hoy no anda, pero si cambió la composición o si B1 midió otro elemento no lo determina esta medición — hace falta el diff de Servicios.*

⚠️ **Empezá por ese diff. No asumas que se rompió.**

- **Qué cambió en Servicios** entre el commit de B1 y hoy.
- **Si B1 y B4-B midieron el mismo elemento.** Un `sticky` tiene un hijo que se pega y un padre que le da recorrido: **medir el equivocado da cero sin que nada esté roto.**
- **Y recién con eso, el veredicto:** está roto, o nunca lo estuvo y la medición apuntaba a otro lado.

**Si está roto, arreglalo.** Servicios es la sección más coreografiada del sitio: un `sticky` largo, un progreso y tres canales sincronizados. **Ese mecanismo no se rediseña.**

⚠️ **Verificá con scroll real**, no con geometría. Y con la comprobación que barre el pin entero.

---

## Subagente C · El texto que está al borde

**`D-B5.1`:** el cuerpo de 15 px del diferencial tiene **mediana 4,65:1 y 33% de sus píxeles bajo 4,5:1**, con el puntero quieto. No lo introdujo B5 — **es preexistente** — y hoy actúa de techo del paralaje: por eso ese tramo va a 8° y el hero a 22°.

- **Reproducilo** y medí el margen real.
- **Las palancas, en orden:** el tamaño del cuerpo, su color, dónde cae respecto de la escena, o su ancho de columna. ⚠️ **El acento no puede ser texto sobre fondo oscuro** — 2,71 · 2,99 · 2,46.
- **Y si al arreglarlo el tramo aguanta más paralaje**, decilo con el número: eso reabre `D-B5.4`.

**Más `tu-panel`, que B4-B no pudo asentar a 1920**, y cualquier otro bloque de texto que la lista marque al borde.

⚠️ **El diferencial es `papel-transparente` hoy y no cambia de superficie**: no toques su superficie, solo su texto.

---

## Subagente D · El rendimiento y los instrumentos

**El LCP.** B4-B midió **2.378 ms de mediana con una corrida en 2.524**, que cruza el techo de 2,5 s. **El elemento es el `<h1>` del hero — texto, no imagen ni canvas.**

⚠️ **Y hay un matiz medido en B5 que hay que respetar:** el `<h1>` **sale del servidor con la clase del titular grande** y recién cambia a `sr-only` de 1×1 al hidratar. **En el instante que el LCP mide, es el titular.** La conclusión de B4-B se sostiene. **Lo que es un defecto es cruzar los dos estados** — una medición de píxel que lea el `<h1>` después de hidratar ve 1×1, y el instrumento de B5 cayó en eso.

- **Reproducí el LCP con la línea de base de hoy** — B5 midió 392 ms sobre `next dev`, que **no es comparable** con los 2.378 de producción. **Medí sobre un build.**
- **Y si cruza, qué lo demora:** las fuentes, el bundle, la hidratación.
- ⚠️ **Sentry son 142,1 KiB y no se puede diferir:** sin `init`, `global-error.tsx` descarta el evento devolviendo un id igual y no avisa en producción. **Eso está cerrado y no se reabre.**

**`D-B5.5` — el cuadro largo.** Un cuadro de ≈26,7 ms en dos de tres recorridos, **siempre cerca del cuadro 439**, y ausente en tres de tres con la preferencia activa. **Es sistemático y no está aislado a cuál de las tres piezas lo causa.**

⚠️ **Y tiene una sospecha sobre el propio instrumento**: el barrido conduce con `scrollBy`, no con rueda. **Descartá eso primero.**

**Y los instrumentos que quedaron con deuda:** las capturas de anclas que B4-B no tomó, los docblocks vencidos, y cualquier afirmación que la lista marque como que describe un mundo que ya no existe. ⚠️ **Ésas se reescriben contra la propiedad nueva, no se borran** — regla 15.

---

# FASE 2 — Integración

1. **`verificar` en cero**, build en primer plano, y `frontera`.
2. **La tabla de antes y después**, defecto por defecto, con el instrumento que lo confirma. **Es el gate del bloque.**
3. **Los diferidos**, con su razón — los de la zona prohibida y los que no se reproducen.
4. **Lo que se cerró sin arreglar** porque la medición lo desmintió, con el número.
5. **`DIRECCION-ESCENA.md` §7 al día.**

---

## Reglas absolutas

1. **Rama `v3/defectos`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. ⚠️ **La zona prohibida de arriba**: Trabajos, Cierre, el pie, las superficies y `_lib/escena/`. **Son de la sesión vecina.**
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques ninguna pose, ni el anclaje, ni `recorrido.ts`, ni el preloader, ni el contenido, ni el home actual, ni `/probe-escena`.**
5. ⚠️ **`src/app/layout.tsx` y `src/lib/` los comparte el SITIO VIVO con clientes reales.** Si un arreglo toca ahí: **cambiás cómo se importa, nunca qué renderiza**, y verificás que las rutas viejas no cambien de comportamiento, con control positivo. Si no se puede sin cambiar comportamiento, **frená y reportá.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** Si describe una decisión que cambió, **se reescribe contra la propiedad nueva** — regla 15.
9. **Ninguna comprobación verde por vacío, ni verde por arnés.**
10. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
14. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y un `workflow` que devuelve `completed` en pocos segundos **no terminó.**

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build y `frontera`.
- (b) **La tabla de antes y después**, con el instrumento de cada uno.
- (c) **`prefers-reduced-motion`**: que se honra, que el contenido queda legible, y el invariante fortalecido **sin arnés**, verificado por CDP.
- (d) **El pin de Servicios**: el diff, el veredicto, y con scroll real.
- (e) **El diferencial**: el margen antes y después, y si aguanta más paralaje.
- (f) **El LCP** sobre un build, contra 2.378 ms, con lo que lo demora.
- (g) **`D-B5.5`**: si es real o del instrumento, con el número.
- (h) **Los diferidos**, y **los cerrados sin arreglar** por medición.
- (i) Archivos y `git status`.
- (j) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B7: los defectos abiertos"` → `git push -u origin v3/defectos`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B7-defectos.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-defectos, rama v3/defectos. Corre EN PARALELO con otra
  sesión en C:\v3-escena-viva que está abriendo la escena en Trabajos y en
  el Cierre.
- ⚠️ TU PUERTO ES EL 3002. La otra usa el 3001. Chrome AL FRENTE.
- ⚠️ ZONA PROHIBIDA, y es lo que hace posible el paralelo: NO toques
  _secciones/trabajos/, _secciones/cierre/, el pie, superficies.ts ni
  _lib/escena/. Si un defecto cae ahí, DEJALO DIFERIDO con su razón.
- La FASE 0 es leer el inventario DE DONDE VIVE —el reporte de B4-B,
  DIRECCION-ESCENA.md §7, el reporte de B5— y VERIFICAR QUE CADA DEFECTO SE
  REPRODUZCA HOY. B5 tocó el scroll, la escena y el cursor: algunos pueden
  haberse arreglado solos. Un defecto que ya no se reproduce se CIERRA con
  la medición que lo desmiente, no se arregla.
- La PARADA 1 es corta y bloqueante: quiero ver la lista antes de que
  despaches.
- EL DEFECTO MÁS GRAVE es que el sitio NO honra prefers-reduced-motion:
  2.380 transformadas idénticas con y sin la preferencia. Y se sostuvo
  porque su invariante renderizaba a través de MotionConfig con la
  preferencia forzada: afirmaba sobre el valor que él mismo ponía.
  Tiene DOS MITADES OBLIGATORIAS: que se honre de verdad, y que el
  invariante SE FORTALEZCA, jamás se afloje. La preferencia se lee del
  ENTORNO por CDP, nunca se fuerza en un render.
  Y verificá el CONTENIDO, no solo la ausencia de movimiento: un patrón que
  no se monta puede dejar su elemento en opacity 0 para siempre.
- El pin de Servicios: EMPEZÁ POR EL DIFF. B4-B lo midió sin pegarse pero
  NO afirmó regresión. Un sticky tiene un hijo que se pega y un padre que le
  da recorrido: medir el equivocado da cero sin que nada esté roto.
- El LCP se mide SOBRE UN BUILD. Los 392 ms de B5 son sobre next dev y no
  son comparables con los 2.378 de producción. Sentry no se difiere y eso
  está cerrado.
- D-B5.5 tiene una sospecha sobre el propio instrumento —el barrido conduce
  con scrollBy, no con rueda—: descartala primero.
- src/app/layout.tsx y src/lib/ los comparte el SITIO VIVO con clientes
  reales: cambiás CÓMO se importa, nunca QUÉ renderiza, con control
  positivo. Si no se puede sin cambiar comportamiento, FRENÁ Y REPORTÁ.
- NO toques poses, anclaje, recorrido.ts, el preloader, el contenido, el
  home actual, /probe-escena ni los frozen.
- Ninguna afirmación se afloja: si describe una decisión que cambió, se
  reescribe contra la propiedad nueva. Ninguna comprobación verde por vacío
  ni verde por arnés.
- El build en primer plano. El chequeo de procesos por RUTA DE WORKTREE, no
  por comando: el filtro por comando ya mató el envoltorio de la sesión
  vecina.
- NUNCA git stash, checkout, restore ni ninguna escritura de git en el
  árbol. Para leer HEAD: git show HEAD:<ruta>.
- Git: commit y push en v3/defectos. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- EL GATE DEL BLOQUE es la tabla de antes y después, defecto por defecto,
  con el instrumento que lo confirma.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
