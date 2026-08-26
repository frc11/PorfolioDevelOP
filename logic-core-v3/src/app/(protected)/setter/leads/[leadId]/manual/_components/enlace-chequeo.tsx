import Link from 'next/link'
import { rutaManual } from '@/lib/leados/manual'

/**
 * El enlace al chequeo final (m14) — fuente ÚNICA del salto y de su gate.
 *
 * Durante la construcción el chequeo final se NOMBRA en varias pantallas (el
 * borrador ya publicado, las fases de Construcción) y hasta este sprint ninguna
 * enlazaba a él: el chip de navegación solo aparece con `m14` en `completadas`,
 * y `completadasDe` la marca recién en EN_REVISION/APROBADA — o sea, el link
 * salía cuando el chequeo ya se había hecho. El setter tenía que escribir la URL
 * a mano.
 *
 * El gate se respeta y se DICE, no se descubre rebotando: `m14` está habilitada
 * solo con el borrador publicado (`posicionDe`, rama CONSTRUCCION). Sin
 * `draftUrl` la guardia de la página redirige en silencio — otro callejón, con
 * un paso más. Así que sin borrador esto no ofrece el chequeo: nombra lo que
 * falta y lleva a la pantalla donde se resuelve (m13).
 */
export function EnlaceChequeoFinal({
  leadId,
  draftUrl,
  className,
}: {
  leadId: string
  draftUrl: string | null
  className?: string
}) {
  const clase =
    className ??
    'font-medium text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 transition-colors hover:text-cyan-200 hover:decoration-cyan-300'

  if (!draftUrl) {
    return (
      <Link href={rutaManual(leadId, 'm13')} className={clase}>
        el chequeo final — se abre cuando publiques el borrador
      </Link>
    )
  }

  return (
    <Link href={rutaManual(leadId, 'm14')} className={clase}>
      el chequeo final
    </Link>
  )
}
