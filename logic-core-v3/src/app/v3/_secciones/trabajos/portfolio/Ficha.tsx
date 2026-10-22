'use client'

import { motion } from 'motion/react'

import { Caption, Cuerpo, Micro } from '../../../_componentes/tipografia/Textos'

import { idDelServicioLlamado } from '../../_contrato/acento'
import { CONTENIDO } from '../contenido'
import { PROYECTOS, seMuestraElServicio, type ProyectoDelPortfolio } from '../proyectos'

import { enLaSecuencia } from './secuencia'

/**
 * [B1.2c] LOS RÓTULOS DE LA FICHA («Fecha», «El problema», «Qué hicimos», «Lo que resolvimos», «Lo que dice el cliente»): en B1.2b se
 * confundían con el fondo (`micro` en la tinta al 60 %). Van en Chivo Mono (`font-codigo`), en mayúsculas, con el interletrado
 * positivo (`micro`, el único del sistema), un paso más grandes (`caption`) y en el acento claro (P-H2: `text-acento-claro`, el de su
 * servicio por `data-servicio`; los tres son de web). AA medido con la marca de agua detrás (el banco).
 */
export const CLASE_DEL_ROTULO = 'font-codigo uppercase text-acento-claro'

function Rotulo({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <Caption como="span" interletrado="micro" className={CLASE_DEL_ROTULO}>
      {children}
    </Caption>
  )
}

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
 *
 * [B1.2e] `compacta`: la de la tarjeta del carrusel. En el teléfono los valores y la reseña van en `caption` (la ficha entera entra en la
 * tarjeta sin que la tarjeta ocupe la pantalla); desde 768, como siempre. Sin la prop, el marcado de siempre.
 */
export const CLASE_DEL_VALOR_COMPACTO = 'max-tablet:text-caption'

export function Ficha({ proyecto, visible, reducido, desde, compacta = false }: { readonly proyecto: ProyectoDelPortfolio; readonly visible: boolean; readonly reducido: boolean; readonly desde: number; readonly compacta?: boolean }): React.JSX.Element {
  const r = CONTENIDO.ficha
  const filas = filasDe(proyecto)
  const valor = compacta ? CLASE_DEL_VALOR_COMPACTO : undefined
  // El orden de cada fila en la secuencia: las que se muestran, de a una; la reseña, después de todas.
  const ordenes = filas.map((_, i) => desde + filas.slice(0, i).filter((g) => !g.oculta).length)
  const ordenDeLaResena = desde + filas.filter((f) => !f.oculta).length
  return (
    <div data-pieza="ficha" data-servicio={idDelServicioLlamado(proyecto.servicio) ?? undefined} className="flex flex-col gap-5 max-escritorio:gap-3">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 max-escritorio:gap-y-3 max-tablet:gap-x-5">
        {filas.map((f, i) => (
          <motion.div key={f.campo} data-fila={f.campo} hidden={f.oculta} className="flex flex-col gap-1" {...enLaSecuencia(visible, ordenes[i], reducido)}>
            <dt>
              <Rotulo>{f.rotulo}</Rotulo>
            </dt>
            <dd>
              <Cuerpo como="span" className={valor}>{f.valor ?? ''}</Cuerpo>
            </dd>
          </motion.div>
        ))}
      </dl>
      {proyecto.resena === null ? null : (
        <motion.figure className="flex flex-col gap-2" {...enLaSecuencia(visible, ordenDeLaResena, reducido)}>
          <Rotulo>{r.resena}</Rotulo>
          <blockquote>
            <Cuerpo className={valor}>{proyecto.resena.texto}</Cuerpo>
          </blockquote>
          <figcaption>
            <Micro como="span">{proyecto.resena.autor}</Micro>
          </figcaption>
        </motion.figure>
      )}
    </div>
  )
}
