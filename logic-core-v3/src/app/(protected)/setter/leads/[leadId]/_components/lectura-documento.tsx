import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ExplicacionLectura } from '@/lib/leados/brief-vueltas'
import { cn } from '@/lib/utils'

/**
 * P40 — Lo que la pantalla leyó del encabezado del documento de la vuelta 4,
 * pegado debajo del campo donde se pega. Solo presenta: qué se leyó, qué falta,
 * por qué importa y qué hacer lo compone `explicarLectura` (`brief-vueltas.ts`).
 *
 * Verde cuando está lo que la construcción necesita; ámbar cuando falta algo o
 * el documento no trae encabezado. Nunca rojo: nada de esto frena el guardado.
 */
export function LecturaDocumento({ explicacion }: { explicacion: ExplicacionLectura }) {
  const listo = explicacion.tono === 'listo'
  const Icono = listo ? CheckCircle2 : AlertTriangle

  return (
    <section
      aria-label="Lo que leí del documento"
      className={cn(
        'rounded-xl border p-3',
        listo ? 'border-emerald-400/20 bg-emerald-500/[0.06]' : 'border-amber-400/20 bg-amber-500/[0.06]',
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-xs font-semibold',
          listo ? 'text-emerald-300' : 'text-amber-300',
        )}
      >
        <Icono size={14} strokeWidth={1.5} aria-hidden className="shrink-0" />
        {explicacion.titulo}
      </p>
      {explicacion.lineas.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {explicacion.lineas.map((linea) => (
            <li
              key={linea}
              className={cn(
                'break-words text-xs leading-relaxed',
                listo ? 'text-emerald-200/80' : 'text-amber-200/80',
              )}
            >
              {linea}
            </li>
          ))}
        </ul>
      )}
      {explicacion.queHacer && (
        <p className="mt-2 text-xs leading-relaxed text-amber-100/90">
          <span className="font-semibold">Qué hacer: </span>
          {explicacion.queHacer}
        </p>
      )}
    </section>
  )
}
