import type { DossierStage } from '@prisma/client'
import type { Brief, FaseId, Ficha } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { armarBloqueConstruccion, avisoParaElSetter } from '@/lib/leados/bloque-construccion'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BloqueTresCapas } from './bloque-tres-capas'
import { ConstruccionRegistro } from './m-construccion'

/**
 * MC1 · «Construí la demo en Claude Design» — P42: un solo paso, pegá esto y esperá.
 *
 * Con el Gem produciendo el documento de construcción, esta pantalla deja de ser
 * «seguí esta guía de nueve puntos». Todo vive en el bloque de trabajo, en el
 * orden en que se usa:
 *
 *   1. el bloque de tres capas y su único botón de copiar;
 *   2. dónde se pega: la herramienta (`ToolGuide`), con su link o, mientras no
 *      esté, qué falta y a quién pedírselo — sin bloquear nada: el bloque se copia
 *      igual y el tilde se marca igual;
 *   3. qué le falta al documento, si le falta algo, y el texto entero;
 *   4. qué hacer mientras la herramienta trabaja y qué mirar cuando termina;
 *   5. un tilde, no tres.
 *
 * Sin zona de contexto ni de munición: el bloque no es contexto, es la carga; y la
 * herramienta va pegada al botón que copia lo que se le pega. Medido con el
 * instrumento del pliegue: con la herramienta en su zona de munición, a 390 el
 * botón de copiar quedaba fuera del primer pliegue.
 *
 * Lo que se fue, y dónde está ahora:
 *   · los nueve puntos de Estructura, Personalización y Assets reales — viajan
 *     adentro del bloque (las instrucciones, el documento y el piso de calidad);
 *   · el rótulo «Contexto del lead»;
 *   · el badge «Guía preliminar — en validación» y la explicación del auto-reporte
 *     por fases.
 *
 * «Refinar» (mc2) y «Correcciones» (mr) siguen con `m-construccion.tsx` y con el
 * bloque de siempre: este archivo no los toca.
 */

/**
 * Qué hacer mientras trabaja y qué mirar cuando termina. La verificación es una
 * COMPARACIÓN, no un juicio: la lista de secciones que devuelve la herramienta
 * contra las que pidió el brief, que se muestran acá mismo.
 */
function QueEsperar({ secciones }: { secciones: readonly string[] }) {
  return (
    <section aria-label="Qué esperar de Claude Design" className="space-y-3 border-t border-white/[0.06] pt-4">
      <div>
        <h3 className="text-xs font-semibold text-zinc-200">Mientras trabaja</h3>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
          No le escribas ni le sumes pedidos: dejalo terminar. Arma la página entera de una vez.
        </p>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-zinc-200">Cuando termine</h3>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
          Te devuelve una lista: las secciones que construyó, lo que no pudo hacer, los datos que le
          faltaron y lo que decidió solo.
        </p>
        {secciones.length > 0 && (
          <>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
              Compará sus secciones con las que pediste:
            </p>
            <ol className="mt-1.5 space-y-1 text-xs leading-relaxed text-zinc-300">
              {secciones.map((seccion, indice) => (
                <li key={`${indice}-${seccion}`} className="flex gap-2">
                  <span aria-hidden className="w-4 shrink-0 text-right tabular-nums text-zinc-500">
                    {indice + 1}.
                  </span>
                  <span>{seccion}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
          Si falta alguna, pedile esa sola, en un mensaje: si le pedís varios cambios juntos, hace
          algunos mal.
        </p>
      </div>
    </section>
  )
}

/** El bloque de trabajo de «Construir»: el bloque, qué esperar, y el tilde. */
export function ConstruirRegistro({
  leadId,
  lead,
  brief,
  ficha,
  fases,
  completadas,
  stage,
  draftUrl,
  escaladoAt,
  escaladoNota,
  correccionesAccesible,
  chequeoAccesible,
}: {
  leadId: string
  lead: CopyBlockLead
  brief: Brief | null
  ficha: Ficha | null
  fases: readonly FaseId[]
  completadas: FaseId[]
  stage: DossierStage | null
  draftUrl: string | null
  escaladoAt: string | null
  escaladoNota: string | null
  correccionesAccesible: boolean
  chequeoAccesible: boolean
}) {
  const registro = (
    <ConstruccionRegistro
      leadId={leadId}
      fases={fases}
      completadas={completadas}
      stage={stage}
      draftUrl={draftUrl}
      escaladoAt={escaladoAt}
      escaladoNota={escaladoNota}
      correccionesAccesible={correccionesAccesible}
      chequeoAccesible={chequeoAccesible}
      tildeUnico
    />
  )

  if (!brief) {
    // Inalcanzable con la guardia del server (mc1 exige BRIEF+) — vacío honesto
    // por si el brief se pierde entre carga y render. La herramienta, el tilde y
    // sus salidas quedan: no dependen del bloque.
    return (
      <div className="max-w-3xl space-y-5">
        <p className="text-xs leading-relaxed text-zinc-500">
          El brief tiene que estar guardado antes de construir la demo.
        </p>
        <ToolGuide id="claudeDesign" />
        {registro}
      </div>
    )
  }

  const bloque = armarBloqueConstruccion(lead, brief, ficha)
  // Una sola columna de lectura para todo el bloque de trabajo: el texto del
  // bloque a lo ancho de la tarjeta daba renglones de 130 caracteres a 1440.
  return (
    <div className="max-w-3xl space-y-5">
      <BloqueTresCapas
        texto={bloque.texto}
        capas={bloque.capas.map(({ id, rotulo, cuerpo, fija }) => ({ id, rotulo, cuerpo, fija }))}
        aviso={avisoParaElSetter(bloque)}
        herramienta={<ToolGuide id="claudeDesign" />}
      />
      <QueEsperar secciones={brief.secciones} />
      {registro}
    </div>
  )
}
