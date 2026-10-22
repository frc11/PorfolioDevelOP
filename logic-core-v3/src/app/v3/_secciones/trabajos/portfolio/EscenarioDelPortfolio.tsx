'use client'

import { cn } from '@/lib/utils'

import type { PropsDeSeccion } from '../../_contrato/forma'

import { Acordeon } from './Acordeon'
import { EncabezadoDelPortfolio } from './EncabezadoDelPortfolio'
import { vistaDelPaso } from './estado'
import { ESTILO_DEL_HUECO } from './hueco'
import { CLASE_DEL_ALTO_DEL_MEDIO } from './medios'
import { DESPEJE_DE_LA_BARRA } from './LaTuya'
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
 * [B1.2c] La columna del encabezado: deja libre lo que ocupa la barra (el mismo despeje que «la tuya») y el título se agranda hasta
 * lo que entra en ella (`tipografia.ts`, en `cqw`: la columna es su contenedor).
 */
const ESTILO_DE_LA_COLUMNA: React.CSSProperties = { paddingTop: DESPEJE_DE_LA_BARRA }

/**
 * [B1] EL ESCENARIO DEL PORTFOLIO — la pantalla pegada (plan §5.1; [B1.2b] §12, puntos 1, 2 y 9; [B1.2c] §13, puntos 1, 2 y 7).
 *
 * [B1.2c] La columna que deja el panel es UN BLOQUE centrado en el alto: «Portfolio» (más grande) y su bajada y, debajo, el hueco del
 * logo (`hueco.ts`: la escena lo llena con el logo de frente, `poseDelPortfolio.ts`), en el mismo eje. Así el título y el logo se leen
 * juntos. El panel entra desde la derecha y sale por la derecha: sólo `translate-x`, adentro del escenario pegado, y el paso que lo
 * mete espera al pin (`pasoConElPin`), así que no tiene componente vertical a ninguna velocidad; existe sólo pegado (`cortarElPanel`).
 * Entra y sale en ORDEN con el encabezado (`orden.ts`; [B1.2d] `vivo.panel`, después del 80 % del título). La columna es la mitad desde
 * 1024 (la escena lo lee del CSS, `COLUMNA_DEL_ANCHO`).
 *
 * [B1.2e] Debajo de 1024 no hay selector (el carrusel va en el flujo de la sección, `FlujoDelPortfolio`): el escenario es sólo la pantalla
 * pegada de Demos (la cola), sin la columna ni el panel, y con otro nombre (`escenario-de-demos`: el diagnóstico de la carga mira el paso del
 * selector, que acá no existe). El marcado servido es el de escritorio: el modo lo decide el CSS y se lee en el cliente.
 */
export function EscenarioDelPortfolio({
  seccion,
  vivo,
  children,
}: PropsDeSeccion & { readonly vivo: PortfolioVivo; readonly children?: React.ReactNode }): React.JSX.Element {
  const { fase } = vistaDelPaso(vivo.paso)
  if (vivo.carrusel) {
    return (
      <div data-pieza="escenario-de-demos" data-paso={vivo.paso} data-fase={fase} className="sticky top-0 h-svh w-full overflow-clip">
        {children}
      </div>
    )
  }
  return (
    <div
      data-pieza="escenario-del-portfolio"
      data-paso={vivo.paso}
      data-fase={fase}
      // [B1.2c] El orden, a la vista del banco (y del diagnóstico): [B1.2d] la cámara, el encabezado, la barra y el panel, de a uno.
      // `data-panel-adentro` y no `data-escena`: ése es el nombre del lienzo de la escena.
      data-camara={vivo.camara ? 'si' : 'no'}
      data-encabezado={vivo.encabezado ? 'si' : 'no'}
      data-barra={vivo.barra ? 'si' : 'no'}
      data-panel-adentro={vivo.panel ? 'si' : 'no'}
      data-orden-quieto={vivo.ordenQuieto ? 'si' : 'no'}
      // `overflow-clip` y no `hidden`: el foco que entra al panel afuera del cuadro no puede correr el recorte (el acordeón lo trae).
      className="sticky top-0 h-svh w-full overflow-clip"
    >
      <div
        data-pieza="columna-del-portfolio"
        className="@container absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center px-8 text-center max-escritorio:w-full max-escritorio:justify-start"
        style={ESTILO_DE_LA_COLUMNA}
      >
        <EncabezadoDelPortfolio seccion={seccion} adentro={vivo.encabezado} reducido={vivo.reducido} />
        <div data-pieza="hueco-del-logo" aria-hidden="true" className="mt-8 shrink-0 max-escritorio:hidden" style={ESTILO_DEL_HUECO} />
      </div>
      <div
        data-pieza="panel-del-portfolio"
        className={cn(
          'absolute inset-y-0 right-0 flex w-1/2 flex-col transition-transform duration-700 ease-[var(--ease-salida)] motion-reduce:transition-none max-escritorio:w-full max-escritorio:translate-x-0',
          CLASE_DEL_ALTO_DEL_MEDIO,
          !vivo.panel && 'translate-x-full',
          // Afuera, el panel no tapa la columna (debajo de 1024, antes de que el cliente decida el carrusel, no se desliza).
          !vivo.panel && 'max-escritorio:pointer-events-none',
        )}
        style={ESTILO_DEL_VIDRIO}
      >
        <div className="relative min-h-0 flex-1">
          <Acordeon vivo={vivo} />
        </div>
      </div>
      {children}
    </div>
  )
}
