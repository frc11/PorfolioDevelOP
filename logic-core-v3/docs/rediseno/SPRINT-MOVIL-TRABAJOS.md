# SPRINT MÓVIL-TRABAJOS — trabajos en todos los anchos

Rama `rediseno/home`, dev en el 3000. Punto de retorno: tag `antes-de-movil-trabajos`
(sobre `017f7ee0`, el merge de lane/panel commiteado aparte a pedido del usuario).

Mapa de anchos: móvil ≤425 (320 · 375 · 425) · tablet 426–1023 (768) · portátil 1024 ·
escritorio ≥1025 (1440), que no cambia nada.

## Checklist

- [x] Fase 0 — reconocimiento (abajo)
- [x] Fase 1 — la costura de 1024
- [ ] Fase 2 — capturas por dispositivo
- [ ] Fase 3 — el túnel bajo 1024
- [ ] Fase 4 — demos bajo 1024
- [ ] Fase 5 — tipografía y posiciones
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
