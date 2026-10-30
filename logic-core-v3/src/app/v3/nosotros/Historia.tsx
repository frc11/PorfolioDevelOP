'use client'

import { useEffect, useRef } from 'react'

import { porCuadroDelScroll } from '../_componentes/pagina/alCruzar'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { avanceDeLaPalabra, avanceDelPintado, grisSinPintar } from '../_componentes/pintado/pintado'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { HISTORIA } from './contenido'

/** El color de una palabra con su pintado: la tinta en la proporción de `--pintado`, el resto el gris de lo no leído (el del Panel). */
const COLOR_DE_LA_PALABRA = { color: 'color-mix(in oklab, var(--color-tinta) calc(var(--pintado, 1) * 100%), var(--gris-del-pintado))' } as const

/**
 * [M1] UNA FRASE QUE SE PINTA — sólo las tres importantes de la historia («calidad excepcional», «esto no es un proyecto aislado», «no
 * tenemos límites»): palabra por palabra, de gris a tinta, con el cálculo del título del Panel (`_componentes/pintado/`: empieza con su
 * centro asomando por abajo y termina con el centro en la mitad de la pantalla). En el otro registro (la display en mayúsculas). Con
 * movimiento reducido, pintada.
 */
function FraseQueSePinta({ texto }: { readonly texto: string }): React.JSX.Element {
  const frase = useRef<HTMLSpanElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  useEffect(() => {
    const el = frase.current
    if (el === null || reducido) return undefined
    el.style.setProperty('--gris-del-pintado', grisSinPintar())
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')]
    const soltar = porCuadroDelScroll(() => {
      const caja = el.getBoundingClientRect()
      const avance = avanceDelPintado(caja.top + caja.height / 2, window.innerHeight)
      palabras.forEach((p, i) => p.style.setProperty('--pintado', avanceDeLaPalabra(avance, i, palabras.length).toFixed(3)))
    })
    return () => {
      soltar()
      for (const p of palabras) p.style.removeProperty('--pintado')
    }
  }, [reducido])
  return (
    <span ref={frase} data-frase-pintada="" className="font-display font-fuerte tracking-display uppercase">
      {texto.split(' ').map((palabra, i) => (
        <span key={i}>
          <span data-palabra="" style={COLOR_DE_LA_PALABRA}>
            {palabra}
          </span>{' '}
        </span>
      ))}
    </span>
  )
}

/**
 * [M1] LA HISTORIA — el pintado entero del prototipo 6 se fue (Valentino: «na, cansa»): cada párrafo entra con la subida desde abajo del
 * sitio (`Gatillo desde="abajo"`) y nada más, y sólo las tres frases importantes se pintan. El texto, grande, de punta a punta de la
 * página: la historia es lo primero que se lee en el papel.
 */
export function Historia(): React.JSX.Element {
  return (
    <SeccionDePapel dato="historia" claseDeContenido="gap-[var(--spacing-12)]">
      <TituloQueSube titulo={HISTORIA.titulo} como="h2" nivel="titulo-l" />
      <div className="flex flex-col gap-[var(--spacing-8)] escritorio:max-w-[88%]">
        {HISTORIA.parrafos.map((parrafo) => (
          <Gatillo key={parrafo[0]?.texto} desde="abajo">
            <p className="text-titulo-s leading-titulo tablet:text-titulo-m">
              {parrafo.map((tramo) => (
                <span key={tramo.texto}>{tramo.destacado === true ? <FraseQueSePinta texto={tramo.texto} /> : `${tramo.texto} `}</span>
              ))}
            </p>
          </Gatillo>
        ))}
      </div>
    </SeccionDePapel>
  )
}
