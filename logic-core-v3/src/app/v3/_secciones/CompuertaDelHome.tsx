'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState, type ReactNode } from 'react'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { politicaDeMovimiento, useMovimientoReducido } from '../_lib/motion/reducido'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { ProveedorDeCoreografia, type PrimitivasDeCoreografia } from './_contrato/coreografia'
import { deberiaAnimar } from './_contrato/motion'

/**
 * LA COMPUERTA DEL HOME — se resuelve UNA vez, arriba, para las ocho secciones.
 *
 * ── El hallazgo que la obliga a existir ───────────────────────────────────
 *
 * Los dos lanes de secciones reportaron lo mismo por separado: la coreografía
 * viajaba en la carga inicial **en todos los anchos**. Abajo de 1025 no se
 * montaba el motor, no se partía el texto y no se escribía una transformada,
 * pero el código bajaba igual. Eso contradice la decisión que S1 dejó cerrada
 * para el escenario: *"el bundle no se importa abajo del umbral. No es una
 * clase de CSS que esconde."*
 *
 * ── Por qué acá y no ocho veces ───────────────────────────────────────────
 *
 * Porque una compuerta escrita ocho veces son ocho implementaciones que
 * divergen, y el modo de falla es el peor: que la persona de mobile lea un
 * contenido distinto del de escritorio. Acá el contenido está escrito UNA vez
 * —las ocho secciones son el mismo árbol en los dos lados del umbral— y lo
 * único que cambia es qué primitivas lo envuelven.
 *
 * ── Las dos lecturas, y por qué son dos y no una ──────────────────────────
 *
 *   1. **El ancho de 1025.** Es la misma compuerta del escenario y del sistema
 *      de motion: mismo umbral, misma consulta, mismo hook, importados de
 *      `_lib/`. **El número 1025 no aparece en este archivo.** Si alguien mueve
 *      el umbral, se mueven las tres a la vez, que es la propiedad que hace que
 *      sea UNA compuerta y no tres.
 *   2. **`prefers-reduced-motion`**, con la política de S2, que es total: no se
 *      monta el motor de progreso, y por lo tanto no se instala una sola
 *      primitiva animada.
 *
 * La tabla de verdad de las dos vive en `deberiaAnimar`, que es pura y se
 * afirma sin montar React.
 *
 * ⚠ `_lib/motion/reducido.ts` es el ÚNICO import de valor de `_lib/motion/` que
 * el árbol quieto se permite, y está declarado: no es coreografía, es la
 * política de movimiento del proyecto, y son cuarenta líneas sin una sola de
 * las huellas del sistema. Usar otro hook para la misma preferencia sería tener
 * dos políticas.
 *
 * ── Qué pasa en el servidor, y por qué no hay salto ni mismatch ───────────
 *
 * `useAnchoMinimo` devuelve `false` en el servidor —el ancho no existe— y React
 * usa ese snapshot también en el render de HIDRATACIÓN. Así que el HTML servido
 * y el primer render de cliente son **el árbol quieto**, idénticos, y las
 * primitivas animadas entran recién cuando el chunk llega. Las ocho secciones
 * se sirven enteras y legibles sin una sola transformada: eso no es una
 * degradación elegante, es el estado por defecto.
 */
const InstaladorDeCoreografia = dynamic(() => import('./InstaladorDeCoreografia'), { ssr: false })

export function CompuertaDelHome({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)
  const politica = politicaDeMovimiento(useMovimientoReducido())
  const anima = deberiaAnimar(arribaDelUmbral, !politica.montaElMotorDeProgreso)

  const [primitivas, setPrimitivas] = useState<PrimitivasDeCoreografia | null>(null)

  // Estable entre renders: `InstaladorDeCoreografia` la tiene en las
  // dependencias de su efecto, y una función nueva por render lo volvería a
  // correr en cada uno.
  const instalar = useCallback((nuevas: PrimitivasDeCoreografia) => {
    setPrimitivas(nuevas)
  }, [])

  return (
    <ProveedorDeCoreografia primitivas={anima ? primitivas : null}>
      {anima ? <InstaladorDeCoreografia alInstalar={instalar} /> : null}
      {children}
    </ProveedorDeCoreografia>
  )
}
