'use client'

import type { MotionValue } from 'motion/react'
import { useCallback, useRef, useState, type CSSProperties } from 'react'

import { useGatillos } from '../../../_componentes/gatillos/useGatillos'
import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { altoDeSecuenciaPinneada } from '../../../_lib/secciones'
import { PUNTOS_DEL_ENJAMBRE } from '../../../_lib/nanobots/simbolos'
import { SERVICIOS } from '../../_contrato/acento'
import { Bloque } from '../../_contrato/coreografia'
import { tangenteDe, useDiagonal } from './banderas'
import { ESTADOS_DE_SERVICIOS } from './datos'
import { IntroDeServicios, PasarElProgreso } from './IntroDeServicios'
import { LugarDeLosNanobots, PanelDeServicio } from './PanelDeServicio'
import { DURACION_DE_LA_TRANSICION_MS } from './tiempos'
import { SIN_CAMBIO, useCoreografiaDelEscenario, usePosicionDelEscenario, type CambioDeCapa } from './useCoreografiaDelEscenario'
import { useNanobotsDelEscenario } from './useNanobotsDelEscenario'

/**
 * [B4] EL ESCENARIO DE SERVICIOS — la pista anclada con sus cuatro estados (la entrada y los tres servicios), recorridos con la máquina
 * de gatillos del Portfolio (`_componentes/gatillos/`): cada gesto avanza UNO, obligado y sin saltear, y la transición se ve entera.
 *
 * Capas, de abajo hacia arriba: el papel; los nanobots mientras están DETRÁS (`data-capa="detras"`); la entrada («Nuestros servicios»);
 * los paneles, que cierran uno sobre otro; y los nanobots DELANTE (`data-capa="delante"`). El lienzo es uno y cubre el escenario: el
 * enjambre viaja de su lugar en un estado al del siguiente, y cambia de capa en el cuadro que calcula `capa.ts` (ninguno sobre el
 * título ni sobre el panel). El ángulo de la franja del texto, `?diagonal=` (`--tangente-de-la-diagonal`).
 *
 * `telefono`: abajo de 1024 con `?servicios-movil=gatillo`: lo mismo, con el dedo, los paneles apilados y los nanobots más chicos.
 */
/** La pista, como mínimo: el cuadro anclado y una pantalla por estado (desde 1024 se estira hasta llenar la tabla: `flex-1`). */
export const ALTO_MINIMO_DE_LA_PISTA = altoDeSecuenciaPinneada(ESTADOS_DE_SERVICIOS + 1)

export function EscenarioDeServicios({ telefono }: { readonly telefono: boolean }): React.JSX.Element {
  const pista = useRef<HTMLDivElement>(null)
  const escenario = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const cambio = useRef<CambioDeCapa>(SIN_CAMBIO)
  const reducido = useMovimientoReducido()
  const diagonal = useDiagonal()
  const { vista, ir } = useGatillos({ pista, cantidad: ESTADOS_DE_SERVICIOS, activa: true, tactil: telefono, reducido, duracionMs: DURACION_DE_LA_TRANSICION_MS })
  const posicion = usePosicionDelEscenario(vista, reducido)
  useCoreografiaDelEscenario(escenario, lienzo, posicion, cambio)
  useNanobotsDelEscenario({ escenario, lienzo, posicion, reducido, puntos: telefono ? PUNTOS_DEL_ENJAMBRE.angosto : PUNTOS_DEL_ENJAMBRE.ancho, cambio })
  const [progresoDelTitulo, setProgresoDelTitulo] = useState<MotionValue<number> | null>(null)
  const pasar = useCallback((p: MotionValue<number> | null) => setProgresoDelTitulo(p), [])
  const angulo = { '--tangente-de-la-diagonal': tangenteDe(diagonal).toFixed(4) } as CSSProperties

  return (
    <div ref={pista} data-pieza="pista-de-servicios" data-paso="-1" className="relative w-full flex-1" style={{ minHeight: ALTO_MINIMO_DE_LA_PISTA }}>
      {/* Lo que MIDE la entrada del título (P2): la mitad de arriba del primer cuadro de la pista, que no se pega. La ventana de la demo
          termina con su pie en la mitad del cuadro: justo cuando el escenario se ancla, con el título en el medio. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-svh">
        <Bloque patron="P2" rango="ventana-de-la-demo" className="h-1/2 w-full">
          {(progreso) => <PasarElProgreso progreso={progreso} a={pasar} />}
        </Bloque>
      </div>
      <div
        ref={escenario}
        data-pieza="escenario-de-servicios"
        data-diagonal={diagonal}
        style={angulo}
        className="bg-fondo sticky top-0 h-svh w-full overflow-hidden max-escritorio:[--tangente-de-la-diagonal:0]!"
      >
        <LugarDeLosNanobots estado={0} className="pointer-events-none absolute inset-x-1/3 inset-y-1/4" />
        <IntroDeServicios progreso={progresoDelTitulo} className="absolute inset-0 z-10 flex items-center justify-center px-[var(--pad-lateral-compacto)]" />
        {SERVICIOS.map((s, i) => (
          <PanelDeServicio key={s.id} servicio={s} estado={i + 1} foco={ir} />
        ))}
        {/* La capa (`z-index`) la pone la coreografía en cada cuadro: detrás de la entrada, o delante de todo. */}
        <canvas ref={lienzo} aria-hidden="true" data-pieza="nanobots-de-servicios" data-capa="detras" className="pointer-events-none absolute inset-0 z-0 size-full" />
      </div>
    </div>
  )
}
