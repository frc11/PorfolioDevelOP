'use client'

import { useCallback, useRef, useState } from 'react'

import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { DosCopias } from '../../_componentes/rollover/DosCopias'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { NOTAS, type NotaDelBlog } from '../_lab/notas'
import { useAlCruzar } from '../_lab/useAlCruzar'

/**
 * Los lugares de las seis tarjetas desde 1024: un patrón FIJO (no al azar) sobre doce columnas, con cada una corrida en alto, y el giro
 * con el que llega (se endereza al asentarse). Abajo de 1024, una columna que alterna los costados.
 */
const LUGARES = [
  { columnas: 'escritorio:col-start-1 escritorio:col-span-6', alto: 'escritorio:mt-0', giro: -2.5, tapa: true },
  { columnas: 'escritorio:col-start-8 escritorio:col-span-5', alto: 'escritorio:mt-[18svh]', giro: 2, tapa: false },
  { columnas: 'escritorio:col-start-2 escritorio:col-span-5', alto: 'escritorio:-mt-[6svh]', giro: 1.5, tapa: false },
  { columnas: 'escritorio:col-start-7 escritorio:col-span-6', alto: 'escritorio:mt-[10svh]', giro: -2, tapa: true },
  { columnas: 'escritorio:col-start-1 escritorio:col-span-5', alto: 'escritorio:mt-[4svh]', giro: 2.5, tapa: true },
  { columnas: 'escritorio:col-start-7 escritorio:col-span-5', alto: 'escritorio:mt-[14svh]', giro: -1.5, tapa: false },
] as const

/**
 * [L7e · B2] LAS NOTAS EN LUGARES IRREGULARES — «como el panel viejo del home: tarjetas en lugares irregulares, no una grilla rígida»
 * (ESTRUCTURA-PAGINAS). Cada tarjeta llega con el gatillo del home (32 px desde abajo y opacidad, 700 ms con la curva de salida, al
 * cruzar la línea; en espejo al subir) más un giro chico que se endereza al asentarse: caen en su lugar como papeles sobre la mesa. El
 * «Leer» de cada una hace el rollover de dos copias del home (`DosCopias`). Con movimiento reducido, quietas en su lugar.
 */
export function NotasIrregulares(): React.JSX.Element {
  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pt-36 pb-16 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Blog · todas las notas</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Lo que</span>
          <span className="block font-liviano tracking-titulo italic uppercase">aprendimos haciendo</span>
        </h1>
      </header>
      <ul className="mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-48 escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-8 escritorio:gap-y-16">
        {NOTAS.map((nota, i) => (
          <Tarjeta key={nota.id} nota={nota} indice={i} />
        ))}
      </ul>
    </>
  )
}

function Tarjeta({ nota, indice }: { readonly nota: NotaDelBlog; readonly indice: number }): React.JSX.Element {
  const lugar = LUGARES[indice % LUGARES.length]
  const reducido = usePrefiereMenosMovimiento()
  const caja = useRef<HTMLLIElement>(null)
  const [puesta, setPuesta] = useState(false)
  const alCambiar = useCallback((adentro: boolean) => setPuesta(adentro), [])
  useAlCruzar(caja, alCambiar, !reducido, 0.94, 1.05)
  const quieta = reducido || puesta
  const costado = indice % 2 === 0 ? 'self-start' : 'self-end'
  return (
    <li
      ref={caja}
      className={`w-[88%] escritorio:w-auto ${costado} ${lugar.columnas} ${lugar.alto} transition-[translate,rotate,opacity] duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none`}
      style={{ translate: quieta ? '0 0' : '0 2rem', rotate: quieta ? '0deg' : `${String(lugar.giro)}deg`, opacity: quieta ? 1 : 0 }}
    >
      <EnlaceDeRuta href="/v3/laboratorio/nota" className="group block rounded-fuerte border border-borde bg-superficie-1 no-underline">
        {lugar.tapa ? (
          <span aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden rounded-t-fuerte bg-tinta">
            <span className="absolute right-4 -bottom-[0.18em] font-display text-[length:min(30vw,11rem)] leading-none font-fuerte tracking-display text-fondo/15">
              {String(indice + 1).padStart(2, '0')}
            </span>
          </span>
        ) : null}
        <span className="block p-6 escritorio:p-8">
          <span className="block font-codigo text-caption text-tinta-media">Nota {String(indice + 1).padStart(2, '0')}</span>
          <span className="mt-3 block text-titulo-s leading-titulo underline-offset-4 group-hover:underline escritorio:text-titulo-m">{nota.titulo}</span>
          <span className="mt-3 block text-cuerpo leading-texto text-tinta-media">{nota.bajada}</span>
          <span className="mt-5 block text-cuerpo font-semi">
            <DosCopias>Leer la nota</DosCopias>
          </span>
        </span>
      </EnlaceDeRuta>
    </li>
  )
}
