# B12 — El último de la etapa

Trabajos como tiene que ser, el pie transparente, los rótulos afuera, y el sitio poblado para poder verlo.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Las cuatro partes se tocan: los rótulos cambian la composición de las ocho, Trabajos se reestructura, y el contenido se acomoda a lo que quede. Los subagentes trabajarían sobre un terreno que se mueve.
- **NO Fable.** Sin cuota semanal.
- **Worktree:** `C:\v3-cierre-etapa`, rama **`v3/cierre-etapa`**. Sesión en `C:\v3-cierre-etapa\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera después de la composición, **antes** de poblar: si Trabajos sale mal, el contenido encima solo hace más difícil verlo.
- **Dev server en el 3000**, Chrome **al frente**.
- ⚠️ **El búfer de WebGL no se lee desde la página.** Todo por `Page.captureScreenshot`.
- ⚠️ **El build en primer plano**, `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, con Chrome cerrado y el chequeo de procesos **por ruta de worktree**. La máquina tiene 16 GB y el arnés ya mató corridas tres veces.
- ⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# Qué pidió el humano

Grabó el sitio completo y pidió cinco cosas. **Es el último bloque planificado de la etapa**: después vienen iteraciones sueltas, el contenido real de Franco y el lanzamiento.

---

# §1 · Los rótulos de sección se van

> *"Sacar los textitos como «quiénes somos» y el número de sección «02», ya que no será necesario ubicarlo así: directamente llega el título con su respectiva sección."*

Hoy cada sección abre con **un número** —`01`, `02`— y **un rótulo en micro** —`QUIÉNES SOMOS`, `NÚMEROS`. **Los dos se van, en las ocho.**

- **El título de cada sección pasa a ser lo primero que aparece.**
- ⚠️ **Verificá qué se lleva puesto.** El rótulo aparece 29 veces según la medición, y hay afirmaciones que lo cuentan. **Ésas se reescriben contra la propiedad nueva, no se borran** — regla 15.
- ⚠️ **Y el árbol de accesibilidad.** Si el rótulo era el nombre accesible de la sección vía `aria-labelledby`, **sacarlo deja once landmarks sin nombre.** El título toma ese rol. **Verificalo con el instrumento de accesibilidad que ya existe.**
- ⚠️ **La composición se corre.** Sacar dos líneas de arriba mueve todo lo de abajo, y eso mueve **el acontecimiento de la sección**. Corré el censo antes y después, contra **1,33 a 1920 y 1,20 a 1440**.
- **Y el contraste**: el título sube a donde antes estaba el rótulo. **Puede caer sobre el logo.** Medilo con el método del glifo en las ocho.

---

# §2 · El pie, transparente de verdad

> *"El tema del footer también, sigue con el fondo oscuro, tiene que ser transparente."*

**La causa ya está diagnosticada** y no es la superficie: **`chrome/Pie.tsx` pinta `var(--color-fondo)` y envuelve la sección entera.** La sala nunca se vio detrás del Cierre, ni con velo ni sin él.

- **Sacale el relleno al pie.**
- ⚠️ **Y ahí aparece lo que estaba tapado:** está medido que sin relleno **el Cierre falla por luz o por el formulario**, no por el logo. Con la sala iluminada al final y tinta clara encima, el contraste no cierra.
- **Las palancas, y elegí con el número:**
  - **La tinta del pie se da vuelta**: si la sala al final es clara, el pie es papel y no noche. ⚠️ **Es la más grande y cambia el carácter del cierre.**
  - **El formulario lleva su propio fondo sólido.** Un campo de texto sobre una escena en movimiento es lo más difícil de este bloque, y darle fondo es legítimo.
  - **Cada bloque medido por separado**: siete anclas, dos columnas de contacto, el formulario y el legal. **Es la sección con más superficie de texto del sitio.**
- **Si ninguna combinación cierra, frená y reportá** con la tabla. Es decisión de dirección.

---

# §3 · Trabajos 🔴

**Es la parte más grande del bloque.** El humano pidió cuatro cosas y hay que leerlas juntas:

> *"Debe quedar full negro atrás y luego en la próxima sección volver al transparente. Habría que reacomodar la parte Star Wars antes de otra sección y luego una previa al blanco, así queda tal cual como en nk. Que la transición de escena a Star Wars tenga un efecto de gota o algo exótico y deluxe. Que esté centrado todo lo del portfolio. Y que no haya info arriba de eso, sino que la info venga como las imágenes."*

## 3.1 Negro pleno

Hoy Trabajos es oscuro con el sol bajo. **El humano quiere negro de verdad**, como el campo de estrellas de la referencia.

- **El sol al mínimo en ese tramo**, no un velo. La oscuridad la da la luz — es la lección de B8.
- **Y las partículas tienen que verse**: sobre negro, emisivas, en blanco. **Cero color** — las de la referencia son verdes porque su mundo es verde.
- ⚠️ **Verificá que con el sol al mínimo no se pierdan la celosía ni el moiré** en los tramos vecinos, y que el arco siga contando algo. B8 ya diseñó esa curva: **la estás llevando más lejos en un punto, no rehaciéndola.**

## 3.2 Las dos transiciones

**Entrar al negro y salir de él**, y las dos tienen que verse.

- **La entrada: el efecto de gota.** La referencia lo hace con un `ShaderMaterial` de pantalla completa que mezcla dos estados, 1.111 ms, medido por Franco.
- ⚠️ **Y no arranques de cero: B3 ya construyó un revelado** para cuando la escena vuelve después de Tu panel. **Es el mismo mecanismo con otra forma.** Reusalo o extendelo.
- **La salida hacia Servicios, que es blanco.** El humano lo pidió explícito: *"una previa al blanco"*. **Del negro no se puede saltar al papel de golpe** — necesita su propio tramo de vuelta.
- **Medí en la referencia cómo entra y cómo sale** de su sección oscura: cuánto dura, qué se mueve, si es una forma reconocible o un desvanecimiento. **Una navegación, una medición.**

## 3.3 Centrado, y la info entra con las imágenes

- **Todo el portfolio centrado**, como la referencia.
- ⚠️ **Y el título y la bajada dejan de estar arriba.** Hoy están fijos en el tope y los proyectos entran debajo. **El humano quiere que la info entre como las imágenes**: que el nombre del proyecto y su métrica lleguen **con** su plano, no antes.
- **Eso cambia la estructura de la sección**, no solo su posición. Cada proyecto pasa a ser una unidad: plano + nombre + métrica, entrando juntos.
- ⚠️ **Sin romper lo que ya está calibrado:**
  - **La meseta de B4-A**: cada proyecto llega, **se queda**, y sale, y **nunca los tres invisibles a la vez.** Su comprobación barre el pin entero.
  - **El lente de P7**: los −3000 px caen a 63,6 unidades, adentro de la pared del fondo. **Eso está bien y no se toca.**
  - **El techo de velocidad de B2**, en 4,6531.

## 🛑 PARADA 1 — antes de poblar

- (a) **Los rótulos afuera**, con el censo antes y después y el contraste de los títulos en las ocho.
- (b) **El pie**: qué palanca elegiste y la tabla de cada bloque.
- (c) **Trabajos**: capturas de antes y después, el negro medido, las dos transiciones, y la meseta todavía en verde.
- (d) **Lo que frenó.**

Esperá el OK. **Si Trabajos sale mal, es mejor verlo sin contenido encima.**

---

# §4 · El contenido de mentira 🔴

> *"Un sprint de agregación de contenido placeholder para ir viendo cómo queda el sitio, agregando fotos y textos que agregue la inteligencia artificial conforme a nuestra marca y lo que hacemos —todas mentiras e inventos por ahora, luego los modificaré— para ver el estado de la página final."*

**Es un pedido legítimo y hay que hacerlo bien.** Pero develOP tiene **deuda registrada por cifras fabricadas** en sus cuatro landings viejas, y existe un escáner que las rechaza. **Esto las mete a propósito.**

## ⚠️ 4.1 La llave, y va primero

**Antes de escribir una sola cifra falsa:**

- **Una constante `CONTENIDO_INVENTADO`**, en un módulo propio, prendida.
- **Todo el contenido de mentira vive detrás de ella.** Con la llave apagada, **vuelven los marcadores** — `[CIFRA]`, `[MÉTRICA]`, `[TESTIMONIO]`. Nada se pierde.
- **Una comprobación que FALLE si la llave está prendida y se intenta un build de producción.** El lanzamiento no puede ocurrir con esto adentro, y **acordarse no es un mecanismo.**
- **Y una marca visible en pantalla** mientras la llave esté prendida: una franja, un borde, algo que no se pueda confundir con el sitio terminado.

⚠️ **El escáner de contenido inventado NO se afloja.** Sigue corriendo sobre el contenido real. Lo que cambia es que **el contenido de mentira es otro archivo y él lo sabe.**

## 4.2 Qué inventar

**Conforme a la marca y a lo que develOP hace:** sitios web, automatizaciones e inteligencia artificial para PyMEs, desde Tucumán, con dos personas.

- **Las cifras de Números** — cinco, con sus rótulos que ya existen.
- **Las métricas de los tres proyectos** — Esquina, El Garage y Banú. ⚠️ **Los tres clientes son reales y sus nombres se usan.** Lo inventado son las métricas.
- **El testimonio del diferencial**, con un nombre inventado que **no pueda confundirse con una persona real**.
- **Los textos que hoy son relleno**, mejorados: la voz es rioplatense, directa, sin marketinés.
- **Las fotos**: el equipo, los paneles de Servicios, lo que haga falta.

## 4.3 Las fotos ⚠️

**No hay cómo generar fotos reales acá, y no se descargan de internet** — ni de bancos de imágenes, ni de ningún lado. Es propiedad de terceros y el sitio es comercial.

**Lo que sí:**

- **Placeholders que respeten la relación de aspecto y el peso** de una foto real, para que la composición se pueda juzgar.
- **En blanco y negro, con la paleta**, para que no desentonen.
- ⚠️ **Y que se vean como placeholders**, no como fotos. Si parecen reales, el humano va a juzgar una composición que no existe.
- **Con `sizes` real y dimensiones declaradas**, como el componente exige.

## 4.4 Y el peso

⚠️ **El presupuesto tiene 8,6 B de aire.** Texto real pesa más que un marcador.

**Todo lo que agregue el contenido de mentira se declara aparte** — no como montaje del lane, sino como **peso de la llave**, que se va cuando la llave se apaga. **No subas el techo.**

---

## Reglas absolutas

1. **Rama `v3/cierre-etapa`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No toques el anclaje, ni el progreso, ni los rangos de los patrones, ni el preloader, ni el home actual, ni `/probe-escena`, ni `scene-camera.ts`.**
4. ⚠️ **El arco del sol se toca SOLO en el tramo de Trabajos y sus dos transiciones.** El resto de la curva es de B8 y está aprobada.
5. **Cero color.** Blanco y negro, sin excepción.
6. **Ninguna imagen de terceros.** Ni bancos, ni descargas, ni assets de la referencia.
7. **De la referencia se MIDE, no se copia.** Una navegación, una medición.
8. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
9. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
10. **Ninguna afirmación se afloja.** Las que describan una decisión que cambió **se reescriben contra la propiedad nueva** — regla 15.
11. **Ninguna comprobación verde por vacío, ni verde por arnés.**
12. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado.
13. **PowerShell:** no hay `&&`, no hay heredoc.
14. **No auto-confirmás que se ve bien.** Podés decir *"el negro de Trabajos pasó de 31 a 4 de luminancia media"*. **No podés decir "ahora sí se parece a la referencia".**
15. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
16. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **La llave**: que existe, que apagarla devuelve los marcadores, que hay marca visible, y **que la comprobación de lanzamiento falla con ella prendida.** Con control positivo.
- (c) **Los rótulos**: las ocho, el censo antes y después, el contraste de los títulos, y los landmarks todavía con nombre.
- (d) **El pie**: la tabla por bloque y la palanca elegida.
- (e) **Trabajos**: el negro medido, las dos transiciones con su duración, el centrado, la info entrando con los planos, y la meseta en verde.
- (f) **El contenido**: qué se inventó, dónde vive, y la lista de lo que sigue siendo real.
- (g) **El peso de la llave**, aparte del montaje del lane, contra los 8,6 B de aire.
- (h) **Capturas de antes y después** de las ocho, a 1440 y 1920.
- (i) **Que el anclaje, el progreso y los rangos no se movieron un bit.**
- (j) Archivos y `git status`.
- (k) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B12: el cierre de la etapa"` → `git push -u origin v3/cierre-etapa`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B12-cierre-de-etapa.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-cierre-etapa, rama v3/cierre-etapa. Dev server en el 3000,
  Chrome al frente. NO uses subagentes: las cuatro partes se tocan entre sí.
- ⚠️ LA PARADA 1 VA ANTES DE POBLAR. Si Trabajos sale mal, es mejor verlo
  sin contenido encima.
- ⚠️ LA LLAVE VA ANTES DE ESCRIBIR UNA SOLA CIFRA FALSA. develOP tiene deuda
  registrada por cifras fabricadas y esto las mete a propósito. Constante
  CONTENIDO_INVENTADO, todo detrás de ella, apagarla devuelve los
  marcadores, marca visible en pantalla mientras esté prendida, y una
  comprobación que FALLE si se intenta un build de producción con ella
  encendida. Acordarse no es un mecanismo.
- El escáner de contenido inventado NO se afloja: sigue corriendo sobre el
  contenido real.
- NINGUNA IMAGEN DE TERCEROS. Ni bancos, ni descargas, ni assets de la
  referencia. Placeholders con la relación de aspecto y el peso de una foto
  real, en blanco y negro, y QUE SE VEAN COMO PLACEHOLDERS: si parecen
  fotos, el humano juzga una composición que no existe.
- Los tres clientes son REALES —Esquina, El Garage, Banú— y sus nombres se
  usan. Lo inventado son las métricas.
- Los rótulos de sección («02», «QUIÉNES SOMOS») se van en las ocho. Ojo con
  lo que se llevan: había afirmaciones que los contaban y pueden ser el
  nombre accesible de los landmarks. Se reescriben contra la propiedad
  nueva, no se borran, y el título toma ese rol.
- El pie: sacale el relleno a chrome/Pie.tsx, que es la causa real de que la
  sala nunca se viera detrás del Cierre. Y ahí aparece lo que estaba tapado:
  medí cada bloque y elegí la palanca con el número. Si ninguna cierra,
  FRENÁ Y REPORTÁ.
- Trabajos: negro pleno POR LA LUZ, no por un velo —el sol al mínimo en ese
  tramo— con las partículas emisivas en BLANCO, cero color. Dos
  transiciones: la gota al entrar y una vuelta antes del blanco de
  Servicios. NO arranques de cero: B3 ya construyó un revelado y es el mismo
  mecanismo con otra forma.
- Trabajos centrado, y el título y la bajada DEJAN DE ESTAR ARRIBA: cada
  proyecto es una unidad —plano, nombre y métrica entrando juntos.
- Sin romper la meseta de B4-A —nunca los tres invisibles a la vez—, el
  lente de P7 —los −3000 caen a 63,6, adentro de la pared— ni el techo de
  velocidad de B2 en 4,6531.
- El arco del sol se toca SOLO en el tramo de Trabajos y sus transiciones.
- El presupuesto tiene 8,6 B de aire: el peso del contenido de mentira se
  declara APARTE, como peso de la llave, no como montaje. No subas el techo.
- El build en primer plano, con Chrome cerrado y el chequeo por RUTA DE
  WORKTREE. NUNCA git stash, checkout ni restore.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- Git: commit y push en v3/cierre-etapa. PROHIBIDO merge, reset, rebase,
  push --force. Nunca git add .
- Cero any. Cero color. Sin dependencias nuevas.
- PowerShell: no hay &&, no hay heredoc.
- Podés decir «el negro de Trabajos pasó de 31 a 4 de luminancia media». NO
  podés decir «ahora sí se parece»: eso lo juzgo yo grabando.

Arrancá por la §1. No me confirmes el entendimiento.
```
