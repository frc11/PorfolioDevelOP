# EL BANCO DE MEDICIÓN DE B4 — la receta, ejecutable

**Qué es.** El producto de la **Fase 0 de B4-B — La medición**, y la condición
para que los tres frentes de la Fase 1 produzcan números comparables. Extiende
`MEDICION-NAVEGADOR.md` —que sigue siendo la receta canónica del equipo— con lo
que este bloque necesita y aquélla no tenía: **mobile, siete perfiles,
estrangulamiento, `prefers-reduced-motion`, y las dos reglas de captura que la
Fase 0 midió.**

**Fecha:** 6 de septiembre de 2026. Worktree `C:\v3-medicion`, rama
`v3/medicion`, sobre `9777d233`. **El puerto de este bloque es el 3002.**

---

## 0. ⚠️ EL BANCO NO USA `chrome-devtools-mcp`, Y NO ES UNA PREFERENCIA

`chrome-devtools-mcp` levanta **un** Chrome sobre **un** `userDataDir` fijo:
`~/.cache/chrome-devtools-mcp/chrome-profile`. Este bloque corre en paralelo con
B4-A en `C:\v3-costura`, **y B4-A lo tomó primero**. Toda llamada de este lado
devuelve, textual:

```
The browser is already running for C:\Users\Valentino\.cache\chrome-devtools-mcp\chrome-profile.
Use a different `userDataDir` or stop the running browser first.
```

Verificado en el árbol de procesos y no supuesto: el `chrome.exe` que sostiene
ese perfil cuelga del servidor MCP del **otro** `claude.exe`.

Las dos salidas obvias eran las dos malas —**matar ese Chrome** rompe la medición
del otro lane en la mitad, y **esperar** deja este bloque sin instrumento por
tiempo indefinido—. La tercera es la que se tomó: **un Chrome propio, sobre un
perfil propio, manejado por CDP directo desde Node.**

**No suma una dependencia.** `WebSocket` es global en Node desde la 22 (acá corre
la 24) y lanzar un proceso es `node:child_process`. Lo único que se agrega es
`scripts-b4/cdp.ts`.

**Y da más de lo que daba la herramienta MCP**, que es lo que lo vuelve la salida
buena y no un parche:

| lo que el banco puede | la herramienta MCP |
|---|---|
| `Emulation.setEmulatedMedia` con `prefers-reduced-motion: reduce` | **no lo expone** — y la instrucción lo pide |
| `Page.captureScreenshot` con `clip` en coordenadas de documento | sólo por `uid` o viewport |
| Las cifras salen de un script commiteado, que se vuelve a correr | de una transcripción de llamadas |

**Lo que el banco NO puede, y hay que decirlo:** `lighthouse_audit`. Y hay una
segunda limitación que **no es del banco sino de la herramienta**, y que cambia
lo que la instrucción puede pedir: la propia descripción de `lighthouse_audit`
dice *«Get Lighthouse score and reports for accessibility, SEO, best practices,
and agentic browsing. **This excludes performance.** For performance audits, run
`performance_start_trace`»*. O sea que **la categoría de rendimiento de
Lighthouse —el «≥ 80» del presupuesto— no la produce esta cadena de
herramientas, ni con MCP ni sin él.** Ver §6.

---

## 1. Los siete perfiles

Viven en `scripts-b4/perfiles.ts` como dato tipado, y `banco.invariant.ts`
afirma que el umbral del banco es el MISMO `ESCENARIO_MIN_ANCHO_PX` de
`_lib/compuerta.ts` — no una copia que puede envejecer.

| id | nombre | viewport | dpr | mobile+touch | ¿abajo del umbral? |
|---|---|---|---|---|---|
| `375` | iPhone SE | 375 × 667 | 1 | sí | **sí** |
| `393` | iPhone 15 | 393 × 852 | 1 | sí | **sí** |
| `768` | iPad (retrato) | 768 × 1024 | 1 | sí | **sí** |
| `1024` | justo abajo del umbral | 1024 × 768 | 1 | no | **sí** |
| `1025` | justo arriba del umbral | 1025 × 768 | 1 | no | no |
| `1440` | el ancho del ritmo | 1440 × 900 | 1 | no | no |
| `1920` | el ancho del reporte | 1920 × 1080 | 1 | no | no |

**`1024` y `1025` comparten el alto a propósito.** Son el par que straddlea la
compuerta; con el alto clavado, la única variable es el ancho, que es lo que la
compuerta lee. Si además cambiara el alto, cualquier diferencia entre los dos
tendría dos causas posibles y ninguna medición podría atribuirla.

**`ipad` va en retrato** porque en apaisado mide 1024 y sería `1024` otra vez.

### ⚠️ Todo lo de este banco es EMULADO, y la palabra es literal

Un perfil es **un viewport de layout y un modelo de puntero**, aplicados con
`Emulation.setDeviceMetricsOverride` sobre el Chrome de esta máquina. **No es un
teléfono.** Lo que un perfil no reproduce:

- **El motor.** Abajo corre Blink; un iPhone corre WebKit. Nada de lo que dependa
  del motor —cómo resuelve `svh` cuando la barra del navegador entra y sale, el
  momento en que se dispara `scroll`, el redondeo subpíxel del texto— se está
  midiendo acá.
- **El `devicePixelRatio`.** Los siete van en **1**; el SE real es 2 y el 15 real
  es 3. Es la regla del paso 2 de la receta y no se afloja: con `x2` el canvas 3D
  cambia su resolución de render y ninguna cifra sería comparable con las que este
  proyecto ya publicó a `x1`. **La nitidez del glifo y el costo de GPU no se
  miden.** El layout sí, y el layout es lo que estos frentes vienen a ver.
- **La GPU y la térmica.** Una caída de cuadros de un teléfono que baja de reloj
  no aparece en ningún número de acá.

### ⚠️ Y por qué ningún perfil pisa el `userAgent`

Porque sería el mismo error, disfrazado: poner el UA de Safari sobre Blink
produce una página que **dice** ser WebKit y no lo es, y el lector del reporte no
tiene cómo detectarlo. El banco emula el viewport y el puntero (`mobile` y
`touch` en la cadena de `emulate`), que es lo único que cambia lo que la página
hace — verificado contra el fuente: `_lib/compuerta.ts` dice, textual, «**Por
ancho, no por táctil.** No a `(hover: none)`, no a `(pointer: coarse)`, no al
user-agent».

### El estrangulamiento es un eje APARTE

**Sólo el frente A estrangula.** Los frentes B y C miden layout, scroll y píxel:
con la CPU a 1/4 una medición de scroll se vuelve lenta y empieza a depender de
cuándo el motor alcanzó a pintar, que es ruido que no describe al sitio.

| id | latencia | bajada | subida | CPU | equivale a |
|---|---|---|---|---|---|
| `movil` | 562,5 ms | 204.800 B/s | 96.000 B/s | **4×** | el preset «mobile» de Lighthouse (1,6 Mbps / 150 ms / 4×). El 4× y la bajada coinciden; **la latencia es casi cuatro veces la de Lighthouse**, así que toda cifra de carga móvil de este bloque es CONSERVADORA |
| `escritorio` | 85 ms | 1.125.000 B/s | 187.500 B/s | 1× | el preset «desktop» (10 Mbps / 40 ms / 1×). Más lenta en las dos variables: también conservadora |
| `ninguno` | 0 | sin límite | sin límite | 1× | el modo de los frentes B y C |

**Los números están escritos, no nombrados.** Un reporte que dice «se midió con
Slow 4G» no se puede repetir: el preset del panel cambió de nombre y de valores
más de una vez.

---

## 2. La receta, ejecutable

Los cinco pasos de `MEDICION-NAVEGADOR.md` son los mismos y en el mismo orden.
Acá son código, en `scripts-b4/navegador.ts` y `scripts-b4/captura.ts`:

```ts
const chrome = await lanzarChrome({ perfil: perfilDeChrome('b'), ancho, alto })
const p = await abrirPagina(chrome)                       // 1
await emular(p, perfilPorId('375'))                       // 2
await irA(p, 'http://localhost:3002/v3')                  // 3 — con la marca del intro
const estado = await verificarLaPagina(p, perfilPorId('375'))  // 4 — ⚠️ TIRA si no
await capturarRegion(p, destino, { y, alto, ancho })      // 5
```

**El paso 4 tira, no avisa.** En la receta escrita es un párrafo que dice «no se
mide igual, para ver»; acá es una excepción. Verifica cinco campos —la receta
pide cuatro, y el quinto lo agrega este banco:

| campo | exigido |
|---|---|
| `visibilityState` | `"visible"` |
| `innerWidth` / `innerHeight` | los del perfil, y `> 0` |
| `dpr` | 1 |
| **`rafCorre`** | **`requestAnimationFrame` resuelve en menos de 1 s** |

`visibilityState: 'visible'` es **necesario y no suficiente**: una ventana puede
reportarse visible y tener los rendering steps salteados igual. Todo lo que este
bloque mide del recorrido depende de que `rAF` corra, así que se comprueba en vez
de suponerse. `hasFocus` se registra y **no bloquea**: con dos Chrome en pantalla
—el otro lane tiene el suyo— exigir foco haría fallar mediciones buenas.

**Un perfil de Chrome por frente** (`perfilDeChrome('a' | 'b' | 'c')`). Es
exactamente el choque de §0 un piso más abajo: dos procesos sobre el mismo
`userDataDir` y el segundo no arranca.

---

## 3. ⚠️ LAS DOS REGLAS DE CAPTURA QUE ESTA FASE MIDIÓ

Ninguna de las dos estaba escrita, y cada una vale decenas de puntos de aire
muerto. Las dos salen de `scripts-b4/diagnostico-captura.ts`, a 1920×1080.

### 3.1 La escena tarda en dibujar, y capturar antes miente por 77 puntos

Aire muerto del hero contra el tiempo desde `load`, captura de viewport:

| t desde `load` | aire muerto |
|---|---|
| 0 ms | **77,59 %** |
| 300 ms | 76,11 % |
| **700 ms** | **0,00 %** |
| 2000 ms | 0,00 % |

El 0 % es el número que B1 publicó para el hero. El 77,59 % es la misma pantalla
fotografiada con el canvas todavía en negro. **No es un margen de error: es la
diferencia entre «esta sección está llena» y «esta sección está vacía».**

> **Regla: toda captura espera `GRACIA_DE_ESCENA_MS` = 1200 ms** (el 700 medido,
> con holgura) después de llegar a la posición. `capturarRegion` lo hace solo.

### 3.2 Un recorte sólo vale si el scroll ESTÁ en la región que recorta

El escenario es `fixed inset-0` (`compuerta.ts`, `CLASES_FUERA_DE_FLUJO`), o sea
que Chrome lo compone **una sola vez, donde está la ventana**. Medido sobre
`por-que-develop`, que es `papel-transparente` y arranca en el píxel 17.280:

| cómo se pidió | aire muerto |
|---|---|
| recorte de esa región con el scroll en **0** | **95,09 %** |
| viewport con el scroll en 17.280 | **0,00 %** |
| recorte de esa región con el scroll en 17.280 | **0,00 %** |

**Noventa y cinco puntos de diferencia por dónde estaba el scroll**, con el mismo
recorte y el mismo instante.

> **Regla: `capturarRegion` scrollea a la región ANTES de recortarla.** Y devuelve
> `masAltoQueLaVentana` marcado cuando el recorte supera una pantalla y la página
> tiene escenario.

**El corolario, que hay que tener escrito:** una captura más alta que la ventana
**no puede** representar lo que se ve en una página con capa fija — el escenario
aparece en una pantalla y falta en las otras. Hoy el peligro está **desactivado
por el layout**: las dos secciones `papel-transparente` (`hero` y
`por-que-develop`) miden exactamente una pantalla, así que las capturas por
sección de B1 y B2 no lo sufrieron. Es suerte de la tabla, no una propiedad del
método, y si alguna de esas dos crece deja de valer.

**Y el techo del rasterizador:** 16.384 px. Más alto que eso Chrome devuelve una
imagen truncada **sin error**. `capturar` tira antes de llegar ahí.

---

## 4. Los instrumentos, y qué prueba cada control positivo

Todo en `scripts-b4/`. `npx tsx scripts-b4/banco.invariant.ts` — **57
afirmaciones, 0 fallas** al cierre de la Fase 0.

| archivo | qué es | su control positivo prueba |
|---|---|---|
| `perfiles.ts` | los siete perfiles y los tres estrangulamientos | que `perfilPorId` no inventa un perfil |
| `png.ts` | decodificador PNG (8 bits, tipos 0/2/4/6) y codificador | que los **cinco** filtros de fila se reconstruyen; y que un archivo que no es PNG, o con profundidad 16, **tira** |
| `color.ts` | luminancia relativa y contraste WCAG | que la fórmula es la de **gamma** y no la lineal |
| `aire-muerto.ts` | la métrica de `B1-DELTAS` §3 | **que un degradé suave se lee como AIRE** — la propiedad que define la métrica, no el código |
| `censo.ts` | el censo de acontecimientos de `B2-DELTAS` §0 | que funde en `2·paso` **y no en `2·paso + 1`**; y que una ventana de 0 tira |
| `capturas.ts` | la ruta y el índice de capturas | que un perfil o un asunto inventados **tiran** |
| `cdp.ts` · `navegador.ts` · `captura.ts` | el driver y la receta | `humo.ts`, abajo |

### `humo.ts` — el control positivo de punta a punta

`npx tsx scripts-b4/humo.ts`. Además de las cuatro cosas que tienen que pasar,
**dos que tienen que fallar**:

- emular 375 y verificar contra 1920 **tira** (el paso 4 no está desactivado);
- la misma región capturada lejos del scroll da otro número (§3.2 tiene
  evidencia, no es una precaución).

Y la afirmación que ata este banco al anterior: **el hero da 0,00 %**, el mismo
número que B1 publicó con el instrumento que se perdió.

### ⚠️ Sobre comparar contra B1 y B2

Las cifras de B1 (45,30 % promedio, 849 px de banda máxima) y sus instrumentos
**ya no existen**: los dos bloques los dejaron en el scratchpad y los dos se
perdieron. Los de acá se commitean, que es la única forma de que no haya una
tercera reescritura.

Pero mientras tanto: **un número de este banco no es la continuación de uno de
B1**, es una medición nueva con la misma definición. El frente que compare mobile
contra escritorio tiene que **medir también el escritorio con este banco**, y
comparar contra eso. Comparar dos instrumentos distintos y llamarlo delta es el
modo de falla que este repo lleva veinte sprints cazando.

---

## 5. Dónde se guarda todo

```
docs/rediseno/capturas/b4/<frente>/<perfil>-<asunto>.png
docs/rediseno/outputs/b4/<frente>-<lo-que-sea>.json
```

`<frente>` ∈ `a` `b` `c`. `<perfil>` es el `id` de la tabla de §1. `<asunto>` es
el `id` de una de las ocho secciones o uno de los declarados en `capturas.ts`
(`documento`, `tipografia`, `tipografia-muestra`, `reducido`, `ancla`,
`desborde`, `escena`), y puede llevar sufijo (`ancla-servicios`).

`rutaDeCaptura()` valida las tres partes contra listas cerradas: **un frente no
puede inventar un perfil, y una captura de un frente no puede caer en la carpeta
de otro.** `indiceDeCapturas()` arma el índice leyendo el disco, así que no puede
prometer una captura que no existe.

**Las mediciones van en JSON**, no en prosa: una tabla del reporte tiene que
poder rearmarse sin volver a abrir el navegador.

---

## 6. ⚠️ LO QUE ESTA CADENA DE HERRAMIENTAS NO PUEDE DAR

Va acá y no en el reporte de un frente porque condiciona a los tres.

1. **La categoría «performance» de Lighthouse.** `lighthouse_audit` la excluye
   por diseño. El «Lighthouse ≥ 80» del presupuesto declarado **no se puede
   verificar con lo que hay**; lo que sí se puede es medir LCP, CLS y TBT
   directamente sobre la traza, que es de donde esa categoría sale.
2. **INP** no se puede medir sin interacción real y sostenida. Una cifra de INP
   de una carga sin clicks no es INP: es un cero.
3. **El `dpr` real de un teléfono** (§1).
4. **Grabar el recorrido.** No hay video. La evidencia son las capturas.

Una cifra que caiga en esta lista se reporta como **no medida**, con su causa. No
como «no empeoró».
