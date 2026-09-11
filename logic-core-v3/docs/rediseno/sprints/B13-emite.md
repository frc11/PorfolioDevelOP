# B13 — Que el logo emita

Y los números adentro de la escena, y el pie transparente de verdad.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`.** Las tres partes se apoyan en la misma medición: **cuánta luz emite el logo cambia el contraste de todo lo demás.** Los números y el pie se deciden con el resultado de la primera.
- **Worktree:** `C:\v3-emite`, rama **`v3/emite`**. Sesión en `C:\v3-emite\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es bloqueante y va antes de tocar los números y el pie.
- **Dev server en el 3000**, Chrome **al frente**, y **cerrado durante el build** — ya mató cinco corridas.
- ⚠️ **El búfer de WebGL no se lee desde la página.** Todo por `Page.captureScreenshot`.
- ⚠️ **El build va con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`** mientras `CONTENIDO_INVENTADO` esté en `true`. Sin esa variable falla a propósito, y eso está bien.
- ⚠️ **Nunca `git stash`, `checkout`, `restore` ni ninguna escritura de git en el árbol.** Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# El diagnóstico

El humano grabó su sitio y la referencia uno al lado del otro. La conclusión no es de ejecución: **es de material.**

> **El objeto de la referencia EMITE. El nuestro ABSORBE.**
>
> Su barra es neón: una fuente de luz adentro de la escena, entre **1 y 7% del cuadro**, que **le agrega** al fondo.
> El nuestro es tinta casi negra, llega al **35–50% del cuadro**, y **lo tapa**.

**Esa es la causa raíz de la mitad de las deudas del proyecto.** Diez bloques chocaron contra lo mismo: el texto no puede pasarle por encima —**1,00:1 medido**—, no deja lugar, y no aporta luz.

**Y no se resuelve moviendo texto.** Ya se probó: B11 movió las seis secciones y cerró cuatro deudas, pero el piso que queda —motas, pared, atardecer— **siempre vuelve a ser luz.**

⚠️ **Esto NO cambia la marca.** El logo sigue siendo el mismo objeto, con la misma geometría y el mismo lugar en el recorrido. **Cambia su material en la escena.**

---

# §1 · El logo emite 🔴

## 1.1 De dónde salió el negro

Está documentado y hay que leerlo antes de tocar nada: **el logo del preloader se resolvió por emisiva**, con el material sin recibir luz y su color derivado por bisección contra `NeutralToneMapping` para dar `#111111` exacto. Se hizo así porque **el especular lo blanqueaba**: con la cámara de frente y la luz de frente, el 99,3% de la luz que devolvía era especular.

**O sea que el mecanismo de emisión ya existe.** Lo que cambia es el valor, no la técnica.

## 1.2 Qué medir en la referencia

**Se mide, no se copia. Una navegación, una medición.**

| medición | por qué |
|---|---|
| **La luminancia de su barra** contra la de su fondo, en varias poses | Cuánto emite de verdad |
| **Si aporta luz al entorno** —halo, reflejo en el agua, brillo alrededor— o solo brilla ella | Define si es material o iluminación |
| **Qué fracción del cuadro ocupa** a lo largo del recorrido | La vara del tamaño |
| **El contraste de su texto cuando cae encima de la barra** | Es lo que a nosotros nos da 1,00:1 |

## 1.3 Qué construir

**El logo pasa de absorber a emitir**, en la escena del home. Y hay un rango que hay que barrer, no un valor que adivinar:

- **Barré la emisión** desde el negro actual hasta un valor donde el logo **se lea como una pieza luminosa** sobre la sala.
- **Para cada valor del barrido, medí las dos cosas que compiten:**
  - **El contraste del texto que cae encima**, con el método del glifo. **Es lo que decide.**
  - **Si el logo sigue leyéndose como el logo** — la silueta, el volumen, las dos contras. Un objeto que emite demasiado se aplana y pierde forma.
- ⚠️ **Y una tercera que es la trampa:** sobre **papel claro**, un objeto que emite **desaparece**. La sala del hero es casi blanca. **Medí el contraste del logo contra la sala en cada tramo** — si en los claros se pierde, la emisión tiene que depender del nivel de luz de la escena, no ser constante.

**Reportá la tabla completa y proponé el valor.** Con el número de las tres cosas.

## 1.4 Lo que no se rompe

- ⚠️ **El preloader no se toca.** Su logo es otro objeto, con su propio material resuelto por bisección, y su relevo 2D→3D aterriza al bit. **Si el cambio lo alcanza, frená y reportá.**
- **La sombra del logo sobre el piso**: un objeto que emite proyecta distinto. **Medí qué le pasa.**
- **El contraluz que B8 ató a la sala** por debajo de 0,34: verificá que siga teniendo sentido, o que se lo lleve la emisión.
- **Ninguna pose, ni el anclaje, ni el progreso.**

---

# §2 · El tamaño en cuadro 🔴

El humano autorizó tocarlo, y es la única cosa del proyecto que dijimos que no se toca sin su decisión.

- **En los tramos donde el logo compite con el texto, la cámara se aleja.** De **~40% del cuadro a ~15%**, que es el orden de la referencia.
- ⚠️ **Toca `frameZ` o la distancia de las poses, y solo en esos tramos.** Hero y el diferencial se juzgan aparte: el hero ya funciona.
- ⚠️ **Y mueve el acomodamiento de B11.** El texto se acotó midiendo dónde caía el logo: **si el logo se achica, la zona libre cambia.** Re-medí las seis secciones y **reportá cuáles quedaron con margen de sobra** — puede que alguna pueda volver a una composición más ancha.
- **El destino del preloader sale de la pose del hero.** Si tocás esa, **medí cuánto se movió el aterrizaje** y verificá que siga coincidiendo.
- **El techo de velocidad de B2** sigue en 4,6531 y el censo de acontecimientos en **1,33 a 1920 y 1,20 a 1440.**

---

# §3 · Los números adentro de la escena 🔴

> *"La presentación que tienen los números no me gusta, me gustaría algo más como nk."*

## 3.1 Lo que hace la referencia

Sus cifras **flotan sobre el paisaje**: tamaños distintos, el rótulo chiquito debajo, **y la escena sigue viva detrás de cada una.** No se leen como una lista: se leen como parte del lugar.

**Lo nuestro es texto sobre una sala blanca.** La dispersión está —B11 conservó cinco ejes— pero **falta la integración.**

**Medí en la referencia:**

- **Qué tamaños usa** y cuánto varían entre la mayor y la menor.
- **Dónde pone el rótulo** respecto de la cifra, y con qué peso.
- **Si las cifras entran juntas o de a una**, y con qué patrón.
- **Cómo se relacionan con su objeto**: si lo esquivan, si lo cruzan, si lo usan de ancla.

## 3.2 Qué construir

- **Las cifras integradas**, no puestas encima. Con la escena visible entre ellas.
- ⚠️ **Sin perder la dispersión que B11 conservó** — cinco ejes, y la amplitud que ya se sacrificó una vez de 1.220 a 594 px. **Si el logo se achica en §2, esa amplitud se puede recuperar: medilo.**
- **El rótulo va con su cifra**, no como una etiqueta suelta.
- ⚠️ **La sección tiene la llave prendida y muestra cifras falsas.** Se compone con ellas y **se verifica también con la llave apagada**, con los marcadores puestos: `[CIFRA]` es más largo que `23` y la composición tiene que aguantar los dos.

---

# §4 · El pie, transparente de verdad 🔴

> *"El footer sigue siendo sólido, no transparente."*

**Y tiene razón: es culpa de la palanca que yo propuse.** La banda con fondo detrás del texto chico compró legibilidad —de 24 de 24 bloques bajo AA a 4— **y perdió exactamente lo que él pidió.**

## Qué hacer

- **Revertí la banda.** El pie va sin fondo propio, con la sala detrás.
- **Y ahí vuelve lo que estaba tapado.** ⚠️ **Pero medilo DESPUÉS de §1 y §2**, porque las dos lo cambian: un logo que emite y una sala con otra iluminación dan otro fondo.
- **Si con el logo emitiendo el pie cierra, cerró.** Si no, **la deuda se declara con su número** y el humano la juzga mirando — **no vuelvas a poner la banda.**
- ⚠️ **El formulario es el caso difícil**: un `<input>` sobre una escena en movimiento. **Si es lo único que no cierra, ése sí puede llevar fondo propio** — es un control, no una superficie.
- **Cada bloque medido por separado**: siete anclas, dos columnas, el formulario y el legal. **Es la sección con más superficie de texto del sitio.**

---

## 🛑 PARADA 1 — después de §1 y §2, antes de §3 y §4

- (a) **La medición de la referencia**: luminancia de su barra, si aporta luz, fracción del cuadro, contraste de su texto encima.
- (b) **El barrido de emisión**, con las tres columnas: contraste del texto encima, legibilidad de la silueta, y **contraste del logo contra la sala en cada tramo**.
- (c) **El valor que proponés**, y si tiene que depender del nivel de luz.
- (d) **El tamaño en cuadro**, antes y después, por tramo.
- (e) **Qué se movió**: el acomodamiento de B11, el destino del preloader, la sombra, el contraluz, el censo.
- (f) **Capturas de antes y después** en las secciones donde el logo se ve.
- (g) **Lo que frenó.**

Esperá el OK. **Si el logo emitiendo no resuelve el contraste, §3 y §4 se planifican distinto.**

---

## Reglas absolutas

1. **Rama `v3/emite`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. ⚠️ **Esto NO cambia la marca.** El logo es el mismo objeto, con la misma geometría y el mismo lugar. **Cambia su material en la escena.** Si algo empuja hacia rediseñar la marca, **frená y reportá.**
3. **Cero color.** Blanco y negro. **Un logo que emite emite BLANCO.**
4. **El preloader no se toca.** Si el cambio lo alcanza, **frená y reportá.**
5. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
6. **No toques el anclaje, ni el progreso, ni los rangos de los patrones, ni el arco del sol, ni el home actual, ni `/probe-escena`, ni `scene-camera.ts`.**
7. ⚠️ **Las poses se tocan SOLO en la distancia de los tramos que §2 nombra.** Ningún otro valor de ninguna pose.
8. **No reescribas contenido.** La llave y sus veinte casillas se quedan como están.
9. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
10. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
11. **Ninguna afirmación se afloja.** Las que describan una decisión que cambió **se reescriben contra la propiedad nueva** — regla 15.
12. **Ninguna comprobación verde por vacío, ni verde por arnés.**
13. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado.
14. ⚠️ **El presupuesto tiene 6,0 B de aire.** Lo que agregues se declara como montaje con su alternativa. **No subas el techo sin recibo.**
15. **De la referencia se MIDE, no se copia.** Una navegación, una medición.
16. **PowerShell:** no hay `&&`, no hay heredoc.
17. **No auto-confirmás que se ve bien.** Podés decir *"el contraste del texto sobre el logo pasó de 1,00:1 a 6,3:1"*. **No podés decir "ahora se parece a la referencia": eso lo juzga el humano grabando.**
18. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
19. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **El logo**: el valor de emisión, el contraste del texto encima en las seis secciones, y que la silueta sigue leyéndose.
- (c) **El tamaño en cuadro** por tramo, y qué margen quedó libre en cada sección.
- (d) **Las deudas de contraste**: cuáles cerraron solas con la emisión y cuáles no. **Es el número que dice si valió la pena.**
- (e) **Los números**: la dispersión conservada, con la llave prendida y apagada.
- (f) **El pie**: sin banda, la tabla por bloque, y qué quedó abierto.
- (g) **El preloader**: que su logo y su aterrizaje no se movieron.
- (h) **El censo y el techo de velocidad**, sin moverse.
- (i) **Capturas de antes y después** de las ocho, a 1440 y 1920.
- (j) **El peso**, contra los 6,0 B de aire.
- (k) Archivos y `git status`.
- (l) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B13: que el logo emita"` → `git push -u origin v3/emite`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B13-emite.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-emite, rama v3/emite. Dev server en el 3000, Chrome al
  frente y CERRADO durante el build. NO uses subagentes: las tres partes se
  apoyan en la misma medición.
- ⚠️ LA PARADA 1 VA DESPUÉS DE §1 Y §2 Y ANTES DE §3 Y §4. Si el logo
  emitiendo no resuelve el contraste, las otras dos se planifican distinto.
- EL DIAGNÓSTICO: el objeto de la referencia EMITE y el nuestro ABSORBE. Su
  barra es neón, ocupa 1–7 % del cuadro y le agrega al fondo; el nuestro es
  tinta casi negra, llega al 35–50 % y lo tapa. Es la causa raíz de la mitad
  de las deudas del proyecto, y no se resuelve moviendo texto: ya se probó.
- ⚠️ ESTO NO CAMBIA LA MARCA. Mismo objeto, misma geometría, mismo lugar en
  el recorrido. Cambia su MATERIAL en la escena. Si algo empuja hacia
  rediseñar la marca, FRENÁ Y REPORTÁ.
- El mecanismo de emisión YA EXISTE: el logo del preloader se resolvió por
  emisiva, con el material sin recibir luz y el color por bisección contra
  NeutralToneMapping. Cambia el valor, no la técnica. Leelo antes de tocar.
- ⚠️ LA TRAMPA: sobre papel claro, un objeto que emite DESAPARECE. La sala
  del hero es casi blanca. Medí el contraste del logo contra la sala en cada
  tramo: si en los claros se pierde, la emisión depende del nivel de luz de
  la escena y no es constante.
- Un logo que emite emite BLANCO. Cero color.
- EL PRELOADER NO SE TOCA: su logo es otro objeto con su propio material y
  su relevo aterriza al bit. Si el cambio lo alcanza, FRENÁ Y REPORTÁ.
- Las poses se tocan SOLO en la distancia de los tramos donde el logo
  compite con el texto, de ~40 % del cuadro a ~15 %. Ningún otro valor. Y
  eso mueve el acomodamiento de B11: re-medí las seis secciones.
- EL PIE: revertí la banda que compró legibilidad y perdió la transparencia.
  Medilo DESPUÉS de §1 y §2, porque las dos cambian el fondo. Si no cierra,
  la deuda se declara con su número — NO vuelvas a poner la banda. El
  formulario sí puede llevar fondo propio: es un control, no una superficie.
- LOS NÚMEROS: integrados a la escena como la referencia, sin perder la
  dispersión de cinco ejes que ya se conservó. Y verificá con la llave
  APAGADA también: [CIFRA] es más largo que 23.
- El build va con MEDIR_CON_LA_LLAVE_PRENDIDA=1 mientras la llave esté en
  true. Sin esa variable falla a propósito y está bien.
- NO toques el anclaje, el progreso, los rangos, el arco del sol, el home
  actual, /probe-escena, scene-camera.ts ni los frozen.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- El presupuesto tiene 6,0 B de aire: declará lo tuyo con su alternativa.
- NUNCA git stash, checkout ni restore. Para leer HEAD: git show HEAD:<ruta>.
- Git: commit y push en v3/emite. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Cero color. Sin dependencias nuevas.
- PowerShell: no hay &&, no hay heredoc.
- Podés decir «el contraste del texto sobre el logo pasó de 1,00:1 a 6,3:1».
  NO podés decir «ahora se parece»: eso lo juzgo yo grabando.

Arrancá por §1. No me confirmes el entendimiento.
```
