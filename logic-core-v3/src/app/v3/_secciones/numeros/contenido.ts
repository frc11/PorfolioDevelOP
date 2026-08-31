/**
 * NÚMEROS — el contenido, como tabla. Es el archivo que edita Franco.
 *
 * ── Por qué justo acá no hay un solo dígito ────────────────────────────────
 *
 * Ésta es LA sección donde la regla dura del sprint se paga cara: una sección
 * de cifras sin cifras. La tentación de poner `+340%` o `50 clientes` "para ver
 * cómo queda" es máxima acá y en ningún otro lado, y es exactamente la deuda
 * que develOP ya tiene publicada en sus cuatro landings.
 *
 * La asimetría que decide: un `[CIFRA]` en pantalla es un pedido que nadie
 * puede ignorar; un `+340%` se publica sin que nadie se acuerde de que era
 * falso, porque se lee igual que uno verdadero. Así que las cinco casillas
 * quedan vacías **y a la vista**, y el instrumento afirma que ni un dígito
 * llegó hasta acá — ni en un texto, ni como hoja numérica de este objeto.
 *
 * ── Los rótulos SÍ se escriben, y son la otra mitad del pedido ─────────────
 *
 * Un `[CIFRA]` solo no dice nada: no se sabe qué dato falta. El rótulo es lo
 * que convierte el hueco en una pregunta contestable —"cuántos proyectos
 * entregados"— y por eso va escrito, en castellano y sin un número adentro.
 *
 * Los cinco rótulos son **elegidos, no medidos**: son las métricas que una
 * consultora de este tamaño puede sostener con una lista real detrás. Si
 * alguno no nombra un dato que exista, la salida correcta es borrar la casilla
 * —y no redondear para arriba—; cada entrada del PEDIDO lo dice con esas
 * palabras.
 *
 * ── Qué NO está acá ────────────────────────────────────────────────────────
 *
 * El rótulo de sección (`Números`) y el ordinal (`03`) salen de la tabla del
 * recorrido, `_lib/secciones.ts`, por el prop `seccion`. Escribirlos también
 * acá sería una segunda fuente que se desincroniza en el primer cambio.
 *
 * Y la GEOMETRÍA —qué tamaño tiene cada cifra y en qué celda cae— vive en
 * `Numeros.tsx`, en su constante `GEOMETRIA`. Es técnica: la decide quien
 * compone la sección y no cambia cuando llegue el dato real. Mezclarla acá
 * obligaría a exceptuar sus números del escáner, y una excepción es por donde
 * vuelve a entrar la primera cifra inventada.
 */

import type { IdDePatron } from '../../_lib/motion/patrones'
import type { EntradaDePedido } from '../_contrato/pedido'

export const CONTENIDO = {
  /** El título de la sección. Relleno: está declarado en el PEDIDO. */
  titulo: 'Lo que se puede contar',
  /** La bajada. Relleno también, con la longitud y el tono de la definitiva. */
  entrada:
    'Preferimos pocos números, y que cada uno se pueda rastrear hasta la fuente que lo ' +
    'produce. Los de acá salen del trabajo hecho, no de una proyección.',
  /**
   * Las cinco casillas. El orden de este arreglo es el ORDEN DE LECTURA:
   * es el que se ve tal cual abajo de tablet, donde la composición se apila.
   *
   * `clave` no es contenido editable: la consume `GEOMETRIA` para saber qué
   * tamaño y qué celda le toca a cada una. Renombrarla rompe la compilación a
   * propósito —falla fuerte y temprano— en vez de dejar una cifra sin lugar.
   */
  cifras: [
    { clave: 'proyectos', valor: '[CIFRA]', rotulo: 'Proyectos entregados' },
    { clave: 'clientes', valor: '[CIFRA]', rotulo: 'Clientes activos' },
    { clave: 'anios', valor: '[CIFRA]', rotulo: 'Años en el mercado' },
    { clave: 'respuesta', valor: '[CIFRA]', rotulo: 'Tiempo de respuesta' },
    { clave: 'procesos', valor: '[CIFRA]', rotulo: 'Procesos automatizados' },
  ],
} as const

/** Las claves de las cinco casillas, como unión literal. La consume `GEOMETRIA`
 *  para que no pueda existir una cifra sin celda ni una celda sin cifra. */
export type ClaveDeCifra = (typeof CONTENIDO)['cifras'][number]['clave']

/**
 * EL PEDIDO — siete entradas: cinco cifras y dos de prosa.
 *
 * Cada cifra apunta a su `valor` y no a su `rotulo` porque lo que falta es EL
 * DATO; el rótulo es la pregunta, no la respuesta. Que el rótulo también sea
 * provisional se dice en el `que` de cada entrada, que es donde Franco lo va a
 * leer — y no en una nota al pie que nadie abre.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'titulo',
    clase: 'prosa',
    marcador: null,
    que: 'El título de la sección, dos o tres palabras. El que está puesto es relleno.',
    formato: 'Dos o tres palabras. Texto plano.',
  },
  {
    ruta: 'entrada',
    clase: 'prosa',
    marcador: null,
    que: 'La bajada, una o dos líneas: qué mira develOP y por qué son pocos números.',
    formato: 'Una o dos líneas, ~180 caracteres. Texto plano.',
  },
  {
    ruta: 'cifras[0].valor',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que:
      'Cuántos proyectos se entregaron y se cerraron, contados de una lista real. Si el ' +
      'rótulo no nombra un dato que exista, cambiá el rótulo o sacá la casilla entera.',
    formato: 'Un número entero, sin símbolo. Ej.: `14`.',
  },
  {
    ruta: 'cifras[1].valor',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que: 'Cuántos clientes están activos hoy, con el corte de "activo" que uses vos.',
    formato: 'Un número entero, sin símbolo.',
  },
  {
    ruta: 'cifras[2].valor',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que:
      'Hace cuánto existe develOP. Si te parece poco para mostrarlo, sacá la casilla: ' +
      'es mejor que redondear para arriba.',
    formato: 'Un número entero de años, sin el signo `+`.',
  },
  {
    ruta: 'cifras[3].valor',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que:
      'Cuánto se tarda en contestar el primer mensaje, medido sobre los mensajes que ' +
      'entraron de verdad y no sobre la intención de contestar rápido.',
    formato: 'Número más unidad, ej. `4 h`. Es la única casilla con unidad.',
  },
  {
    ruta: 'cifras[4].valor',
    clase: 'cifra',
    marcador: '[CIFRA]',
    que: 'Cuántos procesos automatizados están corriendo hoy en clientes.',
    formato: 'Un número entero, sin símbolo.',
  },
]

/**
 * P2 y nada más, seis veces.
 *
 * P2 mueve un bloque entero media altura de sí mismo, y tiene **un solo target
 * por instancia**: su escalonado declarado queda inerte. El escalonado de esta
 * sección no sale de adentro de un bloque —no puede—, sale de que hay SEIS
 * bloques a distinta altura. Está explicado en `Numeros.tsx`.
 */
export const PATRONES_DE_LA_SECCION: readonly IdDePatron[] = ['P2']
