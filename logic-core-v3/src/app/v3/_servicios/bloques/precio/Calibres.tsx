/**
 * [SERVICIOS S1b] 4 · PRECIO — el slot `calibres` (Páginas web). Cada calibre con su «desde», en USD, sacado de los datos.
 *
 * Nada de números escritos acá: el precio sale de `calibre.desde` por `usd()`. «Autogestionable» tiene tres estados:
 * `true` lo dice, `false` calla, y `null` es [a definir] (SPEC §11): el marcador solo en desarrollo.
 */

import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { textoOMarcador, usd } from '../../formato'
import type { Calibre } from '../../tipos'
import { ROTULO_DEL_PRECIO } from './rotulos'

const ROTULO_AUTOGESTIONABLE = 'Autogestionable' // SPEC §7.1

interface CalibresProps {
  readonly calibres: readonly Calibre[]
  readonly enDesarrollo: boolean
}

export function Calibres({ calibres, enDesarrollo }: CalibresProps): React.JSX.Element {
  return (
    <ul role="list" className="grid grid-cols-1 gap-12 escritorio:grid-cols-3 escritorio:gap-x-8">
      {calibres.map((calibre) => (
        <li key={calibre.nombre} className="flex flex-col gap-4 border-t border-borde-fuerte pt-6">
          <Titular nivel="titulo-s" como="h3">
            {calibre.nombre}
          </Titular>
          <p className="flex flex-col gap-1">
            <Caption como="span" className="text-tinta-media">
              {ROTULO_DEL_PRECIO}
            </Caption>{' '}
            <Titular nivel="titulo-m" como="span" className="text-acento">
              {usd(calibre.desde)}
            </Titular>
          </p>
          <Cuerpo className="text-tinta-media">{calibre.descripcion}</Cuerpo>
          <Autogestion autogestionable={calibre.autogestionable} enDesarrollo={enDesarrollo} />
          {calibre.incluye.length > 0 ? (
            <ul role="list" className="flex flex-col">
              {calibre.incluye.map((item) => (
                <Cuerpo key={item} como="li" className="border-b border-borde py-3">
                  {item}
                </Cuerpo>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function Autogestion({
  autogestionable,
  enDesarrollo,
}: {
  readonly autogestionable: boolean | null
  readonly enDesarrollo: boolean
}): React.JSX.Element | null {
  if (autogestionable === false) return null
  const pendiente = autogestionable === null ? textoOMarcador(null, enDesarrollo) : null
  if (autogestionable === null && pendiente === null) return null
  return (
    <Caption className="text-tinta-media uppercase">
      {pendiente === null ? ROTULO_AUTOGESTIONABLE : `${ROTULO_AUTOGESTIONABLE}: ${pendiente}`}
    </Caption>
  )
}
