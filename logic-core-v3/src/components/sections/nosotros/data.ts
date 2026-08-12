/**
 * Contenido de la sección S4 del home: el argumento anti-agencia y el equipo.
 *
 * Fuente única de los dos bloques. Nada de esto viene de `WhyDevelOP.tsx` ni de
 * `About.tsx`: el primero traía dos cifras sin fuente (`76` días de las agencias
 * contra `15`, y `+850 LEADS GENERADOS`) y el segundo no tenía cifras pero sí
 * el bug de encoding del badge de ubicación en su rama mobile.
 *
 * **Lo real, tal cual:** los roles de base de Franco y Valentino, y la línea de
 * ubicación —esta vez con el guión largo y sin mojibake—.
 *
 * **Lo que falta va marcado.** Dos huecos, y son distintos entre sí:
 *
 * · El contraste 2 tiene el lado agencia escrito y el lado develOP en
 *   placeholder. No es olvido: los timelines por servicio (15/7/5 días) son
 *   reales, pero "primera versión funcionando en X" es un claim **distinto** y
 *   no está verificado. Un plazo de entrega no es lo mismo que un plazo de
 *   arranque.
 * · El contraste 3 no está definido. Va con los dos lados marcados, porque lo
 *   que la sección necesita ver es la forma completa de la fila.
 *
 * GATE DE MERGE: ninguna rama con estos placeholders a la vista se mergea a
 * `main`.
 */

export interface Contraste {
  /** Clave estable de la fila. No se muestra. */
  id: string
  agencia: string
  develop: string
}

export const CONTRASTES: readonly Contraste[] = [
  {
    id: 'interlocutor',
    agencia: 'Hablás con un ejecutivo de cuentas que le pasa el mensaje al que programa.',
    develop: 'Hablás con el ingeniero que lo construye.',
  },
  {
    id: 'arranque',
    agencia:
      'Presupuesto, brief y semanas de ida y vuelta antes de la primera línea de código.',
    develop: '[PLAZO — a definir con dato real]',
  },
  {
    id: 'contraste-3',
    agencia: '[CONTRASTE 3 — LADO AGENCIA]',
    develop: '[CONTRASTE 3 — LADO DEVELOP]',
  },
]

export interface Ingeniero {
  nombre: string
  /** Inicial del avatar tipográfico. Una letra: no se inventan apellidos. */
  inicial: string
  /** Áreas reales. Es dato verificado, no placeholder. */
  areas: string
  /** Qué hace dentro de un proyecto. Pendiente de Franco. */
  rol: string
}

export const INGENIEROS: readonly Ingeniero[] = [
  {
    nombre: 'Franco',
    inicial: 'F',
    areas: 'Estrategia · Comercial · Planificación',
    rol: '[ROL EN UN PROYECTO — 1 línea]',
  },
  {
    nombre: 'Valentino',
    inicial: 'V',
    areas: 'Ejecución técnica',
    rol: '[ROL EN UN PROYECTO — 1 línea]',
  },
]

/** Real, tal cual. */
export const UBICACION = 'Tucumán, Argentina — trabajamos con clientes de todo el país.'
