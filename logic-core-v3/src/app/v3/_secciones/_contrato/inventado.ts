/**
 * ⚠️ EL CONTENIDO DE MENTIRA — la lista CERRADA, y las dos caras de cada casilla.
 *
 * Todo lo que B12 §4 inventa está acá y **en ningún otro archivo**. Ninguna
 * sección escribe una cifra: escribe `conLlave(INVENTOS.x)`, que con la llave
 * prendida devuelve la mentira y con la llave apagada devuelve el texto con su
 * marcador — el mismo que había antes de §4, carácter por carácter.
 *
 * La llave es `CONTENIDO_INVENTADO`, en `llave.ts`, y ahí está escrito el
 * porqué de todo esto. Acá está el QUÉ.
 *
 * ── Una casilla tiene TRES campos, y ninguno sobra ────────────────────────
 *
 *     marcador   del conjunto cerrado de `marcadores.ts`. Es lo que se pide.
 *     pedido     lo que se lee con la llave APAGADA. Contiene el marcador.
 *     mentira    lo que se lee con la llave PRENDIDA. Es el invento.
 *
 * `pedido` casi siempre ES el marcador solo —`'[CIFRA]'`— porque la casilla es
 * un hueco. Donde el hueco vive adentro de una frase que sólo tiene sentido
 * mientras el dato falta (*«Hasta que la medición exista, la cifra no se
 * escribe»*), `pedido` es la frase entera: al apagar tiene que volver el TEXTO
 * que estaba, no un marcador suelto adentro de una oración que ya no cierra.
 * Por eso hay tres campos y no dos, y por eso el invariante afirma que `pedido`
 * contiene a `marcador`: **nada se pierde al apagar.**
 *
 * ── ⚠️ Por qué UN archivo, y qué se compra con eso ────────────────────────
 *
 * Porque hace **derivables** las cuatro cosas que hay que poder decir sin
 * buscar: qué se inventó, dónde se ve, a qué vuelve cada casilla, y cuánto pesa
 * todo junto. Un invento escrito adentro de un `contenido.ts` no se puede
 * enumerar, y lo que no se enumera se publica.
 *
 * Y lo hace **comprobable**: `s21-llave` barre el lane y afirma que todas las
 * llamadas a `conLlave` pasan una entrada de esta lista, y que todas las
 * entradas de esta lista se ven en pantalla. Ni una casilla muerta, ni una
 * casilla armada en el lugar.
 *
 * ── ⚠️ Qué NO entra acá, y es la mitad importante de la lista ─────────────
 *
 *   · **Ningún precio.** `escaneo.ts` los rechaza sin lista blanca posible y
 *     esa decisión no la cambia §4: los precios de develOP no están cerrados y
 *     no se inventan ni de ejemplo. Un precio inventado en una pantalla se
 *     convierte en la expectativa de alguien.
 *   · **Ningún destino.** Ni una dirección de contacto, ni un enlace de red, ni
 *     una fecha de actualización. Un enlace falso se puede CLICKEAR: no es una
 *     composición que se juzga, es una acción que falla. Los `[ENLACE]`,
 *     `[FECHA]` y `[NOMBRE]` del pie siguen pedidos.
 *   · **Ningún cliente que no exista**, y **ningún caso asignado a uno que sí**.
 *     Los tres son reales —`NOMBRES_REALES`— y sus nombres se escriben derecho;
 *     lo que se inventa son las MÉTRICAS de esos tres trabajos. La línea de caso
 *     de Servicios sigue con su `[TESTIMONIO]` porque elegir cuál de los tres
 *     dio el caso sería un hecho inventado sobre un cliente real, que es peor
 *     que una cifra inventada. Su propio archivo ya lo decía.
 *   · **Ninguna imagen de terceros.** Las fotos que faltan se resuelven con
 *     placeholders propios que se ven como placeholders: eso no es una mentira
 *     y no vive detrás de la llave.
 *   · **La prosa mejorada tampoco.** Un párrafo sin cifras no afirma un hecho
 *     falso: afirma lo que develOP hace, que es verdad. Lo provisional que tiene
 *     ya está declarado en el `PEDIDO` de cada sección, con su ruta y su
 *     formato, y no tiene marcador al que volver: una casilla detrás de la llave
 *     sin marcador sería un `pedido` vacío, o sea texto que DESAPARECE al
 *     apagar. Eso no es «devolver los marcadores».
 */

import { CONTENIDO_INVENTADO } from './llave'
import type { Marcador } from './marcadores'

/** Una casilla inventada, con sus dos caras y el marcador que la nombra. */
export interface Invento {
  readonly marcador: Marcador
  /** Lo que se lee con la llave APAGADA. Contiene `marcador`. */
  readonly pedido: string
  /** Lo que se lee con la llave PRENDIDA. La mentira. */
  readonly mentira: string
}

/**
 * ⚠️ LAS VEINTE CASILLAS. La clave nombra la ruta para que un hallazgo sea
 * accionable sin buscar, y el orden es el del recorrido.
 *
 * Todas las cifras son **inventadas** y ninguna se midió. Lo que sí es verdad y
 * queda escrito derecho, sin pasar por acá: los tres clientes, las dos personas
 * del equipo, Tucumán, y qué hace develOP.
 */
export const INVENTOS = {
  // ── Números · las cinco casillas, con los rótulos que ya existían ────────
  numerosProyectos: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '23' },
  numerosClientes: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '9' },
  numerosAnios: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '4' },
  numerosRespuesta: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '6 h' },
  numerosProcesos: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '31' },

  // ── Trabajos · la métrica al lado de cada nombre. Los NOMBRES son reales ─
  trabajosEsquina: { marcador: '[MÉTRICA]', pedido: '[MÉTRICA]', mentira: 'de 3 a 14 consultas por semana' },
  trabajosGarage: { marcador: '[MÉTRICA]', pedido: '[MÉTRICA]', mentira: 'de 2 a 11 visitas agendadas' },
  trabajosBanu: { marcador: '[MÉTRICA]', pedido: '[MÉTRICA]', mentira: 'de 40 a 260 pedidos al mes' },

  // ── Quiénes somos · qué hace cada uno en un proyecto ─────────────────────
  equipoFranco: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Habla con el cliente, arma el alcance y sigue las entregas.',
  },
  equipoValentino: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Escribe el sistema, lo pone a andar y lo mantiene.',
  },

  // ── Servicios · la frase de prueba de cada uno de los tres frentes ───────
  serviciosWeb: {
    marcador: '[MÉTRICA]',
    pedido: '[MÉTRICA] de velocidad y [CIFRA] de conversión quedan a la vista en tu panel.',
    mentira:
      'la carga baja a 1,2 s y 3 de cada 100 visitas terminan en una consulta, y las dos quedan a la vista en tu panel.',
  },
  serviciosIa: {
    marcador: '[MÉTRICA]',
    pedido: '[MÉTRICA] de consultas resueltas y [CIFRA] de horas devueltas.',
    mentira:
      '7 de cada 10 consultas las cierra el asistente solo, y eso le devuelve unas 12 horas por semana al equipo.',
  },
  serviciosSoftware: {
    marcador: '[MÉTRICA]',
    pedido: '[MÉTRICA] de procesos migrados y [CIFRA] de errores evitados.',
    mentira:
      '6 procesos que vivían en planillas ya corren adentro del sistema, y los errores de carga bajaron a la mitad.',
  },

  // ── Tu panel · las dos casillas de dato adentro de la prosa ──────────────
  panelFechas: {
    marcador: '[MÉTRICA]',
    pedido: '[MÉTRICA] al día, [CIFRA] acumulada.',
    mentira: 'la última semana al día, 2.140 consultas acumuladas.',
  },
  panelComparacion: {
    marcador: '[MÉTRICA]',
    pedido: 'Mirar [MÉTRICA] de la semana al lado de la del período anterior.',
    mentira: 'Mirar las 34 consultas de la semana al lado de las del período anterior.',
  },

  // ── Por qué develOP · dos diferenciales y el testimonio entero ───────────
  diferencialClientes: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: 'nueve' },
  diferencialEntrega: {
    marcador: '[MÉTRICA]',
    pedido:
      '[MÉTRICA] más rápido que el camino tradicional, medido sobre entregas reales. Hasta que la medición exista, la cifra no se escribe.',
    mentira:
      'Un mes más rápido que el camino tradicional, medido sobre entregas reales. La cuenta sale del promedio de las que ya salieron.',
  },
  /**
   * ⚠️ EL NOMBRE DEL TESTIMONIO NO PUEDE CONFUNDIRSE CON UNA PERSONA REAL, y
   * por eso no es un nombre plausible.
   *
   * La instrucción lo pide con esas palabras. Cualquier nombre y apellido
   * rioplatense que suene creíble **es** el nombre de alguien: escribirlo abajo
   * de una cita inventada le pone palabras en la boca a una persona que existe.
   * `Persona Inventada` tiene el largo y el lugar de una firma —la composición
   * se puede juzgar— y no se puede leer como alguien.
   */
  testimonioCita: {
    marcador: '[TESTIMONIO]',
    pedido: '[TESTIMONIO]',
    mentira: 'Antes preguntaba por mensaje en qué andaba cada cosa. Ahora lo abro y lo veo.',
  },
  testimonioCuerpo: {
    marcador: '[MÉTRICA]',
    pedido:
      'Dos o tres oraciones de quien abre el panel todos los días: qué hacía antes, qué hace ahora, y qué dejó de hacer. Sin cifras adentro — la cifra va aparte, como [MÉTRICA].',
    mentira:
      'Los pedidos entran solos y quedan con fecha. Dejé de llevar una planilla en paralelo para saber qué se había entregado y qué no.',
  },
  testimonioFirma: {
    marcador: '[NOMBRE]',
    pedido: '[NOMBRE]',
    mentira: 'Persona Inventada · testimonio de muestra',
  },
} as const satisfies Record<string, Invento>

export const LISTA_DE_INVENTOS: readonly Invento[] = Object.values(INVENTOS)

/**
 * LA ÚNICA PUERTA. Todo lo inventado pasa por acá y por ningún otro lado.
 *
 * `llave` es un PARÁMETRO con valor por defecto, y no una lectura directa de la
 * constante, por una sola razón: **el invariante tiene que poder comprobar las
 * DOS ramas en la misma corrida.** Sin eso, «apagarla devuelve los marcadores»
 * sería una promesa escrita en un comentario.
 */
export function conLlave(invento: Invento, llave: boolean = CONTENIDO_INVENTADO): string {
  return llave ? invento.mentira : invento.pedido
}
