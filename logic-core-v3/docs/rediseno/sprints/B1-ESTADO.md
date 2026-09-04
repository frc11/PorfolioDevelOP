# B1 — ESTADO DE LA CORRIDA

**Para qué existe.** Si la corrida se corta —cuota, sesión, lo que sea—, esto es
lo que una sesión nueva necesita para retomar **sin rehacer nada**.

Última actualización: **3 de septiembre de 2026**, con las tres fases cerradas y
el sprint esperando el OK del humano en la parada.

---

## Dónde se corre

Worktree `C:\rediseno-home\logic-core-v3`, rama `rediseno/home`, HEAD `f8a38fd7`.
**Nada commiteado todavía.**

---

## FASE 0 — CERRADA

| entregable | estado | dónde |
|---|---|---|
| 0.0 · la receta de captura | ✅ | `docs/rediseno/MEDICION-NAVEGADOR.md` |
| 0.1 · la tabla de deltas contra nk | ✅ | `docs/rediseno/sprints/B1-DELTAS.md` |
| 0.2 · el hero | ✅ verificado en 1440 / 1920 / 2560 | `_secciones/hero/Hero.tsx` |
| 0.3 · el contrato | ✅ | `_lib/secciones.ts`, `_secciones/_contrato/coreografia*.tsx` |
| las 32 capturas antes/después | ✅ | `docs/rediseno/capturas/b1/` |

---

## FASE 1 — CERRADA, en el segundo despacho

**Primer despacho (`werbi2bdl`): murió al arrancar.** Reportó «completed» en 3,6 s
y los cuatro frentes fallaron con *"You've hit your monthly spend limit… resets
8:50pm"*. **Cero archivos tocados** — verificado con `git status` y con las fechas
de modificación de las siete secciones.

**Segundo despacho (`wd0492xw8`, run `wf_2f62f596-01f`), 20:54: los CUATRO
cerraron.** 4 agentes, 730 llamadas a herramientas, 1,58 M tokens, 75 minutos.
Sus reportes completos quedaron en
`<scratchpad>/reporte-{A,B,C,D}.md`.

| frente | secciones | qué hizo |
|---|---|---|
| A | quiénes somos + números | medida de lectura acotada, grilla de 12 como reparto, hueco distribuido |
| B | trabajos + servicios | aplicó `anclaje`, plano a 2 de 3 columnas, hueco de `[VIDEO]` de 30,79 % a 16,12 % del área |
| C | tu panel + por qué develOP | `justify-between` en los dos tiempos, bajada a su propia sub-grilla, contraste bajo glifo verificado |
| D | cierre + la pastilla | medida del titular en seis cuerpos (1 → 4 líneas), censo de la pastilla, criterio de los 72 px |

---

## FASE 2 — CERRADA salvo el commit

1. ✅ **`npm run verificar`: 24 pasos, 0 con falla.**
2. ✅ **El build, una vez, exit 0**, con `CIRCLE_NODE_TOTAL=2` y
   `--max-old-space-size=6144`, nada al lado. ⚠️ El chequeo de §6.1 dio **0,61 GB
   de RAM libre** —la condición exacta del `0xC0000142`— y aun así cerró al
   primer intento. Cero procesos `node` colgados de días anteriores.
3. ✅ **`npm run test:frontera`: 0 fallas** (23 afirmaciones, 12 fuera de ventana).
4. ✅ Las 32 capturas + 4 del frame del pin, en `docs/rediseno/capturas/b1/`.
5. ✅ La tabla de aire muerto antes/después contra nk (abajo y en `B1-DELTAS.md`).
6. ✅ El alto total: **14,00 pantallas a 1920, sin cambio.**
7. ✅ `DIRECCION-ESCENA.md` §5.5 — la condición de Franco, con sus números.

### Lo que la Fase 2 arregló por encima de los frentes

- **El defecto que la Fase 0 introdujo en el contrato.** `anclaje` nació como
  `'patron' | 'pin'` y **empeoraba las cosas**: con un bloque de 826 px,
  `alto − viewport` da −254 y el rango se acota a 1 px. Pasa a
  `'propia' | 'seccion'` —qué CAJA se mide, no qué ancla— y los dos rodeos que el
  frente B había tenido que poner (`minHeight` y `perspectiveOrigin`) salieron.
- **La pastilla en Trabajos**, que caía en el archivo de otro frente:
  `escritorio:pt-16`, derivado de `BORDE_INFERIOR_EN_REPOSO_PX = 72`.
- **Cinco agregados en rojo** que los frentes no corrieron (`s5`, `s6`, `s7`,
  `s10`, `s13b`).

---

## FASE 3 — las cinco correcciones del humano, aplicadas

| # | pedido | resultado |
|---|---|---|
| 1 | Quiénes somos a 100svh | **FRENADO por medición.** Con la tabla en 100svh la sección sigue midiendo 2160 px, así que el mapeo se estiraría y el tramo caería 900 px antes de donde termina la sección. Revertido, con la cuenta en el docblock de su fila |
| 2 | revertir el achique de `[VIDEO]` | hecho. Aire 44,72 → **33,52 %**, banda 120 → **88 px** |
| 3 | `Pie.tsx:49` | hecho: dos props que reflejan las de `Envoltorio`. Cierre 125 → **97 px**. Control positivo byte a byte en `s3-layout.invariant` §6 |
| 4 | `contenido.ts:159` | 55 → **50 svh**. Desvío 43,52 → **23,70 px**. Con 45 mide lo mismo: el piso dejó de atar |
| 5 | los 268 px de llegada de Trabajos | anotados como propiedad de P7 en el docblock de la sección |

## LOS NÚMEROS DE CIERRE

| a 1920×1080 | antes | después | nk |
|---|---|---|---|
| aire muerto promedio | 45,30 % | **31,47 %** | 10,31 % |
| banda vacía continua máxima | 849 px | **102 px** | 50 px |
| alto del home | 14,00 pantallas | **14,00** | 22,62 |
| momentos reales | 12,0 | **12,0** | 20,5 |
| choques de la pastilla | 23 paradas | **1** | — |

**Ninguna sección queda por encima del techo operativo de 104 px.**

Anclaje de la escena, **sin mover un bit**: nudos en 0 · 0,125 · 0,375 · 0,5 ·
0,625 · 0,75 · 1 sobre las pantallas 0 · 1 · 3 · 4 · 7 · 11,305085 · 13, y el
ancla declarada del diferencial en **0,8525**.

---

## LO QUE QUEDÓ ABIERTO

1. **Quiénes somos NO se puede bajar hasta que su composición entre en una
   pantalla.** No es la tabla: la tabla sólo pone un piso. Su composición declara
   dos cajas de pantalla y el hueco de la foto mide 987,72 px. El orden es:
   primero la composición, después la tabla. El detalle, con los cuatro desvíos
   medidos, está en el docblock de su fila en `_lib/secciones.ts`.
2. **Por qué develOP se pasa 23,70 px de su alto a 1440.** El piso del bloque de
   P5 ya no es lo que ata (475,19 px de contenido contra 450 de piso): lo que
   queda es la composición de los cuatro diferenciales y el testimonio.
3. **Trabajos, el frame de llegada: 268 px.** Es la rampa de P7 —`autoAlpha`
   arranca en 0— y se disuelve en los 675 px siguientes. Anotado como propiedad
   del patrón en el docblock de la sección.
4. **Un choque de la pastilla queda a 1920**, en Por qué develOP, en tránsito.
5. **El chequeo de procesos de §6.1 se equivoca justo después de medianoche.**
   `Get-Process node | Where StartTime -lt (Get-Date).Date` marcó 5 procesos
   «colgados de días anteriores» que eran los de esta misma corrida, arrancados
   antes de las 00:00. No se mataron. La heurística necesita una ventana de
   horas, no un corte por día.
6. **Tres tareas de fondo murieron sin salida en esta sesión** (dos `verificar` y
   un build). Las mismas corridas en primer plano cerraron. No se diagnosticó.

## LA MÉTRICA DEL BLOQUE SIGUIENTE YA NO ES EL AIRE MUERTO

`B1-DELTAS.md` §1-bis: **no somos largos, somos cortos y vacíos.** 14,00
pantallas contra 22,62 y 12,0 momentos contra 20,5. La resta llegó hasta donde
podía; lo que falta se gana **agregando acontecimientos**, no recomponiendo. Y
ahí la restricción del anclaje deja de pesar: una sección o un tramo nuevos se
declaran en la misma tabla, no la contradicen.

## Instrumentos escritos en este sprint (scratchpad, no van al repo)

```
pixeles.js            decodificador PNG + luminancia + contraste WCAG
aire.js               aire muerto sobre el píxel (la métrica de nk)
borde-seguro.js       hasta qué x puede llegar el texto sin caer bajo AA
contraste-glifo2.js   contraste bajo el GLIFO, no bajo la caja de línea
dump-anclaje.ts       vuelca los nudos del anclaje (tsx)
probar-anclaje.ts     deriva el anclaje con alturas candidatas (tsx)
```
