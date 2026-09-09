# B11 — La información acomodada a la coreografía

Seis deudas, una sola causa: el logo pasa por detrás del texto.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo: Fable 5.1.** **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Es composición sostenida contra un objeto que se mueve: cada sección se resuelve **mirando dónde está el logo en su tramo**, y esa es una sola decisión de dirección aplicada seis veces. Seis subagentes producirían seis criterios distintos, y el defecto que estamos arreglando es exactamente ése — que cada sección se compuso sin ver el conjunto.
- **Worktree:** `C:\v3-acomodamiento`, rama **`v3/acomodamiento`**. Sesión en `C:\v3-acomodamiento\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es bloqueante.
- **Dev server en el 3000**, Chrome **al frente**. Receta en `docs/rediseno/MEDICION-NAVEGADOR.md`.
- ⚠️ **El búfer de WebGL no se lee desde la página.** Toda medición de la escena va por `Page.captureScreenshot`.
- ⚠️ **El build en primer plano**, `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, con Chrome y los dev servers cerrados y el chequeo de procesos **por ruta de worktree**.
- ⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# El principio que gobierna el bloque

El humano lo dijo así, y es la inversión de cómo se venía trabajando:

> **"Para algo quise hacer una coreografía, para luego acomodar la información. La información va acomodada a la coreografía. En el hero está bien acomodado, falta el resto."**

**La coreografía manda. El texto se mueve.**

Durante varios bloques se midió dónde caía el texto y se concluyó *"esta sección no puede abrirse"*. **Eso era la conclusión equivocada.** La respuesta correcta era siempre la misma: **mover el texto.**

**Y el Hero ya lo demuestra.** Su columna está acotada a la izquierda, el logo entra por la derecha, y el contraste pasó de 1,00:1 a **10,45:1 con cero píxeles bajo AA en los tres anchos.** No hizo falta velo, ni cambiar la pose, ni cerrar la sección.

**Este bloque hace eso mismo en las otras seis.**

---

# §1 · Las seis deudas, con su número

Están declaradas en el repo con `deudaDeclarada()` y las corre el agregado. **Leelas de donde viven** — el reporte de B8, el de B6-A y `DIRECCION-ESCENA.md` §7 — y **verificá que cada una se reproduzca hoy** antes de tocarla: la luz cambió después de que varias se midieron.

| sección | lo medido | causa |
|---|---|---|
| **Quiénes somos** | 12 de 17 bloques fallan, peor 1,00 | cuerpo 39,9% sobre el logo |
| **Números** | 12 de 13 fallan, peor 1,00 | **rótulo 100% sobre el logo** |
| **Por qué develOP** | 6 de 7 bloques, titular chico en 1,11, 944 px bajo AA | el logo, a plena mañana |
| **Cierre** | según la variante, 13 o 25 de 25 | el logo |
| **Hero** | 26 px de 6.769 | partículas bajo el glifo |
| **Trabajos** | casos parciales | tinta secundaria |

⚠️ **Y una que no es del logo:** el cuerpo de 15 px del diferencial tiene **mediana 4,65:1 y 33% de sus píxeles bajo 4,5:1** aun con el puntero quieto. Es preexistente y hoy actúa de techo del paralaje — el diferencial va a 8° mientras el hero aguanta 22°.

---

# §2 · La medición, y va primero 🔴

**Para cada una de las seis, con la escena real en su tramo y en 1440, 1920 y 2560:**

| qué | por qué |
|---|---|
| **Dónde está el logo**: su caja, su silueta, y qué fracción del ancho ocupa a lo largo del tramo | Es el obstáculo, y **se mueve** |
| **Dónde está cada bloque de texto** y cuánto se superpone con esa silueta | El defecto |
| **Qué zona del cuadro queda libre** en todo el tramo, no en un instante | **Es donde el texto puede vivir** |
| **El contraste actual de cada bloque**, con el método del glifo | La línea de base |

⚠️ **La zona libre hay que medirla a lo largo del tramo entero, no en una pose.** El logo se mueve con el scroll: una franja libre en el medio del tramo puede estar ocupada al principio. **El texto tiene que ser legible en todo el recorrido de su sección, no en el instante en que se lo mira.**

## Y contra la referencia

**Se mide, no se copia. Una navegación, una medición.**

- **Dónde pone el texto respecto de su objeto 3D**, sección por sección.
- **Qué fracción del ancho le da al texto** y cuánta deja al objeto.
- **Si alguna vez deja que el texto se superponga con el objeto**, y qué hace ahí.

## 🛑 PARADA 1 — bloqueante

- (a) **Las seis deudas verificadas**: cuáles se reproducen hoy y cuáles cambiaron con la luz nueva.
- (b) **La zona libre de cada sección**, a lo largo de su tramo.
- (c) **La medición contra la referencia.**
- (d) **Tu plan por sección**, y **qué composición cambia en cada una.**

⚠️ **Si alguna sección no tiene zona libre suficiente en todo su tramo**, decilo con el número. Hay salidas —acotar el ancho, mover el bloque de altura, cambiar la jerarquía— pero **si ninguna alcanza, es una decisión de dirección y la toma el humano.**

---

# §3 · El trabajo

## 3.1 Números es la difícil, y hay que decirlo

**Su composición es dispersa, asimétrica y sin grilla, a propósito.** Está medido y observado: *"reproducirlas como una barra de cuatro columnas pierde el efecto entero."* Las cinco cifras ocupan el ancho, y **el rótulo cae 100% sobre el logo.**

**Acotarlas a una columna izquierda mata justo lo que la hace buena.**

**Buscá la salida que conserve la dispersión.** Candidatas, y elegí con el número:

- **Dispersión en la zona libre**: si el logo ocupa un sector, las cinco cifras se dispersan en el resto, que sigue siendo asimétrico.
- **Dispersión en profundidad**: que alguna cifra viva delante del logo con su propio fondo, si eso no rompe la paleta.
- **Que el tramo de la coreografía deje más cuadro libre ahí.** ⚠️ **Eso toca la pose y es la última opción**: las poses están calibradas a ojo y aprobadas por grabación. **Si es la única salida, frená y reportá.**

## 3.2 Las otras cinco

**Mismo criterio, más simple:** el texto se acota fuera de la silueta del logo, como el Hero.

- **Quiénes somos**: dos bloques de texto y el hueco de la foto.
- **Por qué develOP**: cuatro diferenciales, un titular grande y uno chico. ⚠️ **Y el cuerpo de 15 px que ya está al borde**: si al acomodarlo el margen mejora, **reportá cuánto paralaje aguanta el tramo ahora** — eso reabre una decisión que quedó cerrada por ese techo.
- **Cierre + pie**: es la sección con **más superficie de texto del sitio** — siete anclas, dos columnas, el formulario y el legal. **Medí cada bloque, no una muestra.**
- **Hero**: 26 píxeles bajo partículas. Es chico y puede que la salida no sea mover texto sino la densidad de partículas ahí. **Medí las dos.**
- **Trabajos**: la tinta secundaria, que ya se resolvió una vez con tinta plena. Verificá que siga.

## 3.3 Lo que NO se toca

- **Ninguna pose, ni el arco del sol, ni el anclaje, ni el progreso, ni los rangos de los patrones.** Todo eso está calibrado y aprobado.
- **Ninguna superficie.** El recorrido de qué sección ve la escena está decidido.
- **El contenido.** Los marcadores se quedan como están: **este bloque mueve el texto, no lo reescribe.**
- ⚠️ **Y el ritmo:** B9 dejó el hueco máximo entre acontecimientos en **1,33 a 1920 y 1,20 a 1440**. Mover un bloque de altura **mueve su acontecimiento.** Corré el censo antes y después.

---

# §4 · El gate del bloque

**Las seis deudas cerradas**, cada una con el instrumento que la declaró.

⚠️ **`deudaDeclarada()` corre la condición intacta y la cuenta aparte.** Cuando el texto se mueva, **esas líneas pasan a verde solas.** No hay que tocarlas: **si alguna necesita cambiar para pasar, es que no se cerró.**

**Y el criterio es AA en el peor píxel del glifo**, con el método que ya existe — bajo el glifo, no bajo la caja del renglón.

---

## Reglas absolutas

1. **Rama `v3/acomodamiento`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **No toques `_lib/escena/`, `anclaje.ts`, `recorrido.ts`, `superficies.ts`, ni el preloader, ni el home actual, ni `/probe-escena`, ni `scene-camera.ts`.**
4. **No reescribas contenido.** Mover un bloque no es cambiar lo que dice.
5. ⚠️ **El presupuesto tiene 2,9 B de aire.** Es el margen más fino de la historia del archivo. **Si tu trabajo agrega peso, declaralo como montaje con su número y su alternativa** — no lo escondas en el heredado, y **no subas el techo.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío, ni verde por arnés.**
9. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **15:** se afirma la propiedad, no el literal.
10. **PowerShell:** no hay `&&`, no hay heredoc.
11. **No auto-confirmás que se ve bien.** Podés decir *"Números pasó de 12 de 13 bloques bajo AA a 0, con la dispersión conservada en 4 de 5 ejes"*. **No podés decir "ahora se lee bien": eso lo juzga el humano grabando, y es el gate real.**
12. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
13. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **Las seis deudas**, una por una, con su instrumento y su número antes y después.
- (c) **Números**: qué salida elegiste y **cuánto de la dispersión se conservó**, con el número.
- (d) **Capturas de antes y después** de las seis, a 1440 y 1920.
- (e) **El contraste de cada bloque** con el método del glifo, en los tres anchos.
- (f) **Que la legibilidad se sostiene a lo largo del tramo entero**, no en una pose.
- (g) **El censo de acontecimientos**, antes y después, contra 1,33 y 1,20.
- (h) **El diferencial**: si el margen mejoró y cuánto paralaje aguanta ahora.
- (i) **El peso**, contra los 2,9 B de aire.
- (j) **Que ninguna pose, ni el arco, ni el anclaje, ni las superficies se movieron un bit.**
- (k) Archivos y `git status`.
- (l) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B11: la informacion acomodada"` → `git push -u origin v3/acomodamiento`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B11-acomodamiento.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-acomodamiento, rama v3/acomodamiento. Dev server en el
  3000, Chrome al frente.
- NO uses subagentes: es composición sostenida contra un objeto que se
  mueve, y seis subagentes producirían seis criterios distintos. El defecto
  que estamos arreglando es exactamente ése.
- EL PRINCIPIO: la coreografía manda y el texto se mueve. Durante varios
  bloques se midió dónde caía el texto y se concluyó «esta sección no puede
  abrirse». Esa conclusión era la equivocada. El Hero ya lo demuestra: su
  columna acotada a la izquierda pasó de 1,00:1 a 10,45:1 con cero píxeles
  bajo AA, sin velo, sin cambiar la pose y sin cerrar la sección.
- LA MEDICIÓN VA PRIMERO, y la zona libre se mide A LO LARGO DEL TRAMO
  ENTERO, no en una pose: el logo se mueve con el scroll, y una franja libre
  en el medio puede estar ocupada al principio. El texto tiene que ser
  legible en todo el recorrido de su sección.
- Verificá que cada una de las seis deudas SE REPRODUZCA HOY antes de
  tocarla: la luz cambió después de que varias se midieron.
- NÚMEROS ES LA DIFÍCIL: su composición dispersa y asimétrica es
  deliberada, está medida y observada, y acotarla a una columna izquierda
  mata lo que la hace buena. Buscá la salida que CONSERVE la dispersión.
  Tocar la pose es la ÚLTIMA opción: si es la única, FRENÁ Y REPORTÁ.
- NO toques ninguna pose, ni el arco del sol, ni el anclaje, ni el progreso,
  ni los rangos de los patrones, ni las superficies, ni _lib/escena/, ni el
  preloader, ni el home actual, ni /probe-escena, ni los frozen.
- NO reescribas contenido: mover un bloque no es cambiar lo que dice. Los
  marcadores se quedan.
- deudaDeclarada() corre la condición intacta: cuando el texto se mueva esas
  líneas pasan a verde SOLAS. Si alguna necesita cambiar para pasar, es que
  no se cerró.
- El criterio es AA EN EL PEOR PÍXEL DEL GLIFO, con el método que ya existe
  —bajo el glifo, no bajo la caja del renglón.
- ⚠️ Mover un bloque de altura mueve su acontecimiento: corré el censo de
  B9 antes y después, contra 1,33 a 1920 y 1,20 a 1440.
- ⚠️ El presupuesto tiene 2,9 B de aire. Si agregás peso, declaralo como
  montaje con su número y su alternativa. No lo escondas en el heredado y
  NO subas el techo.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- El búfer de WebGL no se lee desde la página: todo por captureScreenshot.
- El build en primer plano, con el chequeo de procesos por RUTA DE
  WORKTREE. NUNCA git stash, checkout ni restore.
- Git: commit y push en v3/acomodamiento. PROHIBIDO merge, reset, rebase,
  push --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- Podés decir «Números pasó de 12 de 13 bloques bajo AA a 0, con la
  dispersión conservada en 4 de 5 ejes». NO podés decir «ahora se lee
  bien»: eso lo juzgo yo grabando, y es el gate real del bloque.

Arrancá por la §2. No me confirmes el entendimiento.
```
