# Estado de la escena — después de ESCENA 8

> Para el sprint siguiente (CALIDAD 1): qué está encendido, qué banderas hay y qué hace cada una, los
> presupuestos y las fallas conocidas. La escena vive en `src/app/v3/_lib/escena/`; las banderas, en
> `entorno.ts`. Las entregas medidas de cada sprint están en `~/.cache/b4-medicion/escena<N>/` (con un
> `mirar.txt` por carpeta). Último commit de la serie: ESCENA 8 (rama `rediseno/home`), un commit por ticket.

---

## 1 · Qué está encendido en el producto

| Pieza | Qué hace | Dónde |
|---|---|---|
| E1 · óculo y haz (nivel `sutil`) | Columna de luz sobre el logo y polvo del haz; el charco lo pinta el piso vivo | `entorno/Haz.tsx`, `entorno/polvoVivo.ts` |
| E4 · el pulso | El principal y el hover; con el piso vivo el anillo es una ONDA del piso | `entorno/maquinaDelPulso.ts`, `piso/` |
| E6 · estela del polvo · E7 · el cursor | Como en ESCENA 6 | `entorno/polvoVivo.ts` |
| Sombra con física | La mancha de contacto la pinta el piso vivo | `ContactOcclusion.tsx`, `entorno/sombra.ts` |
| Moiré vivo (M1a + M2 + M3 + M4) | Como en ESCENA 6 | `moire/` |
| Polvo parejo, 5a, 5c, 5d | Como en ESCENA 6; 5a es el obstáculo (ver T5 de ESCENA 8) | `polvo/` |
| La formación («la fábrica gigante») | 6.839 copias negras en 59 filas, piso plano, niebla atrás (ESCENA 7, T2) | `formacion/` |
| El cielo de noche | 90.000 estrellas y la vía láctea, detrás de la trama y de la formación (ESCENA 7, T3) | `estrellas/` |
| La estrella fugaz | **[ESCENA 8] Encendida.** De noche, fuera del túnel, cada 5–10 s: una cinta con ancho en píxeles, del lado del cielo que el logo deja libre, detrás de la trama | `estrellas/Fugaz.tsx` |
| El polvo que se posa | Física por mota en la GPU (ESCENA 7, T4) | `polvo/Fisica.tsx`, `polvo/simulacion.ts` |
| El piso vivo | Un mar de bloques, con el techo del ojo (ESCENA 7, T5) | `piso/` |
| La inercia del aire (6a) | Tal cual (ESCENA 7, T6) | `polvo/Aire.tsx` |
| El obstáculo | Flujo potencial alrededor del logo (las formas de siempre). **[ESCENA 8] T5:** el choque, el pegado, el polvo posado sobre el logo y el que desliza van contra un **campo de distancia de la malla real** (textura 3D horneada al cargar). Se pega sólo contra la cara del impacto, a 0,03 u, con el logo quieto; nada más de 1,5 s; se desprende con el aire | `polvo/campoDelLogo.ts`, `polvo/simulacion.ts` |
| La niebla de afuera | 6c + 6d (ESCENA 7, T8) | `niebla/rasante.ts`, `formacion/Formacion.tsx` |
| El haz se enciende | **[ESCENA 8] T1:** cuatro intentos que fallan (de siete: uno sí y uno no) en 1,94 s, el golpe y la luz firme | `entorno/encendido.ts` |
| El polvo nítido | Motas de 1,4 a 3,2 px con borde de un píxel (ESCENA 7, T10) | `polvo/nitidez.ts` |
| La luz que rebota | De noche el charco aclara la cara de abajo del logo (ESCENA 7, T12). Las sombras de las motas, borradas en ESCENA 8 | `entorno/Rebote.tsx` |
| **[ESCENA 8] T2 · la trama anclada** | Las dos capas bajan a pleno hasta 1 u debajo del piso (sin fundido): el piso las corta. La pared (capa gruesa) lleva un zócalo fino (0,1 u, opacidad 0,62) y el piso vivo un contacto al pie de cada capa | `moire/limite.ts`, `MoireScreen.tsx`, `piso/bloques.ts` |
| **[ESCENA 8] T3 · el amanecer** | Encendido (era la prueba T11 de ESCENA 7) y atado al scroll: el scroll pide el avance (borde de Tu panel del 85 % al escenario del final clavado) y el que se muestra lo persigue con tope (entero en 2,5 s como mínimo), en las dos direcciones. Sin evento al cargar adentro, en un viaje, con el bloque tapando; con menos movimiento, de una vez. El texto del escenario de Por qué develOP espera al día; el pie (compartido) fuerza el avance a 0,9 si se ve antes | `amanecer/`, `_secciones/por-que-develop/PorQueDevelop.tsx` |
| Preloader de /v3 | Apagado (`CON_PRELOADER = false`) | `_intro/` |

## 2 · Las banderas

`entorno.ts` resuelve UNA vez por carga: `ENTORNO` (el producto), o lo que el banco pida antes de
cargar con `window.__entornoDeLaEscena`. Con `producto` en la lista se parte del producto y se suman
las pruebas nombradas; sin él, sólo lo que la lista nombra; `base` es la escena de
`escena-base-limpia`.

### Del producto (se pueden apagar desde el banco para comparar)

| Token | Efecto |
|---|---|
| `moire=hoy` · `polvo=antes` | el moiré y el polvo de la base |
| `obstaculo=no` · `sombra=blanda` · `motas=no` · `sombra=quieta` · `haz=medio` | como en ESCENA 6 |
| `formacion=no` · `cielo=no` · `posarse=no` · `piso=no` · `inercia=no` · `niebla=no` · `encendido=no` · `nitidez=no` · `rebote=no` | sin cada pieza de ESCENA 7 |
| `fugaz=no` | [ESCENA 8] sin la estrella fugaz |
| `limite=no` | [ESCENA 8] T2 · la trama como en ESCENA 7 (flotando) |
| `amanecer=no` | [ESCENA 8] T3 · sin el amanecer (el día vuelve escondido, como antes de ESCENA 7) |

### Las pruebas (apagadas en el producto)

| Token | Prueba | Qué hace | Dónde |
|---|---|---|---|
| `cielo-dia=<variante>-<tono>` | T4 de ESCENA 8 | El cielo de día: un cielo natural en un espacio construido, en la franja del cielo de noche, detrás de la formación y de la trama; se va con la noche antes de las estrellas y el amanecer lo destapa desde el horizonte. `pintado` (ciclorama con nubes pintadas y paneles), `bloques` (cúmulos de cubos, como el piso vivo, que derivan) o `particulas` (nubes del polvo nítido, que derivan); `celeste` o `mono` | `cieloDeDia/` |

Borrado en ESCENA 8 (código y banderas): el enfoque que busca, las fibras, el grano y la pasada de las
sombras de las motas (`polvo/sombras.ts`). La carpeta `pruebas/` no existe más.

### Ganchos del banco (sólo existen con `__entornoDeLaEscena`)

`__escenaViva`, `__relojDelBanco`, `__polvoDelBanco`, `__formacionDelBanco`, `__estrellasDelBanco`,
`__pisoDelBanco`, `__fisicaDelBanco` (modos, cámara lenta, `medir` GPU; [ESCENA 8] `campo()` y
`movimientoDelLogo()`), `__aireDelBanco`, `__amanecerDelBanco` (`estado` con `avance`, `pedido` y el día
para el texto; `congelar(s)`), `__fugazDelBanco`, [ESCENA 8] `__cieloDeDiaDelBanco` (`variante`, `dia`,
`mostrar`).

## 3 · Presupuestos (1440 × 900, medidos)

El producto entero (con todo lo de ESCENA 8 encendido): **19–20 llamadas, 108.946–108.947 triángulos, 171.231
puntos** en el último cuadro (ESCENA 7: 21–22 llamadas, 108.755 triángulos, 182.432 puntos: T0 borró la pasada de
las sombras de las motas); el cuadro, 13,34 ms (topado por el monitor de 75 Hz de la máquina de medición). Pasadas
que no son la escena, en la GPU: la física del polvo, ahora con el campo de la malla real (T5), 0,075–0,087 ms
(ESCENA 7: 0,063) y la simulación del piso vivo 0,013 ms. El campo del logo se arma UNA vez al cargar, fuera del
cuadro: 93 ms, 158 × 116 × 32 celdas de media precisión (1,1 MB de textura).

Cada ticket, como diferencia contra el producto en el momento donde se ve (lo encendido: producto menos
producto con `X=no`; la prueba: producto con la prueba menos producto):

| Ticket | Qué | Llamadas | Triángulos | Puntos | Cuadro medio (ms) |
|---|---|---|---|---|---|
| T0 | la fugaz, cruzando (noche con cielo) | +1 | +78 | 0 | 0 |
| T2 | la trama anclada: zócalo y contacto (hero) | +1 | +192 | 0 | 0 |
| T3 | el amanecer, clavado en los rayos (la mirada) | +1 | +960 | 0 | **+4,89** (p95 26,7) |
| T3 | el amanecer ya terminado (Por qué develOP, de día) | 0 | 0 | 0 | 0 |
| T4 | cielo de día pintado-celeste (Quiénes somos) | +2 | +9.025 | 0 | 0 |
| T4 | cielo de día pintado-mono (Quiénes somos) | +2 | +9.025 | 0 | 0 |
| T4 | cielo de día bloques-celeste (Quiénes somos) | +2 | +19.980 | 0 | 0 |
| T4 | cielo de día bloques-mono (Quiénes somos) | +2 | +19.980 | 0 | 0 |
| T4 | cielo de día partículas-celeste (Quiénes somos) | +2 | +9.024 | +143.000 | 0 |
| T4 | cielo de día partículas-mono (Quiénes somos) | +3 | +9.025 | +143.000 | 0 |

Cómo leerla: son los valores medidos, sin retocar. Entre dos cargas del mismo pedido el último cuadro varía
±1 llamada y ±1 triángulo: una diferencia de 1 no es una señal. T1 no tiene geometría (cambia el guion). T5 no
dibuja nada: su costo es la pasada de la física (arriba). El cuadro topado sólo se mueve con los rayos del
amanecer, que ahora es del producto: 18,23 ms de media y 26,7 de p95, las mismas cifras que en ESCENA 7 (el
monitor cuantiza el cuadro a 13,34 o 26,68 ms y el 37 % de los cuadros tardó dos refrescos las dos veces); fuera
de los rayos el amanecer no cuesta nada que se vea. Detalle y notas: `escena8/costo.txt`.

Reglas que siguen valiendo: sin EffectComposer en la escena; `dpr` a lo sumo 1,5; lo transparente
DoubleSide dibuja dos pasadas salvo `forceSinglePass`. El lienzo COMPONE el alfa que escriben los
materiales: un material opaco escribe alfa 1 (si no, bordes blancos contra el papel).

## 4 · Los invariantes

`npm run test:s33-escena8` (una sección por ticket, T1 a T5, con sus controles positivos),
`test:s32-escena7` (lo de ESCENA 7 que sigue; ajustado a lo que ESCENA 8 cambió), `test:s31-escena6`,
`test:s28-base`, `test:s29-pulso`, `test:s30-escena4`, y los de siempre (`s8-escena`, `s16-arnes`, `s18`,
`s20`, `s22`, `s23`, `s24-dia`, `s8-intro`, `s7-mezcla`, `s6-por-que-develop`, `s27-viajes`).

Los bancos de ESCENA 8 (`scripts-escena/`, contra el servidor de desarrollo, un Chrome propio por CDP y el
candado de Chrome): `banco8` (la carpeta), `rapido8` (los momentos), `amanecer8` (la sonda del avance, los
clips, los momentos congelados y el contraste del texto en un tirón reproducido congelado), `obstaculo8` (el
scroll fuerte y el conteo de pegadas), `cielo8` (las variantes del cielo, el texto y el logo con y sin cielo,
el amanecer con cada cielo), `clips8` (el haz con su curva de luz; los clips quietos del cielo), `costo8` y
`hojas8`.

## 5 · Fallas conocidas (no son de ESCENA 8)

- **`s17-revelado`**: 1 falla, ya estaba antes de ESCENA 5. Busca una llamada que se mudó a
  `ataduraAlScroll.ts` en VIAJES.
- **`s8-tres` y el bundle**: piden un build de producción (`.next`) y no se corre mientras el servidor
  de desarrollo usa esa carpeta.
- **`s10-raf` y `s11-frontera`**: 0 fallas, pero 2 afirmaciones de cada uno quedan «fuera de
  ventana» (dependen del entorno de medición).
- El banco: la pestaña puede quedar oculta (el banco reintenta `bringToFront`); el mouse real del
  usuario mueve el punto rojo y E7 si pasa por la ventana del banco.

## 6 · Lo que quedó abierto (para decidir o para CALIDAD 1)

- **El amanecer (T3)**, ahora del producto: la compuerta sigue en el 85 %, así que con un scroll lento lo
  primero del evento pasa con Tu panel tapando el cielo (verlo entero pide un tramo de sala sin texto: layout).
  El costo de los rayos (ver §3) es del producto mientras duran.
- **El pie y el amanecer**: el pie es compartido y no espera al día; si se llega antes de tiempo (un tirón de
  más de cuatro pantallas, o Fin) el amanecer salta a 0,9 para que su tinta se lea.
- **El cielo de día (T4)**: por elegir (variante y tono; el celeste rompe la regla monocroma). Con los tonos
  finales ningún texto baja de AA (mínimo 10,25:1) pero el texto sobre el cielo pierde contraste: hasta 17,5 %
  con celeste y 12,3 % con mono (Por qué develOP). En el hero casi no se ve cielo (la formación llega arriba).
- **El pegado (T5)**: con las reglas nuevas se pegan muy pocas (0 a 2 a la vez). Si el clip todavía se ve raro,
  sacar el pegado entero es borrar el modo 6 de la simulación.
- La licencia de Book of Shapes (`LICENCIA-BOOKOFSHAPES.md`) cubre los SVG descargados, no el código.
