'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { FASE_IDS, type FaseId } from '@/lib/leados/contracts'
import { useAutosave } from '@/lib/use-autosave'
import { guardarProgreso } from '@/app/(protected)/setter/_actions/dossier.actions'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { FaseAutoReporte } from './fase-auto-reporte'

/**
 * P25 — EL DUEÑO del progreso de Construcción.
 *
 * ── El defecto que cierra ────────────────────────────────────────────────────
 * Cada tilde era su propio escritor y componía el conjunto a persistir desde la
 * prop `completadas` del server — la MISMA para los tres, y que solo se renueva
 * cuando vuelve el `router.refresh()`. Tres clics dentro de esa ventana
 * computaban su `siguiente` sobre la misma base vieja: el último write ganaba y
 * de tres marcas quedaba UNA. Medido sobre este árbol antes de tocarlo: 1 de 3 a
 * TODOS los ritmos probados, de 0 a 1500 ms entre clics.
 *
 * ── La salida: los DOS mecanismos del que sí funciona ────────────────────────
 * No es uno, son dos, y el chequeo final (`chequeo-form.tsx`) tiene los dos —
 * por eso sostiene diez tildes en ráfaga sin perder ninguno:
 *
 *   1. UN dueño del estado del blob. El conjunto vive acá, en `useState`, y cada
 *      tilde lo modifica con un updater funcional (`actual => ...`). El punto de
 *      partida de la marca N es el estado que dejó la marca N-1, no una prop del
 *      server que todavía no se enteró. Es lo que hace que el resultado sea el
 *      COMPUESTO de los clics y no el último.
 *   2. Autoguardado con coalescing (`useAutosave`, `delayMs: 0`). Deja UNA
 *      escritura en vuelo y agrupa las que lleguen mientras tanto: al terminar,
 *      reintenta lo más nuevo — que ya contiene todas las marcas. Tres clics
 *      producen dos escrituras, no tres, y la segunda las lleva todas.
 *
 * `delayMs: 0` por el mismo motivo que el chequeo: un tilde es una acción
 * TERMINADA, no una tecla en medio de una frase. Esperar una pausa deja abierta
 * la ventana de tildar-y-salir.
 *
 * ── Qué NO hace ──────────────────────────────────────────────────────────────
 * No descarta nada por llegar tarde: no hay "gana el último" ni escrituras
 * tiradas: la que quedó afuera del vuelo se reintenta entera. Lo único que NO se
 * reintenta solo es un guardado que el SERVER rechazó (lead ajeno, stage movido):
 * ahí el hook para —loopear sobre un fallo duro es peor— y el rebote queda a la
 * vista, fijo, con el toast al lado. El trabajo sigue en pantalla y el reintento
 * es tocar de nuevo. Mismo criterio que la ficha, el brief y el chequeo.
 *
 * NO cierra la ventana del SERVER: `saveOwnedProgreso` sigue escribiendo el blob
 * entero sin delta, igual que los otros tres. Eso es pre-existente, afecta a los
 * cuatro por igual y hoy es inalcanzable desde la interfaz porque este componente
 * nunca encima dos escrituras — que es exactamente lo que lo salvaba al chequeo.
 * Cerrarla pide serializar escrituras y es otra decisión.
 *
 * ── P28: el refresh ya no está, y la franja se actualiza igual ─────────────
 * `progresoJson` alimenta la derivación (`manual.ts`): una pantalla de
 * Construcción se marca completada cuando sus tres fases lo están, y el paso
 * destacado es la primera fase sin tildar. Eso lo pintan la franja del recorrido
 * y la barra de acción, que son server. Hasta P25 había un `router.refresh()`
 * POR CLIC —y su latencia ERA la ventana de la carrera—; P25 lo dejó en uno por
 * ráfaga asentada.
 *
 * P28 lo saca del todo: `guardarProgreso` revalida, y la respuesta del POST de
 * la server action YA TRAE el árbol re-renderizado — el refresh pedía ese mismo
 * árbol una segunda vez, que son ~290 ms de servidor por tilde. Está medido con
 * el instrumento de P28 (`npm run test:perf`), que compara el texto de `main`
 * antes y después del tilde: sin el refresh la pantalla sigue cambiando en las
 * tres pasadas, con un viaje menos.
 */
export function RegistroFases({
  leadId,
  fases,
  completadas,
  titulos,
  puedeGuardar,
}: {
  leadId: string
  /** Las fases de ESTA pantalla (mc1 o mc2) — las que se renderizan. */
  fases: readonly FaseId[]
  /** El blob COMPLETO del server: las seis, no solo las de esta pantalla. */
  completadas: FaseId[]
  titulos: Record<string, string>
  puedeGuardar: boolean
}) {
  // El estado arranca en orden canónico de `FASE_IDS` y se mantiene así en cada
  // toggle: sin eso, agregar y quitar la misma fase devolvería el mismo conjunto
  // con otro orden, el serializador lo leería como "sucio" y el autosave
  // dispararía un guardado que no cambia nada.
  const [marcadas, setMarcadas] = useState<FaseId[]>(() =>
    FASE_IDS.filter((id) => completadas.includes(id)),
  )
  // Solo para el spinner: cuál fue el último tilde tocado. No participa del
  // guardado — el conjunto que se persiste es `marcadas`, entero.
  const [ultimoTocado, setUltimoTocado] = useState<FaseId | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)

  // La llamada va INLINE dentro de `useAutosave`, no extraída a un `useCallback`
  // de más arriba: el invariante del acuse de recibo resuelve el envoltorio de
  // cada call-site buscando hacia atrás la apertura que lo contiene, y una
  // llamada sacada del bloque deja de leerse como escritura continua. Sacarla
  // no rompía el invariante — lo dejaba MIRANDO otra cosa, que es peor.
  const autosave = useAutosave<FaseId[]>({
    value: marcadas,
    enabled: puedeGuardar,
    delayMs: 0,
    save: async (actual) => {
      const resultado = await guardarProgreso(leadId, { completadas: actual })
      if (resultado.success) {
        setErrorGuardado(null)
      } else {
        setErrorGuardado(resultado.error)
        toast.error(resultado.error)
      }
      return resultado
    },
  })

  const toggle = useCallback((faseId: FaseId) => {
    setUltimoTocado(faseId)
    // EL updater funcional: la base es el estado que dejó el clic anterior.
    setMarcadas((actual) => {
      const siguiente = actual.includes(faseId)
        ? actual.filter((id) => id !== faseId)
        : [...actual, faseId]
      return FASE_IDS.filter((id) => siguiente.includes(id))
    })
  }, [])

  return (
    <>
      <ul className="space-y-2">
        {fases.map((faseId) => (
          <li key={faseId}>
            <FaseAutoReporte
              faseId={faseId}
              titulo={titulos[faseId] ?? faseId}
              marcada={marcadas.includes(faseId)}
              guardando={autosave.phase === 'saving' && ultimoTocado === faseId}
              puedeGuardar={puedeGuardar}
              onToggle={toggle}
            />
          </li>
        ))}
      </ul>

      {/* El rebote del server queda FIJO junto a los tildes: el toast se va solo
          y el setter se quedaba sin saber por qué no entró la marca. Mismo
          criterio que el `serverError` del chequeo. */}
      {errorGuardado && (
        <p role="alert" className="text-xs leading-relaxed text-red-400">
          {errorGuardado} — tocá de nuevo la fase para reintentar.
        </p>
      )}

      {/* EL ACUSE DE RECIBO, y es lo ÚNICO que este sprint agrega a la pantalla.
          Con los tildes escribiendo uno por uno, el acuse era el propio tilde
          pintándose más el spinner de su transición. Al pasar a escritura
          continua eso deja de alcanzar —el guardado ya no es 1↔1 con el clic— y
          el setter se queda sin saber si su trabajo quedó. Es la misma pieza,
          `role="status"`, que ya usan la ficha, el brief y el chequeo: la señal
          que el invariante del acuse exige para toda escritura continua, y que
          este sprint le había sacado sin reemplazo. Solo se monta donde hay algo
          que guardar. */}
      {puedeGuardar && (
        <AutosaveStatus
          phase={autosave.phase}
          isDirty={autosave.isDirty}
          errorLabel="No se pudo guardar — tocá de nuevo la fase para reintentar"
        />
      )}
    </>
  )
}
