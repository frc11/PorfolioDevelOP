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
 *
 * `destinoAccesible` cierra el agujero que quedaba, y que no era hipotético: el
 * bloque que sirve este enlace se monta por STAGE (`stage === 'CONSTRUCCION'`),
 * y la posición se deriva ANTES por STATUS — un lead PERDIDO con el dossier en
 * CONSTRUCCION cae a `archivo` con `habilitadas` vacía, mc1/mc2 siguen
 * navegables como completadas, y los dos destinos de este enlace dejan de
 * existir. El salto rebotaba: el mismo callejón que la pieza vino a cerrar, un
 * status más allá. Lo calcula el caller con el MISMO predicado que la guardia de
 * la página (`alcanzable`), sobre la misma rama de `draftUrl` que se usa acá.
 */
export function EnlaceChequeoFinal({
  leadId,
  draftUrl,
  destinoAccesible,
  className,
}: {
  leadId: string
  draftUrl: string | null
  /**
   * ¿La posición derivada alcanza el destino que este enlace elige — m14 con
   * borrador, m13 sin él? Lo decide el server; sin esto el salto rebota.
   */
  destinoAccesible: boolean
  className?: string
}) {
  const clase =
    className ??
    'font-medium text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 transition-colors hover:text-cyan-200 hover:decoration-cyan-300'

  // Sin acceso al destino no se ofrece ningún salto: se nombra el chequeo y
  // listo. Pasa con el lead cerrado (PERDIDO) — no hay a dónde ir, y decirlo
  // otra vez acá sería repetir lo que la pantalla ya dice arriba.
  if (!destinoAccesible) {
    return <span className="font-medium text-zinc-300">el chequeo final</span>
  }

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
