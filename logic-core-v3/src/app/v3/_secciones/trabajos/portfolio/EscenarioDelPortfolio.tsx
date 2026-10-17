'use client'

import { cn } from '@/lib/utils'

import type { PropsDeSeccion } from '../../_contrato/forma'

import { Acordeon } from './Acordeon'
import { EncabezadoDelPortfolio } from './EncabezadoDelPortfolio'
import { vistaDelPaso } from './estado'
import type { PortfolioVivo } from './usePortfolio'

/**
 * [B1.2b] El vidrio del sistema (`CLAUDE.md`: blanco al 4 %, desenfoque de 20 px, saturación del 180 % y borde blanco al 8 %), en
 * el PANEL: una sola superficie detrás de las tiras, que son las de la tinta (lomos, proporciones, animaciones) sin fondo propio.
 * El blanco es la tinta de la sala de noche (`--color-tinta`, el papel dado vuelta: ningún color literal en el lane). En línea: no
 * son clases del lane. `OPACIDAD_DEL_VIDRIO` es la que se sube si el texto no pasa AA con la escena detrás.
 */
export const OPACIDAD_DEL_VIDRIO = 0.04
export const ESTILO_DEL_VIDRIO: React.CSSProperties = {
  background: `color-mix(in srgb, var(--color-tinta) ${String(OPACIDAD_DEL_VIDRIO * 100)}%, transparent)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderLeft: '1px solid color-mix(in srgb, var(--color-tinta) 8%, transparent)',
}

/**
 * [B1] EL ESCENARIO DEL PORTFOLIO — la pantalla pegada (plan §5.1; [B1.2b] §12, puntos 1, 2 y 9). La columna que deja el panel se
 * parte en dos mitades: arriba «Portfolio» y su bajada, centrados; abajo, vacía, el logo de la escena (la pose del Portfolio lo
 * centra en el mismo eje: `_lib/escena/poseDelPortfolio.ts`). El panel entra desde la derecha y sale por la derecha: sólo
 * `translate-x`, adentro del escenario pegado, y el paso que lo mete espera al pin (`pasoConElPin`), así que no tiene componente
 * vertical a ninguna velocidad. La columna es la mitad desde 1024 y el 40 % abajo (el panel, el 60 %): la escena lo lee del CSS
 * (`COLUMNA_DEL_ANCHO`). Abajo de 768 lo reemplazan las historias (B1.3).
 */
export function EscenarioDelPortfolio({
  seccion,
  vivo,
  children,
}: PropsDeSeccion & { readonly vivo: PortfolioVivo; readonly children?: React.ReactNode }): React.JSX.Element {
  const { fase } = vistaDelPaso(vivo.paso)
  const adentro = fase === 'adentro'
  return (
    <div
      data-pieza="escenario-del-portfolio"
      data-paso={vivo.paso}
      data-fase={fase}
      // `overflow-clip` y no `hidden`: el foco que entra al panel afuera del cuadro no puede correr el recorte (el acordeón lo trae).
      className="sticky top-0 h-svh w-full overflow-clip"
    >
      <div data-pieza="mitad-del-encabezado" className="absolute left-0 top-0 flex h-1/2 w-1/2 flex-col items-center justify-center px-8 text-center max-escritorio:w-2/5">
        <EncabezadoDelPortfolio seccion={seccion} adentro={adentro} reducido={vivo.reducido} />
      </div>
      <div
        data-pieza="panel-del-portfolio"
        className={cn(
          'absolute inset-y-0 right-0 w-1/2 transition-transform duration-700 ease-[var(--ease-salida)] motion-reduce:transition-none max-escritorio:w-3/5',
          !adentro && 'translate-x-full',
        )}
        style={ESTILO_DEL_VIDRIO}
      >
        <Acordeon vivo={vivo} />
      </div>
      {children}
    </div>
  )
}
