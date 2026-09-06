/**
 * P23 — LA VIGENCIA DE UN AVISO.
 *
 * Un aviso es un SNAPSHOT: `copyNovedad` congela título y cuerpo en el momento
 * del handoff y nunca los vuelve a mirar. El título es un HECHO y envejece bien
 * («Franco aprobó tu demo» pasó, y sigue siendo verdad). El cuerpo lleva una
 * ORDEN («Enviá el link ya»), y una orden sí caduca: el lead se mueve, y el
 * aviso sigue en pantalla mandando algo que ya no corresponde.
 *
 * Eso producía los dos defectos que este módulo cierra:
 *
 *  · Dos superficies del mismo panel dando órdenes distintas. El aviso decía
 *    «Enviá el link ya» mientras `proximaAccionPara` —la MISMA función que
 *    ordena la cola y el foco— ya decía «la demo está aprobada y el link sale
 *    cuando conteste». No es que la cola estuviera mal: el aviso estaba viejo.
 *
 *  · Dos avisos del mismo lead contradiciéndose. `agruparAvisos` agrupa por
 *    `kind` sólo cuando NO hay `leadId`; los accionables entran uno por fila y
 *    nada retira al anterior. Un DEMO_RECHAZADA de la primera revisión y un
 *    DEMO_APROBADA del re-loop quedaban los dos, y el viejo seguía pidiendo
 *    retrabajo sobre una demo ya aprobada.
 *
 * ── Qué se hace con el aviso caduco: ENVEJECE ────────────────────────────────
 * No se va: el hecho pasó y el setter puede no haberlo leído todavía; borrarlo
 * destruye información que nadie vio. No se marca leído: «marcar vistas» es un
 * gesto del setter, y una lectura no debe escribir. Envejece: se separa el
 * HECHO (el título, que se queda) de la ORDEN (el cuerpo, que se reemplaza por
 * lo que el lead pide HOY, tomado de `proximaAccion` — el mismo dato que ordena
 * la cola). Así las dos superficies coinciden por construcción y no por
 * casualidad.
 *
 * Puro y sin reloj: la vigencia no es una cuestión de antigüedad —un aviso de
 * hace un mes cuyo lead no se movió sigue mandando bien— sino de ESTADO. Por eso
 * no hay corte por fecha en ninguna parte.
 */
import type { OsSetterNoticeKind } from '@prisma/client'
import { gateEnvioDemo } from './flow'
import type { HomeLead } from './flow'

/**
 * Lo que hace falta del lead para decidir si la orden sigue en pie. Es un
 * subconjunto de `HomeLead` a propósito: el invariante arma casos sin construir
 * un lead entero.
 */
export type EstadoDelLead = Pick<
  HomeLead,
  | 'stage'
  | 'status'
  | 'caliente'
  | 'finalUrl'
  | 'demoEnviada'
  | 'proximaAccion'
  // `grupo` y `accionable` son la PALABRA DE LA COLA sobre este lead, ya
  // calculada por `clasificarLead`. Viajan acá para no volver a derivarlas: ver
  // `esTrabajoDeHoy`.
  | 'grupo'
  | 'accionable'
>

export type Vigencia =
  | { vigente: true }
  /** La orden caducó. `enSuLugar` es lo que el lead pide hoy. */
  | { vigente: false; enSuLugar: string }

/** Cuando el aviso apunta a un lead que ya no está en la cartera del setter. */
const YA_NO_ES_TUYO = 'Este negocio ya no está en tu cartera.'

/**
 * ¿La orden de este aviso sigue siendo la que el lead pide?
 *
 * Son DOS condiciones, y el orden importa. Primero `esTrabajoDeHoy`: si la cola
 * no tiene el lead como trabajo de hoy, ninguna orden sobre él está en pie —
 * eso lo decide la cola, no este módulo. Y después la regla del kind, que
 * NARROWS: estar en la cola no valida cualquier aviso, sólo el que pide lo que
 * el lead está pidiendo.
 *
 * Cada rama espeja la condición REAL de la pantalla que haría el trabajo, no una
 * copia aproximada:
 *  · DEMO_APROBADA pide mandar el link → `gateEnvioDemo`, el mismo gate que usa
 *    «Envío» (m15). Si el gate está cerrado, la pantalla no ofrece el envío y el
 *    aviso no puede pedirlo.
 *  · DEMO_RECHAZADA pide reabrir la construcción → sólo con el dossier en
 *    RECHAZADA. Aprobada o ya reabierta, el retrabajo no existe.
 *  · LEAD_ASIGNADO manda a arrancar por la ficha → sólo mientras el lead siga
 *    sin evaluación (sin dossier o en FICHA).
 *  · LEAD_REASIGNADO_SALIENTE no da ninguna orden: informa una salida. No caduca.
 */
export function vigenciaDeAviso(
  kind: OsSetterNoticeKind,
  estado: EstadoDelLead | null,
): Vigencia {
  if (kind === 'LEAD_REASIGNADO_SALIENTE') return { vigente: true }
  if (!estado) return { vigente: false, enSuLugar: YA_NO_ES_TUYO }

  const enPie = esTrabajoDeHoy(estado) && ordenEnPie(kind, estado)
  return enPie ? { vigente: true } : { vigente: false, enSuLugar: estado.proximaAccion }
}

/**
 * ¿La cola considera este lead trabajo de HOY?
 *
 * Es la primera condición de toda orden, y se PREGUNTA en vez de re-derivarse.
 * La primera versión de este módulo la re-derivaba por kind, y el barrido de
 * §3 del invariante encontró el agujero enseguida: un LEAD_ASIGNADO sobre un
 * lead sin dossier pero con la reunión ya agendada seguía diciendo «arrancá por
 * la ficha», porque la regla miraba el stage y la cola corta por STATUS antes.
 * Volver a calcular lo que la cola ya calculó es exactamente cómo dos
 * superficies terminan mandando cosas distintas — que es el defecto que este
 * archivo cierra. `grupo` y `accionable` salen de `clasificarLead`, la misma
 * llamada que arma la cola y el foco.
 */
function esTrabajoDeHoy(estado: EstadoDelLead): boolean {
  return estado.grupo === 'trabajar' && estado.accionable
}

function ordenEnPie(kind: OsSetterNoticeKind, estado: EstadoDelLead): boolean {
  switch (kind) {
    case 'DEMO_APROBADA':
      return (
        !estado.demoEnviada &&
        gateEnvioDemo({
          stage: estado.stage,
          // `HomeLeadInput.finalUrl` es opcional (los leads viejos no lo traen);
          // el gate lo quiere `string | null`, y ausente equivale a sin link.
          finalUrl: estado.finalUrl ?? null,
          status: estado.status,
          caliente: estado.caliente,
        })
      )
    case 'DEMO_RECHAZADA':
      return estado.stage === 'RECHAZADA'
    case 'LEAD_ASIGNADO':
      return estado.stage === null || estado.stage === 'FICHA'
    case 'LEAD_REASIGNADO_SALIENTE':
      return true
    default: {
      // Guard de exhaustividad: un kind nuevo sin regla no compila.
      const _exhaustive: never = kind
      throw new Error(`Aviso sin regla de vigencia: ${String(_exhaustive)}`)
    }
  }
}

/**
 * Índice `leadId → estado` a partir de los leads YA construidos por el page.
 * Se pasa el índice y no los leads sueltos para que la lectura de avisos no
 * recorra la cartera entera por cada fila.
 */
export function indiceDeEstados(
  leads: readonly (EstadoDelLead & { id: string })[],
): Map<string, EstadoDelLead> {
  const indice = new Map<string, EstadoDelLead>()
  for (const lead of leads) {
    indice.set(lead.id, {
      stage: lead.stage,
      status: lead.status,
      caliente: lead.caliente,
      finalUrl: lead.finalUrl,
      demoEnviada: lead.demoEnviada,
      proximaAccion: lead.proximaAccion,
      grupo: lead.grupo,
      accionable: lead.accionable,
    })
  }
  return indice
}

/** Sólo para el mensaje de los tests y del invariante. */
export const COPY_YA_NO_ES_TUYO = YA_NO_ES_TUYO
