'use client'

import { motion } from 'motion/react'

import { Cuerpo, Micro } from '../../../_componentes/tipografia/Textos'

import { CONTENIDO } from '../contenido'
import { PROYECTOS, seMuestraElServicio, type ProyectoDelPortfolio } from '../proyectos'

import { enLaSecuencia } from './secuencia'

/** Las filas de la ficha, en orden, y si cada una se muestra (un dato `null`, o el servicio mientras los tres digan lo mismo, no). */
function filasDe(p: ProyectoDelPortfolio): readonly { readonly campo: string; readonly rotulo: string; readonly valor: string | null; readonly oculta: boolean }[] {
  const r = CONTENIDO.ficha
  return [
    { campo: 'fecha', rotulo: r.fecha, valor: p.fecha, oculta: p.fecha === null },
    { campo: 'servicio', rotulo: r.servicio, valor: p.servicio, oculta: p.servicio === null || !seMuestraElServicio(PROYECTOS) },
    { campo: 'que-hicimos', rotulo: r.queHicimos, valor: p.queHicimos, oculta: p.queHicimos === null },
    { campo: 'problema', rotulo: r.problema, valor: p.problemaCliente, oculta: p.problemaCliente === null },
    { campo: 'resuelto', rotulo: r.resuelto, valor: p.problemaResuelto, oculta: p.problemaResuelto === null },
    { campo: 'resultado', rotulo: r.resultado, valor: p.resultado, oculta: p.resultado === null },
  ]
}

/** [B1.2b] Cuántas piezas de la ficha entran en la secuencia (las filas que se muestran y la reseña): la que sigue va después. */
export function piezasDeLaFicha(p: ProyectoDelPortfolio): number {
  return filasDe(p).filter((f) => !f.oculta).length + (p.resena === null ? 0 : 1)
}

/**
 * [B1] LA FICHA DE UN PROYECTO — lo que dictó Valentino, con sus palabras (plan §11.1). El servicio sólo si los proyectos no
 * dicen todos lo mismo; el resultado sólo si existe (hoy, ninguno): lo que no se muestra va igual al marcado, oculto (`hidden`),
 * así el contenido entero llega al marcado y nadie lo ve ni lo escucha. Lo que falta llega por la llave del contenido inventado
 * (`_contrato/inventado.ts`): con la llave apagada, su marcador visible (`[TEXTO]`, `[TESTIMONIO] · pendiente`, `[NOMBRE]`).
 *
 * [B1.2b] Siempre a la vista en la tira activa (no hay portada ni ficha): cada pieza entra escalonada en la secuencia de la tira,
 * desde la pieza `desde` (`secuencia.ts`).
 */
export function Ficha({ proyecto, visible, reducido, desde }: { readonly proyecto: ProyectoDelPortfolio; readonly visible: boolean; readonly reducido: boolean; readonly desde: number }): React.JSX.Element {
  const r = CONTENIDO.ficha
  const filas = filasDe(proyecto)
  // El orden de cada fila en la secuencia: las que se muestran, de a una; la reseña, después de todas.
  const ordenes = filas.map((_, i) => desde + filas.slice(0, i).filter((g) => !g.oculta).length)
  const ordenDeLaResena = desde + filas.filter((f) => !f.oculta).length
  return (
    <div data-pieza="ficha" className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        {filas.map((f, i) => (
          <motion.div key={f.campo} data-fila={f.campo} hidden={f.oculta} className="flex flex-col gap-1" {...enLaSecuencia(visible, ordenes[i], reducido)}>
            <dt>
              <Micro como="span" className="text-tinta/60">{f.rotulo}</Micro>
            </dt>
            <dd>
              <Cuerpo como="span">{f.valor ?? ''}</Cuerpo>
            </dd>
          </motion.div>
        ))}
      </dl>
      {proyecto.resena === null ? null : (
        <motion.figure className="flex flex-col gap-2" {...enLaSecuencia(visible, ordenDeLaResena, reducido)}>
          <Micro como="span" className="text-tinta/60">{r.resena}</Micro>
          <blockquote>
            <Cuerpo>{proyecto.resena.texto}</Cuerpo>
          </blockquote>
          <figcaption>
            <Micro como="span">{proyecto.resena.autor}</Micro>
          </figcaption>
        </motion.figure>
      )}
    </div>
  )
}
