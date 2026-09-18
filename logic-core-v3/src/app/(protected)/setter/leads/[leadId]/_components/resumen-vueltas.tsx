import type { VueltasBrief } from '@/lib/leados/contracts'
import { GUIA_VUELTAS_GEM } from '@/lib/leados/guidance-content'

/**
 * P40 — Las vueltas con el Gem que quedaron guardadas, de consulta: la lectura
 * estética, las decisiones, el borrador si no llegó el documento, y lo que el
 * setter corrigió en cada una. Plegado: es el proceso, no la carga — lo que
 * viaja a la construcción ya se ve arriba en el resumen del brief.
 *
 * Lo usan el resumen del brief en m6 y la revisión de Franco. Sin estado.
 */
export function ResumenVueltas({ vueltas }: { vueltas: VueltasBrief }) {
  const textos = GUIA_VUELTAS_GEM.resumen
  const partes = [
    { id: 'lectura', titulo: textos.lectura, vuelta: vueltas.lectura },
    { id: 'decisiones', titulo: textos.decisiones, vuelta: vueltas.decisiones },
    { id: 'especificacion', titulo: textos.borrador, vuelta: vueltas.especificacion },
    { id: 'huecos', titulo: textos.documento4, vuelta: vueltas.huecos },
  ].filter((parte) => parte.vuelta && (('respuesta' in parte.vuelta && parte.vuelta.respuesta) || parte.vuelta.correccion))

  if (partes.length === 0) return null

  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
        {textos.vueltas}
      </summary>
      <div className="mt-2 space-y-3">
        {partes.map(({ id, titulo, vuelta }) => (
          <div key={id} className="space-y-1">
            <p className="text-xs font-semibold text-zinc-400">{titulo}</p>
            {vuelta && 'respuesta' in vuelta && vuelta.respuesta && (
              <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-white/[0.06] bg-black/30 p-3 text-xs leading-relaxed text-zinc-500">
                {vuelta.respuesta}
              </p>
            )}
            {vuelta?.correccion && (
              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-zinc-400">
                <span className="font-semibold">{textos.correccion}:</span> {vuelta.correccion}
              </p>
            )}
          </div>
        ))}
      </div>
    </details>
  )
}
