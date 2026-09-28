# Estado de la escena — después de ESCENA 6

> Para el sprint siguiente: qué está encendido, qué banderas hay y qué hace cada una, los presupuestos y
> las fallas conocidas. La escena vive en `src/app/v3/_lib/escena/`; las banderas, en `entorno.ts`.
> Las entregas medidas de cada sprint están en `~/.cache/b4-medicion/escena<N>/` (con un `mirar.txt`
> por carpeta). Último commit de la serie: ESCENA 6 (rama `rediseno/home`).

---

## 1 · Qué está encendido en el producto

| Pieza | Qué hace | Dónde |
|---|---|---|
| E1 · óculo y haz (nivel `sutil`) | Columna de luz sobre el logo, charco en el piso, polvo del haz | `entorno/Haz.tsx`, `entorno/polvoVivo.ts` |
| E4 · el pulso | Anillos que salen del logo por el piso; hover = principal. **Sin máscara de texto** (ESCENA 6) | `entorno/Pulso.tsx`, `entorno/maquinaDelPulso.ts` |
| E6 · estela del polvo | Estela con la velocidad de la cámara, inercia al frenar | `entorno/polvoVivo.ts` |
| E7 · el cursor | El polvo cercano se corre al paso del puntero | `entorno/polvoVivo.ts` |
| Sombra con física | La mancha de contacto sigue la altura del logo y el pulso | `ContactOcclusion.tsx`, `entorno/sombra.ts` |
| Moiré vivo (M1a + M2 + M3 + M4) | La gruesa baja sola; el scroll se SUMA; el principal la corre una celda; dos desajustes en la fina | `moire/` |
| Polvo parejo | Caja de 34 que acompaña a la cámara, alcance 24; 14.000 motas (se dibujan 11.200) | `polvo/volumen.ts` |
| 5a · el logo es obstáculo | El polvo y el bokeh rodean al logo (dos toros y una cápsula); se abre con la velocidad | `polvo/obstaculo.ts`, `polvo/parche.ts` |
| 5c · la sombra según el haz | De noche una mancha dura y oscura; de día la blanda más abierta | `sombra/sombraDelHaz.ts` |
| 5d · las motas del haz | De noche el polvo del haz va más lento y destella | `polvo/motas.ts` |
| Preloader de /v3 | Apagado (`CON_PRELOADER = false`) | `_intro/` |

**Los fondos del texto (ESCENA 6).** El anillo del pulso ya no se apaga sobre las cajas de texto (esa
máscara era el «fondo del color del piso» que se veía). No queda ningún fondo de CSS entre la escena y
un texto que esté sobre ella. Lo que sigue pintando algo son superficies de interfaz, detalladas en
`escena6/fondos-texto/mirar.txt`: las secciones opacas Servicios y Tu panel, el velo y los rótulos del
túnel, la pastilla del menú, los botones, los formularios, las demos y las tarjetas.
Contraste WCAG medido después: ningún texto bajo AA (mínimo 12,02, peor caída 5,2 %).

## 2 · Las banderas

`entorno.ts` resuelve UNA vez por carga: `ENTORNO` (el producto), o lo que el banco pida antes de
cargar con `window.__entornoDeLaEscena`. Con `producto` en la lista se parte del producto y se suman
las pruebas nombradas; sin él, sólo lo que la lista nombra; `base` es la escena de
`escena-base-limpia`.

### Del producto (se pueden apagar desde el banco para comparar)

| Token | Efecto |
|---|---|
| `moire=hoy` | el moiré de la base |
| `polvo=antes` | el polvo de la base (media esfera alrededor del logo) |
| `obstaculo=no` | sin 5a |
| `sombra=blanda` | sin 5c |
| `motas=no` | sin 5d |
| `sombra=quieta` | la mancha de contacto sin física |
| `haz=medio` | el haz en su nivel medio |

### Las pruebas (apagadas en el producto)

| Token | Prueba | Qué hace | Dónde |
|---|---|---|---|
| `formacion` | 2 · la formación | 308 copias falladas en un anillo continuo afuera de la trama (7 filas × 44 columnas, todas mirando al centro, filas intercaladas), sobre un piso 1,6 más bajo que sube 0,25 por fila. No hay en el teléfono. | `formacion/` |
| `fallas=no` | variante | Todas enteras (sólo un corrimiento de tono de ±1,2 % que no se ve) | `formacion/enFormacion.ts` |
| `estrellas` | 3 · estrellas | 60.000 direcciones de −20° a 34°, tres clases (1 px / 3 px / con halo), titileo de 0,07 a 0,3 Hz; sólo de noche, detrás de la trama y la formación | `estrellas/Estrellas.tsx` |
| `posarse` | 4 · el polvo que se posa | Física por mota en la GPU: se posa derivando (8 s → 25 s), queda en el piso o en las caras de arriba del logo, resbala cuando la coreografía se mueve; al despertar, un remolino y un frente a 16 u/s | `polvo/Fisica.tsx`, `polvo/simulacion.ts` |
| `piso` / `piso=pulso` | 5 · el piso vivo | El piso del escenario en bloques con alturas en escalones; ondas en la GPU con el cursor, el scroll y (con `pulso`) el principal | `piso/` |
| `inercia` | 6a | El aire toma el 25 % de la velocidad de la cámara y sigue derivando ~2 s después del scroll | `polvo/Aire.tsx` |
| `remolinos` | 6b | Vórtices detrás del logo según el giro aparente (la cámara que orbita), hasta 6, locales (3 u) | `polvo/Fisica.tsx` |
| `rasante` | 6c | Bancos de niebla bajos afuera, integrados por píxel en las copias, el piso de abajo y el ciclorama (necesita `formacion`) | `niebla/rasante.ts` |
| `velocidad` | 6d | La niebla de afuera (y la rasante) se abre con la velocidad del scroll | `formacion/Formacion.tsx` |
| `encendido` | 6e | E1 arranca con dos destellos y un tramo inestable al caer la noche; histéresis 0,55 / 0,35; no repite en 8 s | `entorno/encendido.ts` |
| `calor` | 6f | Refracción leve en la columna de E1, de noche: pasada extra a media resolución, con tijera. No en el teléfono | `entorno/Calor.tsx` |
| `dia=afuera` | 6g (variante) | El día vuelve visible cuando Tu panel deja ver la sala (85 %), en un barrido de afuera hacia el logo de 2,6 s; la vuelta a la noche sigue escondida | `dia/`, `nocheDisparada.ts` |

### Ganchos del banco (sólo existen con `__entornoDeLaEscena`)

`__escenaViva` (estado del pulso, la noche y el encendido), `__relojDelBanco` (detener o fijar el reloj
de la escena), `__polvoDelBanco` (conteo por zonas, puntos dibujados), `__formacionDelBanco` (mostrar u
ocultar formación y logo), `__estrellasDelBanco.solas()`, `__pisoDelBanco` (estado de la simulación,
tiempo de GPU), `__fisicaDelBanco` (modos, corrimiento, cámara lenta, tiempo de GPU), `__calorDelBanco`
(tiempo de la pasada extra), `__diaDelBanco` (el barrido), `__aireDelBanco`.

## 3 · Presupuestos (1440 × 900, medidos)

| | Llamadas | Triángulos | Puntos | Pasada extra (GPU) |
|---|---|---|---|---|
| Producto | 16 | 23.810 | 11.361 | — |
| + formación | +3 | +33.952 (presupuesto ~50.000) | | |
| + estrellas | +1 | | +60.000 | |
| + física del polvo (4, 6b) | +1 | | | 0,09–0,10 ms |
| + piso vivo | −2 netas | +55.019 (presupuesto ~60.000) | | 0,04–0,05 ms (tope 0,5) |
| + 6f aire caliente | +17 | +23.906 | | 0,50 ms, sólo de noche |
| 6a, 6c, 6d, 6e, 6g | 0 | 0 | | 6c cuesta por píxel (12 muestras) |

Todas las pruebas juntas, de noche: 37 llamadas, 75 cuadros por segundo en la máquina de medición
(el máximo del monitor). Tabla completa: `escena6/costo.txt`.

Reglas que siguen valiendo: sin EffectComposer en la escena; `dpr` a lo sumo 1,5; lo transparente
DoubleSide dibuja dos pasadas salvo `forceSinglePass`.

## 4 · Los invariantes

`npm run test:s28-base`, `test:s29-pulso`, `test:s30-escena4` (lo de ESCENA 4 y 5 que sigue),
`test:s31-escena6` (banderas, máscara borrada, formación, estrellas, física, piso vivo, 6e, 6g, 6c/6d,
limpieza), y los de siempre (`s8-escena`, `s16-arnes`, `s18`, `s20`, `s22`, `s23`, `s24-dia`,
`s8-intro`). Todos con sus controles positivos.

## 5 · Fallas conocidas (no son de ESCENA 6)

- **`s17-revelado`**: 1 falla, ya estaba antes de ESCENA 5. Busca una llamada que se mudó a
  `ataduraAlScroll.ts` en VIAJES.
- **`s8-tres` y el bundle**: piden un build de producción (`.next`) y no se corre mientras el servidor
  de desarrollo usa esa carpeta.
- **`s10-raf` y `s11-frontera`**: 0 fallas, pero 2 afirmaciones de cada uno quedan «fuera de
  ventana» (dependen del entorno de medición).
- El banco: la pestaña puede quedar oculta (el banco reintenta `bringToFront`); el mouse real del
  usuario mueve el punto rojo y E7 si pasa por la ventana del banco.

## 6 · Lo que quedó abierto para decidir

- La formación: con fallas o sin fallas visibles (si se elige la segunda, sacar el test de
  «ninguna perfecta», que hoy pasa por un corrimiento de tono invisible). Las piezas a las que les
  falta el palo quedan flotando en su lugar (se pueden apoyar en el piso).
- La pendiente del piso de la formación contra el cielo de noche: a más pendiente, se leen mejor las
  filas y hay menos cielo para las estrellas (hoy 8–10 % del cuadro en Trabajos).
- 6g: el título de Por qué puede entrar sobre la sala todavía oscura si el scroll es muy rápido
  (a lo sumo 2,6 s); no está medido.
- 6f: es la prueba más cara (+17 llamadas de noche).
- La licencia de Book of Shapes (`LICENCIA-BOOKOFSHAPES.md`) cubre los SVG descargados, no el código:
  el piso vivo toma sólo la idea, el código es propio.
