/**
 * INVARIANTE — B9 · CADA COSA A SU TIEMPO: la resolución del ancla.
 *
 * Corre con `npm run test:s19-sincronia`.
 *
 * Que el orden de las ramas de `anclasDe` sea el declarado. La regla del rango
 * en sí (los px de entrada/descanso, y qué `<Bloque>` la declara) era
 * composición y se desarmó (Modo pulido).
 */

import { afirmar, afirmarIgual, cerrar, titulo } from '../../_lib/__tests__/afirmar'
import { leer } from './soporte'

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La resolución del ancla, leída del contrato')

/**
 * Que el orden de las ramas de `anclasDe` sea el que es no se puede afirmar
 * llamando a la función —vive en el módulo perezoso y devuelve un objeto, no el
 * camino que tomó—, así que se afirma sobre su fuente. Es la misma clase de
 * comprobación que `s6-servicios` §7 hace contando `useProgresoDePatron(`.
 */
const ANIMADA = leer('src/app/v3/_secciones/_contrato/coreografia-animada.tsx')
const CUERPO = /function anclasDe\(props: BloqueProps\): ParDeAnclas \{([\s\S]*?)\n\}/.exec(ANIMADA)?.[1] ?? ''
afirmar(CUERPO.length > 0, 'se encontró el cuerpo de `anclasDe`')
const LINEAS = CUERPO.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
afirmarIgual(LINEAS.length, 3, 'resuelve en tres ramas y ninguna más')
afirmar(LINEAS[0].includes("props.patron === 'pin'") && LINEAS[0].includes('ANCLA_DEL_PIN'), 'la PRIMERA es el pin: `patron: "pin"` no nombra un patrón de los nueve y `PATRONES["pin"]` no existe')
afirmar(LINEAS[1].includes("props.rango === 'ventana-visible'") && LINEAS[1].includes('ANCLA_DE_LA_VENTANA_VISIBLE'), 'la SEGUNDA es la regla')
afirmar(LINEAS[2].includes('PATRONES[props.patron].anclas'), 'y el defecto sigue siendo el ancla del patrón')
afirmar(
  !/patron="pin"[^>]*rango=/.test(leer('src/app/v3/_secciones/servicios/Servicios.tsx')),
  'el bloque del pin no declara `rango`: la asimetría está en el fuente y no sólo en el orden de las ramas',
)

cerrar('s19-sincronia.invariant')
