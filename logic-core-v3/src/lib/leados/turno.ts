/**
 * LeadOS — DE QUIÉN ES EL TURNO.
 *
 * El manual de usuario encontró tres pantallas que no comparten una sola línea
 * de código —el estado de espera del manual, el envío (m15) y el panel de
 * inicio— diciendo la misma frase para dos cosas distintas: «esperando
 * respuesta del negocio» tanto cuando falta que conteste el negocio como cuando
 * falta que Franco haga lo suyo. No eran tres textos malos: faltaba el
 * concepto. El producto tiene vocabulario preciso para todo —ficha, veredicto,
 * opener, toque, brief, borrador, chequeo— menos para decir A QUIÉN LE TOCA.
 *
 * Este módulo es el único lugar donde eso se decide. Tres turnos, y nada más:
 *
 *   - `negocio` — la pelota está AFUERA. Puede no volver nunca.
 *   - `franco`  — está ADENTRO. Va a salir; es cuestión de tiempo.
 *   - `setter`  — no es una espera: hay algo trabado esperándolo a él.
 *
 * El tercero es el que importa: un setter que cree estar esperando cuando le
 * toca a él es trabajo detenido sin que nadie lo note.
 *
 * NO inventa estado: el turno se DERIVA de lo que el producto ya sabe —el
 * status comercial del lead, el stage del dossier, y si la demo ya pasó por la
 * revisión de Franco (`finalUrl`, la URL permanente que él carga al aprobar)—.
 * Nada se persiste ni se transiciona acá: los gates (`gateBriefAbierto`,
 * `gateEnvioDemo`) siguen viviendo en `flow.ts` y no se tocan.
 *
 * Imports: SOLO tipos de Prisma. Es un módulo hoja a propósito — así `flow.ts`
 * puede consumirlo sin ciclo, y el harness de invariante lo carga con ts-node
 * sin tsconfig-paths (mismo criterio que el resto del árbol de `flow.ts`).
 */
import type { DossierStage, LeadStatus } from '@prisma/client'

export type Turno = 'negocio' | 'franco' | 'setter'

export type TurnoInput = {
  /** Status comercial del lead (el estado de la CONVERSACIÓN con el negocio). */
  status: LeadStatus
  /** Stage del dossier (el estado de la DEMO). null = todavía no hay dossier. */
  stage: DossierStage | null
  /**
   * `dossier.finalUrl` — la URL permanente que Franco registra AL APROBAR. Es el
   * discriminador del caso que ninguna pantalla sabía nombrar: aprobada sin link
   * cargado significa que el envío está trabado de este lado, no del otro.
   *
   * `undefined` = la superficie no lo proyecta (el panel de inicio arma sus
   * cards sin él). Ahí esa rama no se puede afirmar, y no se afirma: se cae al
   * turno que el resto del estado indique. `null` = se sabe que NO está cargado.
   */
  finalUrl?: string | null
  /**
   * Si hay algo para hacer AHORA, según lo que el producto YA decidió: en el
   * panel es `HomeLead.accionable`; en el manual, que la pantalla derivada sea
   * de acción y no de estado. Este módulo TRADUCE esa decisión a un turno — no
   * la vuelve a tomar, así no puede desincronizarse de la cola de trabajo.
   */
  accionPendiente: boolean
}

/**
 * Status donde el lead ya no lo mueve el setter: la reunión la corre Franco, y
 * el cierre (ganado o perdido) lo decide él desde el admin — jamás se automatiza.
 */
const STATUS_DE_FRANCO: readonly LeadStatus[] = ['CALL_AGENDADA', 'CERRADO', 'PERDIDO']

/**
 * De quién es el turno. El orden de los `if` ES la precedencia, y lo estructural
 * va primero: si la demo está en la cola de Franco, no importa qué más pase —
 * hasta que él la suelte no hay nada que el setter ni el negocio puedan hacer.
 */
export function turnoDelLead(input: TurnoInput): Turno {
  // 1) Lo que corre por dentro. La revisión, el link permanente, la reunión y el
  //    cierre son de Franco: el setter no los apura y el negocio no los conoce.
  if (STATUS_DE_FRANCO.includes(input.status)) return 'franco'
  if (input.stage === 'DESCARTADA') return 'franco'
  if (input.stage === 'EN_REVISION') return 'franco'
  // El caso que el manual tuvo que enseñar a diagnosticar leyendo una etiqueta:
  // Franco aprobó la demo pero todavía no cargó su link permanente. El negocio
  // no tiene nada que hacer acá — decirle al setter que espere una respuesta es
  // mandarlo a mirar Instagram por algo que ya llegó.
  if (input.stage === 'APROBADA' && input.finalUrl === null) return 'franco'

  // 2) Algo quedó trabado esperándolo a él. No es espera: es trabajo detenido.
  if (input.accionPendiente) return 'setter'

  // 3) Resto: la conversación está del lado del negocio.
  return 'negocio'
}

export type TextoTurno = {
  /**
   * La forma contable, para los conteos del panel: «2 esperando a Franco».
   * Va DESPUÉS del número, así que se lee igual con uno o con veinte.
   */
  chip: string
  /** El titular. Dice el turno solo — sin obligar a leer ninguna etiqueta al lado. */
  titulo: string
  /** Qué esperar de ese turno, y qué hacer mientras. */
  detalle: string
}

/**
 * Las palabras de cada turno — editables por Franco, en un solo lugar. Voseo,
 * frase corta, cero jerga de sistema. Los tres se nombran DISTINTO a propósito:
 * que dos turnos puedan mostrar el mismo texto es exactamente el defecto que
 * este módulo vino a cerrar, y `turno.invariant.ts` lo prohíbe por ejecución.
 */
export const TEXTO_TURNO: Record<Turno, TextoTurno> = {
  negocio: {
    chip: 'esperando al negocio',
    titulo: 'Le toca al negocio',
    detalle:
      'Puede contestar hoy, en dos semanas o no contestar nunca — eso no lo manejás vos. Cuando toque un toque te lo traemos al foco; mientras tanto, trabajá otro negocio.',
  },
  franco: {
    chip: 'esperando a Franco',
    titulo: 'Le toca a Franco',
    detalle:
      'Está de este lado y va a salir: es cuestión de tiempo, no de suerte. No hace falta que le avises ni que lo persigas — cuando lo resuelva, el negocio vuelve solo a tu foco.',
  },
  setter: {
    chip: 'esperándote a vos',
    titulo: 'Te toca a vos',
    detalle:
      'Esto no es una espera: hay algo trabado de tu lado y nadie lo va a destrabar por vos. Abrilo y seguí desde donde quedó.',
  },
}

/** El texto del turno de un lead, en un paso. */
export function textoDelTurno(input: TurnoInput): TextoTurno {
  return TEXTO_TURNO[turnoDelLead(input)]
}
