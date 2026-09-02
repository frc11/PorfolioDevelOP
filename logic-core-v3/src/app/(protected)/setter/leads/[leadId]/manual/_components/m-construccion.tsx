import type { DossierStage } from '@prisma/client'
import type { Brief, FaseId, Ficha } from '@/lib/leados/contracts'
import { buildConstruccionBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { SHELL_CONSTRUCCION } from '@/lib/leados/flow'
import { promptsParaFase } from '@/lib/leados/prompts-disenio'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BadgeProvisorio } from '../../_components/badge-provisorio'
import { ArrancarConstruccion } from './construccion-ctas'
import { EnlaceChequeoFinal } from './enlace-chequeo'
import { EnlacePantalla } from './enlace-pantalla'
import { EscalamientoConstruccion } from './escalamiento-construccion'
import { FaseAutoReporte } from './fase-auto-reporte'

/**
 * MC1 / MC2 — las dos pantallas de Construcción (P6-B). Un solo módulo
 * parametrizado por la LISTA de fases que la pantalla contiene: mc1 agrupa las
 * tres que se hacen con el brief a la vista (estructura/personalización/assets)
 * y mc2 las tres que se hacen sobre la demo ya construida (cta/calidad/mobile).
 *   - contexto: el bloque de Construcción re-servido (brief + materiales reales)
 *     — el MISMO builder del wizard (`buildConstruccionBlock`), ahora servido dos
 *     veces en vez de seis;
 *   - munición: los items de cada fase AGRUPADOS bajo el subtítulo de su fase,
 *     con el/los prompt(s) de diseño DENTRO del grupo que los usa
 *     (calidad→estética+motion, mobile→mobile) + el link a Claude Design;
 *   - registro: los tildes de auto-reporte, uno POR FASE (`FaseAutoReporte`,
 *     mismo `guardarProgreso` del wizard).
 *
 * Las seis fases y sus seis tildes SIGUEN EXISTIENDO — lo que se agrupó son las
 * pantallas. `progresoJson` no se entera: la unidad persistida es la fase.
 *
 * Por qué agrupadas y no concatenadas: listar los nueve items sueltos —o los
 * tres prompts juntos al pie— reintroduce A-10 («el checklist y los prompts
 * viven desconectados dentro del mismo paso»), el hallazgo que el sprint 5.3
 * vino a cerrar. El subtítulo de la fase es el ancla que reemplaza a la pantalla.
 *
 * Navegación LIBRE entre las dos (§6-3): tildar no gatea nada — lo garantiza la
 * derivación (`manual.ts`), acá solo se presenta.
 */

/** El shell vigente de una fase (título + items), editable por Franco. */
function shellDeFase(faseId: FaseId) {
  return SHELL_CONSTRUCCION.find((shell) => shell.id === faseId)
}

/** Contexto: el bloque de Construcción re-servido en CADA fase — así el brief y
 * los materiales están siempre a mano mientras se construye. */
export function ConstruccionContexto({
  lead,
  brief,
  ficha,
}: {
  lead: CopyBlockLead
  brief: Brief | null
  ficha: Ficha | null
}) {
  if (!brief) {
    // Inalcanzable con la guardia del server (mc1/mc2 exigen BRIEF+) — vacío
    // honesto por si el brief se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        El brief tiene que estar guardado antes de construir la demo.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo="Bloque para Claude Design"
      instruccion="El brief + los materiales reales, listos para pegar como primer mensaje."
      texto={buildConstruccionBlock(lead, brief, ficha)}
    />
  )
}

/** Un bloque de munición: el subtítulo de la fase + sus items + su(s) prompt(s).
 * Es la unidad que reemplaza a la pantalla como ancla (cierra A-10). */
function BloqueDeFase({ faseId }: { faseId: FaseId }) {
  const fase = shellDeFase(faseId)
  const prompts = promptsParaFase(faseId)
  if (!fase) return null
  return (
    <section
      aria-label={fase.titulo}
      className="border-t border-white/[0.06] pt-4 first:border-t-0 first:pt-0"
    >
      <h3 className="text-xs font-semibold text-zinc-200">{fase.titulo}</h3>
      {fase.items.length > 0 && (
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-zinc-400">
          {fase.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                aria-hidden
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* A-10: el prompt prefijado DENTRO del bloque de la fase que lo usa — no
          listado al pie de la pantalla junto a los de las otras dos. Vacío para
          las fases sin prompt lead-agnóstico. */}
      {prompts.length > 0 && (
        <div className="mt-3 space-y-3">
          {prompts.map((prompt) => (
            <CopyBlock
              key={prompt.id}
              titulo={prompt.titulo}
              instruccion={prompt.instruccion}
              texto={prompt.prompt}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/** Munición: los items de CADA fase de la pantalla, agrupados bajo el subtítulo
 * de su fase, con sus prompts dentro del grupo + el link a Claude Design (una
 * sola vez por pantalla, no una por fase). */
export function ConstruccionMunicion({ fases }: { fases: readonly FaseId[] }) {
  return (
    <div className="space-y-4">
      {/* 5.6: el badge del wizard — la secuencia del shell es provisoria por diseño. */}
      <BadgeProvisorio />

      <div className="space-y-4">
        {fases.map((faseId) => (
          <BloqueDeFase key={faseId} faseId={faseId} />
        ))}
      </div>

      <ToolGuide id="claudeDesign" />
    </div>
  )
}

/**
 * Munición de la REENTRADA (M-R). `mr` no llenaba este slot: servía el bloque
 * copiable «Bloque para Claude Design» (su contexto, el mismo de mc1/mc2) sin la
 * herramienta que lo recibe — sin lanzador, sin qué-le-das/qué-te-devuelve y, con
 * el link todavía sin cargar, sin la salida. El bloque se copiaba y no había a
 * dónde llevarlo. Es la MISMA pieza de las dos pantallas de Construcción: mr
 * pertenece a esa fase y se corrige en la misma herramienta.
 */
export function ReentradaMunicion() {
  return <ToolGuide id="claudeDesign" />
}

/**
 * Por qué los tildes están apagados, y a QUÉ botón mandar — nombrándolo como se
 * llama, diciendo dónde vive y, cuando vive en otra pantalla, ENLAZÁNDOLA.
 *
 * El motivo era uno solo y fijo: «Primero arrancá la construcción — el botón
 * está arriba». P5 lo abrió en dos porque mentía en RECHAZADA: ahí el bloque de
 * BRIEF no se monta —no hay botón arriba—, la reapertura se llama «Reabrir
 * construcción» (otra action, otra transición: RECHAZADA→CONSTRUCCION) y vive en
 * otra pantalla, «Correcciones», que además NO está en el rail de Construcción
 * (`PANTALLAS_CONSTRUCCION` son mc1 y mc2).
 *
 * Lo que quedaba abierto es lo que cierra este sprint: nombrar «Correcciones» no
 * la vuelve alcanzable. Desde mc1/mc2 no había un solo control que la nombrara —
 * el único camino era el «Ir a tu paso actual» genérico del bloque de avance, que
 * no dice a dónde lleva. Ahora el nombre ES el enlace (`EnlacePantalla`, que lo
 * lee del registro de pantallas) y la accesibilidad la decide el server, no una
 * suposición: RECHAZADA parecía garantizar `mr`, y NO lo hace — un lead PERDIDO
 * con el dossier en RECHAZADA cae a `archivo` (`posicionDe` corta por status
 * ANTES de derivar por stage), mc1/mc2 siguen navegables como completadas y el
 * salto a `mr` habría rebotado. Lo encontró el invariante antes de que saliera:
 * por eso `accesible` viaja como dato y, sin acceso, el nombre se dice igual con
 * el motivo al lado.
 *
 * Y va UNA vez, arriba del grupo, no dentro de cada tilde: repetido en los tres
 * era el mismo párrafo tres veces —y un `<a>` dentro de un `<button>` no es
 * navegable—. Mismo criterio que la explicación del auto-reporte de más abajo.
 */
/*
 * NOTA de redacción, y no es cosmética: `expectToast` de la suite busca el texto
 * del toast con `page.getByText(...)` sobre la PÁGINA ENTERA, no dentro del
 * contenedor de toasts. Una copy que contenga la frase de un toast la satisface
 * antes del click y deja pasar la aserción que viene después (medido: «con la
 * construcción arrancada» hacía verde el `expectToast(/Construcción arrancada/i)`
 * de 01-flow · B5 y el test leía el dossier antes de la transición). Por eso el
 * verbo va en subjuntivo —«cuando arranques», «cuando reabrís»—, que además deja
 * las dos ramas paralelas. El agujero del helper queda reportado aparte.
 */
function MotivoDelTilde({
  leadId,
  stage,
  correccionesAccesible,
}: {
  leadId: string
  stage: DossierStage | null
  correccionesAccesible: boolean
}) {
  if (stage === 'BRIEF') {
    return (
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        Los tildes se abren cuando arranques la construcción — el botón «Arrancar
        construcción» está acá arriba.
      </p>
    )
  }
  if (stage === 'RECHAZADA') {
    return (
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        Los tildes se abren cuando reabrís la construcción — el botón «Reabrir construcción»
        está en{' '}
        <EnlacePantalla
          leadId={leadId}
          destino="mr"
          accesible={correccionesAccesible}
          cuandoFalta="este negocio ya está cerrado, no hay retrabajo que hacer"
          etiqueta="corto"
        />
        .
      </p>
    )
  }
  return (
    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
      Las fases se marcan mientras la demo está en construcción.
    </p>
  )
}

/** Registro: UN tilde de auto-reporte por fase de la pantalla (mismo camino que
 * el checklist del wizard, sin gatear nada) + las capas que el corte 5.6 trae
 * del wizard: el CTA «Arrancar construcción» mientras el dossier sigue en BRIEF
 * (sin la transición, el borrador m13 nunca se habilita) y la capa de
 * escalamiento «me trabé» en CONSTRUCCION. Tildar sigue sin ser gate — no es
 * requisito para avanzar ni condiciona navegación (§6-3): el `disabled` de más
 * abajo solo espeja, fuera de CONSTRUCCION, la regla que el server ya aplica en
 * `saveOwnedProgreso` (3.3).
 *
 * P6-B: los seis tildes se CONSERVAN, tres por pantalla — no se fusionan en dos.
 * Cada tilde sigue siendo 1↔1 con su `FaseId`, así el progreso guardado no
 * cambia de forma ni de semántica, y destildar sigue borrando UNA fase (con dos
 * tildes, destildar «Construir» borraría tres de un saque sin mostrar cuáles).
 * La explicación del auto-reporte va UNA vez, arriba del grupo: repetida en cada
 * tilde era el mismo párrafo tres veces. */
export function ConstruccionRegistro({
  leadId,
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
  fases: readonly FaseId[]
  completadas: FaseId[]
  stage: DossierStage | null
  /** ¿La posición derivada alcanza «Correcciones»? (lo decide el server). */
  correccionesAccesible: boolean
  /** ¿Alcanza el destino del enlace al chequeo final — m14 con borrador, m13 sin él? */
  chequeoAccesible: boolean
  /** Solo para el gate del enlace al chequeo final — acá no se escribe nada. */
  draftUrl: string | null
  escaladoAt: string | null
  escaladoNota: string | null
}) {
  const puedeGuardar = stage === 'CONSTRUCCION'
  return (
    <div className="space-y-4">
      {stage === 'BRIEF' && (
        <div className="space-y-3">
          <p className="max-w-xl text-xs leading-relaxed text-zinc-300">
            El brief está listo — arrancá la construcción para habilitar el registro del
            borrador. Tildar fases no la arranca sola.
          </p>
          <ArrancarConstruccion leadId={leadId} />
        </div>
      )}

      {!puedeGuardar && (
        <MotivoDelTilde
          leadId={leadId}
          stage={stage}
          correccionesAccesible={correccionesAccesible}
        />
      )}

      {puedeGuardar && (
        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          Es auto-reporte: tildar no bloquea nada ni te hace avanzar — hacé las fases en el
          orden que te sirva. El único chequeo que gatea es{' '}
          <EnlaceChequeoFinal
            leadId={leadId}
            draftUrl={draftUrl}
            destinoAccesible={chequeoAccesible}
          />
          .
        </p>
      )}

      <ul className="space-y-2">
        {fases.map((faseId) => (
          <li key={faseId}>
            <FaseAutoReporte
              leadId={leadId}
              faseId={faseId}
              titulo={shellDeFase(faseId)?.titulo ?? faseId}
              completadas={completadas}
              puedeGuardar={puedeGuardar}
            />
          </li>
        ))}
      </ul>

      {stage === 'CONSTRUCCION' && (
        <EscalamientoConstruccion
          leadId={leadId}
          escaladoAt={escaladoAt}
          escaladoNota={escaladoNota}
        />
      )}
    </div>
  )
}
