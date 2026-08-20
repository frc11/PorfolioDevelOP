/**
 * EL RIG DE ILUMINACIÓN (S6) — los tres puntos y cómo se apagan.
 *
 * Salió de `probeScene.ts` porque dejó de ser "tres constantes de posición" para
 * ser un sistema con sus propias reglas. La curva que lo sube y lo baja a lo
 * largo del recorrido —`LIGHT_ARC`— vive en `choreography.ts`, con el resto de
 * lo que se calibra; acá está el rig que esa curva modula, y en
 * `probeAtmosphere.ts` la niebla, la sombra y la oclusión de contacto.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA DECISIÓN QUE ORDENA TODO: KEY Y FILL SON DEL ESPACIO, EL RIM ES DEL
 * OBSERVADOR
 * ════════════════════════════════════════════════════════════════════════════
 *
 * La principal y el relleno van **fijas al mundo**, que es la decisión de diseño
 * que el probe tomó desde el principio y que hay que conservar: con las luces
 * fijas, orbitar cambia la iluminación además del punto de vista, y por eso los
 * seis tramos pueden verse distintos entre sí. Si toda la luz viajara con la
 * cámara, todos los ángulos se verían igual de bien y el probe daría un falso
 * positivo.
 *
 * El contraluz va **solidario a la cámara**, y no es una excepción caprichosa:
 * las dos luces fijas resuelven un problema del ESPACIO (cómo está iluminada la
 * sala) y el rim resuelve uno de la VISTA (que el logo se despegue del fondo que
 * le toque detrás). Un problema de vista se resuelve con una luz de vista.
 *
 * ── Por qué el rim no puede ser fijo ───────────────────────────────────────
 *
 * Un contraluz solo hace de contraluz cuando está más o menos detrás del objeto
 * **desde donde se mira**. Fijo en un azimut, cubre una ventana de ±60° del
 * recorrido y en el resto es una luz frontal más. El recorrido da la vuelta
 * entera: dos tercios de la órbita se quedarían sin filo.
 *
 * Dos rims opuestos fijos tapan más, pero dejan huecos a 90° de los dos — que es
 * exactamente donde cae el medio giro de Demos. Solidario a la cámara no tiene
 * huecos por construcción.
 *
 * ── Verificado contra el recorrido real ────────────────────────────────────
 *
 * El recorrido pasa por ángulos de 0° a 360° y **alturas de +9 a −3,9**, así que
 * el rim tiene que seguir a la cámara en las dos cosas:
 *
 * - **Azimut.** `RIM_AZIMUTH_OFFSET_DEG` = 148°, o sea 32° corrido del eje de
 *   contraluz puro. A 180° exactos la luz pega en la CARA TRASERA del logo, que
 *   desde la cámara no se ve: un plano extruido no tiene nada que rimear de
 *   frente si la luz está justo detrás. Corriéndola 32° empieza a rasar el canto
 *   de un lado, que es donde el filo se dibuja. El corrimiento va hacia el lado
 *   OPUESTO al de la principal (que está a −42°), así que key y rim se leen como
 *   dos luces distintas y no como una sola repartida.
 * - **Altura.** `rim.y = RIM_HEIGHT_BASE + cámara.y × RIM_HEIGHT_TRACK`. La
 *   altura del rim SIGUE a la de la cámara en vez de espejarla, y ésa es la
 *   parte que se puede hacer mal: desde arriba se ve el canto de arriba y desde
 *   abajo el de abajo, así que un contraluz alto con la cámara abajo estaría
 *   iluminando exactamente la parte que no se ve. Con estos números:
 *
 *   | momento              | cámara.y | rim.y  |
 *   |----------------------|---------:|-------:|
 *   | entrada              |    +9,00 |  +9,05 |
 *   | hero                 |    −0,20 |  +1,23 |
 *   | portfolio            |    +5,65 |  +6,20 |
 *   | demos · giro ¾       |    −3,50 |  −1,58 |
 *   | cierre               |    +1,90 |  +3,02 |
 *
 *   Siempre detrás, siempre del lado que se está mirando, y nunca por debajo del
 *   papel (`FLOOR_Y` = −4,30). Es el mismo lugar donde un fotógrafo pone el
 *   backlight: opuesto a la cámara, a la altura del sujeto o un poco arriba.
 *
 * ── Lo que el rim NO resuelve, dicho en voz alta ───────────────────────────
 *
 * Con la cámara **de frente al logo** (azimut ~0 o ~180, o sea hero, quiénes
 * somos, números y cierre) el canto está de perfil y proyecta un ancho casi
 * nulo: ahí no hay superficie donde dibujar un filo, por bien puesta que esté la
 * luz. Lo que separa al logo del fondo en esos momentos es otra cosa y también
 * es de este sprint: **la niebla**, que sube el valor de los planos lejanos y
 * deja al logo como lo único que conserva su negro. De frente separa la niebla,
 * de perfil separa el rim.
 *
 * La palanca que haría leer el filo también de frente es geométrica y no de luz:
 * agrandar el bisel de la extrusión (`PROBE_EXTRUDE`, hoy 1/1 sobre un viewBox
 * de 1024 = 0,007 de mundo, o sea invisible). Un chaflán de ~12 unidades daría
 * una faceta de 0,084 que agarra el rim en cualquier ángulo. **No se tocó**:
 * cambia la silueta de la marca y eso se aprueba mirando, no calculando.
 */

// ── La principal ────────────────────────────────────────────────────────────

/**
 * Key: 3/4 alto por delante-izquierda. Es la única que proyecta sombra.
 *
 * ⚠️ **Desde S7 su POSICIÓN no está acá: está en `LIGHT_ARC`.** La principal y
 * el sol son el mismo objeto, así que su azimut y su elevación viajan con el
 * nivel y la temperatura, en una sola tabla ligada al progreso. Los valores de
 * abajo quedan como el punto de arranque de ese arco y como la posición que el
 * modo manual usa cuando no hay recorrido que muestrear.
 *
 * La elevación (36°) no es libre: fija el largo de la sombra sobre el papel, y
 * con ella el rango de profundidad del shadow map. Más rasante = sombra más
 * larga y más dramática; más alta = sombra corta y objeto aplanado. 36° cae en
 * la banda de retrato y deja la sombra saliendo del objeto en diagonal, que es
 * lo que la hace leer como sombra proyectada y no como una mancha debajo. **Y
 * es el techo del arco**: el sol arranca ahí y baja hasta 11,5° en el cierre.
 *
 * `KEY_DISTANCE` no es la distancia del SOL —el cuerpo se dibuja a
 * `SUN_RADIUS`, 34— sino la de la cámara de sombra. Una direccional no tiene
 * posición en el sentido físico: lo único que cuenta de ella es su dirección, y
 * ésa es idéntica en los dos casos. La cámara de sombra se queda más cerca a
 * propósito, para que su rango de profundidad sea lo más apretado posible.
 */
export const KEY_AZIMUTH_DEG = -42
export const KEY_ELEVATION_DEG = 36
export const KEY_DISTANCE = 22
export const KEY_INTENSITY = 4.6

// ── El relleno ──────────────────────────────────────────────────────────────

/**
 * Fill: opuesto a la principal, más bajo y mucho más suave. Su trabajo es uno
 * solo — que la cara en sombra tenga FORMA en vez de ser negro plano.
 *
 * La relación key:fill es de 3,4 a 1. Más parejo aplana; más abierto deja la
 * cara en sombra sin información, que es justo lo que el humano vio ("se ve
 * plana"). Va bajo (14°) para que no compita con la principal en el modelado y
 * para que su propio degradé corra en la dirección contraria.
 */
export const FILL_AZIMUTH_DEG = 58
export const FILL_ELEVATION_DEG = 14
export const FILL_DISTANCE = 20
export const FILL_INTENSITY = 1.35

/**
 * ⚠️ **El relleno NO acompaña al sol, y hay un costo medido que conviene saber.**
 *
 * El arco lleva la principal de −42° a +50°, y el relleno se queda en 58°: al
 * final del recorrido las dos quedan a **8° una de otra**. En ese tramo el rig
 * de tres puntos degrada de hecho a dos (principal + contraluz) más el
 * hemisférico, porque key y fill iluminan la misma mitad del canto. Medido: la
 * fracción del contorno del logo que recibe luz directa cae de 64% a 43% en el
 * cierre.
 *
 * **Se dejó así, y con tres razones.** (1) El relleno es del ESPACIO, que es la
 * decisión de S6: es el rebote de la sala, no un satélite del sol. (2) La cara
 * que la cámara ve nunca queda peor iluminada que con la key fija — se midió
 * pose por pose y da igual o mejor en todas. (3) Donde ocurre la convergencia el
 * nivel ya está en 0,34 y el borde lo dibuja el contraluz, que es solidario a la
 * cámara y no se entera del arco.
 *
 * Se probó la alternativa —el relleno siguiendo al sol a un offset fijo— y da
 * PEOR: la cara vista pierde luz en el cierre (1,20 contra 1,44) y el canto
 * queda igual. Si igual se quiere separar las dos luces, la perilla es este
 * número.
 */

// ── El contraluz ────────────────────────────────────────────────────────────

/** Ver la nota larga de arriba: los tres números que hacen que el rim funcione en toda la órbita. */
export const RIM_AZIMUTH_OFFSET_DEG = 148
export const RIM_HEIGHT_BASE = 1.4
export const RIM_HEIGHT_TRACK = 0.85
export const RIM_DISTANCE = 24
/**
 * Un rim es la luz más caliente del rig, y tiene por qué: pega rasante, así que
 * el coseno del ángulo de incidencia se come casi todo. 0,7× la principal en
 * intensidad nominal es del orden de 0,2× en lo que llega a la superficie.
 */
export const RIM_INTENSITY = 3.2

// ── El ambiente ─────────────────────────────────────────────────────────────

/**
 * El hemisférico: el cielo del estudio y el rebote del papel hacia arriba. Es lo
 * que impide que la cara en sombra se vaya a negro absoluto, y con el ciclorama
 * hace un trabajo extra — la pared tiene la normal horizontal, así que recibe la
 * mezcla de cielo y piso, y esa diferencia con el suelo es lo que dibuja la cove.
 */
export const HEMI_INTENSITY = 2.1

// ── Cómo baja cada uno cuando baja el arco ──────────────────────────────────

/**
 * **El apagado no es plano, y ahí está la mitad del efecto.**
 *
 * Si todo bajara en la misma proporción, apagar la sala sería bajarle el brillo
 * a una foto: la escena se vuelve gris y pierde forma. Lo que hace una sala real
 * al apagarse es GANAR contraste — el ambiente muere antes que las fuentes, y lo
 * último que queda encendido es lo que dibuja los bordes.
 *
 * - **Key y fill** bajan proporcional al arco. Son las fuentes.
 * - **Hemisférico**, con exponente: a nivel 0,34 queda en 0,21. El ambiente se
 *   apaga un 40% más rápido que la principal, así que las sombras se cierran.
 * - **Rim**, con freno: a nivel 0,34 queda en 0,59. Es lo que hace que en el
 *   cierre el logo se lea por su filo aunque la sala esté en penumbra, que es
 *   exactamente lo que el cierre necesita.
 * - **Niebla**, con exponente suave: el aire está iluminado por el ambiente, así
 *   que se apaga parecido a él, y el fondo se va a un gris azulado en vez de
 *   quedar blanco papel detrás de una escena apagada.
 */
export const HEMI_DIM_GAMMA = 1.45
export const RIM_DIM_SHARE = 0.62
export const FOG_DIM_GAMMA = 1.2

// ── El toggle "la luz sigue a la cámara" ────────────────────────────────────

/**
 * Cuando el toggle está encendido, la principal y el relleno pasan a ser
 * solidarios a la cámara igual que el rim: la relación luz-observador queda fija
 * y lo único que cambia al orbitar es la geometría. Es lo que separa las dos
 * variables cuando un ángulo se ve pobre y no se sabe si es por la forma o por
 * quedar a contraluz.
 *
 * Van los dos y no solo la principal: con el fill quieto en el mundo, el
 * modelado seguiría cambiando con la órbita y el toggle no aislaría nada.
 */
export const KEY_FOLLOW_AZIMUTH_OFFSET_DEG = -38
export const FILL_FOLLOW_AZIMUTH_OFFSET_DEG = 62
