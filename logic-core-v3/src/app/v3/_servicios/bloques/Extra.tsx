/**
 * [SERVICIOS S1b] 5 · EXTRA DEL SERVICIO — el slot opcional (en Páginas web, el mantenimiento). SPEC §5.
 *
 * Una fila por ítem, con el precio tal como lo publica el SPEC («Desde USD 50», «Siempre incluidos»). Una fila sin precio es
 * [a definir]: el marcador en desarrollo y, en producción, la fila no se monta (plan §8.4).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { textoOMarcador } from '../formato'
import type { Extra as DatosDeExtra } from '../tipos'
import { Bloque } from './Bloque'

interface ExtraProps {
  readonly extra: DatosDeExtra | null
  readonly enDesarrollo: boolean
}

export function Extra({ extra, enDesarrollo }: ExtraProps): React.JSX.Element | null {
  if (extra === null) return null
  const filas = extra.items.flatMap((item) => {
    const precio = textoOMarcador(item.precio, enDesarrollo)
    return precio === null ? [] : [{ nombre: item.nombre, detalle: item.detalle, precio }]
  })
  if (filas.length === 0) return null
  return (
    <Bloque nombre="extra" titulo={extra.titulo}>
      <dl className="flex flex-col">
        {filas.map((fila) => (
          <div
            key={fila.nombre}
            className="flex flex-col gap-1 border-b border-borde py-4 escritorio:flex-row escritorio:items-baseline escritorio:gap-6"
          >
            <dt className="escritorio:w-1/4">
              <Cuerpo como="span" peso="semi">
                {fila.nombre}
              </Cuerpo>
            </dt>
            <dd className="escritorio:flex-1">
              <Cuerpo como="span" className="text-tinta-media">
                {fila.detalle}
              </Cuerpo>
            </dd>
            <dd>
              <Cuerpo como="span" className="text-acento">
                {fila.precio}
              </Cuerpo>
            </dd>
          </div>
        ))}
      </dl>
      {extra.nota === null ? null : <Cuerpo className="mt-6 text-tinta-media">{extra.nota}</Cuerpo>}
    </Bloque>
  )
}
