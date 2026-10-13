# SPRINT PULIDO 20 — El pie que se traba, el cristal en el borde, la red de rayos

Rama `rediseno/home`. Invariante nuevo: `npm run test:s71-pulido-20` (`src/app/v3/_lib/__tests__/s71-pulido-20.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base: `banco11.ts`), `~/.cache/b4-medicion/pulido-18/_scripts/` (el sitio:
`p20-*.ts`), `~/.cache/b4-medicion/pulido-20/` (capturas e informes). Recibos: `docs/rediseno/entregas/pulido-20/`.

El humano: sprint CORTO. OBLIGATORIO: R1 y R2 se VERIFICAN EN EL SITIO REAL (no sólo en el mini-banco); el humano cierra su Chrome
para dejar memoria; si no alcanza, se frena el sprint y se avisa.

Aprobados (no se tocan salvo una mejora chica y clara): el plasma en general; la red en reposo como idea.

Lo pedido:
- R1 · URGENTE: la animación del pie se traba y no avanza. Reproducir en el sitio, encontrar la causa y escribirla acá. Después:
  cada objeto 3D del pie es un SÓLIDO ENTERO (no se estira ni se deforma); tiene su BASE en el piso (parado, no flotando en una
  pared) y cae como el logo (cuerpo rígido que vuelca hacia atrás sobre el canto de su base); AL MISMO TIEMPO que el logo: todos
  tocan el piso en el instante del golpe (cada uno con la duración de caída de su altura); al terminar, todo acostado e incrustado,
  la cámara cerca desde arriba (sin espiral) y todo usable (links, form, foco, autocompletado); un poco de scroll hacia arriba: todo
  se levanta (el rebobinado) y se reinicia como siempre. Invariantes: llega al estado final en un tiempo acotado; ninguna pieza se
  deforma (su escala se conserva); ninguna se interpenetra con otra ni con el logo. Con controles positivos.
- R2 · EL CRISTAL REHECHO: esquirlas en el BORDE de la escena (la foto de Dr. Strange: esquirlas grandes de cristal facetado a
  distintas profundidades, cantos filosos que atrapan la luz, que refractan lo de atrás, con un filo de dispersión). Primero las
  CAUSAS de los bugs (vibra; en ciertos ángulos las partículas desaparecen; dobla el título del hero y raya la silueta del logo;
  estira la imagen en los bordes). Después: esquirlas 3D reales en la periferia (contra el domo), que refractan SÓLO un render
  target del fondo a media resolución (cielo, domo, moiré, fábrica de logos; sin logo, títulos, partículas ni pie); Fresnel, brillo
  en los cantos con la cámara, reflejo tenue; nunca detrás de un texto ni del logo; en el borde de la pantalla se desvanece, nunca
  estira; no escribe profundidad y las partículas nunca desaparecen; cristalizan (crecen y giran muy lento, sin temblor);
  `?espejo-prisma=si` el filo de arcoíris. Variantes `?fondo=moire|espejo|ambos` (default ambos). Se borra la malla de celdas.
  Invariantes: nunca sobre la caja de un texto ni la silueta del logo; cero cambios en las partículas por el cristal.
- R3 · LA RED: cada enlace es un ARCO congelado de los del plasma (quebrado, con ramas), generado al formarse y congelado, con un
  titileo leve; geometría en caché en un solo búfer; con un gesto, el corte en cascada (~0,3 s) con su chasquido.
- BANCO: mini-banco para iterar, sitio real para confirmar R1 y R2. Un solo Chrome y una página por tanda; memoria y no paginado
  anotados; cuadros crudos borrados; nada de builds de medición al terminar. Con el cristal nuevo, ningún cuadro > 20 ms a 1440 y
  390, y sin vibración (la cámara y el cristal estables cuadro a cuadro).
- VERIFICACIÓN: lint de lo tocado + tsc + todas las suites que lean lo tocado + banco del sitio; al final `verificar` completo: los 8
  rojos de la base y ni uno más. REGLAS: las de siempre; invariantes nuevos en `s71-pulido-20`; commit y push por punto.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO EN EL SITIO sí/no.

### Arranque
- Árbol limpio sobre `e766cfaa` (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 74,4 GB libres.
- Memoria: con el Chrome del humano y su `npm run dev`, 2,4 GB disponibles. El humano cerró las dos cosas: 6,2 GB. El sitio se ve
  contra un `npm run dev` propio (`next dev --webpack`, ~2,6 GB; su log en el scratchpad, nunca en el repo) en vez del build de
  medición (2,5 GB más al compilar): `banco11.ts` toma el umbral del portero de `PORTERO_MB` (con el dev server, 2400 MB al lanzar).
  El Chrome del humano sigue vivo en segundo plano (12 procesos, ~0,9 GB: la ventana se cerró, el proceso no); no se toca.

### R1 · El pie que se traba
- HECHO (commit de R1). VISTO EN EL SITIO: sí (1440, 1920 y 390; el build de medición).
- **La causa (reproducida en el sitio, 1440 × 900, `p20-r1.ts` y `p20-sonda2.ts`):** el final se queda clavado en `fin ≈ 0,347`
  (2,8 s del reloj: la cámara subió un 13 %, el logo todavía no tocó), alternando cuadro a cuadro entre `corre` y `espera`, para
  siempre. El reloj sólo corre «al fondo» (`cuadroDelFinal.ts`: `scrollY >= fondo − AL_FONDO_PX`, con `AL_FONDO_PX = 2` y `fondo =
  scrollHeight − innerHeight` medido en cada cuadro). Desde PULIDO 19 (Q2) la pared del pie queda QUIETA en el mundo (armada con la
  cámara de antes del final) y el DOM de cada pieza la sigue con su homografía vista por la cámara VIVA: al subir la cámara, la pared
  baja en la pantalla y el DOM de la fila de abajo (las cuatro redes, `[data-pieza="bloque-solido"]`, con su `matrix3d`) termina en
  33772,7 px, cuando el documento termina en 33770. Un elemento transformado también agranda el desborde del documento: el
  `scrollHeight` pasa de 33770 a 33773, el `fondo` de 32870 a 32873, y con el scroll en 32870 la página deja de estar «al fondo»
  (32870 < 32873 − 2). El reloj sale de `corre` (vuelve hacia atrás: la cámara baja, el DOM sube, el documento vuelve a 33770), al
  cuadro siguiente está otra vez al fondo y arranca: un equilibrio en el que el final nunca llega al golpe. En el mini-banco no
  se podía ver (no tiene DOM): por eso PULIDO 19 lo dio por bueno. Medido: `fin` 0,345–0,348, `fase` corre/espera alternadas,
  `scrollHeight` 33770–33773, el scroll quieto en 32870, ningún error en la consola, los cuadros en 13,3 ms (no es costo: es el reloj).
- La salida: el fondo que vale para el final no puede depender de lo que el final mueve; y el DOM de una pieza que se mueve no tiene que
  poder agrandar el documento.
  - `cuadroDelFinal.ts`: `fondo = offsetHeight − innerHeight` (el alto del LAYOUT, que un transformado no cambia: medido en el sitio, en
    `fin` 0,347 `scrollHeight` 33771 y `offsetHeight` 33770).
  - `armadas.ts` + `pie3d/caida.ts` (`domDeLaCaida`, `domSigueEnLaCaida`): en el final, el DOM de cada pieza se apaga al arrancar (0,15 s)
    y deja de seguirla (queda donde estaba: no la lleva por homografías de canto, que además lo estiraban), y vuelve con la pieza quieta
    e incrustada (0,2 s); mientras, sin clics.
- **Lo pedido, como quedó (el humano lo ajustó dos veces a mitad del sprint):**
  1. Primera versión: cada pieza un sólido que baja parado y vuelca sobre su base, todas tocando en el golpe. El humano: «lo que yo quiero
     es que cada columna toque el piso al mismo tiempo que el logo, y ahí haga la animación de caerse todo junto como si estuviesen en una
     columna invisible, todo pegado, cuando en realidad son objetos separados pero respetando una física de un objeto invisible que los
     contiene».
  2. LAS COLUMNAS (`pie3d/caida.ts`): lo de cada lado del logo es UNA columna invisible (la caja de sus piezas en la pared: la izquierda,
     el logotipo, el titular, el contacto, el recorrido, las redes y la legal, 11,4 × 5,9 u a 1440; la derecha, el rótulo y el formulario,
     7,3 × 5,9 u; el logo, 4,8 de alto). La columna es el cuerpo rígido: BAJA PARADA con el logo (en su misma bajada, 1,2 s: llega al piso
     cuando él llega; primero hacia su lugar a la altura que tenía, después abajo enderezándose: `tramos`), con la BASE en el piso, y
     VUELCA hacia atrás sobre el canto de su base con la física del logo (`caidaAlHueco.ts`) y el κ de su alto, apurada lo justo para
     TOCAR EN EL GOLPE (la izquierda es más alta que el logo: cae junto con él); asentada, se INCRUSTA (baja su espesor, la cara al ras con
     0,012 u de sobra; lo hondo de los pozos del formulario queda arriba). Las piezas van PEGADAS a su columna (el mismo giro y su lugar
     relativo de la pared): acostadas, desde arriba, el pie como era. El rebobinado las levanta por el mismo camino y el reinicio las tira.
  3. El humano, al ver las columnas: «me gustaría que se viera gran parte de la escena igual»; preguntado, eligió «junto al logo, cámara
     lejos»: LA CÁMARA DEL FINAL en escritorio sube de costado hasta 28° (`camara.escritorio`, la escribe `ELEVACION_DEL_FINAL`; abajo de
     1024 sigue desde arriba) y se queda a la distancia en que el pie acostado y el logo ocupan el 62 % del cuadro (`pie3d/encuadre.ts`,
     una búsqueda por mitades): lo demás es piso y domo.
- **Dos defectos de PULIDO 19 que aparecieron al verlo en el sitio:**
  - La calma del piso bajo el pie (Q2) nunca llegó a la simulación: `PisoVivo.tsx` no le pasaba `uCalmaDelPie`, `uBaseDelPie` ni
    `uCalmaDelPieFuerza` y WebGL las dejaba en cero: los bloques del mar subían encima del pie acostado (en `fin` 1, el titular y el
    recorrido tapados por bloques). Ahora las recibe.
  - Con un solo tramo de bajada, el rótulo «CONTACTO» (arriba del formulario en la pared) atravesaba el formulario a los 0,17 s: bajaba
    7,8 u mientras el borde del formulario bajaba 0,6. Lo encontró el invariante nuevo (las cajas orientadas de cada pieza en cada cuadro);
    se fue con los dos tramos y, después, con las columnas (rígidas: nada se cruza adentro).
  - Y uno propio de esta tanda: con los dos tramos, `aplicarLaCaida` no movía la pieza mientras la bajada vertical valía cero (saltaba al
    empezar a bajar); el invariante de saltos lo marca (a lo sumo 0,36 u por cuadro a 120 cps; el salto era de ~14 u).
- `RELOJ_DEL_FINAL.duracionS` = golpe + 2,5 = 6 s (era 8 con las piezas en onda; 5,7 daba igualdades de punto flotante inexactas en s54:
  6 las deja exactas): el DOM de la última columna aparece a los 4,3 s.
- **Visto en el sitio** (el build de medición, el reloj de verdad, `p20-r1v.ts`, con vsync): a 1440, 1920 y 390 el final llega a `fin`
  = 1 (a los 7,7 / 7,7 / 7,1 s de llegar al fondo: la espera del pie entero más los 6 s), el documento no crece nunca (`scrollHeight` =
  `offsetHeight` en cada muestra), escribir «Valentina» en el campo del formulario acostado queda en el campo (foco y valor), un gesto
  hacia arriba con la rueda rebobina hasta 0 en ~1,1 s y el final se reinicia solo (un golpe más). Cuadros: en caliente ninguno de más de
  20 ms en las tres; en FRÍO (la primera corrida sobre el build recién servido) un cuadro de 1000 ms a 1440 (a mirar: «Lo que no quedó
  bien»). Las capturas: `pulido-20/r1col-1440` (la caída por columnas a `fin` fijos), `r1lejos2-1440` (la cámara lejos), `p20-r1prod-*`.
- s71 (R1): el final llega a su fin con el fondo del layout (control: el equilibrio del sitio, al fondo sólo hasta 0,347); con el pie de
  1440 y de 1920 del sitio (`entregas/pulido-20/pie-*.json`) y la caída de verdad, 685 cuadros: piezas sólidas (2e−16), pegadas a su
  columna (1e−13 u), sin saltos, ninguna se cruza con otra ni con el logo, cada columna parada con la base en el piso antes de inclinarse,
  toca en el golpe y queda incrustada y quieta con su DOM (controles: una pieza que se estira, otra que se despega, un salto, dos piezas en
  el mismo lugar, una columna sobre el logo, un toque fuera del golpe); una placa 1,6 veces más alta que el logo también entra; el DOM
  sólo con la columna quieta; la cámara lejos (todo adentro, al 62 %; control: la de PULIDO 19); el cableado y las sombras (sólo placas, se
  van al incrustarse).

### R2 · El cristal: esquirlas en el borde
- PENDIENTE.

### R3 · La red de rayos congelados
- PENDIENTE.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Disponible (antes → después) | No paginado | Nota |
|---|---|---|---|---|
| Arranque | 74,4 GB | 2484 → 6272 MB (el humano cerró su Chrome y su dev server) | 988 → 976 MB | |
| R1 · reproducir (dev server propio + el Chrome del banco) | 74,4 GB | 3440 → 1864 MB | 987 MB | `p20-r1.ts` 1440 (dos veces) y `p20-sonda2.ts` |
| R1 · iterar con el dev server | 74,3 GB | 2500 → 278 MB | 978 → 1021 MB | el Chrome del humano seguía vivo en segundo plano (0,9 GB: con su permiso se cerró); el dev server crece con cada recompilación (2,6 → 4,5 GB): se apagó y se pasó al build de medición |
| R1 · el build de medición (`reconstruir.sh`, 192 s) y el sitio | 74,2 GB | 6636 → 5462 MB | 1004 → 1013 MB | `p20-r1v.ts` 1440 (dos), 1920, 390; `p20-r2diag.ts` |

## Invariantes que cambian de sentido (antes / ahora / por qué)

| Suite | Antes | Ahora | Por qué |
|---|---|---|---|
| s70 Q2 «el pie acostado» | la primera pieza arranca DESPUÉS del golpe | todas TOCAN EN EL GOLPE | R1: «al mismo tiempo que el logo» (control: una que toca fuera del golpe) |
| s70 Q2 «la caída» | termina al ras del piso; en una onda desde el logo (las cercanas antes) | termina incrustada (bajo el ras, quieta); las más altas arrancan antes | R1: «incrustado» y «cada uno con la duración de caída de su altura» |
| s70 Q2 «el cableado» | el piso pulsa en cada impacto (`pedirLaOnda`) | sin pulsos sueltos | todas tocan en el golpe: el impacto es el del logo |
| s70 Q4 «las sombras» | acostadas, la placa con su ribete para siempre | eso al asentarse; incrustada, ninguna (y control nuevo: una sombra bajo una incrustada) | R1: la cara al ras no tapa nada |
| s70 Q2 control «una reserva» | inyectaba en `if (i >= c.n) return` | en `if (i >= c.n \|\| s <= 0) return` | la primera línea de `aplicarLaCaida` cambió; el detector es el mismo |
| s47 «lo interactivo va donde la pieza va a quedar» | el orden termina en `llegar(a, s)` | en `llegar(a, s, …` (con lo que el final deja ver) | el mismo orden; `llegar` recibe la visibilidad del final |
| s51 «el cableado del reloj» | `fondo = scrollHeight − innerHeight` | `fondo = offsetHeight − innerHeight` | R1: la causa de la traba (s71 tiene el control con el de antes) |
| s65 «la llegada lo escribe» | `opacidadDelDom(e)` | `opacidadDelDom(e, final)` | la misma opacidad de la llegada, más el final |

## Crítica (lo que el banco mostró y qué se hizo)

- R1 · PULIDO 19 dio por buena la caída del pie mirándola en un mini-banco sin DOM: la traba vivía en el DOM (una homografía que agranda el
  documento). Ahora R1 y R2 se ven en el sitio, como pidió el humano.
- R1 · la calma bajo el pie de PULIDO 19 no llegaba a la simulación (uniformes sin pasar: WebGL las deja en cero sin avisar).
- R1 · el invariante de cruces encontró dos defectos que las capturas no mostraban (el rótulo que atravesaba el formulario, el salto al
  empezar a bajar): las cajas orientadas en cada cuadro, con el pie del sitio, valen más que mirar.
- R1 · el dev server para iterar se comió la memoria (4,5 GB con las recompilaciones): el sitio se ve con el build de medición.

## Lo que no quedó bien

(al final)
