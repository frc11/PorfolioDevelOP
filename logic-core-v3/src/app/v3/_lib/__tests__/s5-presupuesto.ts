/**
 * EL PRESUPUESTO DE PESO DE `/v3` — LAS OCHO LÍNEAS, UNA POR DUEÑO.
 *
 * Acá viven **los números**; en `s5-peso.invariant.ts`, **la medición que los
 * compara contra el build**. Cada constante lleva un docblock corto —qué es,
 * cuánto, quién lo decidió— y **un puntero a su recibo completo**, que es donde
 * está la medición, lo que se achicó antes de subirla, la alternativa descartada
 * y el reparto por dueño. Los recibos viven en `s5-presupuesto-recibos.ts` (el
 * techo, B4-A, B7 y B6-A), en `s5-presupuesto-recibos-del-merge.ts` (B9, B8 y
 * el heredado) y en `s5-presupuesto-recibos-de-b11.ts` (B11); se mudaron ahí en
 * B10, cuando este archivo llegó a 356 líneas al resolverse a mano el merge de
 * las cuatro ramas. **Se mudó el texto: las constantes y sus valores no se
 * tocaron.**
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Cada aumento es **una línea con nombre y con su dueño**, y el techo original
 * de 60 KiB sigue vivo restándolas todas: un byte que crezca sin declararse no
 * tiene línea que lo cubra y pone la comprobación en rojo igual.
 *
 * ⚠️⚠️ **EL MARGEN ERA DE 2,9 BYTES, Y B11 FUE EL SPRINT QUE CHOCÓ CON ÉL:**
 * movió tres piezas de texto de donde pasa el logo, subió dos tintas a plena y
 * el lane creció 25 B netos. Hizo lo que estas líneas piden —declaró su montaje
 * con su A/B sobre el mismo árbol, su reparto byte a byte y su alternativa
 * escrita (`s5-presupuesto-recibos-de-b11.ts`)— y **el techo de 60 no se
 * movió.** El margen de hoy son **8,6 B** —63.889 escritos contra 62,40 de
 * techo—, fino a propósito. Si estás acá porque agregaste una línea de producto y `s5-peso` se
 * puso en rojo, las dos salidas son **declarar tu montaje** (con su A/B, lo que
 * achicaste antes y la alternativa escrita) o **re-medir el heredado** sobre tu
 * árbol. **Subir el techo de 60 no es una salida.** Está desarrollado en
 * `s5-presupuesto-recibos-del-merge.ts`.
 */

/**
 * EL TECHO DEL LANE: **60 KiB** de lo que `/v3` escribe en su carga inicial.
 * Es la suma de dos medidos —los 30 KiB que S1 fijó para el esqueleto más lo
 * que agregan las ocho secciones—, y cubre ocho porque el sistema de motion
 * dejó de bajar estáticamente. **No se mueve**: cada montaje se le resta.
 *
 * Recibo completo, con la cuenta y con los 1,36 KiB de preámbulo de Sentry que
 * se restan sin aflojarlo: `s5-presupuesto-recibos.ts`.
 */
export const PRESUPUESTO_DEL_LANE_KIB = 60

/**
 * **+1,25 KiB** — lo que B4-A monta: la marca en sus tres superficies (los ocho
 * rótulos, el pie, la pastilla) y la meseta de Trabajos. 1,200 medidos entre dos
 * builds, y con eso el techo queda en 61,25 con 0,11 KiB de aire sobre lo que el
 * lane escribe. **Lo decidió el humano en la parada de B4-A**, con la
 * alternativa escrita: no montar la marca.
 *
 * Recibo completo, con los 503 B que se achicaron antes: `s5-presupuesto-recibos.ts`.
 */
export const MONTAJE_DE_B4A_KIB = 1.25

/**
 * **+0,55 KiB** — lo que B7 arregla: el proveedor de `prefers-reduced-motion`
 * en el layout de `/v3`. 0,52 medidos A/B entre tres builds del mismo árbol más
 * 0,03 de aire. **Lo decidió el humano en la parada de B7.** Sin él, 2.450
 * transformadas corren igual con la preferencia puesta.
 *
 * Recibo completo, con el reparto por dueño que estrenó B7:
 * `s5-presupuesto-recibos.ts`.
 */
export const ARREGLO_DE_B7_KIB = 0.55

/**
 * **+0,25 KiB** — lo que B6-A monta: la cuarta superficie, la que deja ver la
 * escena en Trabajos y en el Cierre. 225 B medidos entre dos builds más 0,03 de
 * aire. **Lo decidió el humano en la PARADA 2 de B6-A**, con la alternativa
 * escrita: poner la clase a mano en las dos secciones.
 *
 * Recibo completo: `s5-presupuesto-recibos.ts`.
 */
export const MONTAJE_DE_B6A_KIB = 0.25

/**
 * **+0,31 KiB** — lo que B9 monta: la regla del rango en 13 sitios. 312 B
 * contados por dos caminos que coinciden a la unidad, declarados 0,31. **Lo
 * decidió el humano en la parada de B9**, con las cinco formas más baratas
 * medidas y descartadas una por una.
 *
 * Recibo completo, con las cinco y con lo que compra: `s5-presupuesto-recibos-del-merge.ts`.
 */
export const MONTAJE_DE_B9_KIB = 0.31

/**
 * **−0,09 KiB** — lo que B8 monta, y va con signo NEGATIVO: el velo pesaba más
 * que la noche. 92 B menos, medidos entre el árbol mergeado y el build final.
 * Un montaje negativo que no se declarara dejaría 92 B de aire sin dueño.
 *
 * ⚠️ **No es un error de signo.** Recibo completo, con qué salió y qué entró:
 * `s5-presupuesto-recibos-del-merge.ts`.
 */
export const MONTAJE_DE_B8_KIB = -0.09

/**
 * **+0,03 KiB** — lo que B11 monta: el texto corrido de donde pasa el logo, con
 * dos tintas de Quiénes somos subidas a plena. 25 B netos medidos A/B entre dos
 * builds del MISMO árbol y el mismo entorno —`.next-b11` antes de tocar producto
 * (63.864 B escritos, los mismos que midió B10) y `.next` después (63.889)— con
 * la única variable que cambia, y atribuidos byte a byte sobre el chunk
 * minificado: +27 la caja de la foto, +34 su epígrafe alineado a la derecha, +2
 * las celdas de Números, 0 el renglón de Trabajos, −38 las dos clases
 * `opacity-casi` que se fueron. Declarados 0,03 con la convención de B8 y B10
 * (al centésimo de arriba). **Lo decidió el humano en las dos paradas de B11**,
 * con la alternativa escrita: no mover la foto ni su epígrafe (−61 B, y el
 * marcador de la foto se queda el 100 % bajo el logo en los tres anchos).
 *
 * Recibo completo, con las formas más baratas medidas y con por qué el primer
 * build de B11 dio 63 B: `s5-presupuesto-recibos-de-b11.ts`.
 */
export const MONTAJE_DE_B11_KIB = 0.03

/**
 * **+1,36 KiB** — lo que B12 monta, y es la línea más grande que este techo
 * llevó. **1.393 B**, medidos A/B entre builds del MISMO árbol y el mismo
 * entorno, apagando cada pieza en el árbol de trabajo sólo durante la medición y
 * restaurándola byte a byte (SHA-1 de `Trabajos.tsx` antes y después:
 * `79484340…`). El reparto completo, con la alternativa de cada renglón y la
 * medición que se descartó, en `s5-presupuesto-recibos-de-b12.ts`:
 *
 *     LA GOTA            +1.304 B   la transición de entrada a la noche
 *     LA BANDA DEL PIE     +176 B   el velo local que cierra 16 bloques del pie
 *     EL RESTO, NETO         −87 B  los rótulos afuera, el pie sin relleno,
 *                                   la portada, el centrado, el corte de piezas
 *
 * ⚠️ **Las dos piezas que pagan son NUEVAS y las dos las pidió el humano por su
 * nombre** —«un efecto de gota o algo exótico y deluxe» y «un velo LOCAL en la
 * banda del pie»—; el resto del bloque DEVUELVE bytes. Que la resta de §1, §2 y
 * §3 dé −87 es lo que hace que la decisión sea limpia: lo único que se paga es
 * lo que se agregó.
 *
 * ⚠️ **Autorizado en 1,28 KiB y declarado en 1,36, con la diferencia escrita.**
 * El humano subió el techo en la PARADA 1 con la cifra que había ahí: la gota
 * sola. En la misma parada pidió probar la banda y dejarla si cerraba —cerró, de
 * 8 bloques bajo AA a 4 y 2— y la banda son 176 B más. No se esconde en el
 * redondeo ni en el heredado: es su propio renglón del recibo.
 *
 * Al centésimo de arriba, con la convención de B8, B10 y B11: 1.384,4 B de
 * desvío / 1024 = 1,3520 → **1,36**, que deja 8,2 B de aire, los mismos 8,6 que
 * B11 dejó dentro del redondeo.
 */
export const MONTAJE_DE_B12_KIB = 1.36

/**
 * **+0,69 KiB** — lo que monta el hilo del titular del hero, en sus DOS pasadas.
 * **706 B**, y es el que chocó contra el margen que B12 dejó y después contra el
 * suyo propio: la primera pasada midió **614 B** (el noveno nivel, el quinto
 * peso, las dos cadenas de clase, el atributo del CTA) y el ajuste de la línea 2
 * agregó **91,6 B** más —el décimo nivel de la escala, con su fila de seis
 * campos en la tabla que las ocho secciones importan— medidos por el mismo
 * invariante sobre el mismo árbol.
 *
 * El reparto por pieza y el método —con lo que NO se pudo medir y por qué— está
 * en `s5-presupuesto-recibos-del-titular.ts`. En una línea: son DOS niveles de
 * escala viajando en la tabla de `tipografia.ts` que los componentes importan,
 * el quinto peso, las dos cadenas de clase del titular y el atributo
 * `data-registro` del CTA con su default; menos lo que devuelven la bajada
 * —que bajó de tres renglones a uno— y la línea 1, que dejó de pasar por un
 * canal al volverse la pieza quieta.
 *
 * ⚠️ **LO QUE ESTA LÍNEA COMPRA, Y POR QUÉ NO HABÍA UNA MÁS BARATA.** Las dos
 * piezas que pagan son las dos que el pedido nombra por su nombre —«la línea 1
 * en Archivo, peso alto y ancho condensado» y «la línea 2 en Chivo Light
 * itálica»— y cada una necesita, para existir, un token que el sistema no tenía:
 * un nivel de tamaño y un peso. Las dos alternativas medidas y descartadas:
 *
 *   · **Usar `titulo-xl` (56 px) para la línea 1** y no agregar el noveno nivel.
 *     Devuelve el nivel entero, pero deja 30,6 px de la caja sin usar y rompe el
 *     pedido, que dice «el más grande que entre en UNA línea». Es la alternativa
 *     barata y NO es la pedida.
 *   · **No traer la itálica de Chivo** y dejar que el navegador sintetice la
 *     oblicua. Devuelve el quinto peso y los 10,91 KiB del binario, pero a 44 px
 *     una oblicua falsa no es la itálica de Omnibus-Type (−8,05° declarados y
 *     dibujos propios), que es lo que el pedido nombra.
 *
 * ⚠️ **Y el techo de 60 NO se movió**, como en B11 y B12: esto es una línea con
 * nombre que se le resta. Al centésimo de arriba, con la convención de B8, B10,
 * B11 y B12: 706 / 1024 = 0,6895 → 0,69, que dejaba **0,6 B de aire**.
 *
 * ⚠️⚠️ **ES LA SEGUNDA VEZ QUE ESTA LÍNEA SE MUEVE, Y SE DICE.** La primera
 * pasada la dejó en 0,60 con 0,4 B de aire; el ajuste de la línea 2 se la comió
 * entera y 91,2 B más. Que el margen vuelva a quedar en menos de un byte NO es
 * un descuido de método: es la convención del centésimo de arriba cayendo dos
 * veces seguidas del lado malo.
 *
 * ✅ **LA TERCERA VEZ ES LA APROBADA: 0,69 → 0,70, en la parada de PESO-1.** El
 * aire pasa de 0,6 B a **10,8 B**, el orden de B11 (8,6) y B12 (8,2) y por encima
 * del umbral de aire útil de 8 B que `s5-presupuesto-recibos-del-titular.ts`
 * declara. **El techo de 60 sigue sin moverse**: lo que sube es esta línea con
 * nombre, y sigue siendo revocable sola. Cuesta 10,2 B de techo que este hilo no
 * usa, y esa deuda se declara ahí mismo.
 *
 * ⚠️ **Lo que esta línea NO arregla, y hay que decirlo:** el lane estaba **12,4 B
 * arriba del techo**, y estos 10,24 B no alcanzan. Los 2,2 B que quedan **no son
 * de este hilo**: son de TAPADO-1, que cambió producto (`Hero.tsx`) y no declaró
 * su línea. La medición y la propuesta están en
 * `s5-presupuesto-recibos-de-tapado.ts`, esperando su parada.
 */
export const MONTAJE_DEL_TITULAR_KIB = 0.7

/**
 * **+0,04 KiB** — lo que MOVIL-1 monta en la CARGA INICIAL al bajar la escena
 * abajo de 1025. **31,0 B**, medidos A/B entre dos builds de producción del
 * MISMO árbol en la MISMA máquina, con una sola variable: los cinco archivos de
 * producto devueltos a `HEAD` con `git show` para el «antes» y restaurados desde
 * una copia fuera del árbol, verificados byte a byte con sha256 antes de
 * construir. `s5-peso` leyó **0,6 B de aire** en el «antes» y **−30,4 B** en el
 * «después».
 *
 * ⚠️ **31 BYTES POR UN CUARTO DE MEGA, Y NO ES UN ERROR DE UNIDADES.** Lo que la
 * escena le suma a un teléfono son **259,83 KiB**, y esta línea dice 31 B porque
 * **este techo mide otra cosa**: la carga inicial, o sea los `<script src>` del
 * HTML servido. El chunk de la escena **sigue siendo diferido** —`ssr: false` y
 * `import()`, sin tocar— así que no entra en esa cuenta ni antes ni después. Los
 * 31 B son la compuerta misma: el `import` de `calidad.ts`, la llamada a
 * `calidadPorAncho` y el `key`.
 *
 * La cifra grande está medida, repartida chunk por chunk y publicada en cada
 * corrida de `s5-peso` **como línea propia y sin sumarse a este techo**, con el
 * porqué desarrollado: sumarla dejaría el gate con 260 KiB de aire y sin
 * capacidad de ponerse en rojo. Todo el recibo —las dos cifras, el método del
 * swap, la trampa del `>` que truncó cinco archivos y el defecto de caché que
 * hizo bajar 79 KiB una medición— está en
 * `s5-presupuesto-recibos-de-movil.ts`.
 *
 * Al centésimo de arriba, con la convención de B8, B10, B11, B12 y el titular:
 * 31,0 / 1024 = 0,0303 → **0,04**, que deja **10,0 B de aire**, el mismo orden
 * que B11 (8,6) y B12 (8,2) y por encima del umbral de aire útil de 8 B.
 *
 * ⚠️ **Y el techo de 60 NO se movió.** Es una línea con nombre que se le resta, y
 * es revocable sola: revocarla es devolver el `return null` a la compuerta, que
 * es exactamente la decisión que el dueño dio vuelta.
 */
export const MONTAJE_DE_MOVIL_KIB = 0.04

/**
 * **+0,04 KiB** — lo que TAPADO-1 monta al bajar el texto del hero abajo del
 * breakpoint. **23,0 B**, medidos A/B entre dos builds de producción del MISMO
 * árbol en la MISMA máquina, con una sola variable: `_secciones/hero/Hero.tsx`
 * devuelto a `cdd7ae03` con `git show` y restaurado desde una copia guardada
 * FUERA del árbol, con el sha256 verificado. Lo que viaja es la cadena de clases
 * `justify-end … escritorio:justify-center` y las utilidades que Tailwind emite
 * por ella. Recibo completo en `s5-presupuesto-recibos-de-tapado.ts`.
 *
 * ⚠️ **ESTA LÍNEA LLEGA TARDE, y ésa es la mitad de lo que enseña.** TAPADO-1
 * cambió producto y no declaró nada, así que sus 23 B se los comió el techo de
 * los demás: el lane quedó 2,2 B en rojo y la línea del titular —que hablaba de
 * OTRA cuenta— pareció no alcanzar. La atribución costó dos builds
 * (`scripts-peso/a-atribuir.ts`). Un sprint que toca producto declara su línea
 * en el mismo acto, como hicieron B11 y MOVIL-1.
 *
 * 🔴 **Y ES LA PRIMERA LÍNEA QUE NACE CON LA REGLA DEL AIRE ÚTIL.** Al centésimo
 * de arriba, 23,0 / 1024 = 0,0225 → 0,03, que deja **7,7 B de aire: 0,3 B DEBAJO**
 * del umbral de `AIRE_MINIMO_UTIL_BYTES` (8 B). La parada de PAPEL-1 la subió al
 * centésimo siguiente —**0,04, con 17,96 B de aire**— y escribió la regla que lo
 * autoriza: *una línea nueva no nace por debajo del umbral de aire útil; si el
 * centésimo de arriba la deja abajo, se sube al siguiente y se dice*. La regla,
 * con su alcance y con lo que NO autoriza, está en el recibo.
 *
 * ⚠️ **El techo de 60 NO se movió.** Es una línea con nombre que se le suma, y es
 * revocable sola: revocarla es devolver `justify-center` a todos los anchos, que
 * es exactamente la composición que TAPADO-1 midió y descartó.
 */
export const MONTAJE_DE_TAPADO_KIB = 0.04

/**
 * **+0,05 KiB** — lo que TEXTO-2 monta al corregir el alcance del `col-span` del
 * titular, bajar los dos huecos del bloque abajo de 1025 y acortar la bajada.
 * **40,0 B**, medidos A/B entre dos builds de producción del MISMO árbol en la
 * MISMA máquina, con una sola variable: los cuatro archivos del hero devueltos a
 * `HEAD` (`4009d327`) con `git show` y restaurados desde copias guardadas FUERA
 * del árbol, con los cuatro sha256 verificados. `s5-peso` leyó **38,8 B de aire**
 * en el «antes» y **−1,2 B** en el «después». Recibo completo, con el inventario
 * derivado y con el control que cierra la cadena hasta TAPADO-1, en
 * `s5-presupuesto-recibos-de-texto2.ts`.
 *
 * ⚠️ **Ninguna de las cinco clases nuevas estrena una regla de CSS**, y está
 * verificado sobre el `.css` construido: `tablet:col-span-3`,
 * `escritorio:col-span-2`, `gap-2`, `escritorio:gap-8` y `escritorio:gap-6` ya se
 * emitían para otras secciones. Lo que viaja son cadenas más largas en el chunk
 * y una clave más en `GEOMETRIA`, contra los 16 caracteres que devuelve la
 * bajada.
 *
 * 🔴 **Es la SEGUNDA línea que nace con la regla del aire útil**, y el caso es
 * más claro que el de TAPADO-1: al centésimo de arriba —0,04, la convención sin
 * excepciones— quedan **0,96 B de aire**, 7,04 B debajo del umbral de 8. Al
 * siguiente —0,05— quedan **11,2 B**, el mismo orden que B11 (8,6), B12 (8,2),
 * el titular (10,8) y MOVIL-1 (10,0).
 *
 * ⚠️ **El techo de 60 NO se movió.** Es una línea con nombre que se le suma, y es
 * revocable sola: revocarla es devolver `tablet:col-span-2`, los dos huecos a
 * 32/24 en todos los anchos y la bajada de 49 caracteres.
 */
export const MONTAJE_DE_TEXTO2_KIB = 0.05

/**
 * **+0,22 KiB** — lo que TEXTO-3 monta al tapar la escena en la banda angosta.
 * **216,0 B**, medidos A/B entre dos builds de producción del MISMO árbol en la
 * MISMA máquina, con una sola variable: nueve archivos devueltos al árbol de
 * TEXTO-2 —cinco desde `HEAD` y dos desde el respaldo que aquel sprint dejó
 * fuera del árbol, con su sha256 verificado contra el recibo—. `s5-peso` leyó
 * **50,0 B de aire** en el «antes» y **−166,0 B** en el «después».
 *
 * ⚠️ **Y el «antes» reproduce el cierre de TEXTO-2 al décimo de byte** (66.090,2
 * contra 66.090,2, desvío −0,0), que es lo que prueba que la resta aísla ESTE
 * sprint y no arrastra el anterior. Recibo completo, con el método de las dos
 * fuentes, en `s5-presupuesto-recibos-de-texto3.ts`.
 *
 * ⚠️ **Son muchos bytes para lo que compran, y se dice:** un fondo que se pinta
 * en una banda de 55 px de ancho cuesta la quinta línea más grande del tablero.
 * Lo que se paga es el MECANISMO —un campo en el tipo del recorrido, una tabla
 * de clases, una rama en el panel y un atributo—, no la decisión: la segunda
 * sección que declare banda angosta ya lo encuentra pago.
 *
 * ⚠ El token `--breakpoint-angosto` y su regla NO están en esta cuenta: son CSS,
 * y este techo mide sólo los `<script src>` de la ruta.
 *
 * Al centésimo de arriba: 216,0 / 1024 = 0,2109 → **0,22**, que deja **9,3 B de
 * aire**, arriba del umbral de 8. Es la primera de las tres últimas líneas que
 * no necesita la regla del aire útil.
 *
 * ⚠️ **El techo de 60 NO se movió.** Revocarla es sacar `superficieAngosta` de la
 * fila del Hero: la escena vuelve a verse a 320, que es la composición que este
 * sprint midió y descartó.
 */
export const MONTAJE_DE_TEXTO3_KIB = 0.22

/**
 * **+0,59 KiB** — lo que COMPO-1 monta: **diez ajustes de composición del Hero
 * pedidos por el dueño mirando el sitio**, de los cuales seis dejan bytes en la
 * carga inicial (el titular en tres filas, la bajada en dos y un escalón más
 * grande, el CTA alineado, la columna lateral colapsada abajo de 1025 y el aire
 * del pie en portátil).
 *
 * **589,0 B**, medidos A/B entre dos builds de producción del MISMO árbol en la
 * MISMA máquina, con una sola variable: once archivos devueltos al árbol de
 * TEXTO-3 —ocho desde el respaldo que este sprint copió fuera del árbol antes de
 * tocar nada, uno desde `HEAD` con su `git status` publicado, y uno que se
 * borra porque en el «antes» no existía—. ⚠ El A/B se corrió DOS veces: la
 * primera dio 573 B y la medición del navegador encontró después que
 * `medio:mb-4` llegaba a 1440 y a 1920 (una variante de ancho es `min-width` y
 * no se apaga sola), así que la corrección agregó 16 B. Lo que sostiene la línea
 * es la RESTA, que no depende del techo.
 *
 * ⚠️ **Y el «antes» reproduce el cierre de TEXTO-3 al décimo de byte** (66.306,2
 * contra 66.306,2, desvío 0,0), que es lo que prueba que la resta aísla ESTE
 * sprint y no arrastra los tres sin commitear que tiene debajo. Recibo completo
 * en `s5-presupuesto-recibos-de-compo1.ts`, con el inventario derivado y con los
 * sha256 del árbol de TEXTO-3 para el sprint que venga.
 *
 * ⚠️ **Es la CUARTA línea más grande del tablero —detrás de B12, B4-A y el
 * titular—, y se dice por qué.** No es un
 * mecanismo nuevo: son seis cadenas de clase y ocho claves de geometría adentro
 * de un objeto que viaja entero. **Y se dice también qué se podría haber
 * achicado**: tres de esas ocho claves las lee sólo el invariante y sacarlas
 * ahorraría ~84 B, el 15 %; no se hizo porque volverlas literales escritos a
 * mano es el defecto que `padron-de-tokens.ts` documenta.
 *
 * ⚠ El token `--text-display-xl-angosto` y su regla NO están en esta cuenta: son
 * CSS, y este techo mide sólo los `<script src>` de la ruta.
 *
 * Al centésimo de arriba: 589,0 / 1024 = 0,5752 → 0,58, que deja **4,9 B** de
 * aire, **3,1 B debajo** del umbral de 8. Así que se aplica la regla del aire
 * útil —la que estrenó TAPADO-1— y la línea sube un centésimo: **0,59**, con
 * **15,2 B**.
 *
 * ⚠️ **El techo de 60 NO se movió.** Revocarla es deshacer los seis cambios que
 * viajan, o sea volver exactamente a la pantalla que el dueño pidió cambiar.
 */
export const MONTAJE_DE_COMPO1_KIB = 0.59

/**
 * **+0,76 KiB** — lo que PAPEL-2 monta: **la marca arriba del titular en los
 * anchos de papel**, más el papel extendido a 375, el registro 1 igualado al
 * registro 2 y la pastilla apagada. **764,0 B** de desvío medidos A/B entre dos
 * builds del mismo árbol.
 *
 * ── ⚠️ EL REPARTO ES MEDIDO, NO DERIVADO, Y PARTE LA LÍNEA EN DOS ─────────
 *
 * Se corrió un TERCER build —el árbol de cierre con la marca quitada— para que
 * la pieza cara se pueda revocar sola sin adivinar cuánto vale:
 *
 *     «antes» (árbol de COMPO-1)              66.895,2 B
 *     sin la marca (§1 + §3 + §5)             67.063,2 B   +168,0
 *     cierre (todo)                           67.659,2 B   +764,0
 *     → LA MARCA SOLA (§2)                                  596,0 B
 *
 * O sea que **el 78 % de esta línea es la marca**, y adentro de ella manda una
 * sola cosa: los **493 caracteres** de `LOGO_PATH_D`, el path de
 * `public/logodevelOP.svg`. Un path vectorial es una cadena y un minificador no
 * la puede achicar.
 *
 * ⚠️ **Lo que se podría haber achicado, dicho con el número.** La marca viaja en
 * el chunk de cliente porque `Hero.tsx` lleva `'use client'`; montada desde un
 * componente de SERVIDOR costaría 0 B de JS (es lo que B12 midió para la marca
 * en pantalla). No se hizo porque pasarla por el contrato de secciones es
 * cambiarle la forma a las ocho, y eso no es de este sprint. **Queda como la
 * primera palanca para quien necesite estos 596 B.**
 *
 * ⚠ La alternativa barata —`<img src="/logodevelOP.svg">`— cuesta ~40 B de
 * marcado pero pierde `currentColor` (el path no declara `fill`, así que sale
 * negro y hay que invertirlo con un filtro), agrega un request y deja un hueco
 * mientras baja. Es lo que `LogoMark.tsx` documenta y por eso el sitio no la usa.
 *
 * ⚠️ **Y el «antes» reproduce el cierre de COMPO-1 al décimo de byte** (66.895,2
 * contra 66.895,2, desvío 0,0), que es lo que prueba que la resta aísla ESTE
 * sprint y no arrastra los cuatro sin commitear que tiene debajo. El «antes» se
 * RECONSTRUYÓ —no se copió de `HEAD` ni se sacó de un `stash`, que con
 * `core.autocrlf=true` reescribiría el árbol en CRLF— quitando de cada archivo
 * exactamente lo que el sprint le puso, con un `assert` por quite:
 * `scripts-papel/b-antes.mjs`, con los sha256 publicados.
 *
 * ⚠ Los tres tokens nuevos —`--breakpoint-chico`, `--text-display-r1-papel` y su
 * hermano angosto— y sus reglas NO están en esta cuenta: son CSS, y este techo
 * mide sólo los `<script src>` de la ruta.
 *
 * Al centésimo de arriba: 764,0 / 1024 = 0,7461 → 0,75, que deja **4,0 B** de
 * aire, **4,0 B debajo** del umbral de 8. Así que se aplica la regla del aire
 * útil —la que estrenó TAPADO-1— y la línea sube un centésimo: **0,76**, con
 * **14,2 B**.
 *
 * ⚠️ **El techo de 60 NO se movió.** Revocarla entera es volver a la pantalla que
 * el dueño pidió cambiar; revocar sólo la marca son 596,0 B y deja el resto en
 * pie, que es para lo que el tercer build existe.
 */
export const MONTAJE_DE_PAPEL2_KIB = 0.76

/**
 * **+0,19 KiB** — lo que COMPO-2 monta: **cinco ajustes de composición y una
 * regla global**. La marca del Hero ×2,63 y el bloque centrado en la banda de
 * papel, el registro 1 del titular crecido en 768 y en 1024 hasta sus dos
 * techos medidos, el renglón que la regla global le saca al bloque devuelto
 * como margen en 768–859, y la pastilla apagada hasta 860. **186,0 B** de
 * desvío medidos A/B entre dos builds del mismo árbol.
 *
 * ── ⚠️ ES LA LÍNEA MÁS CHICA DEL TABLERO DESPUÉS DE TAPADO-1, Y NO ES SUERTE
 *
 * Porque **la regla global DEVUELVE bytes**: la bajada deja de ser dos `<span>`
 * con un separador adentro de un envoltorio que conmutaba y pasa a ser un nodo
 * de texto, lo que saca **70 B** del chunk. Sin esa devolución la línea habría
 * sido 256 B. Es la segunda vez en el tablero que un sprint devuelve peso —la
 * primera fue B13— y por el mismo motivo: sacó marcado, no lo agregó.
 *
 * ⚠️ **Y el «antes» reproduce el cierre de PAPEL-2 al décimo de byte** (71.960,0
 * contra 71.960,0, desvío 0,0), **en un `distDir` distinto**, que es lo que
 * prueba a la vez que la reconstrucción es fiel y que el directorio de build no
 * mueve la cifra. El «antes» se RECONSTRUYÓ —no se copió de `HEAD` ni se sacó
 * de un `stash`, que con `core.autocrlf=true` reescribiría el árbol en CRLF—
 * quitando de cada archivo exactamente lo que el sprint le puso, con un
 * `assert` por quite: `scripts-compo2/c-antes.mjs`, con los sha256 publicados.
 *
 * ⚠ El ruido entre dos builds del MISMO árbol está medido y declarado: **9,0 B**
 * (72.155,0 en `.next-compo2` contra 72.146,0 en `.next`). La línea se calcula
 * con el par que el gate lee y el otro queda publicado en el recibo.
 *
 * ⚠ El token `--text-display-r1-portatil` y sus reglas NO están en esta cuenta:
 * son CSS, y este techo mide sólo los `<script src>` de la ruta.
 *
 * Al centésimo de arriba: 186,0 / 1024 = 0,1816 → **0,19**, que deja **8,6 B**
 * de aire, **por encima** del umbral de 8. Es la primera línea en cinco que NO
 * necesita la regla del aire útil.
 *
 * ⚠️ **El techo de 60 NO se movió.** El reparto completo, con el inventario
 * derivado y sus 15 B sin atribuir, está en
 * `s5-presupuesto-recibos-de-compo2.ts`.
 */
export const MONTAJE_DE_COMPO2_KIB = 0.19

/**
 * ⚠️ **+4,20 KiB — EL PESO DE LA LLAVE, Y NO ES UN MONTAJE DEL LANE.**
 *
 * Es lo que agrega el contenido inventado de B12 §4: las veinte casillas
 * falsas, la maquinaria que las hace reversibles y el tercer estado del marco de
 * medio. **4.303 B**, medidos A/B entre builds del MISMO árbol, apagando cada
 * pieza y restaurándola byte a byte. El reparto completo, con su método y con la
 * corrección que hay que leer, en `s5-presupuesto-recibos-de-la-llave.ts`:
 *
 *     LA MAQUINARIA        +2.422 B   las dos caras de cada casilla y sus 20 usos
 *     EL TEXTO INVENTADO   +1.064 B   las 20 cadenas de `mentira`
 *     LOS PLACEHOLDERS       +817 B   el tercer estado del marco y sus tres usos
 *     LA MARCA EN PANTALLA      0 B   es un componente de SERVIDOR
 *
 * ⚠️ **NO se suma a `MONTAJES_DECLARADOS_KIB`, y ésa es toda la idea.** El techo
 * del lane —60 del original más los siete montajes con nombre— **no se movió ni
 * un byte por §4** y se puede seguir leyendo solo: `s5-peso` resta esta línea
 * APARTE y dice en voz alta que la resta es andamio. La instrucción lo pide con
 * esas palabras: *«se declara como PESO DE LA LLAVE, aparte del montaje de B12…
 * No subas el techo.»*
 *
 * ⚠️ **Y la corrección, publicada: apagar la llave devuelve 0 bytes.** El A/B
 * con `CONTENIDO_INVENTADO` en `false` da **la misma cifra al byte**, porque
 * `INVENTOS` es un objeto en tiempo de ejecución y sus cadenas viajan igual.
 * Apagar devuelve la PANTALLA —los marcadores, la franja, el build— y lo que
 * devuelve los BYTES es borrar las veinte entradas de `_contrato/inventado.ts`.
 * Está medido: 1.064 B.
 *
 * Al centésimo de arriba, con la convención de B8, B10, B11 y B12: 4.303 / 1024
 * = 4,2021 → **4,20**, que deja **6,0 B de aire** bajo la línea.
 */
export const PESO_DE_LA_LLAVE_KIB = 4.2

/**
 * **+0,10 KiB** — lo que queda SIN DUEÑO después de restarle a lo escrito las
 * seis líneas de arriba. No es un montaje: es el residuo, y por eso **se publica
 * con atribución y no se afirma** (regla 13). **Medido por B10 sobre ESTE árbol,
 * el de las cuatro ramas mergeadas**: 63.864 B escritos − 62,27 KiB de líneas
 * con nombre = 99,5 B. B11 no lo re-midió y no hacía falta: el «antes» de su
 * A/B es exactamente el árbol que B10 midió, con los mismos 63.864 B.
 *
 * ⚠️ Va por su cuarta medición —0,15 en el worktree de B7, 1,35 en el de B6-A,
 * 0,07 en el árbol mergeado sin B9 que midió B8—, y **las tres primeras se
 * midieron en otros árboles: no se suman.** Creció 28,5 B contra la de B8, y de
 * dónde puede venir está escrito en el recibo. Recibo completo, con las cuatro
 * mediciones y la razón de cada una: `s5-presupuesto-recibos-del-merge.ts`.
 */
export const HEREDADO_SIN_DECLARAR_KIB = 0.10

/**
 * ⚠️ **TODO AUMENTO ES UNA LÍNEA CON NOMBRE, Y EL TECHO VIEJO LAS RESTA TODAS.**
 *
 * Es lo que impide que esto se convierta en un número que sube solo: el
 * presupuesto original de 60 KiB sigue vivo y se afirma **restando cada montaje
 * declarado**. Un byte que crezca sin declararse no tiene línea que lo cubra y
 * pone la comprobación en rojo igual.
 *
 * ⚠️ Son **los ONCE montajes más el heredado**, sin repetir ni faltar; la
 * decimotercera línea con nombre es el techo de 60, y se la suma
 * `PRESUPUESTO_PROPIO_KIB`.
 * MOVIL-1 agregó la suya en el mismo acto en que la declaró.
 * La de TAPADO-1 la agregó la parada de PAPEL-1, dos sprints tarde: el porqué
 * —y lo que costó— está en el docblock de `MONTAJE_DE_TAPADO_KIB`.
 * El merge de las cuatro ramas dejó este sumatorio con la forma que traía B8
 * —que se escribió cuando B9 todavía no estaba en el árbol— y **`MONTAJE_DE_B9_KIB`
 * quedó afuera**: la constante existía, con su valor de origen, y no se sumaba.
 * B10 la volvió a poner. B11 agregó la suya en el mismo acto en que la declaró.
 */
/**
 * ⚠️ **COMPO-1 · LAS LÍNEAS CON NOMBRE, ENUMERADAS — para que la CUENTA deje de
 * ser un literal.** `s5-peso` publicaba «las nueve líneas» escrito a mano y hacía
 * tres sprints que estaba viejo. La lista de acá es la misma que la suma de
 * abajo, en el mismo orden, y el instrumento cuenta sobre ella: una línea nueva
 * mueve el número sola.
 *
 * ⚠ `HEREDADO_SIN_DECLARAR_KIB` NO entra: no es una línea con nombre de nadie —
 * es lo heredado que se vigila y se publica con atribución, que es otra cosa.
 */
export const LINEAS_CON_NOMBRE: readonly (readonly [string, number])[] = [
  ['B4-A', MONTAJE_DE_B4A_KIB],
  ['B7', ARREGLO_DE_B7_KIB],
  ['B6-A', MONTAJE_DE_B6A_KIB],
  ['B9', MONTAJE_DE_B9_KIB],
  ['B8', MONTAJE_DE_B8_KIB],
  ['B11', MONTAJE_DE_B11_KIB],
  ['B12', MONTAJE_DE_B12_KIB],
  ['TITULAR', MONTAJE_DEL_TITULAR_KIB],
  ['MOVIL-1', MONTAJE_DE_MOVIL_KIB],
  ['TAPADO-1', MONTAJE_DE_TAPADO_KIB],
  ['TEXTO-2', MONTAJE_DE_TEXTO2_KIB],
  ['TEXTO-3', MONTAJE_DE_TEXTO3_KIB],
  ['COMPO-1', MONTAJE_DE_COMPO1_KIB],
  ['PAPEL-2', MONTAJE_DE_PAPEL2_KIB],
  ['COMPO-2', MONTAJE_DE_COMPO2_KIB],
]

export const MONTAJES_DECLARADOS_KIB =
  MONTAJE_DE_B4A_KIB +
  ARREGLO_DE_B7_KIB +
  MONTAJE_DE_B6A_KIB +
  MONTAJE_DE_B9_KIB +
  MONTAJE_DE_B8_KIB +
  MONTAJE_DE_B11_KIB +
  MONTAJE_DE_B12_KIB +
  MONTAJE_DEL_TITULAR_KIB +
  MONTAJE_DE_MOVIL_KIB +
  MONTAJE_DE_TAPADO_KIB +
  MONTAJE_DE_TEXTO2_KIB +
  MONTAJE_DE_TEXTO3_KIB +
  MONTAJE_DE_COMPO1_KIB +
  MONTAJE_DE_PAPEL2_KIB +
  MONTAJE_DE_COMPO2_KIB +
  HEREDADO_SIN_DECLARAR_KIB
export const PRESUPUESTO_PROPIO_KIB = PRESUPUESTO_DEL_LANE_KIB + MONTAJES_DECLARADOS_KIB
