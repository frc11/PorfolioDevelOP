# SPRINT CIERRE A-ter — La carga a prueba de todo, y dos retoques

Rama `rediseno/home`. Invariante nuevo: `npm run test:s75-carga` (`src/app/v3/_lib/__tests__/s75-carga.invariant.tsx`); A4b y A10b en
`test:s74-cierre-a-bis`. Arnés: `scripts-carga/estres.ts` (Playwright con el Chrome del sistema y la placa de alto rendimiento) y
`scripts-carga/resumen.ts`. Diagnóstico: `?diag=carga` → `window.__v3diag` (`src/app/v3/_lib/diagnostico/`). Corridas crudas en
`~/.cache/b4-medicion/cierre-a-ter/carga/`; recibos en `docs/rediseno/entregas/cierre-a-ter/`.

Lo pedido (resumen):
- **A13** · `/v3` carga y anda siempre: en frío, con caché, saltando desde el menú en cualquier momento, recargando, con red o CPU lentas,
  con la pestaña al fondo y con el contexto WebGL perdido. Primero REPRODUCIR (arnés de estrés + diagnóstico), después arreglar las causas
  (el estado se deriva, no se acumula; todo idempotente), con un perro guardián de respaldo. Aceptación: 0 fallas en el build de medición;
  en dev, 0 fuera de lo documentado como «sólo dev»; `test:s75-carga` con su control positivo (sin la reimpresión por fuente y con las
  fuentes demoradas, falla).
- **A4b** · más rayos en la red de noche (no más grosor ni brillo), igual de estable y entera a los ~7,3 s; variantes con `?red-densidad=`.
- **A10b** · el rebote al caer, prendido por defecto; `?rebote=no` lo apaga.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

| Punto | Estado | Commit |
|---|---|---|
| A10b · rebote por defecto | HECHO (tests con el sentido nuevo: s74, s52, s71) | bf8baf4b |
| A4b · más rayos | HECHO (densidad 1,5 por defecto: ~110 rayos contra ~77, en Node); la hoja y los cuadros por segundo de noche: VERIFICAR TRAS REINICIO (`scripts-carga/red.ts`) | 8adabba2 |
| A13 · fase 1, el diagnóstico y el arnés | ESCRITOS (`?diag=carga`, `scripts-carga/estres.ts`); sin correr: VERIFICAR TRAS REINICIO | (el de A13) |
| A13 · fase 2, los arreglos | HECHOS desde lo que muestra el código, afirmados en Node (`s75-carga`); el sitio: VERIFICAR TRAS REINICIO | (el de A13) |

**Memoria (2026-10-16):** entre 1,6 y 2,9 GB disponibles en todo el sprint, con el pool no paginado en 1,65 GB (la fuga de contextos WebGL
de los bancos anteriores: sólo la limpia un reinicio). Con menos de 3 GB no hay banco (la regla del sprint): no corrió ni el arnés, ni la hoja
de A4b, ni visual-qa. Todo eso queda **VERIFICAR TRAS REINICIO**, con los pasos abajo.

## A13 · Fase 1: reproducir

### El diagnóstico (`?diag=carga`)

`window.__v3diag` (sólo con la bandera; el código que lo arma se descarga sólo entonces):
- `estado(referencia?)`: cada texto impreso (los títulos de volumen, las piezas del pie, la tarjeta de gracias o error) con su estado
  (pendiente / listo), con qué fuente se imprimió y si estaba cargada, su versión, lo que se corrieron sus letras desde entonces, la opacidad
  efectiva de su DOM de respaldo y si su pieza se dibuja; el estado de `document.fonts` (cada cara); el montaje de la escena (el lienzo, su
  contexto, el primer cuadro, la caída, la carga abierta); el Lenis (dónde está, adónde va, si se mueve); la época de medición; cada bloque
  animado (su rango medido y el progreso que da contra el de una carga limpia); la noche (puesta y la que deja el scroll); el remate de Tu panel.
- `fallas(referencia?)`: lo que el arnés cuenta como falla (`fallas.ts`, puro, probado en s75).
- `eventos()`: la línea de tiempo (cada impresión con su fuente, cada «listo», las épocas, los viajes, cada clic en un ancla —si lo tomó el
  viaje o fue el salto NATIVO—, las fuentes cargadas, la visibilidad, el contexto perdido y repuesto).

### El arnés (`scripts-carga/estres.ts`)

Cada corrida combina la carga (fría / con caché / recarga en medio de la página / entrada con un ancla), el momento del clic (0,3 / 1 / 2 /
5 s), el ítem del menú (los cinco de la barra y Contacto) y la condición (normal / CPU ×4 / red lenta: 300 ms y 2 Mbps, las fuentes 2,5 s
tarde / la pestaña al fondo 4 s y de vuelta); además dos ítems en menos de 500 ms y el contexto WebGL perdido y repuesto en medio de la
página. Mira a los 1,5 s de llegar (estricto), a los 5,5 s (lo que se quedó) y 1,5 s después de scrollear 500 px. La referencia de los
bloques: una carga limpia desde arriba, con una época forzada al final (todo medido en reposo).

### Lo que se encontró en el código (antes de correr; a confirmar o descartar con datos)

| Hipótesis | Lo que el código permite | Dónde |
|---|---|---|
| H1 · fuentes tardías | Los títulos se arman con `document.fonts.ready`, que resuelve cuando no hay nada cargando EN ESE MOMENTO; la x de cada letra se lee del DOM: medida con la fuente de respaldo, queda así (nunca se rearma). La época de medición sólo escucha las fuentes si estaban cargando al cablearse. | `titulos3d/sincronia.ts`, `motion/epoca.ts`, `pie3d/PieDeVolumen.tsx` |
| H2 · salto antes de montar | El viaje del menú lo toma un escucha que existe sólo cuando el chunk de Lenis monta: antes, el ancla nativa salta al instante. Un segundo clic en vuelo sale por `if (enVuelo) return` ANTES del `preventDefault`: salto nativo encima del viaje. | `_componentes/useDeslizamientoDelCta.ts` |
| H3 · medidas viejas | Cada bloque animado mide su rango con `getBoundingClientRect` (con lo pegado y lo transformado) en su montaje y sólo por época (sin ResizeObserver); el destino del viaje se mide en el clic. | `motion/useProgresoDePatron.ts`, `destinosDelViaje.ts` |
| H4 · lo que depende del recorrido | La noche y el remate de Tu panel se disparan por cruces de un IntersectionObserver: un salto que pasa por encima no cruza nada. Con la pestaña oculta al cablearse la época, el alto queda en 0 y al volver no se mide: todo quieto. | `trabajos/CapaDeLaGota.tsx`, `tu-panel/Remate.tsx`, `motion/epoca.ts` |
| H5 · contexto WebGL | three repone la geometría y las texturas al restaurarse, pero lo que se pintó una vez (el estudio de los reflejos) queda vacío, y mientras está perdido los títulos no se ven con el DOM apagado. | `escena/estudio.ts`, `titulos3d/` |
| H6 · sólo dev | Turbopack compila por pedido, StrictMode monta dos veces. | — |

### Las tasas (antes y después)

**VERIFICAR TRAS REINICIO** (no hubo memoria para el banco). Los pasos, con el Chrome del humano cerrado y ≥ 3 GB libres:
1. El «antes» sin git: `bash <scratchpad>/cierreAter/cambiar.sh antes` (pone los archivos de antes de los arreglos, con el diagnóstico),
   `bash ~/.cache/b4-medicion/pulido-18/_scripts/compilar.sh`, servir (`servir.sh`), `MODO=build TANDA=antes npx tsx scripts-carga/estres.ts`,
   cortar el servidor y `bash <scratchpad>/cierreAter/cambiar.sh despues`. Sin el scratchpad (otra sesión): el «antes» es el commit de A4b
   (`8adabba2`) más el diagnóstico de A13 (`src/app/v3/_lib/diagnostico/` y sus anotaciones), en un árbol aparte.
2. El «después»: compilar de nuevo, `MODO=build TANDA=despues npx tsx scripts-carga/estres.ts`; el control positivo:
   `MODO=build TANDA=control SIN_REIMPRESION=1 SOLO=red npx tsx scripts-carga/estres.ts` (tiene que fallar: `fuente-de-respaldo` o `letras-corridas`).
3. Dev (si la memoria alcanza: el servidor de desarrollo come 2,6 a 4,5 GB): lo mismo con `MODO=dev` contra `next dev`.
4. `npx tsx scripts-carga/resumen.ts <las tandas>` → las tablas acá; `RECIBO=docs/rediseno/entregas/cierre-a-ter/carga.json` para s75.

## A13 · Fase 2: las causas y los arreglos

Sin banco (memoria), cada causa se arregló desde lo que el código muestra y se afirma en Node (`s75-carga`, con sus controles); el sitio
queda para el arnés: **VERIFICAR TRAS REINICIO** (el «antes» se compila con `scratchpad/cierreAter/cambiar.sh antes`, sin git).

| Causa | Arreglo | Dónde |
|---|---|---|
| H1 · `fonts.ready` resuelve con nada cargando: un título se armaba con la x de sus letras medida con la fuente de respaldo y así quedaba; el pie, la tarjeta y el CTA del final, igual; la época sólo escuchaba las fuentes que cargaban al cablearse | Cada título espera la cara exacta de su DOM (`document.fonts.load` con su estilo, peso, cuerpo y familia); cada tanda de fuentes que termina (`loadingdone`) pide otra sincronía y lo armado con letras corridas (con una fuente nueva desde que se armó) se vuelve a armar, con lo mostrado donde iba; el pie se rearma (compara su firma), la tarjeta se vuelve a imprimir (las fuentes en su firma), el CTA del final se rearma y la época mide de nuevo | `_lib/fuentes.ts` (nuevo), `titulos3d/sincronia.ts`, `titulos3d/registro.ts`, `pie3d/PieDeVolumen.tsx`, `pie3d/tarjetaImpresa.ts`, `ctaDelFinal/enVivo.ts`, `motion/epoca.ts` |
| H2 · un segundo clic en vuelo salía por `if (enVuelo) return` ANTES del `preventDefault`: el ancla nativa saltaba encima del viaje; y `enVuelo` se prendía antes de calcular el destino | El clic en vuelo se ignora de verdad (primero el `preventDefault`); el vuelo empieza con el destino calculado | `_componentes/useDeslizamientoDelCta.ts` |
| H3 · cada bloque animado medía con lo que corren los `sticky`: una época a mitad de una sección clavada corría su rango; y nada volvía a medir cuando la página cambiaba de alto sin cambiar la ventana | El tope sin lo pegado (a cada `sticky` de la cadena se le descuenta lo corrido, una vez por pasada); la época también avanza cuando el cuerpo cambia de alto (con el mismo reposo de 150 ms) | `motion/enReposo.ts` (nuevo), `motion/useProgresoDePatron.ts`, `motion/epoca.ts` |
| H4 · con la pestaña oculta al cablearse la época, el alto quedaba en 0 y al volver no se medía: todos los bloques quietos (las fotos); la noche y el remate de Tu panel se disparaban sólo por cruces: un salto por encima los dejaba en el estado viejo | Cableada oculta, la medición queda debida y se toma al volver; después de un salto la noche es la que deja el scroll y el remate se posa, sin gesto | `motion/epoca.ts`, `trabajos/CapaDeLaGota.tsx`, `tu-panel/Remate.tsx` |
| H5 · con el contexto perdido, lo impreso no se veía con su DOM apagado; al reponerse, el estudio de los reflejos (pintado una vez) quedaba vacío | Perdido, los títulos y el pie se sueltan (el DOM a la vista); repuesto, se rehacen el estudio y lo armado | `escena/contextoDelLienzo.ts` (nuevo), `titulos3d/sincronia.ts`, `TitulosDeVolumen.tsx`, `pie3d/PieDeVolumen.tsx` |
| Red de seguridad | El perro guardián: un título a la vista, con su fuente, sin armar y sin nada en curso más de 2 s se vuelve a armar y lo dice (`console.warn('[v3-carga] …')`); lo que espera su fuente o compila no se toca (con la CPU lenta se rearmaría para siempre) | `titulos3d/sincronia.ts` |

`?reimpresion=no` (la bandera del control positivo, con `?diag=carga`): la espera de antes (`fonts.ready`), sin rehacer nada y sin el guardián.


## A4b · Más rayos

La red de noche es un árbol que une una brasa por celda de una grilla del cuadro (`energia/arbol.ts`): los rayos son las celdas menos uno.
La densidad agranda la grilla con su raíz (9 × √densidad: 1,25 → 10, 1,5 → 11, 1,75 → 12 por lado), sin tocar el canal, el golpe ni la
estabilidad; cada rayo nace por su distancia por el árbol a un foco, en la misma parte de la formación, así que la red sigue entera a los
~7,15 s. Variantes: `?red-densidad=1.25|1.5|1.75` (y `1`, la de A-bis, para comparar). Por defecto 1,5: ~110 rayos contra ~77 (en Node,
4 semillas); con 1,75 pasaría el tope del brillo de noche (140 enlaces) y bajaría cada rayo.

La hoja (5 cuadros a 1440 y 390, y una de cada variante) y los cuadros por segundo de noche contra `?red-densidad=1`, con la red armada
(el gancho del banco de la energía): `BASE=http://localhost:3000 npx tsx scripts-carga/red.ts` contra el build de medición. **VERIFICAR TRAS
REINICIO.** Los tests de PULIDO 19 y 28 que cuentan celdas (s70, s72) cuentan ahora con la grilla de la densidad del producto.

## Lo que no quedó bien

- Nada se vio en el sitio: sin memoria para el banco, las causas se arreglaron desde el código y se afirman en Node; el arnés (antes y
  después, build y dev), el control positivo en el sitio, la hoja y los cuadros por segundo de A4b y visual-qa quedan para después de reiniciar.
- Un clic en el menú antes de que monte el viaje sigue siendo el salto nativo del ancla (cae en el tope de la sección, no en su nudo): lo que
  se arregló es que después todo quede como si se hubiera llegado scrolleando (la noche, el remate, los bloques, los títulos). Los bloques
  adentro de algo transformado (las fotos de Quiénes somos en su plano 3D, el cartel de Trabajos) todavía se miden con su transformada: lo
  dirá el arnés (la referencia compara con el layout).
