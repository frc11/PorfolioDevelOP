# B5 — Que se sienta vivo

Scroll suave, la escena que respira, y el cursor.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`, y la razón importa:** las tres piezas de este bloque **se sienten juntas o no se sienten.** Tres subagentes verificarían cada uno lo suyo aislado y **nadie sentiría el conjunto**, que es exactamente lo que el bloque viene a arreglar. Además el riesgo vive en la interacción entre las tres, no adentro de ninguna.
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es bloqueante y no negociable: ver §1.
- **El dev server en el 3000**, Chrome al frente, receta de `docs/rediseno/MEDICION-NAVEGADOR.md`.
- **El build en primer plano**, con `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`, y el chequeo de procesos **por ruta de worktree**, no por comando.

---

## El diagnóstico del humano

Grabó el sitio completo y dijo dos cosas:

> **"El scroll no es smooth, es robótico."**
> **"La escena atrás no está viva, está atascada."**

Las dos son ciertas y las dos tienen causa conocida.

**El scroll.** La referencia usa **Lenis** — scroll por interpolación — y Franco lo midió. **S1 la excluyó de `/v3` a propósito**, para poder juzgar el `sticky` sin JavaScript de por medio. Era correcto entonces y **nunca se revisó.** Peor: está medido que **Lenis igual viaja a `/v3`, 5,5 KiB, sin usarse.** Se paga el peso sin el beneficio.

**La escena.** Es **100% dirigida por el scroll**: si nadie scrollea, no se mueve un píxel. El diseño original decía otra cosa — *"la cámara orbita con inercia, offset de mouse, y vira en reposo"*.

---

# §1 · Lo primero, y nada se construye antes 🔴

## 1.1 El riesgo que puede romper todo

**Lenis no "suaviza el scroll": reemplaza el valor de la posición.** Y **toda la coreografía lee esa posición** — el anclaje, los nueve patrones, los pines, las 4.751 afirmaciones que descansan en el progreso.

**Hay dos modos y hacen cosas opuestas:**

- **Si Lenis conduce el scroll nativo** —escribiendo la posición real de la ventana con el valor interpolado— **la escena se suaviza gratis** y todo lo demás sigue funcionando sin tocar una línea.
- **Si Lenis transforma un envoltorio** y deja la ventana quieta, **el `sticky` deja de pegarse**, `getBoundingClientRect` devuelve otra cosa, y **se caen Servicios, Trabajos y el anclaje entero.**

⚠️ **Averiguá cuál de los dos corre, con medición, antes de prenderla en `/v3`.** Leé cómo está configurada donde ya se usa —el sitio viejo la tiene— y verificá sobre el DOM renderizado.

## 1.2 Y verificá qué existe ya, antes de construirlo

**Dos de las tres cosas de "la escena viva" probablemente ya están.** Medí y decime:

- **El offset del mouse:** está montado y medido en la escena. **¿Funciona en el home? ¿Con qué magnitud?** Si funciona, no se construye: se calibra.
- **El asentamiento post-scroll:** el humano lo describió como *"un ligero movimiento de cámara al acomodarse, suavizado, después del scroll"*. ⚠️ **Con Lenis prendida, el valor del scroll ya se asienta solo con una curva.** Puede que la cámara se asiente gratis. **Medilo con Lenis puesta antes de escribir nada.**
- **La deriva autónoma** —que la escena se mueva sola sin que nadie toque nada— **es lo único que seguro no existe**, porque el progreso solo cambia con el scroll.

## 1.3 La medición contra nk

**Se mide, no se copia. Una navegación, una medición.** Es un sitio ajeno en producción.

| medición | por qué |
|---|---|
| **Cuánto tarda su scroll en asentarse** después de soltar la rueda, y la forma de la curva | Es el número que define "suave" |
| **Cuánto avanza por cada paso de rueda**, contra el nativo | Si multiplica o solo interpola |
| **Si su escena se mueve sola** con la página quieta, y cuánto por segundo | La deriva |
| **Si responde al mouse** con la página quieta, y con qué magnitud y retardo | El offset |
| **El cursor**: tamaños, retardo de interpolación, y qué hace sobre un elemento interactivo | Ya está construido; esto lo calibra |

## 🛑 PARADA 1 — bloqueante

Reportá **antes de tocar una línea de producto**:

- (a) **Qué modo de Lenis corre**, con la evidencia, y **si rompe el `sticky` o no.**
- (b) **Qué existe ya** de las tres piezas de la escena, con su magnitud medida.
- (c) **La tabla contra nk.**
- (d) **Tu plan**, con qué se construye y qué solo se calibra.

**Si Lenis rompe el `sticky`, frená y reportá.** Hay salidas —conducir el scroll nativo, o suavizar solo lo que la escena lee— pero **la decisión es del humano.**

---

# §2 · Lo que se construye

## 2.1 El scroll suave

- **Lenis prendida en `/v3`**, arriba de 1025.
- ⚠️ **Abajo de 1025 NO se carga.** La referencia usa el nativo ahí, y es decisión tomada.
- **Verificá que el anclaje de las ocho secciones no se mueva un bit**, que los dos pines sigan pegándose **con scroll real**, y que los nueve patrones sigan siendo exactamente reversibles.
- **Y el peso:** hoy viaja sin usarse. **Reportá el neto** — si se prende donde ya viajaba, el costo puede ser cero.

## 2.2 La escena viva

**Tres comportamientos, y el orden importa:**

**La deriva autónoma.** La escena se mueve sola, despacio, siempre. Es lo que hace que se sienta un lugar y no un fondo. Lenta y sin destino: si se nota como animación, es demasiado.

**El asentamiento después del scroll.** Cuando el visitante suelta, la cámara termina de acomodarse en vez de frenar en seco. **Medí primero si Lenis ya lo da.**

**El offset del mouse.** Ya existe: verificá que funcione en el home y calibrá su magnitud contra la de nk.

### ⚠️ La regla de arquitectura que no se negocia

> **Los tres son un desplazamiento SOBRE la pose, no un cambio del progreso.**

Si la cámara moviéndose sola altera el progreso, **el anclaje se rompe y se caen las 4.751 afirmaciones que descansan en él.** Es el error fácil de este bloque.

**Con una comprobación que lo garantice:** con la página quieta y la deriva corriendo, **el progreso tiene que ser idéntico bit a bit** durante varios segundos. Con control positivo.

### Y el techo

B2 puso un techo de velocidad de cámara por tramo y el pico está en **4,6531**. **La deriva suma movimiento.** Verificá que el techo se siga respetando con las tres cosas encendidas.

## 2.3 El cursor

Está construido desde S3 y **apagado detrás de una constante**, por una decisión que nadie había tomado. **Ahora está tomada: se prende, arriba de 1025.**

- **Dos capas**: núcleo de 4×4 y halo de 36×36 con desenfoque, las dos con su transición.
- **Sobre un control interactivo se apaga** y el nativo toma el relevo.
- ⚠️ **El nativo nunca se oculta.** El propio se dibuja encima, no en su lugar.
- **El color acompaña a la sección**, no a la página: sobre panel claro un valor, sobre sección invertida otro.
- **Calibrá su retardo** contra el de nk.

---

# §3 · Tres cosas que el bloque no puede romper

## 3.1 `prefers-reduced-motion` ⚠️

**Este bloque agrega tres fuentes de movimiento nuevas.** Y B4-B midió que **hoy la preferencia no se honra**: 2.380 transformadas idénticas con y sin ella.

**El arreglo global es de otro bloque. Pero las tres cosas que agregás acá tienen que honrarla desde el día uno**, o la deuda crece.

⚠️ **Con la preferencia activa: sin Lenis, sin deriva, sin cursor.** Y verificalo **sin caer en «verde por arnés»** — la regla que B4-B sacó:

> *Ninguna entrada que venga de afuera del árbol —preferencia, breakpoint, `matchMedia`— se puede cerrar en un render forzado. El discriminador es una pregunta: **¿qué parte de esta afirmación la puso el propio instrumento?***

**El invariante tiene que leer la preferencia del entorno, no forzarla y después afirmarla.**

## 3.2 El rendimiento

Tres consumidores nuevos del ciclo de cuadro. La línea de base de B4-B: **FPS mínimo 73,5**, así que hay margen — **pero hay que medirlo, no suponerlo.**

- **FPS durante el recorrido completo**, con las tres cosas encendidas, contra 73,5.
- **Y con la página quieta**, que es la situación nueva: antes no pasaba nada y ahora sí.
- ⚠️ **El LCP está en 2.378 ms de mediana con una corrida en 2.524, que cruza el techo de 2,5 s.** El elemento LCP es el `<h1>` del hero — **texto**. Verificá que Lenis no lo empeore.

## 3.3 Lo que ya está calibrado

**No se toca ninguna pose, ni el anclaje, ni el ritmo del preloader, ni el contenido.** Este bloque agrega capas encima de lo que existe.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`** — cualquier escritura de git en el árbol lo pasa a CRLF. Para leer `HEAD`: `git show HEAD:<ruta>`. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. ⚠️ **`TransitionContext.tsx` importa `useLenis` y es congelado.** Si el montaje lo necesita distinto, **frená y reportá.**
3. ⚠️ **`src/app/layout.tsx` lo comparte el SITIO VIVO con clientes reales.** Si Lenis toca ahí, **cambiás cómo se importa, nunca qué renderiza**, y verificás que las rutas viejas no cambien de comportamiento, con control positivo.
4. **No toques ninguna pose, ni `anclaje.ts`, ni `recorrido.ts`, ni el preloader, ni el contenido, ni el home actual, ni `/probe-escena`.**
5. **De nk se MIDE, no se copia.**
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** Lenis ya está instalada.
8. **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
9. **Ninguna afirmación se afloja.** **Ninguna comprobación verde por vacío, ni verde por arnés.**
10. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **15:** se afirma la propiedad, no el literal.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No auto-confirmás que se ve bien.** Podés decir "el scroll se asienta en 780 ms con una curva exponencial". **No podés decir "ahora se siente vivo": eso lo juzga el humano grabando, y es el gate real de este bloque.**
13. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
14. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y un `workflow` que devuelve `completed` en pocos segundos **no terminó**.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **Lenis**: el modo, el asentamiento medido contra nk, el peso neto, y que el `sticky` y el anclaje sobrevivieron.
- (c) **La escena viva**: qué existía y qué construiste, con la magnitud de cada uno contra nk.
- (d) **La comprobación de que el progreso no se mueve** con la deriva corriendo y la página quieta, con su control.
- (e) **El techo de velocidad** con las tres cosas encendidas, contra 4,6531.
- (f) **El cursor**: montado, con su retardo contra nk, y que no oculta el nativo.
- (g) **`prefers-reduced-motion`** sobre las tres, **verificado sin arnés**.
- (h) **FPS** durante el recorrido y con la página quieta, contra 73,5. Y **el LCP** contra 2.378 ms.
- (i) **Abajo de 1025**: que no se carga ninguna de las tres.
- (j) Capturas, archivos y `git status`.
- (k) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B5: que se sienta vivo"` → `git push origin rediseno/home`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B5-vivo.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Dev server en el 3000,
  Chrome al frente.
- NO uses subagentes: las tres piezas de este bloque se sienten juntas o no
  se sienten, y el riesgo vive en la interacción entre ellas.
- ⚠️ LA PARADA 1 ES BLOQUEANTE Y VA ANTES DE TOCAR UNA LÍNEA DE PRODUCTO.
  Lenis no suaviza el scroll: REEMPLAZA el valor de la posición, y toda la
  coreografía lee esa posición. Si conduce el scroll nativo, todo se
  suaviza gratis. Si transforma un envoltorio, el sticky deja de pegarse y
  se caen Servicios, Trabajos y el anclaje entero. Averiguá cuál corre,
  con medición, ANTES de prenderla. Si rompe el sticky, FRENÁ Y REPORTÁ.
- Y verificá qué EXISTE antes de construirlo: el offset del mouse ya está
  montado, y el asentamiento post-scroll puede venir gratis con Lenis. Lo
  único que seguro no existe es la deriva autónoma.
- ⚠️ REGLA DE ARQUITECTURA: la deriva, el asentamiento y el mouse son un
  desplazamiento SOBRE LA POSE, nunca un cambio del progreso. Si la cámara
  moviéndose sola altera el progreso, el anclaje se rompe y se caen las
  4.751 afirmaciones que descansan en él. Con una comprobación que lo
  garantice: página quieta, deriva corriendo, progreso idéntico bit a bit.
- El cursor se PRENDE, arriba de 1025. Ya está construido desde S3.
- Abajo de 1025 no se carga ninguna de las tres. La referencia usa el
  scroll nativo ahí y es decisión tomada.
- Este bloque agrega tres fuentes de movimiento y hoy
  prefers-reduced-motion NO se honra. Las tres tienen que honrarla desde el
  día uno, y verificado SIN CAER EN «VERDE POR ARNÉS»: ninguna entrada que
  venga de afuera del árbol se cierra en un render forzado. El
  discriminador es qué parte de la afirmación la puso el propio instrumento.
- src/app/layout.tsx lo comparte el SITIO VIVO con clientes reales: si
  Lenis toca ahí, cambiás CÓMO se importa, nunca QUÉ renderiza, con control
  positivo. TransitionContext.tsx importa useLenis y es FROZEN: si lo
  necesitás distinto, FRENÁ Y REPORTÁ.
- NO toques ninguna pose, ni anclaje.ts, ni recorrido.ts, ni el preloader,
  ni el contenido, ni el home actual, ni /probe-escena.
- De nk se MIDE, no se copia. Una navegación, una medición.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío ni
  verde por arnés. Toda cifra con su instrumento.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase, push
  --force, checkout que descarte, y git stash. Nunca git add .
- Cero any. Cero setState por frame. Sin dependencias nuevas.
- PowerShell: no hay &&, no hay heredoc. El build en primer plano.
- Las paradas 🛑 son bloqueantes.
- Podés decir «el scroll se asienta en 780 ms». NO podés decir «ahora se
  siente vivo»: eso lo juzgo yo grabando, y es el gate real del bloque.

Arrancá por la §1. No me confirmes el entendimiento.
```
