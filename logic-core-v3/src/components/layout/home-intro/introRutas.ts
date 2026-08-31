/**
 * EN QUÉ RUTAS ARMA EL INTRO DEL HOME — el dato, sin el script.
 *
 * ⚠ **Archivo nuevo de SITIO-S8, y es un ENCHUFE: lo escribió el agente
 * principal en la Fase 0, no un subagente.** Existe por una sola razón, y
 * conviene que quede escrita porque toca una pieza que comparte el sitio vivo.
 *
 * ── El problema ────────────────────────────────────────────────────────────
 *
 * El preloader del home está terminado desde S8d —trazo, letras, transformación
 * de color, relevo 2D→3D, partículas que caen— y **nunca se montó en el home
 * nuevo**. Montarlo no alcanza con renderizar el componente: el gate que decide
 * si la secuencia corre es un `<script>` pre-paint que se inyecta desde el
 * `<head>` del layout raíz (`introBoot.tsx`), y ese script pregunta
 * `location.pathname === '/'`. En `/v3` la marca nunca se pone, `introWasArmed()`
 * devuelve `false` y el intro se cierra solo antes de empezar.
 *
 * No hay forma de resolverlo desde `/v3`: la decisión es pre-paint y la toma el
 * `<head>`; cualquier cosa que `/v3` haga ocurre después del primer pintado,
 * que es justamente lo que el gate existe para ganarle.
 *
 * ── Por qué esto NO cambia el comportamiento del preloader ─────────────────
 *
 * Lo que cambia es **dónde se monta**, no **cómo funciona**, y montar es
 * exactamente lo que este sprint hace. Las cuatro condiciones del gate siguen
 * siendo las mismas y en el mismo orden: hard-load directo a una ruta de la
 * lista, sin automatización, sin `prefers-reduced-motion`, y sesión sin intro
 * previo. La secuencia, su ritmo, sus valores y su entrega a la escena no se
 * tocaron.
 *
 * Para `/` el resultado es **idéntico byte a byte en su efecto**: `'/'` sigue
 * siendo la primera entrada de la lista y sigue armando igual. Hay una
 * afirmación que lo custodia — si alguien saca `'/'` de acá, el intro
 * desaparecería del sitio vivo sin que nada más se queje.
 *
 * ── La consecuencia que sí existe, y queda anotada ─────────────────────────
 *
 * `INTRO_SESSION_KEY` es UNA sola clave de sesión para las dos rutas. O sea que
 * ver el intro en `/` y después entrar a `/v3` en la misma pestaña **no vuelve
 * a mostrarlo**, y al revés también. Es el comportamiento correcto mientras las
 * dos rutas sean el mismo home en dos etapas —una persona no quiere ver la
 * presentación dos veces— y deja de tener sentido el día que `/v3` REEMPLACE al
 * home, que es el día en que esta lista vuelve a tener una sola entrada.
 *
 * ⚠ **Esta lista se achica, nunca se agranda.** Cuando `/v3` sea el home, la
 * entrada `/v3` se borra y no queda deuda: el preloader vuelve a correr en una
 * sola ruta, que es donde tiene sentido.
 */

/**
 * Las rutas en las que el intro ARMA, en `pathname` exacto y sin barra final
 * —Next normaliza a esa forma, y el gate anterior ya comparaba así—.
 *
 *   `/`     el home vivo. Es el que estaba y no se mueve.
 *   `/v3`   el home nuevo, que SITIO-S8 monta. `noindex`, sin links entrantes.
 */
export const RUTAS_DEL_INTRO: readonly string[] = ['/', '/v3']

/**
 * El fragmento de JavaScript que decide la ruta, para el script pre-paint.
 *
 * Se genera desde la lista y no se escribe a mano por lo de siempre: dos
 * lugares que tienen que decir lo mismo terminan diciendo cosas distintas.
 * `JSON.stringify` emite comillas dobles, que es lo correcto adentro de un
 * `<script>` inyectado con `dangerouslySetInnerHTML`.
 *
 * `indexOf(...)>=0` y no `.includes(...)`: el script corre bloqueante en el
 * `<head>`, antes de cualquier polyfill, y `indexOf` sobre un array existe
 * desde ES5. No es cautela decorativa — es el mismo criterio con el que el
 * script original evita cualquier sintaxis moderna.
 */
export const CONDICION_DE_RUTA = `${JSON.stringify([...RUTAS_DEL_INTRO])}.indexOf(location.pathname)>=0`
