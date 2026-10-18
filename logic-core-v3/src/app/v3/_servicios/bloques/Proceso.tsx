/**
 * [SERVICIOS S1b · M1] 7 · CÓMO TRABAJAMOS — los pasos en orden y el plazo de referencia (SPEC §5: los plazos nunca se prometen),
 * una frase por trabajo y el enlace al Portfolio del home.
 *
 * El número de cada paso es el de su lugar en la lista, con el formato del home (`numeroEnLaSecuencia`): no se escribe.
 *
 * [M1] Los trabajos son los casos de los datos (`prueba.casos`), con los textos propios que ya existían:
 *   · un proyecto del Portfolio pone su NOMBRE (de `PROYECTOS`, la fuente única) y servicios su frase. De la fuente no se lee nada
 *     más: ni la reseña ni lo resuelto, que pasan por la llave del contenido inventado (plan §8.3);
 *   · un caso propio pone su nombre y su texto; sin texto es [a definir] (el marcador en desarrollo y, en producción, no se monta).
 * El enlace lleva al Portfolio en el PRIMER proyecto de los casos (en Páginas web, El Garage), con el deep link de B1
 * (`hrefDelCasoEnElPortfolio`). Sin un proyecto del Portfolio entre los casos (Software, IA) no hay enlace: un caso de web no se
 * muestra como si fuera de otro servicio.
 */

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { numeroEnLaSecuencia } from '../../_secciones/_contrato/acento'
import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import { textoOMarcador } from '../formato'
import { hrefDelCasoEnElPortfolio } from '../rutas'
import type { Caso, Servicio } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'Cómo trabajamos' // C2: provisorio (el nombre de la sección en el M0)
const ROTULO_DEL_PLAZO = 'Plazo de referencia' // SPEC §7.1: una referencia, no una promesa
const ROTULO_DEL_PORTFOLIO = 'Ver el portfolio' // C2: provisorio

interface Frase {
  readonly clave: string
  readonly nombre: string
  readonly texto: string
}

/** La frase de un trabajo, o `null` si no se monta (un proyecto que no está en la fuente, un caso propio sin texto en producción). */
function fraseDe(caso: Caso, enDesarrollo: boolean): Frase | null {
  if (caso.tipo === 'proyecto') {
    const proyecto = FUENTE_DE_PROYECTOS.find((candidato) => candidato.slug === caso.slug)
    return proyecto === undefined ? null : { clave: caso.slug, nombre: proyecto.nombre, texto: caso.texto }
  }
  const texto = textoOMarcador(caso.texto, enDesarrollo)
  return texto === null ? null : { clave: caso.nombre, nombre: caso.nombre, texto }
}

interface ProcesoProps {
  readonly proceso: Servicio['proceso']
  readonly prueba: Servicio['prueba']
  readonly enDesarrollo: boolean
}

export function Proceso({ proceso, prueba, enDesarrollo }: ProcesoProps): React.JSX.Element {
  const frases = prueba.casos.flatMap((caso) => {
    const frase = fraseDe(caso, enDesarrollo)
    return frase === null ? [] : [frase]
  })
  const primerProyecto = prueba.casos.find((caso) => caso.tipo === 'proyecto')
  const alPortfolio = primerProyecto?.tipo === 'proyecto' ? hrefDelCasoEnElPortfolio(primerProyecto.slug) : null
  return (
    <Bloque nombre="proceso" titulo={TITULO}>
      <ol role="list" className="flex flex-col">
        {proceso.pasos.map((paso, indice) => (
          <li key={paso} className="flex items-baseline gap-6 border-b border-borde py-4">
            <span aria-hidden="true" className="font-codigo text-caption tracking-micro text-acento">
              {numeroEnLaSecuencia(indice + 1)}
            </span>
            <Cuerpo como="span">{paso}</Cuerpo>
          </li>
        ))}
      </ol>
      <p className="mt-8 flex flex-col gap-1">
        <Caption como="span" className="text-tinta-media uppercase">
          {ROTULO_DEL_PLAZO}
        </Caption>{' '}
        <Cuerpo como="span">{proceso.plazo}</Cuerpo>
      </p>
      {frases.length === 0 ? null : (
        <ul role="list" data-pieza="trabajos-de-servicio" className="mt-12 flex flex-col">
          {frases.map((frase) => (
            <li key={frase.clave} className="flex flex-col gap-1 border-b border-borde py-4">
              <Cuerpo como="span" peso="semi">
                {frase.nombre}
              </Cuerpo>
              <Cuerpo como="span" className="text-tinta-media">
                {frase.texto}
              </Cuerpo>
            </li>
          ))}
        </ul>
      )}
      {alPortfolio === null ? null : (
        <div className="mt-8">
          <CtaEnlace href={alPortfolio} rotulo={ROTULO_DEL_PORTFOLIO} />
        </div>
      )}
    </Bloque>
  )
}
