# PROBE-ESCENA — ¿Aguanta el logo una órbita de 360°?

- **Fecha:** 2026-08-19 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/PROBE-ESCENA.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint` exit 0 sobre lo tocado. **El juicio estético es del humano: este reporte no dice que la escena "se ve bien".**

---

## 1 · Qué se construyó

Una ruta `/probe-escena`, **no enlazada desde ningún lado** y `noindex`, con una escena 3D manipulable y un panel de control. No hay coreografía, ni scroll, ni inercia, ni offset de mouse: hay una cámara que orbita un logo quieto y un humano mirándolo.

### Cómo correrlo

```bash
npm run dev
# http://localhost:3000/probe-escena
```

**El panel** (arriba a la izquierda, se puede ocultar) tiene:

| Control | Rango | Qué mueve |
|---|---|---|
| ángulo de la órbita | 0–360° | Azimut de la cámara. **0° = de frente** (el logo se lee bien) · **90° y 270° = perfil** · **180° = de atrás** (el logo se lee espejado) |
| altura de la cámara | −3,9 a 9 | Altura en unidades de mundo. 0 = a la altura del centro del logo; el mínimo es justo arriba del papel |
| distancia al logo | 6 a 30 | Radio de la órbita |
| encuadre horizontal | −1 a 1 | **Dónde cae el logo en pantalla.** 0 = centrado · +1 = pegado a la derecha · −1 = a la izquierda |
| encuadre vertical | −1 a 1 | Ídem en vertical. +1 = arriba · −1 = abajo |
| intensidad de la luz | 0 a 9 | Intensidad de la luz principal (unidades físicas de three ≥ r155) |
| temperatura de la luz | 2000–10000 K | Color de la luz principal, por curva de cuerpo negro |
| partículas dibujadas | 0 a 4000 | Cuántas partículas del campo se dibujan |
| **recorrer la órbita completa** | — | Botón: gira 24°/s (vuelta entera en 15 s). Mover el slider de ángulo a mano lo detiene |
| **la luz sigue a la cámara** | — | Checkbox. Ver §6 |

**La lectura en pantalla** está en dos lugares: cada slider muestra su valor a la derecha del rótulo, y abajo hay una línea copiable con todos los valores juntos, más el FPS y la caja medida del logo. El botón **copiar** deja esa línea en el portapapeles, lista para pegar en el sprint de coreografía.

Todo eso se escribe al DOM directo (`textContent` / `input.value`) desde el `useFrame`: **cero `setState` por frame**, que además es la condición para que el FPS que el instrumento reporta no esté medido sobre un instrumento que se sabotea a sí mismo.

### Archivos

```
src/app/probe-escena/page.tsx                       ruta (noindex, sin links entrantes)
src/app/probe-escena/_components/
  ProbeEscena.tsx       raíz cliente: stores, layout, estado de carga, error boundary
  ProbeControls.tsx     el panel: sliders no controlados + lectura + copiar
  ProbeStage.tsx        <Canvas> + composición de la escena (dynamic, ssr:false)
  OrbitRig.tsx          el único useFrame: cámara, luz, shadow map, FPS
  ProbeLogo.tsx         artefacto NUEVO — logo extruido mate
  StudioFloor.tsx       el papel + las marcas de registro
  DepthParticles.tsx    el campo de partículas en volumen
  probeScene.ts         constantes de la escena + kelvin→rgb + PRNG sembrado
  probeStore.ts         store numérico (params + medición), sin React
```

Además, una línea en `src/components/layout/publicRoute.ts`: `/probe-escena` entra en `CHROME_FREE_PREFIXES`, igual que `/styleguide`. Sin eso, el navbar con `backdrop-blur`, el `Shutter` y el launcher del chat se montan encima del objeto que se está juzgando.

### Lo que NO se tocó

`HeroArtifact.tsx`, `TransitionContext`, `PreloaderContext`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts` — ninguno se abrió para editar. El home entero (`page.tsx`, `HeroSection`, `HomeIntro`, `HeroLogoSlot`, `HeroArtifactLayer`, `HeroCanvas`) quedó intacto: el probe no importa una sola línea de ahí.

**El artefacto del probe es nuevo, no una copia editada del frozen.** De `HeroArtifact.tsx` se conserva exactamente lo que define al objeto bajo prueba — el mismo SVG, la misma escala (0.007) y los mismos parámetros de extrusión (`depth: 15`, bisel 1/1/5) — y se deja afuera todo lo que impediría juzgarlo: el material cromado, el flotado perpetuo en el `useFrame`, la rotación por puntero y el auto-cull por `scrollY`. En el probe **el objeto está quieto**: lo único que se mueve es la cámara.

---

## 2 · La escena

- **Logo negro mate**, sin HDRI. `meshStandardMaterial` con `metalness: 0` y `roughness: 0.52` sobre `#0F0F0F`. La forma se lee por sombreado difuso —que existe en toda orientación— en vez de por reflejo especular, que necesita un entorno que reflejar.
- **Fondo de papel `#F7F7F5`** (`--color-ds-light-bg` del sistema), con el piso como **disco con espesor**, no como plano infinito: cuesta lo mismo y tiene canto y cara inferior, así que mirar desde abajo sigue siendo una escena. Disco y no cuadrado — el motivo está en §10.
- **Sombra proyectada al piso** por shadow map real desde la luz principal, con la ortográfica ajustada a la huella del logo y su sombra.
- **Partículas en volumen**: media esfera de radio 5 a 34 alrededor del logo, recortada por el papel, distribuidas **uniformemente en radio** y no en volumen (uniforme en volumen deja el 96% de las partículas más lejos que el logo, justo donde el paralaje no se ve). Siempre hay partículas más cerca y más lejos que la cámara, que es la condición para que al orbitar haya paralaje **entre ellas** y no un fondo pegado. Semilla fija: el campo es idéntico en cada carga, así dos capturas del mismo ángulo son comparables.
- **Dos elementos de ambiente**, elegidos con la misma regla —dar profundidad sin pedir atención—: la losa de papel y **cuatro marcas de registro** en las esquinas del encuadre. Las marcas son el lenguaje editorial de la dirección y hacen un trabajo concreto: son objetos de tamaño conocido apoyados en el piso, así que al orbitar dan la lectura de perspectiva que un plano vacío no da.

### Decisiones de render, con su motivo

| Decisión | Por qué |
|---|---|
| `NeutralToneMapping` en vez del ACES que r3f pone por default | ACES lava el blanco del papel. Neutral (Khronos PBR Neutral) lo conserva y mantiene el matiz cuando se mueve la temperatura de la luz |
| `antialias: true` (el hero lo tiene en `false`) | Lo que se juzga son los cantos de un objeto negro contra papel blanco; sin AA el escalonado del borde se confunde con el objeto |
| Sin `EffectComposer` | Por la lección ya documentada del repo, y porque no aporta nada sobre un objeto negro mate |
| `dpr={[1, 1.5]}` | Regla del repo |
| Shadow map estático cuando la luz no se mueve | Con luces fijas y objeto quieto el mapa de profundidad es idéntico frame a frame: `autoUpdate = false` saca una pasada de render completa de cada frame sin cambiar un píxel |
| Geometría centrada en su propia caja | El frozen centra por `position={[-512,-512,0]}`, que asume que la tinta llena el viewBox. Para un encuadre fijo da igual; para una órbita no: cualquier descentrado hace que el objeto se bambolee en cuadro al girar, y ese bamboleo se lee como defecto del objeto cuando es del pivote |

---

## 3 · Peso real de la escena sin HDRI

**Cómo se midió.** `next build --webpack` con `E2E_DIST_DIR=.next-probe`, servido con `next start`, y las dos rutas cargadas en Chromium con caché fría. Los bytes salen de `performance.getEntriesByType('resource')`: `encodedBodySize` es **lo que viaja por la red** (comprimido, si el server lo comprime) y `decodedBodySize` es el archivo minificado. No es una estimación sobre el disco: es lo que el navegador bajó.

### La escena del probe — `/probe-escena`

| Qué | Minificado | Sobre la red |
|---|---:|---:|
| `three` (webpack lo parte en dos: `b536a0f1` + `bd904a5c`) | 704,7 KiB | 180,8 KiB |
| `@react-three/fiber` | 143,0 KiB | 45,3 KiB |
| `three-stdlib` / SVGLoader | 21,6 KiB | 7,7 KiB |
| resto del grupo del canvas (2 chunks) | 18,3 KiB | 7,5 KiB |
| `logodevelOP.svg` | 0,6 KiB | 0,6 KiB |
| **TOTAL de la escena** | **888,2 KiB** | **241,9 KiB** |

**Cero bytes de HDRI**: la ruta no pide un solo `.hdr` — verificado sobre la lista de recursos que bajó el navegador, no sobre el código.

### El hero de hoy — `/`

| Qué | Minificado | Sobre la red |
|---|---:|---:|
| `three` + fiber + stdlib + resto | 882,5 KiB | 239,0 KiB |
| **drei** (`Environment`, `Lightformer`, `RGBELoader`) + su chunk chico | 55,0 KiB | 20,0 KiB |
| `logodevelOP.svg` | 0,6 KiB | 0,6 KiB |
| **HDRI `studio_small_03_1k.hdr`** | 1.640,9 KiB | **1.640,9 KiB** |
| **TOTAL** | **2.579,0 KiB** | **1.900,5 KiB** |

### El número que decide

> **241,9 KiB contra 1.900,5 KiB.** La escena mate pesa **1,62 MiB menos** que el hero actual: **−87%**, casi 8× más liviana.

Dos correcciones a la tabla de S3b, las dos hacia el lado malo del hero actual y las dos verificadas:

1. **El HDRI no se comprime.** S3b lo anotó como "1,27 MiB gzip". Medido sobre la red, `encodedBodySize` = `decodedBodySize` = **1.680.234 bytes**: el server no lo comprime (es un binario que ya trae su propia compresión). El costo real del hero no es ~1,42 MiB, es **~1,86 MiB**.
2. **El JS de `three` estaba contado por la mitad.** S3b lista "three (core) 342 KiB / 83 KiB", que es el chunk `b536a0f1` — el que tiene `WebGLRenderer`. Webpack parte `three` en dos y el otro pedazo (`bd904a5c`: `ExtrudeGeometry`, `Quaternion`, `ShapePath`, `DataTexture`) son **363,5 KiB más, 97,7 sobre la red**, y se piden en la misma ráfaga. `three` completo son 704,7 KiB minificados.

**Lo que el HDRI se lleva puesto no es solo peso: es tiempo.** Son 1,6 MiB en una sola petición de la que cuelga el `Suspense` del canvas — hasta que baja, no hay artefacto. La escena mate no tiene esa espera: su único activo es el SVG, 596 bytes.

**Lo que NO cambia:** `three` + `fiber` siguen siendo ~226 KiB sobre la red, y eso lo paga cualquier escena 3D. El ahorro del 87% es del entorno, no del motor.

---

## 4 · Performance

**Todo medido en desktop.** GPU **AMD Radeon integrada** (ANGLE / Direct3D11), Chromium headless con GPU real —no SwiftShader—, `dpr = 1`, órbita automática corriendo, `particleCount` movido en vivo. **No extrapolar a mobile: no se midió un solo dispositivo móvil.**

### Con vsync (lo que se ve)

| Partículas | FPS |
|---|---|
| 0 · 900 · 2000 · 4000 | **75 clavado** en las cuatro |

75 es el refresco del monitor. La escena no se despeina: **no hay ninguna cantidad de partículas, dentro del rango del slider, que le baje un frame.**

### Sin vsync (el techo real, para saber cuánto margen hay)

| Partículas | FPS mediana | ms por frame |
|---|---:|---:|
| 0 | 777 | 1,29 |
| 900 | 697 | 1,43 |
| 2000 | 740 | 1,35 |
| 4000 | 748 | 1,34 |

Las diferencias entre 0 y 4000 partículas están **dentro del ruido de la medición** (las muestras de una misma corrida varían más que las medianas entre corridas). En esta escena las partículas son gratis: son un `<points>` de un solo draw call, sin trabajo por frame — el buffer se reserva una vez y el slider solo mueve el `drawRange`.

A **1,35 ms de frame contra los 13,3 ms que pide un cuadro de 75 Hz**, hay unas 10× de margen. Achicando el área de píxeles (ventana de 430×900, misma GPU) sube a ~1.850 fps (0,54 ms): la escena es **fill-rate bound**, no geometry bound — el costo está en pintar píxeles, no en la cantidad de objetos.

**Lo que ese margen NO dice:** un teléfono de gama media tiene entre 5× y 20× menos fill rate que esta GPU y además pantalla de alta densidad. Con `dpr` en 1,5 el área de píxeles se multiplica por 2,25. La medición de mobile es un sprint aparte y hay que hacerla en un teléfono real.

### Lo que sí se optimizó y conviene saber

El shadow map se recalcula **una sola vez** mientras las luces no se muevan (`gl.shadowMap.autoUpdate = false` con un `needsUpdate` inicial): con el objeto quieto y la luz fija, el mapa de profundidad es idéntico frame a frame. Cuando se enciende "la luz sigue a la cámara" vuelve a actualizarse siempre, porque ahí sí se mueve. **Para la coreografía esto importa**: si la luz se anima con el scroll, esa pasada vuelve a costar en cada frame.

---

## 5 · Lectura de los ángulos

Contactos en `audit/probe-escena/` (fuera de git, regenerables): la órbita completa cada 30°, el acercamiento al perfil, el perfil por altura y el mismo barrido con la luz solidaria a la cámara.

### La medida del objeto

La escena publica en pantalla la caja real del logo extruido: **6,86 × 4,78 × 0,119** unidades de mundo.

> **El espesor es el 1,73% del ancho.** No es una impresión: es el número, medido sobre la geometría que se está mirando.

### Dónde se lee y dónde no

Ancho aparente de la cara según el ángulo (proyección, contrastada contra las capturas):

| Ángulo | Cara visible | Qué se ve |
|---|---:|---|
| 0° / 180° | 100% | El logo entero. A 180° espejado y más plano: queda a contraluz del rig fijo |
| 30° / 150° | 87% | Se lee completo, y el canto ya aporta volumen |
| 45–60° | 71–50% | **El mejor tramo.** La cara se lee y el canto biselado agarra un filo de luz: es el único momento en que la pieza se lee como un SÓLIDO y no como una silueta |
| 70° | 34% | Comprimido, todavía reconocible |
| 75° | 26% | Las contraformas (los dos huecos) se cierran. Límite de lectura |
| 80° | 17% | Ya no se reconoce la marca: es un glifo ambiguo |
| 85° | 9% | Astilla |
| 90° / 270° | **0%** | **Una línea vertical de 14 px sobre 1600.** No hay logo |

**Traducido a la órbita:** la marca se lee en dos ventanas de ~150° (una por cara) separadas por **dos zonas muertas de unos 30°** centradas en 90° y 270°. Son el 17% del recorrido.

### La hipótesis de la altura: NO funciona

El sprint proponía que variar la altura de la cámara en el perfil lo escorzara y lo volviera interesante. **Se probó en todo el rango del slider (−3,9 a 9) y falla en los seis casos.** Y falla por una razón geométrica, no por falta de ajuste:

> La cara del logo es perpendicular al eje Z. La cámara está en `(d·sin a, h, d·cos a)` y mira al origen, así que su dirección de vista es `(−d·sin a, −h, −d·cos a)`. El producto escalar de esa dirección con la normal de la cara `(0,0,1)` vale `−d·cos a`: **en a = 90° y 270° da cero para CUALQUIER altura y CUALQUIER distancia.** La cámara se mueve dentro del plano que contiene el canto; subirla o bajarla la mueve *sobre* ese plano, nunca fuera de él.

Lo único que cambia con la altura en el perfil es **el entorno**, y ahí sí hay un hallazgo aprovechable:

- Con la cámara alta (h ≥ 7) **entra la sombra en cuadro y la sombra SÍ dibuja el logo completo.** En el perfil, el portador de la marca deja de ser el objeto y pasa a ser su sombra.
- Con la cámara baja (h ≤ −3,5) el papel se va del cuadro y la línea queda flotando en un vacío blanco: el peor de los casos.

**Confirmación cruzada:** el mismo barrido con "la luz sigue a la cámara" —que fija la relación luz-observador y deja sola a la geometría— da lo mismo. El perfil no es un problema de iluminación.

### Alternativas (reportadas, NO implementadas)

1. **Inclinar el eje de la órbita** (o inclinar la pieza unos 10–15° en X y Z). Es la única que ataca la causa: si el eje de giro no es vertical puro, la cámara **nunca** cruza la perpendicular exacta y el perfil puro deja de existir en los 360°. Cuesta una constante, no toca la geometría, y es el gesto clásico del turntable de producto.
2. **Subir la profundidad de extrusión.** Con `depth: 15` sobre 1024 el canto es el 1,7% del ancho. Llevarlo a 60–90 (7–10%) haría un canto que se lee de perfil. Cambia el objeto: es decisión de marca, no técnica.
3. **Chaflán ancho en el canto.** Da un filo especular a lo largo de toda la silueta. Sobre papel blanco ayuda poco: el contraste ya está invertido (objeto oscuro sobre fondo claro) y un filo claro sobre una línea de 14 px sigue siendo una línea.
4. **Diseñar la sombra como sujeto en esos tramos.** Es lo que la escena ya hace sola con la cámara alta. No cuesta nada y convierte el punto débil en un momento propio.
5. **No parar ahí.** Cuatro paradas en 360° son cada 90°: si la primera cae en 0°, **las otras tres caen exactamente en 90°, 180° y 270°** — dos de ellas en la zona muerta. Con las paradas en 0/120/240, o en 30/150/210/330, ninguna cae en el perfil y los tramos muertos quedan de paso, en movimiento.

### Otras dos observaciones de las capturas

- **La temperatura de la luz tiñe el PAPEL, no el logo.** Un objeto casi negro absorbe: a 2600 K el papel se va a terracota y el logo apenas se ensucia; a 9500 K el papel se va a azul. En una escena con un logo negro mate, el color vive en el fondo.
- **La intensidad es, en la práctica, un control de contraste** entre objeto y piso: en 1,2 el papel se agrisa y el logo se aplana a silueta; en 7 el papel se blanquea y el canto agarra brillo. El "sólido" y el "recortado" están a un slider de distancia.

---

## 6 · Decisiones del probe que hay que saber al mirarlo

**Las luces están fijas al mundo, no a la cámara.** Orbitar cambia la iluminación además del punto de vista — que es lo que va a pasar en la escena final ("iluminación que cambia en el recorrido") y lo que permite que los cuatro tramos sean distintos entre sí. Si la luz viajara con la cámara, todos los ángulos se verían igual de bien y el probe daría un **falso positivo**.

El costo es que mezcla dos variables: un ángulo puede verse pobre por la geometría o por quedar a contraluz. Para separarlas está el checkbox **"la luz sigue a la cámara"**: fija la relación luz-observador y deja sola a la geometría. Es el control que permite afirmar que el perfil es geométrico y no fotográfico.

**El rig es de tres piezas** y solo una obedece a los sliders: la principal (3/4 alto por delante-izquierda, la única que proyecta sombra), un hemisférico que hace de cielo y de rebote del papel, y un contraluz fijo atrás-derecha. **Su posición es una constante, no un control** (`KEY_LIGHT_POSITION` en `probeScene.ts`). Si al mirar aparece que hace falta moverla de lugar, exponerla como slider es un cambio chico — pero era un sexto control que el sprint no pidió.

**Dos controles que sí se agregaron a la lista del sprint**, los dos por el reporte y no por gusto:

- **partículas dibujadas**, porque el entregable 3 pide "qué pasa con las partículas en cantidad" y eso solo se contesta moviéndolas con la órbita corriendo.
- **la luz sigue a la cámara**, por el confundido de arriba.

---

## 7 · Qué le falta a esta escena para sostener cuatro paradas

Lo que se vio construyéndola y mirándola, no lo que se supone que se pide:

1. **🔴 Encuadre por relación de aspecto — es un bug esperando.** El `fov` de la cámara es VERTICAL. En una ventana angosta (medido a 430×900) el logo **desborda por los lados**: la caja mide 6,86 de ancho por 4,78 de alto, así que es el ancho el que manda y la cámara no lo sabe. La coreografía necesita un *width-fit* —exactamente el clamp que la calibración A de `logo-footprint.ts` tiene y la B no— o una distancia por breakpoint. Sin eso, en mobile el logo se sale de cuadro.
2. **Una estructura de paradas.** Hoy los parámetros son seis números sueltos. Cuatro paradas son cuatro juegos de esos seis, más la curva entre ellos. Eso no existe: hay que definir el tipo (keyframes), la interpolación (¿lineal en ángulo? ¿ease por tramo?) y la inercia. El instrumento ya está preparado del lado correcto: el `useFrame` lee de un store, así que el driver de scroll escribe en ese mismo store y nada más cambia.
3. **La posición de la luz tiene que ser animable, no solo su intensidad.** "Iluminación que cambia en el recorrido" con la luz clavada en un punto es un dimmer, no una iluminación que cambia. Falta llevar azimut y elevación al store.
4. **Costo del shadow map cuando la luz se mueva.** Hoy se calcula una vez. Con la luz animada por scroll vuelve a ser una pasada de render completa por frame — es el gasto nuevo más grande que la coreografía va a introducir, y hay que medirlo en mobile antes de comprometerlo. Alternativa barata si no cierra: sombra de contacto pre-horneada.
5. **Gate de render.** El probe corre a `frameloop` siempre, porque es su trabajo. La escena del home tiene que ir a `frameloop='demand'` + `IntersectionObserver` + `invalidate()` por scroll, o quema batería abajo del fold. Es regla del repo, y acá no aplica.
6. **Estado de entrada.** El probe arranca en una pose y ya. La escena real aparece después del preloader y necesita decidir con qué pose entra y cómo. Y necesita el camino de `prefers-reduced-motion` y el fallback 2D, que hoy resuelve `HeroLogoSlot` y esta escena no tiene.
7. **Decisión de antialias.** Acá va en `true` porque se juzgan cantos; el hero lo tiene en `false`. MSAA en mobile cuesta fill rate, que es justo el recurso escaso. Hay que elegirlo a conciencia.
8. **Partículas muy cerca del lente.** A distancias cortas alguna partícula pasa a menos de dos unidades de la cámara y se lee como un disco grande. Con profundidad de campo real no pasaría; sin ella, o se acota el radio mínimo o se acepta.
9. **Medición en un teléfono real.** Todo el §4 es desktop.

---

## 8 · Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                    → exit 0
.\node_modules\.bin\eslint.cmd src/app/probe-escena ... → exit 0
next build --webpack (E2E_DIST_DIR=.next-probe)         → exit 0
```

**Consola del navegador: cero errores y cero warnings** en la ruta del probe y en el home, durante toda la corrida de medición (43 capturas, cambios de parámetro en vivo, órbita corriendo).

### Trampa que costó tiempo, otra vez

**La pestaña oculta.** La primera verificación se hizo con la pestaña del probe en segundo plano: `document.visibilityState = "hidden"`, `requestAnimationFrame` corriendo **0 veces en 300 ms** y el canvas clavado en 300×150. Ninguna medición de FPS ni una sola captura son válidas ahí. Se detectó con un discriminador empírico —contar frames de rAF— antes de tocar una línea de código, como manda la lección ya documentada.

**La salida fue Playwright headless**, que reporta `visibilityState: "visible"` y —lo que no era obvio— **usa la GPU real** (ANGLE/Direct3D11 sobre la Radeon, no SwiftShader). O sea que headless no es un entorno degradado para medir esto: es el único que garantiza que el navegador no esté salteando los rendering steps. Queda como método para cualquier medición futura de canvas en este repo.

### Pendiente menor, anotado y no tocado

El papel lleva `castShadow` y no lo necesita (nada hay debajo). Es una pasada de sombra de más sobre una losa de 160 unidades — con `autoUpdate` apagado se paga una sola vez, así que hoy es irrelevante; con la luz animada dejaría de serlo. No se cambió para que **lo que se commitea sea exactamente lo que se midió**.

---

## 9 · La respuesta a la pregunta del sprint

> El logo es una extrusión plana de un SVG. ¿Aguanta que la cámara lo mire desde todos los ángulos?

**Aguanta el 83% de la órbita y se cae en el 17%.** El objeto se lee entre 0° y ±75° de cada cara —y en 45–60° se lee mejor que de frente, porque ahí el canto le da volumen—, y desaparece en dos ventanas de ~30° alrededor de 90° y 270°, donde queda reducido a una línea de 14 px.

La hipótesis del sprint (rescatar el perfil variando la altura de la cámara) **está falsada, con prueba geométrica y con las seis capturas**. Pero el perfil no obliga a abandonar la idea: hay cinco salidas y dos son baratas — inclinar el eje de la órbita, o poner las cuatro paradas donde no caigan en el perfil.

**Y el 3D en mobile deja de ser un mal negocio por peso:** 242 KiB contra 1,86 MiB. Sigue faltando la medición de performance en un teléfono, que es lo único que puede voltearlo.

**Lo que este reporte NO dice es si la escena se ve bien.** Eso se juzga en pantalla.

---

## 10 · Ampliación — encuadre lateral

**El problema.** La órbita movía la cámara alrededor del logo, pero el logo quedaba siempre en el centro de la pantalla. La referencia (nk.studio) pone el objeto a un costado y el texto en el otro, y las cuatro paradas de coreografía necesitan exactamente esa capacidad: que el contenido conviva con la escena en vez de pelearle el centro.

**Dos controles nuevos: `frameX` y `frameY`**, de −1 a 1, en la línea copiable con el mismo formato que los demás.

### Se mueve el target, no la cámara

La cámara se queda donde la ponen ángulo, altura y distancia; lo único que cambia es **hacia dónde apunta**. La consecuencia es la que importa: `angleDeg` sigue significando exactamente "desde qué ángulo se lo mira", por más corrido que esté el logo en pantalla. Si en vez de re-apuntar se trasladara la cámara, mover el encuadre cambiaría también el ángulo de vista y los dos controles se ensuciarían entre sí — justo lo que un instrumento de medición no puede hacer.

**El offset va en la base de pantalla de la cámara** (su derecha y su arriba), nunca en ejes de mundo. Con ejes de mundo el control se rompe al orbitar: en 90° un offset en X de mundo apunta *hacia* la cámara, así que "correr a la derecha" pasaría a ser "acercar".

### La unidad es fracción de recorrido, no unidades de mundo

`±1` significa **pegado al costado**, en cualquier distancia y en cualquier relación de aspecto. El rig calcula por frame cuánto puede correrse el centro del logo antes de que su caja toque el borde:

```
recorrido = (semi-alto visible a esta distancia − semi-caja del logo) × 0,88
```

Un desplazamiento fijo en unidades de mundo no servía: a distancia 6 tiraría el logo afuera y a 30 casi no lo movería. El **0,88** es margen medido, no cábala: la cuenta del recorrido es lineal y la proyección no lo es, así que un objeto corrido al borde se estira ~8% más de lo que predice la cuenta.

**El recorrido usa la caja del logo QUIETO (6,86 × 4,78), no su ancho proyectado en el ángulo actual.** A propósito: si el recorrido se achicara al pasar por el perfil —donde el logo proyecta 0,119— el objeto se deslizaría solo en pantalla mientras la órbita corre. El encuadre tiene que quedarse quieto cuando el ángulo se mueve.

### El piso pasó de cuadrado a disco

Es el ajuste que pedía el cuidado con "la sombra y el piso", y salió de mirar el caso extremo: **combinando distancia máxima con encuadre al costado, el paneo llega a ~21°**, que sumado a los 29° de medio campo horizontal da 51° respecto del eje. Pasados los 45°, el cuadro crece más rápido que el lado del papel: **la esquina del papel entra en cuadro y ningún tamaño finito lo arregla** en un cuadrado. Un disco no tiene esquinas, así que su borde siempre se lee como horizonte.

Efecto lateral que le sirve al probe más allá del encuadre: con el disco **el fondo es idéntico en todos los ángulos de la órbita**. Con el cuadrado, mirar hacia una esquina (45°) ponía el horizonte 1,41× más lejos que mirar hacia un lado — o sea que el fondo cambiaba entre ángulos que se están comparando entre sí. Radio 110, 96 segmentos, un draw call, ~400 triángulos.

De paso se le sacó el `castShadow` al papel (el pendiente anotado en §8): no hay nada debajo que pueda recibir su sombra, y meter la losa entera en el shadow map solo arriesgaba acné sobre su propia cara y sobre las marcas de registro, que están 0,012 encima. Recibir sombra es propiedad aparte y sigue.

### Lo que NO hizo falta tocar, con el número

- **El shadow map.** La sombra la proyecta una luz direccional fija al mundo; el encuadre no mueve ni el objeto ni la luz, así que el mapa de profundidad no cambia. Su ortográfica (±13) cubre la silueta del logo (semidiagonal 4,18) con 3× de margen.
- **El alcance de la sombra sobre el papel.** Con la luz en (−11, 12, 10) y el papel 4,30 abajo del centro, la esquina más lejana de la sombra cae en x ≈ 9,6 — muy adentro del disco.
- **El `far` de la cámara.** 400, contra un punto más lejano de 110 + 30 = 140.

### Límite conocido del encuadre extremo

Con el logo empujado abajo del todo (`frameY = −1`) la cámara se inclina hacia arriba y **la sombra puede salirse por el borde inferior**: el objeto pierde el contacto con el piso y queda flotando. No se corrigió a propósito — atarle el recorrido a la sombra la haría depender del ángulo de órbita (la sombra gira con él) y el encuadre dejaría de quedarse quieto, que es la propiedad que lo hace usable. Es una decisión de composición y se ve al instante moviendo el slider.

### Alternativa para el sprint de coreografía

Si el estirado de perspectiva del logo pegado al borde molesta, la salida "de fotógrafo" es un **desplazamiento de lente** (`camera.setViewOffset()`): corre la imagen sin inclinar la cámara, así que no hay ni keystone ni cambio en la cantidad de piso visible. Es más código y otra semántica; se anota, no se implementó.

### Verificación de la ampliación

```
.\node_modules\.bin\tsc.cmd --noEmit                    → exit 0
.\node_modules\.bin\eslint.cmd src/app/probe-escena ... → exit 0
```

**Sin navegador, sin capturas y sin dev server: fue el pedido.** La verificación visual la hace el humano.

**Los defaults quedaron en `frameX: 0, frameY: 0`**, así que la escena centrada renderiza igual que antes y las mediciones de peso (§3) siguen valiendo tal cual. Lo único que cambió en el render con el encuadre en cero es la forma del horizonte, por el disco.
