# SPRINT PULIDO 4 — el CTA bien hecho + el sonido y la luz del encastre + el mouse del pie

Rama `rediseno/home`, worktree `C:\rediseno-home\logic-core-v3`, ruta `/v3`. Plan arriba, log abajo, breves. Un commit y
push por punto. Invariante nuevo: `npm run test:s55-pulido-4` (con control positivo). Gate por punto: lint de lo tocado,
`tsc`, s53/s54/s55. Al final, un `verificar` completo (los 8 rojos de la base). Entregables: `docs/rediseno/entregas/pulido-4/`.

Aprobados (no se tocan): la energía de B0 (la del producto), el mouse de B2 (sólo se ajusta el rango) y B3. Se BORRA
`?energia=intensa`.

## 1 · El plan

**C1 · El CTA** (lo más importante): se recupera «Seis razones» y el cruce de `?cta=cruce` como estaban en `2411371a`
(«Seis razones» se extruye y se agranda por su «o»; del otro lado, «HABLANOS»), y lo nuevo, lo único: los seis valores se
van un poco hacia atrás, se desarman y se rearman en la frase del CTA (una metamorfosis en 3D: `?meta=fusion|contorno`), y
la frase vuelve adelante, arriba de «HABLANOS». Todo a la vez; la frase y «HABLANOS» terminan en el mismo punto del scroll.
Continuo en el scroll en las dos direcciones (el salto de la reversa: la causa); sin el CTA en un viaje del menú; la frase
en Archivo con su copy (la fuente 3D, del TTF con minúsculas). Se mantienen las siete pantallas, el teléfono clavado, el
movimiento reducido con el estado final y ninguna letra delante del logo.

**C2 · El encastre:** el golpe suena (como el pulso, más fuerte, desde el mismo evento; `?golpe=a|b`); el brillo pasa del
filo del logo a todo el círculo liso alrededor, que pulsa con cada onda y con fuerza en el golpe.

**C3 · El mouse del pie:** ±22° a los costados y ±11–12° arriba y abajo, con más ganancia por píxel en vertical; sin el
techo del domo (invariante de P17-A); debajo del tope de s23 (subiendo el amortiguado).

**C4 · s6-tokens:** las tres filas de grilla de A2 pasan a tokens registrados, sin cambiar nada visible.

## 2 · Log

### C1 · El CTA bien hecho

**Lo que se recupera, tal cual** (`2411371a`): «Seis razones para elegirnos» con el cruce (`ctaDelFinal/transformacion.ts`,
las mismas medidas: extrusión hasta 6 veces, el viaje por la contraforma de la «o», el tope del espesor en la pantalla,
«HABLANOS» que se ve recién cuando la contraforma lo contiene y se asienta). Lo que B1 había cambiado de la sección se
revirtió a mano: la metamorfosis letra por letra, el CTA en mayúsculas, el teléfono sin la copia de «Seis razones» (vuelve,
como estaba). Un solo cambio sobre `2411371a`, que no se ve: «Seis razones» se apagaba de golpe cuando su contraforma
cubría la mitad de la diagonal; ahora se apaga con el tramado entre el 42 y el 50 % (con la «o» centrada ya no queda tinta
en la pantalla), así el invariante de continuidad no lo cuenta como un salto. Corre en las tres pantallas de B1 (la sección
sigue en siete).

**Lo nuevo: los seis valores se transforman en la frase.** La escena mide cada valor en el DOM (cada letra con un `Range`,
y su ícono: el SVG de Lucide, tal cual) y lo arma en 3D (`medidaDeLosValores.ts`, `piezasDeLaMetamorfosis.ts`). En el arranque
el DOM se apaga mientras la escena lo prende con su tramado (3 % de la transformación: el CSS 3D del DOM y el volumen no se
ven idénticos, y el cambio de golpe se notaba) y en el primer 18 % los lleva de donde se ven (su columna va en el plano del
título) a su lugar plano, pegado a la pantalla: siguiendo al título se achicaban hasta perderse al lado del logo. Después:
se van un poco hacia atrás (a 0,82 de su tamaño), se desarman y se rearman en «Este sitio empezó con una charla. El tuyo
también.», que vuelve adelante y se acomoda arriba de «HABLANOS». La frase termina con «HABLANOS», en el 100 %.

- **`?meta=fusion` (sin bandera: el producto).** Dos mallas (una llamada cada una: las 391 letras y los 6 íconos de los
  valores; las 42 letras de la frase). Cada letra de los valores se mueve entera (su demora sale de un ruido lento sobre su
  centro: las vecinas van juntas, nada se deshilacha). Primero se derriten en su lugar (un ruido lento en el vértice que dobla
  palabras), después viajan a la zona de la frase con el camino doblado por el flujo y estiradas en la dirección en que van,
  como una gota, y llegan más grandes (la densidad de la frase). La frase nace en ese mismo lugar, derretida con el mismo ruido,
  y se des-deforma letra por letra. El cruce entre las dos es un disolvente con umbral de ruido sobre el lugar en la masa, y es
  complementario: lo que no es valor es frase, así en el medio se leen como una sola masa. Todo en el vértice y el fragmento:
  el costo en la CPU es el de dos mallas.
- **`?meta=contorno`.** Los contornos de las letras (y los trazos de los íconos) de los valores y los de la frase, remuestreados
  a 28 puntos los dos, se interpolan con turbulencia: cada contorno de los valores va a uno de la frase en el orden de lectura;
  los agujeros de los valores se cierran al arrancar y los de la frase se abren al asentarse, mientras crece su extrusión y
  vuelve adelante. La geometría se rehace en cada cuadro (earcut de three y los costados). **El costo, medido a 1440 en esta
  máquina: 8 a 11 ms por cuadro mientras cambian (unos 470 contornos), ~2 ms en la etapa de la frase.** Es lo que la deja
  como variante y no como producto.
- **Una tercera: no la sumé.** La que haría mejor el «que se mezcle todo» es un campo de distancia (los dos textos como SDF, la
  mezcla con el dominio deformado y el volumen por raymarching): cambia de topología sin esfuerzo, pero el material sale de un
  sombreador propio y no del satinado de los títulos y del logo (se vería de otra familia), y no entraba en el tiempo con la
  calidad que pide. Queda propuesta.

**La continuidad (el salto de la reversa).** La causa, medida en el banco (volviendo en pasos de 12 px con frenadas): el asiento
de los valores (RONDA 2 F2: con el scroll quieto a mitad, el valor se completa o se deshace solo). Al volver el scroll, el
valor saltaba de lo que el asiento había hecho al lugar del scroll en un cuadro: de 0 a 0,57 de opacidad en un paso (y su
traslación). Ahora lo mostrado SIGUE al scroll sin saltar (`asientoDelValor.ts`): si va adelante en la dirección en que se
mueve el scroll, espera a que el scroll lo alcance; si quedó atrás, lo alcanza más rápido que el scroll y en la punta del tramo
ya es el scroll. El asiento parte de lo mostrado. Medido de nuevo: después de una frenada el valor se queda donde quedó y
sigue al scroll; ningún salto. Lo demás (el cruce, la metamorfosis, «HABLANOS», la frase) es función pura del progreso.

**Los viajes del menú.** Durante un viaje, nada del CTA se dibuja (el cruce y la metamorfosis) ni se ve su DOM: ningún viaje
termina adentro de la transformación (los del menú llegan al arranque de las secciones). Medido del pie a Inicio a 1440: 0 de
365 cuadros con el CTA (13 de ellos con la transformación a mitad).

**La fuente.** La frase va en Archivo con su copy («Este sitio empezó con una charla.», mayúscula inicial, acentos). El woff2
del sitio es un subconjunto de mayúsculas (`scripts-titular/subsetear-fuentes.py`); la fuente 3D ahora sale del TTF entero de
Archivo (OFL) con el mismo ancho pinchado (wdth 62, `scripts-titular/_upstream/pinchada-archivo-display.ttf`), sólo con las
letras que pide: `archivo-400-cta.json` (19 glifos, 7,7 KB) y `archivo-700-cta.json` (el destacado, 14 glifos, 5,5 KB);
`archivo-700-titulos.json` volvió a ser el de `2411371a` (el hero y «HABLANOS»). Los valores, en la Chivo del DOM (400):
`chivo-400-valores.json` (37 glifos, 15 KB). Todo en el módulo del CTA, que se descarga aparte. El texto del DOM de la frase
queda en la Chivo (sólo se ve sin WebGL): la escena arma la de Archivo centrada en cada renglón del DOM.

**Se mantiene:** las siete pantallas (la transformación en tres), el teléfono con el bloque clavado (ahora con la copia de
«Seis razones» arriba y la de los títulos de los seis valores en el lugar de la frase), el movimiento reducido con el estado
final y ninguna letra delante del logo (el plano del CTA, detrás del centro del logo; la metamorfosis sólo va hacia atrás).

**Entregables:** `c1-fusion-1440.png`, `c1-fusion-390.png`, `c1-contorno-1440.png`, `c1-contorno-390.png` (0, 20, 32, 50,
70 y 100 % de la transformación) y `c1-reducido-1440.png`, `c1-reducido-390.png`.

**Gate:** lint limpio en lo tocado; `tsc` 0 errores; `s53` 54/0, `s54` 50/0, `s55` 18/0; además los 30 que leen lo tocado
(s18, s29–s49, s51, s52-nocturno-final, s52-pulido-1, s6-tu-panel, s7-mezcla, s7-por-que-develop, s23-final): verdes.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s54` B1 · Archivo y 3D | la frase en mayúsculas, el DOM en Archivo (`FUENTE_DE_LA_FRASE_DEL_CTA`), el armado de B1 | la frase y el destacado con su copy en Archivo (y «HABLANOS»), en 3D | Por pedido (C1 · 6): la fuente con minúsculas; lo demás lo fija `s55` C1 · 6, con su control |
| `s54` B1 · la metamorfosis | las letras de «Seis razones» se reordenaban en la frase, con su control | se borró (y su control) | Por pedido: B1 se revirtió; el cruce y la metamorfosis nuevos los fija `s55` C1 (con tres controles) |
| `s54` B1 · el producto | `<CtaTransformadoEnLaLista caja={cajaDelCta} progreso={transformacion} />` | el mismo con `entrada={entrada}` | La copia de «Seis razones» de la lista vuelve (aparece cuando el logo ya bajó) |
| `s54` B1 · el teléfono | sin «Seis razones» repetido en el DOM | con la copia de «Seis razones» y de los títulos de los valores | Por pedido: el cruce de `2411371a`, tal cual; el resto (movimiento reducido, el plano) igual |
| `s41` 3G · el valor | `<li>` y la pieza adentro | `<li ref={lugar}>` (su caja para la escena) | La misma pieza; el `li` le da su caja a la escena |
| `s43` F2 · el asiento | `a.control = animate(p, destino, …)` | `animate(s.mostrado, destino, …)` y `seguirAlScroll(…)` antes de posar | La causa del salto de la reversa: más estricta (también fija que lo mostrado sigue al scroll) |
| `s52-pulido-1` · las banderas | `rebobinado`, `angel`, `energia` | y `meta` (`fusion`, `contorno`) | La bandera nueva, con el mismo control |

### C2 · El encastre: el sonido del golpe y la luz que pasa al círculo

**El sonido.** Dos nuevos en el sprite, sintetizados como los demás (`scripts-retoque/sonidos.ts`, nada bajado; `SONIDO.md`):
`golpe-a`, el pulso más grave (un seno que cae de 62 a 34 Hz, más largo) con un sub-golpe de 27 Hz debajo y el «toc» del
contacto, saturado suave; `golpe-b`, el mismo con una cola corta de la sala (una reverb de Schroeder propia, 0,9 s, húmeda al
30 %). Medido en el sprite decodificado (Opus): el pulso, −16,3 dB RMS; `golpe-a`, −10,6 dB (pico −0,21 dB); `golpe-b`,
−13,5 dB (pico −0,42 dB; la cola baja el promedio). Más fuertes que el pulso, sin saturar. El sprite pasa de 46 a 64 KB (Opus)
y de 45 a 67 KB (AAC).

Suena desde el MISMO evento del golpe (`cuadroDelFinal.ts`, el bloque que marca `golpeEn` y nace la súper onda): cuando
`fin` cruza el golpe hacia adelante. Así suena otra vez en el reinicio automático y nunca en el rebobinado (ahí `fin` baja),
ni en la vuelta de un viaje, ni con movimiento reducido (no hay golpe). Pasa por el bus de siempre: con el sonido apagado o
antes del gesto, no hace nada. `?golpe=a|b`; sin bandera, `a`. Se escuchan sueltos en `/v3?sonidos=1`.

**La luz.** El brillo del filo (B0) se sacó entero: ni el parche del logo ni el hilo de luz en el piso (`rimDeLaLuz.ts` se
borró). El logo quedó como era antes de PULIDO 3 (`LuzDelLogo.tsx`). El brillo pasó a todo el círculo quieto alrededor del
logo (`final/luzDelCirculo.ts`, el radio del círculo quieto: 4,2 u): el piso va hacia el blanco ahí, dibujado después del
oscurecimiento de la sala, con la energía extendida (0,62). Con cada onda de energía pulsa (+0,32, en 0,32 s) y en el golpe,
fuerte (+0,75, en 0,7 s): el borde se abre y un halo sale del círculo. El logo, negro, se lee recortado contra esa luz. Con
movimiento reducido, la luz sin el pulso.

**`?energia=intensa` se borró** (código y bandera): la energía es la de B0.

**Un rojo que dejó C1, arreglado acá:** `s52-nocturno-final` D3 (el bloque clavado del CTA de la lista, tal cual). En C1,
después de correrlo, le sumé al bloque el estilo que lo esconde en un viaje: ahora va en un envoltorio sin caja (`contents`)
y el bloque queda igual.

**Gate:** lint limpio en lo tocado; `tsc` 0 errores; `s53` 54/0, `s54` 50/0, `s55` 26/0; y los 22 que leen lo tocado (s10-medida,
s29–s36, s38, s40, s42–s44, s46–s52-nocturno-final, s6-tu-panel): verdes.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s54` B0 · una versión | `?energia=intensa` (más brillo y ritmo) existe | no existe (ni la bandera ni `INTENSA`) | Por pedido (se borra); más estricta: fija que no vuelve |
| `s54` B0 · el logo brilla | el filo del logo encendido, fuera del oscurecimiento, y el pulso del logo con cada onda (dos controles) | lo mismo sobre el círculo quieto (la luz después del oscurecimiento, el pulso con cada onda) y el logo sin su parche (los mismos dos controles, sobre el círculo) | Por pedido (C2 · b): el brillo pasó del filo al círculo; lo nuevo (el golpe, el radio) lo fija `s55` C2 |
| `s52-pulido-1` · las banderas | `energia` (`intensa`) | `golpe` (`a`, `b`) | La que se borró y la nueva, con el mismo control |
| `s40` T2 · los sonidos | ocho en el sprite | diez (`golpe-a`, `golpe-b`) | Los nuevos, con su fila en `SONIDO.md` |

### C3 · El mouse del pie: más rango, sobre todo vertical

±22° a los costados (era 17) y hasta ±12° arriba y abajo (era 6) (`final/orbitaDelMouse.ts`). La ganancia por píxel vertical es
1,6 veces la horizontal (a 1440 × 900: 0,031°/px a lo ancho y 0,049°/px a lo alto), así que el tope vertical llega a unos 245 px
del centro y no en el borde: a lo alto, con menos pantalla, se mueve más de lo que daría la proporción. El DOM le escribe a la
órbita el alto sobre el ancho de la ventana.

**El domo.** Con el invariante de P17-A extendido (los cuatro bordes, toda la subida, las dos alturas del mouse del rig, 1440 ×
900 y 1024 × 768): con la subida, lo más alto queda en 22,4 (el techo, a 40; el límite con aire, 38). Aun con la órbita
entera desde el pie del rig: 34,0 mirando desde abajo (−12°) y 13,7 desde arriba. Simétrica: no hizo falta achicar el rango de
abajo.

**El techo de velocidad (s23).** Con el rango nuevo, de punta a punta la órbita giraba más rápido; el amortiguado pasó de 0,3 a
0,45 s: 3,12 alturas de cuadro por segundo contra 3,41 del arranque del recorrido (antes, 3,34). s23 no se tocó.

**Gate:** lint limpio; `tsc` 0; `s53` 54/0, `s54` 50/0, `s55` 28/0; s49, s51 y s52-pulido-1, verdes.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s54` B2 · el rango | 15–20° a los costados y hasta 6° arriba y abajo | 20–24° y 11–12° (la ganancia por píxel la fija `s55` C3, con su control) | Por pedido (C3) |
| `s54` B2 · el gesto | a los 0,3 s, entre el 55 y el 70 % del camino; esperas de 3 y 1,5 s | a `amortiguaS` (0,45 s), lo mismo; esperas de 10 veces el amortiguado | El amortiguado subió por el techo de s23: la misma curva, en su tiempo |
| `s54` B2 · los controles | la órbita sin amortiguar con el vertical lineal; «±40° y ±6°» | con el vertical nuevo (`gradosVerticales`); «±40° y ±12°» | Los mismos controles con la regla nueva |

### C4 · Las filas de la tablet del pie, por tokens

Las tres grillas de A2 (en `Cierre.tsx`, `ColumnasDelPie.tsx` y `FormularioDelPie.tsx`) tenían sus filas escritas en la clase,
y `s6-tokens` T5 no acepta un arbitrario sin `var()`. Ahora son propiedades del pie (`pie.css`, en el bloque del pie):
`--filas-del-cierre` (la primera fila toma lo que sobra, la segunda lo suyo), `--filas-de-la-navegacion-del-pie` (el rótulo y
lo que se estira) y `--filas-del-mensaje-del-pie` (el rótulo, el área que crece y su pie), con los mismos valores que A2,
registradas en `s3-registro-de-tokens.ts`. Las clases las leen por `var()`. Nada visible cambia: medido a 768, las tres
grillas resuelven sus filas igual (786 + 70 px, 229 + 545 px y el campo del mensaje con su área de 281 px). `s6-tokens` y
`s3-tokens` verdes.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s54` A2 · el contacto en columna | las tres filas escritas en la clase | las tres, por `var(--filas-…)` | La misma estructura, por token (C4); `s55` C4 fija los valores (con su control) |
| `s52-nocturno-final` · el formulario del teléfono | el mensaje con sus filas escritas en la clase | por `var(--filas-del-mensaje-del-pie)` | Ídem |

### Cierre · el `verificar` completo

Una vez, al final, con el Chrome del banco cerrado: 62 pasos y **8 grupos rojos, los de la base** (s1, s2, s3, s4, s5, s7, s8 y
s17, con sus 14 invariantes: los del build de producción y `s17-revelado`). `s6` (el rojo de A2) y `s7e` quedaron verdes;
`s53`, `s54` y `s55`, verdes. No corrí el build de producción.
