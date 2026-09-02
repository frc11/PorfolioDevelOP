import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { rutaManual, type PantallaId, type PosicionManual } from '@/lib/leados/manual'
import { derivarRecorrido, type PasoRecorrido } from '@/lib/leados/recorrido'

/**
 * LA FRANJA DEL RECORRIDO (P20) — una sola para las catorce pantallas.
 *
 * El manual sabía contar el pasado y no el futuro: había una tira de
 * completadas al pie y un rótulo con el nombre de la fase, y ninguna de las dos
 * decía cuánto falta ni qué viene. El segundo valor del brief es «no tener que
 * pensar qué sigue»; la única pregunta que la pantalla contestaba era «qué
 * hiciste». Esta franja contesta la otra, y REEMPLAZA a las dos (tres cosas
 * diciendo lo mismo es peor que una diciéndolo mal).
 *
 * ── Lo que la franja NO hace ────────────────────────────────────────────────
 * No navega a donde el motor no deja. Un paso sin destino alcanzable no se
 * pinta como enlace: es un `<span>` que se ve, se lee y dice «todavía no». Es
 * el contrato de `EnlacePantalla`, aplicado a los nueve pasos — sin él, el
 * salto rebotaría en silencio contra el `redirect` de la guardia de la página,
 * que es el callejón con un paso más que este repo ya cerró una vez.
 *
 * ── Qué se ve a cada ancho ──────────────────────────────────────────────────
 * El recorrido entero está SIEMPRE: nueve posiciones, con lo hecho, dónde está
 * el lead y lo que falta. Lo que se adapta es cuánto se escribe. A ≥640 px cada
 * paso lleva su nombre; abajo de eso los nombres se guardan salvo en los dos
 * que contestan la pregunta —el paso de ahora y el que sigue— y el resto queda
 * como posición numerada. El nombre completo viaja igual en el nombre
 * accesible, así que un lector de pantalla lee los nueve a cualquier ancho.
 *
 * ── Dos marcas, no una ──────────────────────────────────────────────────────
 * El acento cyan dice dónde está EL LEAD (`posicion.actual`, el dato que P19
 * dejó consistente). `aria-current="page"` dice qué pantalla estás MIRANDO.
 * Coinciden casi siempre, y cuando no —entraste a una completada— la franja
 * sigue señalando el paso de ahora en vez de mudarse con el ojo.
 */

/**
 * El chip. `h-6`/`min-w-6` son 24 px: el mínimo de área táctil, que es lo que
 * fija el alto de la franja entera — una línea, nunca dos.
 *
 * Por qué el alto importa tanto acá: la medición de las catorce mostró que una
 * franja que se parte en dos líneas a 390 px le cuesta 62 px al pliegue en vez
 * de 33, y con eso la ficha —la única pantalla de trabajo cuyo primer campo
 * entraba a ese ancho— lo perdía por 3 px. El ancho se ajusta con el padding y
 * con cuántos nombres se escriben; el alto no se negocia.
 */
const CHIP =
  'inline-flex h-6 min-w-6 items-center justify-center gap-1 rounded-full border px-1.5 text-[11px] font-medium leading-none transition-colors'

const TONO: Record<PasoRecorrido['estado'], string> = {
  actual: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
  completado: 'border-white/10 bg-white/[0.03] text-zinc-400',
  alcanzable: 'border-white/10 bg-white/[0.03] text-zinc-400',
  futuro: 'border-white/[0.06] bg-transparent text-zinc-600',
}

const TONO_HOVER = 'hover:bg-white/[0.07] hover:text-zinc-200'

/** Cómo se nombra cada estado para quien no ve la franja. */
const ESTADO_DICHO: Record<PasoRecorrido['estado'], string> = {
  actual: 'tu paso ahora',
  completado: 'completado',
  alcanzable: 'disponible',
  futuro: 'todavía no',
}

export function FranjaRecorrido({
  leadId,
  posicion,
  pantalla,
}: {
  leadId: string
  posicion: PosicionManual
  /** La pantalla que se está renderizando — marca el `aria-current`. */
  pantalla: PantallaId
}) {
  const pasos = derivarRecorrido(posicion, pantalla)

  // Los dos pasos que contestan «¿dónde estoy?» y «¿qué sigue?». Son los que
  // conservan el nombre a cualquier ancho: sin ellos, a 390 la franja diría
  // cuánto falta pero no de qué se trata.
  const iActual = pasos.findIndex((p) => p.estado === 'actual')
  const iSiguiente = pasos.findIndex(
    (p, i) => i > iActual && p.estado !== 'completado',
  )
  // El primero que el motor no deja abrir DE LOS QUE VIENEN. Dos recortes, y los
  // dos los encontró el censo de las catorce:
  //
  //  · sólo uno lo escribe — repetirlo en los cuatro que vienen detrás no agrega
  //    nada y la franja dejaría de entrar en una línea;
  //  · y sólo hacia adelante. Sin el corte, un lead cuyo opener nunca se
  //    registró leía «Opener · todavía no» DOS pasos ATRÁS del que estaba
  //    haciendo: la frase contesta «qué sigue», y un paso que quedó atrás no es
  //    lo que sigue.
  //
  // Sin paso de ahora (las tres pantallas de estado) no se escribe: ahí el
  // motivo de que no haya próximo paso lo dice la pantalla —le toca al negocio,
  // le toca a Franco, el negocio se cerró— y «todavía no» sobre un lead cerrado
  // prometería algo que no va a pasar.
  const iPrimerFuturo =
    iActual === -1 ? -1 : pasos.findIndex((p, i) => i > iActual && p.estado === 'futuro')

  return (
    <nav
      data-slot="franja-recorrido"
      aria-label="Recorrido del lead"
      className="min-w-0"
    >
      {/* `flex-nowrap` + `overflow-x-auto` es la RED, no el modo normal: con los
          nombres guardados los nueve entran en los 366 px de un teléfono. Si
          algún día un paso se llama más largo, la franja se desplaza en vez de
          partirse en dos líneas — que es la forma en que le costaría el pliegue
          a las catorce a la vez. */}
      <ol className="flex flex-nowrap items-center gap-1 overflow-x-auto sm:flex-wrap sm:overflow-x-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pasos.map((paso, i) => {
          const siempreConNombre = i === iActual || i === iSiguiente
          const conFalta = i === iPrimerFuturo
          const dicho = ESTADO_DICHO[paso.estado]

          const cuerpo = (
            <>
              {paso.estado === 'completado' ? (
                <Check
                  size={11}
                  strokeWidth={1.5}
                  aria-hidden
                  className="shrink-0 text-emerald-400/80"
                />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    'shrink-0 text-[10px] font-semibold tabular-nums',
                    paso.estado === 'actual' ? 'text-cyan-300/80' : 'text-zinc-600',
                    // El número es la POSICIÓN, y sólo se escribe donde el
                    // nombre no está: con los dos a la vez el chip pagaría 14 px
                    // de ancho por decir lo mismo dos veces.
                    siempreConNombre ? 'hidden' : 'sm:hidden',
                  )}
                >
                  {paso.orden}
                </span>
              )}
              <span
                className={cn(
                  'whitespace-nowrap',
                  siempreConNombre ? '' : 'hidden sm:inline',
                )}
              >
                {paso.titulo}
              </span>
              {/* El «todavía no» se escribe sólo donde hay lugar para escribirlo.
                  A 390 px se guarda con el resto de los nombres: el estado sigue
                  dicho por el tono, por la falta de enlace y por el nombre
                  accesible del chip, que lo lleva a cualquier ancho. */}
              {conFalta && (
                <span
                  aria-hidden
                  className="hidden whitespace-nowrap text-[10px] text-zinc-600 sm:inline"
                >
                  · todavía no
                </span>
              )}
            </>
          )

          // El nombre accesible lleva SIEMPRE el nombre del paso y su estado —
          // lo escriba la franja o no. Así los nueve se leen a cualquier ancho.
          const nombreAccesible = `${paso.titulo} — ${dicho}`

          return (
            <li key={paso.fase} className="shrink-0">
              {paso.destino ? (
                <Link
                  href={rutaManual(leadId, paso.destino)}
                  aria-label={nombreAccesible}
                  aria-current={paso.viendo ? 'page' : undefined}
                  className={cn(
                    CHIP,
                    TONO[paso.estado],
                    TONO_HOVER,
                    paso.viendo && 'ring-1 ring-inset ring-white/20',
                  )}
                >
                  {cuerpo}
                </Link>
              ) : (
                /* Sin destino alcanzable NO se pinta un enlace: el salto
                   rebotaría contra la guardia de la página. Se ve, se lee, y
                   dice que todavía no. */
                <span
                  aria-label={nombreAccesible}
                  className={cn(CHIP, TONO[paso.estado], 'cursor-default')}
                >
                  {cuerpo}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
