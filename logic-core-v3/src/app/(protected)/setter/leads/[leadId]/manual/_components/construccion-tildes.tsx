'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { FaseId } from '@/lib/leados/contracts'
import { useAutosave } from '@/lib/use-autosave'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarProgreso } from '@/app/(protected)/setter/_actions/dossier.actions'
import { FaseAutoReporte } from './fase-auto-reporte'

/**
 * P25 — El DUEÑO ÚNICO del checklist de Construcción (`progresoJson`).
 *
 * EL DEFECTO QUE CIERRA. Antes cada `FaseAutoReporte` era su propio escritor:
 * los tres tildes de la pantalla recibían el MISMO array `completadas` como
 * prop del server y cada uno reconstruía el set entero desde esa prop. Como la
 * prop solo se refresca cuando vuelve el `router.refresh()` (medido: 1.0–1.3 s),
 * tres clics seguidos calculaban los tres sobre la MISMA base vieja (`[]`) y se
 * mandaban `[A]`, `[B]`, `[C]`: la última escritura pisaba a las otras dos y
 * quedaba UNA marca de tres. Medido en la aplicación: 3 clics → 1 marca.
 *
 * POR QUÉ ESTE ES EL PATRÓN CORRECTO — es el del chequeo final (`ChequeoForm`),
 * el hermano que NO tiene la carrera, y son DOS mecanismos, no uno:
 *
 *   1. UN SOLO dueño del blob en estado de cliente. El estado arranca de la
 *      prop UNA vez (inicializador lazy) y no se vuelve a sembrar: la base de
 *      cada escritura es el estado vivo, nunca una prop en vuelo. Esto es lo
 *      que mata la base stale.
 *   2. `useAutosave`, que SERIALIZA: su `savingRef` deja UNA escritura en vuelo
 *      a la vez y las ediciones que llegan mientras se guarda se COALESCEN en
 *      la siguiente. Sin esto no alcanza — medido: diez escrituras realmente
 *      simultáneas sobre el MISMO blob pierden datos aunque cada payload sea
 *      superset, porque el write del server es un overwrite del blob entero
 *      (`saveOwnedProgreso`, y también `saveOwnedSelfCheck`). Lo que salva al
 *      chequeo no es la forma del payload: es que su cliente nunca encima dos
 *      escrituras.
 *
 * `delayMs: 0` — mismo criterio que el chequeo: un tilde es una acción
 * TERMINADA, no una tecla en el medio de una frase. El coalescing sigue
 * evitando pedidos encimados si se tildan varios seguidos.
 *
 * EL ESTADO CUBRE LAS SEIS FASES, no las tres de esta pantalla: el payload de
 * `guardarProgreso` es el set completo, así que mc1 tiene que arrastrar intactas
 * las fases de mc2 (y al revés). `fases` es solo QUÉ se dibuja acá.
 *
 * Sigue sin ser un gate (§6-3): `progresoJson` jamás se cablea a la transición
 * EN_REVISION. El `router.refresh()` tras un guardado exitoso se conserva porque
 * el progreso alimenta la derivación de pantalla (`manual.ts`, `completadasDe`);
 * lo que NO se hace es re-sembrar el estado local con la prop que vuelve — ahí
 * estaba la base stale.
 */
export function ConstruccionTildes({
  leadId,
  fases,
  completadas,
  puedeGuardar,
  motivo,
}: {
  leadId: string
  /** Las fases que dibuja ESTA pantalla (mc1 o mc2), con su título ya resuelto. */
  fases: readonly { id: FaseId; titulo: string }[]
  /** El set COMPLETO de fases hechas (las seis) — semilla del estado local. */
  completadas: FaseId[]
  puedeGuardar: boolean
  motivo?: string
}) {
  const router = useRouter()
  // Dueño único del blob. Semilla UNA vez: re-sembrar con la prop reintroduciría
  // exactamente la base stale que este componente existe para eliminar.
  const [hechas, setHechas] = useState<FaseId[]>(() => completadas)
  // Última foto CONFIRMADA por el server: a esto se vuelve si un guardado rebota,
  // para que la pantalla nunca muestre una marca que no está persistida.
  const persistido = useRef<FaseId[]>(completadas)
  // Fases tocadas desde el último guardado exitoso — las que muestran el spinner
  // (mismo feedback por-tilde que daba el `isPending` de la transición).
  const [enVuelo, setEnVuelo] = useState<readonly FaseId[]>([])

  const autosave = useAutosave<FaseId[]>({
    value: hechas,
    enabled: puedeGuardar,
    delayMs: 0,
    // El orden no es significativo: sin esto, re-ordenar marcaría sucio de más.
    serialize: (actual) => JSON.stringify([...actual].sort()),
    save: async (actual) => {
      const result = await guardarProgreso(leadId, { completadas: actual })
      if (result.success) {
        persistido.current = actual
        // El progreso alimenta la derivación de pantalla del manual: sin refresh
        // la navegación quedaría leyendo un progreso viejo.
        router.refresh()
      } else {
        // Rebote del server: volver a lo último confirmado. Se DESCARTA la marca
        // no guardada — mismo efecto que el snap-back optimista de antes, y deja
        // la pantalla mostrando exactamente lo que está persistido.
        setHechas(persistido.current)
        toast.error(result.error)
      }
      return result
    },
  })
  useUnsavedGuard(autosave.isDirty)

  // El spinner se apaga cuando el guardado confirma (o cuando ya no hay nada
  // sucio, que es el caso del rebote que revirtió).
  useEffect(() => {
    if (autosave.phase !== 'saving' && !autosave.isDirty) setEnVuelo([])
  }, [autosave.phase, autosave.isDirty])

  const toggle = (faseId: FaseId) => {
    setEnVuelo((actual) => (actual.includes(faseId) ? actual : [...actual, faseId]))
    // Actualización FUNCIONAL sobre el estado vivo: dos clics seguidos componen,
    // no compiten. Esta línea es el arreglo.
    setHechas((actual) =>
      actual.includes(faseId) ? actual.filter((id) => id !== faseId) : [...actual, faseId],
    )
  }

  return (
    <ul className="space-y-2">
      {fases.map((fase) => (
        <li key={fase.id}>
          <FaseAutoReporte
            faseId={fase.id}
            titulo={fase.titulo}
            marcada={hechas.includes(fase.id)}
            guardando={enVuelo.includes(fase.id) && autosave.phase === 'saving'}
            puedeGuardar={puedeGuardar}
            motivo={motivo}
            onToggle={toggle}
          />
        </li>
      ))}
    </ul>
  )
}
