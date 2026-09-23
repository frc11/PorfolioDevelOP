# SPRINT MÓVIL-TRABAJOS — trabajos en todos los anchos

Rama `rediseno/home`, dev en el 3000. Punto de retorno: tag `antes-de-movil-trabajos`
(sobre `017f7ee0`, el merge de lane/panel commiteado aparte a pedido del usuario).

Mapa de anchos: móvil ≤425 (320 · 375 · 425) · tablet 426–1023 (768) · portátil 1024 ·
escritorio ≥1025 (1440), que no cambia nada.

## Checklist

- [x] Fase 0 — reconocimiento (abajo)
- [x] Fase 1 — la costura de 1024
- [x] Fase 2 — capturas por dispositivo
- [x] Fase 3 — el túnel bajo 1024
- [x] Fase 4 — demos bajo 1024
- [x] Fase 5 — tipografía y posiciones
- [ ] Fase 6 — verificación y reporte

## Fase 0 — lo que hay

**1 · Rama coreografiada contra rama quieta.** Trabajos no decide nada por su cuenta:
monta `<Bloque patron="P7" anclaje="seccion" lente="escena">` y su render-prop recibe
`progreso`. Con `null` monta `RamaQuieta`; con un `MotionValue` monta el cartel
(`PortadaDeTrabajos`), el túnel (`CapaDelTunel`) y las demos (`CapaDeDemos`). El
`progreso` es `null` cuando no hay primitivas animadas instaladas, y eso lo decide
`CompuertaDelHome` para las ocho secciones a la vez: `deberiaAnimar(arriba del
umbral, sin movimiento reducido)`.

| pieza | coreografiada | quieta |
|---|---|---|
| la noche (`CapaDeLaGota`) | sí | sí: es hermana del bloque y se dispara por `IntersectionObserver` en las dos |
| el cartel «Portfolio» | `PortadaDeTrabajos`, caja en la mitad derecha, P2 y huida en z | `h2` en nivel titulo-m, con `MarcaDeSeccion` al lado |
| el túnel | capas anidadas por escala, resortes, regulador y rieles | tres `Proyecto` apilados, una pantalla cada uno |
| el CTA | `VentanaDelCta` (cromo de macOS, tipeo, freno, velo) al final del túnel | enlace «Hablemos» al pie de la lista |
| el vacío | `clip-path` en `data-pieza="tunel"` | no existe |
| las demos | `CapaDeDemos`: llegada escalonada, estante y Genie | `DemosQuietos`: la cinta de CSS |

**2 · La compuerta partida.** `_lib/compuerta.ts` tiene dos números:
`COMPOSICION_MIN_ANCHO_PX = 1024` (es `--breakpoint-escritorio`: la variante
`escritorio:` de Tailwind, el `sticky` de Trabajos, el solape, la grilla, los `sizes`)
y `ESCENARIO_MIN_ANCHO_PX = 1025` (lo que se MONTA: la coreografía por
`CompuertaDelHome`, el cursor propio, Lenis y la calidad plena de la escena). La
franja de un píxel está declarada ahí como «no se ve, se mide», y sí se ve: a 1024
exactos Trabajos tiene el marco `sticky` de una pantalla de escritorio con la rama
quieta adentro, sin túnel. Dependen del número de montaje las ocho secciones (por
`CompuertaDelHome`), el cursor, el scroll suave y la calidad de la escena. Del de
composición, todo el CSS. Hay afirmaciones que clavan 1025 o la diferencia de 1 px en
`compuerta`, `s18-compuertas`, `tokens`, `s3-cursor`, `s3-imagen`, `s10-medida`,
`motion-bundle`, `s10-referencias` y el banco (`perfiles`, `banco.invariant`).

**3 · Lenis.** `_lib/scrollSuave.ts` (`SCROLL_SUAVE_MIN_ANCHO_PX` =
`ESCENARIO_MIN_ANCHO_PX`) con `deberiaCorrerElScrollSuave`; lo monta
`_componentes/CompuertaDelScrollSuave.tsx`, que devuelve `null` abajo del umbral.
Abajo no hay Lenis: scroll nativo.

**4 · El punto azul.** `MarcaDeSeccion` (`_contrato/Rotulo.tsx`) sólo se monta en
`RamaQuieta` (`piezas.tsx`). El cartel animado no la tiene.

**Lo que condiciona la fase 3, leído del código:**

- La tabla del túnel está en píxeles de scroll contados contra un alto de 900
  (`ALTO_DE_VIEWPORT_DE_LA_REFERENCIA`), y todo se pasa a fracción del progreso con
  `PX_DE_LA_SECCION = (7,17 + 0,4) × 900`. O sea que ya son pantallas y no píxeles de
  escritorio. El 0,4 es el solape, y **el solape sólo rige desde escritorio**: abajo
  la sección mide 7,17 pantallas y no 7,57, así que cada tramo dura un 5,3 % menos.
- El progreso del bloque lo resuelve el motor (`_lib/motion/epoca.ts`) contra
  `window.innerHeight`, que en Safari de iOS cambia con la barra de direcciones y
  dispara `resize`: época nueva, anclas re-resueltas y un salto del progreso.
- Las capturas son una caja de ancho completo con relación 1920:1080, centrada en el
  cuadro. El CTA es una caja de 0,62 del ancho con relación 16:10.
- La capa de demos tiene z negativo adentro del bloque y ningún `will-change`, que es
  lo que mantiene el agujero del vacío.

## Fase 1 — la costura de 1024

- `ESCENARIO_MIN_ANCHO_PX` pasa a DERIVARSE de `COMPOSICION_MIN_ANCHO_PX`: los dos valen
  1024. La declaración de la franja se reescribió en `compuerta.ts` (se veía, no «se
  medía») y `compuerta.invariant` afirma que la diferencia es cero, con un control
  positivo que ve el par viejo (1024 / 1025).
- Se actualizaron las afirmaciones que clavaban 1025 o la franja de un píxel:
  `compuerta`, `s18-compuertas`, `tokens` §7, `s3-cursor`, `s3-imagen`, `s10-medida`,
  `s7-contrato`, `motion-bundle` (necesita build: no se corrió), `s10-referencias`,
  el banco (`perfiles`: 1024 deja de estar «debajo del umbral»; `banco.invariant`) y
  el padrón de números de `escaneo.ts`, que ahora lee el umbral en vez de escribirlo.
- Medido con `fase1-costura.ts` (en el scratchpad) a 1023, 1024 y 1025, alto 768, las
  ocho secciones más dos tomas de Trabajos, bajando de a pasos:

  | ancho | coreografía | túnel | Lenis | cursor | rama de Trabajos |
  |---|---|---|---|---|---|
  | 1023 | no | no | no | no | quieta (tablet) |
  | 1024 | sí | sí | sí | sí | coreografiada, igual que 1025 |
  | 1025 | sí | sí | sí | sí | coreografiada |

  Las nueve capturas de 1024 son las de 1025 (hojas en
  `~/.cache/b4-medicion/movil/fase1/hoja-*.png`). Ninguna sección se rompió por el
  cambio: 1024 dejó de ser un ancho aparte. Los invariantes de la compuerta, de tokens
  y del banco quedaron en verde.

## Fase 2 — capturas por dispositivo

Sacadas con Chrome por CDP y el candado (`fase2-capturas.ts`): viewport, DPR 2, user
agent de Safari y toque emulado, primera pantalla con la intro terminada. La de tablet de
El Garage salió sin la foto del hero a los 9,5 s y se repitió esperando 22 s.

| archivo | medida | calidad webp | peso |
|---|---|---|---|
| `el-garage-movil.webp` | 780 × 1688 | 82 | 29,4 KB |
| `esquina-movil.webp` | 780 × 1688 | 82 | 24,5 KB |
| `banu-movil.webp` | 780 × 1688 | 82 | 17,7 KB |
| `el-garage-tablet.webp` | 1640 × 2360 | 82 | 59,4 KB |
| `esquina-tablet.webp` | 1640 × 2360 | 82 | 33,8 KB |
| `banu-tablet.webp` | 1640 × 2360 | 82 | 33,8 KB |

- `trabajos/capturas.ts`: los dos cortes (móvil por debajo de 426, que es
  `--breakpoint-movil`, y tablet por debajo de 1024), las medidas, las consultas de las
  `<source>` y la ruta de cada corte derivada de la de escritorio: el contenido sigue
  declarando un medio por proyecto.
- `trabajos/Captura.tsx`: `<picture>` con las dos `<source>` y la imagen de escritorio
  de base, las tres armadas con `getImageProps` (el mismo optimizador de `next/image`).
  Lo usan el túnel y la lista quieta.
- La caja de la captura en el túnel toma la proporción de su corte por CSS, y abajo de
  1024 entra entera en el cuadro, apoyada en el alto cuando no alcanza el ancho.
- Afirmado dos veces: `trabajos.invariant` §26 lee el marcado y resuelve, en 11 anchos
  de 320 a 1920, qué fuente gana (gana UN archivo y es el de su corte), con dos
  controles positivos; y medido en la red (`fase2-red.ts`, sin caché, recorriendo la
  página entera): a 390 se piden sólo las tres `-movil`, a 768 sólo las tres `-tablet`,
  a 1024 y 1440 sólo las tres de escritorio.

## Fases 3, 4 y 5 — el túnel, las demos y la tipografía abajo de 1024

Van juntas porque tocan los mismos archivos (el cartel y la ventana del CTA son a la vez
marco del túnel y tipografía).

**La coreografía, sólo para Trabajos.** `CompuertaDelHome` resuelve además la coreografía
SIN el ancho, con la misma política de movimiento (`ProveedorSinUmbral`), y Trabajos la
pide con `CoreografiaEnTodoAncho`. Las otras siete secciones siguen quietas abajo de 1024.
Consecuencia: en el teléfono y la tablet el chunk de la coreografía ahora SE DESCARGA
(después de hidratar, nunca en la carga inicial, que es lo que `s7-compuerta` afirma).

**El pin.** `secciones.ts` sigue declarando `desde-escritorio`. Abajo de 1024, la rama
coreografiada clava la sección con una caja de 100svh y la quieta sigue siendo una lista.

**La tabla, en pantallas.** Los píxeles del túnel ya eran pantallas: se cuentan contra el
alto de 900 y se pasan a fracción de la sección. El único parámetro que no cerraba era el
solape: abajo de 1024 no rige, y la sección medía 7,17 pantallas contra las 7,57 que la
tabla cuenta, así que cada tramo duraba un 5,3 % menos. `Panel.tsx` ahora suma el solape
al alto en todo ancho y sube el panel sólo desde escritorio. Medido: la sección mide
6389 px a 390 × 844 y 7751,7 a 768 × 1024, las dos 7,57 pantallas. En escritorio el valor
no cambia.

**iOS Safari.** El motor resolvía las anclas contra `innerHeight`. Simulado el cambio de
alto (`innerHeight` +84 px con su `resize`, el CSS quieto) a 390 × 844 con el scroll
parado en 6474: ANTES la primera captura pasaba de 0,445 a 0,533 de escala y asomaba la
segunda. `epoca.ts` las resuelve ahora contra una sonda de 100svh: 0,44468 → 0,44471, el
remanente del resorte, y la caja clavada quieta en 844 en los tres estados.

**Scroll nativo con el dedo** (`f3-tactil.ts`, 390 × 844 DPR 2, toque, lanzamientos de
720 px a 3750 px/s): el gesto táctil sintético de CDP no scrollea y el toque crudo no
deja inercia, así que se midió con ráfagas de diez lanzamientos. Página a 4960 px/s de la
tabla; el túnel, a 2327 como máximo (lo arrastra el riel, que es lo diseñado: 0,47 de la
página); al soltarse el pin el vacío estaba lleno (`inset(50%)`) en las dos corridas.

**Rendimiento** con el perfil móvil: a CPU ×4, 13,75 ms de media, p95 13,4, peor cuadro
26,8 ms y cero cuadros de más de 33 ms (72,7 fps, la vsync del monitor). A CPU ×1 el p95
fue 13,7 ms. El único cuadro largo cayó en la espera ociosa de 5 s y no es del túnel. No
hizo falta recortar nada.

**El marco** (`trabajos/angosto.ts`, todo por CSS con `max-escritorio:` y `max-movil:`):
- el cartel va de margen a margen; «Portfolio» se queda en `display-xl` en el teléfono y
  crece un 30 % en tablet, sin pasarse nunca de la calle (medido: la palabra mide 3,886
  veces su cuerpo);
- las capturas verticales entran enteras en el cuadro;
- la ventana del CTA es un iPhone (9:17, 0,86 del ancho, apoyada en el alto si no alcanza)
  con la barra compacta abajo y el indicador de inicio, o un iPad (3:4) con la barra
  arriba y centrada. Sin semáforo de macOS. La frase baja a un cartel de tres renglones en
  el teléfono y «Hablemos» con su aclaración se acomodan en dos líneas;
- sin hover en táctil: la ruta `/hablemos` y la elevación sólo con un mouse que pueda
  hacer hover.

**Las demos** (fase 4): abajo de 1024 la capa entera crece rígida con el vacío (una
escala, la entrada vieja); lo decide el CSS (`--demos-entrada`), no una consulta de ancho
en JS. Cuando el vacío llena el cuadro arranca el carrusel (`demos/Carrusel.tsx`, física en
`demos/fisicaDelCarrusel.ts`): dos renglones en el teléfono (derecha e izquierda, el
segundo desfasado en 4) y uno en tablet. Velocidad de reposo de 34 px/s, relajación con
constante de 0,85 s, lanzamiento con las muestras de los últimos 80 ms y tope de
2400 px/s. `pan-y` con decisión horizontal pasados 8 px, toque de menos de 6 px y 250 ms,
un rAF por renglón apagado fuera de pantalla, y velocidad de reposo cero con movimiento
reducido. También reemplaza a la cinta de la rama quieta abajo de 1024; desde 1024 la cinta
y el estante siguen como estaban.

**La propuesta de los renglones, medida contra sí misma:** el desfase de 4 garantiza que
la misma demo no coincida en la misma columna AL ARRANCAR. Como los renglones van en
sentidos contrarios, la fase entre ellos gira a 68 px/s, así que una misma demo vuelve a
quedar alineada consigo misma una vez por vuelta relativa: 1008 / 68, unos 15 s a 390.
Queda para el usuario.

**Tipografía** (fase 5): sin `MarcaDeSeccion` en trabajos en ningún ancho (la pieza
compartida no se tocó). En la rama quieta abajo de 1024, «Portfolio» con el mismo tamaño que
el cartel y la bajada en `titulo-s`, apoyados en el margen. Las demos: el título crece en
el teléfono, y el título y el cuerpo en tablet.

**Invariantes nuevos** (`trabajos.invariant` §27, con control positivo cada uno): el
carrusel relaja a su ritmo a favor y en contra y no depende de los cuadros; el bucle no
tiene costura; no secuestra el scroll vertical; el toque abre y el arrastre no; el gesto
se mide en 80 ms con tope; el motor resuelve contra 100svh y el pin es de 100svh; y sólo
Trabajos pide la coreografía en todo ancho. Se derivaron del invariante (no a mano) los
censos que suma el carrusel: `s10-acceso` pasa de 42 a 50 paradas (una por demo en el
estante o la cinta y otra en el carrusel; el censo lee el marcado, donde están las dos).
