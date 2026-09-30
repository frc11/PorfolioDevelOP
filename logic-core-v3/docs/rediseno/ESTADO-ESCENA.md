# Estado de la escena — después de CALIDAD 1

> Qué está encendido, qué banderas hay y qué hace cada una, los presupuestos, las **reglas de rendimiento que todo
> efecto nuevo tiene que cumplir (§4)** y las fallas conocidas. La escena vive en `src/app/v3/_lib/escena/`; las
> banderas, en `entorno.ts`. Las entregas medidas de cada sprint están en `~/.cache/b4-medicion/escena<N>/` y
> `~/.cache/b4-medicion/calidad1/` (con un `mirar.txt` por carpeta). CALIDAD 1: rama `rediseno/home`, un commit por
> punto; el informe es `docs/rediseno/CALIDAD-1.md`.

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
| El obstáculo | **[CALIDAD 1] A3:** sólo el flujo. El aire rodea al logo como un flujo potencial contra la **malla real** (un campo del flujo: celdas de 0,1 u, hasta 2,6 u del logo) y pasa por la boca de la «c» y el ojo de la «p»; la mota que igual llega a la cara se corre por ella, sin rebote. **El pegado (modo 6) se borró.** El choque, el polvo posado sobre el logo y el que desliza, contra el campo fino (ESCENA 8, T5). El empuje tras el cursor, también contra la malla real. Los dos campos se hornean una vez al cargar, en dos momentos libres (89 y 93 ms medidos) | `polvo/campoDelLogo.ts`, `polvo/simulacion.ts`, `polvo/parche.ts` |
| La niebla de afuera | 6c + 6d (ESCENA 7, T8) | `niebla/rasante.ts`, `formacion/Formacion.tsx` |
| El haz se enciende | **[ESCENA 8] T1:** cuatro intentos que fallan (de siete: uno sí y uno no) en 1,94 s, el golpe y la luz firme | `entorno/encendido.ts` |
| El polvo nítido | Motas de 1,4 a 3,2 px con borde de un píxel (ESCENA 7, T10) | `polvo/nitidez.ts` |
| La luz que rebota | De noche el charco aclara la cara de abajo del logo (ESCENA 7, T12). Las sombras de las motas, borradas en ESCENA 8 | `entorno/Rebote.tsx` |
| **[ESCENA 8] T2 · la trama anclada** | Las dos capas bajan a pleno hasta 1 u debajo del piso (sin fundido): el piso las corta. La pared (capa gruesa) lleva un zócalo fino (0,1 u, opacidad 0,62) y el piso vivo un contacto al pie de cada capa | `moire/limite.ts`, `MoireScreen.tsx`, `piso/bloques.ts` |
| **[ESCENA 8] T3 · el amanecer** | Encendido (era la prueba T11 de ESCENA 7) y atado al scroll: el scroll pide el avance (borde de Tu panel del 85 % al escenario del final clavado) y el que se muestra lo persigue con tope (entero en 2,5 s como mínimo), en las dos direcciones. Sin evento al cargar adentro, en un viaje, con el bloque tapando; con menos movimiento, de una vez. El texto del escenario de Por qué develOP espera al día; el pie (compartido) fuerza el avance a 0,9 si se ve antes | `amanecer/`, `_secciones/por-que-develop/PorQueDevelop.tsx` |
| **[CALIDAD 1] A2 · el cielo de día** | Encendido: el **pintado celeste** (T4 de ESCENA 8, elegido por Valentino), un ciclorama con nubes pintadas y paneles, en la franja del cielo de la noche, detrás de la formación y de la trama; se va con la noche antes de las estrellas y el amanecer lo destapa desde el horizonte. Sólo con la formación (no en el teléfono). **Rompe la regla monocroma: excepción aprobada** (abajo) | `cieloDeDia/` |
| Preloader de /v3 | Apagado (`CON_PRELOADER = false`) | `_intro/` |
| **[CALIDAD 1] B1 · el precompilado** | Todos los programas se compilan al arrancar (también lo invisible y las escenas aparte, como los rayos) y se calientan con un dibujo de un píxel: ninguno se compila en el recorrido | `gpu/Precompilar.tsx` |
| **[CALIDAD 1] B3 · la física en segundos** | Los modos que mueven motas integran con Euler exponencial: la misma trayectoria a 60, 75, 120 y 144 Hz | `polvo/simulacion.ts` |
| **[CALIDAD 1] B4 · sin saltos** | El peso de la mota suelta (en el modo) mezcla el corte del volumen del aire: nada aparece en el piso ni se va en el aire de golpe; el remolino no lanza las motas de abajo del piso; ninguna mota se pierde en NaN | `polvo/simulacion.ts`, `polvo/volumen.ts` |
| **[CALIDAD 1] B5 · los rayos a media resolución** | En su propio búfer, la mitad del lienzo por lado; un cuadrado los suma | `amanecer/haces.ts` |
| **[CALIDAD 1] B6 · el polvo** | Ninguna mota bajo un píxel encendida entera; alfa premultiplicado | `polvo/nitidez.ts` |
| **[CALIDAD 1] B7 · antialiasing** | Los costados del logo con normales suaves hasta un pliegue de 40° (sin facetas); la sombra de la trama en el piso, prefiltrada | `cantosDelLogo.ts`, `estrellas/cielo.ts` |
| **[CALIDAD 1] B8 · dithering de ruido azul** | En todo lo que pinta degradados (una textura de 16×16) | `ruidoAzul.ts` |
| **[CALIDAD 1] B10 · el apoyo de las copias** | Una mancha de contacto instanciada en la base de cada copia de la formación | `formacion/armado.ts` |
| **[CALIDAD 1] B11 · la calidad adaptativa** | Si los cuadros no entran baja de a un escalón (motas con fundido, después dpr de a 10 %), con histéresis | `gpu/adaptativa.ts`, `gpu/CalidadAdaptativa.tsx` |
| **[CALIDAD 1] B12 · lo que no se ve** | Las estrellas no se dibujan cuando ninguna puede verse | `estrellas/Estrellas.tsx` |

### Excepciones aprobadas a DIRECCION-ESCENA (no «corregir»)

- **El celeste del cielo de día** ([CALIDAD 1] A2). La dirección de arte es monocroma (DIRECCION-ESCENA §4, la
  paleta); el cielo de día pintado lleva un celeste desaturado (`#C8D5DF` arriba, nubes blancas, sombra `#E1E6EA`,
  `cieloDeDia/nubes.ts`). **Es una decisión explícita de Valentino, no un error**: excepción aprobada. Medido en
  ESCENA 8: ningún texto baja de AA (mínimo 10,25:1); el texto sobre el cielo pierde hasta 17,5 % de contraste
  (Por qué develOP).

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
| `cielo-dia=no` | [CALIDAD 1] A2 · sin el cielo de día (queda el fondo de la bruma, como antes) |

### Las pruebas (apagadas en el producto)

Ninguna. [CALIDAD 1] A2: el cielo de día pasó al producto en su variante pintado-celeste; las otras cinco (el pintado
mono, y los bloques y las partículas en los dos tonos) se borraron, código y banderas (`cielo-dia=<variante>-<tono>`
ya no existe).

Borrado en ESCENA 8 (código y banderas): el enfoque que busca, las fibras, el grano y la pasada de las
sombras de las motas (`polvo/sombras.ts`). La carpeta `pruebas/` no existe más.

### Ganchos del banco (sólo existen con `__entornoDeLaEscena`)

`__escenaViva`, `__relojDelBanco`, `__polvoDelBanco`, `__formacionDelBanco`, `__estrellasDelBanco`,
`__pisoDelBanco`, `__fisicaDelBanco` (modos, cámara lenta, `medir` GPU; [ESCENA 8] `campo()`; [CALIDAD 1] `flujo()`,
`estado()` y `aire()` para el instrumento de los saltos), `__aireDelBanco`, `__amanecerDelBanco` (`estado` con
`avance`, `pedido` y el día para el texto; `congelar(s)`; [CALIDAD 1] `haces()` y `tramaFiltrada(v)`),
`__fugazDelBanco`, [ESCENA 8] `__cieloDeDiaDelBanco` ([CALIDAD 1] `dia`, `mostrar`). [CALIDAD 1]
`__gpuDelBanco` (el tiempo de GPU por objeto con nombre, la grabación por cuadro, los programas, `tres()`),
`__precompiladoDelBanco` (cuánto tardó el precompilado) y `__calidadDelBanco` (el escalón de la adaptativa;
arranca apagada con banco, `activa(true)`).

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

**[CALIDAD 1]** El costo de GPU por objeto se mide con `scripts-calidad/motor.ts pasadas` (sin vsync, por nombre de
objeto). Después de CALIDAD 1, a 1440 con dpr 1, el pico del amanecer cuesta ~11 ms de objetos (los rayos, 2,3 ms
con su composición; antes 7,9); a 375, el cuadro va de 0,98 a 2,28 ms. Las tablas base contra final están en el
informe.

## 4 · Reglas de rendimiento: lo que todo efecto nuevo tiene que cumplir ([CALIDAD 1] B13)

1. **Todo en segundos, nunca en cuadros.** Lo que se mueve integra con el `dt` del cuadro, acotado contra los
   tirones (`Math.min(delta, 1 / 30)` o 0,1): los amortiguadores con `1 − exp(−dt/τ)`, la física con Euler
   exponencial (`relajar` en `polvo/simulacion.ts`), lo periódico con el reloj, los pasos fijos con su acumulador. Se
   prueba igual a 60, 75, 120 y 144 Hz (s34 B3 tiene el molde).
2. **Precompilado.** Todo programa nuevo se compila al arrancar: si va en la escena, `Precompilar` lo compila y lo
   calienta aunque esté invisible; si se dibuja aparte (su propia escena o su búfer), se registra en `ESCENAS_APARTE`.
   Se verifica con `motor.ts programas`: `tarde` tiene que quedar vacío.
3. **Cero reservas por cuadro.** En `useFrame` y en los manejadores de scroll: nada de `new`, `clone`, arreglos,
   objetos, `map`/`filter`/`forEach` ni cierres. Lo que se usa por cuadro se arma una vez (marcado `// una vez`; lo de
   banco, `// banco`); las máquinas de estado devuelven EL MISMO objeto si nada cambió; React sólo cuando algo cambia
   (nada de `setState` por cuadro). El detector de s34 B2 revisa todos los `useFrame` de la escena.
4. **Presupuesto.** Medido con `motor.ts pasadas` en el momento donde se ve: a 1440 con dpr 1, **menos de 0,5 ms** de
   GPU; a 375, **menos de 0,2 ms**; y el cuadro de 375 no pasa de **3 ms** en esta placa en el momento más pesado. Lo que
   cubre la pantalla entera y hace una cuenta cara por píxel (rayos, volúmenes) va a menos resolución en su búfer
   (el molde es `amanecer/haces.ts`).
5. **Lo que no se ve, no se dibuja.** `visible = false`, no alfa 0 ni tamaño 0: el vértice corre igual (las estrellas
   de día costaban 0,34 ms sin pintar un píxel).
6. **Con nombre.** Todo lo que se dibuja lleva `name` (el perfil de la GPU agrupa por nombre; s34 B0 lo revisa).
7. **Sin saltos.** Lo que aparece o se va lo hace con un fundido (en el tiempo o en el espacio), nunca de un cuadro al
   otro; lo que queda más chico que un píxel se apaga con su área (B4, B6).
8. **Degradados con dithering.** Un material nuevo con degradados: `dithering: true` (los de three) o
   `conDithering(material)` (los propios). Nada de arreglos constantes grandes indexados en un shader: a Direct3D le
   cuestan más de un segundo por programa (B8 lo midió); si hace falta una tabla, una textura.
9. **Que aguante la calidad adaptativa.** El dpr puede bajar a 0,7 veces el tope y las motas al 65 % (B11): el efecto
   tiene que verse bien ahí.
10. **Los colores canónicos no se mueven.** El tone mapping es Neutral (B9): el piso, el papel y el cielo en reposo,
    ΔE < 2 contra lo aprobado. Un cambio de color de salida se mide con `scripts-calidad/b9-tono.ts`.

## 5 · Los invariantes

`npm run test:s34-calidad1` ([CALIDAD 1] una sección por punto, A1 a A3 y B0 a B12, con sus controles positivos),
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

## 6 · Fallas conocidas (no son de ESCENA 8 ni de CALIDAD 1)

- **`s17-revelado`**: 1 falla, ya estaba antes de ESCENA 5. Busca una llamada que se mudó a
  `ataduraAlScroll.ts` en VIAJES.
- **`s8-tres` y el bundle**: piden un build de producción (`.next`) y no se corre mientras el servidor
  de desarrollo usa esa carpeta.
- **`s10-raf` y `s11-frontera`**: 0 fallas, pero 2 afirmaciones de cada uno quedan «fuera de
  ventana» (dependen del entorno de medición).
- El banco: la pestaña puede quedar oculta (el banco reintenta `bringToFront`); el mouse real del
  usuario mueve el punto rojo y E7 si pasa por la ventana del banco.
- **[CALIDAD 1, hallado]** Cuando la escena se suspende (frameloop `never` detrás de Servicios) r3f corre un último
  cuadro con el timestamp del navegador (ms) como reloj en segundos, y al reanudar el reloj vuelve a 0: las conchas del
  polvo y la vira saltan. Pasa con la escena tapada (verificado con capturas), así que no se ve.
- **[CALIDAD 1, hallado]** La escena sigue dibujando unos cientos de píxeles de scroll adentro de Servicios, ya tapada
  por la sección opaca, antes de suspenderse.
- **[CALIDAD 1, hallado]** El Chrome del banco no conserva la caché de shaders entre sesiones: cada corrida del banco
  se mide en frío (1,27 s de precompilado); en la misma sesión, la segunda carga baja a 161–237 ms.

## 7 · Lo que quedó abierto (para decidir)

- **PENDIENTE · la compuerta del amanecer** ([CALIDAD 1] A4: anotado, no se hace). El amanecer arranca cuando el
  borde de abajo de Tu panel deja ver el 85 % del cuadro (`AMANECER.visible`), así que con un scroll lento lo primero
  del evento (se apagan las estrellas, nace el resplandor en el horizonte) pasa con Tu panel tapando el cielo. Verlo
  entero pide un tramo de sala sin texto entre Tu panel y Por qué develOP: **es un cambio de layout** (la tabla de
  secciones), no de la escena. Queda para un sprint de layout. El costo de los rayos es del producto mientras duran:
  CALIDAD 1 (B5) lo bajó de 7,9 a 2,3 ms de GPU a 1440 (de 17,8 a 5,1 con dpr 1,5).
- **[CALIDAD 1] Lo que no se hizo del sprint, con su porqué** (detalle en `CALIDAD-1.md`): el tamaño de las motas por
  perspectiva real (el real supera el tope en foco a toda distancia visible: agrandaría las motas), AgX o ACES (corren
  los colores canónicos más de ΔE 2), mapas de sombra en tiempo real (serían sombras proyectadas nuevas), el titileo
  de las aristas de geometría (es el límite del MSAA de 4 muestras: pide TAA o más muestras) y los recortes del
  teléfono (sin un teléfono para medir; el menú está en `calidad1/b12-telefono/`).
- **El pie y el amanecer**: el pie es compartido y no espera al día; si se llega antes de tiempo (un tirón de
  más de cuatro pantallas, o Fin) el amanecer salta a 0,9 para que su tinta se lea.
- ~~**El cielo de día (T4)**: por elegir~~ → [CALIDAD 1] A2: el pintado celeste, encendido (excepción aprobada, §1).
- ~~**El pegado (T5)**~~ → [CALIDAD 1] A3: borrado (el modo 6); queda sólo el flujo, que pasa por los huecos del logo.
- La licencia de Book of Shapes (`LICENCIA-BOOKOFSHAPES.md`) cubre los SVG descargados, no el código.
