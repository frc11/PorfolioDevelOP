import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'

import { CapturaPorDispositivo } from './Captura'
import { CONTENIDO } from './contenido'
import { MEDIDAS_DE_LAS_CAPTURAS, SIZES_DE_LA_CAPTURA } from './geometria'

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/**
 * UN TRABAJO, QUIETO — el nombre, el rubro y su captura, en orden de documento.
 *
 * ⚠️ **Es de la rama QUIETA y de ninguna otra.** Arriba de 1025 la captura vive
 * en el túnel de zoom (`CapaDelTunel`); acá no hay coreografía, así que la
 * sección se lee como lo que es: una lista apilada. Por eso este archivo no
 * importa una sola primitiva de movimiento y **no escribe una transformada ni un
 * `absolute`** — que es lo que `s7-arboles` exige de esta rama.
 *
 * ⚠️ **Las dos anclas son las MISMAS que arriba de 1025**, y por la misma razón:
 * `s10-acceso` compara el texto anunciado de las dos ramas carácter por carácter
 * y cuenta las paradas de teclado del home entero. Una parada que sólo exista de
 * un lado del umbral sería un recorrido distinto según el ancho.
 *
 * ⚠️ **El rubro NO es un ancla, y es una decisión.** Tres anclas al mismo destino
 * por proyecto se anuncian tres veces seguidas igual; dos ya son las que hacen
 * falta —el nombre, que es lo que se lee, y la imagen, que es lo que se ve—.
 */
function AlSitio({
  proyecto,
  nombreAccesible,
  children,
}: {
  readonly proyecto: ProyectoDeContenido
  readonly nombreAccesible?: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <a
      href={proyecto.enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={nombreAccesible}
      data-pieza="enlace-de-proyecto"
      className="block"
    >
      {children}
    </a>
  )
}

/** La captura real, entera y sin recortar: su propia relación manda. */
function Captura({
  proyecto,
  medida,
}: {
  readonly proyecto: ProyectoDeContenido
  readonly medida: { readonly ancho: number; readonly alto: number }
}): React.JSX.Element {
  return (
    <CapturaPorDispositivo
      fuente={proyecto.pagina.fuente}
      alt={proyecto.pagina.alt}
      ancho={medida.ancho}
      alto={medida.alto}
      sizes={SIZES_DE_LA_CAPTURA}
    />
  )
}

export function Proyecto({
  proyecto,
  indice,
}: {
  readonly proyecto: ProyectoDeContenido
  readonly indice: number
}): React.JSX.Element {
  return (
    <article data-proyecto={proyecto.nombre} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Titular nivel="titulo-m" como="h3">
          <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer" data-pieza="enlace-de-proyecto">
            {proyecto.nombre}
          </a>
        </Titular>
        <Cuerpo como="p">{proyecto.rubro}</Cuerpo>
      </div>

      <AlSitio proyecto={proyecto} nombreAccesible={proyecto.pagina.alt}>
        <Captura proyecto={proyecto} medida={MEDIDAS_DE_LAS_CAPTURAS[indice]} />
      </AlSitio>
    </article>
  )
}
