# SPRINT T0 · nocturno del 2026-10-22 — lo que quedaba de B12a.8 y los agregados de Valentino (sin el carrusel B1.2e)

Rama `nocturno/2026-10-22-t0`. Tareas: `docs/cola/2026-10-22/10-T0-pendientes.md` y `11-T0-extra.md`. Sin navegador: lo que se ve lo mide el
orquestador (abajo, «Qué mirar»). Las pruebas sin navegador están en `s78-t0` (`npm run test:s78-t0`), cada una con su control positivo.

## Plan

| # | Qué | Cómo | Criterio sin navegador | Criterio en el navegador |
|---|---|---|---|---|
| 11·1 | El color de las páginas desde el arranque | La variante de la base encendida en el avance 0; el velo destapa con la variante de la página ya dibujada (`listaDeLaRuta.ts`); la página pide el trozo de su variante al montarse | s78-t0 §1 (con controles) | primer cuadro destapado/directo con la noche y el acento |
| 11·2 | `peso` por defecto | `LEGIBILIDAD_POR_DEFECTO`; `tamano` con la bandera | s78-b12a T5 (con dos controles) | «web» en 125/400 sin bandera |
| 11·3 | El velo hacia el home | dos vías detrás de `VIA` (`banda`, `montaje`, `ambas`, `ninguna`), defecto `ambas` | s78-t0 §3 | `velo.ts` ≤ 1,2 s hacia el home, 0 cuadros en blanco |
| 11·4 | La píldora (el WIP `97c80a64` no pasa: 6,51 px/ms) | arranca con el hilo calmo y retiene el «quieto» del velo | s78-t0 §4 | `velo.ts` 1440: la más rápida ≤ 3,96 px/ms |
| T3 | El cartel del sonido abajo de 1024 | más aire arriba del título (`--spacing-12`) | s78-t0 §5 (la cuenta con los tokens) | `chrome-en-los-anchos.ts`: 0 anchos con falla |
| T3 | «isReady» | `compilarConCuidado` en vez de `compileAsync` | s78-t0 §5, s34, s36 | 0 `pageerror` achicando a 360 |
| T3 | El NaN de los títulos | sin medidas no finitas del DOM | s78-t0 §5 | 0 avisos `computeBoundingBox` NaN |
| T3 | Las invariantes de la navbar (s10, s26, s27, s39, s41) | a la spec de B12a.8 («Home» primero) | las cinco en verde, con controles nuevos | — |
| T3 | Lint de `SombraDeLosTitulos.tsx:93` | el cuadro antes que los efectos | lint limpio | — |

## Log

### 11·1 · el color desde el arranque (`ad4e7343`)
- **Qué era.** La noche ya la ponía el rig con el preset en cualquier progreso (`luzDeLaPagina`). Lo que traía el scroll era la variante: se
  encendía de 0 a la mitad de la intro (la luz de abajo y el acento en la luz y la energía). La página arrancaba en la composición en blanco.
- **Lo hecho.**
  1. La variante de la base encendida en el avance 0 (`cuadroDeLaPrueba`, puro); el scroll sólo abre el anillo (85 → 100 %); al irse, la salida de siempre.
  2. El velo (enlace o flecha) destapa cuando la variante de ESA página dibujó un cuadro (`listaDeLaRuta.ts`; la marca corre después del
     cuadro de la variante). Sin escena, sin variante o con `__ranuraSinVariante`, en el acto. El techo de 3,5 s sigue.
  3. Entrando directo, `PresetDeLaPagina` pide el trozo de su variante apenas se monta; `calentarElDestino` calienta los del registro.
- **Para servicios (P-S nuevo):** sus variantes se encienden de 0 a `ENCENDIDO_HASTA` (`_servicios/escena/estructura.ts`,
  `parametrosEnElAvance`). Para la noche y el acento desde el arranque, la encendida tiene que valer desde el avance 0 (como la base).
- **La skill quedó vieja:** `VARIANTES.md` §6 («arranca casi quieta y se completa con el avance») y §8 contradicen el pedido. No la toqué.

### 11·2 · `peso` por defecto (`3ec09a58`)
`?legibilidad=tamano` queda con la bandera; `?legibilidad=peso` sigue andando. El servidor pinta `peso`.

### 11·3 · el velo hacia el home (`c28ed7b1`)
- **banda:** `VELO_CORTO`, cubre en 360 ms y destapa en 440 (eran 460 y 560): ~220 ms menos.
- **montaje:** el home se servía quieto y, con el trozo de la coreografía animada, cada `Bloque` cambiaba de componente y React rehacía las
  ocho secciones; llegando por la navegación cliente, tapado. Ahora la coreografía se pide en reposo desde cualquier página (y con el
  puntero sobre un enlace al home) y `CompuertaDelHome` arranca animada si la escena ya pintó: el home se monta una vez.
- **Defecto:** `ambas`. Si una vía rompe algo en el sitio, `VIA_POR_DEFECTO` en `_lib/veloDeNavegacion.ts`.

### 11·4 · la píldora (commit del velo y la píldora)
- **Por qué el WIP no pasaba.** No era la curva: el home todavía se estaba montando (un cuadro de 84 ms después del destape, ~530 ms de
  obras al quedar quieto el velo). En un cuadro que llega tarde el navegador calcula las animaciones con la hora vieja del cuadro y el banco
  anota la de ahora. La banda del velo (otra animación del compositor) muestra lo mismo en esas muestras: su cobertura pasa de 1 a 0,435 en
  35 ms del banco (≥ 167 ms de su animación). En el crudo, la píldora: 37,5 → 252 px en 34,9 ms del banco = 89 ms de su curva.
- **Lo hecho.** Arranca recién con dos cuadros seguidos calmos (la hora del rAF ≤ 8 ms detrás del reloj y ≤ 24 ms entre cuadros; techo
  400 ms), con su hora y `fill: 'backwards'`. Mientras espera, la retención sigue al lugar del destino si se corre. Retiene el «quieto» del
  velo (`retenerElQuieto`) hasta terminar: las obras del home que esperan al velo no caen en medio. Dura el destape de la vía.
- **Lo que queda abierto:** con el techo de 400 ms puede arrancar sin calma (si el home no se calma). Y en el crudo la píldora llegó a 748 y
  después pasó a 828 (80 px, la zona de la cabecera) durante las obras del quieto: mirar en el sitio si el scroll del home queda en 80.

### T3 · el cartel del sonido (`9c737167`)
Abajo de 1024 el título arranca en 128 px (era 112); el cartel termina en ~114. Se eligió el aire: el cartel a la derecha del parlante choca
con el botón del menú a 360 y, de 860 a 1023, con la píldora de las páginas. Y la barra invertida de más en el disco del parlante.

### T3 · «isReady» (`a13ac4ea`), el NaN (`bf1cf61e`), el lint (`11819762`), las invariantes de la navbar (`12b538cb`)
- **isReady:** `compileAsync` le pregunta al programa de un material liberado (`currentProgram` undefined) y tira adentro de un
  `setTimeout`; la promesa no se resuelve nunca. `compilarConCuidado` da por terminado el material sin programa.
- **NaN:** la causa más probable (sin certeza, no se pudo ver): `letrasDelDom` divide por el cuerpo y la escala de la caja del DOM; con una
  caja aplastada da NaN y cada letra (cada una su `ExtrudeGeometry`: los ~60 avisos) se corre con NaN. Dos guardas.
- **Navbar:** s10-acceso, s26, s27, s39 y s41 a la spec de B12a.8, con controles nuevos. s10 además: la banda del velo ya no lleva
  `will-change` en el marcado (se pone sólo mientras se mueve).

### Lo que corrió (sin navegador)
`tsc` 0. Lint limpio en los archivos tocados (2 avisos de antes en s10-acceso). s78 (b12a 162 de 0, t0 40 de 0), s10 241 de 0, s26, s27,
s34, s36, s39, s40–s42, s44, s46–s49, s51, s61, s62, s73–s76, s6, s19, s7 (salvo s7-compuerta) y s3/s5 (salvo los de peso y s5-compacto,
los de la base) en verde. s3-peso, s5-peso, s7-compuerta, s8-tres y s8-peso piden el build (`.next`): no corren en el worktree.

## Qué mirar (el orquestador, en el navegador)

1. `velo.ts` con `ANCHOS=1440` y `VIA=ninguna`, `banda`, `montaje` y `ambas` (crudos con el sufijo de la vía): el total hacia el home, 0
   cuadros en blanco, y la píldora (≤ 3,96 px/ms; el dato «con la hora del cuadro» separa un salto de un cuadro largo).
2. `/v3/pagina-base` a 1440, carga directa sin scroll: la noche y el acento (la luz de abajo celeste, el anillo) en el primer cuadro; lo
   mismo desde el home con el velo y con la flecha atrás.
3. `chrome-en-los-anchos.ts` con las tres composiciones y `/v3`: 0 anchos con falla; y la consola: 0 «isReady», 0 NaN.
4. `/v3/pagina-base` a 1280 sin bandera: «web» en 125/400; con `?legibilidad=tamano`, el título más grande.
5. Las matrices del home (`matriz.ts`, `historias.ts`) y `verificar`: con la vía `ambas`, el home llega por la navegación cliente sin el
   árbol quieto (mirar que el hero y el Portfolio aparezcan como siempre).
