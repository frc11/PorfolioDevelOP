# B3 — La escena premium · reporte de la parada

**Worktree** `C:\v3-escena-premium`, rama `v3/escena-premium`. **Puerto medido: 3002.**
Instrumentos: `docs/rediseno/MEDICION-NAVEGADOR.md`, con `playwright-core` (ya
instalado) y el Chrome del sistema por CDP — `chrome-devtools-mcp` no pudo lanzar
el navegador (el perfil estaba tomado por la otra sesión), y la receta se cumplió
igual: viewport emulado a 1920×1080×1, `visibilityState: 'visible'` verificado
antes de cada lectura.

---

## (b) La medición contra nk — una navegación, una medición

**El home de nk es UNA escena WebGL persistente**, no catorce ni una pila de
secciones: un solo `<canvas>` fijo a 1920×1080 (`z:auto`) con los paneles de DOM
deslizándose encima. 22,62 pantallas de documento. El barrido con scroll real no
encontró ninguna transición de escena DENTRO del home (un solo pico de luminancia,
en `y≈980`, que es la pastilla `sticky` apareciendo): la escena no se reemplaza al
scrollear, se anima.

### Tabla 1 — lo que la instrucción pide medir de la transición

| medición | en nk | por qué / cómo se midió |
|---|---|---|
| Cuánto dura una transición de escena | **1.111 ms** — la «gota», el `ShaderMaterial` de pantalla completa con 7 uniforms que mezcla render targets. Es una transición **entre RUTAS** (nk intercambia 14 escenas de página), no un evento de scroll: no se reproduce en una navegación al home. Se cita como la MIDIÓ Franco. | La vara del ritmo. Mi barrido confirma que el home no tiene transición de escena por scroll (una sola escena persistente), así que la «gota» es de ruta. |
| Qué se mueve durante la transición | **el ENTORNO WebGL** (el canvas fijo), mientras **el DOM encima queda quieto**. Confirmado estructuralmente: 1 canvas fijo a viewport completo, los paneles/marca son DOM aparte. | Franco lo describió así; el censo lo reproduce. |
| ¿Forma geométrica reconocible o desvanecimiento? | **Desvanecimiento cruzado** (mezcla de render targets). No hay una figura geométrica: es una disolución de pantalla completa. | Define qué construir: un desvanecimiento, no una forma. |
| Cuánto tarda el ojo en volver a leer texto encima | En nk el DOM **no transiciona**: el texto queda legible durante todo el cambio de entorno. | El contraste durante la transición se sostiene porque el texto no se toca. |

### Tabla 2 — la marca de nk, dónde y en qué registro

| registro | en nk | qué nos falta |
|---|---|---|
| Logotipo | `/nk ®` — la palabra con un `/` de prefijo, arriba a la izquierda del chrome | develOP tiene el logotipo (la palabra) |
| Separador / prefijo | el **`/`** reaparece marcando lo que sigue: `/Home`, `/Branding`, `/nk.news`. Un solo glifo estructura la relación | **es el registro que nos falta**: no teníamos ni separador ni prefijo |
| Cómo cambia entre secciones | el chrome (logotipo, «CREATIVITY POWERHOUSE», nav) es idéntico en todo el scroll; el color de acento (`#20E7B7`) sólo aparece en enlaces de contacto | develOP retiñe el prefijo por servicio (`data-servicio`) |

**De nk se midió, no se copió:** el glifo `/` es suyo. develOP usa su propio
vocabulario —el punto medio `·` del pie y la regla de 1px del sistema— para sus dos
registros. Pestaña cerrada al terminar.

---

## (c) La vuelta de la escena — Parte 1 🔴

### Qué pasa HOY, medido con scroll real a 1920×1080

⚠️ **La premisa de superficies de la instrucción está VENCIDA.** La instrucción
dice «se ve en Hero, Quiénes somos, Números y Trabajos; desaparece detrás de
Servicios y Tu panel; vuelve en Por qué develOP». El recorrido de superficies de
HOY (`_lib/secciones.ts` + `superficies.ts`, medido) es otro: la escena se ve sólo
en **Hero (pantallas 0–1) y Por qué develOP (pantallas 11–13)**, y está oculta
detrás de SEIS paneles opacos entre medio. Lo confirma `s9-visibilidad`.

**Cuántos cuadros dura el reingreso y cuánto se movió la cámara oculta:**

| medición | valor |
|---|---|
| La escena está oculta | pantallas 1 → 11 (diez pantallas, el 77% del recorrido) |
| **Cámara movida mientras nadie la veía** | **250,24° de azimut**, −4,41 de altura, −6,54 de distancia · recta 3D 20,94 u · **camino recorrido 76,2 u** |
| El reingreso (panel transparente entrando) | **1 pantalla de scroll = 1080 px** |
| Cuadros del reingreso | **16 a 60 cuadros** según el ritmo (267 ms a 3,75 pant/s · 987 ms a 1 pant/s) — es scroll-bound, no time-bound |
| **Salto de POSE al volver** | **CERO.** La máquina de reanudación (`visibilidad.ts`, SITIO-S9/S11) reanuda la escena **0,125 pantallas (~135 px) ANTES** de que el panel transparente entre, con la física apagada un cuadro para que la pose sea la del scroll de HOY. Medido: transición `suspendida→corriendo` en `y≈11785` (1 pant/s) y `y≈11830` (3,75 pant/s); el primer píxel del panel aparece en `y=11880`. |

**El defecto real, entonces, NO es un salto de pose** (eso ya está resuelto y
medido): es que la escena reaparece contra una **costura horizontal dura** —papel
opaco arriba, sala 3D abajo, en una línea— que es exactamente lo que la instrucción
llama «un opacity de cero a uno». Se ve en las capturas `...-costura-dura.png`.

### Qué construí

Un **revelado por máscara** (`_lib/escena/revelado.ts`, cableado en
`EscenaDelHome.tsx`): la escena entra con una **rampa de máscara CSS** en el borde
donde el panel transparente toca el opaco. Arriba de la costura la máscara oculta
la sala y deja ver el **piso de papel** que vive detrás del canvas —el mismo papel
del panel de arriba—, y en `0,125` de pantalla (el MISMO octavo que la reanudación)
la sala sube a plena. El corte neto papel→sala pasa a ser papel→papel→sala: un
desvanecimiento de profundidad, no un `opacity`.

- **Es la forma que la instrucción admite** («una onda que barre, un
  desvanecimiento de profundidad»), y NO un `opacity` de 0 a 1: es una máscara
  espacial con stops en píxeles que sigue la costura por frame.
- **Ninguna pose se toca.** `revelado.ts` no importa `three`, ni `recorrido.ts`,
  ni `anclaje.ts`, ni escribe en ningún store: lee el scroll que la escena ya lee y
  escribe **sólo `mask-image`**. Corre DESPUÉS de fijar el progreso, en la misma
  lectura. Lo afirma `test:s17-revelado` (27 afirmaciones, 3 controles positivos).
- **Entra por la compuerta de 1025:** vive dentro de `EscenaDelHome`, que sólo se
  monta arriba del umbral. Gateado además por la MISMA retención que la pose
  (`!quieta && enCuadro`): durante el intro no hay revelado.
- **La rampa escala con el viewport** (`fracción × alto`), no un píxel copiado.

### El contraste del titular del diferencial DURANTE la transición

Medido sobre el píxel, bajo el glifo, con y sin la máscara aplicada en la costura
(mismo cuadro, para aislar su efecto):

| punto | sin máscara (peor · px<AA) | con máscara (peor · px<AA) |
|---|---|---|
| costura a media pantalla (u≈0,35) | 2,06:1 · 1.175 px | 2,06:1 · **1.163 px** |
| costura más arriba (u≈0,5) | 2,56:1 · 79 px | 2,44:1 · **39 px** |

**La máscara no empeora el contraste: lo mejora** (aclara la sala hacia el papel
cerca de la costura, y el titular es DOM que no se enmascara). Nunca baja.

⚠️ **CAVEAT DE MEDICIÓN, declarado (regla 11 + CLAUDE.md «discriminador del
entorno»):** en este worktree + Chrome automatizado **el intro queda clavado en
`covering` y nunca despeja** (medido 39 s; `data-intro="covering"`, sin overlay en
el DOM). Con el intro reteniendo, la escena queda **pineada en la pose del Hero**
detrás del diferencial, y el revelado —correctamente— NO se activa (está gateado
por la misma retención que la pose). Consecuencias:

1. **No pude confirmar en vivo la auto-activación del revelado** en un reingreso
   real (intro despejado). El mecanismo está probado por lógica pura + invariante +
   la aplicación manual de la máscara (capturas `...-ablandado.png` contra
   `...-costura-dura.png`), pero la activación automática **queda a confirmar por
   un humano** con el intro despejado. **❓ A CONFIRMAR, no asumido.**
2. Las cifras de contraste de arriba son de la sala en pose de Hero detrás del
   diferencial (lo que el entorno permitió ver); el DELTA con/sin máscara sí vale
   y es lo que importa para «no empeora». Los valores absolutos del diferencial en
   su pose real (la instrucción cita 4,98:1, que es el contraste MODELADO del fondo
   en el ancla por `s16-anclaje`, otro instrumento) no se pudieron re-medir sobre
   el píxel por el mismo motivo.

---

## (d) La marca en tres registros — Parte 2 🔴

Construí las tres piezas en `_componentes/marca/` (mi zona), con tokens y sin una
familia nueva:

- **Logotipo** (`Logotipo`): la palabra «develOP» en Chivo, la MISMA en todos lados.
- **Separador** (`Separador`): la regla de 1px del sistema (`--color-borde`), que
  marca la relación entre el logotipo y lo que sigue.
- **Prefijo de servicio** (`PrefijoDeServicio`): una marca de **relleno** en
  `--color-acento` (el ALIAS, que se retiñe por `data-servicio`). Convierte el
  código de color en estructura; es «el logo tomando el acento del servicio» de
  §5.2. **Va como relleno, nunca como texto** (sobre oscuro el acento da 2,71 ·
  2,99 · 2,46). En la galería se ve retiñirse: verde en IA, azul en web.
- **`MarcaLockup`**: los tres como conjunto — `prefijo develOP │ lo-que-sigue`.

Verificado por `test:s17-marca` (25 afirmaciones) y a ojo en `/v3/componentes`
(capturas `marca-lockup-*.png`, `marca-piezas-*.png`), sobre papel y sobre la
sección invertida.

**Instrument Serif:** **propongo que su única aparición sea el separador**, con su
razón (es la pieza que declara el sistema; un solo toque editorial junto al
logotipo es lo que más «sistema» comunica por el menor gasto; y es el registro que
la referencia resuelve con un glifo propio). **NO se carga** (sin dependencias
nuevas, tipografía cerrada, y el `.woff2` no está en el repo): hoy el separador es
la regla del sistema, con el hueco declarado en `sistema.ts` y su costo (un `.woff2`
latino ~15–25 KiB + un `next/font/local`). No se usa en dos lados.

### 🛑 Lo que FRENÉ y reporto (Parte 2)

La instrucción dice empezar «por dónde ya hay marca: la pastilla, el pie, el rótulo
de sección», y «si el sistema pide una aparición que hoy no existe, frená y
reportá». Las tres superficies de marca del home vivo caen fuera de mi zona:

1. **El rótulo de sección** y la **línea del pie** (`develOP · [FECHA]…`) están en
   `_secciones/` (`_contrato/Seccion.tsx`, `cierre/`), del sprint paralelo. **No los
   toqué.** Ahí es donde el separador y el prefijo tienen que entrar; requiere
   editar secciones.
2. **La pastilla** (`_componentes/chrome/Navegacion.tsx`) es chrome (mía), pero
   **no tiene logotipo hoy** —sólo los cinco enlaces— y su geometría (600 px, la
   derivación del umbral) es portante y está medida por tres invariantes del lane
   paralelo. Un logotipo/prefijo en la pastilla es «una aparición que hoy no existe»
   y toca geometría medida: **frené**. La forma nk (un logotipo arriba a la
   izquierda del chrome, fuera de la pastilla) es la vía; es una decisión de
   composición del home.

Las piezas quedan construidas y verificadas, listas para que el sprint que toque
las secciones/el chrome las monte.

---

## (i) La Parte 3 (disolución en partículas) — evaluada, NO construida

Franco midió un desvanecimiento cruzado de una malla de 457 vértices contra 4.000
partículas, 610 ms. Nuestra escena tiene el logo de malla (`ProbeLogo`,
`ExtrudeGeometry`) y ~2.400 + 90 partículas (`DepthParticles`/`BokehParticles`), así
que el mecanismo es reproducible. **No la construí**, y es la decisión correcta: la
instrucción la marca OPCIONAL y «si no, no la empieces». Costaría:

- Un muestreador de la superficie del logo (`MeshSurfaceSampler` de three o manual)
  para N posiciones de partícula, precomputado una vez.
- Un sistema de partículas de disolución (reusa la infraestructura de
  `DepthParticles`: buffer + `setDrawRange`) con animación de opacidad malla↓ /
  partículas↑ y deriva, ~610 ms, atada a un progreso disparador.
- Un componente nuevo (~150–250 líneas) + su invariante + su medición.
- **El riesgo que la frena:** a diferencia del revelado, una disolución **AGREGA un
  evento visual nuevo** (partículas que no estaban), o sea toca «qué hay», no sólo
  «cómo se revela»; y necesita un punto disparador, que es una decisión de
  composición. Queda para un sprint propio, con su parada.

---

## (e) El peso — el chunk no viaja abajo de 1025, con control positivo

`revelado.ts` lo importa **un solo archivo**: `EscenaDelHome.tsx`, el módulo
perezoso que la compuerta de 1025 pide con `import()`. No lo alcanza ningún módulo
de la carga inicial. Verificado sobre la salida del build:

- **`s1-bundle`** (agregado s1, 0 con falla) — la marca del escenario NO está en la
  carga inicial de `/v3`, y SÍ en `/v3/control-estatico` (el **control positivo**:
  la ruta gemela importa el módulo de forma estática y la marca tiene que aparecer).
- **`s8-peso`, `s8-tres`, `s8-escena`** (agregado s8, 0 con falla) — las huellas de
  `three` no viajan en la carga inicial de `/v3`.
- **`s9-compuerta`** (agregado s9, 0 con falla) — la caminata estática del grafo
  desde `layout.tsx`/`page.tsx` no alcanza `recorrido.ts`, `anclaje.ts` ni
  `EscenaDelHome.tsx`; `revelado.ts` cuelga sólo de este último, así que tampoco.

El chunk nuevo del revelado viaja con la escena, detrás de la compuerta. No baja
del umbral.

## (f) Ninguna pose, ni el anclaje, ni el progreso se movieron un bit

- **No toqué** `anclaje.ts`, `recorrido.ts`, `secciones.ts` ni las secciones
  (`git status` lo confirma: los únicos `.ts(x)` de escena tocados son
  `EscenaDelHome.tsx` —el enchufe— y los nuevos `revelado.ts` + su invariante).
- `revelado.ts` **no importa** `three`, `recorrido.ts` ni `anclaje.ts`, y **no
  escribe en ningún store**: sólo `mask-image`, DESPUÉS de que la lectura de scroll
  fijó el progreso. Lo afirma `s17-revelado` §5.
- Invariantes de pose/anclaje/progreso, todos verdes con el build presente:
  **s16-anclaje** (81 afirmaciones), **s13b-escena** (47), **s9** (222), **s8-escena**
  (36). El anclaje del diferencial sigue declarado en 0,8525; los siete nudos no se
  movieron.

## (a) verificar · build · frontera

| gate | resultado |
|---|---|
| `tsc --noEmit` | **ok** (76,4 s) |
| `npm run build` (primer plano, `CIRCLE_NODE_TOTAL=2` + `--max-old-space-size=6144`) | **exit 0**, 7,8 min. `/v3`, `/v3/componentes`, `/v3/control-estatico` prerenderizadas. RAM libre al lanzar: 1,27 GB, cero procesos `node` colgados. |
| `npm run verificar` | **25 pasos, 0 con falla** (con el build presente). tsc + los 24 agregados verdes, **s17 incluido** (2 invariantes · 52 afirmaciones). |
| `npm run test:frontera` | **1 falla, PREEXISTENTE y ajena a B3** — ver abajo. |

⚠️ **La corrida SIN build daba 7 agregados en rojo (s1, s2, s3, s4, s5, s7, s8):
SEIS eran por falta de `.next` de producción** —leen `.next/server/app/*.html`— y
pasaron apenas se corrió el build. **El séptimo** era `s3-tokens`, que censó mi
archivo nuevo `componentes/_bloques/GaleriaMarca.tsx` como «fuera del padrón»
—correcto: el censo existe para que todo archivo nuevo se declare—. Lo **registré**
en `s3-archivos.ts` y `s3` quedó en verde sin cascada. (No había baseline verde
capturado antes de empezar: mi error de método, anotado.)

### La falla de frontera, separada: es preexistente

`s3-frontera` falla en «el único token nuevo es la corrección declarada — esperado
`[--color-superficie-translucida]`, obtenido `[]`». **No es de B3:**

- **No toqué `theme-develop.css`** (git status lo confirma).
- **HEAD (`8ab34b36`, B1) YA contiene** `--color-superficie-translucida` (2
  ocurrencias, verificado con `git show HEAD:…`). Ese token lo agregó S3; contra un
  HEAD que ya lo tiene, el diff de tokens es `[]` y esta afirmación —escrita para
  medir el MOMENTO de S3— queda fuera de su ventana pero se afirma como FALLA en vez
  de `noCorre`. Falla para cualquiera que corra `test:frontera` en este HEAD.

**Los checks de frontera de B3 pasan todos:** los 8 archivos prohibidos intactos;
**sin dependencias nuevas** (`dependencies`/`devDependencies` idénticos a HEAD, sólo
3 scripts nuevos, los de s17); el detector de ventana distingue los dos estados;
`s11-frontera` parcial ok.

## (g) Capturas, archivos y git status

**Capturas** en `docs/rediseno/capturas/b3/`:
- `por-que-develop-1920-revelado-costura-dura.png` vs `...-ablandado.png` (y su par
  `u035`): el reingreso HOY (costura dura) contra el revelado (la sala entra desde
  el papel). El efecto se aplicó a mano para aislarlo (ver el caveat de (c)).
- `marca-lockup-papel-y-oscuro.png`, `marca-piezas-separadas.png`: los tres
  registros sobre papel y sobre la sección invertida; el prefijo retiñéndose (verde
  IA, azul web).

**Archivos** (git status):

| | archivo |
|---|---|
| nuevo | `_lib/escena/revelado.ts` · `_lib/escena/__tests__/s17-revelado.invariant.ts` |
| nuevo | `_componentes/marca/Marca.tsx` · `_componentes/marca/sistema.ts` |
| nuevo | `componentes/_bloques/GaleriaMarca.tsx` · `_lib/__tests__/s17-marca.invariant.tsx` |
| nuevo | `docs/rediseno/outputs/B3-ESCENA-PREMIUM.md` · `docs/rediseno/capturas/b3/*` |
| modificado | `_lib/escena/EscenaDelHome.tsx` (el enchufe: ref + `aplicarRevelado`) |
| modificado | `componentes/page.tsx` (monta `GaleriaMarca`) · `_lib/__tests__/s3-archivos.ts` (registra el bloque) · `package.json` (3 scripts de s17) |

## (h) Todo lo que frenó

1. **Parte 2 · el montaje en el home vivo.** Los tres registros están construidos y
   verificados, pero las superficies de marca del home (rótulo de sección, línea del
   pie, y un logotipo en la pastilla) caen en `_secciones/` y en la geometría medida
   de la pastilla —del sprint paralelo—. Frené y reporto (ver (d)).
2. **Parte 1 · la confirmación en vivo de la auto-activación.** El intro queda
   clavado en `covering` en Chrome automatizado y pinea la escena en la pose del
   Hero, así que el revelado —correctamente gateado— no se activa en mi entorno.
   Mecanismo probado por lógica pura + invariante + aplicación manual de la máscara;
   la activación automática en un reingreso real **queda a confirmar por un humano**.
3. **Parte 3** no se empezó (evaluada, ver (i)).
4. **Instrument Serif** no se cargó (propuesta con costo, ver (d)).

## (i) La Parte 3 — evaluada, no construida

Ver la sección de arriba: costaría un muestreador de superficie del logo + un
sistema de disolución (reusando `DepthParticles`) + disparador + invariante; y el
riesgo que la frena es que AGREGA un evento visual («qué hay»), no sólo cambia
«cómo se revela». Queda para un sprint propio.

---

## Dos pendientes de MONTAJE y de CONFIRMACIÓN — no de construcción

Las dos piezas del bloque están CONSTRUIDAS y verificadas por invariante. Lo que
queda no es código: es montaje en superficies del sprint paralelo, y una
confirmación en vivo que mi entorno no permite. Se declara para que nadie lo lea
como trabajo a medias.

1. **La auto-activación del revelado en un reingreso real — a confirmar por el
   humano.** El revelado está construido, es pose-safe y está gateado por la misma
   retención que la pose (`!quieta && enCuadro`). **Lo que lo bloquea:** en el Chrome
   automatizado de la medición el intro queda clavado en `covering` y nunca despeja
   (39 s medidos, `data-intro="covering"`, sin overlay), así que la escena queda
   pineada en la pose del Hero y el revelado —correctamente— no se activa. El
   mecanismo está probado por lógica pura + `s17-revelado` + la aplicación manual de
   la máscara (capturas `costura-dura` vs `ablandado`); la activación automática en
   un reingreso con el intro despejado **queda a confirmar mirando**. No es un
   arreglo pendiente: es una confirmación que el entorno de medición no habilita.

2. **El montaje de la marca en el home vivo — pendiente de MONTAJE, no de
   construcción.** Los tres registros (`Logotipo`, `Separador`, `PrefijoDeServicio`,
   `MarcaLockup`) están construidos, con tokens, y verificados por `s17-marca` y a
   ojo en `/v3/componentes`. **Lo que bloquea el montaje:** las tres superficies de
   marca del home —el rótulo de sección (`_secciones/_contrato/Seccion.tsx`), la
   línea del pie (`_secciones/cierre/`) y un logotipo en la pastilla
   (`_componentes/chrome/Navegacion.tsx`, cuya geometría de 600 px está medida por
   tres invariantes del lane paralelo)— caen en `_secciones/` y en la geometría del
   sprint paralelo. Las piezas quedan **listas y sin montar**: el trabajo que falta
   es enchufarlas, no escribirlas.

---

## Regla de método — la escena se MIDE por captura, no por lectura del canvas

**El búfer de WebGL no se puede leer desde la página.** `toDataURL`,
`drawImage(canvas, …)` y `readPixels` devuelven un cuadro **rancio o en blanco**.

**La causa, explícita:** `ProbeStage` monta el `<Canvas>` con `gl={{ alpha: false }}`
y **sin `preserveDrawingBuffer`**. Sin esa bandera el navegador es libre de
descartar el buffer de dibujo después del `swap` de composición, así que cualquier
lectura del lado de la página llega tarde —a un buffer ya reciclado— y devuelve el
cuadro anterior o vacío. No es un bug: es el contrato de WebGL con esa configuración.

**La regla operativa:** toda medición de la escena va por **`Page.captureScreenshot`**
—la foto de lo COMPUESTO por el navegador, no del canvas— decodificada aparte con los
instrumentos `pixeles.js` / `contraste-glifo2.js` de B1. Un «cuadro» leído del canvas
para medir contraste o luminancia miente; la única fuente válida es la captura del
compositor.

⚠️ **Confirmación INDEPENDIENTE, no una nota.** El sprint paralelo (B2, los momentos)
llegó a la misma conclusión por su cuenta, en su propia medición. Que dos lanes que
no comparten instrumento converjan en la misma regla es lo que la promueve de
anécdota de un entorno a **propiedad del canvas de este proyecto**: mientras la escena
se monte con `alpha:false` y sin `preserveDrawingBuffer`, la escena se mide por
captura y nunca por lectura del canvas.
