# S5 — Editor de keyframes y escena arquitectónica · Escena 3D del home develOP

- **Fecha:** 2026-08-19 · **Branch:** `rediseno/home` · **Worktree:** `C:\rediseno-home`
- **Sprint:** `docs/rediseno/sprints/S5-editor.md` · **Extiende:** `docs/rediseno/outputs/S4-RIG.md`
- **Verificación:** `tsc --noEmit` exit 0 · `eslint src/app/probe-escena` exit 0 · `next build` exit 0. **Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido. Nada de este reporte dice que la escena se vea bien — eso lo juzga el humano en pantalla.**

---

## 1 · Qué se construyó

Dos cosas, las dos adentro de `/probe-escena`, y ninguna toca el home.

1. **El editor de keyframes.** Un tercer modo del panel donde se elige un keyframe de la lista, se lo ajusta con los mismos siete sliders de siempre mirando la escena, y un botón devuelve el bloque entero de `choreography.ts` actualizado —con sus comentarios— listo para pegar.
2. **La escena enriquecida, con un mundo definido:** un espacio arquitectónico abstracto. Planos suspendidos, una retícula aérea, pilares lejanos y un piso con lenguaje de plano. El logo es la única pieza terminada.

No se tocó el home, ni un archivo frozen, ni la base de datos, ni se sumó una dependencia. **No se tocó un solo número de la narrativa de luz** (3,40 → 0,20 · 6500 → 7850 K), que el sprint marcó como tanteada y no diseñada: el editor es justamente lo que va a permitir calibrarla.

---

## 2 · El editor — el flujo completo

`npm run dev` → `http://localhost:3000/probe-escena` → botón **editor**.

### Entrar

El modo arranca parado en **el keyframe más cercano a donde estaba el progreso**, no en el primero. El flujo real es scrubear en coreografía hasta un momento que no convence y pasar al editor; cuando eso pasa, el instrumento ya está parado en ese momento.

### Elegir

La lista muestra los 17 por nombre y `at`, en orden, con la marca de quién es cada número:

| marca | qué significa |
|---|---|
| *(sin marca)* | la captura del humano, tal cual entró |
| `· derivado` | lo inventó Claude en S4 para cubrir un sub-movimiento que las capturas no expresaban |
| `· editado` | venía del archivo y se le movió algo en esta sesión |
| `· nuevo` | lo creó el editor duplicando. **Es el único que se puede borrar** |

Al elegir uno, **el progreso se clava en su `at` y la cámara va a esa pose.** Sin física: sin inercia, sin offset de mouse y sin vira. Acá se compone una pose, no se juzga un movimiento, y la amortiguación pelearía con el slider que se está arrastrando.

### Ajustar mirando

Los siete sliders de escena vuelven a estar **activos**, y ahora escriben sobre la pose del keyframe seleccionado en vez de sobre la cámara suelta. Es el mismo control con otro destinatario — por eso no hay un segundo juego de sliders.

Que la cámara siga al slider no necesita código: muestrear el track exactamente en el `at` de un keyframe devuelve su pose sin interpolar nada, así que mover el slider mueve la escena.

> **Un detalle que importa: acá el ángulo es el ACUMULADO, no el envuelto.** El keyframe del cierre se lee 360 y no 0. Es lo que dice el dato y es lo que hace que el tramo de Demos dé la vuelta entera; verlo envuelto sería ver otra cosa que la que se está editando.

### Mover el `at`

El slider de arriba de todo. Es el mismo valor que el progreso del recorrido, porque en este modo son la misma cosa: dónde ocurre el keyframe es dónde está parada la cámara.

**Se mueve entre sus vecinos y no los pasa.** El pulgar se frena contra la pared en vez de seguir de largo. Para reordenar hay que correr primero al de al lado — es la restricción que garantiza que el array nunca se reordene solo mientras se arrastra, y que el track no pueda quedar inválido.

Con esto se resuelven dos de los pendientes de S4: el reparto del giro de Demos (§9.3) y —con el duplicar— la pose que no se sostiene (§9.1).

### Duplicar — el patrón de sostén

Copia el keyframe seleccionado con su misma pose, su mismo `ease` y su mismo `turn`, y lo deja **a mitad de camino hacia el siguiente**. Entre los dos la pose no cambia: la cámara llega en el original y se aguanta hasta la copia. Es exactamente el arreglo que el §9.1 de S4 marcó como lo primero a calibrar.

En el último keyframe no hay siguiente, así que la copia va hacia atrás y el sostén queda antes: se llega temprano y se aguanta hasta el final.

Si no entra (los vecinos están a menos de dos milésimas), no inventa un lugar: avisa y el humano separa los `at` primero.

### Borrar y descartar

- **borrar copia** — solo los que creó el editor. Un keyframe del archivo no se pierde por un click.
- **descartar ajustes** — vuelve a los valores del archivo, sin recargar.

Las dos son de dos pasos (piden confirmación), por la regla de acciones destructivas del `CLAUDE.md`. Es una confirmación en línea y no el `Modal` compartido del sistema a propósito: el probe no importa nada de la app salvo tres cosas, y meterle el árbol de un componente de UI por un botón de confirmar sería pagar caro una regla que se cumple igual.

### Exportar

Genera el bloque completo de `CHOREO_KEYFRAMES` y lo copia al portapapeles. Se pega reemplazando el bloque de `choreography.ts` y listo.

**Lo exportado caduca solo:** el texto desaparece apenas se toca algo más, porque a partir de ahí ya no dice la verdad y pegarlo perdería el último ajuste sin que nadie se entere.

### Lo que NO cambia

El modo **coreografía** (reproducir, física, inercia, mouse, la lectura de tramo) y el modo **manual** (componer libre, órbita automática) funcionan exactamente como antes. Lo único que cambió para ellos es que el track que reproducen es el **vivo**: lo que se ajusta en el editor es lo que coreografía reproduce, sin recargar.

---

## 3 · Las cinco decisiones del editor

### 3.1 · Las ediciones viven en memoria — el probe no escribe en disco

Podría: es una ruta interna y una Server Action de dos líneas alcanzaría. Pero entonces `choreography.ts` pasaría a ser la salida de una herramienta en vez de la fuente de verdad, y qué se queda dejaría de ser un acto explícito del humano. **El rodeo del portapapeles es la garantía**, no una limitación.

Corolario que el panel dice en voz alta: recargar la página pierde la sesión.

### 3.2 · El editor NO publica al store — y no es un ahorro, es correctitud

En coreografía el `useFrame` publica los siete canales al panel: los sliders son telemetría. En el editor la dirección se invierte —los sliders son entrada— y el loop no escribe nada.

Si escribiera, pasarían dos cosas, las dos malas:

1. **El ángulo envuelto le pisaría el dato al cierre.** El loop publica `angleDeg` envuelto a 0–360; el keyframe del cierre dice 360. Publicar sobre él lo convertiría en 0 y **la vuelta entera se perdería sola**, sin que nadie la haya tocado.
2. **Seleccionar marcaría como editado.** El lerp del muestreo no devuelve exactamente el extremo (`−2,05 + 8,30` da `6,250000000000001`), así que el valor publicado diferiría en 1e-15 del dato y todo keyframe que se mirara quedaría marcado como tocado.

### 3.3 · El `at` acotado en vez de reordenable

`buildTrack` exige `at` estrictamente creciente —un segmento de duración cero es una división por cero— y hay dos formas de garantizarlo: reordenar el array cuando un `at` pasa a un vecino, o no dejarlo pasar.

Reordenar hace saltar la lista mientras se arrastra el slider, que es exactamente el momento en que el humano necesita que no salte. Acotar cuesta un rodeo (mover primero al vecino) y a cambio el array **nunca** se reordena solo.

### 3.4 · Los comentarios del array son un dato

Un export de solo números convertiría cada pegado en una pérdida: se iría el razonamiento de por qué cada keyframe está donde está, que es lo único que hace que ese archivo se pueda calibrar sin leer código.

Así que los comentarios viven en `choreographyNotes.ts`, indexados por el `name` del keyframe, y el exportador los re-emite como los `//` que el archivo ya tiene.

> ⚠️ **La regla que esto crea, y hay que saberla:** los comentarios de adentro del array **se editan en `choreographyNotes.ts`**. Cambiar uno a mano en `choreography.ts` y no allá se pierde en el próximo pegado. Está anotado en los dos archivos. Todo lo demás de `choreography.ts` —el doc de módulo, los tipos, los tramos, la física— es comentario de verdad y el editor no lo toca.

### 3.5 · El track es perezoso

`buildTrack` tira si los datos están mal ordenados, y ese error tiene que caer adentro del `StageErrorBoundary` que envuelve al canvas — no en el render del panel, que es lo único que quedaría para entender qué pasó. Por eso el editor se construye sin validar nada: el track se arma en el primer acceso, que ocurre dentro del `useFrame`. El panel solo mira la lista.

### Y la regla de siempre: cero `setState` por frame

Los sliders no pasan por React (`StoreSlider`, sin cambios) y **la pose editada tampoco re-renderiza**: la lista muestra nombre y `at`, no la pose. React se entera solo de los cambios estructurales —duplicar, borrar, resetear, mover un `at`— por el contador de versión del editor.

La única pieza nueva que tuvo que resolverse a mano fue la caducidad del texto exportado: un efecto que hiciera `setText(null)` al cambiar la versión es un render de más y lo prohíbe `react-hooks/set-state-in-effect`, con razón — no es sincronizar con un sistema externo, es una cuenta. Se guarda el texto **junto con la versión de la que salió** y la vigencia se deriva en el render.

---

## 4 · La escena — el mundo

**Un espacio arquitectónico abstracto.** La maqueta a escala real de algo que todavía no se terminó de construir: piso claro, luz limpia, planos y estructura suspendidos en el aire. El logo es la única pieza terminada, en el centro.

No hay un solo objeto reconocible, y **no hay una sola imagen de "tecnología"**: ni nodos, ni circuitos, ni burbujas de chat, ni pantallas, ni engranajes. Nada orgánico tampoco. Geometría con intención, y nada más.

Todo lo nuevo es `meshStandardMaterial` y responde a las mismas tres luces —nada brilla por sí mismo, así que la sala entera se apaga con el cierre— y nada compite en peso visual con el logo, que sigue siendo el único negro puro del cuadro.

### 4.1 · La regla de composición que ordena todo

> **La cuña de adelante queda libre.** Ningún plano vive en |azimut| ≤ 40°. El más cercano al eje está a **46°**.

Ahí es donde se para la cámara durante más de medio recorrido —hero, quiénes somos, números y cierre están todos en azimut 0— y en dos de esos momentos se aleja a 22,3 y a 30. Un plano a radio 12 en esa dirección se metería **entre la cámara y el logo** justo en las poses que más importan.

El corolario es lo que hace que la escena funcione: **el fondo de una pose es el azimut opuesto al de su cámara.** Desde el hero, en 0, lo que se ve detrás del logo es lo que está en 180 — y ahí es donde van los planos oscuros grandes. La masa negra del hero y la cuña libre son la misma decisión.

El único momento cuyo fondo cae dentro de la cuña libre es el giro de Demos mirando hacia arriba (keyframes 11 y 12), y ese fondo no es una pared: es el techo. De eso se ocupa la retícula.

### 4.2 · Planos suspendidos — `probeArchitecture.ts`

**Once losas** flotando a distintas alturas, distancias, inclinaciones y giros. Siete oscuras y cuatro claras, y las oscuras son además las grandes: la masa es área, no cantidad.

Reemplazan a los tres softboxes de S4. Lo que se conserva es la idea del panel suspendido —masa de tamaño conocido a media distancia, que al orbitar genera paralaje y **tapa cosas**, que es la señal de profundidad más fuerte que existe—. Lo que se va es el estudio de fotos: un softbox tiene marco, tela y una función. Un plano no explica nada.

- **Son losas y no láminas** (espesor 0,09): un plano sin canto desaparece cuando la órbita lo cruza de perfil, y con una vuelta entera eso le pasa a todos.
- **Ninguna toca el piso.** El borde inferior más bajo queda a **0,85 del papel** — están suspendidas, que es la palabra del sprint.
- **Radio mínimo 11,8**, contra los 7,7 que es lo más lejos que la cámara del recorrido llega fuera del eje: no puede atravesar ninguna. En modo manual sí puede (el slider de distancia llega a 30 en cualquier ángulo); es propiedad del instrumento, igual que con los softboxes de S4 a radio 10,4.
- **Una es casi horizontal**, alta y mirando hacia abajo. Es lo que impide que todo lo suspendido sea vertical: sin ella la escena tiene paredes y techo, y nada en el medio.

**El negro:** `#191917`, **más claro que la tinta del logo a propósito** (`#0F0F0F`). En lineal es del orden de tres veces más luminoso, así que hay masa oscura de verdad sin que nada le dispute al logo el punto más negro del cuadro. Es la perilla del balance, y es un número.

### 4.3 · Estructura aérea

Una **trama en cruz de 14 perfiles finos** a altura 15,5, más **tres vigas** más gruesas y más oscuras a 19,6.

La altura sale de una cuenta, no de un ojo: en el peor caso del recorrido (keyframe 12, cámara a −3,50 y distancia 6,3, mirando hacia arriba 29°) el cuadro abarca elevaciones de 11,5° a 46,5°, y una retícula a 15,5 con alcance ±30 ocupa la franja de 32° a 46,5° — el tercio superior del cuadro. Más abajo entraría en cuadro durante el hero, que mira desde arriba y no tiene por qué ver el techo; más arriba se iría justo cuando se la mira.

> Son **perfiles de sección cuadrada** y no tubos redondos: cerrados, doce triángulos, sin caras internas a la vista, y más arquitectónicos que un caño.
>
> **El grosor (0,18) no es cosmético.** Una barra oscura que a la distancia mide menos de un píxel titila con el movimiento de la cámara, y eso después no se arregla. A quince unidades ocupa del orden de quince píxeles: lejos del régimen donde el aliasing manda. **Es lo único de la escena nueva que hay que mirar con la cámara en movimiento antes de darlo por bueno.**

Las dos direcciones no son coplanares: las que corren en Z se apoyan exactamente sobre las que corren en X. Dos familias cruzadas a la misma altura comparten la cara superior en cada intersección y ahí el z-buffer titila; apiladas se leen como lo que un techo de estructura es —vigas y correas—, que es mejor y además gratis.

### 4.4 · Pilares

**Tres verticales lejanos y muy tenues**, del piso hasta salirse del cuadro (altura 34). Es lo único que va de una punta a la otra, y esa continuidad es la que ancla la profundidad: un objeto que toca el suelo a veinticinco unidades y sigue hacia arriba le da al ojo una regla para medir todo lo demás.

Están fuera de la cuña de adelante y dentro del radio de la losa, así que apoyan en el piso y no en el aire. Tenues a propósito: con peso serían tres columnas, y tres columnas son un edificio; acá son la insinuación de uno.

### 4.5 · Marcas de replanteo — `floorMarks.ts`

El set pasó de **32 a 48 barras**, y de "marcas de estudio" a **lenguaje de plano**:

- **Ejes.** Las dos líneas de referencia que cruzan el origen, **interrumpidas donde está el objeto**, como se dibuja un eje que pasa por debajo de algo. Reemplazan a los cuatro ticks de media cara de S4, que marcaban exactamente lo mismo (el centro de cada lado) con menos idioma y además caían justo encima de estos.
- **Cotas.** Dos líneas de medida con sus ticks de extremo, por fuera del cuadro que miden. Es lo que convierte un dibujo en una medición.
- **Escala graduada.** Ticks cada dos unidades sobre el eje X, con el de la decena más largo. Da la unidad de medida sin escribir un número — no hay tipografía en esta escena y no la va a haber: sumar una fuente sería sumar un activo y una dependencia.

Va **una sola escala y no dos**: con las dos, el piso se convierte en una grilla y empieza a pedir atención. La asimetría es de plano, no un olvido.

> **Las capas, que son la parte que se puede hacer mal.** Dos cajas coplanares que se cruzan comparten el mismo valor de profundidad en el solape y ahí el z-buffer titila. La solución no es levantar la de arriba —eso la despegaría del piso— sino **hacerla más finita**: todas apoyan su cara inferior exactamente en el papel y la superior queda un pelo más abajo por cada capa. Nadie flota, nadie titila. S4 ya lo resolvía así para las cruces, pero levantando; acá se generalizó a seis familias y se invirtió el truco.

### 4.6 · Fragmentos del logo

Los mismos tres arcos, con la lectura que pedía el sprint: **las piezas que todavía no se ensamblaron.** Si el espacio es la maqueta de algo a medio construir y el logo es la única pieza terminada, estos son el resto de la pieza — todavía sueltos, todavía flotando.

Lo que cambió es el tono: de `#E2E2DF` (casi papel) a `#3C3C38`. **Una pieza de lo mismo se ve del material de lo mismo**; en claro eran el fantasma de otra cosa. Quedan varios escalones por encima de la tinta y por encima también de los planos, así que suman masa sin disputar.

**No se sumó un cuarto**, aunque el sprint lo habilitaba. El argumento del propio archivo sigue valiendo —cuatro empiezan a leerse como un motivo, y un motivo compite con el logo— y con once planos, una retícula y tres pilares nuevos alrededor, lo que la composición pide es lo contrario. Volver a la lectura fantasma, si al mirarlo pesan demasiado, es un número.

### 4.7 · Una primitiva compartida

Las marcas, los planos, la retícula y los pilares son **todas cajas**: cambia la escala, el giro y el tono, no la forma. `InstancedBars.tsx` es la pieza única que las dibuja, y es la razón por la que la escena puede permitirse casi ochenta piezas nuevas **y bajar los draw calls igual**.

Tiene tres cosas que hay que hacer bien y están hechas: `computeBoundingSphere()` (sin eso el frustum culling descarta la familia entera apenas el origen sale de cuadro), el giro en orden **YXZ** (primero el azimut y la inclinación adentro del marco ya girado — el problema que los softboxes resolvían con dos grupos anidados), y el color por instancia sobre material blanco (lo que permite dos tonos en una familia sin costar dos draw calls).

---

## 5 · Contabilidad — draw calls, triángulos y fill

**Medido sobre los datos, no estimado:** las cuatro familias se contaron corriendo el módulo.

| familia | instancias | triángulos | draw calls |
|---|---:|---:|---:|
| marcas de piso | 48 | 576 | 1 |
| planos suspendidos | 11 | 132 | 1 |
| retícula aérea | 17 | 204 | 1 |
| pilares | 3 | 36 | 1 |
| **total instanciado** | **79** | **948** | **4** |

### Contra S4

| | S4 | S5 | delta |
|---|---:|---:|---:|
| marcas de piso | 384 tri · 1 dc | 576 tri · 1 dc | +192 tri |
| softboxes → planos | 48 tri · **9 dc** | 132 tri · **1 dc** | +84 tri · **−8 dc** |
| retícula aérea | — | 204 tri · 1 dc | +204 tri · +1 dc |
| pilares | — | 36 tri · 1 dc | +36 tri · +1 dc |
| **total** | | | **+516 tri · −6 dc** |

**Los draw calls BAJAN.** Los nueve de los softboxes (tres mallas por panel: marco y dos telas) se cambian por uno solo para once planos. El resto de la escena no se tocó: ciclorama 2, fragmentos 3, partículas 2, y las mallas del logo, que son las que son.

### Fill rate — lo único que puede doler, y no dolió

**No aumenta.** Todo lo nuevo es opaco: los planos oscuros no suman capas de mezcla, **restan** — tapan ciclorama, que es píxel que ya se estaba pintando. Las dos únicas superficies con alfa de la escena siguen siendo los dos campos de partículas, sin cambios.

El probe midió la escena como **fill-rate bound, no geometry bound**, con ~10× de margen en desktop. Los 516 triángulos nuevos caen del lado que sobraba: son el 6,6% de los ~7.800 que sumó S4, que a su vez eran nada contra el margen.

**Lo que sigue sin medirse es el frame time, porque necesita navegador**, y sigue sin medirse un solo teléfono. Los dos gastos que S4 dejó marcados siguen siendo los mismos y no cambiaron: el overdraw del bokeh y la pasada de shadow map que la vira obliga (`VIRA_UPDATES_SHADOW`).

### Sombras — una decisión explícita

**Nada de lo nuevo proyecta ni recibe sombra.** No es un olvido: la ortográfica del shadow map cubre ±13 alrededor del logo, así que los planos que caen adentro tirarían sombras enormes justo sobre la zona donde la sombra del logo tiene que leerse, y la retícula y los pilares están tan afuera que ni entrarían al mapa. Meterlos costaría resolución sobre lo único que importa. **Es un booleano si al mirarlo se decide otra cosa.**

---

## 6 · Peso — medido, no estimado

**Mismo método que S4**, para que los números se puedan comparar: `next build --webpack` con `E2E_DIST_DIR=.next-probe`, el grupo de chunks del canvas leído del `react-loadable-manifest.json` del propio build (o sea la lista que webpack declara para el `dynamic(() => import('./ProbeStage'))`, no una elección a ojo), y cada archivo comprimido con `gzip -9`, que es lo que `next start` hace al servirlos.

| chunk | qué es | minificado | sobre la red |
|---|---|---:|---:|
| `bd904a5c` | three (geometrías: Extrude, Lathe, Torus, Box, **InstancedMesh**) | 363,5 KiB | 96,7 KiB |
| `b536a0f1` | three (WebGLRenderer) | 341,2 KiB | 82,5 KiB |
| `b79b7286` | `@react-three/fiber` | 143,0 KiB | 45,1 KiB |
| `7545` | `three-stdlib` / SVGLoader | 21,6 KiB | 7,7 KiB |
| `4857` | resto del grupo del canvas | 13,2 KiB | 5,3 KiB |
| **`7757`** | **el probe, lado canvas: la escena entera + el rig** | **12,7 KiB** | **4,8 KiB** |
| `logodevelOP.svg` | el único activo de la escena | 0,6 KiB | 0,4 KiB |
| **subtotal — grupo del canvas** | | **895,8 KiB** | **242,4 KiB** |
| *baseline S4, mismo grupo* | | *896,3 KiB* | *243,9 KiB* |

### La escena nueva pesa MENOS que la que reemplaza

> **El chunk del probe baja de 13,2 a 12,7 KiB minificados.** Y no por poco código: adentro entraron once planos, diecisiete perfiles de retícula, tres pilares, dieciséis marcas nuevas y una primitiva instanciada compartida.
>
> El motivo es el mismo que bajó los draw calls. Tres softboxes con marco y dos telas cada uno eran tres componentes de JSX con geometrías, materiales y `dispose` propios; once planos instanciados son **una tabla de números** y un componente que ya existe para las marcas. Las 48 marcas, además, salieron de `StudioFloor.tsx` a `floorMarks.ts` como datos. Menos código haciendo más cosas.

### Las clases nuevas de three cuestan cero bytes, otra vez

Los cinco chunks compartidos salen **byte por byte idénticos** a los que publicó S4 (363,5 · 341,2 · 143,0 · 21,6 · 13,2). `InstancedMesh` y `BoxGeometry` ya estaban en el bundle —el índice ESM de `three` re-exporta todo y webpack no puede podarlo acá—, igual que `LatheGeometry`, `TorusGeometry` y `PlaneGeometry` en S4.

> ⚠️ **Un detalle de método, para que nadie compare mal.** La columna de red de este reporte da ~1,1 KiB por debajo de la de S4 **en chunks cuyo tamaño minificado es idéntico**. O sea que la diferencia no es contenido: es la herramienta de compresión (misma bandera `-9`, distinto build de `gzip`, o el ordenamiento interno de ids de webpack, que no cambia el tamaño pero sí lo que el compresor encuentra). **La comparación válida entre sprints es la columna de minificado**; la de red vale como orden de magnitud y para comparar filas del mismo build entre sí.

### El panel, que S4 no midió

El editor **no le cuesta un byte al canvas**: `OrbitRig` importa el tipo del editor (`import type`), que se borra en compilación, así que la implementación no entra al chunk de la escena. Vive en el chunk de la ruta, junto con el resto del panel:

| | minificado | sobre la red |
|---|---:|---:|
| `app/probe-escena/page` — controles, stores, editor y export | 39,0 KiB | 13,7 KiB |
| **total de la ruta, de punta a punta** | **934,8 KiB** | **256,1 KiB** |

**Este es el único número del reporte sin baseline**, y hay que decirlo: la tabla de S4 nunca midió el chunk de la ruta —solo el grupo del canvas— así que no hay de dónde restar para saber cuánto de esos 39,0 KiB es de S5. Lo que sí está medido exacto es el precio de la decisión que lo hizo crecer a propósito:

> **Los comentarios como dato: 4.092 bytes de texto literal, 2,0 KiB comprimidos.** Es lo que cuesta que el export devuelva el archivo con su razonamiento intacto en vez de una tabla de números pelada. Se paga una vez, en una ruta interna.

### Y lo que importa para el home

**El presupuesto de 243,9 KiB era el de la escena, y la escena bajó.** El panel entero —controles, sliders, editor, export, notas— es del instrumento: `/probe-escena` es una ruta interna, con `noindex` y sin un solo link entrante, y nada de eso viaja al home. Lo que el home eventualmente va a cargar es el grupo del canvas, y ese salió más liviano que el de S4.

---

## 7 · Lo que queda

### Para calibrar mirando — ahora con la herramienta para hacerlo

1. **La pose de cada tramo cae en su borde** (§9.1 de S4). Es lo primero, y ahora es el botón **duplicar**.
2. **El keyframe 1** (altura 9,00 al aterrizar) y **el giro de Demos** (262° en una pantalla, §9.3): los dos son ediciones de la columna `at`.
3. **La narrativa de luz.** Tanteada, no diseñada. Los dos canales de luz están entre los siete sliders del editor.
4. **La ambigüedad del keyframe 4** (§2 de S4): bajar `height` a 4,25 o subir `frameY` a −0,11. Un número cada una, ahora con la escena delante.
5. **El balance de negro de la escena nueva**: `PLANE_DARK_COLOR`, `FRAGMENT_COLOR` y `AERIAL_COLOR` son tres constantes.
6. **La retícula en movimiento**, por el aliasing (§4.3). Es lo único de la escena nueva con un riesgo concreto de verse mal.
7. **`DoubleSide` del ciclorama** → `FrontSide`, pendiente heredado de S4: sigue sin poder verificarse sin navegador.
8. **`VIRA_UPDATES_SHADOW`**, cuando haya medición en un teléfono real.

### Lo que este sprint dejó afuera, a propósito

- **Renombrar keyframes** y **editar `ease`/`turn`** desde el editor. No estaban pedidos. El `ease` y el `turn` del seleccionado **se muestran** (son la mitad de la decisión al duplicar), pero se cambian en el archivo.
- **Un segundo eje graduado** en el piso (§4.5).
- **Reordenar keyframes arrastrando** más allá de un vecino (§3.3).
- **La cola del cierre** y **la conexión al scroll real**: siguen siendo lo que eran, el sprint siguiente.

### El límite de 300 líneas, dicho como está

**Los nueve archivos nuevos están todos por debajo**, el más largo en 298. `StudioFloor.tsx` además bajó de 325 a 118 al mudar las marcas.

Siguen arriba del límite cuatro archivos que ya venían así de S4: `choreography.ts` (508), `probeScene.ts` (507), `OrbitRig.tsx` (476) y `probeStore.ts` (310). Los tres primeros son mayoría comentario —son los archivos que explican las decisiones del rig y de la escena, y esa es su función— y partirlos es una reestructuración con su propio riesgo, no un efecto colateral de este sprint. **No se hizo, y queda anotado**: si se decide partirlos, es un sprint de mudanza con verificación propia.

### Una decisión de scope que conviene mirar

**Borrar duplicados no estaba en la lista del sprint**, y se implementó igual, acotado a los keyframes que el editor crea. El motivo: duplicar es la operación que el sprint marca como la más usada, y sin baja el único camino de vuelta de una copia que no gustó es el reset, que descarta la sesión entera. Es completar la función pedida, no agregar una nueva — pero es una decisión mía y va marcada.

---

## 8 · Verificación

```
.\node_modules\.bin\tsc.cmd --noEmit                → exit 0
.\node_modules\.bin\eslint.cmd src/app/probe-escena → exit 0
next build --webpack (E2E_DIST_DIR=.next-probe)     → exit 0
```

**Sin dev server, sin navegador, sin capturas y sin `visual-qa`: fue el pedido del sprint.**

### Lo que sí se pudo verificar sin pantalla

Tres cosas que son lógica pura y se corrieron con `tsx`, el mismo runner que usan los `.invariant.ts` del repo:

**1 · El export reproduce el archivo.** Se generó el bloque desde el editor recién cargado y se lo comparó contra el que está hoy en `choreography.ts`. **Las 17 poses, los `at`, los nombres, los `ease`, los `turn`, los `derived` y los `...LIT` salen byte por byte iguales.** La única diferencia son las tres normalizaciones que el exportador declara:

- el separador del tramo 1 pasa de 79 a 78 caracteres (los otros cinco ya estaban en 78: era un desprolijo de autoría);
- renglón `//` en blanco entre el separador y su bloque, siempre (hoy el tramo 1 no lo tiene y el 5 sí);
- el comentario de cada keyframe va arriba de todo del objeto (hoy están en tres lugares distintos, también por autoría a mano).

**2 · Las invariantes del editor.** 33 chequeos, todos verdes: el `at` acotado contra los dos vecinos y el orden estricto sobreviviendo a los clamps; duplicar a mitad de camino, después del original y antes si es el último; la pose copiada como objeto propio; no se borra lo del archivo; el reset restaura poses, `at` e identidades; el track se reconstruye tras cada edición; el censo del export en singular y en plural.

**3 · El sampler en los extremos.** Muestrear en `at` devuelve la pose exacta de cada uno de los 17 keyframes —que es lo que hace que mover un slider mueva la cámara—, y con el primer keyframe movido a 0,05 y el último a 0,9, el progreso 0 y el progreso 1 **no extrapolan**. Eso último es un arreglo de este sprint: `sampleTrack` recorta la fracción a [0,1] porque `linear` no pasa por el evaluador de bezier, que ya recortaba, y desde S5 esos dos `at` se pueden mover.

### Una trampa que apareció

`eslint` frenó un `setState` sincrónico adentro de un `useEffect` (`react-hooks/set-state-in-effect`) en la caducidad del texto exportado. La regla tiene razón y el arreglo no fue silenciarla: lo que había era una cuenta disfrazada de sincronización, y se reescribió como derivación en el render (§3.5). **Vale como recordatorio de que el lint de este repo atrapa cosas que `tsc` no ve.**

---

## 9 · Archivos

### Nuevos

```
src/app/probe-escena/_components/
  choreographyEditor.ts     El track vivo: copia mutable, invariantes y suscripción
  choreographyExport.ts     El generador del bloque de `choreography.ts`
  choreographyNotes.ts      Los comentarios del array, como dato
  KeyframeEditor.tsx        El panel del editor
  KeyframeList.tsx          La lista con las marcas de origen
  KeyframeExportPanel.tsx   El botón de exportar y el texto que caduca
  InstancedBars.tsx         Muchas cajas, un draw call. La primitiva compartida
  probeArchitecture.ts      Planos suspendidos, retícula aérea y pilares
  floorMarks.ts             Las 48 marcas de replanteo (salieron de StudioFloor)
docs/rediseno/outputs/S5-EDITOR.md
```

### Modificados

```
src/app/probe-escena/_components/
  choreography.ts         + `LIT` exportada (la usa el export), doc del editor y de las notas.
                          NINGÚN dato de keyframe cambió.
  choreographySampler.ts  Recorte de la fracción a [0,1] en `sampleTrack`
  probeStore.ts           + modo `editor`
  probeScene.ts           − softboxes, − medidas de marcas; + `BarPlacement` y la paleta
                          del espacio; `FRAGMENT_COLOR` de claro a oscuro
  OrbitRig.tsx            + modo editor, track vivo del editor en vez del módulo
  ProbeStage.tsx          − softboxes; + las tres familias instanciadas
  StudioFloor.tsx         325 → 118 líneas: las marcas se fueron a `floorMarks.ts`
  ProbeControls.tsx       + tercer modo, + el panel del editor
  ProbeEscena.tsx         + el editor, creado al lado de los tres stores
  LogoFragments.tsx       La lectura nueva (piezas sin ensamblar)
```

### Borrados

```
src/app/probe-escena/_components/Softboxes.tsx   (reemplazado por los planos suspendidos)
```

### Intocados

`ProbeLogo.tsx`, `DepthParticles.tsx`, `BokehParticles.tsx`, `StoreSlider.tsx`, `ProbeReadout.tsx` y `ChoreographyControls.tsx`. El home entero. Los frozen: `HeroArtifact.tsx`, `TransitionContext.tsx`, `PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`. De `logo-footprint.ts` solo se lee `LOGO_BOX_WORLD`, como antes.

**El probe sigue importando exactamente tres cosas de afuera de su carpeta** —`MOTION_EASE`, `useReducedMotion` y `LOGO_BOX_WORLD`— y nada del repo lo importa a él, salvo la línea de `publicRoute.ts` que ya venía de antes.
