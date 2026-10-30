'use client'

import { useEffect, useState } from 'react'

import { AvisoDeScroll } from '../../_componentes/avisos/AvisoDeScroll'
import { PresetDeLaPagina } from '../../_lib/escena/ruta/PresetDeLaPagina'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { TitularQueSeLevanta, usePresencia } from '../../_secciones/trabajos/portfolio/levantarse'
import { PRESET_DE_LA_INTRO_DE_DIA } from './preset'

/** Las tres páginas de día con un nombre que el título 3D no sabe escribir (sus fuentes están recortadas a seis títulos). */
const PAGINAS = [
  { id: 'nosotros', derecho: 'Nosotros', cursiva: 'dos amigos, una marca', bajada: 'Somos de Yerba Buena, Tucumán, y nos conocemos de toda la vida. develOP es nuestra historia.' },
  { id: 'portfolio', derecho: 'Portfolio', cursiva: 'lo que hicimos', bajada: 'Cada uno de estos proyectos se pensó desde cero para resolver un problema real del cliente.' },
  { id: 'blog', derecho: 'Blog', cursiva: 'notas para tu negocio', bajada: 'Lo que aprendimos haciendo, explicado sin vueltas.' },
] as const

/** La sombra pegada a las letras de la intro (`_estilos/intro.css`), en papel: sobre la escena de día el texto es tinta. */
const SOMBRA_DE_DIA = { textShadow: '0 0 0.06em var(--color-fondo), 0 0 0.06em var(--color-fondo), 0 0 0.12em var(--color-fondo), 0 0 0.12em var(--color-fondo)' } as const

/**
 * [L7e] LA INTRO CORTA DE DÍA — Nosotros, Portfolio y Blog son de día y su nombre no está entre los títulos que el 3D sabe escribir (hay
 * que regenerar las fuentes: P-H). Mientras tanto, ¿cómo se ve su intro con la escena? Una pantalla: la sala de día en la pose del hero
 * (el logo a la derecha, con el mouse), el título en el DOM a la izquierda en los dos registros del sitio, que SE LEVANTA al llegar (el
 * efecto de los títulos del teléfono, acá en todo ancho), su bajada y el aviso de scroll; después, el papel. «Poca animación al
 * principio y pasa rápido al fondo» (ESTRUCTURA). Se puede cambiar de página para ver los tres nombres.
 */
export function IntroDeDia(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const [indice, setIndice] = useState(0)
  // El título se baja y se vuelve a levantar con cada cambio de página (y la primera vez, al montar).
  const [arriba, setArriba] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setArriba(true), 250)
    return () => window.clearTimeout(t)
  }, [indice])
  const presencia = usePresencia(arriba || reducido, reducido, PRESENCIA_DEL_ENCABEZADO)
  const pagina = PAGINAS[indice]
  const cambiar = (i: number): void => {
    if (i === indice) return
    setArriba(false)
    setIndice(i)
  }
  return (
    <CompuertaDelHome>
      <PresetDeLaPagina preset={PRESET_DE_LA_INTRO_DE_DIA} />
      <section data-intro-del-laboratorio="" className="relative flex h-svh flex-col justify-center px-6 tablet:px-12 escritorio:px-[8vw]">
        <div className="max-w-[46rem] escritorio:max-w-[42vw]" style={SOMBRA_DE_DIA}>
          <h1 className="text-titulo-l leading-titulo escritorio:text-[length:min(7vw,6.5rem)]">
            <span className="block overflow-hidden">
              <TitularQueSeLevanta presencia={presencia}>
                <span className="block font-display font-fuerte tracking-display uppercase">{pagina.derecho}</span>
              </TitularQueSeLevanta>
            </span>
            <span className="block overflow-hidden">
              <TitularQueSeLevanta presencia={presencia}>
                <span className="block text-[0.62em] font-liviano tracking-titulo italic uppercase">{pagina.cursiva}</span>
              </TitularQueSeLevanta>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-texto">{pagina.bajada}</p>
          <div role="group" aria-label="Probar con otra página" className="mt-8 flex flex-wrap gap-2">
            {PAGINAS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={i === indice}
                onClick={() => cambiar(i)}
                className={`rounded-full border px-4 py-1.5 text-cuerpo backdrop-blur-[20px] transition-colors duration-[var(--duracion-rapida)] ease-[var(--ease-salida)] ${i === indice ? 'border-tinta bg-tinta text-fondo' : 'border-borde bg-fondo/60 text-tinta'}`}
              >
                {p.derecho}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-8">
          <AvisoDeScroll texto="Scrolleá para explorarlo" tono="escena" />
        </div>
      </section>
      <section className="relative min-h-svh bg-fondo px-6 py-24 text-tinta">
        <div className="mx-auto max-w-3xl">
          <Gatillo desde="abajo">
            <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Acá empieza el papel</p>
            <p className="mt-4 text-titulo-s leading-titulo">
              Una pantalla de escena y al papel: la escena se duerme debajo apenas la intro sale del cuadro, y vuelve a despertar al subir.
            </p>
          </Gatillo>
        </div>
      </section>
    </CompuertaDelHome>
  )
}
