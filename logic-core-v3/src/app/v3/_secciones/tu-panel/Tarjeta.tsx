'use client'

import { useId, type CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorViewport } from '../../_lib/imagen'
import { DemoEnSuLugar } from '../../_panel-vivo/DemoDelPanel'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { ALFA_DEL_FONDO } from './Fondo'
import { CAPTURA, PALABRAS_DEL_FONDO, type Tarjeta as DatosDeTarjeta } from './contenido'
import { CLASE_DEL_LUGAR, CLASE_DE_ENCUADRE, TABLA_DEL_CAOS, TAMANOS, arranques, claseEnColumna, velocidadDe, vwDe } from './geometria'

const TOPES = arranques()

/**
 * UNA FEATURE DE TU PANEL — [PASADA FINAL] B1 · flota en su lugar de la tabla del caos (`geometria.ts`) y adentro se usa
 * el panel ENTERO a escala: la demo se dibuja a su pantalla y se escala al ancho de la tarjeta (nada de abrir, nada que
 * se agrande con el hover), con su título y su rótulo debajo. La tarjeta lleva su profundidad (`data-profundidad`, la
 * misma suscripción de scroll del fondo) y la última queda asentada en el flujo.
 *
 * B2 · El marco es un módulo que flota sobre la página: esquinas redondeadas y una sombra suave y física (dos capas: el
 * contacto y la ambiental, con la tinta al 25 %), sin halo, sin degradé y sin filtros. `contain` aísla el layout y la
 * pintura de la demo: lo que pasa adentro (una tabla que cambia, un chat que escribe) no le cuesta a la página.
 *
 * El `<li>` se puede enfocar desde el código: es adonde lleva «Saltar la demo» de la anterior.
 */
export function Tarjeta({ tarjeta, indice }: { readonly tarjeta: DatosDeTarjeta; readonly indice: number }): React.JSX.Element {
  const fila = TABLA_DEL_CAOS[indice]
  const tamano = TAMANOS[fila.tamano]
  const esLaUltima = indice === TABLA_DEL_CAOS.length - 1
  const idDelTitulo = useId()
  const lugar = { '--x': `${String(fila.columna)}%`, '--w': `${String(tamano.ancho)}%`, '--y': `${String(TOPES[indice])}svh` } as CSSProperties
  const medidas = { '--proporcion': `${String(fila.pantalla.ancho)} / ${String(fila.pantalla.alto)}`, '--alto-angosto': `${String(fila.altoAngosto)}px` } as CSSProperties
  const respaldo = <Imagen src={tarjeta.imagen} alt={tarjeta.alt} ancho={CAPTURA.ancho} alto={CAPTURA.alto} sizes={sizesPorViewport(vwDe(fila), 88)} className={`h-full object-cover ${CLASE_DE_ENCUADRE[tarjeta.encuadre]}`} />

  return (
    <li
      data-pieza="feature-del-panel"
      data-tamano={fila.tamano}
      data-profundidad={velocidadDe(indice)}
      tabIndex={-1}
      aria-labelledby={idDelTitulo}
      style={lugar}
      className={cn('relative focus-visible:outline-2 focus-visible:outline-offset-4 escritorio:z-[var(--z-elevado)]', claseEnColumna(indice), esLaUltima ? CLASE_DEL_LUGAR.asentada : CLASE_DEL_LUGAR.flota)}
    >
      <Bloque patron="P2" rango="ventana-visible" className="w-full">
        {(progreso) => (
          <CanalDeUnaPieza progreso={progreso} patron="P2" className="flex flex-col gap-[var(--spacing-3)]">
            <div
              data-parte="marco"
              style={medidas}
              className="relative h-[var(--alto-angosto)] w-full overflow-hidden rounded-[calc(var(--radius-fuerte)*1.6)] shadow-[0_var(--spacing-1)_var(--spacing-2)_var(--tw-shadow-color),0_var(--spacing-6)_var(--spacing-12)_calc(var(--spacing-5)*-1)_var(--tw-shadow-color)] shadow-tinta/25 contain-layout contain-paint escritorio:h-auto escritorio:aspect-[var(--proporcion)]"
            >
              <DemoEnSuLugar demo={tarjeta.demo} pantalla={fila.pantalla} respaldo={respaldo} />
            </div>
            <div className="flex flex-col items-start gap-[var(--spacing-2)]">
              <Titular id={idDelTitulo} nivel={tamano.nivel} como="h3" className="block">
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
