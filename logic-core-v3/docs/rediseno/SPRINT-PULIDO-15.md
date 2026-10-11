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
- PENDIENTE.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Cuándo | Disco libre | Memoria disponible | No paginado | Nota |
|---|---|---|---|---|
| arranque | 78,2 GB | 6811 MB | 890 MB | el dev server apagado |
| build de medición (M1) | 77,1 GB | 5067 MB | 1086 MB | |
| tanda M1 (repetida) | 77,1 GB | 7436 → 6130 MB | 904 → 926 MB | la primera se tiró (el color mal leído) |

## Lo que no quedó bien

(se completa al final)
