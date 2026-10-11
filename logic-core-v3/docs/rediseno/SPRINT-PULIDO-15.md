# SPRINT PULIDO 15 — Quiénes somos definitivo + la energía nueva (plasma + cargas)

Rama `rediseno/home`. Invariante nuevo: `npm run test:s66-pulido-15` (`src/app/v3/_lib/__tests__/s66-pulido-15.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base) y `~/.cache/b4-medicion/pulido-15/_scripts/` (los de este sprint).
Recibos: `docs/rediseno/entregas/pulido-15/`.

Aprobados (no se tocan): la cámara de la caída, el form del pie y sus inputs. Se borran con su código: las seis variantes de
`?destellos=` y `?destellos-color=` (no gustó ninguna). `lente.ts` (sólo fin de línea) fuera de los commits.

El humano puede no estar: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Disco 78,2 GB libres; 6,8 GB de memoria disponibles, 890 MB de no paginado. El dev server, apagado.
- `imagenes que me dijo claude.ai que te agregue/bocetos-energia.html` NO está (ni en esa carpeta ni en el resto del disco): M2 se
  hace con la descripción del pedido (cargas que se atraen y repelen, el arco ramificado por desplazamiento de punto medio, el logo
  como fuente, el cursor como carga fuerte). Si el boceto aparece, se compara contra él.

### M1 · Quiénes somos, definitivo
- HECHO · VISTO sí (banco `pulido-15/_scripts/m1-halo.ts`, hoja `~/.cache/b4-medicion/pulido-15/m1/hoja-m1.png`; recibo
  `entregas/pulido-15/m1-cuerpo.json`).
- El cuerpo vuelve a la IZQUIERDA (la columna de siempre, `min(30rem, 42vw)`); la composición a la derecha y `?cuerpo=` se borraron
  con su regla. Siempre delante del logo y entero, sin enmascarado.
- SIN el velo elíptico: ni su pseudo-elemento, ni su degradé, ni sus tokens. La legibilidad la da un halo corto y denso pegado al
  trazo de las letras (`--halo-del-cuerpo`: tres sombras de 0,1 em y tres de 0,2 em, la receta de P12/D2 SIN las colas de 0,45 y
  0,9 em, que en un párrafo se juntan en una mancha), del color contrario a la letra.
- LECTURA ANOTADA («un halo oscuro; de día, el del color que corresponda»): desde 1024 la letra del cuerpo es la tinta, y un halo
  oscuro alrededor de la tinta no la separa del logo negro. De día: la tinta con el halo del papel. De noche: el papel con el halo
  de la tinta (el «halo oscuro»). El cambio es un escalón a la mitad de la noche que SE VE (`--noche-del-arco`, la luz del arco en
  ese cuadro, que la sección escribe junto a la de siempre): la primera versión usaba `--noche-de-la-sala` (la mayor entre la gota
  y el arco) y, medido volviendo de Portfolio con la rueda rápida, a los 350 ms la sala ya era de día con la variable en 0,89: el
  cuerpo quedaba papel con borde de tinta sobre la sala clara. Con la del arco, a los 350 ms ya es tinta. No hay bandera para la
  otra lectura (la tinta con el halo del papel también de noche): de noche la tinta sobre la sala oscura no se lee.
- Medido (banco de producción, la NVIDIA; el contraste como WCAG: la letra contra el fondo típico del tramo, el peor de 40 px):

  | Ancho | Cruce máximo (reposo / entrada / salida) | Día: cuerpo en reposo / sobre el logo al salir | Noche: cuerpo en reposo / sobre el logo al salir |
  |---|---|---|---|
  | 1024 × 768 | 0 / 0 / 41,1 % | 9,99 / 6,28 | 10,14 / 4,31 |
  | 1280 × 800 | 0 / 0 / 39,3 % | 9,91 / 6,13 | 10,18 / 4,34 |
  | 1366 × 768 | 0,5 / 0 / 30,4 % | 9,91 (18,52 las dos letras del reposo) / 7,01 | 10,50 (6,52) / 4,52 |
  | 1440 × 900 | 0 / 0 / 31,8 % | 9,12 / 7,40 | 10,57 / 4,30 |
  | 1920 × 1080 | 0 / 0 / 6,5 % | 10,13 / 8,57 | 11,55 / 4,66 |
  | 2560 × 1440 | 0 / 0 / 20,6 % | 10,20 / 7,38 | 11,02 / 4,76 |

  En la entrada el cuerpo no cruza el logo en ningún ancho. De día todo queda en AA. De noche (la gota forzada en 1 con
  `__nocheDelBanco`, sólo con banco), sobre el logo queda en 4,30–4,76: NO LLEGA a AA en 1024, 1280, 1440 y 2560 (justo en 1366,
  1920). La tapa del logo de noche es gris (#808080 en la captura) y el instrumento mide la letra contra ese gris, no contra su
  halo; agrandar el halo sería la mancha que se pidió no poner: queda anotado (s66, deuda declarada) y sin velo.
- La noche de verdad casi no llega al cuerpo: volviendo de Portfolio con la rueda rápida, a los 120 ms la sala está de noche (el
  papel con el halo de la tinta, 4,47 sobre el logo) y a los 350 ms ya es de día (la tinta, 7,23).
- Un error mío en el banco: la primera tanda leyó mal el color de la letra (`color(srgb …)` va de 0 a 1) y midió la noche con la
  fórmula del texto oscuro (8,1–9,5, falso); se tiró y se repitió.
- Invariante: s66 (la composición, sin velo, el halo corto del color contrario y el escalón de la noche, lo medido; controles
  positivos: el cuerpo a la derecha, el velo vuelto a poner, el halo con colas, el halo del color de la letra, sin halo, la letra
  atada a la gota). s65 L1 dejó de afirmar el velo y la derecha (nota a s66).

### M2 · La energía nueva: plasma + cargas (`?energia=plasma`)
- HECHO · VISTO sí (banco `pulido-15/_scripts/m2-plasma.ts`; hojas `~/.cache/b4-medicion/pulido-15/m2/hoja-m2-1440.png` y
  `hoja-m2-390.png`, seis cuadros cada una: día, noche, el puntero cerca, quieto sobre un grupo, un arco del logo, color; recibo
  `entregas/pulido-15/m2-plasma.json`).
- Se borraron los destellos con su código (`_lib/escena/destellos/`) y sus banderas (`?destellos=`, `?destellos-color=`). Entra
  `_lib/escena/energia/`: `cargas.ts` (la física), `arcos.ts` (los arcos), `sombreadores.ts`, `armado.ts` (las mallas y el entorno
  del programador), `PlasmaYCargas.tsx` (el cuadro) y `textoEnPantalla.ts` (era de los destellos).
- CARGAS: 320 en escritorio y 180 en el teléfono, la mitad de cada signo, en una cáscara alrededor del logo (radio 13 u, hueco
  4,2). Las positivas, un punto lleno con halo; las negativas, un anillo fino; instanciadas (un cuadrado por carga, una llamada): el
  tamaño es el del mundo a su distancia (lejos, chicas; cerca, grandes, con tope de 6 px) y la lejanía las apaga. Las opuestas se
  atraen y las iguales se repelen (alcance 3,6 u), con rechazo de corto alcance, amortiguación y una agitación suave; las fuerzas
  por una grilla de celdas del alcance (en el modelo: ~4.600 pares por cuadro contra 51.040 de todos contra todos).
- ENLACES QUE DESCARGAN: dos opuestas libres que se acercan a 1,2 u se enlazan (un resorte); mientras siguen enlazadas, cada tanto
  salta entre ellas un arco; al terminarse el enlace (2,5–7 s) el par se suelta solo, con un empujón y un rato sin enlazarse.
- LOS ARCOS: el camino por desplazamiento de punto medio (32 tramos, cada nivel corre el medio hacia un costado, sobre todo en la
  pantalla), con 0–2 ramas cortas; un núcleo fino y un halo, en px de la pantalla; viven 0,22–0,36 s y tiemblan (el camino se
  rehace cada 45 ms, con otro brillo), con los extremos siguiendo a las cargas. Un par puede repetir enseguida (40 %). Búfer fijo
  (6 lugares × 48 tramos): los arcos reescriben sus tramos y el resto queda fuera del rango de dibujo; nada se aloca por arco.
- EL LOGO ES LA FUENTE: cada 2,4–4,8 s suelta un arco desde el punto de su borde más cercano (de sus mallas) hacia una carga a
  menos de 6,8 u.
- EL PUNTERO (el mouse sobre la página; el dedo mientras toca, por los eventos táctiles, que siguen llegando mientras desplaza la
  página) es una carga fuerte sobre su rayo: atrae a las negativas, empuja a las positivas y rompe los enlaces que toca; con cargas
  cerca, los arcos le saltan (~1,2 por segundo), desde las que están a 0,9–3,2 u de su rayo (las que ya se le pegaron dan un arco
  de pocos px).
- CONTENIDO: como mucho 5 arcos a la vez (4 en el teléfono). En el modelo, en 2 min: 1,6 arcos por segundo entre enlaces, uno del
  logo cada ~3,6 s y 1,2 por segundo al puntero mientras está.
- No pasan por delante de los textos: las cargas y los arcos se apagan detrás de las cajas de texto (en el sombreador: pasan por
  detrás) y un arco no nace si un extremo o su medio cae sobre un texto (se desvía a otro). Con movimiento reducido, las cargas
  quietas y sin arcos. En el final del pie se apagan con la cámara que sube, como el polvo de antes.
- Monocromo: de noche el papel, que suma luz con su halo; de día la tinta CON UN HALO DEL PAPEL (la primera tanda los mostró sin
  él: sobre el logo negro, los arcos al cursor y las cargas que se le juntaban desaparecían). `?plasma-color=si`: un azul eléctrico
  frío (de noche, un núcleo casi blanco con halo azul).
- Medido en la NVIDIA (RTX 5050; la pantalla del banco va a 75 Hz, 13,34 ms):

  | Corrida | Día (media / p95) | Con el puntero | Noche | Cuadros de más de 20 ms |
  |---|---|---|---|---|
  | plasma, 1440 | 13,34 / 13,8 | 13,34 / 13,8 | 13,34 / 13,7 | 0 |
  | plasma en color, 1440 | 13,34 / 13,7 | — | 13,34 / 13,7 | 0 |
  | plasma, 390 (el dedo) | 13,34 / 13,7 | 13,34 / 13,8 | 13,34 / 13,8 | 0 |
  | plasma en color, 390 | 13,34 / 13,8 | — | 13,34 / 13,8 | 0 |
  | el polvo (la base), 1440 | 13,34 / 13,7 | — | 13,34 / 13,7 | 0 |
  | el polvo (la base), 390 | 13,34 / 13,8 | — | 13,34 / 13,7 | 0 |

- LECTURAS ANOTADAS: (1) el boceto no estaba en el disco: el comportamiento sale de la descripción del pedido. (2) «No reemplaza al
  polvo todavía»: con `?energia=plasma` el plasma va EN LUGAR del polvo (para juzgarlo como su reemplazo; sin bandera, el polvo de
  siempre); la otra lectura, los dos juntos, con `?energia=plasma-y-polvo`. (3) «Tinta de día» se leyó como el color del núcleo: el
  halo de día es del papel (sobre el papel no se ve; sobre el logo negro separa la tinta). (4) El puntero es una carga del signo de
  las positivas (atrae a las negativas): los arcos le saltan de cualquier signo, como en una bola de plasma.
- Dos errores míos que el banco mostró y se arreglaron antes de la tanda final: los cuadrados de los arcos estaban en sentido
  horario y el descarte de caras los tiraba todos (no se veía ningún arco); el dedo se cancelaba apenas desplazaba la página
  (`pointercancel`).
- Invariante: s66 (las banderas y los destellos borrados; la física: opuestas, iguales, el rechazo, la cáscara, el puntero, la
  grilla y los enlaces; los arcos: el tope, las tres clases, las vidas, el búfer fijo, ninguno sobre el texto; el punto medio; los
  sombreadores; el movimiento reducido; lo medido; con sus controles positivos). s65 L3 dejó de afirmar los destellos (nota a s66);
  s52 pide `energia` y `plasma-color` en lugar de los destellos.
- s54 (PULIDO 3/4) afirmaba que `?energia=intensa` se borró comprobando que la clave `energia` no existiera; M2 la reusa (el pedido
  nombra `?energia=plasma`). Lo atrapó el `verificar` del gate, antes del commit: se adaptó a lo que cuida (`intensa` no es un valor
  de la clave, pedida da `no`, y no está en el código del final), con un control positivo nuevo (la clave con `intensa`).

### Final · verificar
- HECHO. Con el dev server y el banco apagados, después de `limpiar.ps1 -Profundo`: `npm run verificar` completo, 73 pasos (uno más: s66), 8 rojos, los de la base (s1, s17, s2, s3, s4, s5, s7, s8) y ni uno más; tsc en verde. La primera corrida dio 9: el noveno era s54, mío (ver M2), arreglado antes del commit. s66 queda verde con una deuda declarada (la noche de M1 sobre el logo).

## Disco y memoria por tanda

| Cuándo | Disco libre | Memoria disponible | No paginado | Nota |
|---|---|---|---|---|
| arranque | 78,2 GB | 6811 MB | 890 MB | el dev server apagado |
| build de medición (M1) | 77,1 GB | 5067 MB | 1086 MB | |
| tanda M1 (repetida) | 77,1 GB | 7436 → 6130 MB | 904 → 926 MB | la primera se tiró (el color mal leído) |
| build de medición (M2) | — | 7386 MB | 931 MB | cinco builds de medición en M2 (cada uno, 103–122 s) |
| pruebas de M2 (1440) | — | 7724 → 6353 MB | 911 → 922 MB | los arcos no se veían (el sentido de los cuadrados) |
| tanda M2 | 76,7 GB | 7544 → 6432 MB | 910 → 917 MB | la base del polvo de acá |
| tanda M2 b | 76,7 GB | 7419 → 6264 MB | 909 → 921 MB | el halo del papel de día, el dedo |
| tanda M2 c (la final) | 76,7 GB | 7430 → 6687 MB | 875 → 877 MB | el arco al cursor desde las que vienen |
| antes de verificar | — | 7590 MB | 915 MB | el banco y el servidor de medición apagados |
| al terminar | 76,7 GB | 7352 MB | 930 MB | `~/.cache/b4-medicion`: 0,96 GB (los cuadros crudos se borraron; quedan las hojas y los JSON). `.next-probe` (el build de medición): 5,4 GB, se puede borrar |

## Lo que no quedó bien

- **M1, la noche sobre el logo**: de noche (forzada: en el uso real casi no llega, a los 350 ms de volver de Portfolio ya es de día)
  los renglones sobre la tapa gris del logo dan 4,30–4,76:1 por el instrumento (la letra contra el gris de la tapa, no contra su
  halo): por debajo de AA en 1024, 1280, 1440 y 2560. Sin velo y sin agrandar el halo, como se pidió: queda la deuda declarada en
  s66 con el número.
- **M1, el halo de día**: sobre el logo negro el halo del papel se ve como un contorno claro de las letras; no hace mancha ni caja
  (la hoja), pero se ve.
- **M2, la AMD**: no se midió la integrada (el banco usa la NVIDIA); con cientos de cargas y un búfer de arcos fijo el costo es
  chico, pero en placas débiles no está medido.
- **M2, el dedo a 390**: arrastrar desplaza la página; en la hoja el grupo del dedo quieto quedó arriba a la izquierda y se lee menos
  que el del mouse. El arco del logo de día a 390 es chico.
- **M2, de día**: las cargas son puntos y anillos de tinta; sobre el papel pueden leerse como lunares más que como energía: hay que
  mirarlas en movimiento.
- **M2, `arcos.ts`** tiene 394 líneas (un módulo, no un componente; el camino, el programador y el búfer juntos).
- **El banco**: la primera tanda de M1 leyó mal el color de la letra (se repitió); en M2, dos errores míos de dibujo y del dedo, a la
  vista en el banco y arreglados antes de la tanda final.
- **El boceto**: `bocetos-energia.html` no estaba: el plasma sale de la descripción del pedido, no se comparó contra el boceto.
