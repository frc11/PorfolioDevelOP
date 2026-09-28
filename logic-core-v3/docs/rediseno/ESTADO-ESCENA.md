# Estado de la escena — después de ESCENA 7

> Para el sprint siguiente: qué está encendido, qué banderas hay y qué hace cada una, los presupuestos y
> las fallas conocidas. La escena vive en `src/app/v3/_lib/escena/`; las banderas, en `entorno.ts`.
> Las entregas medidas de cada sprint están en `~/.cache/b4-medicion/escena<N>/` (con un `mirar.txt`
> por carpeta). Último commit de la serie: ESCENA 7 (rama `rediseno/home`), un commit por ticket.

---

## 1 · Qué está encendido en el producto

| Pieza | Qué hace | Dónde |
|---|---|---|
| E1 · óculo y haz (nivel `sutil`) | Columna de luz sobre el logo y polvo del haz; el charco lo pinta el piso vivo | `entorno/Haz.tsx`, `entorno/polvoVivo.ts` |
| E4 · el pulso | El principal y el hover; con el piso vivo el anillo es una ONDA del piso (sin el plano del pulso) | `entorno/maquinaDelPulso.ts`, `piso/` |
| E6 · estela del polvo · E7 · el cursor | Como en ESCENA 6 | `entorno/polvoVivo.ts` |
| Sombra con física | La mancha de contacto la pinta el piso vivo | `ContactOcclusion.tsx`, `entorno/sombra.ts` |
| Moiré vivo (M1a + M2 + M3 + M4) | Como en ESCENA 6 | `moire/` |
| Polvo parejo, 5a, 5c, 5d | Como en ESCENA 6; 5a ahora es el obstáculo natural (T7) | `polvo/` |
| T2 · la formación («la fábrica gigante») | 6.839 copias NEGRAS e idénticas al original, sin fallas, en 59 filas concéntricas (7 bandas de columnas constantes), sobre un piso PLANO de radio 300; la fila 0 es la malla entera y el resto siluetas (impostores); niebla que esconde las de atrás. No hay en el teléfono (`compacta`) | `formacion/` |
| T3 · el cielo de noche | 90.000 estrellas (70.000 en la banda) + la vía láctea (banda difusa con franjas de polvo), monocromo; siempre detrás de las dos capas de la trama (`delanteDeLaTrama`) y de la formación | `estrellas/` |
| T4 · el polvo que se posa | Física por mota en la GPU: empieza a posarse a los ~4 s y está en el piso a los ~10 s; el remolino a velocidad real | `polvo/Fisica.tsx`, `polvo/simulacion.ts`, `polvo/posarse.ts` |
| T5 · el piso vivo | El disco entero en bloques (5.852); un mar analítico (cinco marejadas con dispersión) que sube y baja; la onda del principal por el piso (paso fijo 1/120 s); el cursor; nunca toca al logo; sin reacción al scroll. **Techo del ojo** (arreglo de ESCENA 7, `bd6e569a`): a menos de 6 u de la cámara ninguna tapa pasa de 0,15 u debajo del ojo (en Números la cámara va a 0,7 u del piso y una cresta con el anillo encima tapaba medio cuadro) | `piso/` |
| T6 · 6a, el aire con inercia | Tal cual se aprobó | `polvo/Aire.tsx` |
| T7 · el obstáculo natural | Flujo potencial alrededor del logo con el aire de 6a; la mota que llega a más de 1,6 u/s queda pegada un momento (0,35–1,3 s) y se despega con el flujo. 6b borrado | `polvo/simulacion.ts` |
| T8 · la niebla de afuera | 6c + 6d en un solo efecto: esconde las filas de atrás, se abre con el scroll rápido y se posa enseguida | `niebla/rasante.ts`, `formacion/Formacion.tsx` |
| T9 · el haz se enciende | Siete intentos tenues (más tenues que la luz final) durante 2,78 s, el golpe y la luz firme (×1,45); las motas, la sombra y el rebote siguen su intensidad | `entorno/encendido.ts` |
| T10 · el polvo nítido | Motas de 1,4 a 3,2 px con borde de un píxel; sólo las muy cercanas (< 3,2 u) se desenfocan, poco; bokeh 30 discos de 0,34. 6f borrado | `polvo/nitidez.ts` |
| T12 · motas con sombra y rebote | Las motas del haz proyectan sombritas al piso desde el óculo; de noche el charco aclara la cara de abajo del logo | `polvo/sombras.ts`, `entorno/Rebote.tsx` |
| Preloader de /v3 | Apagado (`CON_PRELOADER = false`) | `_intro/` |

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
| `obstaculo=no` · `sombra=blanda` · `motas=no` · `sombra=quieta` · `haz=medio` | como en ESCENA 6 |
| `formacion=no` | sin T2 |
| `cielo=no` | sin T3 |
| `posarse=no` | sin la física del polvo (T4 y T7) |
| `piso=no` | sin T5 (vuelven el pulso, el charco y la mancha de siempre) |
| `inercia=no` | sin T6 |
| `niebla=no` | sin T8 |
| `encendido=no` | sin T9 |
| `nitidez=no` | sin T10 (las motas y el bokeh de antes) |
| `rebote=no` | sin T12 |

### Las pruebas (apagadas en el producto)

| Token | Prueba | Qué hace | Dónde |
|---|---|---|---|
| `amanecer` | T11 | Cuando Tu panel deja ver la sala (85 %): se apagan las estrellas (0–0,9 s), nace un resplandor en el horizonte detrás de la formación (a contraluz), el frente de luz avanza fila por fila de afuera adentro (2,4–6,4 s), entra por los cuadrados de la trama con haces visibles en la niebla (pico a los 4,9 s), llega al piso y por último al logo (7,0 s); asentado a los 7,6 s. Con scroll corre más rápido (×3) y termina antes de que el título llegue al 62 % del alto. La vuelta a la noche, escondida | `amanecer/`, `nocheDisparada.ts` |
| `fibras` | T13 | 60 pelusas (cintas de 0,18–0,4 u) que caen girando a contraluz en una caja que acompaña a la cámara. Una llamada | `pruebas/Fibras.tsx` |
| `fugaz` | T13 | De noche, fuera del túnel, cada 5–10 s: un trazo tenue (0,8) que cruza en 0,45–0,75 s; nace arriba, en el lado del cuadro que el logo deja libre (su caja proyectada en cada cruce), y cae hacia el centro sin salir del cuadro; si no hay cielo libre, esa no sale. Es una cinta con ancho en píxeles (0,8 px en la cola, 2,2 en la cabeza): una línea de WebGL mide 1 px y se perdía entre las estrellas. Detrás de la trama | `pruebas/Fugaz.tsx` |
| `enfoque` | T13 | Al frenar el scroll el foco duda (se pasa ±45 % de la distancia al logo, dos o tres vaivenes) y se clava en ~0,4 s; sólo desenfoca el polvo (no hay pasada de desenfoque) | `pruebas/Enfoque.tsx`, `polvo/nitidez.ts` |
| `grano` | T13 | Grano de película de un píxel, otro en cada cuadro, ±4,5 % de la luz, multiplicado sobre todo el lienzo (sin tocar el alfa). Una llamada | `pruebas/Grano.tsx` |

Borrado en ESCENA 7 (código y banderas): las fallas de la formación y su test, las regiones de la
formación, la pendiente del piso de la formación, 6b (remolinos), 6f (aire caliente), la variante vieja
de 6g (`dia=afuera`, carpeta `dia/`), la proyección estática del obstáculo en el camino con física.

### Ganchos del banco (sólo existen con `__entornoDeLaEscena`)

`__escenaViva`, `__relojDelBanco`, `__polvoDelBanco`, `__formacionDelBanco`, `__estrellasDelBanco`,
`__pisoDelBanco` (estado, `medir` GPU), `__fisicaDelBanco` (modos, cámara lenta, `medir` GPU),
`__aireDelBanco`, `__amanecerDelBanco` (`estado`, `congelar(s)`), `__fugazDelBanco` (`ya(fija?)`,
`cuantas`, `donde`), `__enfoqueDelBanco` (`ya`, `estado`).

## 3 · Presupuestos (1440 × 900, medidos)

El producto entero (con todo lo de ESCENA 7 encendido): **21–22 llamadas, 108.755 triángulos, 182.432
puntos** en el último cuadro; el cuadro, 13,34 ms (topado por el monitor de 75 Hz de la máquina de
medición). Pasadas que no son la escena, en la GPU: la física del polvo (T4 y T7) 0,063 ms y la
simulación del piso vivo (T5) 0,016 ms.

Cada ticket, como diferencia contra el producto en el momento donde se ve (lo encendido: producto menos
producto con `X=no`; las pruebas: producto con la prueba menos producto):

| Ticket | Qué | Llamadas | Triángulos | Puntos | Cuadro medio (ms) |
|---|---|---|---|---|---|
| T2 | formación (hero y noche) | +2 | +23.068 | 0 | 0 |
| T3 | cielo (noche en Números) | +1 | +3.967 | +160.000 | 0 |
| T4+T7 | la física del polvo (hero) | +5 | +2 | +11.201 | 0 |
| T5 | piso vivo (hero) | −2 | +57.908 | 0 | 0 |
| T6 | inercia | 0 | 0 | 0 | 0 |
| T8 | niebla (Quiénes somos) | 0 | 0 | 0 | 0 |
| T9 | encendido (Trabajos de noche) | −1 | −1 | 0 | 0 |
| T10 | nitidez (hero) | 0 | 0 | −60 | 0 |
| T12 | sombras de motas y rebote (noche) | +2 | −1 | +11.201 | 0 |
| T11 | amanecer, clavado en los rayos (4,9 s) | +1 | +960 | 0 | **+4,89** (p95 26,7) |
| T13 | fibras | 0 | +1.199 | 0 | 0 |
| T13 | estrella fugaz, cruzando | +2 | +79 | 0 | 0 |
| T13 | enfoque | 0 | 0 | 0 | 0 |
| T13 | grano | 0 | 0 | 0 | 0 |

Cómo leerla: son los valores medidos, sin retocar. Entre dos cargas del mismo pedido el último cuadro varía
±1 llamada y ±1 triángulo (las bases dan 21 o 22 llamadas y 108.754 o 108.755 triángulos), así que una
diferencia de 1 no es una señal: por eso el grano (un triángulo de pantalla completa, 1 llamada, costo por
píxel) mide 0, y el encendido (que no dibuja nada) mide −1. El cuadro topado sólo se mueve con el
amanecer: sus haces marchan 20 pasos por píxel y es la prueba más cara. Sin la física tampoco se dibujó la
pasada de sombras de T12 (los mismos 11.201 puntos). T8 cuesta por píxel (12 muestras por rayo). Detalle
y notas: `escena7/costo.txt`.

Reglas que siguen valiendo: sin EffectComposer en la escena; `dpr` a lo sumo 1,5; lo transparente
DoubleSide dibuja dos pasadas salvo `forceSinglePass`. El lienzo COMPONE el alfa que escriben los
materiales: un material opaco escribe alfa 1 (si no, bordes blancos contra el papel).

## 4 · Los invariantes

`npm run test:s32-escena7` (una sección por ticket, T2 a T13, con sus controles positivos),
`test:s31-escena6` (lo de ESCENA 6 que sigue), `test:s28-base`, `test:s29-pulso`, `test:s30-escena4`,
y los de siempre (`s8-escena`, `s16-arnes`, `s18`, `s20`, `s22`, `s23`, `s24-dia`, `s8-intro`,
`s7-mezcla`).

Los bancos de ESCENA 7 (`scripts-escena/`, contra el servidor de desarrollo, un Chrome propio por CDP y el
candado de Chrome): `banco7` (la carpeta y la apertura), `foto7` (una foto en cualquier punto:
`<sección>+<pantallas>`), `rapido7` (los cinco momentos), `recorrido7` (una sonda a lo largo del scroll),
`clips7` (los clips de cada ticket), `amanecer7` (el amanecer congelado), `formacion-wcag7` (el texto),
`cielo7` (cuánto cielo deja la formación), `costo7` (la tabla de costo) y `hojas7` (las hojas).

## 5 · Fallas conocidas (no son de ESCENA 7)

- **`s17-revelado`**: 1 falla, ya estaba antes de ESCENA 5. Busca una llamada que se mudó a
  `ataduraAlScroll.ts` en VIAJES.
- **`s8-tres` y el bundle**: piden un build de producción (`.next`) y no se corre mientras el servidor
  de desarrollo usa esa carpeta (con el de desarrollo da 11 fallas: «0 archivos», «0 chunks»).
- **`s10-raf` y `s11-frontera`**: 0 fallas, pero 2 afirmaciones de cada uno quedan «fuera de
  ventana» (dependen del entorno de medición).
- El banco: la pestaña puede quedar oculta (el banco reintenta `bringToFront`); el mouse real del
  usuario mueve el punto rojo y E7 si pasa por la ventana del banco.

## 6 · Lo que quedó abierto para decidir

- T11 · el amanecer: la compuerta de 6g (85 %) deja casi todo el evento detrás de Tu panel, y el rótulo
  de «Por qué develOP» cae justo en el borde de Tu panel. Para verlo entero haría falta un tramo de
  sala sin texto después de Tu panel (un cambio de layout, fuera de este sprint). La duración propuesta:
  7,6 s mirando quieto.
- T2 · cuánto cielo queda: depende de dónde mira la cámara cuando es de noche (en Números mira +14°
  hacia arriba y el cuadro es casi todo cielo; en Trabajos mira −21,7° y no hay cielo). Números en
  `escena7/formacion/mirar.txt`.
- T11 · su costo: con los haces en el aire el cuadro pasa de 13,3 a 18,2 ms de media (p95 26,7) en la
  máquina de medición. Si se aprueba, los haces necesitan bajar pasos o resolución.
- T13: las cuatro pruebas quedan para elegir (el costo de cada una, en `escena7/costo.txt`). La fugaz se
  lee corta (la estela visible mide unos 12–25 px a tamaño real): si se la quiere más larga es
  `FUGAZ.cola` (hoy 0,3 del recorrido), sin verla todavía.
- El techo del ojo del piso vivo (T5) se verificó con 45 s quietos en Números sin ninguna caída de luz
  arriba del horizonte, pero no hay forma de asegurar que en esa ventana se haya repetido la misma cresta
  con el anillo: lo garantiza la construcción del techo (y `s32` lo afirma).
- La licencia de Book of Shapes (`LICENCIA-BOOKOFSHAPES.md`) cubre los SVG descargados, no el código:
  el piso vivo toma sólo la idea, el código es propio.
