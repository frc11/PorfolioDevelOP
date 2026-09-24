'use client'

import type { CSSProperties, Ref } from 'react'

import { Isotipo } from '../../_componentes/marca/Marca'
import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorViewport } from '../../_lib/imagen'
import { Bloque } from '../_contrato/coreografia'
import { ALFA_DEL_FONDO } from './Fondo'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { CAPTURA, PALABRAS_DEL_FONDO, type Tarjeta as DatosDeTarjeta } from './contenido'
import { TABLA_DEL_CAOS, TAMANOS, arranques, claseMovil, velocidadDe } from './geometria'

const TOPES = arranques()

/**
 * UNA FEATURE DEL CAOS — su lugar sale de `TABLA_DEL_CAOS`, fila `indice`.
 *
 * Cuatro capas, cada una con UNA transformada para que no se pisen:
 *   `<li>`        el lugar (variables de la tabla) y la PROFUNDIDAD, que la
 *                 escribe `Galeria` desde su única suscripción de scroll;
 *   P2            la llegada de la casa, subiendo desde abajo;
 *   el zoom       1,05 con el hover, adentro del marco, que no se mueve;
 *   el parallax   la imagen, 130 % del marco, corrida por `Galeria`.
 *
 * El lugar va en variables de CSS porque viene del DATO (una clase armada con el
 * número no la vería el escáner de Tailwind). Abajo de 1025 no se usan: la
 * columna alterna anchos con `claseMovil`.
 */
export function Tarjeta({
  tarjeta,
  indice,
  alAbrir,
  refDelBoton,
  refDelMarco,
  refDelParallax,
}: {
  readonly tarjeta: DatosDeTarjeta
  readonly indice: number
  readonly alAbrir: (indice: number) => void
  readonly refDelBoton: Ref<HTMLButtonElement>
  readonly refDelMarco: Ref<HTMLSpanElement>
  readonly refDelParallax: Ref<HTMLSpanElement>
}): React.JSX.Element {
  const fila = TABLA_DEL_CAOS[indice]
  const tamano = TAMANOS[fila.tamano]
  const esLaUltima = indice === TABLA_DEL_CAOS.length - 1
  const esPlaceholder = tarjeta.imagen === CAPTURA.fuente
  const lugar = { '--x': `${fila.columna}%`, '--w': `${tamano.ancho}%`, '--y': `${TOPES[indice]}svh` } as CSSProperties
  // La última queda asentada en el flujo, antes del cierre; las demás flotan.
  // MÓVIL 2: a 1024 (y sólo ahí) la imagen crece `ESCALA_DE_LAS_FEATURES_A_1024` y, si no entra, se corre hacia adentro.
  const claseDeLugar = esLaUltima
    ? 'escritorio:ml-[var(--x)] escritorio:w-[var(--w)] escritorio:[@media(width<=theme(--breakpoint-escritorio))]:ml-[min(var(--x),calc(98%-var(--w)*var(--escala-a-1024)))] escritorio:[@media(width<=theme(--breakpoint-escritorio))]:w-[calc(var(--w)*var(--escala-a-1024))]'
    : 'escritorio:absolute escritorio:top-[var(--y)] escritorio:left-[var(--x)] escritorio:w-[var(--w)] escritorio:[@media(width<=theme(--breakpoint-escritorio))]:left-[min(var(--x),calc(98%-var(--w)*var(--escala-a-1024)))] escritorio:[@media(width<=theme(--breakpoint-escritorio))]:w-[calc(var(--w)*var(--escala-a-1024))]'

  return (
    <li data-pieza="feature-del-panel" data-tamano={fila.tamano} data-profundidad={velocidadDe(indice)} style={lugar} className={`${claseMovil(indice)} ${claseDeLugar} max-escritorio:relative escritorio:z-[var(--z-elevado)]`}>
      <Bloque patron="P2" rango="ventana-visible">
        {(progreso) => (
          <CanalDeUnaPieza progreso={progreso} patron="P2">
            <button ref={refDelBoton} type="button" aria-haspopup="dialog" onClick={() => alAbrir(indice)} className="group block w-full cursor-pointer text-left">
              <span ref={refDelMarco} data-parte="marco" className="bg-superficie-2 relative block aspect-16/10 w-full overflow-hidden">
                <span className="absolute inset-0 block transition-transform duration-[var(--duracion-media)] ease-in-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none">
                  <span ref={refDelParallax} data-parte="parallax" className="absolute inset-x-0 top-0 block h-13/10">
                    <Imagen src={tarjeta.imagen} alt={tarjeta.alt} ancho={CAPTURA.ancho} alto={CAPTURA.alto} sizes={sizesPorViewport(tamano.ancho, 88)} className="h-full object-cover" />
                  </span>
                </span>
                {/* El marcador se VE (es un placeholder) pero no se anuncia: repetido
                    ocho veces le ensuciaría el nombre a cada botón. */}
                {esPlaceholder && (
                  <span aria-hidden="true" className="bg-fondo absolute top-[var(--spacing-3)] left-[var(--spacing-3)] px-[var(--spacing-2)] py-[var(--spacing-1)]">
                    <Micro como="span" peso="medio" className="uppercase">
                      {CAPTURA.marcador}
                    </Micro>
                  </span>
                )}
              </span>

              <span className="mt-[var(--spacing-3)] flex flex-col items-start gap-[var(--spacing-2)]">
                <span className="relative block transition-transform duration-[var(--duracion-media)] ease-in-out group-hover:translate-x-[var(--spacing-8)] group-focus-visible:translate-x-[var(--spacing-8)] motion-reduce:transition-none">
                  {/* La marca «qo» entra desde la izquierda donde nk pone su «/»: termina
                      en el origen del título, que se corrió para hacerle lugar. */}
                  <span
                    aria-hidden="true"
                    data-parte="marca-del-hover"
                    className="text-acento absolute top-0 left-0 flex h-lh -translate-x-[var(--spacing-4)] scale-60 items-center opacity-0 transition duration-[var(--duracion-media)] ease-in-out group-hover:-translate-x-[var(--spacing-8)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:-translate-x-[var(--spacing-8)] group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  >
                    <Isotipo className="h-[var(--spacing-4)]" />
                  </span>
                  <Titular nivel={tamano.nivel} como="span" className="block">
                    {tarjeta.titulo}
                  </Titular>
                </span>
                <Micro como="span" className="text-tinta-tenue uppercase">
                  {tarjeta.etiqueta}
                </Micro>
              </span>
            </button>
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
