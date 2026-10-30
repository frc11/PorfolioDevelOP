'use client'

import { useCallback, useEffect, useRef } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { CONTENIDO } from '../../_secciones/quienes-somos/contenido'
import { CLASE_DE_RELACION, GEOMETRIA, SIZES_DEL_RETRATO } from '../../_secciones/quienes-somos/geometria'
import { MarcoDeDosTomas } from '../../_secciones/quienes-somos/marco'
import { avanceDeEntrada, useAlCruzar } from '../_lab/useAlCruzar'
import { PARRAFOS } from './textos'

/**
 * [L7e · N1] DOS TOMAS, DOS PERSONAS — el párrafo largo de cada uno con su foto al costado, la foto de dos tomas del home
 * (`MarcoDeDosTomas`) importada tal cual. Lo nuevo es el teléfono, donde no hay hover: abajo de 1024 la segunda toma se abre sola
 * cuando la foto cruza la mitad de la pantalla y se cierra al volver a subir (el gesto del gatillo del home). Por dentro se aprieta el
 * mismo botón que tocaría la persona, así que el revelado, el sonido y la accesibilidad son los del home.
 */
export function DosTomas(): React.JSX.Element {
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const [franco, valentino] = CONTENIDO.personas
  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pt-36 pb-16 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Nosotros · el equipo</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Dos amigos,</span>
          <span className="block font-liviano tracking-titulo italic uppercase">una sola marca</span>
        </h1>
        <p className="mt-6 max-w-xl text-cuerpo leading-texto text-tinta-media">
          {escritorio
            ? 'Pasá el mouse por cada foto (o tocala) para ver la otra toma.'
            : 'Scrolleá: cada foto muestra su otra toma cuando llega a la mitad de la pantalla.'}
        </p>
      </header>
      <Persona persona={franco} parrafos={PARRAFOS.franco} lado="izquierda" porScroll={!escritorio} />
      <Persona persona={valentino} parrafos={PARRAFOS.valentino} lado="derecha" porScroll={!escritorio} />
      <FotoQueSeAbre />
    </>
  )
}

type PersonaDelHome = (typeof CONTENIDO.personas)[number]

function Persona({ persona, parrafos, lado, porScroll }: { readonly persona: PersonaDelHome; readonly parrafos: readonly string[]; readonly lado: 'izquierda' | 'derecha'; readonly porScroll: boolean }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  // Abre o cierra apretando el botón del marco: el mismo camino que el toque (con su sonido y su `aria-pressed`).
  const alCambiar = useCallback((adentro: boolean) => {
    const boton = caja.current?.querySelector<HTMLButtonElement>('[data-toque="marco"]')
    if (boton === null || boton === undefined) return
    const abierto = boton.getAttribute('aria-pressed') === 'true'
    if (abierto !== adentro) boton.click()
  }, [])
  useAlCruzar(caja, alCambiar, porScroll)
  const foto = (
    <div ref={caja} className="w-full">
      <MarcoDeDosTomas
        seria={persona.seria}
        suelta={persona.suelta}
        etiqueta={{ texto: persona.nombre, lado }}
        texto={persona.rol}
        registro="rotulo"
        relacion={CLASE_DE_RELACION.retrato}
        ancho={GEOMETRIA.retrato.ancho}
        alto={GEOMETRIA.retrato.alto}
        sizes={SIZES_DEL_RETRATO}
      />
    </div>
  )
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-16 escritorio:grid-cols-2 escritorio:gap-16 escritorio:py-24">
      <div className={lado === 'derecha' ? 'escritorio:order-2' : undefined}>{foto}</div>
      <div>
        <h2 className="font-display text-titulo-m font-fuerte tracking-display uppercase">{persona.nombre}</h2>
        <p className="mt-1 font-codigo text-caption tracking-wide text-tinta-media uppercase">{persona.rol}</p>
        <div className="mt-6 space-y-4">
          {parrafos.map((p) => (
            <p key={p.slice(0, 24)} className="text-cuerpo leading-texto escritorio:text-base">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * [L7e · N4] LA FOTO QUE SE ABRE — la de la facultad (genérica por ahora), cerrada a una rendija en el centro, que se abre con el
 * scroll hasta llenar el cuadro: el `clip-path` desde el centro de la segunda toma, atado al scroll en vez de al hover. Escribe el
 * recorte en el estilo por cuadro (React no vuelve a dibujar). Con movimiento reducido, abierta.
 */
function FotoQueSeAbre(): React.JSX.Element {
  const foto = useRef<HTMLDivElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  useEffect(() => {
    const el = foto.current
    if (el === null) return undefined
    if (reducido) {
      el.style.clipPath = 'inset(0)'
      return undefined
    }
    let pedido = 0
    const recortar = (): void => {
      pedido = 0
      const a = avanceDeEntrada(el.getBoundingClientRect().top, window.innerHeight, 0.15)
      // Cerrada a 1 px de alto y 30 % de ancho en el centro; abierta, entera.
      const vertical = (1 - a) * 49.5
      const horizontal = (1 - a) * 35
      el.style.clipPath = `inset(${vertical.toFixed(2)}% ${horizontal.toFixed(2)}%)`
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(recortar)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    recortar()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [reducido])
  return (
    <section className="px-6 pt-16 pb-48">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-titulo-m font-fuerte tracking-display uppercase">
          Donde <span className="font-cuerpo font-liviano tracking-titulo italic">estudiamos</span>
        </h2>
        <p className="mt-2 max-w-xl text-cuerpo leading-texto text-tinta-media">Foto provisoria: la real la pone Valentino.</p>
      </div>
      <div ref={foto} className="mx-auto mt-10 max-w-7xl overflow-hidden" style={{ clipPath: 'inset(49.5% 35%)', willChange: 'clip-path' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- prototipo: un archivo chico y local, sin pasar por el optimizador */}
        <img src="/v3/laboratorio/facultad.webp" alt="Un aula de una facultad (foto genérica)" width={500} height={298} className="block aspect-[5/3] w-full object-cover" />
      </div>
    </section>
  )
}
