# SPRINT C2-31g · COLA 2 (2026-10-23) · Las grietas: cada celda del cristal, por dentro

Tarea: `docs/cola/2026-10-23/31-cristal.md`, punto 1 (ítem 19 de la revisión). Worktree `C:\nocturno\2026-10-23\31g`, rama
`nocturno/2026-10-23-31g`. El moiré (punto 2) lo hace 31m en paralelo: no se tocó `fondo.ts`, la celosía ni `ajustes.ts`.

Lo que pidió Valentino: ninguna de las tres variantes de B9 (grietas blancas generales que cruzan el muro, captura `lote2/10`); lo que
quiere es el vidrio aristado (`lote2/06`): una telaraña radial con anillos concéntricos DENTRO DE CADA CELDA, con su propio centro, todas
a la vez, que se vea formarse de principio a fin; `?grietas=centro` (por defecto) y `?grietas=borde`; sin brillo en el home.

## Plan

**Dónde va.** Igual que B9, en el material del muro (`cristal/vidrio.ts`), sin partir la geometría. Lo nuevo: cada vértice del muro sabe
dónde está en SU celda. `muro.ts` suma un atributo, `aGrieta` (u desde el centro del abanico de la celda, en el muro desenrollado, y la
semilla de la celda: su índice). Con eso y `vInterior` (1 en el centro, 0 en el borde: el camino del centro al borde, con la forma de la
celda) el sombreador dibuja la telaraña de cada celda sin texturas ni listas: se borran la ventana, el trazado, la rejilla y las dos
texturas de B9.

**La telaraña de cada celda** (`grietasDelVidrio.ts`, constantes en `GRIETAS.telarana`): de 7 a 11 rayos desde el centro, corridos hasta
0,35 de su sector, con un zigzag chico que nace en el centro; uno de cada cuatro, corto (no llega al otro extremo). Cinco anillos a 0,08,
0,23, 0,41, 0,6 y 0,8 del camino (la forma de la celda a escala), cada tramo entre dos rayos corrido un poco (escalonados, como en la
foto) y uno de cada cinco falta. El fragmento busca los dos rayos que lo encierran (atan de su punto en la celda) y mide la distancia en
px a ellos y a los anillos de su tramo.

**El frente.** `uGrietas.x` (la formación que se ve, el reloj de B9) recorre el camino: con `centro`, de 0 (el centro) a 1 (el borde);
con `borde`, al revés (`uGrietas.w`). Los rayos llegan hasta el frente (punta suave de 1 px); cada tramo de anillo aparece cuando el frente
lo pasa y se cierra desde los dos rayos hacia el medio (en 0,12 de la formación). Todas las celdas con el mismo frente: a la vez. La
FACETA: cada trozo entre rayos y anillos, ±4 % de luminancia (el aristado; no es luz), sólo donde ya pasó el frente.

**Sin brillo en el home.** `brillanLasGrietas(pagina, acento)`: sólo una página con acento (las de servicio; la página base tiene el de
web). En el home la luz de la uniforme queda en 0 todo el ciclo y el color en negro: sólo la banda oscura (de noche, el gris tenue de B9).

**Queda como B9:** el disparador (`dispararLasGrietas`, `grietasAlVolverseElCta` en `enganches.ts`, el título de la página), los tiempos
(1,5 s formarse, 1 s oscuras, 0,7 s encenderse; reversa 0,5 + 1,5 s), la espera al velo quieto (C2-21) y `?grietas-prueba=si`.

**Se borra:** `formas.ts` (las tres formas), `trazado.ts` (ventana, rejilla, empaquetado), las constantes de las variantes, la compacta
(ya no hace falta: la telaraña es por celda), las texturas y las uniformes de la rejilla, y la lectura del ancho en `CristalDeLaEscena.tsx`.

**Archivos.** `cristal/grietas.ts`, `cristal/grietasDelVidrio.ts`, `cristal/grietasEnVivo.ts` (reescritos), `cristal/muro.ts`
(`aGrieta`), `cristal/vidrio.ts` (el atributo y su varying), `cristal/CristalDeLaEscena.tsx` (la firma nueva), `__tests__/s78-b9.invariant.ts`
(reescrita), `__tests__/s78-c21.invariant.ts` (la firma nueva, misma afirmación), `scripts-carga/grietas.ts` (rehecho). Borrados:
`cristal/formas.ts`, `cristal/trazado.ts`. Sin cambios de alto: no aplica la regla de alturas.

## Log

- **El espejo en la CPU** (s78-b9 §4) reproduce `lasGrietas` del sombreador sobre las celdas de verdad (34, a 0,04 u por px: la franja de
  1440). Cada celda agrietada (9 a 16 % de su vidrio con la formación entera), la grieta 3,9 a 5,6 veces más densa en SU centro que en
  toda la celda; una grieta general (el control) da 0 a 1,8. `centro`: muestras oscuras en 0/25/50/75/100 % = 0 → 4797 → 12920 → 22380 →
  31943, nunca más allá del frente; `borde`: 0 → 6893 → 18838 → 26802 → 31969, del borde hacia adentro.
- **La primera corrida del espejo dio 8 muestras oscuras con `borde` en 0 %**: el borde exacto con la punta a media cobertura. En el
  sitio no pasa (con la formación en 0, `uGrietas.z` es 0 y el sombreador ni entra); el espejo ahora respeta esa compuerta.
- **El ancho de los anillos**: con `fwidth` de `s` salían más finos en diagonal; ahora la derivada es el largo del gradiente.
- **s78-c21** usaba `crearLasGrietas(u, celdas, …)` y `estado().tramos`: ahora `crearLasGrietas(u, …)` y la dueña (la afirmación es la
  misma: con el velo en curso el pedido espera; con el velo quieto se toma y se forman).
- **Suites**: s78 entera 14 invariantes, 671 afirmaciones, 0 fallas (s78-b9 49/0, s78-c21 31/0); s70-pulido-19 77/0; s71-pulido-20 56/0;
  tsc 0; eslint de lo tocado limpio. No se tocó CSS (s3-tokens no aplica).
- **El costo**: no se midió (sin navegador). Por construcción, con las grietas: un `atan`, dos rayos (cada uno con un seno, un coseno y
  dos senos del zigzag) y cinco anillos, todo con un azar de un seno; sin texturas. B9 leía hasta 28 tramos con dos lecturas de textura
  cada uno. Lo mide el banco (abajo).

**Decisiones sin preguntar** (una línea cada una):
- El centro de cada celda es el de su abanico (el promedio de sus vértices): el mismo del que sale `vInterior`.
- Los anillos tienen la forma de la celda (camino constante), escalonados por tramo: siguen el bloque y se leen como la telaraña.
- «Las páginas de servicio» = una página con acento (`presetActual().acento`); la página base (acento de web) brilla, el home nunca.
- `?grietas=` viejos (`1`, `2`, `3`, `no`) caen al por defecto (`centro`); el banco ya no usa `no`: compara contra las grietas cerradas.
- La faceta (±4 %) es el «aristado» de la referencia; no es luz. Si molesta, `GRIETAS.dibujo.faceta` en 0.
- Los controles del banco entran por `window.__defectosDeLasGrietas` (como `__defectosDelVelo`), nunca por la URL: `general` (una sola
  telaraña para todo el muro, centrada donde mira la cámara: `uGrietasGeneral`) y `brillo-en-el-home`.

## Qué mirar

En el navegador (1440×900; el dev en `http://localhost:3000`):
1. `http://localhost:3000/v3/pagina-base` — cuando el título termina de entrar (~2,4 s), en CADA celda del muro a la vista nace una
   telaraña desde su centro: los rayos crecen hacia los bordes y los anillos se cierran detrás del frente, en ~1,5 s, todas a la vez;
   quedan ~1 s oscuras (gris tenue, es de noche) y después una luz fina celeste corre del centro hacia los bordes.
2. `http://localhost:3000/v3/pagina-base?grietas=borde` — lo mismo, pero nace en los bordes de cada celda y avanza hacia el centro.
3. `http://localhost:3000/v3` — bajá hasta el CTA de «Por qué develOP» (el título que se da vuelta): cada celda se agrieta por dentro,
   SIN luz (sólo la línea oscura). Subí por ese punto: se cierran en reversa (se retraen al centro). Con `?grietas=borde`, desde los bordes.
4. `http://localhost:3000/v3?grietas-prueba=si` y `/v3/pagina-base?grietas-prueba=si` — el ciclo solo, cada ~11 s.
5. A 390 y 768 (el teléfono): la misma telaraña por celda (ya no hay versión compacta).

El banco (contra el dev, Chrome a la vista; perfil y fotos por `limpieza-del-banco.ts`):
- `BANCO_FOTOS=<carpeta> npx tsx scripts-carga/grietas.ts` — home (CTA) y página base, `centro` y `borde`, a 1440: el disparo, el ciclo,
  las fotos en 0/25/50/75/100 % (y con la luz), la medida por celda en la foto y el costo del muro. Tiene que dar `OK`.
- `CONTROL=general npx tsx scripts-carga/grietas.ts` — tiene que dar FALLA «POR CELDA».
- `CONTROL=brillo-en-el-home LUGARES=home npx tsx scripts-carga/grietas.ts` — tiene que dar FALLA «SIN BRILLO EN EL HOME».
