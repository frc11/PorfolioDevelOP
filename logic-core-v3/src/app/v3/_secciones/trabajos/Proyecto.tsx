import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'
import { MEDIDAS_DE_LOS_MEDIOS, SIZES_DE_LA_RANURA } from './geometria'

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]
type MedioDeContenido = ProyectoDeContenido['logo'] | ProyectoDeContenido['pagina']

/**
 * UN TRABAJO, QUIETO — el nombre, el rubro y sus dos medios, en el orden del
 * documento.
 *
 * ⚠️ **Es de la rama QUIETA y de ninguna otra.** Arriba de 1025 las cuatro
 * piezas viven en la zona central (`CapaDelTunel`); acá no hay coreografía, así
 * que la sección se lee como lo que es: una lista. Por eso este archivo no
 * importa una sola primitiva de movimiento y **no escribe una transformada ni un
 * `absolute`** — que es lo que `s7-arboles` §4 exige de esta rama.
 *
 * ⚠️ **Las cuatro piezas llevan el MISMO enlace que arriba de 1025**, y por la
 * misma razón: `s10-acceso` compara el texto anunciado de las dos ramas carácter
 * por carácter, y una parada de teclado que sólo exista en una de las dos sería
 * un recorrido distinto según el ancho.
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

/** Un medio real, entero y sin recortar: su propia relación manda. */
function Medio({
  medio,
  medida,
  className,
}: {
  readonly medio: MedioDeContenido
  readonly medida: { readonly ancho: number; readonly alto: number }
  readonly className?: string
}): React.JSX.Element {
  return (
    <MarcoDeMedio
      marcador="[CAPTURA]"
      fuente={medio.fuente}
      alt={medio.alt}
      ancho={medida.ancho}
      alto={medida.alto}
      sizes={SIZES_DE_LA_RANURA}
      className={className}
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
  const medidas = MEDIDAS_DE_LOS_MEDIOS[indice]
  return (
    <article data-proyecto={proyecto.nombre} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Titular nivel="titulo-m" como="h3">
          <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer" data-pieza="enlace-de-proyecto">
            {proyecto.nombre}
          </a>
        </Titular>
        <AlSitio proyecto={proyecto}>
          <Cuerpo como="span">{proyecto.rubro}</Cuerpo>
        </AlSitio>
      </div>

      {/* Un tercio para la marca, dos para la pantalla. Celdas distintas: a
          tamaño completo no hay superposición posible. */}
      <Grilla columnas={3} canal="compacto" className="items-end">
        <AlSitio proyecto={proyecto} nombreAccesible={proyecto.logo.alt}>
          <Medio medio={proyecto.logo} medida={medidas.logo} className="self-start" />
        </AlSitio>
        <AlSitio proyecto={proyecto} nombreAccesible={proyecto.pagina.alt}>
          <Medio medio={proyecto.pagina} medida={medidas.pagina} className="tablet:col-span-2" />
        </AlSitio>
      </Grilla>
    </article>
  )
}
