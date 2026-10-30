/**
 * [SERVICIOS S2/S2c] 4 · PRECIO — el slot `planes` (IA y automatizaciones): los planes (SPEC §7.3), en dos versiones del mismo dato.
 *
 * Las dos están en el marcado y las alterna el CSS, sin JavaScript, en el corte de 768 (el `md` de Tailwind, el mismo ancho que el token `tablet`):
 *
 *   · desde 768, la tabla: un `<table>` con `th scope`, no una grilla de `div`: es una comparación, y quien navega por tablas la tiene
 *     que encontrar. Si no entra, scrollea adentro de su caja (`overflow-x-auto`); una caja que scrollea tiene que poder recibir el
 *     foco para que el teclado la mueva, y por eso es una región con nombre y `tabIndex=0`. Su caja mide el ancho de la ventana menos
 *     114 y la tabla pide 640, así que entra entera desde 754: el corte de 768 la deja siempre entera;
 *   · por debajo, una tarjeta por plan con cada dato junto a su rótulo (`dl`): cuatro columnas no entran en un teléfono. El «Por mes»
 *     va en el nivel `titulo-m` del Titular, el mismo del precio de los calibres de Páginas web; el resto de los valores, en Cuerpo.
 *
 * La que no se ve en un ancho queda en `display: none`, así que tampoco existe para el lector de pantalla ni para el teclado: el
 * texto no se lee dos veces.
 *
 * Qué se muestra lo decide `vistaDeLosPlanes` (sin markup, y las tarjetas salen de las mismas filas que la tabla): acá no hay una
 * cifra ni un «[a definir]» escrito.
 */

import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { vistaDeLosPlanes, type PrecioPorPlanes, type VistaDeLosPlanes } from './vistaDeLosPlanes'

const NOMBRE_DE_LOS_PLANES = 'Planes' // SPEC §7.3: la tabla y la lista de tarjetas se llaman igual
const ROTULO_DE_LA_PRIMERA_COLUMNA = 'Plan' // SPEC §7.3: el encabezado de la tabla
const ROTULO_DE_LA_IMPLEMENTACION = 'Implementación desde' // SPEC §7.3: «Implementación: pago único, desde USD …»

export function Planes({ precio, enDesarrollo }: { readonly precio: PrecioPorPlanes; readonly enDesarrollo: boolean }): React.JSX.Element {
  const vista = vistaDeLosPlanes(precio, enDesarrollo)
  return (
    <div className="flex flex-col gap-6">
      <TablaDeLosPlanes vista={vista} />
      <TarjetasDeLosPlanes vista={vista} />
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

/** Desde 768. Por debajo queda en `display: none`: sin ser visible, tampoco es una región que reciba el foco. */
function TablaDeLosPlanes({ vista }: { readonly vista: VistaDeLosPlanes }): React.JSX.Element {
  return (
    <div role="region" aria-label={NOMBRE_DE_LOS_PLANES} tabIndex={0} className="overflow-x-auto max-md:hidden" data-planes="tabla">
      <table className="w-full min-w-[calc(var(--spacing-20)*8)] text-left">
        <caption className="sr-only">{NOMBRE_DE_LOS_PLANES}</caption>
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
  )
}

/** Por debajo de 768, con el mismo lenguaje que los calibres de Páginas web: una regla arriba, sin fondo propio (el papel es de la sección) y el precio en el `titulo-m`. */
function TarjetasDeLosPlanes({ vista }: { readonly vista: VistaDeLosPlanes }): React.JSX.Element {
  return (
    <ul role="list" aria-label={NOMBRE_DE_LOS_PLANES} className="flex flex-col gap-12 md:hidden" data-planes="tarjetas">
      {vista.tarjetas.map((tarjeta) => (
        <li key={tarjeta.nombre} className="flex flex-col gap-4 border-t border-borde-fuerte pt-6">
          <Titular nivel="titulo-s" como="h3">
            {tarjeta.nombre}
          </Titular>
          <dl className="flex flex-col">
            {tarjeta.datos.map((dato) => (
              <div key={dato.clave} className="flex flex-col gap-1 border-t border-borde py-3">
                <Caption como="dt" className="text-tinta-media">
                  {dato.rotulo}
                </Caption>
                {dato.clave === 'mensual' ? (
                  <dd>
                    <Titular nivel="titulo-m" como="span" className="text-acento">
                      {dato.valor}
                    </Titular>
                  </dd>
                ) : (
                  <Cuerpo como="dd">{dato.valor}</Cuerpo>
                )}
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  )
}
