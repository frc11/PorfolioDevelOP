/**
 * [SERVICIOS S1b] 7 · PRUEBA — los casos (SPEC §5), o el llamado a la demo del panel (en IA).
 *
 * Un caso es del portfolio (`proyecto`) o propio de servicios. De cada proyecto del portfolio se leen SOLO el nombre, el
 * rubro, la dirección, los pósters y el alt (`vistaDelProyecto`), y servicios suma su texto: nunca `resena`,
 * `problemaResuelto` ni lo demás, que desde B1.1b pasa por la llave del contenido inventado (plan §8.3).
 *
 * Los datos que faltan (`null`) son [a definir]: el marcador en desarrollo y, en producción, el ítem que depende del dato no
 * se monta (plan §8.4). Un caso propio sin texto no se monta; el bloque entero no existe si no queda nada que mostrar.
 */

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { Imagen } from '../../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorTresTramos, sizesPorViewport } from '../../_lib/imagen'
import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import { textoOMarcador } from '../formato'
import type { Caso, Prueba as DatosDePrueba, ProyectoSlug } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'Prueba' // C2: provisorio (el nombre de SPEC §5)
const ROTULO_DEL_ENLACE = 'Visitar sitio' // C2: provisorio
const AVISO_DE_PESTANA = 'se abre en una pestaña nueva' // C2: provisorio

/**
 * P-H9: `PROYECTOS` trae las rutas de los pósters pero no sus medidas (desde B1.2b viven en `portfolio/medios.ts`, en
 * `MEDIDAS_DE_LOS_MEDIOS`, fuera de `MediosDelProyecto`). Hasta que el home las sume ahí, la relación de aspecto se declara ACÁ, una
 * sola vez. Los pósters de escritorio son 16:10 (1440×900, y 1280×800 el de El Garage). Los de móvil miden 780×1688 (Banu),
 * 690×1494 (Esquina) y 390×844 (El Garage, rehecho en B1.2b): los tres tienen la relación de 780×1688. Las capturas propias de
 * servicios usan la de escritorio.
 */
const MEDIDAS_DE_LA_CAPTURA = {
  escritorio: { ancho: 1440, alto: 900 },
  movil: { ancho: 780, alto: 1688 },
} as const // P-H9

/** Escritorio: tres columnas de 8/12 (≈22vw); en tablet, una columna casi a todo el ancho. */
const SIZES_DE_ESCRITORIO = sizesPorTresTramos(22, 90, 100)
/** Móvil: el póster vertical ocupa 3/5 del ancho. */
const SIZES_DE_MOVIL = sizesPorViewport(60, 60)

interface VistaDelProyecto {
  readonly nombre: string
  readonly rubro: string | null
  readonly url: string
  readonly poster: { readonly escritorio: string; readonly movil: string }
  readonly alt: string
}

/** Lo único que servicios lee de un proyecto del portfolio. */
function vistaDelProyecto(slug: ProyectoSlug): VistaDelProyecto | null {
  const proyecto = FUENTE_DE_PROYECTOS.find((candidato) => candidato.slug === slug)
  if (proyecto === undefined) return null
  return {
    nombre: proyecto.nombre,
    rubro: proyecto.rubro,
    url: proyecto.url,
    poster: proyecto.medios.poster,
    alt: proyecto.alt,
  }
}

interface PruebaProps {
  readonly prueba: DatosDePrueba
  readonly enDesarrollo: boolean
}

export function Prueba({ prueba, enDesarrollo }: PruebaProps): React.JSX.Element | null {
  const casos = prueba.casos.filter((caso) => seMonta(caso, enDesarrollo))
  const { ctaPanel } = prueba
  const hayPanel = ctaPanel !== null && (ctaPanel.href !== null || textoOMarcador(null, enDesarrollo) !== null)
  if (casos.length === 0 && prueba.nota === null && !hayPanel) return null
  return (
    <Bloque nombre="prueba" titulo={TITULO}>
      {casos.length === 0 ? null : (
        <ul role="list" className="grid grid-cols-1 gap-12 escritorio:grid-cols-3 escritorio:gap-x-8">
          {casos.map((caso) => (
            <TarjetaDeCaso key={caso.tipo === 'proyecto' ? caso.slug : caso.nombre} caso={caso} enDesarrollo={enDesarrollo} />
          ))}
        </ul>
      )}
      {prueba.nota === null ? null : <Cuerpo className="mt-8 text-tinta-media">{prueba.nota}</Cuerpo>}
      {hayPanel ? <PanelDeLaDemo ctaPanel={ctaPanel} enDesarrollo={enDesarrollo} /> : null}
    </Bloque>
  )
}

/** ¿Hay algo que mostrar de este caso? Un proyecto que no está en la fuente, o un caso propio sin texto, no se monta. */
function seMonta(caso: Caso, enDesarrollo: boolean): boolean {
  switch (caso.tipo) {
    case 'proyecto':
      return vistaDelProyecto(caso.slug) !== null
    case 'propio':
      return textoOMarcador(caso.texto, enDesarrollo) !== null
    default:
      return sinCaso(caso)
  }
}

function TarjetaDeCaso({ caso, enDesarrollo }: { readonly caso: Caso; readonly enDesarrollo: boolean }): React.JSX.Element | null {
  switch (caso.tipo) {
    case 'proyecto':
      return <CasoDeProyecto slug={caso.slug} texto={caso.texto} />
    case 'propio':
      return <CasoPropio caso={caso} enDesarrollo={enDesarrollo} />
    default:
      return sinCaso(caso)
  }
}

function CasoDeProyecto({ slug, texto }: { readonly slug: ProyectoSlug; readonly texto: string }): React.JSX.Element | null {
  const proyecto = vistaDelProyecto(slug)
  if (proyecto === null) return null
  return (
    <li className="flex flex-col gap-4">
      <Imagen
        src={proyecto.poster.escritorio}
        alt={proyecto.alt}
        ancho={MEDIDAS_DE_LA_CAPTURA.escritorio.ancho}
        alto={MEDIDAS_DE_LA_CAPTURA.escritorio.alto}
        sizes={SIZES_DE_ESCRITORIO}
        className="rounded-sutil max-tablet:hidden"
      />
      <Imagen
        src={proyecto.poster.movil}
        alt={proyecto.alt}
        ancho={MEDIDAS_DE_LA_CAPTURA.movil.ancho}
        alto={MEDIDAS_DE_LA_CAPTURA.movil.alto}
        sizes={SIZES_DE_MOVIL}
        className="w-3/5 rounded-sutil tablet:hidden"
      />
      <div className="flex flex-col gap-2">
        <Titular nivel="titulo-s" como="h3">
          {proyecto.nombre}
        </Titular>
        {proyecto.rubro === null ? null : <Caption className="text-tinta-media uppercase">{proyecto.rubro}</Caption>}
        <Cuerpo>{texto}</Cuerpo>
        <a
          href={proyecto.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${ROTULO_DEL_ENLACE} de ${proyecto.nombre}, ${AVISO_DE_PESTANA}`}
          className="mt-2 self-start underline-offset-4 hover:underline"
        >
          <Cuerpo como="span" peso="semi">
            {ROTULO_DEL_ENLACE}
          </Cuerpo>{' '}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </li>
  )
}

function CasoPropio({
  caso,
  enDesarrollo,
}: {
  readonly caso: Extract<Caso, { readonly tipo: 'propio' }>
  readonly enDesarrollo: boolean
}): React.JSX.Element | null {
  const texto = textoOMarcador(caso.texto, enDesarrollo)
  if (texto === null) return null
  const rubro = caso.rubro ?? textoOMarcador(null, enDesarrollo)
  const sinImagen = caso.imagen === null ? textoOMarcador(null, enDesarrollo) : null
  return (
    <li className="flex flex-col gap-4">
      {caso.imagen === null ? null : (
        <Imagen
          src={caso.imagen}
          alt={`Captura de ${caso.nombre}`} // C2: provisorio
          ancho={MEDIDAS_DE_LA_CAPTURA.escritorio.ancho}
          alto={MEDIDAS_DE_LA_CAPTURA.escritorio.alto}
          sizes={SIZES_DE_ESCRITORIO}
          className="rounded-sutil"
        />
      )}
      {sinImagen === null ? null : <Caption className="text-tinta-media">{`Captura: ${sinImagen}`}</Caption>}
      <div className="flex flex-col gap-2">
        <Titular nivel="titulo-s" como="h3">
          {caso.nombre}
        </Titular>
        {rubro === null ? null : <Caption className="text-tinta-media uppercase">{rubro}</Caption>}
        <Cuerpo>{texto}</Cuerpo>
      </div>
    </li>
  )
}

/** «Probá el panel» (IA): un enlace de verdad. Sin destino todavía ([a definir]) es solo un marcador de desarrollo. */
function PanelDeLaDemo({
  ctaPanel,
  enDesarrollo,
}: {
  readonly ctaPanel: NonNullable<DatosDePrueba['ctaPanel']>
  readonly enDesarrollo: boolean
}): React.JSX.Element | null {
  if (ctaPanel.href === null) {
    const marcador = textoOMarcador(null, enDesarrollo)
    return marcador === null ? null : <Cuerpo className="mt-8 text-tinta-media">{`${ctaPanel.rotulo}: ${marcador}`}</Cuerpo>
  }
  return (
    <div className="mt-8">
      <CtaEnlace href={ctaPanel.href} rotulo={ctaPanel.rotulo} />
    </div>
  )
}

/** El `default` de los `switch` sobre `Caso`: con las dos variantes cubiertas `caso` es `never`. */
function sinCaso(caso: never): never {
  throw new Error(`Prueba: tipo de caso sin rama (${String(caso)})`)
}
