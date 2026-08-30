import Link from 'next/link'
import { PANTALLAS, rutaManual, type PantallaId } from '@/lib/leados/manual'

/**
 * El enlace a OTRA pantalla del manual, nombrándola como se llama — hermano de
 * `EnlaceChequeoFinal` y con su mismo contrato, generalizado.
 *
 * Las dos reglas que el patrón cierra, y que este repo rompió cuatro veces:
 *
 *  1. El nombre NO se escribe a mano: sale de `PANTALLAS` (el registro que la
 *     propia pantalla usa para su título y sus chips). Así la instrucción no
 *     puede volver a nombrar «Seguimiento» cuando la pantalla se llama
 *     «Registrá lo que pasó» — si el registro cambia, el texto cambia con él.
 *
 *  2. El gate se DICE, no se descubre rebotando. `accesible` es la posición
 *     derivada del server (`habilitadas ∪ completadas`): sin eso la guardia de
 *     la página redirige en silencio y el enlace es un callejón con un paso más.
 *     Sin acceso no se ofrece el salto — se nombra el destino igual y se dice
 *     qué falta para que se abra.
 */
export function EnlacePantalla({
  leadId,
  destino,
  accesible,
  cuandoFalta,
  etiqueta = 'titulo',
}: {
  leadId: string
  destino: PantallaId
  /** ¿La posición derivada la habilita o la da por completada? */
  accesible: boolean
  /**
   * Qué falta para que se abra — sólo se usa cuando NO es accesible. Se omite
   * en los destinos que la derivación garantiza siempre alcanzables desde la
   * pantalla que los nombra (ese contrato lo fija un invariante, no un comentario).
   */
  cuandoFalta?: string
  /** `corto` para el nombre del chip de navegación; `titulo` para la prosa. */
  etiqueta?: 'titulo' | 'corto'
}) {
  const def = PANTALLAS[destino]
  const nombre = `«${etiqueta === 'corto' ? def.corto : def.titulo}»`

  if (!accesible) {
    return (
      <span className="font-medium text-zinc-300">
        {nombre}
        {cuandoFalta ? ` — ${cuandoFalta}` : ''}
      </span>
    )
  }

  return (
    <Link
      href={rutaManual(leadId, destino)}
      className="font-medium text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 transition-colors hover:text-cyan-200 hover:decoration-cyan-300"
    >
      {nombre}
    </Link>
  )
}
