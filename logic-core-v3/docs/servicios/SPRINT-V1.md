# V1 — Páginas web con la escena: la intro, la variante y la salida

2026-10-20 · Autor: CC · Viene de: el prompt «V1» de Valentino, `docs/rediseno/B12a-API.md` (`a0ecd331`), la skill `pagina-home-based`, `SPRINT-V0.md` y `SPRINT-M2b.md`.
Rama `paginas/servicios`, sobre el merge-5 (`660a9d2f`). Las rutas son desde `src/app/v3/`, salvo las que empiezan con `src/`, `docs/` o `scripts-`; `esc/` es `_lib/escena/`.

**El orden de la corrida (decidido por CC, revisar):** Paso 0 → Grupo 2 (commit) → Grupo 3 (commit) → Grupo 1 (sin commit, FRENO, el dev prendido). El Grupo 1 y el 2 tocan los mismos archivos (`pagina.invariant.tsx` y este log): así los commits de los grupos 2 y 3 salen limpios mientras el 1 espera el «commit» de Valentino. Las mediciones del M2b y de P-H26 (Grupo 3) corren contra la página de hoy (con la tapa): miden las historias del precio y el modal, que el Grupo 1 no toca.

---

## 1. Paso 0 — el merge-5 y la API

### 1.1 El merge-5

- `git log -4`: `660a9d2f` (el merge de `rediseno/home`), `a0ecd331` (`B12a-API.md`), `627db1be` (B12a.3, la ranura y P-H29 a–f), `92f96cf9` (mediciones). El M2b (`912be004`) es el primer padre del merge. `git status`: solo `SPEC.md` y `CONTRATO.md` sin seguir.
- El merge no tocó ningún archivo de `[servicio]/`, `_servicios/`, `docs/servicios/`, `public/servicios/` ni `scripts-servicios/`.
- **tsc: 0 errores.** Antes de correrlo borré `.next/dev/types` sin mirar si estaba corrupta (la regla dice borrarla si lo está; el dev la regenera).
- **Los tests de servicios y los 6 barridos, iguales a la base del M2b:** `datos` 55/0 · `precios` 22/0 · `slots` 44/0 · `seo` 56/0 · `pagina` 240/0 · `medios` 26/0 · `diagonales` 47/0 · `escena` 45/0 · `historias` 37/0 · s38, s44 y s74 sin invariantes con falla · `s77` 44/0 · `s25-contacto` 35/0; `s4-paquete` 21/0 · `s40` 38/0 · `s53` 54/0 · `s8-escena` 33/0 · `s8-montaje` 56/2 (las dos de siempre, los 300 renglones; solo se suman a su lista los archivos nuevos de `esc/ruta/`) · `s9-sentry` 22/0 con 2 fuera de ventana. Las salidas, en `C:\paginas-servicios-datos\c4\paso0\`.
- **Lo que importamos del home, igual:** 38 archivos (36 del home y 2 nuestros de `scripts-servicios/`), resueltos desde cada import de `_servicios/**` y `[servicio]/`; ninguno cambió entre `912be004` y `660a9d2f`.
- **La espera de memoria (O-10):** quedaron tres utilidades de Chrome huérfanas del banco del home (`StorageService` de los `foco-perfil` de las 07:01–07:21, sin padre, en reposo). No se tocan; la espera de esta corrida no las cuenta como arnés corriendo (sí cuenta todo lo demás del home).

### 1.2 Lo que dice la API, punto por punto

| Punto | Lo que dice | Dónde |
|---|---|---|
| **El registro de una variante** | Un módulo `'use client'` que exporta el componente como `default`; una línea en `_variantes/registro.ts` con su id y un `import()` dinámico (cada servicio agrega SU línea). El preset lleva ese id. `_lib/` nunca importa `_servicios/`: el registro es el único lugar del home que nombra a las variantes | API §4 `B12a-API.md:148-154` y `:164-168`; `_variantes/registro.ts:17-24` (`REGISTRO_DE_VARIANTES`, `IdDeVariante`, `esIdDeVariante`); la ranura lo carga en `esc/ruta/RanuraDeLaVariante.tsx:134-138` |
| **El preset de ruta y el id de la página** | `IdDePagina = 'home' \| IdDeServicio \| 'prueba'`; el preset es una constante del módulo (el mismo objeto en cada render): `{ id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante }` | API §1 `:28-68`; `esc/ruta/preset.ts:18-40`; `PresetDeLaPagina` (`esc/ruta/PresetDeLaPagina.tsx:11-14`: lo apila con `useLayoutEffect`) |
| **Cómo se monta `IntroDeLaPagina`** | `<IntroDeLaPagina titulo bajada preset />`, de servidor: el bloque de 1,5 pantallas transparente, con `data-intro-de-pagina="<preset.id>"`, `data-servicio="<preset.acento>"` y `data-seccion="invertida"` de noche; declara el preset; el `h1` (`titulo`) siempre en el DOM; la bajada, párrafos (`ParrafoDeLaBajada`), fija arriba (sticky) | API §2 `:70-99`; `_componentes/pagina/IntroDeLaPagina.tsx:16-18` (atributo y selector), `:28-48` (el bloque: el alto de 1,5 pantallas en su clase `:37`, `data-servicio` `:33`, `data-seccion` `:36`, el preset `:39`, sticky `:40`, el `h1` `:41-43`), `:51-53` (`ParrafoDeLaBajada`) |
| **`AVANCE_DE_LA_INTRO`** | `{ current: number }`, de 0 (el tope del bloque en el tope del cuadro) a 1 (1,5 pantallas después); lo escribe la lectura del scroll, medido en el layout sobre el bloque del selector; lo leen el rig y la variante (`avance` de sus props) | API §1 `:56-60`; `esc/ruta/pistaDeLaIntro.ts:26` (`PANTALLAS_DE_LA_INTRO`), `:47-50` (`avanceDeLaIntro`), `:57`; lo escribe `esc/ataduraAlScroll.ts:138-139` |
| **Los canales de luz de P-H29** | a · `luzDeAbajo(energia, color)`: la luz de abajo del piso (las juntas y el plano), con un dueño por tramo (en la intro, la ranura, mientras el avance es menor que 1 o la variante sale). b · su color: `uColorDeLaLuz` en el piso y en el plano (blanco de base). c · `energia(color)`: `uLuzNoche` de las brasas, los arcos y la red (`ENERGIA_DE_LA_RUTA`, que `PlasmaYCargas` copia mientras la ranura lo pide). f · `COMPOSICION_DE_LA_LUZ = { noche: 1, brilloDelPiso: 0,12 }`, la del avance 0, del home | API §4 `:127-146` y `:181-185`; `esc/ruta/variante.ts:29` (a), `:31` (c), `:51` (f); b: `esc/final/enElPiso.ts:245,274`, `esc/final/planoDeLaLuz.ts:45,60`, `esc/final/luzDeAbajo.ts:213`; la ranura los escribe en `RanuraDeLaVariante.tsx:183-186`; c: `esc/energia/PlasmaYCargas.tsx:96-100` |
| **`pedirLaSalidaDeLaVariante()` y la navegación** | La pide la navegación ANTES de irse y espera la promesa: `saliendo` pasa a `true`, la variante baja a la composición en `SALIDA_DE_LA_VARIANTE_MS` (420), se resuelve y recién ahí se navega. En el acto sin variante, con la escena tapada o con movimiento reducido. La navegación definitiva es `EnlaceDeRuta` (B12a.6, con el velo), nunca `router.push`; hasta entonces, el enlace interino de la página de prueba: espera la señal y vuelve a apretar el MISMO enlace | API §4 `:187-194`, §5 `:204-213`; `esc/ruta/salidaDeLaVariante.ts:13-15` (y `atenderLaSalida` `:18-23`); `variante.ts:45`; la ranura la atiende en `RanuraDeLaVariante.tsx:79-105,144-148`; el interino, `prueba-de-pagina/EnlaceConLaSalida.tsx:13-34` |
| **El preset del título 3D (P-H14)** | **No existe todavía.** Es B12a.4 (con el FRENO de la familia, `?titulo=1\|2\|3`): `_componentes/titulos3d/presets.ts` y `TituloDePagina.tsx` no están en el árbol. Hasta entonces el `h1` es el visible | API estado `:16`, §3 `:101-121`; `_componentes/titulos3d/` (solo `TituloDeVolumen.tsx`, `titular2d.ts`, `useTextoDeVolumen.ts`) |
| **El presupuesto de costo** | `PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0,5 }`: la diferencia con y sin la variante, alternadas y recién recargadas, contra el build de producción (`COSTO=1 BASE=<build> npx tsx scripts-carga/ranura.ts`). Memoria: diez idas y vueltas dejan `renderer.info.memory` como estaba | API §4 `:196-202`; `variante.ts:42`; el banco, `scripts-carga/ranura.ts:66-77,192-214` |

**Además, leído en el código:**
- La ranura se monta en `esc/ProbeStage.tsx:299`, después del final del pie (`:297`). El final del pie (con el plano de la luz) se monta solo `!reducedMotion || calidad === 'compacta'`: con movimiento reducido a 1024 o más, la luz de abajo prestada enciende las juntas pero no hay plano debajo del piso.
- El avance llega a 1 con la intro entera fuera del cuadro: de ahí en adelante la ranura suelta la luz (la del final) y el papel tapa el cuadro entero.

### 1.3 Donde la API y el V0 difieren (manda la API)

| V0 | La API | Qué se hace |
|---|---|---|
| Cuatro canales: `noche`, `brilloDelPiso`, `tinteDelPiso`, `tinteDeLaEnergia` | La variante no toca la noche (la pone el preset) ni la luz de la sala; escribe la luz de abajo (energía y color) y el color de la energía | Quedan tres canales: el brillo del piso y los dos tintes. La noche sale del preset (`noche: 'noche'`) |
| `COMPOSICION_COMPARTIDA` local (0,12) y `DURACION_DE_LA_SALIDA_MS` (420) | `COMPOSICION_DE_LA_LUZ` y `SALIDA_DE_LA_VARIANTE_MS`, del home (P-H29f y d) | Se importan; las copias se van |
| `AJUSTE_POR_CALIDAD` (el campo de la luz a la mitad en compacta) | La variante no tiene un campo propio: la luz de abajo la dibuja el piso del home, y la calidad compacta la elige el home | Se va: en el celular, la compacta del home sin nada propio |
| `presetDeWeb(pista, variante)`: la variante como componente, la intro por `[data-intro-de-servicio]`, `pista: 'home' \| keyframes` | `variante` es un id; la intro por `SELECTOR_DE_LA_INTRO`; `pista: PISTA_DE_LA_INTRO` | El preset es una constante con el id `'web'` |
| `firmas.ts`: cinco firmas copiadas con «B12a-API: reemplazar por el import» | Las firmas existen en `esc/ruta/` | `firmas.ts` se va; se importan |
| Nuestra intro: `data-intro-de-servicio`, una pantalla (`ALTO_DE_LA_INTRO`), la tapa interina, sin `data-servicio` (P-S1) | `IntroDeLaPagina`: `data-intro-de-pagina`, 1,5 pantallas, sin tapa, y con `data-servicio="<acento>"` en el bloque | Se reemplaza; P-S1 se acota: `data-servicio` solo en la intro, puesto por el home (§4) |

---

## 2. Grupo 2 — La pausa común (P-H27)

### 2.1 Lo hecho

- **`movimiento/VideoDeFondo.tsx`:** la pausa del video de trabajos es `BotonPausa` del home (`_componentes/medios/BotonPausa.tsx`), nombre «Pausar el video de trabajos» (`DE_LA_PAUSA`). Con el comportamiento del panel después de su F7 (`CLASE_DE_LA_PAUSA_DEL_PANEL`, `_secciones/trabajos/portfolio/MedioDeLaTira.tsx:17`):
  - en escala 0 y sin puntero: el mouse nunca la ve ni la toca;
  - sigue en el orden del Tab y aparece entera con `:focus-visible`;
  - el lugar es el nuestro, abajo a la derecha (`CLASE_DE_LA_PAUSA_DEL_VIDEO`: arriba la tapaba la barra fija del sitio, medido en el M3).
- **Con movimiento reducido no hay pausa** (`PausaDelVideo` devuelve nada): queda el póster, quieto, como ya hacía la capa.
- **Se borró nuestra pausa propia:** `BotonDePausa`, `ROTULO_DE_LA_PAUSA` y `siguienteDeLaPausa` (`reproduccion.ts`); la nota «P-H27: reemplazar…» se fue con ella. `s77` ya deja importarla a `_servicios/movimiento/VideoDeFondo.tsx` (`PUEDEN_IMPORTAR_LA_PAUSA`, s77 §1): no se tocó.

### 2.2 Los tests (`pagina.invariant` §10 y §12)

Reemplazados por la común del home, no aflojados; cada uno con su control:

| Antes (la nuestra) | Ahora (`BotonPausa`) | Control |
|---|---|---|
| el botón, nombre fijo, `aria-pressed`, el ícono, y que alterna (`siguienteDeLaPausa`) | el botón del home en el slot, «Pausar el video de trabajos», `aria-pressed="false"`, el ícono de pausa; que alterne lo fija s77 §1 sobre el mismo componente | la nuestra de antes; otro nombre; una página sin el botón |
| — | **sólo para el teclado:** el botón lleva TODAS las clases de comportamiento de la pausa del panel (escala 0, sin puntero, `focus-visible`) | una sin la escala 0; una que el puntero alcanza |
| abajo a la derecha | igual, sobre el botón del home | uno arriba a la derecha |
| la nota P-H27 y «no importa BotonPausa» | no queda la nuestra en ningún fuente, y el video importa `BotonPausa` | un fuente con la pausa de antes |
| — | **con movimiento reducido no hay pausa** | una pausa que ignora el reducido |
| los pedidos cumplidos: P-H18 y P-H21 | se suma P-H27 | la nota de P-H27 |

`pagina`: 240 → **244/0**.

### 2.3 En el navegador (`scripts-servicios/pausa.ts`, el Chrome del sistema a la vista, `/api/` bloqueado)

| Corrida | 1440 | 390 |
|---|---|---|
| **Rojo, con el código de antes** | FALLA: la pausa propia, sin la del home, el nombre, **con el mouse se ve (44 × 44), el puntero la toca y un clic pausa el video**, y con Tab mide 44 | ídem |
| **Verde, con el arreglo** | ok: «Pausar el video de trabajos», sin apretar; con el mouse, caja 0 × 0, el puntero no la toca y el clic en su lugar no pausa (el video sigue); con Tab, enfocada con `:focus-visible`, 48 × 48 adentro del cuadro; Enter pausa (el video se para) y Enter suelta (anda); el ícono contra el peor píxel de su disco (cinco cuadros con el video andando): **6,70:1**; sin errores ni llamadas a `/api` | ok, lo mismo; 6,70:1 |

- La primera corrida en rojo midió mal la parte del mouse: el botón quedaba debajo del borde del cuadro (y = 1013 con 900 de alto) y el puntero nunca lo alcanzaba. El banco ahora lo centra y exige que el punto esté adentro; con eso, el rojo de arriba es válido.
- **Corrieron después del commit del grupo** (`92490756`), en la primera ventana de memoria (2026-10-21, 02:25, con el home quieto):
  - **el control** (`CONTROL=a-la-vista`: una hoja que la deja a la vista y con puntero, el defecto otra vez) a 1440: **FALLA**, como tiene que dar: con el mouse se ve (48 × 48), el puntero la toca y el clic pausa el video;
  - **con movimiento reducido** (`REDUCIDO=1`) a 1440 y 390: ok, sin botón, sin `<video>` y con el póster cargado a la vista.

### 2.4 El gate

lint de los archivos tocados: 0 · tsc: 0 · los tests de servicios y los 6 barridos, iguales a la base del Paso 0 salvo `pagina` (244/0) · `s77` 44/0. Las salidas, en `C:\paginas-servicios-datos\v1\gate-g2\`.

---

## 3. Grupo 3 — Lo que quedó sin correr del M2b, y P-H26

Contra la página de hoy (con la tapa: el Grupo 1 todavía no estaba aplicado), el dev en `:3001`, con el home quieto.

### 3.1 El M2b en el navegador

El banco del M2b (`scratchpad/c3/verificar-historias.cjs`, el Chromium sin placa: la escena queda tapada; su único error de consola es «Error creating WebGL context», el de siempre de ese Chromium). Los resultados, en `C:\paginas-servicios-datos\c3\m2b\navegador\`.

| Corrida | Resultado |
|---|---|
| **Las historias a 375** (`historias 375`) | **ok**, como el 390 del M2b: la versión del teléfono a la vista y las diagonales no; las historias se montan solo con la caja pegada (la lista quieta, `inert`); los tres pasos se leen, con «Recomendada» y la línea de la Mediana, el texto adentro del cuadro y debajo de las barras, contraste 6,65:1, desborde 0, nada flota encima; los toques van 1, 2, 1, 2 sin mover la página; mantener pausa; el deslice de costado vuelve un paso sin scrollear; las salidas aterrizan donde tienen que aterrizar (adelante 2938, atrás 1474, los dos exactos); avanza a los 10 s; el CTA de debajo abre el contacto con «web» marcado y los campos vacíos, cerrado con Esc; cero `/api` |
| **No se montan a 768** (`sinmontar 768`) | **ok**: en 13 paradas por el precio, las historias nunca montadas; la versión del teléfono con `display: none`, las diagonales a la vista |
| **No se montan a 1440** (`sinmontar 1440`) | **ok**, ídem |
| **Con movimiento reducido a 390** (`reducido 390`) | **ok**: sin historias en ninguna de las 9 paradas; la caja sin anclar (`relative`); los tres pasos quietos, uno debajo del otro, a la vista (Simple 269 px, Mediana 392, Premium 245), contraste 6,65:1, desborde 0 |

### 3.2 P-H26 con nuestra sonda (`scripts-servicios/foco-del-contacto.ts`)

La del R1 (`diag-foco.cjs`, los pasos de `SPRINT-R1.md` §5.1), ahora en el repo: el Chrome del sistema a la vista, `/api/` bloqueado, un Chrome por ancho y la página cargada de nuevo para cada CTA. Por cierre: el CTA a la vista, 2 s, foco + Enter, la hoja, 1,6 s, Esc, que se vaya, 1,5 s y `document.activeElement`.

| | El CTA del precio | El llamado | El cierre | Total |
|---|---|---|---|---|
| 1440 | 12 de 12 | 12 de 12 | 12 de 12 | 36/36 |
| 1024 | 12 de 12 | 12 de 12 | 12 de 12 | 36/36 |
| 390 | 12 de 12 | 12 de 12 | 12 de 12 | 36/36 |
| **108 cierres** | | | | **108 con el foco en el botón, 0 en BODY** |

- **El control positivo** (la devolución de antes, `?devolucion=un-cuadro`, a 1440, 36 cierres): **2 en BODY** (el CTA del precio en la vuelta 10 y el cierre en la 9). La carrera se reproduce en servicios con la devolución de antes y no con la de ahora: el arreglo del home (P-H26, merge-4) anda en servicios.
- Con el Chromium sin placa del R1 la carrera daba ~25 %; con el Chrome del sistema, ~6 % (2 de 36). Es otra máquina de tiempos: el criterio es el 0 de 108, y el control dice que el banco ve la carrera.
- Cero llamadas a `/api` y cero errores en las 144 vueltas.

---

## 4. Grupo 1 — La intro con la escena y la variante de web (commiteado con el «commit» de Valentino, 2026-10-21)

### 4.1 Lo hecho

| Archivo | Qué |
|---|---|
| `_servicios/Intro.tsx` | **La intro es la del home:** `IntroDeLaPagina` con el nombre (`h1`), la bajada en dos `ParrafoDeLaBajada` (la entrada del problema y su texto) y el preset de la página. Se fueron nuestro atributo (`data-intro-de-servicio`), nuestro alto de una pantalla (`ALTO_DE_LA_INTRO`), **la tapa interina** y la marca de la sección |
| `_servicios/escena/presets.ts` (nuevo) | Los presets de las tres páginas, una constante cada uno (B12a-API §1): de noche, `PISTA_DE_LA_INTRO`, el tramo `SELECTOR_DE_LA_INTRO`, el acento de su servicio y la variante del registro (`web` en Páginas web; Software e IA, ninguna) |
| `_servicios/escena/VarianteDeWeb.tsx` (nuevo) | **La variante de Páginas web**, `'use client'` y `default`: en su `useFrame` pide la luz del cuadro (`cuadroDeLaVariante`) y escribe SOLO `luzDeAbajo` (la luz de abajo del piso, del blanco al celeste) y `energia` (las brasas, los arcos y la red, teñidos). No agrega objetos: el color va solo en la luz. Devuelve `null` |
| `_variantes/registro.ts` (del home: **una línea**) | `web: () => import('../_servicios/escena/VarianteDeWeb')`: el registro por id que la API manda que cada servicio complete (§1.2). Es el único archivo fuera de nuestras carpetas |
| `_servicios/escena/estructura.ts` | Pura, a la API: tres canales de luz (el brillo del piso y los dos tintes); la composición y la salida, las del home (`COMPOSICION_DE_LA_LUZ`, `SALIDA_DE_LA_VARIANTE_MS`); el encendido suave de 0 a 0,5 y quieto hasta 1; con reducido, el final quieto y la salida inmediata; el cuadro de la variante (`cuadroDeLaVariante`) |
| `_servicios/escena/luzDeWeb.ts` | La encendida de web y el token (era `varianteDeWeb.ts`: cambió de nombre para no chocar con `VarianteDeWeb.tsx` en Windows) |
| `_servicios/movimiento/RaizDeLaPagina.tsx` y `salidaDeLaPagina.ts` (nuevos) | **La salida:** la raíz de la página (el mismo `div`, ahora de cliente) atiende en la captura el clic en cualquier enlace que se va de la página (el logo, el Portfolio, el cierre); lo frena, pide `pedirLaSalidaDeLaVariante()`, la espera y vuelve a apretar el MISMO enlace, que esta vez pasa. Nunca `router.push`. No se va: un ancla de la misma página, un CTA que abre el contacto, un clic con tecla o con otro botón, un `target`, una descarga, uno de afuera |
| `_servicios/Encabezado.tsx` | El logo va ANTES de la intro y fuera de ella, con su propio `data-seccion="invertida"` (en claro sobre la escena) |
| `_servicios/PaginaDeServicio.tsx` | La raíz es `RaizDeLaPagina`; el encabezado, la intro del home, el cuerpo |
| Se fueron | `escena/firmas.ts` (las copias de las firmas: se importan del home), `escena/presetDeWeb.ts` y `bloques/Problema.tsx` (su contenido es la bajada) |
| `scripts-servicios/escena.ts` (nuevo) y `navegador.ts` | El banco del navegador de la escena; `peorContraste` suma el p99, el lugar y el color del peor píxel |

**El título 3D (P-H14):** no está en la API todavía (B12a.4). El `h1` queda visible, siempre en el DOM, y un test lo afirma.

### 4.2 Los tests

`escena.invariant`: 45 → **61/0**. `pagina.invariant`: 244 → **256/0**. `historias` 37/0 y `diagonales` 47/0, iguales. `s78` (del home, por la línea del registro) 64/0. Los demás tests de servicios y los 6 barridos, iguales a la base; s40 corrió con un índice temporal con los borrados (la trampa de memoria: un borrado sin indexar lo tira), 38/0.

**Lo que pidió el prompt, cada uno con su control:**

| Test | Dónde | Control |
|---|---|---|
| la variante está registrada con su id (el import dinámico; el módulo `'use client'` con `default`) | escena §7 | un registro sin la línea; uno que la importa entera |
| el avance 0 da la composición compartida (la del home) | escena §1 | una curva que arranca encendida; una composición propia; una teñida |
| a 0,5 la luz está completa y después queda quieta (y sube suave, sin bajar) | escena §2 | una que sigue subiendo; una que baja y sube; una lineal |
| el color va solo en la luz (los canales; el componente escribe solo las dos funciones de la ranura y no crea nada) | escena §4 | un anillo de color en el piso; el almacén del home escrito directo; el acento entero desde el principio |
| cada enlace de salida pide la salida antes de navegar (la decisión y el manejador en el tiempo) | escena §10 | una decisión que deja ir al Portfolio sin salida; una que frena el clic con Control; un manejador que navega sin esperar; uno que no la pide |
| el h1 siempre en el DOM y a la vista | pagina §1 | un h1 `sr-only`; uno adentro de algo `aria-hidden` |
| no queda la tapa (y ni la intro ni el encabezado pintan fondo) | pagina §10 | la tapa de antes en la intro; una intro con fondo; un encabezado con fondo |

**Reemplazadas por la spec nueva, no aflojadas** (cada una con su control, en el docblock de los dos tests):
- escena: la noche ya no es un canal (la pone el preset); «la compacta cuesta un cuarto» → la variante no tiene costo propio por calidad; «las 5 firmas con la nota» → se importan; «sin montar» → la intro importa los presets y la variante entra solo por el registro;
- pagina §1 la intro es la `<section>` del home, después del encabezado; §2 el problema ya no es un bloque; §3 `data-servicio` una vez, en la intro (P-S1 acotado); §5 `data-seccion` en la intro y en el encabezado; §6 el acento de la intro por `data-servicio`; §9 el encabezado antes de la intro, en claro, el código de cliente suma la raíz y la variante, y las clases arbitrarias de la intro son las del componente del home; §10 sin tapa.

### 4.3 En el navegador (`scripts-servicios/escena.ts`: el Chrome del sistema a la vista, el banco de la escena del home, `/api/` bloqueado; contra el dev)

**El rojo, con el código de antes (1440):** sin la variante de web, sin la intro del home, la escena no se ve (0 píxeles distintos con y sin el lienzo: la tapa), el avance clavado en 0, sin el h1 ni la bajada de la intro, y el logo navegando sin salida (159 ms, la luz sin moverse).

**El verde:**

| | 1440 | 1024 | 768 | 390 |
|---|---|---|---|---|
| **La escena se ve en la intro** (píxeles que cambian sin el lienzo) | 99,6 % | 99,5 % | 99,6 % | 99,2 % |
| **El avance** (±1 %) | 0 · 0,2504 · 0,5 · 0,7504 · 0,9504 · 1 | ok | ok | ok |
| **La luz** en 0 / 0,25 / 0,5 – 0,95 | 0,12 blanca / 0,561 teñida / 1 en el celeste (`8fc0e8`), quieta | ídem | ídem | ídem |
| **El h1 y la bajada** (peor píxel; el 99 % del fondo) | **1,15:1** (3,2) | **1,01:1** (2,3) | **1,00:1** (2,63) | **1,00:1** (1,45) |
| **El papel tapa la escena** (posiciones, fugas, píxeles distintos sin el lienzo) | 14 · 0 · 0 | 15 · 0 · 0 | 14 · 0 · 0 | 14 · 0 · 0 |
| **La salida** desde 0,5 (la luz en la composición · navega) | 434 · 424 ms (hueco máx. 14) | 433 · 423 | 434 · 422 | 435 · 424 |
| el clic real del mouse en el logo (navega) | 433 ms | 433 | 422 | 422 |
| desde el papel (el cierre: en el acto) | 10 ms | 10 | 10 | 10 |
| **Consola** | 0 errores · 0 NaN · 0 `/api` | ídem | ídem | ídem |

- **Con movimiento reducido** (1440 y 390): la variante quieta en su estado final (1, el celeste) en cualquier avance, y la salida en el acto (1 ms por código, 10 con el mouse).
- **El costo** (contra el dev: relativo; con y sin la variante, alternadas y recién recargadas): **1440 Δ −0,046 ms por cuadro** (A/A 0,023), **390 Δ +0,051** (A/A 0,019). Las dos bajo la resolución del banco, contra un presupuesto de **0,5 ms** (`PRESUPUESTO_DE_LA_VARIANTE`).
- **Los controles** (1440, el defecto reintroducido por una hoja o un escucha): la tapa → **FALLA** (0 píxeles distintos); los enlaces sin la salida → **FALLA** (navega a los 0 ms y la luz nunca baja); el cuerpo transparente → **FALLA** (10,45 M píxeles distintos). El de texto oscuro no corrió: el contraste ya falla en verde.
- **Las capturas** de la intro en los avances 0, 0,5 y 1, en los cuatro anchos: `C:\paginas-servicios-datos\v1\escena\escena-<ancho>-avance-<0|0.5|1>.png`. En 0: la composición, de noche, el piso apenas encendido y blanco. En 0,5: la luz de abajo encendida entre los bloques y las brasas y los rayos en celeste, la cámara girada (la pose 2), y el papel que entra desde abajo. En 1: el papel.
- Los avisos de la consola: uno de compilación de un shader del home (D3D, «X4122»), y con reducido los de Motion («Reduced Motion enabled»).

### 4.4 El contraste de la intro NO llega (hallazgo para el home)

El criterio del prompt es 4,5:1 contra el peor píxel detrás del texto, y **no se cumple en ningún ancho**. No es nuestro marcado: el h1 y la bajada son los de `IntroDeLaPagina` (el texto arriba, fijo mientras dura la intro) y lo que pasa por detrás es la escena del home de noche:
- **las brasas** (los puntos blancos y, desde 0,25, celestes) pasan por detrás de las letras: el peor píxel es una brasa (por ejemplo, 227, 232, 236 a 1440);
- **las aristas del domo** (los bordes claros de su armazón, 148–190 de gris) cruzan la bajada en el avance 0;
- **a 390 y 768** el título cae sobre la franja más densa de brasas, arriba del domo en la vista compacta: ahí ni el 99 % del fondo pasa (1,45:1 a 390).

Las capturas sin el texto son limpias (se miró una a 1440 y una a 390): la medida vale. A 1440, de 0,25 a 0,75 el 99 % del fondo sí pasa (8–15:1); el peor sigue siendo una brasa (2,9–4,7). Va como **P-H31a** (§6).

---

## 5. Decidido por CC, revisar

1. **El orden de la corrida** (arriba): los grupos 2 y 3 antes del 1.
2. **La línea del registro en `_variantes/registro.ts`,** fuera de nuestras carpetas: la API dice que cada servicio agrega SU línea ahí (§4), y sin ella la variante no se puede registrar. Es una línea, con su comentario; s78 (el test del home sobre el registro) sigue 64/0.
3. **La navegación sigue siendo `<a href>` con recarga completa,** después de la salida: `EnlaceDeRuta` (B12a.6) no existe, la vuelta al home (B12a.7) tampoco, y nuestro test prohíbe `next/link` desde el S1b. La salida la pide un solo escucha en la raíz para todos los enlaces (los de hoy y los que vengan). No hay velo todavía: la luz baja y después se navega.
4. **El encabezado (el logo) va antes de la intro,** fuera de ella y con su propio `data-seccion="invertida"`: la intro del home no tiene lugar para él. El `h1` arranca un encabezado más abajo; el avance cuenta desde el tope de la intro. Se va con la navbar en el layout (B12a.5).
5. **Software e IA también tienen la intro con la escena** (la plantilla es una): de noche, con su acento y sin variante (la luz de la composición).
6. **La bajada usa `ParrafoDeLaBajada`** (lo que dice la API): las dos líneas quedan en el cuerpo de texto; antes eran `titulo-m` (la entrada) y `titulo-s` liviano (el texto). Y la marca de la sección (el cuadradito del acento) ya no está en la intro.
7. **Se fue `Problema.tsx`** (su contenido es la bajada) y `firmas.ts`, `presetDeWeb.ts` y el nombre `varianteDeWeb.ts`.
8. **P-S1 acotado:** `data-servicio` va una vez, en la intro, y lo pone el home.
9. **La variante no agrega objetos:** el color va solo en la luz, como en el V0 (VARIANTES.md, «web: el piso brilloso»).
10. **En el celular, nada propio:** el campo de la luz a media resolución del V0 no se puede hacer por la API (la luz de abajo la dibuja el piso del home); la compacta del home baja el costo.
11. **La memoria:** desde el «seguí» de Valentino (2026-10-21), el umbral de O-10 fue 2 GB con el home quieto (sin su dev ni su arnés); con nuestro dev compilado la máquina no pasaba de ~2,5 GB libres. Con 3 GB hubo que esperar más de una hora (§6).
12. **Los criterios del banco:** «navega después de la salida» se mide en `beforeunload` (la navegación arranca en el mismo tic en que la ranura resuelve, un cuadro antes del que pinta la composición exacta: se pide que el último cuadro pintado esté a 0,002 de ella); el contraste, en los avances 0 a 0,75 (desde ~0,8 el texto fijo de la intro sube con la página).

---

## 6. Pedidos al home (P-H31) y lo que no corrió

| # | Qué | Por qué |
|---|---|---|
| **P-H31a** | **El texto de la intro sobre la escena no llega a AA.** Peor píxel 1,0–1,15:1 en los cuatro anchos; a 390, ni el 99 % del fondo (1,45:1) | Las brasas detrás de las letras, las aristas del domo y, en el teléfono, la franja densa de brasas detrás del título (§4.4). Opciones, a decidir: un velo o el vidrio detrás del texto, una sombra al texto, las brasas fuera de la franja del texto, o en el teléfono el texto abajo como el hero |
| **P-H31b** | **El encabezado de una página hasta B12a.5:** la intro no tiene lugar para el logo | Hoy va antes de la intro, fuera de ella (§5.4); con la navbar en el layout se va |
| **P-H31c** | **La salida y el bfcache:** con la recarga completa, si el navegador devuelve la página desde el bfcache (la flecha atrás), la ranura queda «saliendo» y la luz en la composición hasta recargar | No se pudo medir en el dev (su conexión del HMR saca la página del bfcache); vale para el build. Con `EnlaceDeRuta` (navegación cliente) no pasa |

**Lo que no corrió:** el control del texto oscuro (el contraste ya falla en verde); el costo contra el build (sin `next build`: O-10).

**La memoria (O-10):** desde las 15:34 del 2026-10-20 el home tuvo su dev en `:3002` (3,9 GB) y su arnés en tandas; con los dos devs prendidos la memoria libre no pasaba de ~2,4 GB. Se apagó nuestro dev mientras tanto (para no restarle margen a los bancos del home) y se esperó. Tres utilidades de Chrome huérfanas del banco del home (`foco-perfil`, 07:01–07:21) no se tocaron ni se contaron.

---

## 7. Qué mira Valentino (FRENO del Grupo 1)

El dev queda prendido: **http://localhost:3001/v3/paginas-web** (para levantarlo de nuevo: `npm run dev -- -p 3001`).

1. **A 1440, de la intro al cierre:** al cargar, la composición (la sala de noche, el logo centrado, el piso apenas encendido y blanco). Scrolleando la primera pantalla y media: la cámara gira y la luz de abajo se enciende entre los bloques en celeste, con las brasas y los rayos teñidos, hasta la mitad; de ahí quieta. Después entra el papel, que tapa la escena, y el resto de la página es la de siempre.
2. **El h1 y la bajada sobre la escena** (P-H31a): ¿se leen? Las brasas pasan por detrás de las letras y, en el avance 0, las aristas del domo cruzan la bajada.
3. **A 390, lo mismo:** la intro sobre la escena compacta (el logo grande en el medio) y el título sobre la franja densa de brasas de arriba; el resto de la página igual.
4. **A 1024 y 768:** lo mismo; a 768 el precio son las diagonales.
5. **Un clic en un enlace de salida:**
   - el logo de arriba al cargar: la página espera ~420 ms (la luz ya está en la composición: no se ve nada) y va al home;
   - el enlace «develOP» del cierre: va en el acto;
   - para ver la luz bajar hay que irse con la intro encendida, y ahí el logo ya se fue con el scroll: no hay hoy ningún enlace a la vista en la intro encendida (el banco lo aprieta por código). Todavía no hay velo (B12a.6).
6. **Con movimiento reducido:** la intro ya encendida en celeste desde arriba, quieta; los enlaces navegan en el acto.
7. **Software e IA** (`/v3/software-a-medida`, `/v3/ia-y-automatizaciones`): la intro con la escena de noche, sin variante (la luz blanca de la composición). **No se miró en el navegador:** lo afirman los tests (los presets y el marcado de las tres páginas).
8. **El encabezado** (§5.4) y **la bajada sin la jerarquía de antes** (§5.6).

**Con el «commit»:** staging archivo por archivo (los borrados con `git rm`), mensaje «V1: intro con la escena y la variante de Paginas web», push sin force y el dev apagado.
