/**
 * Fixture: TODAS las comprobaciones fuera de ventana, cero afirmaciones.
 *
 * Es el caso límite del Problema 3: un check de frontera corrido después del
 * merge no tiene nada que medir. Tiene que salir en CERO —no es una falla— y
 * aun así decir en la salida que no corrió.
 */
import { cerrar, noCorre } from '../afirmar'

noCorre('fixture E — la primera', 'sus cambios ya están en HEAD')
noCorre('fixture E — la segunda', 'sus cambios ya están en HEAD')
cerrar('fixture-todo-fuera-de-ventana')
