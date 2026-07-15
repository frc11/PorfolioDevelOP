/**
 * LeadOS A-29 — La ÚNICA derivación del "paso del lead" a partir del stage.
 *
 * Antes vivían dos derivaciones reales del mismo concepto: `pasoActual`
 * (dossier-stepper) y `describirFoco` (paso-actual-banner), con `anchorActivo`
 * (lead-wizard) delegando en la primera. Acá se unifican: `derivarPasoDelLead`
 * devuelve las tres caras del mismo hecho —índice del rail, cartel de dirección
 * y sección de aterrizaje— desde una sola llamada, así stepper, banner y anchor
 * no pueden desincronizarse cuando el Bloque 4/5 multiplique los consumidores.
 *
 * Solo derivación pura (sin Prisma, sin 'use server'): se importa desde client
 * components; los íconos de lucide viajan como referencias en el descriptor.
 */
import type { DossierStage } from '@prisma/client'
import { ArrowRight, CheckCircle2, Hourglass, Send, Target, type LucideIcon } from 'lucide-react'

/**
 * Tono del cartel: `foco` = hay trabajo del setter AHORA (cyan, protagonista, la
 * disciplina B9 reserva el cyan a lo accionable); `espera` = la pelota la tiene
 * Franco (revisión) o falta una condición externa (que el lead responda) —
 * informativo, sin color; `cerrado` = el lead terminó.
 */
export type FocoTono = 'foco' | 'espera' | 'cerrado'

export type FocoDescriptor = {
  tono: FocoTono
  icon: LucideIcon
  eyebrow: string
  titulo: string
  detalle: string
}

/** Secciones del wizard a las que se puede aterrizar el foco al abrir el lead. */
export type StepAnchorId = 'evaluacion' | 'opener' | 'brief' | 'construccion' | 'seguimiento'

export type PasoDelLead = {
  /** Índice del SIGUIENTE paso accionable en el rail de 5 pasos (ex `pasoActual`). */
  indice: number
  /** Cartel de dirección del wizard (ex `describirFoco`). */
  foco: FocoDescriptor
  /** Sección a enfocar al abrir el lead; null = tope natural (ex `anchorActivo`). */
  anchor: StepAnchorId | null
}

/**
 * Índice del paso "actual" según el stage del dossier. El `stage` nombra el hito
 * cumplido; el índice apunta al SIGUIENTE paso accionable. Fuente única de "dónde
 * está el lead" — la reusa el aterrizaje al abrir (`step-anchor`) para no re-derivar
 * el flujo ni tocar gates.
 */
function pasoActual(stage: DossierStage | null): number {
  switch (stage) {
    case null:
    case 'FICHA':
      return 0
    case 'EVALUADA':
    case 'DESCARTADA':
      return 2
    case 'BRIEF':
    case 'CONSTRUCCION':
    case 'RECHAZADA':
      return 3
    case 'EN_REVISION':
      return 4
    case 'APROBADA':
      return 5
  }
}

/**
 * Verbaliza el paso activo del dossier para un setter NO-técnico — el cartel de
 * "modo dirección" del wizard (hermano liviano del `FocoSurface` del home). Deriva
 * del `stage` (la misma fuente de verdad que `pasoActual` lee para el rail y el
 * scroll, así nunca contradice "dónde está el lead") más `gateAbierto`, que el shell
 * YA calcula (`gateBriefAbierto(status, caliente)`): NO lo re-deriva, lo recibe. Ese
 * gate distingue las dos fases que dependen de una condición externa — en EVALUADA y
 * APROBADA el step de abajo se bloquea hasta que el lead responde (o es caliente), así
 * que el cartel se apaga a `espera` para no mandar a hacer algo que todavía no se puede.
 * Exhaustivo por stage: un stage nuevo rompe el build hasta describirse acá (mismo
 * candado que `pasoActual`).
 *
 * `openerPendiente` (B6.1): en EVALUADA con el gate cerrado y sin primer contacto, el
 * paso real es MANDAR el opener, no el brief bloqueado — el shell lo calcula y lo pasa
 * (igual que `gateAbierto`), sin re-derivarlo acá.
 */
function describirFoco(
  stage: DossierStage | null,
  gateAbierto: boolean,
  openerPendiente: boolean,
): FocoDescriptor {
  switch (stage) {
    case null:
    case 'FICHA':
      return {
        tono: 'foco',
        icon: Target,
        eyebrow: 'Tu paso ahora',
        titulo: 'Cargá la ficha del negocio',
        detalle: 'Completá los datos del lead para poder evaluarlo.',
      }
    case 'EVALUADA':
      // Con el gate cerrado y sin primer contacto, la acción REAL es mandar el opener:
      // el brief de abajo está bloqueado hasta que el lead responda, así que dirigir ahí
      // (o decir "esperá") saltea lo único accionable. `openerPendiente` lo decide el shell.
      if (openerPendiente) {
        return {
          tono: 'foco',
          icon: Send,
          eyebrow: 'Tu paso ahora',
          titulo: 'Mandá el primer mensaje (opener)',
          detalle:
            'Escribí el opener y registralo — el brief se abre cuando el negocio responda.',
        }
      }
      // El brief se habilita cuando el lead responde el primer contacto (o si es
      // caliente). Sin gate, el step de abajo está bloqueado → cartel en espera, sin
      // mandar a "generá el brief" todavía.
      return gateAbierto
        ? {
            tono: 'foco',
            icon: ArrowRight,
            eyebrow: 'Tu paso ahora',
            titulo: 'Brief de diseño',
            detalle: 'Es el próximo paso: generá el brief con el Gem y traé la respuesta acá.',
          }
        : {
            tono: 'espera',
            icon: Hourglass,
            eyebrow: 'En espera',
            titulo: 'Brief de diseño',
            detalle: 'El lead avanza — esperá la respuesta del primer contacto para arrancar el brief.',
          }
    case 'BRIEF':
      return {
        tono: 'foco',
        icon: ArrowRight,
        eyebrow: 'Tu paso ahora',
        titulo: 'Construí la demo',
        detalle: 'Tenés el brief guardado — arrancá la construcción de la demo.',
      }
    case 'CONSTRUCCION':
      return {
        tono: 'foco',
        icon: ArrowRight,
        eyebrow: 'Tu paso ahora',
        titulo: 'Seguí construyendo la demo',
        detalle: 'Publicá el borrador y pasá el chequeo final para mandarla a revisión.',
      }
    case 'RECHAZADA':
      return {
        tono: 'foco',
        icon: ArrowRight,
        eyebrow: 'Tu paso ahora',
        titulo: 'Aplicá las correcciones de Franco',
        detalle: 'Rehacé lo que marcó y volvé a pasar por borrador y chequeo final.',
      }
    case 'EN_REVISION':
      return {
        tono: 'espera',
        icon: Hourglass,
        eyebrow: 'En revisión',
        titulo: 'Franco está revisando tu demo',
        detalle: 'No hay nada que hacer ahora — te avisamos cuando la apruebe o pida cambios.',
      }
    case 'APROBADA':
      // El envío del link también espera a que el lead responda (o sea caliente):
      // el step de Seguimiento lo libera con esa condición, no apenas se aprueba.
      return gateAbierto
        ? {
            tono: 'foco',
            icon: ArrowRight,
            eyebrow: 'Tu paso ahora',
            titulo: 'Enviá el link de la demo',
            detalle: 'La demo está aprobada — mandá el link y seguí el contacto en «Seguimiento».',
          }
        : {
            tono: 'espera',
            icon: Hourglass,
            eyebrow: 'En espera',
            titulo: 'Demo aprobada',
            detalle: 'El link se libera cuando el negocio responda (o si el lead fuera caliente).',
          }
    case 'DESCARTADA':
      return {
        tono: 'cerrado',
        icon: CheckCircle2,
        eyebrow: 'Resultado',
        titulo: 'Lead descartado',
        detalle: 'La evaluación lo descartó — el trabajo de este lead terminó.',
      }
    default: {
      // Exhaustividad: si se agrega un stage al enum y no se describe acá, esto NO
      // compila (stage deja de ser `never`) — el build avisa antes que el runtime.
      const _exhaustivo: never = stage
      throw new Error(`describirFoco: stage no contemplado: ${String(_exhaustivo)}`)
    }
  }
}

/**
 * Qué sección enfocar al abrir, derivado del paso canónico (`pasoActual`) — sin
 * re-implementar el flujo. `null` = no scrollear (lead nuevo o sin sección útil):
 * se queda en el tope natural, con la cabecera del lead a la vista.
 *
 * Mapa índice→sección (índice = SIGUIENTE paso accionable, ver `pasoActual`):
 *  0 Ficha → null (lead nuevo, tope natural)   ·   2 Brief → «brief»
 *  3 Construcción → «construccion»   ·   4 Revisión (EN_REVISION) → «construccion»
 *    (no hay step del setter; su build entregado vive ahí)
 *  5 (APROBADA) → «seguimiento» (el envío del link vive ahí)
 * Descartado: brief/construcción/seguimiento no se renderizan → el foco útil es
 * el veredicto («evaluacion»).
 */
function anchorActivo(stage: DossierStage | null, openerPendiente: boolean): StepAnchorId | null {
  if (stage === 'DESCARTADA') return 'evaluacion'
  // B6.1: EVALUADA con gate cerrado y sin primer contacto → el paso activo es el opener,
  // no el Brief (bloqueado hasta que el lead responda). Interceptar acá evita que el
  // scroll aterrice en un paso que el setter todavía no puede tocar.
  if (openerPendiente) return 'opener'
  switch (pasoActual(stage)) {
    // DESCARTADA también cae en 2 vía `pasoActual`, pero se intercepta arriba
    // (su «brief» no se renderiza) — acá el 2 es solo EVALUADA.
    case 2:
      return 'brief'
    case 3:
    case 4:
      return 'construccion'
    case 5:
      return 'seguimiento'
    default:
      return null
  }
}

/**
 * La derivación única (A-29). El shell la llama UNA vez con lo que ya calcula
 * (`gateAbierto` vía `gateBriefAbierto`, `openerPendiente`) y reparte las caras:
 * `indice` → DossierStepper · `foco` → PasoActualBanner (y el tono del marco del
 * step activo) · `anchor` → StepAnchor. Cada cara devuelve, por stage, exactamente
 * lo que las derivaciones previas devolvían por separado.
 */
export function derivarPasoDelLead(
  stage: DossierStage | null,
  gateAbierto: boolean,
  openerPendiente: boolean,
): PasoDelLead {
  return {
    indice: pasoActual(stage),
    foco: describirFoco(stage, gateAbierto, openerPendiente),
    anchor: anchorActivo(stage, openerPendiente),
  }
}
