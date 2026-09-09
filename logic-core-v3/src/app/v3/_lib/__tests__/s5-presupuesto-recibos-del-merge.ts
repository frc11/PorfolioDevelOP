/**
 * LOS RECIBOS DEL PRESUPUESTO DE PESO DE `/v3` — SEGUNDA MITAD: B9, B8 y el
 * heredado, o sea las tres líneas que el merge de las cuatro ramas puso en
 * discusión.
 *
 * Es la continuación de `s5-presupuesto-recibos.ts`, y existe por la misma razón
 * que él: los recibos completos no entran en 300 líneas, y la regla del repo es
 * **partir por dueño, no recortar**. Allá, el techo de 60 KiB y los montajes de
 * B4-A, B7 y B6-A —los tres que se midieron en su propio worktree y cuya cifra
 * no volvió a moverse—. Acá, los tres que el merge tocó:
 *
 *   · **B9**, cuya línea el merge dejó fuera del sumatorio de
 *     `MONTAJES_DECLARADOS_KIB` (la constante seguía existiendo, con su valor de
 *     origen, pero no se sumaba). B10 la volvió a poner.
 *   · **B8**, que es el único montaje con signo negativo del presupuesto.
 *   · **el heredado**, que ya iba por su cuarta medición: 0,15 en el worktree de
 *     B7, 1,35 en el de B6-A, 0,07 en el árbol mergeado SIN B9 que midió B8, y
 *     el de B10 sobre este árbol.
 *
 * Este archivo es prosa y no exporta un valor: el `export {}` está para que
 * `isolatedModules` lo trate como módulo y no como script global.
 */
export {}

/**
 * ═══ RECIBO DE `MONTAJE_DE_B9_KIB` ═══════════════════════════════════════
 * B9 · LA REGLA DEL RANGO, EN 13 SITIOS — 0,31 KiB
 *
 * ⚠️ **Lo decidió el humano en la parada de B9**, y las tres cosas que B4-A
 * exige para mover este número están abajo, más el reparto por dueño que B7
 * agregó.
 *
 * ── La causa, medida DOS VECES y coincidiendo a la unidad ─────────────────
 *
 * Dos builds de producción del **mismo árbol**, con `E2E_DIST_DIR` aislado
 * (`.next-b9`, agregado a `.gitignore` ANTES del build), sobre la única variable
 * que cambia entre uno y otro — los 13 `rango="ventana-visible"` que las
 * secciones declaran (`docs/rediseno/outputs/b9/peso.json`):
 *
 *     sin los 13   65.111 B de chunks propios   61,9 KiB de lane   +0,06 de aire
 *     con los 13   65.423 B                     62,2 KiB           −0,24
 *
 * **312 B exactos.** Y contados por el otro camino, con `grep` sobre el chunk
 * minificado: **13 ocurrencias × 24 B** del literal `rango:"ventana-visible",`.
 * Las dos cuentas dan lo mismo a la unidad, o sea que **no hay efecto de segundo
 * orden del minificador**: el aumento es el literal y nada más.
 *
 * ── Qué compró ───────────────────────────────────────────────────────────
 *
 * Que **17 instancias** dejen de llegar a su estado final con el borde inferior
 * de su caja al ras del borde de abajo del cuadro. La mediana de aterrizaje del
 * sitio pasa de 0,932 a **0,737** a 1920 y de 0,911 a **0,700** a 1440; la
 * referencia aterriza en **0,70** (`B9-DELTAS.md` §2 y §4). Y el caso que lo
 * abrió: los cuatro bloques del diferencial estaban en opacidad **0** en el
 * `scrollY` donde su sección llena el cuadro exacto.
 *
 * ── ⚠️ LO QUE SE ACHICÓ ANTES: CINCO FORMAS, CADA UNA CON SU NÚMERO ───────
 *
 * Ninguna cierra, y por eso se paga. El ahorro de cada una está calculado sobre
 * el mismo literal minificado, contra un déficit de **246 B**:
 *
 *     `rango="en-cuadro"`                       −52 B   →  62,15   no cierra
 *     `rango="cuadro"`                          −91 B   →  62,11   no cierra, y pierde la palabra
 *     prop booleana `enCuadro`                 −156 B   →  62,05   no cierra, y deja
 *                                                                  `'del-patron'` sin nombre:
 *                                                                  el tipo pierde la mitad
 *                                                                  de su vocabulario
 *     no declararla en los 4 sitios donde es    −96 B   →  62,10   no cierra, y deja el
 *     un no-op comprobable                                         padrón con cuatro huecos
 *                                                                  sin motivo
 *     un envoltorio `<BloqueEnCuadro>`         ~−250 B  →  ~61,94  cierra por ~0,01 KiB
 *
 * **La quinta es la única que cierra, y por un margen de ~10 bytes.** Lo que
 * cuesta: una **segunda forma de declarar un bloque**, conviviendo con `Bloque`,
 * para que las dos hagan lo mismo con distinto nombre — y un margen tan fino que
 * el próximo byte lo vuelve a romper. Se descartó por eso, no por el ahorro.
 *
 * ── La alternativa, escrita ──────────────────────────────────────────────
 *
 * No aplicar la regla. Cuesta las 17 instancias de arriba y el caso capturado.
 * Por eso la decisión es **revocable**: revertir los 13 sitios devuelve los
 * 312 B y esta línea se borra.
 *
 * ── El reparto por dueño ─────────────────────────────────────────────────
 *
 * **Los 312 B son enteros de B9.** No hay una segunda línea como la de B7,
 * porque no hay nada heredado que separar.
 */

/**
 * ═══ RECIBO DE `MONTAJE_DE_B8_KIB` ═══════════════════════════════════════
 * B8 · LO QUE B8 MONTA — y es NEGATIVO: el velo pesaba más que la noche
 *
 * El recibo, con el mismo instrumento que la línea heredada
 * (`scripts-b8/peso.ts`, los mismos 5 chunks propios, el mismo preámbulo de
 * Sentry restado):
 *
 *   · `.next-b8` (el árbol mergeado antes de tocar producto): 65.350 B crudos,
 *     1.740 B de preámbulo → **63.610 B escritos por el lane**.
 *   · `.next` (el build final de B8): 65.258 B crudos, 1.740 B de preámbulo →
 *     **63.518 B escritos por el lane**.
 *
 * B8 SACÓ 92 B = 0,09 KiB: se fueron el velo (`velo.css` y su import en el
 * layout, la clase y los tokens) y entraron el arco con la noche (`lightArc.ts`),
 * el contraluz atado a la sala (`rimIntensityAt`), el brillo de las partículas
 * (`particleGlow.ts` y su uniform) y `SHADOW_FAR`. La línea va con su signo,
 * porque el techo viejo las resta todas: un montaje negativo que no se declarara
 * dejaría 92 B de aire sin dueño, que es exactamente lo que la regla no permite.
 */

/**
 * ═══ RECIBO DE `HEREDADO_SIN_DECLARAR_KIB` — LAS CUATRO MEDICIONES ═══════
 *
 * ⚠️ **NINGUNA DE LAS TRES PRIMERAS VALE PARA ESTE ÁRBOL.** Quedan escritas
 * enteras, con la razón por la que no valen, porque es lo único que impide que
 * alguien las vuelva a sumar. La vigente es la cuarta.
 *
 * ── (1) y (2) · B7 midió 0,15 y B6-A midió 1,35, sobre el MISMO commit ────
 *
 * Los dos bloques corrieron en paralelo sobre `5ecfbe55` (B5) y cada uno publicó
 * su propio heredado **porque midieron en dos entornos que dieron 1,16 KiB de
 * diferencia sin atribuir**, con las mismas versiones de `next`, `@sentry/nextjs`
 * y `react`. Los recibos completos de las dos están en
 * `s5-presupuesto-recibos.ts`, cada uno al pie del montaje de su bloque.
 * **Medidas en otro árbol y en otro entorno: no se suman.**
 *
 * ── (3) · B8 · LAS DOS LÍNEAS HEREDADAS SE VUELVEN UNA, medida sobre el ───
 * ──       árbol mergeado                                                  ──
 *
 * B7 y B6-A corrieron en paralelo sobre el MISMO commit (5ecfbe55) y cada uno
 * publicó su propio heredado —0,15 en el worktree de B7, 1,35 en el de B6-A—
 * porque midieron en dos entornos que dieron 1,16 KiB de diferencia sin
 * atribuir. El merge de las dos ramas (`cda07be1`) no puede llevar dos líneas
 * heredadas: es UN árbol y tiene UN peso. B8 lo re-midió con un build aislado
 * del árbol mergeado ANTES de tocar producto (`.next-b8`) y deja UNA línea con
 * el número de este entorno.
 *
 * **El recibo** (`scripts-b8/peso.ts .next-b8`, el mismo reparto y la misma
 * resta del preámbulo que este invariante): 5 chunks propios · 65.350 B crudos
 * · 1.740 B de preámbulo de Sentry · **63.610 B escritos por el lane = 62,119
 * KiB**. Las líneas con nombre suman 60 + 1,25 + 0,55 + 0,25 = 62,05 KiB =
 * 63.539 B. Lo que queda sin dueño en este entorno son **71 B = 0,07 KiB**: ni
 * los 0,15 de B7 ni los 1,35 de B6-A, que eran de otros entornos.
 *
 * ⚠️ **Los 0,07 heredados los midió B8 sobre un árbol que NO incluía a B9.** El próximo
 * sprint que toque el peso los re-mide sobre el árbol mergeado. Ese sprint fue
 * B10, y su medición está abajo. **Medida en otro árbol: no se suma.**
 */

/**
 * ═══ (4) · B10 · LA MEDICIÓN VIGENTE, SOBRE EL ÁRBOL DE LAS CUATRO RAMAS ═
 *
 * **Es el número que lleva la constante.** Las tres de arriba se midieron sobre
 * árboles que ya no existen; ésta se midió sobre éste.
 *
 * ── ⚠️ LOS 62,4 CONTRA 62,03 ERAN DOS COSAS DISTINTAS, Y SE SEPARAN ──────
 *
 * Al mergearse las cuatro ramas, `s5-peso` daba **62,4 KiB reales contra 62,03
 * declarados**: un desvío de **345,3 B**. Parecía una sola falla y eran dos, con
 * dueños y arreglos distintos. La cuenta las parte a la unidad:
 *
 *     317,4 B  = LA CAUSA · `MONTAJE_DE_B9_KIB` no se sumaba
 *      27,8 B  = lo que SÍ era el heredado medido en otro árbol
 *     ─────────
 *     345,3 B  = 63.864 escritos − 62,03 KiB declarados
 *
 *   · **La causa de ESA falla fue un defecto del merge en el sumatorio, no la
 *     medición.** `MONTAJES_DECLARADOS_KIB` quedó con la forma que traía B8
 *     —escrita cuando B9 todavía no estaba en el árbol— y **`MONTAJE_DE_B9_KIB`
 *     no entraba en la suma**. La constante existía, con su valor de origen
 *     (0,31), y no se sumaba: 317,4 B de los 345,3. Restituirla es lo que hizo
 *     B10, y sola habría dejado el techo en 62,34 contra 62,367 reales.
 *   · **Los 27,8 B que quedaban SÍ son el problema de los árboles distintos**, y
 *     por eso hubo que re-medir y no alcanzaba con arreglar: la línea heredada
 *     llevaba los 0,07 (71,7 B) que B8 midió sobre el árbol mergeado **sin B9
 *     adentro**, y sobre este árbol el residuo real es 99,5 B. La diferencia es
 *     exactamente 27,8 B.
 *
 * ⚠️ **Que la causa de la falla haya sido el sumatorio no absuelve al método.**
 * Las seis líneas siguen habiéndose medido sobre árboles distintos —B7 y B6-A en
 * dos entornos que dieron 1,16 KiB de diferencia sin atribuir, B9 en el suyo, B8
 * sobre el mergeado sin B9— y sumar esas cifras sigue siendo aritmética sobre
 * números no comparables. Eso es lo que esta re-medición cierra para el heredado,
 * y lo único que lo cierra para los otros cinco es volver a medirlos acá.
 *
 * El techo NO se tocó: sigue en 60 y cada montaje se le resta.
 *
 * ── El reparto completo (`scripts-b8/peso.ts .next-b10`) ──────────────────
 *
 * Un build de producción en primer plano sobre este árbol, con `distDir`
 * aislado (`.next-b10`, agregado a `.gitignore` ANTES del build), el mismo
 * instrumento que usó B8, los mismos chunks propios y la misma resta del
 * preámbulo de Sentry:
 *
 *     5 chunks propios                       65.604 B crudos
 *     − preámbulo de Sentry (5 × 348 B)       1.740 B
 *     = ESCRITO POR EL LANE                  63.864 B  =  62,367 KiB
 *
 * ── Y la resta: lo escrito menos las seis líneas con nombre ───────────────
 *
 *     60 + 1,25 + 0,55 + 0,25 + 0,31 − 0,09  =  62,27 KiB  =  63.764 B
 *     63.864 − 63.764                        =  **99,5 B  =  0,097 KiB**
 *
 * Se declara **0,10**: los 0,097 medidos redondeados al centésimo de arriba, que
 * es la misma convención con la que B8 declaró sus 70,8 B como 0,07. Quedan
 * **2,9 B de aire**, y con eso la afirmación cierra sola: 62,367 contra 62,37.
 *
 * ── ⚠️⚠️ EL MARGEN QUEDÓ EN 2,9 BYTES — ADVERTENCIA OPERATIVA ────────────
 *
 * **Es el más fino de la historia de este presupuesto.** B4-A corrió con 0,11
 * KiB, B6-A y B7 con 0,03, B8 con 0,9 B. Hoy son **2,9 B: el próximo byte lo
 * rompe.**
 *
 * **Y eso es lo que el archivo quiere que pase.** El margen no es una reserva
 * para gastar: es el techo viejo de 60 KiB vigilando todo lo que NO está
 * declarado, y un margen que se puede gastar sin declarar nada es exactamente el
 * presupuesto que sube solo que estas líneas existen para impedir.
 *
 * ⚠️ **Consecuencia para el próximo sprint que agregue una línea de producto a
 * `/v3`: va a chocar contra esto.** Las dos salidas legítimas son **declarar su
 * montaje** —una línea con nombre, con su medición A/B, lo que se achicó antes y
 * la alternativa escrita, como las seis de arriba— o **re-medir** el heredado
 * sobre su árbol, con el instrumento y el reparto de acá. **La salida que NO
 * existe es subir el techo**: los 60 KiB no se tocan, y un byte que crezca sin
 * línea que lo cubra tiene que poner la comprobación en rojo. Si te encontrás
 * queriendo mover el 60, el sprint está mal planteado.
 *
 * ── ⚠️ CRECIÓ 28,5 B CONTRA LOS 71 DE B8, Y DE DÓNDE PUEDE VENIR ─────────
 *
 * **No se esconde acá dentro.** Lo que la resta entre árboles dice —y es
 * aritmética entre árboles, o sea exactamente la clase de cuenta que este recibo
 * declara inválida, sirve para acotar y no para atribuir—: B8 midió 63.518 B
 * sobre `v3/luz` y este árbol da 63.864, o sea **+346 B**, de los cuales 312 son
 * la regla del rango que B9 declara. Sobran **~34 B**.
 *
 * El candidato tiene nombre: entre `v3/luz` y este árbol, B9 tocó **15 archivos
 * de producto** bajo `src/app/v3` —`tu-panel/soporte.ts` es nuevo, y hay cambios
 * en `Cierre.tsx`, `PorQueDevelop.tsx`, `QuienesSomos.tsx`, `TuPanel.tsx`,
 * `Numeros.tsx`, `Cifra.tsx`, los tres `asentamiento.ts`, `bloqueAnimado.ts`,
 * `coreografia-animada.tsx`, `coreografia.tsx`, `contenido.ts` y `soporte.ts`—,
 * y **su A/B aisló SÓLO los 13 literales del rango**: construyó el mismo árbol
 * con y sin ellos. El resto de su trabajo nunca tuvo una línea con nombre.
 *
 * ── ⚠️ POR QUÉ ESTE RECIBO NO SE LOS APROPIA, Y QUÉ LOS CERRARÍA ─────────
 *
 * **No se los apropia porque la cuenta de arriba es una resta entre árboles, y
 * una resta entre árboles sirve para ACOTAR, no para ATRIBUIR.** Es exactamente
 * la aritmética que este mismo recibo declara inválida seis párrafos más arriba:
 * si sumar cifras medidas en árboles distintos no vale para construir el techo,
 * restarlas tampoco vale para ponerle dueño a 34 bytes. Lo que la resta da es una
 * cota —el residuo está en el orden de las decenas de bytes, no de los cientos— y
 * un candidato con nombre. Escribirlo como atribución sería fabricar una línea
 * con nombre a partir de un número que no la sostiene, que es peor que no
 * tenerla: una línea falsa no se revoca nunca porque nadie sabe qué revocar.
 *
 * **Lo que lo cerraría, con su forma exacta:** un A/B sobre ESTE árbol, con el
 * instrumento y el `distDir` aislado de acá, entre el árbol tal como está y el
 * mismo árbol con el producto de B9 revertido — los 15 archivos listados arriba,
 * dejando los 13 literales del rango donde están, porque ésos ya tienen línea.
 * El delta de ese par de builds es el número que le falta a B9, y con él se
 * escribe su segunda línea con nombre y el heredado baja lo que corresponda.
 *
 * **Es un pedido con número, no una sospecha:** hay ~34 B sin línea, se sabe de
 * quién pueden ser, y se sabe qué build hay que correr para saberlo. Queda
 * escrito acá porque **un heredado que crece cada merge deja de ser una cifra y
 * pasa a ser un cajón**.
 *
 * ── Los dos controles de que la medición no es del instrumento ────────────
 *
 *   · **La regla del rango sigue en el chunk**: 13 ocurrencias de
 *     `rango:"ventana-visible",` en el chunk de `page` y 0 en los otros cuatro,
 *     que es el segundo camino de conteo de B9, reproducido sobre este árbol.
 *   · **Dos builds del mismo árbol coinciden byte a byte**: `.next` (anterior a
 *     la mudanza de prosa de B10) y `.next-b10` dan los MISMOS 63.864 B, con
 *     cuatro de los cinco chunks idénticos en MD5 y el quinto idéntico a partir
 *     del byte 349 — lo único que cambia es el `_sentryDebugId`, que es un UUID
 *     por build y mide lo mismo. **Mudar prosa costó exactamente 0 bytes.**
 */
