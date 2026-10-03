'use client'

import { useId, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorViewport } from '../../_lib/imagen'
import { DemoEnSuLugar } from '../../_panel-vivo/DemoDelPanel'
import { FONDO_DEL_PANEL } from '../../_panel-vivo/MarcoDelPanel'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { ALFA_DEL_FONDO } from './Fondo'
import { CLASE_DEL_BORDE, useBordeDelPanel } from './borde'
import { CAPTURA, PALABRAS_DEL_FONDO, type Tarjeta as DatosDeTarjeta } from './contenido'
import { CLASE_DE_ENCUADRE, CLASE_DE_LA_DEMO, CLASE_DE_LA_FILA, CLASE_DEL_REPARTO, CLASE_DEL_TITULO, DISPOSICION, VW_DE_LA_FORMA } from './geometria'

/**
 * UNA FEATURE DE TU PANEL — [RETOQUE PANEL] T1 · su demo, usable en su lugar (sin abrir nada y sin agrandarse con el
 * hover), con su título y su rótulo. La demo se dibuja a la pantalla de panel que necesita (`DISPOSICION`) y la caja
 * tiene su misma proporción; abajo de 1024, el ancho de la columna y su alto. Los bordes se funden con la sección
 * (`borde.ts`): no es una imagen pegada.
 *
 * El `<li>` se puede enfocar desde el código: es adonde lleva «Saltar la demo» de la anterior.
 */
export function Tarjeta({ tarjeta, indice }: { readonly tarjeta: DatosDeTarjeta; readonly indice: number }): React.JSX.Element {
  const lugar = DISPOSICION[indice]
  const borde = useBordeDelPanel()
  const idDelTitulo = useId()
  const medidas = {
    '--proporcion': `${String(lugar.pantalla.ancho)} / ${String(lugar.pantalla.alto)}`,
    '--alto-angosto': `${String(lugar.altoAngosto)}px`,
    '--fondo-del-panel': FONDO_DEL_PANEL,
  } as CSSProperties
  const respaldo = (
    <Imagen src={tarjeta.imagen} alt={tarjeta.alt} ancho={CAPTURA.ancho} alto={CAPTURA.alto} sizes={sizesPorViewport(VW_DE_LA_FORMA[lugar.forma], 100)} className={`h-full object-cover ${CLASE_DE_ENCUADRE[tarjeta.encuadre]}`} />
  )

  return (
    <li data-pieza="feature-del-panel" data-forma={lugar.forma} tabIndex={-1} aria-labelledby={idDelTitulo} className={cn('relative w-full [--sangrado:var(--spacing-4)] focus-visible:outline-2 focus-visible:outline-offset-4 escritorio:z-[var(--z-elevado)] escritorio:[--sangrado:var(--spacing-8)]', CLASE_DE_LA_FILA[lugar.forma][lugar.lado])}>
      <Bloque patron="P2" rango="ventana-visible" className="w-full">
        {(progreso) => (
          <CanalDeUnaPieza progreso={progreso} patron="P2" className={cn('flex flex-col gap-[calc(var(--sangrado)+var(--spacing-3))]', CLASE_DEL_REPARTO[lugar.forma][lugar.lado])}>
            <div data-parte="marco" data-borde={borde} style={medidas} className={cn('relative w-full h-[var(--alto-angosto)] escritorio:h-auto escritorio:aspect-[var(--proporcion)]', CLASE_DE_LA_DEMO[lugar.forma])}>
              <span aria-hidden="true" data-parte="borde-del-panel" className={cn('pointer-events-none absolute', CLASE_DEL_BORDE[borde])} />
              <DemoEnSuLugar demo={tarjeta.demo} pantalla={lugar.pantalla} respaldo={respaldo} />
            </div>
            <div className={cn('flex flex-col items-start gap-[var(--spacing-2)]', CLASE_DEL_TITULO[lugar.forma])}>
              <Titular id={idDelTitulo} nivel="titulo-m" como="h3" className="block">
                {tarjeta.titulo}
              </Titular>
              <Micro como="span" className="text-tinta-tenue uppercase">
                {tarjeta.etiqueta}
              </Micro>
            </div>
          </CanalDeUnaPieza>
        )}
      </Bloque>
      {/* MÓVIL 2: abajo de 1024 las palabras del fondo van QUIETAS en el aire entre una feature y
          la siguiente —nunca debajo de una—, con el mismo alfa (1,0595:1) y sin llegada ni parallax. */}
      {indice < PALABRAS_DEL_FONDO.length ? (
        <span
          aria-hidden="true"
          data-pieza="palabra-del-fondo"
          className="font-display text-tinta leading-cartel pointer-events-none absolute top-[calc(100%+var(--spacing-20)*0.875/2)] left-0 -translate-y-1/2 whitespace-nowrap select-none text-[length:min(calc(var(--spacing-20)*0.7875),calc((100vw-2*var(--pad-lateral-compacto))/6))] escritorio:hidden"
          style={{ opacity: ALFA_DEL_FONDO }}
        >
          {PALABRAS_DEL_FONDO[indice]}
        </span>
      ) : null}
    </li>
  )
}
