/**
 * [SERVICIOS S2] 4 · PRECIO — el slot `planes` (IA y automatizaciones): la tabla de planes (SPEC §7.3).
 *
 * Una tabla de verdad (`<table>` con `th scope`), no una grilla de `div`: es una comparación, y quien navega por tablas la tiene
 * que encontrar. Por debajo de 1024 no entra, así que scrollea adentro de su caja (`overflow-x-auto`); una caja que scrollea
 * tiene que poder recibir el foco para que el teclado la mueva, y por eso es una región con nombre y `tabIndex=0`.
 *
 * Qué se muestra lo decide `vistaDeLosPlanes` (sin markup): acá no hay una cifra ni un «[a definir]» escrito.
 */

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { vistaDeLosPlanes, type PrecioPorPlanes } from './vistaDeLosPlanes'

const NOMBRE_DE_LA_TABLA = 'Planes' // SPEC §7.3
const ROTULO_DE_LA_PRIMERA_COLUMNA = 'Plan' // SPEC §7.3: el encabezado de la tabla
const ROTULO_DE_LA_IMPLEMENTACION = 'Implementación desde' // SPEC §7.3: «Implementación: pago único, desde USD …»

export function Planes({ precio, enDesarrollo }: { readonly precio: PrecioPorPlanes; readonly enDesarrollo: boolean }): React.JSX.Element {
  const vista = vistaDeLosPlanes(precio, enDesarrollo)
  return (
    <div className="flex flex-col gap-6">
      <div role="region" aria-label={NOMBRE_DE_LA_TABLA} tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[calc(var(--spacing-20)*8)] text-left">
          <caption className="sr-only">{NOMBRE_DE_LA_TABLA}</caption>
          <thead>
            <tr>
              <th scope="col" className="pb-4 pr-4 align-bottom">
                <span className="sr-only">{ROTULO_DE_LA_PRIMERA_COLUMNA}</span>
              </th>
              {vista.columnas.map((columna) => (
                <th key={columna} scope="col" className="pb-4 pr-4 align-bottom">
                  <Titular nivel="titulo-s" como="span">
                    {columna}
                  </Titular>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vista.filas.map((fila) => (
              <tr key={fila.clave} className="border-t border-borde">
                <th scope="row" className="py-4 pr-4 align-top">
                  <Cuerpo como="span" peso="semi">
                    {fila.rotulo}
                  </Cuerpo>
                </th>
                {fila.celdas.map((celda, indice) => (
                  <td key={vista.columnas[indice]} className="py-4 pr-4 align-top">
                    <Cuerpo como="span" className={fila.clave === 'mensual' ? 'text-acento' : 'text-tinta-media'}>
                      {celda}
                    </Cuerpo>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Cuerpo className="text-tinta-media">{vista.nota}</Cuerpo>
      {vista.implementacionDesde === null ? null : (
        <p className="flex flex-col gap-1">
          <Cuerpo como="span" className="text-tinta-media">
            {ROTULO_DE_LA_IMPLEMENTACION}
          </Cuerpo>{' '}
          <Titular nivel="titulo-s" como="span" className="text-acento">
            {vista.implementacionDesde}
          </Titular>
        </p>
      )}
    </div>
  )
}
