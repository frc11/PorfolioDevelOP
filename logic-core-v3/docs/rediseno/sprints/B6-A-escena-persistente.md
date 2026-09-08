# B6-A — La escena persistente

La superficie que falta, y las dos secciones oscuras que la necesitan.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo: Fable 5.1.** **Esfuerzo:** `max`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **NO `ultracode`, y la razón importa:** el corazón de este bloque es **un problema óptico con dos restricciones que tiran en contra** —cuánto velo deja ver la escena y cuánto deja leer el texto— y después su consecuencia en dos secciones. Es juicio de composición sostenido, no unidades paralelas. Los subagentes resolverían el velo tres veces y de tres formas distintas.
- **Worktree:** `C:\v3-escena-viva`, rama **`v3/escena-viva`**. Sesión en `C:\v3-escena-viva\logic-core-v3`.
- **DOS PARADAS 🛑.** La primera es bloqueante y no se salta.
- **Corre en paralelo con B7 (los quince defectos), en otro worktree.**

## ⚠️ El puerto es 3001

```powershell
npm run dev -- -p 3001
```

La otra sesión usa el 3002. Chrome **al frente** — con `visibilityState: "hidden"` no corre `requestAnimationFrame` y medís una página congelada. Receta en `docs/rediseno/MEDICION-NAVEGADOR.md`.

⚠️ **El búfer de WebGL no se puede leer desde la página.** El canvas se monta con `alpha:false` y sin `preserveDrawingBuffer`: `toDataURL`, `drawImage` y `readPixels` devuelven un cuadro rancio o en blanco. **Toda medición de la escena va por `Page.captureScreenshot`.**

⚠️ **El build en primer plano**, con `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`. El chequeo de procesos **por ruta de worktree**, no por comando: hay tres `node` permanentes que son `chrome-devtools-mcp` y **no se matan**, y el filtro por comando ya mató una vez el envoltorio de la sesión vecina.

⚠️ **Nunca `git stash`, `checkout`, `restore`, `reset` ni ninguna escritura de git en el árbol** — con `core.autocrlf` lo pasa a CRLF y pone instrumentos en rojo sin que cambie una línea. Para leer `HEAD`: `git show HEAD:<ruta>`.

---

# El diagnóstico

El humano grabó el sitio al lado de la referencia y dijo dos cosas:

> **"Solo en el hero se ve el logo y la animación de atrás, en el resto no."**
> **"El efecto Star Wars está mal hecho en nuestra página."**

**Son un solo problema, y la decisión fue mía.**

En el roadmap escribí *"tres momentos de escena, no ocho: aparece, desaparece y vuelve"*, y puse **cinco de ocho paneles en `papel-opaco`**. En la referencia la escena está **casi siempre**, y por eso se siente un mundo continuo en vez de una página con dos ventanas.

**Y el Star Wars falla por la misma causa.** En la referencia, los proyectos emergen **de un campo de estrellas que es la escena misma** — vienen de la profundidad de un mundo que ya estaba ahí. El nuestro pasa sobre **un panel negro opaco**: técnicamente correcto, pero **desde un fondo plano**. No hay profundidad de la que salir.

**No está mal hecho. Está bien hecho sobre el fondo equivocado.**

## Lo que el humano pidió, textual

> *La escena se ve hasta que se presentan los servicios. Después cambia el fondo, y luego el panel, y luego vuelve a la escena hasta el footer incluido.*

**Eso ya está en el anclaje de S9.** El recorrido mapea la escena visible hasta Trabajos, avanzando **oculta** durante Servicios y Tu panel, y volviendo en Por qué develOP con el ancla en 0,8525. **El diseño estaba bien.** Lo que lo contradice es la tabla de superficies.

## El recorrido que queda

| # | sección | hoy | destino | bloque |
|---|---|---|---|---|
| 1 | Hero | `papel-transparente` | igual | — |
| 2 | Quiénes somos | `papel-opaco` | `papel-transparente` | **B6-B** |
| 3 | Números | `papel-opaco` | `papel-transparente` | **B6-B** |
| 4 | Trabajos | `oscuro-opaco` | **`oscuro-transparente`** | **este** |
| 5 | Servicios | `papel-opaco` | igual — **acá cambia el fondo** | — |
| 6 | Tu panel | `papel-opaco` | igual | — |
| 7 | Por qué develOP | `papel-transparente` | igual | — |
| 8 | Cierre + pie | `oscuro-opaco` | **`oscuro-transparente`** | **este** |

---

# §1 · La superficie que falta

Hoy hay tres: `papel-opaco`, `papel-transparente`, `oscuro-opaco`. **No existe `oscuro-transparente`** — un velo oscuro **sobre** la escena en vez de una tapa.

Y es lo que la referencia hace. Franco lo midió: *"los claros opacos, los oscuros transparentes"*. **Sus paneles oscuros dejan ver el canvas.**

## 1.1 El problema óptico, que es el corazón del bloque

**Dos restricciones opuestas:**

- **Más velo → el texto se lee mejor, la escena se ve menos.**
- **Menos velo → la escena se ve, el texto se pierde.**

Y una trampa que hay que evitar desde el diseño:

⚠️ **El velo NO es una opacidad sobre el panel entero.** Si bajás la opacidad del panel, **el texto baja con él** y perdés las dos cosas a la vez. **El velo es un fondo semitransparente con el texto encima a opacidad plena.**

**Y hay más de una forma de hacerlo.** Elegí con criterio y **escribí por qué**:

- **Un color plano con alfa** — el más simple, y atenúa parejo.
- **Un gradiente** — más velo donde hay texto, menos donde no. Más caro y más controlable.
- **Desenfoque de fondo** — el sistema tiene `--blur-panel` y una superficie translúcida que S11 derivó justamente para eso. ⚠️ **Pero el sitio viejo tiene ~77 `backdrop-blur` anotados como deuda**: si lo usás, que sea por decisión y no por costumbre.
- **Una combinación.**

## 1.2 Lo que hay que medir para elegir

**Contra la referencia, y contra nosotros.**

| medición | por qué |
|---|---|
| **Cuánto de la escena se ve** a través de un panel oscuro de la referencia — varianza de luminancia detrás del texto contra la zona sin panel | Es el número que define "se ve la escena" |
| **El contraste de su texto** sobre ese panel | Cuánto velo compran |
| **La luminancia media de nuestra sala** en las poses de Trabajos y del Cierre | Es lo que el velo tiene que tapar |
| **Nuestro peor caso:** el logo. Sobre él el contraste medido es **1,00:1** | Si el logo pasa por donde hay texto, **ningún velo razonable lo salva** |

## 1.3 La superficie, construida

- **Como dato, igual que las otras tres.** Una sección declara su superficie y el sistema hace el resto. **Reversible editando un valor.**
- **Con su perilla**, para calibrar mirando.
- **Con su invariante**, y con control positivo: un panel `oscuro-transparente` tiene que dejar pasar varianza de la escena, y uno `oscuro-opaco` no. **Si los dos dan igual, el instrumento está ciego.**

## 1.4 ⚠️ Lo que la superficie nueva puede romper

**Tres cosas que hay que verificar antes de seguir:**

**El revelado de B3.** Existe un tratamiento para cuando la escena vuelve después de Tu panel. **Con más paneles transparentes, el momento del reingreso cambia.** Verificá que siga disparándose donde corresponde.

**La suspensión del render.** B3 suspende el dibujo mientras ningún panel transparente esté en cuadro. **Con dos secciones más abiertas, se suspende menos.** Medí el costo.

**El contraste de todo texto que quede sobre la escena.** No solo los titulares: **el cuerpo, las etiquetas, el pie, el formulario.**

## 🛑 PARADA 1 — bloqueante, y va antes de tocar una sección

Reportá:

- (a) **La medición contra la referencia**, con sus números.
- (b) **La forma de velo que elegiste y por qué**, con las alternativas que descartaste y su número.
- (c) **La tabla de las SEIS secciones opacas**, con la escena real en su pose. Para cada una:
  - qué fracción de su texto caería **sobre el logo**
  - el contraste de **cada bloque** de texto sobre el fondo real, con el peor píxel
  - el veredicto: **abre tal cual · abre con el texto acotado · no abre**
- (d) **Qué le pasa al revelado, a la suspensión y al peso.**
- (e) **Tu plan** para Trabajos y el Cierre.

⚠️ **Si alguna sección no puede abrirse sin romper AA, decilo con el número y NO la abras.** El humano decide. Y si el velo que hace legible el texto tapa tanto la escena que no se ve, **eso también es un resultado**: significa que esa sección se queda opaca.

---

# §2 · Trabajos, y el Star Wars que sí viene de algún lado

**Es la sección donde la escena no es fondo: es de dónde vienen los proyectos.**

## 2.1 La superficie

Trabajos pasa a `oscuro-transparente`. Con eso, los tres proyectos dejan de emerger de una caja negra y emergen **del fondo de la sala** — que tiene perspectiva, celosía que se aleja y partículas en dos escalas.

⚠️ **Y es distinto del campo de estrellas de la referencia, a propósito.** Ellos tienen una noche; nosotros un espacio arquitectónico. **La profundidad de la que salen los proyectos tiene que ser la nuestra.**

## 2.2 P7 estaba calibrado contra un fondo plano

El patrón lleva los planos de `translateZ −3000` a `+1000`, con su rampa de llegada. **Se calibró sobre un panel negro sin profundidad.**

⚠️ **Con una sala real detrás, el recorrido del proyecto y la perspectiva de la escena tienen que dialogar.** Un plano que viene de −3000 sobre un fondo con su propia fuga puede leerse como que flota por delante en vez de venir de adentro.

- **Medí la perspectiva de la escena en esa pose** — dónde está su punto de fuga y cuánto se aleja la celosía.
- **Y ajustá el recorrido de P7 para que los proyectos vengan de esa profundidad**, no de una arbitraria.
- ⚠️ **Sin romper la meseta que B4-A construyó:** cada proyecto llega, **se queda**, y sale, y **nunca los tres invisibles a la vez**. Su comprobación barre el pin entero: **tiene que seguir en verde.**
- **Y sin mover el techo de velocidad** de B2, que está en 4,6531.

## 2.3 El contraste

Trabajos es oscuro con texto claro, que es **la relación fácil** — la misma que hace que la referencia funcione.

- **El titular, la bajada, los nombres de los tres proyectos y sus `[MÉTRICA]`.**
- ⚠️ **Y el acento sobre fondo oscuro no puede ser texto** — 2,71 · 2,99 · 2,46. Relleno o subrayado, **y nunca el único indicador de un límite.**

---

# §3 · El Cierre, con el pie adentro

El humano lo pidió explícito: **"vuelve a la escena hasta el footer incluido"**.

- **Cierre pasa a `oscuro-transparente`**, con el pie adentro de la sección visualmente aunque el `<footer>` sea hermano del `<main>` por accesibilidad — eso no se toca.
- **Es el último cuadro del sitio**, y la coreografía ya hace un retroceso largo ahí: la cámara se aleja y el logo se va al horizonte. **Con la escena visible, ese gesto por fin se ve.**
- ⚠️ **El pie tiene mucho texto chico:** siete anclas, dos columnas de contacto, el formulario de novedades y el legal. **Es la sección con más superficie de texto del sitio.** Medí **cada bloque**, no una muestra.
- ⚠️ **El formulario de novedades tiene un `<input>` y su ayuda.** Un campo de formulario sobre una escena que se mueve es lo más difícil de este bloque: **si no pasa, el formulario lleva su propio fondo sólido.**

---

# §4 · Lo que no se toca

- **Ninguna pose, ni el anclaje, ni el progreso, ni `recorrido.ts`.** Este bloque cambia **qué se ve**, no **qué hay**.
- **El preloader, el contenido, el home actual, `/probe-escena`, `scene-camera.ts`.**
- **Servicios y Tu panel se quedan opacos**, por pedido explícito: ahí el fondo cambia y es el contraste del recorrido.
- **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
- **Quiénes somos y Números son de B6-B.** Tu tabla de la Parada 1 es su insumo: **medilas, no las abras.**

---

## Reglas absolutas

1. **Rama `v3/escena-viva`.** **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, y **`git stash`**. **Nunca `git add .`**
2. **De la referencia se MIDE, no se copia:** ni un shader, ni un selector, ni un asset. Los números sí. **Una navegación, una medición** — es un sitio ajeno en producción.
3. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
4. **No sumar dependencias.** **Cero `any`.** **Cero `setState` por frame.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
5. **Ninguna afirmación se afloja.** Si una describe una decisión que cambió, **se reescribe contra la propiedad nueva** — regla 15.
6. **Ninguna comprobación verde por vacío, ni verde por arnés.** El discriminador del segundo: **¿qué parte de esta afirmación la puso el propio instrumento?** Ninguna entrada de afuera del árbol —preferencia, breakpoint, `matchMedia`— se cierra en un render forzado.
7. **Regla 11:** toda cifra con su instrumento, y la captura es evidencia. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
8. **`prefers-reduced-motion`**: con la preferencia activa la escena **no se mueve**, y eso ya está verificado. **Con las secciones abiertas hay que volver a verificarlo**, porque ahora se ve en más lugares.
9. **PowerShell:** no hay `&&`, no hay heredoc.
10. **No auto-confirmás que se ve bien.** Podés decir *"el velo deja pasar 34% de la varianza y el texto queda en 7,2:1"*. **No podés decir "ahora se siente continuo": eso lo juzga el humano grabando, y es el gate real.**
11. Archivos de más de 300 líneas se parten. Los heredados exceptuados, no.
12. ⚠️ **Si morís por cuota, no des por hecho tu trabajo:** reportá qué quedó incompleto. Y un `workflow` que devuelve `completed` en pocos segundos **no terminó**.

## 🛑 PARADA 2 — al cerrar

- (a) `verificar` **en cero**, build en primer plano, y `frontera`.
- (b) **La superficie nueva**: su forma, su perilla, su invariante con el control que distingue transparente de opaco.
- (c) **Trabajos**: el contraste de cada bloque, la meseta todavía en verde, y **cómo dialoga P7 con la perspectiva de la sala** — con capturas de antes y después.
- (d) **El Cierre**: el contraste de **cada** bloque del pie, incluido el formulario, y qué hiciste si alguno no pasó.
- (e) **La tabla de las seis**, que es el insumo de B6-B.
- (f) **El revelado, la suspensión del render y el peso**, antes y después.
- (g) **`prefers-reduced-motion`** con las secciones abiertas, sin arnés.
- (h) **FPS** durante el recorrido, contra la línea de base.
- (i) **Que ninguna pose, ni el anclaje, ni el progreso se movieron un bit.**
- (j) Capturas, archivos y `git status`.
- (k) **Todo lo que frenó.**

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "B6-A: la escena persistente"` → `git push -u origin v3/escena-viva`.

---

## GATILLO

```
Ejecutá la instrucción completa en docs/rediseno/sprints/B6-A-escena-persistente.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y sus dos paradas son obligatorias.

Marco no negociable:
- Worktree C:\v3-escena-viva, rama v3/escena-viva. Corre EN PARALELO con
  otra sesión en C:\v3-defectos.
- ⚠️ TU PUERTO ES EL 3001. La otra usa el 3002. Chrome AL FRENTE: con
  visibilityState hidden no corre rAF y medís una página congelada.
- NO uses subagentes: el corazón del bloque es un problema óptico con dos
  restricciones opuestas —cuánto velo deja ver la escena y cuánto deja leer
  el texto— y tres subagentes lo resolverían de tres formas distintas.
- ⚠️ LA PARADA 1 ES BLOQUEANTE Y VA ANTES DE TOCAR UNA SECCIÓN. Primero la
  superficie nueva y la MEDICIÓN de las seis opacas con la escena real
  detrás. Si alguna no puede abrirse sin romper AA, decilo con el número y
  NO la abras: la decisión es mía.
- El velo NO es una opacidad sobre el panel: eso atenúa el texto también y
  perdés las dos cosas. Es un fondo semitransparente con el texto encima a
  opacidad plena.
- Nuestro peor caso es el LOGO: sobre él el contraste medido es 1,00:1. Si
  el logo pasa por donde hay texto, ningún velo razonable lo salva.
- P7 se calibró contra un fondo PLANO. Con una sala real detrás, el
  recorrido del proyecto y la perspectiva de la escena tienen que dialogar,
  o el plano se lee flotando por delante en vez de viniendo de adentro.
  Medí la perspectiva de la escena en esa pose y ajustá.
- La meseta de Trabajos NO se rompe: cada proyecto llega, se queda y sale, y
  nunca los tres invisibles a la vez. Su comprobación barre el pin entero.
- El pie es la sección con más superficie de texto del sitio: medí CADA
  bloque, no una muestra. Y si el formulario no pasa, lleva su propio fondo
  sólido.
- NO toques ninguna pose, ni el anclaje, ni el progreso, ni recorrido.ts.
  Este bloque cambia QUÉ SE VE, no QUÉ HAY.
- Servicios y Tu panel se quedan OPACOS por pedido explícito. Quiénes somos
  y Números son de otro bloque: medilas, no las abras.
- El búfer de WebGL no se lee desde la página: toda medición de la escena va
  por Page.captureScreenshot.
- De la referencia se MIDE, no se copia. Una navegación, una medición.
- Ninguna comprobación verde por vacío ni verde por arnés. El discriminador:
  ¿qué parte de esta afirmación la puso el propio instrumento?
- El build en primer plano. El chequeo de procesos por RUTA DE WORKTREE, no
  por comando: el filtro por comando ya mató el envoltorio de la sesión
  vecina.
- NUNCA git stash, checkout, restore ni ninguna escritura de git en el
  árbol. Para leer HEAD: git show HEAD:<ruta>.
- Git: commit y push en v3/escena-viva. PROHIBIDO merge, reset, rebase, push
  --force. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- Podés decir «el velo deja pasar 34% de la varianza y el texto queda en
  7,2:1». NO podés decir «ahora se siente continuo»: eso lo juzgo yo
  grabando, y es el gate real del bloque.

Arrancá por la §1. No me confirmes el entendimiento.
```
