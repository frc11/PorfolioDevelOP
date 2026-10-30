'use client'

import { useEffect, type CSSProperties } from 'react'
import type { MotionValue } from 'motion/react'

import { AvisoDeScroll } from '../../../_componentes/avisos/AvisoDeScroll'
import { idDelTitularDeSeccion } from '../../../_componentes/tipografia/Titular'
import { CanalDeUnaPieza } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'
import { RENGLONES_DEL_TITULO, SUBTITULO } from './datos'
import { TituloQueSePintaAlLlegar } from './TituloQueSePintaAlLlegar'

/**
 * [B4 · C2-50 · L3] LA ENTRADA DE LA SECCIÓN — «Nuestros servicios» y su bajada, sobre el papel, con los nanobots girando alrededor.
 * Entra con el efecto de los títulos que vienen desde abajo (P2 con la ventana de la demo: `Bloque` + `CanalDeUnaPieza`, como los
 * módulos del Panel) y, al terminar de llegar, se PINTA rápido (`TituloQueSePintaAlLlegar`). El bloque que se MIDE está afuera, en la
 * pista; su progreso llega por `progreso` (`null` sin coreografía: se pinta al verse).
 *
 * [L3] Ítem 50:
 *   · Escritorio: el título en UN renglón y más grande; la bajada en un renglón y más chica. El aro (el LUGAR de la órbita,
 *     `data-lugar-de-los-nanobots="0"`: la elipse llena su caja) es una caja de proporción fija, apenas más ancha que el título, que
 *     sube hasta la mitad del título (el arco de arriba pasa por detrás de las letras) y lleva la bajada en su centro; el aviso
 *     («Scrolleá para explorarlo», sin tocar) queda debajo, afuera del aro.
 *   · Teléfono y tablet: el título mucho más grande, en dos renglones; la bajada en dos renglones y mucho más grande; el aro VERTICAL
 *     (más alto que ancho), centrado en el bloque.
 * El tamaño del título: `--divisor-del-titulo` y `--tope-del-titulo` (los nombres del Panel), uno por rama.
 *
 * [L8b · 2] Escritorio: el título baja y se apoya justo arriba de la bajada, más grande (`escritorioGrande`). El aro, la bajada y el aviso
 * quedan donde estaban: la caja del aro ya no se mide contra el título sino contra el tamaño de antes (`TITULO_DE_ANTES_EM`: lo que medía el
 * título en em, a 1440/1366/1280/1024), y el título va afuera del flujo, colgado del tope de la bajada.
 *
 * `data-caja-del-titulo` marca lo que el truco de profundidad tiene que esquivar: las cajas de los renglones y de la bajada.
 */

/** [L3] El título por rama: el ancho de la entrada sobre `divisor`, con tope en `tope` svh. */
export const TAMANO_DEL_TITULO = { escritorio: { divisor: 11, tope: 12.5 }, escritorioGrande: { divisor: 8.2, tope: 16 }, telefono: { divisor: 5.2, tope: 9 } } as const

/** [L8b] El título de antes (el de `escritorio`), en em de su letra: su ancho y su alto (medidos en el build). Arman la caja del aro sin él. */
export const TITULO_DE_ANTES_EM = { ancho: 7.32, alto: 0.9, subidaDelAro: 0.45 } as const

/** [L3] El aro de escritorio: su ancho sobre el del título y su proporción (ancho / alto); el del teléfono, vertical. */
export const ARO_DE_LA_ENTRADA = { escritorio: { ancho: 1.12, proporcion: 3 }, telefono: { ancho: 1.08, proporcion: 0.7, enTitulos: 5.4, minimoRem: 20, minimoTopeVw: 100 } } as const

/** [L3] Lo que mide la mitad de la bajada en la letra de los cuerpos (em, medido a 390 con margen): su tamaño en el teléfono la deja en dos renglones. */
export const EM_DE_MEDIA_BAJADA = 15

/** Los números de arriba, como variables (las clases los consumen por `var()`: ningún literal con unidad en el marcado). */
const T = TAMANO_DEL_TITULO
const A = ARO_DE_LA_ENTRADA
const VARIABLES = {
  '--divisor-del-titulo-telefono': String(T.telefono.divisor),
  '--tope-del-titulo-telefono': `${String(T.telefono.tope)}svh`,
  '--divisor-del-titulo-escritorio': String(T.escritorio.divisor),
  '--tope-del-titulo-escritorio': `${String(T.escritorio.tope)}svh`,
  '--divisor-del-titulo-grande': String(T.escritorioGrande.divisor),
  '--tope-del-titulo-grande': `${String(T.escritorioGrande.tope)}svh`,
  '--titulo-de-antes-em': String(TITULO_DE_ANTES_EM.ancho),
  '--bajada-del-aro-em': String(TITULO_DE_ANTES_EM.alto - TITULO_DE_ANTES_EM.subidaDelAro),
  '--ancho-del-aro': String(A.escritorio.ancho),
  '--proporcion-del-aro': String(A.escritorio.proporcion),
  '--ancho-del-aro-telefono': String(A.telefono.ancho),
  '--proporcion-del-aro-telefono': String(A.telefono.proporcion),
  '--em-de-media-bajada': String(EM_DE_MEDIA_BAJADA),
  '--aro-en-titulos': String(A.telefono.enTitulos),
  '--minimo-del-aro-telefono': `min(${String(A.telefono.minimoRem)}rem, ${String(A.telefono.minimoTopeVw)}vw)`,
} as CSSProperties
/**
 * [L3] El aro del teléfono: el menor entre su parte del ancho y `enTitulos` veces el título (la tablet no lo saca de cuadro), centrado en
 * TODO el bloque de la entrada (el título, la bajada y el aviso): vertical, el aviso del gesto queda adentro, abajo y sin tocarlo. Los
 * márgenes en % son del ancho del bloque, como el ancho: el corrimiento al centro es la mitad del ancho y la mitad del alto (ancho sobre
 * la proporción).
 * [INT] Con un piso (`minimoRem`, en la unidad del aviso) por encima de los dos topes: a 320 el título y el bloque lo dejaban más angosto
 * que el aviso y el arco lo tocaba (a 360, al límite). Nunca más ancho que la pantalla (un plegable de 280).
 */
const ARO_DEL_TELEFONO = [
  'max-escritorio:left-1/2 max-escritorio:top-1/2 max-escritorio:aspect-[var(--proporcion-del-aro-telefono)]',
  'max-escritorio:w-[max(min(calc(var(--ancho-del-aro-telefono)*100%),calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))*var(--aro-en-titulos))),var(--minimo-del-aro-telefono))]',
  'max-escritorio:-ml-[calc(max(min(calc(var(--ancho-del-aro-telefono)*100%),calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))*var(--aro-en-titulos))),var(--minimo-del-aro-telefono))/2)]',
  'max-escritorio:-mt-[calc(max(min(calc(var(--ancho-del-aro-telefono)*100%),calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))*var(--aro-en-titulos))),var(--minimo-del-aro-telefono))/var(--proporcion-del-aro-telefono)/2)]',
].join(' ')
const TAMANO = '[--divisor-del-titulo:var(--divisor-del-titulo-telefono)] [--tope-del-titulo:var(--tope-del-titulo-telefono)] escritorio:[--divisor-del-titulo:var(--divisor-del-titulo-escritorio)] escritorio:[--tope-del-titulo:var(--tope-del-titulo-escritorio)]'

export function IntroDeServicios({ progreso, aviso, className }: { readonly progreso: Progreso; readonly aviso: string | null; readonly className?: string }): React.JSX.Element {
  return (
    <div data-pieza="entrada-de-servicios" className={`${TAMANO} ${className ?? ''}`} style={VARIABLES}>
      <CanalDeUnaPieza progreso={progreso} patron="P2" className="@container relative flex w-full flex-col items-center gap-[var(--spacing-6)] text-center">
        <div className="flex w-full flex-col items-center gap-[var(--spacing-4)] escritorio:relative escritorio:mb-[var(--spacing-4)] escritorio:w-fit escritorio:max-w-full escritorio:gap-0">
          {/* El aro: en escritorio, una caja en el flujo (del tamaño y en el lugar de antes: el título de antes en em) que centra la bajada; en el
              teléfono no arma caja y el lugar se mide contra el bloque entero (centrado, vertical). */}
          <div className="max-escritorio:contents escritorio:relative escritorio:mt-[calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))*var(--bajada-del-aro-em))] escritorio:flex escritorio:aspect-[var(--proporcion-del-aro)] escritorio:w-[calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))*var(--titulo-de-antes-em)*var(--ancho-del-aro))] escritorio:shrink-0 escritorio:items-center escritorio:justify-center">
            {/* En el teléfono el aro se centra en todo el bloque (título, bajada y aviso): el aviso queda adentro, sin tocarlo. */}
            <div aria-hidden="true" data-lugar-de-los-nanobots={0} className={`pointer-events-none absolute escritorio:inset-0 ${ARO_DEL_TELEFONO}`} />
            {/* [L8b] En escritorio el título cuelga del tope de la bajada (afuera del flujo, centrado aunque pase el ancho del aro); en el teléfono
                las dos cajas son `contents` y el orden es el de antes (el título, la bajada). */}
            <div className="max-escritorio:contents escritorio:relative">
              <div className="max-escritorio:contents escritorio:absolute escritorio:inset-x-0 escritorio:bottom-full escritorio:mb-[var(--spacing-2)] escritorio:flex escritorio:justify-center escritorio:[--divisor-del-titulo:var(--divisor-del-titulo-grande)] escritorio:[--tope-del-titulo:var(--tope-del-titulo-grande)]">
                <TituloQueSePintaAlLlegar renglones={RENGLONES_DEL_TITULO} progreso={progreso} id={idDelTitularDeSeccion('servicios')} className="relative z-10 escritorio:whitespace-nowrap" claseDelRenglon="block whitespace-nowrap escritorio:inline" />
              </div>
              {/* La bajada del teléfono: lo más grande que entra en dos renglones (el ancho sobre el largo de medio texto, en em), con tope. */}
              <p className="font-cuerpo leading-texto text-tinta max-escritorio:text-balance max-escritorio:text-[length:max(var(--text-fluido-titulo-m),min(100cqw/var(--em-de-media-bajada),calc(var(--text-fluido-titulo-l)*1.15)))] escritorio:whitespace-nowrap escritorio:text-[length:calc(var(--text-fluido-titulo-m)*0.78)]">
                <span data-caja-del-titulo="">{SUBTITULO}</span>
              </p>
            </div>
          </div>
        </div>
        {aviso === null ? null : <AvisoDeScroll texto={aviso} />}
      </CanalDeUnaPieza>
    </div>
  )
}

/** Pasa el progreso del bloque medido (en la pista) a la entrada (en el escenario). */
export function PasarElProgreso({ progreso, a }: { readonly progreso: MotionValue<number> | null; readonly a: (p: MotionValue<number> | null) => void }): null {
  useEffect(() => {
    a(progreso)
    return () => a(null)
  }, [progreso, a])
  return null
}
