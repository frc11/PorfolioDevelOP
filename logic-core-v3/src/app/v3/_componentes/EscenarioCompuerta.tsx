'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'

/**
 * LA COMPUERTA DE 1025 — estructural, no cosmética.
 *
 * ── Lo que hace, en una línea ──────────────────────────────────────────────
 *
 * Abajo del umbral este componente devuelve `null`, el `import()` de abajo
 * NUNCA se ejecuta, y el navegador no pide el chunk del escenario. No es una
 * clase de CSS que esconde: **el bundle no se importa**.
 *
 * ── Por qué `ssr: false` no es opcional ────────────────────────────────────
 *
 * Dos cosas a la vez. Primero: el ancho no existe en el servidor, así que el
 * servidor no puede decidir. Segundo, y es la que importa para el bundle: con
 * `ssr: false` webpack emite el módulo en un chunk asíncrono aparte y este
 * archivo se queda solo con la llamada que lo pide. Si el import fuera
 * estático, el escenario viajaría en la carga inicial de `/v3` en TODOS los
 * anchos —incluido mobile— y la compuerta sería decorativa.
 *
 * Eso último no es una afirmación de confianza: la ruta gemela
 * `/v3/control-estatico` hace exactamente el import estático, y
 * `bundle.invariant.ts` comprueba que ahí la marca SÍ aparece en la carga
 * inicial. Es el control positivo — sin él, la comprobación pasaría en verde
 * aunque el escenario no existiera.
 *
 * ── Por qué no hay salto de layout al cruzar el umbral ─────────────────────
 *
 * En los dos sentidos, y por una sola razón: el escenario está `fixed inset-0`
 * (ver `CLASES_FUERA_DE_FLUJO`), o sea que **no ocupa espacio en el flujo del
 * documento**. Montarlo o desmontarlo no puede mover un panel. Y abajo del
 * umbral no se renderiza un placeholder con caja: se renderiza `null`.
 *
 * ── Por qué no hay discrepancia de hidratación ─────────────────────────────
 *
 * `useAnchoMinimo` es `useSyncExternalStore` con snapshot de servidor en
 * `false`. React usa ese snapshot también en el render de hidratación, así que
 * el primer render de cliente es idéntico al HTML servido —los dos sin
 * escenario— y el valor real entra recién en el re-render. Nunca se lee
 * `window` durante el render.
 *
 * ── SITIO-S8: qué cambió acá, y qué NO ─────────────────────────────────────
 *
 * **Una línea: a qué módulo le apunta el `import()`.** Hasta S7 pedía
 * `./EscenarioDePrueba`, el marcador de posición que S1 escribió para demostrar
 * que el hueco funcionaba sin depender de WebGL. Ahora pide la escena de
 * verdad, que es lo que catorce sprints construyeron en `/probe-escena` y que
 * SITIO-S8 mudó a `_lib/escena/`.
 *
 * **El mecanismo no se tocó**, y era el punto: el docblock del marcador ya lo
 * decía —*"cuando entre la escena real, se reemplaza ESTE módulo; el resto no
 * se toca"*—. La compuerta, el umbral, el hook, el `ssr: false` y la razón por
 * la que no hay salto de layout ni mismatch de hidratación son los mismos.
 *
 * **Y el marcador de posición sigue vivo, con su trabajo.** No es código
 * muerto: `/v3/control-estatico` lo importa de forma ESTÁTICA y es el control
 * positivo del mecanismo —demuestra que el buscador del build encuentra un
 * módulo cuando SÍ está en la carga inicial—. Sin él, la afirmación "la escena
 * no está en la carga inicial de `/v3`" pasaría en verde también si el buscador
 * estuviera ciego. Por eso la escena real lleva su propia marca
 * (`_lib/marcaEscena.ts`) y no reusa la del marcador: las dos tienen que poder
 * buscarse por separado en el mismo build.
 */
const EscenaDelHome = dynamic(() => import('../_lib/escena/EscenaDelHome'), { ssr: false })

export function EscenarioCompuerta() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)

  if (!arribaDelUmbral) return null

  return <EscenaDelHome />
}
