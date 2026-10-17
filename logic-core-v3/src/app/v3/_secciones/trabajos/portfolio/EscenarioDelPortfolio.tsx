'use client'

import { cn } from '@/lib/utils'

import type { PropsDeSeccion } from '../../_contrato/forma'

import { Acordeon } from './Acordeon'
import { EncabezadoDelPortfolio } from './EncabezadoDelPortfolio'
import { vistaDelPaso } from './estado'
import type { PortfolioVivo } from './usePortfolio'

/**
 * [B1] EL ESCENARIO DEL PORTFOLIO — la pantalla pegada (plan §5.1): el encabezado arriba del lado del texto, el hueco del logo
 * abajo (vacío: el logo es el de la escena, con la pose del Portfolio) y el panel del otro lado, que entra con el pin y se
 * retrae en la cola. `?portfolio-lado=izq` lo espeja; `?portfolio-panel=vidrio` cambia el material.
 *
 * Las clases de lado van enteras y literales (el escáner de Tailwind no ve una clase armada) y los anchos son fracciones de la
 * escala (el panel, la mitad desde 1024 y 3/5 en tablet; el encabezado, 5/12 y un tercio); abajo de 768 lo reemplazan las historias
 * (B1.3). Lo que no es un token (la altura del encabezado, la opacidad de su salida) va en línea.
 */
const LADO = {
  der: { encabezado: 'left-[var(--pad-lateral-compacto)]', panel: 'right-0', afuera: 'translate-x-full' },
  izq: { encabezado: 'right-[var(--pad-lateral-compacto)] text-right', panel: 'left-0', afuera: '-translate-x-full' },
} as const

/** Dónde arranca el encabezado, desde el tope del cuadro. */
const TOPE_DEL_ENCABEZADO = '12svh'

export function EscenarioDelPortfolio({
  seccion,
  vivo,
  children,
}: PropsDeSeccion & { readonly vivo: PortfolioVivo; readonly children?: React.ReactNode }): React.JSX.Element {
  const { fase } = vistaDelPaso(vivo.paso)
  const lado = LADO[vivo.banderas.lado]
  const adentro = fase === 'adentro'
  return (
    <div
      data-pieza="escenario-del-portfolio"
      data-paso={vivo.paso}
      data-fase={fase}
      data-lado={vivo.banderas.lado}
      // `overflow-clip` y no `hidden`: el foco que entra al panel afuera del cuadro no puede correr el recorte (el acordeón lo trae).
      className="sticky top-0 h-svh w-full overflow-clip"
    >
      <div
        className={cn('absolute w-5/12 transition-opacity duration-500 motion-reduce:transition-none max-escritorio:w-1/3', lado.encabezado)}
        style={{ top: TOPE_DEL_ENCABEZADO, opacity: fase === 'despues' ? 0 : 1 }}
      >
        <EncabezadoDelPortfolio seccion={seccion} afuera={fase === 'despues'} />
      </div>
      <div
        data-pieza="panel-del-portfolio"
        data-material={vivo.banderas.material}
        className={cn(
          'absolute inset-y-0 w-1/2 transition-transform duration-700 ease-[var(--ease-salida)] motion-reduce:transition-none max-escritorio:w-3/5',
          lado.panel,
          !adentro && lado.afuera,
        )}
      >
        <Acordeon vivo={vivo} />
      </div>
      {children}
    </div>
  )
}
