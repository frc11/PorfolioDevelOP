'use client'

import { useCallback, useEffect, useRef } from 'react'

import { avanceDeEntrada, porCuadroDelScroll, useAlCruzar } from '../_componentes/pagina/alCruzar'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Imagen } from '../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { CONTENIDO as DEL_HOME } from '../_secciones/quienes-somos/contenido'
import { CLASE_DE_RELACION, GEOMETRIA, SIZES_DEL_RETRATO } from '../_secciones/quienes-somos/geometria'
import { MarcoDeDosTomas } from '../_secciones/quienes-somos/marco'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { EQUIPO, FACULTAD } from './contenido'

type PersonaDelHome = (typeof DEL_HOME.personas)[number]

/**
 * [M1] UNA PERSONA DEL EQUIPO — el prototipo 2 (`dos-tomas`, aprobado tal cual): el párrafo largo con la foto de dos tomas del home
 * (`MarcoDeDosTomas`) al costado. En escritorio la segunda toma es la del marco del home (puntero o toque); abajo de 1024, donde no hay
 * mouse, se abre SOLA cuando la foto cruza la mitad de la pantalla y se cierra al volver a subir. Por dentro se aprieta el mismo botón que
 * tocaría la persona: el revelado, el sonido y la accesibilidad son los del home.
 */
function Persona({ persona, parrafos, lado, porScroll }: { readonly persona: PersonaDelHome; readonly parrafos: readonly string[]; readonly lado: 'izquierda' | 'derecha'; readonly porScroll: boolean }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const alCambiar = useCallback((adentro: boolean) => {
    const boton = caja.current?.querySelector<HTMLButtonElement>('[data-toque="marco"]')
    if (boton === null || boton === undefined) return
    const abierto = boton.getAttribute('aria-pressed') === 'true'
    if (abierto !== adentro) boton.click()
  }, [])
  useAlCruzar(caja, alCambiar, porScroll)
  return (
    <article data-persona={persona.nombre} className="grid grid-cols-1 items-center gap-[var(--spacing-8)] escritorio:grid-cols-2 escritorio:gap-[var(--spacing-16)]">
      <div ref={caja} className={lado === 'derecha' ? 'w-full escritorio:order-2' : 'w-full'}>
        <Gatillo desde="abajo">
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
        </Gatillo>
      </div>
      <Gatillo desde="abajo" className="min-w-0" claseDelContenido="flex flex-col gap-[var(--spacing-4)]">
        <header className="flex flex-col gap-[var(--spacing-1)]">
          <Titular nivel="titulo-m" como="h3">
            {persona.nombre}
          </Titular>
          <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
            {persona.rol}
          </Caption>
        </header>
        {parrafos.map((p) => (
          <Cuerpo key={p.slice(0, 24)} className="escritorio:text-base">
            {p}
          </Cuerpo>
        ))}
      </Gatillo>
    </article>
  )
}

/**
 * [M1] LA FOTO QUE SE ABRE — la de la facultad, cerrada a una rendija en el centro, que se abre con el scroll hasta mostrarse entera (el
 * `clip-path` de la segunda toma, atado al scroll en vez de al toque). La foto es chica (500 × 298): se muestra a su ancho como mucho, para
 * que no se vea borrosa. Escribe el recorte por cuadro (React no vuelve a dibujar). Con movimiento reducido, abierta.
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
    return porCuadroDelScroll(() => {
      const a = avanceDeEntrada(el.getBoundingClientRect().top, window.innerHeight, 0.25)
      // Cerrada a una línea en el centro (un 1 % del alto, un 30 % del ancho); abierta, entera.
      el.style.clipPath = `inset(${((1 - a) * 49.5).toFixed(2)}% ${((1 - a) * 35).toFixed(2)}%)`
    })
  }, [reducido])
  return (
    <figure data-pieza="foto-de-la-facultad" className="flex flex-col gap-[var(--spacing-4)] escritorio:items-center">
      <div ref={foto} className="w-full max-w-[500px] overflow-hidden rounded-[var(--radius-fuerte)] will-change-[clip-path]" style={{ clipPath: 'inset(49.5% 35%)' }}>
        <Imagen src={FACULTAD.src} alt={FACULTAD.alt} ancho={FACULTAD.ancho} alto={FACULTAD.alto} sizes="(min-width: 540px) 500px, 100vw" />
      </div>
      <figcaption>
        <Caption como="span" interletrado="micro" className="font-codigo uppercase text-tinta-media">
          {FACULTAD.leyenda}
        </Caption>
      </figcaption>
    </figure>
  )
}

/** [M1] EL EQUIPO — Franco y Valentino, cada uno con su párrafo y su foto, alternando los lados; al final, donde estudiamos. */
export function Equipo(): React.JSX.Element {
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const [franco, valentino] = DEL_HOME.personas
  return (
    <SeccionDePapel dato="equipo" claseDeContenido="gap-[var(--spacing-16)]">
      <TituloQueSube titulo={EQUIPO.titulo} como="h2" nivel="titulo-l" />
      <Persona persona={franco} parrafos={EQUIPO.franco} lado="izquierda" porScroll={!escritorio} />
      <Persona persona={valentino} parrafos={EQUIPO.valentino} lado="derecha" porScroll={!escritorio} />
      <div className="flex flex-col gap-[var(--spacing-6)] pt-[var(--spacing-12)]">
        <TituloQueSube titulo={FACULTAD.titulo} como="h3" nivel="titulo-m" />
        <FotoQueSeAbre />
      </div>
    </SeccionDePapel>
  )
}
