'use client'

import { Cuerpo, Micro } from '../../../_componentes/tipografia/Textos'

import { CONTENIDO } from '../contenido'
import { PROYECTOS, seMuestraElServicio, type ProyectoDelPortfolio } from '../proyectos'

/**
 * Una fila de la ficha: el rótulo y el dato. Lo que no se muestra (un dato `null`, como el resultado: no hay nada medible; o el
 * servicio mientras los tres digan lo mismo) va igual al marcado, oculto (`hidden`): el contenido entero llega al marcado y nadie
 * lo ve ni lo escucha.
 */
function Fila({ campo, rotulo, valor, oculta = false }: { readonly campo: string; readonly rotulo: string; readonly valor: string | null; readonly oculta?: boolean }): React.JSX.Element {
  return (
    <div data-fila={campo} hidden={oculta || valor === null} className="flex flex-col gap-1">
      <dt>
        <Micro como="span" className="text-tinta/60">{rotulo}</Micro>
      </dt>
      <dd>
        <Cuerpo como="span">{valor ?? ''}</Cuerpo>
      </dd>
    </div>
  )
}

/**
 * [B1] LA FICHA DE UN PROYECTO — lo que dictó Valentino, con sus palabras (plan §11.1). El servicio sólo si los proyectos no
 * dicen todos lo mismo; el resultado sólo si existe (hoy, ninguno). Lo que falta llega por la llave del contenido inventado
 * (`_contrato/inventado.ts`): con la llave apagada, su marcador visible (`[TEXTO]`, `[TESTIMONIO] · pendiente`, `[NOMBRE]`).
 */
export function Ficha({ proyecto, visible }: { readonly proyecto: ProyectoDelPortfolio; readonly visible: boolean }): React.JSX.Element {
  const r = CONTENIDO.ficha
  return (
    <div data-pieza="ficha" hidden={!visible} className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        <Fila campo="fecha" rotulo={r.fecha} valor={proyecto.fecha} />
        <Fila campo="servicio" rotulo={r.servicio} valor={proyecto.servicio} oculta={!seMuestraElServicio(PROYECTOS)} />
        <Fila campo="que-hicimos" rotulo={r.queHicimos} valor={proyecto.queHicimos} />
        <Fila campo="problema" rotulo={r.problema} valor={proyecto.problemaCliente} />
        <Fila campo="resuelto" rotulo={r.resuelto} valor={proyecto.problemaResuelto} />
        <Fila campo="resultado" rotulo={r.resultado} valor={proyecto.resultado} />
      </dl>
      {proyecto.resena === null ? null : (
        <figure className="flex flex-col gap-2">
          <Micro como="span" className="text-tinta/60">{r.resena}</Micro>
          <blockquote>
            <Cuerpo>{proyecto.resena.texto}</Cuerpo>
          </blockquote>
          <figcaption>
            <Micro como="span">{proyecto.resena.autor}</Micro>
          </figcaption>
        </figure>
      )}
    </div>
  )
}
