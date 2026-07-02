import type { DossierStage } from '@prisma/client'
import { ArrowRight, CheckCircle2, Hourglass, Send, Target, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Tono del cartel: `foco` = hay trabajo del setter AHORA (cyan, protagonista, la
 * disciplina B9 reserva el cyan a lo accionable); `espera` = la pelota la tiene
 * Franco (revisión) o falta una condición externa (que el lead responda) —
 * informativo, sin color; `cerrado` = el lead terminó.
 */
type FocoTono = 'foco' | 'espera' | 'cerrado'

type FocoDescriptor = {
  tono: FocoTono
  icon: LucideIcon
  eyebrow: string
  titulo: string
  detalle: string
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
export function describirFoco(
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
        detalle: 'Publicá el draft y pasá el self-check para mandarla a revisión.',
      }
    case 'RECHAZADA':
      return {
        tono: 'foco',
        icon: ArrowRight,
        eyebrow: 'Tu paso ahora',
        titulo: 'Aplicá las correcciones de Franco',
        detalle: 'Rehacé lo que marcó y volvé a pasar por draft y self-check.',
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

const TONO_STYLES: Record<
  FocoTono,
  { container: string; bar: string; eyebrow: string; icon: string; detalle: string }
> = {
  foco: {
    container: 'border-cyan-400/25 bg-cyan-500/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
    bar: 'bg-cyan-400/80',
    eyebrow: 'text-cyan-300/80',
    icon: 'text-cyan-300',
    detalle: 'text-cyan-100/70',
  },
  // espera/cerrado: texto en zinc-400 (≈7.9:1 sobre el fondo) — zinc-500 no llega al
  // 4.5:1 de WCAG AA para texto chico. El cyan queda reservado a lo accionable.
  espera: {
    container: 'border-white/10 bg-white/[0.03]',
    bar: 'bg-zinc-500/60',
    eyebrow: 'text-zinc-400',
    icon: 'text-zinc-400',
    detalle: 'text-zinc-400',
  },
  cerrado: {
    container: 'border-white/10 bg-white/[0.02]',
    bar: 'bg-zinc-600/60',
    eyebrow: 'text-zinc-400',
    icon: 'text-zinc-400',
    detalle: 'text-zinc-400',
  },
}

/**
 * Cartel de dirección del wizard: arriba de todo (bajo el rail), le dice al setter
 * QUÉ está pasando con ESTE lead AHORA, en una línea. Solo presentación.
 */
export function PasoActualBanner({
  stage,
  gateAbierto,
  openerPendiente,
}: {
  stage: DossierStage | null
  gateAbierto: boolean
  openerPendiente: boolean
}) {
  const foco = describirFoco(stage, gateAbierto, openerPendiente)
  const styles = TONO_STYLES[foco.tono]
  const Icon = foco.icon

  return (
    <section
      aria-label="Tu paso ahora en este lead"
      className={cn('relative overflow-hidden rounded-2xl border p-4', styles.container)}
    >
      {/* Acento al borde izquierdo — rima con el marco del step activo (mismo tono). */}
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', styles.bar)} />

      <p
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em]',
          styles.eyebrow,
        )}
      >
        <Icon size={13} strokeWidth={1.5} aria-hidden className={cn('shrink-0', styles.icon)} />
        {foco.eyebrow}
      </p>

      <p className="mt-1.5 text-base font-bold leading-snug tracking-tight text-zinc-100 sm:text-lg">
        {foco.titulo}
      </p>

      <p className={cn('mt-1 max-w-xl text-xs leading-relaxed', styles.detalle)}>{foco.detalle}</p>
    </section>
  )
}
