# B4-B · LA MEDICIÓN — el reporte

**Qué es.** Todo lo que durante veinte sprints decía «no se puede sin navegador»,
medido. **Este lane mide y no arregla nada**: lo que produce es un inventario de
defectos con su causa, que alimenta al sprint siguiente.

**Dónde y cuándo.** Worktree `C:\v3-medicion\logic-core-v3`, rama `v3/medicion`,
sobre `9777d233`. 6 de septiembre de 2026. **Puerto 3002** para el sitio en
desarrollo; **3005** para el build de producción (`.next-probe`). Corrió en
paralelo con B4-A en `C:\v3-costura`, que usa el 3001.

**Cero archivos de producto tocados.** `git status` al cierre de la Fase 0:
tres entradas, las tres nuevas y todas del banco o del reporte.

---

## ⛔ EL HALLAZGO DEL SPRINT — `prefers-reduced-motion` NO SE HONRA, Y EL INSTRUMENTO QUE TENÍA QUE DETECTARLO LO ESTABA TAPANDO

Va arriba de todo y no como el primero de una lista de trece, porque no es un
defecto más: **es un defecto de accesibilidad en producción sostenido por un
invariante en verde durante todos estos sprints.**

### Los dos hechos

**Uno.** `_lib/motion/__tests__/reducido.invariant.tsx` renderiza el árbol a
través de `<MotionConfig reducedMotion={preferencia}>` **y después afirma sobre
esa misma `preferencia`**. O sea: **inyecta el valor bajo prueba y comprueba que
el árbol le hace caso.** Eso es verdad y es una propiedad real —el mecanismo de
forzado funciona— pero **no dice absolutamente nada sobre si el camino de
producción produce alguna vez ese valor.** El invariante prueba el arnés, no el
sitio.

**Dos.** El camino de producción **no lo produce nunca**. Medido a 1920 con la
preferencia emulada de verdad por `Emulation.setEmulatedMedia`:

| | elementos con `transform` en línea | piezas de texto partido | `matchMedia` |
|---|---|---|---|
| sin la preferencia | 2.380 | 5 | `false` |
| **con la preferencia** | **2.380** | **5** | **`true`** |

**Idénticas.** Con `matchMedia` devolviendo `true` en la misma página. La
emulación llega perfecto; lo que no llega es del media query al árbol.

La causa, leída del fuente: `useMovimientoReducido()` hace
`useReducedMotionConfig() ?? false`, y ese hook de `motion` **mira primero el
contexto**:

```js
if (reducedMotion === "never") return false        // ← corta acá
else if (reducedMotion === "always") return true
else return reducedMotionPreference                // ← el media query, nunca se llega
```

El default de `MotionConfigContext` es, textual, `reducedMotion: "never"`. Y **en
todo `/v3` no hay un solo `<MotionConfig>`** fuera del arnés de invariantes. Por
eso el invariante es la única parte del sistema donde la preferencia existe.

> **`prefers-reduced-motion` no se honra en la coreografía del DOM de `/v3`, para
> ningún visitante, tenga la preferencia puesta o no.** Y el docblock de
> `reducido.ts` explica la elección sin ver la consecuencia: *«`useReducedMotionConfig`
> y no `useReducedMotion`: el segundo lee sólo el media query y no ve el contexto,
> con lo cual **no se podría forzar en una comprobación**»*. Se eligió
> testeabilidad y se perdió la función.

### ⚠️ POR QUÉ NINGUNA REGLA DEL PROYECTO LO AGARRÓ — y por qué eso es una clase nueva

Esto es lo que hay que llevarse. **El invariante cumplía todas las reglas de este
repo:**

| regla del proyecto | ¿la cumplía? |
|---|---|
| «Ninguna comprobación verde por vacío» | **sí** — tenía afirmaciones reales, no una lista vacía |
| «Control positivo obligatorio» | **sí** — y bueno: sin la preferencia afirma que las transformadas y el texto partido **sí** aparecen |
| «Toda cifra con su instrumento» | **sí** |
| «No auto-confirmás que se ve bien» | **sí** |
| «Ninguna afirmación se afloja» | **sí** — nunca se relajó |

**No falló ninguna de las cinco. Falló algo que ninguna cubre:** el instrumento
**construía la condición que después medía**. Un control positivo demuestra que el
instrumento **ve el cambio**; no demuestra que **el cambio ocurra en producción**.
Cuando la entrada bajo prueba la inyecta el propio test, lo que queda verificado es
el arnés.

Es hermano de «verde por vacío» y no es el mismo: aquél pasa porque no mide nada;
éste pasa porque **mide algo real que no es lo que se quería saber**.

> ### 🔵 LA REGLA QUE SALE DE ESTO — «verde por arnés»
>
> **Cuando una comprobación tiene que FORZAR una entrada para observarla, esa
> comprobación mide el arnés y no el sistema.** Vale igual, pero **no cierra la
> propiedad**: hace falta una segunda afirmación, por un camino distinto, de que
> **el camino de producción produce esa entrada**.
>
> **El discriminador, en una pregunta:** *¿qué parte de esta afirmación la puso el
> propio instrumento?* Si la respuesta incluye la entrada bajo prueba, lo que se
> está midiendo es el arnés.
>
> **Dónde aplica en este repo, y no es sólo acá:** toda afirmación sobre una
> entrada que viene de AFUERA del árbol —una preferencia del usuario, un
> breakpoint, un `matchMedia`, una variable de entorno, un rol de sesión— **no se
> puede cerrar en un render forzado.** O se mide en el navegador, o se afirma
> aparte que producción produce esa entrada.
>
> El arreglo de D1 tiene que traer las dos mitades: la línea que hace funcionar la
> preferencia, **y** el fortalecimiento del invariante — nunca su relajación.

**El detalle completo, el discriminador de cuatro casos que aisló la causa y el
alcance acotado están en D1, §2.** Ahí también queda dicho lo que NO se midió: si
la escena honra la preferencia es **lectura del fuente y no medición**.

---

## 0 · LO QUE FRENÓ, Y CÓMO SE DESTRABÓ

### 0.1 🔴 El navegador estaba tomado por el otro lane

`chrome-devtools-mcp` levanta **un** Chrome sobre **un** `userDataDir` fijo:
`~/.cache/chrome-devtools-mcp/chrome-profile`. B4-A lo tomó primero. Toda llamada
de este lado devolvía, textual:

```
The browser is already running for C:\Users\Valentino\.cache\chrome-devtools-mcp\chrome-profile.
Use a different `userDataDir` or stop the running browser first.
```

Verificado en el árbol de procesos, no supuesto: el `chrome.exe` que sostiene ese
perfil cuelga del servidor MCP del **otro** `claude.exe` (pid del navegador →
servidor MCP `75608` → `claude.exe 54680`; esta sesión es `claude.exe 70596`, con
el servidor `80024`, que nunca lanzó nada).

**Las dos salidas obvias eran las dos malas.** Matar ese Chrome rompe la medición
del otro lane en la mitad; esperar deja este bloque sin instrumento por tiempo
indefinido.

**La salida que se tomó: un Chrome propio, por CDP directo desde Node.**
`scripts-b4/cdp.ts`, sin una sola dependencia nueva —`WebSocket` es global en
Node desde la 22 y acá corre la 24—. Y termina dando **más** que la herramienta
MCP: `Emulation.setEmulatedMedia` para `prefers-reduced-motion` (que el MCP no
expone y que la instrucción pide medir), recortes en coordenadas de documento, y
cifras que salen de un script commiteado en vez de una transcripción de llamadas.

> **Consecuencia para el que lea esto:** dos lanes con `chrome-devtools-mcp` **no
> pueden medir a la vez**. O se coordinan en el tiempo, o el segundo necesita un
> driver propio. Ahora hay uno, commiteado.

### 0.2 🟡 El build de producción se queda sin memoria con el heap por defecto

`npm run build` murió con `FATAL ERROR: Reached heap limit — JavaScript heap out
of memory` a los 109 s, con el heap en 2 GB. Con
`NODE_OPTIONS=--max-old-space-size=8192` compiló limpio (exit 0).

Es plausible que sea circunstancial —dos `next dev` corriendo a la vez, uno por
lane— y por eso va como freno y no como defecto del repo. **Pero conviene tenerlo
escrito**: en esta máquina, con los dos lanes arriba, el build necesita el heap
subido.

### 0.3 🟡 La categoría «performance» de Lighthouse no la produce esta cadena

No es del bloqueo de arriba: es de la herramienta. La descripción de
`lighthouse_audit` dice, textual, *«Get Lighthouse score and reports for
accessibility, SEO, best practices, and agentic browsing. **This excludes
performance.** For performance audits, run `performance_start_trace`»*.

O sea que **el «Lighthouse ≥ 80» del presupuesto declarado no se puede verificar
con lo que hay**, ni con MCP ni sin él. Lo que sí se puede es medir LCP, CLS y
TBT directamente, que es de donde esa categoría sale. Ver el frente A.

---

## 1 · EL BANCO DE MEDICIÓN (Fase 0)

El detalle completo está en **`docs/rediseno/MEDICION-B4.md`**, que es el contrato
que los tres frentes leyeron antes de medir. Acá, lo que hay que saber para leer
las tablas:

- **Siete perfiles** (`scripts-b4/perfiles.ts`): `375` `393` `768` `1024` `1025`
  `1440` `1920`. `1024` y `1025` comparten el alto a propósito: son el par que
  straddlea la compuerta y la única variable tiene que ser el ancho.
- **Todo es EMULADO**, y la palabra es literal: abajo corre Blink y no WebKit; el
  `devicePixelRatio` va en 1 en los siete cuando el SE real es 2 y el 15 real es
  3. **La nitidez del glifo y el costo de GPU no se miden.** El layout sí.
- **Ningún perfil pisa el `userAgent`**, porque un Blink que dice ser WebKit es
  una mentira que el lector no puede detectar. Y no hace falta: `compuerta.ts`
  dice, textual, «por ancho, no por táctil».
- **El estrangulamiento es un eje aparte** y sólo lo usa el frente A. Sus números
  están escritos, no nombrados: un preset del panel cambió de nombre y de valores
  más de una vez.
- **`banco.invariant.ts`: 57 afirmaciones, 0 fallas.** Cada instrumento con su
  control positivo, y los controles prueban la definición, no el código: el del
  aire muerto afirma que **un degradé suave se lee como AIRE**, que es la
  propiedad que B1 puso en la definición.

### 1.1 ⚠️ DOS REGLAS DE CAPTURA QUE NADIE TENÍA ESCRITAS, Y VALEN DECENAS DE PUNTOS

Las dos salieron de `scripts-b4/diagnostico-captura.ts`, disparadas por un número
que no cerraba: el humo del banco dio **77,59 %** de aire muerto en el hero a
1920, y B1 había publicado **0 %**.

**(a) La escena tarda entre 300 y 700 ms en dibujar su primer cuadro.**

| t desde `load` | aire muerto del hero |
|---|---|
| 0 ms | **77,59 %** |
| 300 ms | 76,11 % |
| **700 ms** | **0,00 %** |
| 2000 ms | 0,00 % |

No es un margen de error: es la diferencia entre «esta sección está llena» y
«esta sección está vacía». Toda captura del banco espera 1200 ms.

**(b) Un recorte sólo vale si el scroll ESTÁ en la región que recorta.** El
escenario es `fixed inset-0`, así que Chrome lo compone una sola vez, donde está
la ventana. Medido sobre `por-que-develop`, que arranca en el píxel 17.280:

| cómo se pidió | aire muerto |
|---|---|
| recorte de esa región con el scroll en **0** | **95,09 %** |
| viewport con el scroll en 17.280 | **0,00 %** |
| recorte de esa región con el scroll en 17.280 | **0,00 %** |

**Noventa y cinco puntos por dónde estaba el scroll**, con el mismo recorte y el
mismo instante.

> **El corolario que hay que tener escrito:** una captura más alta que la ventana
> **no puede** representar lo que se ve en una página con capa fija. Hoy el
> peligro está **desactivado por el layout** —las dos secciones
> `papel-transparente` miden exactamente una pantalla— así que las capturas por
> sección de B1 y B2 no lo sufrieron. **Es suerte de la tabla, no una propiedad
> del método**, y deja de valer el día que `hero` o `por-que-develop` crezcan.

### 1.2 El instrumento de B1 se perdió dos veces, y ahora está commiteado

`B2-DELTAS` §7 lo dice: «en el scratchpad, y no van al repo». B1 escribió
`pixeles.js`, se perdió; B2 lo reescribió, se volvió a perder. **El de B4 está en
`scripts-b4/` y se commitea.**

Mientras tanto, la advertencia que gobierna toda comparación con las tablas
viejas: **un número de este banco no es la continuación de uno de B1**, es una
medición nueva con la misma definición. Por eso el frente B midió **también el
escritorio con este banco**, y comparó contra eso.

La única cifra que ata los dos bancos: **el hero da 0,00 % con el instrumento
reconstruido, igual que con el perdido.** Es una afirmación de `humo.ts`.

---

## 2 · EL INVENTARIO DE DEFECTOS, ORDENADO POR GRAVEDAD

Ordenado por gravedad y **no por frente**, que es como se pidió. Cada uno con su
causa y su evidencia. **Ninguno está arreglado**: es lo que define a este lane.

---

### 🔴 D1 · `prefers-reduced-motion` SE IGNORA POR COMPLETO EN LA COREOGRAFÍA DEL DOM

> **Está desarrollado arriba de todo, en «EL HALLAZGO DEL SPRINT».** Queda acá para
> que el inventario por gravedad esté completo, no para repetirlo.

En una línea: `useMovimientoReducido()` devuelve `false` para todos los visitantes
reales, porque `useReducedMotionConfig` corta en el contexto —default
`reducedMotion: "never"`— y `/v3` no monta ningún `<MotionConfig>`. Medido: 2.380
transformadas en línea, **idénticas con y sin la preferencia**, con `matchMedia` en
`true`. Y `reducido.invariant.tsx` está verde porque **fuerza el valor que después
afirma**.

**El discriminador de cuatro casos** que aisló la causa (`c-reducido-discriminador.json`):

| caso | `transform` en línea | texto partido | `matchMedia` |
|---|---|---|---|
| 1 · sin la preferencia | 2.380 | 5 | `false` |
| 2 · **con la preferencia, antes de navegar** | **2.380** | **5** | **`true`** |
| 3a · cargada sin la preferencia | 2.380 | 5 | `false` |
| 3b · la misma página, preferencia puesta después | 2.450 | 5 | `true` |

La primera versión del discriminador tenía **dos** causas candidatas (la emulación
no llega / el sitio sólo lee el cambio) y **las dos dieron que no**. La tercera la
cerró la lectura del fuente. Queda escrito porque el modo de falla es el del
sprint: *una dicotomía incompleta produce un veredicto seguro y equivocado*.

**Alcance, acotado:** es sólo la coreografía del DOM. La escena usa otro hook
—`@/lib/use-reduced-motion`, que sí lee `mq.matches`— así que probablemente sí la
honra. ⚠️ **Eso es derivado del fuente y NO medido**: el cuarto caso del
discriminador (contar cuadros de `rAF` con y sin) **no discriminó** —`rAF` late a
75 Hz anime o no la escena— y se reporta como no medido, no como confirmado.

- **Dónde:** `src/app/v3/_lib/motion/reducido.ts:84`
- **Arreglable sin decidir:** sí. §4 — **con las dos mitades**: la línea, y el
  fortalecimiento del invariante.

---

### 🔴 D2 · EL PIN DE `servicios` NO PINEA EN NINGÚN PERFIL, NI SIQUIERA A 1920

Medido con scroll real, parando y leyendo la posición del hijo pegado
(`b-pines.json`) — nunca por geometría.

| perfil | `trabajos` | `servicios` |
|---|---|---|
| 375 · 393 · 768 · 1024 | **no existe** (ver D3) | **no pinea** — 0 paradas pegado de 243 |
| 1025 | pinea, 1.500 px (1,95 pantallas) | **no pinea** — 0 px |
| 1920 | pinea, 2.160 px (2 pantallas) | **no pinea** — 0 px |

**La causa, y explica los dos casos con el mismo mecanismo.** El hijo pegado de
`servicios` es `<div class="w-full sticky top-0 min-h-svh">` y mide
**2.940,84 px a 375 y 3.324,78 px a 1920** — o sea **tan alto como su bloque
contenedor**. Un elemento `sticky` sólo se despega mientras le queda recorrido
dentro de su contenedor; si lo llena entero, **no le queda ni un píxel** y nunca
se pega. `trabajos` sí anda porque su hijo pegado mide **exactamente una
ventana** (1.080 a 1920) y le sobran 2.160 px para viajar.

Y no es un ancestro con `overflow`, que era la sospecha barata: el instrumento lo
buscó y devuelve `ancestroQueRecorta: null` en los seis perfiles.

⚠️ **Lo que NO se determinó, y no se va a insinuar:** B1 publicó este pin
**andando** a 1920 (7.560 → 9.720, 2.160 px). Hoy no anda. Si eso es una
regresión de B2/B3 o si B1 midió otro elemento **no está determinado por esta
medición**, y hace falta mirar el diff de la composición de Servicios para
saberlo.

- **Dónde:** el hijo `sticky` de `_secciones/servicios/`
- **Arreglable sin decidir:** no — tocarlo cambia la composición de la secuencia.

---

### 🔴 D3 · ABAJO DE 1025 EL PIN DE `trabajos` NO EXISTE, Y LA PREMISA DEL FUENTE DICE QUE SÍ

`_lib/compuerta.ts` afirma, textual:

> «Abajo de 1025: sin canvas y sin coreografía. **El `sticky` SÍ cruza**, y esa es
> media razón para haberlo hecho con CSS: no depende de JavaScript, así que
> **mobile conserva el ritmo del pinneado gratis**, sin bajar un byte de más.»

Medido: **abajo del umbral hay 2 elementos con `position: sticky`; arriba hay 3.**
El que falta es el de `trabajos`. De los 2 que hay en mobile, uno anda (un
`<header>` de alto 0, que es el envoltorio de la pastilla) y el otro es el de
`servicios`, que no anda por D2.

**O sea: de los dos pines del recorrido, mobile no conserva ninguno.** La premisa
está refutada por medición, igual que las cuatro que B1 y B2 dieron vuelta.

- **Arreglable sin decidir:** no — es una decisión de composición.

---

### 🟠 D4 · CERO ACONTECIMIENTOS ABAJO DE 1025, EN LOS CUATRO PERFILES

Es el hallazgo que la instrucción anticipó, y está **probado que no es un cero
ciego** (`b-censo.json`, censo de `B2-DELTAS` §0, paso 120 px):

| perfil | paradas | estilo en línea por parada | acontecimientos | piezas | hueco máx |
|---|---|---|---|---|---|
| 375 | 122 | 21 / 21 | **0** | 0 | — |
| 393 | 136 | 21 / 21 | **0** | 0 | — |
| 768 | 149 | 21 / 21 | **0** | 0 | — |
| **1024** | 117 | 21 / 21 | **0** | 0 | — |
| **1025** | 114 | 21 / **130** | **18** | **188** | **1,09 pantallas** |

**El par 1024/1025 es el experimento limpio:** mismo alto (768), un píxel de
ancho de diferencia, **0 → 18 acontecimientos**. Y lo confirma
`b-compuerta.json` por otra puerta: a 1024, **cero `<canvas>` y cero pedidos de
chunk**; a 1025, **un canvas y un pedido**.

El cero es real y no del instrumento: hay **21 elementos con estilo en línea en
cada parada**, constantes, o sea que el censo vio la página y lo que no hay es
nada que aterrice.

- **Arreglable sin decidir:** no — es la decisión de la compuerta.

---

### 🟠 D5 · EL AIRE MUERTO DE MOBILE ES PEOR QUE EL DE ESCRITORIO, Y `numeros` ES EL PEOR EN TODOS

Medido con el instrumento de `B1-DELTAS` §3 reconstruido, sobre 40 capturas, con
lazo de asentamiento (`b-aire-muerto.json`). La vara heredada de B1 es **ninguna
banda vacía continua por encima de 104 px**.

| perfil | promedio | máximo | banda vacía máx | secciones sobre la vara |
|---|---|---|---|---|
| 375 | 62,32 % | 85,66 % (`numeros`) | 505 px | **4 / 8** |
| 393 | 64,98 % | 88,72 % (`numeros`) | 832 px | **4 / 8** |
| 768 | **65,79 %** | **89,45 %** (`numeros`) | **1.004 px** | **7 / 8** |
| 1024 | 53,97 % | 85,29 % (`numeros`) | 693 px | 5 / 8 |
| **1920 (control, mismo banco)** | 57,99 % | 89,23 % (`trabajos`) | 2.256 px | 4 / 8 |

Sección por sección (aire % / banda px):

| sección | 375 | 393 | 768 | 1024 | 1920 |
|---|---|---|---|---|---|
| hero | 62,8 / 143 | 70,8 / 235 | 75,6 / 319 | 71,1 / 221 | **0,0 / 0** |
| quiénes somos | 72,1 / 277 | 76,4 / 387 | 73,0 / 447 | 57,1 / 200 | 70,7 / 784 |
| **números** | **85,7 / 505** | **88,7 / 660** | **89,5 / 953** | **85,3 / 693** | 86,9 / 979 |
| trabajos | 69,1 / 462 | 79,8 / 832 | 70,5 / 1004 | 31,6 / 202 | 89,2 / 1821 |
| servicios | 49,0 / 69 | 49,9 / 69 | 61,7 / 375 | 46,7 / 146 | 84,2 / 2256 |
| tu panel | 56,9 / 84 | 57,2 / 84 | 60,3 / 99 | 57,1 / 84 | 64,4 / 99 ⚠ |
| por qué develOP | 35,8 / 36 | 34,7 / 36 | 31,6 / 110 | 26,8 / 51 | **5,5 / 41** |
| cierre | 67,2 / 83 | 62,3 / 83 | 64,1 / 114 | 56,1 / 81 | 63,1 / 102 |

⚠ `tu-panel` a 1920 es la única celda que **no se asentó** en 5 intentos: no se
debe citar como estable.

**Y el hallazgo que las filas del hero y de `por-que-develop` explican juntas:** el
hero da **0,0 %** a 1920 y **63–76 %** en mobile; `por-que-develop` da **5,5 %**
contra **27–36 %**. Son **las dos secciones `papel-transparente`**, y lo que las
llena a 1920 es la escena. Abajo de 1025 la compuerta no la monta, así que **las
dos quedan literalmente vacías**. El aire muerto de mobile no es «la misma página
más angosta»: es una página a la que le sacaron la mitad del contenido visual.

- **Arreglable sin decidir:** no — hay que decidir qué va en esas dos secciones
  abajo del umbral.

---

### 🟠 D6 · LOS TRES ENLACES DE PROYECTO DE `trabajos` NO LLEGAN AL MÍNIMO DE ÁREA DE TOQUE

WCAG 2.5.8 (AA, 2.2) pide **24 × 24 px**. Medido sobre la caja tocable
(`b-toque.json`):

| perfil | objetivos | **abajo de 24** | entre 24 y 44 | 44 o más |
|---|---|---|---|---|
| 375 | 21 | **4** | 14 | 3 |
| 393 | 35 | **7** | 22 | 6 |
| 768 | 35 | **7** | 22 | 6 |
| 1024 | 35 | **7** | 22 | 6 |
| 1920 | 41 | **4** | 31 | 6 |

Los infractores son **siempre los mismos tres**, los enlaces de proyecto:

```
trabajos  <a> "Esquina"     63,63 × 20 px  (375)  …  48,89 × 15,3 px  (1920)
trabajos  <a> "El Garage"   76,73 × 20 px  (375)  …  58,96 × 15,3 px  (1920)
trabajos  <a> "Banú"        41,27 × 20 px  (375)  …  31,71 × 15,3 px  (1920)
selector: article.flex.w-full > div.flex.flex-wrap > h3.font-titulo.text-fluido-titulo-s > a
```

**El peor caso es a 1920, no en mobile: 15,3 px de alto**, porque el interlineado
de título aprieta la caja del enlace cuando el cuerpo crece.

El cuarto infractor es `<button> "intro ⌥I"` (67 × 23 px), que es un **afford de
desarrollo** y no producción — se anota aparte para que nadie lo cuente como
defecto del sitio.

- **Arreglable sin decidir:** sí. §4.

---

### 🟡 D7 · `/v3/tipografia/muestra` DESBORDA HORIZONTALMENTE A 375

Medido con el mismo override, el mismo Chrome y la misma receta:

| ruta | `innerWidth` (viewport de layout) | `scrollWidth` | `visualViewport.width` |
|---|---|---|---|
| `/v3` | 375 | 375 | 375 |
| **`/v3/tipografia/muestra`** | **638** | **638** | **375** |
| `/v3/tipografia` | 375 | 375 | 375 |

La ventana **es** de 375 —`outerWidth` y `visualViewport` lo confirman— y lo que
se ensancha es el viewport de layout, porque el contenido no entra. Es la firma
exacta de un desborde horizontal bajo emulación móvil.

**Y rompe de raíz la medición que esa ruta existe para permitir:** los seis
niveles fluidos usan `clamp()` con `vw`, así que resolverlos contra 638 devuelve
**el tamaño de otro ancho**. El paso 4 de la receta lo frenó en vez de dejar pasar
un número plausible — que es exactamente para lo que está.

La ruta madre `/v3/tipografia` **no** desborda: pone su scroll horizontal en un
contenedor con `overflow-x: auto`, a propósito.

- **Dónde:** `src/app/v3/tipografia/muestra/` y sus dos bloques
- **Arreglable sin decidir:** sí. §4. Es una ruta de instrumento con fecha de
  baja (2026-12-31), así que la gravedad para el sitio público es baja.

---

### 🟡 D8 · A 375 LA ESCALA TIPOGRÁFICA SE COMPRIME A UN PÍXEL ENTRE CUATRO NIVELES

Medido montando una sonda por nivel en el DOM vivo de `/v3`, con las clases de
`_lib/tipografia.ts`, y leyendo el `font-size` computado (`b-tipografia.json`).
Control positivo: una clase inventada resuelve al heredado (16 px) y no a uno
propio, en los cinco perfiles.

| nivel | 375 | 393 | 768 | 1024 | 1920 |
|---|---|---|---|---|---|
| micro | 10 | 10 | 10 | 10 | 10 |
| caption | 11 | 11,02 | 11,37 | 11,61 | 12,45 |
| cuerpo | 15 | 15 | 15 | 15 | 15 |
| base | 16 | 16 | 16 | 16 | 16 |
| **titulo-s** | **17** | 17,05 | 18,11 | 18,83 | 21,35 |
| **titulo-m** | **18** | 18,24 | 23,17 | 26,53 | 38,31 |
| titulo-l | 24 | 24,34 | 31,38 | 36,19 | 53,01 |
| titulo-xl | 36 | 36,34 | 43,38 | 48,19 | 65,01 |

**Ningún salto está colapsado** —no hay dos niveles con el mismo px— pero las
razones cuentan otra cosa:

| salto | 375 | 1920 |
|---|---|---|
| cuerpo → base | ×1,07 | ×1,07 |
| **base → titulo-s** | **×1,06** | ×1,33 |
| **titulo-s → titulo-m** | **×1,06** | **×1,79** |

**A 375, un `titulo-m` mide 18 px contra un `base` de 16: dos píxeles para dos
niveles de jerarquía.** A 1920 esos mismos dos saltos valen ×1,33 y ×1,79. La
jerarquía entre el cuerpo y los dos títulos chicos prácticamente desaparece en el
piso de la banda fluida.

- **Arreglable sin decidir:** no — mover la banda es una decisión de sistema.

---

### 🟡 D9 · LA RUTA DE LA TIPOGRAFÍA MUESTRA LOS OCHO NIVELES SÓLO EN TITLE CASE

La instrucción pide los ocho niveles «con texto real en Title Case **y en
minúscula**». `_bloques/Escala.tsx` recorre `NIVELES` y renderiza los ocho con
`MUESTRA_TITULAR` (Title Case); la comparación mayúscula/minúscula existe **sólo
para `titulo-xl` y `titulo-l`** — **2 de 8**.

Y es justo la mitad que el empate necesita: la cap height manda en Title Case y la
x-height en minúscula, y el empate es entre esas dos.

- **Dónde:** `src/app/v3/tipografia/_bloques/Escala.tsx`
- **Arreglable sin decidir:** sí. §4.

---

### 🟡 D10 · EL TECHO DE VELOCIDAD SE RESPETA SÓLO EN PROMEDIO

La pregunta de la instrucción era literal: *«¿el techo se respeta en todo el
recorrido o sólo en promedio?»*. Medido cuadro a cuadro con scroll real a 1920,
766 cuadros, el documento entero (`c-velocidad.json`):

| | |
|---|---|
| techo de B2 | **1,0** altura de cuadro por pantalla |
| media medida | **0,7239** — cumple |
| **cuadros que lo pasan** | **208 de 766 = 27,15 %** |
| pico medido cuadro a cuadro | **4,6531** |
| pico sobre la grilla de 100 px (el método de B2) | **4,1986** |
| lo que B2 publicó (antes → después) | 6,0945 → 4,6198 |

> **Respuesta: sólo en promedio.** Más de uno de cada cuatro cuadros del recorrido
> va por encima del techo, y el pico lo cuadruplica y medio.

**Y el método agrega algo, con su número:** la grilla de 100 px **no puede ver un
10,8 % del pico** (4,1986 contra 4,6531), porque el máximo cae entre dos puntos de
la grilla. El pico vive en el tramo 15 —la ventana del regreso, `por-que-develop`—
que es exactamente donde `B2-DELTAS` §2.3 dijo que la cámara llega al 96,8 % de su
arco.

⚠️ **Qué es medido y qué es derivado, declarado:** el `scrollY` de cada cuadro y el
reloj de cada cuadro son **medidos**; la velocidad de la cámara en esa posición es
**derivada** con `velocidadEnScroll` de `scripts-b2/velocidad.ts` — el mismo
instrumento con el que B2 publicó. **La escena no expone su pose al DOM**
(`EscenaDelHome.tsx` emite `data-escena` y `data-escena-fase`, nada más) y el búfer
de WebGL no se puede leer desde la página. Inventar una lectura de cámara habría
sido peor que declarar la composición.

- **Arreglable sin decidir:** no — es la coreografía.

---

### 🟡 D11 · EL PRELOADER NO ARMA BAJO AUTOMATIZACIÓN, ASÍ QUE NINGUNA MEDICIÓN AUTOMÁTICA LO VE

`introBoot.tsx` apaga el intro cuando `navigator.webdriver === true`. Es por
diseño. La consecuencia **no** lo es: **toda medición automatizada de este
proyecto —incluida la de este bloque— excluye el preloader** salvo que se
restituya el gate a mano.

Medido y con control positivo (`a-gate-del-intro.json`):

| carga | `webdriver` | `intoArmo` | overlay visible |
|---|---|---|---|
| primera visita | `true` | **`false`** | `false` |
| visita repetida | `true` | `false` | `false` |
| **primera visita con el gate restituido** | `false` | **`true`** | **`true`** |

Con el gate restituido, la cronología real del overlay a 1920, sin estrangular
(`a-preloader-cronologia.json`): la pantalla deja de estar oscura entre los **1.500
y los 2.000 ms**, el evento `home-intro-finished` cae a los **7.382 ms**, y el
overlay se apaga a los **7.474 ms**. El `<h1>` está visible con opacidad 1 **desde
el primer muestreo**, que es por qué el LCP no cambia entre las tres cargas.

- **Arreglable sin decidir:** no aplica — es una decisión de diseño ya tomada. Lo
  que hay que corregir es el hábito de creerle a una medición automatizada sobre
  el preloader.

---

### 🟡 D12 · ESCRIBIR CAPTURAS DENTRO DE `docs/` CON EL NAVEGADOR ABIERTO CORROMPE LA MEDICIÓN

Hallazgo del frente C, con su número. `docs/` **no** está en `.gitignore`, así que
un PNG nuevo ahí cae adentro del árbol que vigilan el `next dev` de este worktree y
la auto-detección de fuentes de Tailwind 4.

Medido: escribiendo las capturas en su destino final, **dos aterrizajes de la misma
corrida dieron `top` de 1.066 y de −1.979 px, y el documento saltó de 16.224 a
19.025 px y volvió**. Sin escribir un byte, las 21 lecturas dan 72 px y se repiten
entre corridas.

Es el mismo mecanismo que `CLAUDE.md` documenta para un `distDir` alternativo,
disparado por otra puerta. La salida que el frente adoptó: escribir en
`os.tmpdir()` y mudar los archivos **después de cerrar el navegador**.

Y hay un segundo síntoma del mismo entorno, medido aparte
(`b-vigilia-canvas.json`): **`next dev` recarga la pestaña por su cuenta** — el
reloj del documento saltó de 50.335 ms a 836 ms a los 49,5 s de una corrida.

- **Arreglable sin decidir:** no es del sitio; es del método. Ya está escrito.

---

### 🔵 D13 · EL BUILD DE PRODUCCIÓN SE QUEDA SIN MEMORIA CON EL HEAP POR DEFECTO

`FATAL ERROR: Reached heap limit` a los 109 s con el heap en 2 GB, con los dos
`next dev` de los dos lanes corriendo. Con `--max-old-space-size=8192`, exit 0.

- **Arreglable sin decidir:** sí, si se decide que el repo fije `NODE_OPTIONS`.

---

## 3 · LAS DECISIONES — lo que NO es un defecto

Un desborde horizontal es un defecto; un techo de presupuesto que no se alcanza es
una decisión. Acá va lo segundo, separado a propósito.

### Dec-1 · EL TECHO DE 300 KiB, con el número real y su dueño

Medido sobre el build de producción (`.next-probe`, `buildId RNJ_7OrwmSYE84zZiWvNa`),
`<script src>` del HTML prerenderizado + `gzipSync` de `node:zlib`
(`a-peso.json`). **25 archivos, 1.174,7 KiB crudo, 380,0 KiB gzip.**

| grupo | archivos | crudo | **gzip** | de quién |
|---|---|---|---|---|
| piso del framework | 4 | 320,9 KiB | **106,1 KiB** | Next (`rootMainFiles` + `polyfillFiles`) |
| **SDK de Sentry** | 1 | 466,7 KiB | **142,1 KiB** | `instrumentation-client.ts` |
| chrome del layout raíz | 16 | 325,8 KiB | **112,4 KiB** | el layout viejo, compartido con el home |
| **propio de `/v3`** | 4 | **61,3 KiB** | **19,4 KiB** | este track |
| **total** | **25** | **1.174,7 KiB** | **380,0 KiB** | |

El portador de Sentry se identificó **por huella** (`browserTracingIntegration`),
no por nombre de chunk, con cuatro controles positivos — incluido que una huella
inventada devuelve 0 archivos y que `descontarElSdk` devuelve `null` con un
portador que no está en el conjunto.

> **La cifra que abre la decisión: sin el SDK de Sentry, la carga inicial de `/v3`
> mide 238,0 KiB gzip — abajo de los 300 originales.**

Y el SDK **no se puede diferir**: sin `init`, `global-error.tsx` descarta el evento
devolviendo un id igual y no avisa en producción.

**RECOMENDACIÓN — reportada, NO aplicada.** Re-fijar el techo con la forma de la
regla 13, que es la que `presupuesto.ts` ya usa para todo lo demás:

- **se AFIRMA lo propio** — hoy `19,4 KiB gzip` en 4 archivos (o `112,4 + 19,4 =
  131,8 KiB` si se cuenta el chrome del layout raíz, que es lo que
  `presupuesto.ts` llama «sobre el piso» y afirma contra 300);
- **se PUBLICA lo heredado con su dueño** — `106,1 KiB` de Next más `142,1 KiB` de
  Sentry, que ningún sprint de este track puede tocar.

**No se editó `presupuesto.ts` ni ningún invariante.**

⚠️ El CSS va aparte y no entra en esa suma: 4 hojas, **525,7 KiB crudo · 68,5 KiB
gzip**. El presupuesto declarado es de JS.

### Dec-2 · `s5-peso` en rojo: 61,3 KiB crudo contra 60

**Es el rojo conocido, del otro lane, y no se tocó.** Verificado contra el build de
producción: `lo propio de /v3` mide **61,3 KiB crudo**, −1,3 KiB de aire. Coincide
al decimal con lo que midió el frente A por otra puerta, y con lo que
`B2-DELTAS` §10 ya había publicado.

### Dec-3 · Lighthouse no se pudo correr, y la causa es exacta

Dos capas, las dos declaradas:

1. `lighthouse_audit` de `chrome-devtools-mcp` **excluye la categoría performance
   por diseño** — o sea que el «≥ 80» del presupuesto no lo produce esa
   herramienta ni aunque estuviera libre.
2. Y no estaba libre. El intento acotado de importar el bundle que el paquete trae
   (`third_party/lighthouse-devtools-mcp-bundle.js`) murió con
   `puppeteer_core_default.connect is not a function`: **`puppeteer-core` está
   stubbeado a un objeto vacío en el bundle** (`var puppeteer_core_default = {}`,
   línea 57537), porque el servidor MCP le inyecta su propio `page` y la rama
   `!page` de `navigationGather` es código muerto.

Descartes verificados, no supuestos: no hay `puppeteer-core` en `node_modules` de
este repo, ni en el `_npx` del paquete, ni Lighthouse global (`npm ls -g`:
`netlify-cli`, `npm`, `pnpm`). Traer cualquiera **sumaría una dependencia**, que la
instrucción prohíbe.

**Se reporta como NO MEDIDO con su causa.** Lo que sí se midió está en §4-bis.

### Dec-4 · El empate de la cap height: la evidencia, SIN decidir

La instrucción es explícita: *«No decidas: dejá la evidencia para que la mire el
humano»*. Así queda.

Lo declarado en `_lib/tipografia.ts`: Chivo **cap 686 · x 511**; la familia de
origen **cap 720 · x 510**. Medido sobre el glifo renderizado, con
`TextMetrics.actualBoundingBoxAscent` sobre `H` y sobre `x`, en los cuatro marcos
de `/v3/tipografia` (`c-tipografia.json`): **cap height renderizada 687,5 por
1000**, contra las 686 declaradas.

Control positivo: la misma medición con `monospace` al mismo tamaño da **640,6**,
o sea que el lienzo **sí** está usando la familia del DOM y no una sustituta.

Las capturas están en §6. **Este bloque no rompe el empate.**

### Dec-5 · INP no se midió, y un cero habría sido mentira

INP se mide sobre interacciones reales y sostenidas. Una carga sin un solo click no
produce una entrada que califique: **un 0 sería la ausencia de clicks, no la
latencia del sitio.** Se reporta `null`.

### Dec-6 · `verificar` lee `.next`, y con un dev server arriba eso no es un build

No es un defecto del código: es una fricción del gate. Ver §5.

---

## 4 · LO QUE SE PUEDE ARREGLAR SIN DECIDIR NADA — con su costo. **NO se arregló.**

| # | qué | dónde | costo |
|---|---|---|---|
| **D1** | que `prefers-reduced-motion` funcione | `_lib/motion/reducido.ts:84` | **una línea**: `useReducedMotion()` en vez de `useReducedMotionConfig()`, **o** envolver `/v3` en `<MotionConfig reducedMotion="user">`. La segunda conserva el forzado que `reducido.invariant.tsx` usa. ⚠️ Y el invariante hay que **fortalecerlo**, no relajarlo: hoy pasa forzando el valor que afirma |
| **D6** | área de toque de los tres enlaces de proyecto | `_secciones/trabajos/`, el `<a>` dentro del `<h3>` | **una regla**: padding vertical o `min-height` en el enlace. Sin tocar tipografía ni composición |
| **D7** | el desborde de `/v3/tipografia/muestra` a 375 | `tipografia/muestra/` y sus bloques | **una clase**: el mismo `overflow-x: auto` que la ruta madre ya usa a propósito |
| **D9** | los ocho niveles también en minúscula | `tipografia/_bloques/Escala.tsx` | **~6 líneas**: un segundo `<p>` con `MUESTRA_MINUSCULAS` dentro del `map` que ya existe |
| **D13** | el heap del build | `package.json` o el entorno | **una variable**: `NODE_OPTIONS=--max-old-space-size=8192` |

Los cinco son cambios acotados y ninguno decide nada de composición. **Este lane no
los aplicó, por regla.**

---

## 4-bis · LAS MÉTRICAS WEB — móvil y escritorio, con el elemento LCP

Sobre el **build de producción** (`.next-probe`, puerto 3005) —nunca sobre el dev
server, donde una cifra de LCP no describiría al sitio—. `PerformanceObserver`
instalado con `Page.addScriptToEvaluateOnNewDocument` **antes** de navegar. Dos
repeticiones por fila, mediana. **Todo emulado.**

| perfil | estrangulamiento | carga | **LCP** | FCP | **CLS** | TBT (fcp→load) | load |
|---|---|---|---|---|---|---|---|
| 375 | móvil (562,5 ms · 204.800 B/s · CPU 4×) | primera visita | **2.378 ms** | 2.378 | **0** | 171 / 368 ms | 5.958 / 5.198 |
| 375 | móvil | visita repetida | **2.194 ms** | 2.194 | **0** | 369 / 293 ms | 5.175 / 5.377 |
| 1920 | escritorio (85 ms · 1.125.000 B/s · CPU 1×) | primera visita | **470 ms** | 470 | **0** | 14 / 0 ms | 923 / 940 |
| 1920 | escritorio | visita repetida | **422 ms** | 422 | **0** | 1 / 0 ms | 930 / 919 |
| 1440 | escritorio | primera visita | **488 ms** | 488 | **0** | 0 ms | 905 / 999 |
| 1440 | escritorio | visita repetida | 940 ms | 940 | 0 | 4 / 18 ms | 1.979 / 953 |

**El elemento LCP es el mismo en las nueve filas:**

```
<h1 id="titular-hero" class="font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo">
«Tu negocio vendiendo en piloto automático.»   panel: hero   34.892 px²
```

> ### 🎯 EL DATO QUE DECIDE QUÉ OPTIMIZAR
>
> **El elemento LCP es TEXTO — el `<h1>` del hero — en las NUEVE filas. No es una
> imagen, no es el canvas, no es la escena.**
>
> O sea que el LCP de este sitio depende de **cuándo se puede pintar el titular**:
> de la fuente y del HTML, **no del peso del JS ni del costo de la escena.**
> Optimizar el bundle no va a mover esta cifra; la carga de la fuente sí.
>
> Y explica el resto de la tabla: el `<h1>` está visible con opacidad 1 desde el
> primer muestreo, así que las tres variantes de carga dan lo mismo.

**Contra el presupuesto declarado:**

| | presupuesto | medido | |
|---|---|---|---|
| **LCP móvil** | < 2.500 ms | mediana **2.378 ms** — las dos corridas: **2.232** y **2.524** | ❌ **una de dos NO cumple** |
| LCP escritorio | < 2.500 ms | **422–488 ms** | ✅ con holgura |
| CLS | — | **0 en las nueve filas** | ✅ |
| JS | < 300 KiB gzip | 380,0 total · **238,0 sin Sentry** | ver Dec-1 |
| Lighthouse | ≥ 80 | **no medible** con esta cadena | ver Dec-3 |
| INP | — | **`null`** | ver Dec-5 |

> ### ⚠️ EL LCP MÓVIL NO CUMPLE EL PRESUPUESTO, Y NO SE SUAVIZA
>
> Las dos corridas dieron **2.232 ms** y **2.524 ms**. La segunda **cruza el techo
> de 2.500 ms**. La mediana de 2.378 cumple; **una de las dos corridas no**, y eso
> es lo que se reporta: no «al filo», no «al borde». **Una de las corridas no
> cumple.**
>
> Y el margen no se puede pedir prestado a la emulación. Es cierto que el preset es
> conservador —562,5 ms de latencia contra los 150 ms de Lighthouse móvil, o sea
> casi cuatro veces— pero eso hace que el número real pueda ser mejor **o peor**:
> una red de teléfono real no es un preset. Con la varianza medida acá, **2,5 s es
> una cifra que este sitio cruza.**

### El costo de la escena — cuadros por segundo

Medido con el mismo muestreo por `requestAnimationFrame` de D10, sobre el recorrido
entero a 1920 (`c-velocidad.json`), 766 cuadros, 17 tramos de una pantalla:

| | |
|---|---|
| FPS mediana | **75,2** |
| FPS percentil 5 | **74,6** |
| **FPS mínimo de todo el recorrido** | **73,5** |
| tramos con caída | **ninguno** |

> **La escena no cuesta cuadros.** El mínimo de todo el recorrido está a 1,7 cuadros
> de la mediana, sobre una pantalla de 75 Hz. Lo que sí se pasa del techo es la
> **velocidad de la cámara** (D10), que es otra cosa: no es que el navegador no
> llegue, es que la cámara avanza más rápido que la página.

---

## 5 · MOBILE — lo que hay abajo de 1025

Los cuatro perfiles de abajo del umbral, **sin estrangular**, con `1920` medido con
el mismo banco como control. Todo emulado.

### El documento, por perfil

| perfil | documento | ventana | **pantallas** | ancho doc / ventana |
|---|---|---|---|---|
| 375 | 15.199 px | 667 | **22,79** | 375 / 375 |
| 393 | 17.148 px | 852 | **20,13** | 393 / 393 |
| 768 | 18.805 px | 1.024 | 18,36 | 768 / 768 |
| 1024 | 14.721 px | 768 | 19,17 | 1024 / 1024 |
| 1025 | 14.345 px | 768 | 18,68 | 1025 / 1025 |
| 1920 | 19.525 px | 1.080 | 18,08 | 1920 / 1920 |

> **A 375 el recorrido mide 22,79 pantallas — un 26 % más largo que a 1920 — y
> tiene CERO acontecimientos.** Las dos cifras juntas son el retrato de mobile:
> es la versión más larga del sitio y la única en la que no pasa nada. Es
> exactamente la forma «largo y vacío» del defecto que B1 midió como «corto y
> vacío», y esta vez del lado del umbral que nadie había mirado.

### Desbordes horizontales — **no hay**, y está probado que el detector ve

`b-desbordes.json`. `scrollWidth === innerWidth` en los seis perfiles: **ningún
desborde de documento.**

El detector no está ciego: **encontró cajas que cruzan el borde y las clasificó.**
A 375 y 393, un `<ul>` se pasa 244 y 226 px a la derecha pero está **recortado por
un ancestro**; a 1920, seis cajas de `servicios` (tres `sr-only` de 1 px, que son
el patrón estándar de lector de pantalla, y tres `<figcaption>` recortados). **Cero
cajas que empujen el documento.**

Las cinco capturas de `desborde` quedan como evidencia de los casos recortados.

### Los pines, la escala tipográfica, el aire muerto y las áreas de toque

Están en el inventario: **D2** y **D3** (pines), **D4** (acontecimientos), **D5**
(aire muerto), **D6** (áreas de toque), **D8** (escala tipográfica).

### Las ocho secciones en los cuatro perfiles

**40 capturas** (8 × 5, con el control de 1920), en
`docs/rediseno/capturas/b4/b/`. Ninguna sección superó el techo del rasterizador
de 16.384 px en ningún perfil, así que todas entraron en una captura.

---

## 6 · LAS SIETE ANCLAS, Y LA TIPOGRAFÍA

### Las siete anclas aterrizan EXACTAMENTE donde el número geométrico decía

Cierra el `noCorre` que `s9-scrollPadding.ts` declaró textualmente: *«el aterrizaje
REAL de las siete anclas, medido en el navegador — el sprint prohíbe abrir un
navegador»*.

Medido con **navegación real** (`Element.click()` sobre el `<a href="#id">` del
pie, partiendo del fondo del documento), esperando a que el scroll **se asiente de
verdad** y no un número de milisegundos. 21 filas: 7 anclas × 3 perfiles
(`c-anclas.json`).

| perfil | anclas | `top` del panel al aterrizar | desvío contra los 72 px |
|---|---|---|---|
| 1440 | 6 de 7 | **72,00** | **0,00** |
| 1920 | 6 de 7 | **72,00** | **0,00** |
| 375 | 6 de 7 | 72,00 – 72,23 | **≤ 0,23 px** |

**La séptima es `hero` en los tres perfiles, y aterriza en 0 — que es correcto**:
es el tope del documento y no hay nada arriba contra lo cual acolchonar.

**¿La pastilla tapa el destino? No, en ninguna de las 21.** La pastilla en reposo
ocupa de `y` 24 a `y` 72; el borde superior de la sección aterriza en 72; el primer
glifo del contenido cae en 73. **Un píxel de aire, cero solape.** El
`scroll-padding-top` derivado de los tokens describe el aterrizaje real al píxel.

⚠️ **Las capturas de anclas son parciales**: hay 8 de las 21 (`ancla-hero`,
`ancla-numeros`, `ancla-quienes-somos`), porque el frente se cortó por cuota. **Las
21 mediciones están completas**; lo que falta es la foto de 13 de ellas.

### La tipografía — renderizada y capturada, **sin decidir**

Ver **Dec-4** para el empate y **D8**/**D9** para lo que la medición encontró de
paso. Las capturas: `1440-tipografia`, `1920-tipografia`,
`1440-tipografia-muestra`, `1920-tipografia-muestra`.

---

## 7 · `verificar` Y EL BUILD

### El build

`NODE_OPTIONS=--max-old-space-size=8192 E2E_DIST_DIR=.next-probe npm run build`
→ **exit 0.**

`.next-probe` es un `distDir` **ya listado en `.gitignore`**, elegido a propósito:
la lección de agosto dice que un `distDir` fuera de `.gitignore` envenena la
auto-detección de fuentes de Tailwind 4. Usar uno ya ignorado **no toca un solo
archivo compartido** — que importa con otro lane escribiendo en paralelo. Y evita
pisar el `.next` del `next dev` del 3002, que es de la lección de `test:setter`.

### `verificar`: 7 agregados en rojo, y **10 de los 11 invariantes son un solo problema**

`npm run verificar` → **exit 1**, 25 pasos, 7 con falla. Pasos 1, 1b y 2
(`package.json`, marcadores de conflicto, `tsc --noEmit`) **verdes**.

**Los 11 invariantes rojos imprimen todos `0 archivos · 0.0 KiB`.** La causa es una
sola: **leen el build de `.next` por defecto (`process.argv[2] ?? '.next'`), y
`.next` lo tiene tomado el `next dev` del 3002, que no deja ahí un manifiesto de
producción.**

Comprobado uno por uno, pasándoles `.next-probe` como argumento:

| invariante | contra `.next` | **contra `.next-probe`** |
|---|---|---|
| `s1-bundle` | 12 fallas | **0 fallas** |
| `s2-bundle` | 16 fallas | **0 fallas** |
| `s2-css` | 2 fallas | **0 fallas** |
| `s3-peso` | 13 fallas | **0 fallas** |
| `s4-heredado` | 4 fallas | **0 fallas** |
| `s7-compuerta` | 18 fallas | **0 fallas** |
| `s8-tres` | 11 fallas | **0 fallas** |
| `s8-intro` | 2 fallas | **0 fallas** |
| `s8-chrome` | 2 fallas | **0 fallas** |
| `s8-peso` | 14 fallas | **0 fallas** |
| **`s5-peso`** | 6 fallas | **1 falla** |

> **La única falla real del árbol es `s5-peso`: `lo propio de /v3` mide 61,3 KiB
> crudo contra un presupuesto de 60. Es el rojo conocido, del otro lane, y NO se
> tocó.**

Y queda anotada la fricción, que no es un defecto del código: **`verificar` no
tiene forma de apuntar a otro `distDir`**, así que corrido con un dev server arriba
da 7 agregados rojos que no dicen nada del árbol. Los invariantes fallan ruidosamente
en vez de pasar en silencio —que es el diseño correcto— pero el gate no distingue
«el presupuesto se pasó» de «acá no hay build».

### Los gates del banco

| gate | resultado |
|---|---|
| `npx tsx scripts-b4/banco.invariant.ts` | **57 afirmaciones, 0 fallas** |
| `npx tsx scripts-b4/humo.ts` | **0 fallas** (incluidos los dos controles positivos) |
| `npx tsc --noEmit` | **limpio** |

---

## 8 · EL ÍNDICE DE CAPTURAS Y ARCHIVOS

**61 capturas · 11,1 MiB · cero huérfanas** (`indiceDeCapturas()` valida las tres
partes del nombre contra listas cerradas).

| frente | capturas | asuntos |
|---|---|---|
| a | 2 | `escena-preloader` (t1500, t6000) |
| b | 45 | las 8 secciones × 5 perfiles = 40, más 5 de `desborde` |
| c | 14 | 8 de `ancla-*`, 2 de `tipografia`, 2 de `tipografia-muestra`, 2 de `reducido` |

### Las mediciones en JSON — `docs/rediseno/outputs/b4/`

```
a-vitales.json                    LCP/FCP/CLS/TBT, 3 cargas × 3 perfiles, con el elemento LCP
a-peso.json                       el reparto del peso, archivo por archivo, 25 filas
a-gate-del-intro.json             por qué el preloader no arma bajo automatización
a-preloader-cronologia.json       el eje del tiempo del overlay, con barrido de luminancia
a-lighthouse.json                 el intento, y la causa exacta de por qué no se pudo
b-aire-muerto.json                8 secciones × 5 perfiles, con lazo de asentamiento
b-censo.json                      acontecimientos en los 4 perfiles + el par 1024/1025
b-layout.json                     el inventario de layout previo a las capturas
b-compuerta.json                  canvas y pedidos de chunk a los dos lados del umbral
b-pines.json                      los pines con scroll real, 6 perfiles
b-tipografia.json                 los 8 niveles resueltos en 5 perfiles
b-desbordes.json                  desbordes horizontales, con los recortados clasificados
b-toque.json                      áreas de toque contra 24 y 44 px
b-vigilia-canvas.json             la vigilia del canvas y la recarga del `next dev`
b-replica-1024.json               réplica de la secuencia de captura a 1024
c-anclas.json                     las 7 anclas × 3 perfiles, con scroll real
c-anclas-con-captura.json         la misma corrida escribiendo capturas — la evidencia de D12
c-tipografia.json                 cap/x-height renderidas, 4 marcos, con control positivo
c-velocidad.json                  766 cuadros: fh/pantalla y FPS
c-reducido.json                   `prefers-reduced-motion`, 2 perfiles
c-reducido-discriminador.json     los 4 casos que aíslan la causa de D1
```

### El banco y los instrumentos — `scripts-b4/`

```
EL BANCO (Fase 0, del padre)
  perfiles.ts  png.ts  color.ts  aire-muerto.ts  censo.ts  capturas.ts
  cdp.ts  navegador.ts  captura.ts  sitio.ts
  banco.invariant.ts  banco-fixturas.ts  humo.ts  diagnostico-captura.ts

LOS FRENTES
  a-*.ts (6)   b-*.ts (10)   c-*.ts (7)
```

`docs/rediseno/MEDICION-B4.md` es el contrato del banco.

---

## 9 · TODO LO QUE FRENÓ

1. 🔴 **El navegador compartido, tomado por el otro lane** (§0.1). Destrabado con
   un driver propio por CDP, sin dependencias nuevas.
2. 🔴 **Los tres frentes murieron por límite de cuota mensual**, a la vez, a los
   ~35 minutos. **Ninguno devolvió su reporte estructurado.** Lo que sobrevivió es
   lo que habían dejado en disco, y este reporte se armó inventariando el disco —
   no creyéndole a un reporte que no existe. Lo que faltaba se volvió a correr y a
   escribir desde el agente principal.
3. 🟡 **El build sin memoria** (§0.2, D13).
4. 🟡 **Lighthouse, imposible por dos causas independientes** (Dec-3).
5. 🟡 **`next dev` recarga la pestaña solo** y **escribir en `docs/` corrompe la
   medición** (D12). Las dos obligaron a lazos de asentamiento y a escribir en
   `tmpdir`.
6. 🟡 **`verificar` no apunta a otro `distDir`** (§7).

### Lo que quedó incompleto, dicho con todas las letras

- **13 de las 21 capturas de anclas** no se tomaron (las mediciones sí están).
- **La escena bajo `prefers-reduced-motion` NO se midió.** El cuarto caso del
  discriminador no discriminó. La afirmación de que la escena sí honra la
  preferencia es **lectura del fuente**, no medición.
- **Ninguna cifra de este bloque sale de un dispositivo real.** Todas son emuladas,
  y está declarado en cada tabla.
- **`tu-panel` a 1920** no asentó su aire muerto en 5 intentos: la celda no se debe
  citar como estable.
- **No hay grabación del recorrido.** No hay video; la evidencia son las 61
  capturas.
