# B2 — Los momentos

De 12,0 a ~20. La coreografía que llega cuando vos llegás.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\v3-momentos`, rama **`v3/momentos`**. Sesión en `C:\v3-momentos\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar.
- **Corre en paralelo con B3 (la escena premium), en otro worktree.**

## ⚠️ El puerto es 3001, y solo el 3001

```powershell
npm run dev -- -p 3001
```

**Todo lo que midas es en `http://localhost:3001/v3`.** Hay otra sesión con su propio dev server en el 3002: **si medís en el 3000 o en el 3002, estás midiendo el sitio de otro y no te vas a enterar.**

Chrome al frente, y la receta de `docs/rediseno/MEDICION-NAVEGADOR.md` para toda medición.

⚠️ **El chequeo de procesos antes del build cambió dos veces:** la ventana es de horas y no de día —falla justo después de medianoche— y ahora hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**. Filtrá por línea de comando, no por conteo. Y **el build va en primer plano**: tres tareas de fondo murieron sin salida en B1 y no está diagnosticado.

---

## Por qué existe este bloque

B1 midió y encontró algo que da vuelta el diagnóstico:

> **No somos largos, somos cortos y vacíos.** 14,00 pantallas contra 22,62 de nk. **12,0 momentos reales contra 20,5.** Aire muerto 31,47% contra 10,31%.
> *La resta llegó hasta donde podía. Lo que falta se gana **agregando acontecimientos**, no recomponiendo.*

**Y la restricción del anclaje deja de pesar cuando lo que se hace es sumar:** una sección o un tramo nuevos **se declaran en la misma tabla, no la contradicen.**

Más el veredicto del humano sobre el recorrido:

> *"El fondo de Star Wars avanza demasiado rápido cuando yo todavía no llegué a esa zona."*

**Momentos reales = pantallas − pantallas pinneadas + secuencias.** Una secuencia pinneada cuenta como **un** momento, no como las N pantallas que consume. `s7-ritmo.invariant` ya lo mide.

---

# FASE 0 — El principal, sin subagentes

## 0.1 La medición contra nk 🔴

**Medí en `https://nk.studio` y en `localhost:3001/v3`, con la misma herramienta, a 1440 y 1920.** No explores: **medí esto y nada más.**

| medición | por qué |
|---|---|
| **Momentos reales**, página por página de nk | La vara. `s7-ritmo` ya lo calcula para nosotros. |
| **Distancia de scroll entre momentos**, en píxeles y en pantallas | Cuánto tolera el ojo sin que pase nada. **Es el número que decide cuántos momentos faltan.** |
| **Velocidad de la escena por tramo**: cuánto se mueve la cámara por cada 100 px de scroll | El humano dice que el fondo se adelanta. Esto lo mide. |
| **Cuántos elementos entran a la vez** en un momento típico | Si es uno, o un escalonado de varios. |
| **Cuánto dura un momento**, del primer píxel de movimiento al último | |
| **Qué proporción del scroll está pinneado** | nk tiene cinco secuencias en su página de servicios; nosotros una. |

⚠️ **Se mide, no se copia.** Ni selectores, ni clases, ni valores de CSS, ni assets. Los números sí, escritos por nosotros. **Una navegación, una medición**: es un sitio ajeno en producción.

**Producto: `B2-DELTAS.md`**, con los momentos que faltan **repartidos por sección**. Es la vara de los cuatro frentes: sin eso, cada uno decide cuántos eventos agregar por gusto.

## 0.2 El techo de velocidad por tramo 🔴

**Es la queja del humano y la hacés vos, porque toca `recorrido.ts` y `anclaje.ts`, que son de todos.**

El anclaje mapea secciones a keyframes, pero **la velocidad adentro de cada tramo no tiene techo.** El arranque quedó en 2,8e+1 alturas de cuadro por unidad de progreso y es el único número del recorrido sin techo declarado.

- **Medí la velocidad real de la cámara cuadro a cuadro** durante un recorrido completo, con el navegador. En alturas de cuadro por 100 px de scroll.
- **Comparala con la de nk**, de 0.1.
- **Poné un techo derivado de la pantalla, no de la pose.** Un tramo que se pasa se estira; el progreso total no cambia.
- ⚠️ **El progreso tiene que seguir siendo monótono y exactamente reversible.** Los nueve patrones lo asumen. Verificalo con control positivo.
- **El anclaje de las ocho secciones no se mueve un bit.** Si se mueve, frená.

## 0.3 Quiénes somos — la composición primero

B1 lo dejó frenado con el orden escrito: **primero la composición entra en una pantalla, después la tabla.**

Hoy declara dos cajas de pantalla y **el hueco de la foto solo mide 987,72 px**. Con la tabla en 13 y el render en 14, el mapeo se estira hasta **900 px de desvío** entre dónde cae un tramo y dónde empieza la sección.

- **Que la composición entre en una pantalla.** El hueco de la foto se dimensiona por su relación de aspecto, no por media pantalla.
- **Recién con eso medido, bajá la tabla a 100svh** y verificá que el desvío de los cuatro tramos vuelva a cero.
- **Si el desvío no vuelve a cero, revertí las dos cosas y reportá.**

## 0.4 Reglas para todo subagente

1. **Escribís SOLO en tus secciones.** Si necesitás `anclaje.ts`, `recorrido.ts` o `secciones.ts`, **reportalo**: son de la Fase 0.
2. **Usás `B2-DELTAS.md` como vara.** No tu gusto.
3. **Los patrones que consumís ya existen.** P1 a P9 están construidos y medidos. **No inventes uno nuevo**: si ninguno sirve, **frená y reportá.**
4. **Medís sobre el píxel real, en el 3001.** Captura de antes y después a 1920.
5. **No cambiás contenido.** Los marcadores se quedan.
6. **Cero valores fuera de los tokens.**
7. **Reportás:** momentos antes y después, qué patrón usaste en cada uno, y la distancia de scroll entre momentos consecutivos.

---

# FASE 1 — Cuatro frentes

⚠️ **La regla que gobierna a los cuatro:** un momento es **algo que pasa cuando el visitante llega a un lugar**. No es una animación más: es que **algo cambie de estado y se note.** Si agregás un evento que nadie nota, no sumaste un momento, sumaste trabajo.

## Subagente A · Hero + Quiénes somos

**Hero:** hoy es un momento —la entrada del titular— y la escena en reposo. Es `papel-transparente` y la escena llena. **Puede tolerar uno más**, y el candidato natural es la bajada y el CTA entrando **después** del titular, no con él.

**Quiénes somos:** la Fase 0 la va a dejar en una pantalla. Con eso, **un momento por bloque de texto** con P2 escalonado, y la foto entrando aparte.

## Subagente B · Números + Trabajos

**Números:** las cinco cifras **no van en grilla** — dispersas, asimétricas, tamaños distintos, y eso está medido. Hoy entran con P2 escalonado, que es **un** momento. **Cinco cifras entrando de a una, cada una en su lugar del scroll, son cinco momentos.** Es la sección con más ganancia por menos trabajo.

**Trabajos:** ya tiene P7 con su rampa de 268 px, y está pinneada sobre 2.160 px. **Tres proyectos son tres momentos, no uno.** Cada uno llega, se queda, y sale. Verificá con scroll real que los tres se lean por separado.

## Subagente C · Servicios

**Es la sección más coreografiada del sitio de referencia y la que más lejos está.** nk tiene **cinco secuencias pinneadas** ahí y el 60% de las instancias de un patrón entero. Nosotros tenemos **una**.

- **Hoy es un `sticky` con un progreso y tres canales sincronizados** — nombre, panel y párrafo con resaltado. Eso es correcto y **no se rompe.**
- **Lo que falta son momentos adentro de esa secuencia:** cada servicio es un momento, y **adentro de cada servicio la lista puede entrar con P4** — los ítems subiendo 100 px reales, muy frenados. Es el único uso de `power4.out` del corpus y su lugar natural es una lista.
- **El resaltado progresivo palabra por palabra (P3)** ya está. Verificá que se lea, con scroll real.
- ⚠️ **El hueco del `[VIDEO]` volvió a su tamaño grande en B1, a propósito.** No lo achiques: es lo único que le da tinta a esas filas hasta que haya video.

## Subagente D · Tu panel + Por qué develOP + Cierre

**Tu panel:** 200svh y 43,70% de aire. **Es la que más pide una secuencia** y hoy no tiene ninguna. Su contenido es una lista de capacidades: P4, con los ítems entrando.

**Por qué develOP:** `papel-transparente`, la escena vuelve, el ancla en 0,8525. **La vuelta de la escena es un momento en sí mismo** — verificá que se lea como llegada. Los cuatro diferenciales pueden entrar de a uno.

**Cierre:** 57,59% de aire, el peor que queda. El titular, el CTA y las columnas del pie **entran hoy juntos**. Separalos.

---

# FASE 2 — Integración

1. **`npm run verificar` en cero**, el build **en primer plano**, y `test:frontera`.
2. **`s7-ritmo.invariant`: los momentos antes y después**, contra los 20,5 de nk. **Es el gate del bloque.**
3. **La distancia máxima de scroll entre dos momentos consecutivos**, antes y después, contra nk.
4. **La velocidad de la escena por tramo**, con su techo, contra nk.
5. **El anclaje de las ocho secciones: que no se movió un bit.**
6. **Las capturas** y **un recorrido grabado**, si la herramienta lo permite.
7. **Actualizá `DIRECCION-ESCENA.md` y `B2-DELTAS.md`.**

---

## Reglas absolutas

1. **Rama `v3/momentos`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **No toques `_lib/escena/`** — es de B3, que corre en paralelo. Si lo necesitás, **frená y reportá.**
3. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
4. **No toques ninguna pose**, ni el preloader, ni el contenido, ni el home actual, ni `/probe-escena`.
5. **De nk se MIDE, no se copia.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío.**
9. **Regla 11:** toda cifra con su instrumento — y la captura es evidencia. **15:** se afirma contra la propiedad, no contra el literal.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No auto-confirmás que se ve bien.** Podés decir "los momentos pasaron de 12,0 a 19,5". No podés decir "queda premium".
12. Archivos de más de 300 líneas se parten.
13. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y si un `workflow` devuelve `completed` en pocos segundos, **eso no es que terminó**.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `verificar`, build y `frontera`.
- (b) **`B2-DELTAS.md`**: la medición contra nk.
- (c) **Momentos antes y después**, por sección y total, contra 20,5.
- (d) **La distancia máxima entre momentos**, contra nk.
- (e) **La velocidad por tramo con su techo**, medida cuadro a cuadro, contra nk.
- (f) **Quiénes somos**: si entró en una pantalla y si el desvío volvió a cero.
- (g) **El anclaje**: que no se movió un bit.
- (h) **Qué patrón usó cada momento nuevo.**
- (i) Capturas, archivos y `git status`.
- (j) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B2: los momentos"` → `git push -u origin v3/momentos`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B2-momentos.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\v3-momentos, rama v3/momentos. Corre EN PARALELO con otro
  sprint en C:\v3-escena-premium.
- ⚠️ TU PUERTO ES EL 3001 Y SOLO EL 3001: npm run dev -- -p 3001. La otra
  sesión usa el 3002. Si medís en otro puerto estás midiendo el sitio de
  otro y no te vas a enterar.
- TRES FASES: la fase 0 la hacés vos solo —la medición contra nk, el techo
  de velocidad y la composición de Quiénes somos— y nada se despacha hasta
  que B2-DELTAS.md exista. La fase 1 son cuatro subagentes. La fase 2 la
  integrás vos.
- La métrica de este bloque son MOMENTOS, no aire muerto. B1 midió que no
  somos largos sino cortos y vacíos: 14,00 pantallas contra 22,62 y 12,0
  momentos contra 20,5. Lo que falta se gana AGREGANDO acontecimientos.
- Un momento es algo que PASA cuando el visitante llega a un lugar. Si
  agregás un evento que nadie nota, no sumaste un momento: sumaste trabajo.
- Los nueve patrones YA EXISTEN y están medidos. No inventes uno nuevo: si
  ninguno sirve, FRENÁ Y REPORTÁ.
- El humano dice que el fondo se adelanta antes de que él llegue. Medí la
  velocidad de la cámara CUADRO A CUADRO con el navegador, comparala con
  nk, y poné un techo derivado de la pantalla. El progreso tiene que seguir
  siendo monótono y reversible, y el anclaje de las ocho secciones no se
  mueve un bit.
- De nk se MIDE, no se copia: ni un selector, ni una clase, ni un asset.
  Una navegación, una medición: es un sitio ajeno en producción.
- NO toques _lib/escena/: es del sprint paralelo. Tampoco poses, preloader,
  contenido, el home actual, /probe-escena ni los frozen.
- El hueco del [VIDEO] de Servicios volvió a ser grande en B1 A PROPÓSITO:
  no lo achiques, es lo único que le da tinta a esas filas hasta que haya
  video.
- El build va EN PRIMER PLANO: tres tareas de fondo murieron sin salida en
  B1. Y el chequeo de procesos filtra por LÍNEA DE COMANDO, no por conteo:
  hay tres node permanentes que son chrome-devtools-mcp y NO se matan.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento, y la captura es evidencia.
- Git: commit y push en v3/momentos. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- Si morís por cuota, no des por hecho tu trabajo: reportá qué falta. Y un
  workflow que devuelve "completed" en pocos segundos NO terminó.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
