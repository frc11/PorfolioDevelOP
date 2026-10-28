# L1 · plan (escrito con el lote ya en marcha: se armó junto con la lectura del código)

## Ítems
| # | Qué se hace | Hecho cuando | Cómo se verifica |
|---|---|---|---|
| 1 | Barra de escritorio desde 769. `CLASE_DE_LA_PASTILLA_APAGADA` pasa a `max-hasta-tablet:invisible` (≤768). De 769 a 1279 la pastilla y la esquina se compactan (13 px, menos aire); de 769 a 839 la pastilla se ancla a la izquierda (centrada no deja lugar a la esquina). El parlante y el botón del movimiento siguen el mismo corte. | A 769, 820, 840, 1023, 1024, 1279, 1280 la barra se ve, sin solaparse ni scroll horizontal; a 768 y 390, hamburguesa. | `nav.mjs` (Playwright, mide `data-modo`, cajas y `scrollWidth`) + fotos; `s87`, `verificar`. |
| 2 | Contacto en el teléfono: grillas con `grid-cols-1` (la columna implícita `auto` crecía con el input), `min-w-0` en el contenedor de la píldora, placeholders cortos y con elipsis. | A 320, 360, 375, 390 y 768 ningún descendiente del diálogo pasa del panel y no hay scroll horizontal. | `contacto.mjs` + fotos. |
| 3 | El ≠: las dos mitades de la diagonal se pasan 1,5 grosores del centro (solo en el 3D). | La diagonal se ve de una pieza. | Foto de cerca a 1440. |
| 4 | La loma del piso bajo el cursor vuelve por defecto (`PisoVivo`); las grietas se sacan (disparadores, `?grietas=`, código, tests y banco) en un commit aparte. | La loma se levanta con el mouse; sin rastro de grietas. | `s78-c2-31m`, `tsc`, grep. |
| 5 | Placa del contacto (CSS 3D): los costados se corren `--radius-medio` y dejaban un hueco en cada esquina; se cierra con una cara en diagonal por esquina. | Desde cualquier ángulo del paralaje el borde es negro y cerrado. | `placa.mjs` (6 posiciones del mouse) + fotos. |

## Implicancias
- Todo lo que dependía de «modo menú» sigue al corte por la medición de `BarraDelHome` (`data-modo`); la hoja del contacto en 769–1023 es el panel (`esElPanel`, ya existía).
- Tests que fijaban `max-medio`, `escritorio:` del parlante, o la loma: se actualizan y se dice en el resultado.
- Fuera de alcance: Portfolio (L2), el recomendador, el login.

## Gate
`tsc --noEmit` (0 errores), `npm run verificar` (sin fallas nuevas), fotos en `C:\nocturno\cola3-fotos\L1\`, humo del home (rueda hasta Portfolio y a Demos y vuelta, a 1440 y 390).

## Premortem
«Dentro de una semana falló porque…» (a) la pastilla anclada a la izquierda se sale del cuadro en 769–839 con el dropdown de Servicios (se mide y se ve); (b) el `transform` leído en `modoDelChrome` cambia con la animación de nacimiento (se lee de `getComputedStyle`, que en el CSS es `none` solo en la banda anclada: verificado en 769–839); (c) la loma devuelve las rayas oscuras de C2-31m (decisión L1-3: se acepta, es lo que pidió Valentino; queda el banco `sin-loma`); (d) borrar las grietas rompió el shader del vidrio (se compiló en el navegador y el home carga sin errores).

## Casos que los tests cubren
- Corte de la clase apagada (≤768) y las clases `hasta-tablet:` del parlante (s87).
- Loma: por defecto sí, con el defecto `sin-loma` no (s78-c2-31m, con control positivo).
