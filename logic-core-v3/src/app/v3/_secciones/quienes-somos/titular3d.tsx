'use client'

import { motionValue, useTransform } from 'motion/react'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { TEXTO_REEMPLAZADO, useTextoDeVolumen } from '../../_componentes/titulos3d/useTextoDeVolumen'
import type { FuenteDelTitulo, TrazoDelTitulo } from '../../_lib/titulos3d/registro'
import type { Progreso } from '../_contrato/coreografia'
import { CanalDePieza, SignoDistinto, Trazo, type TipoDeTrazo } from '../_contrato/canales'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'

import { TRAMOS_DEL_TITULAR } from './contenido'
import { GEOMETRIA } from './geometria'
import { avanceDelTrazo, avancesDelSigno, rayaDelTrazo, trazosDelSigno } from './trazos3d'

/**
 * [RETOQUE PANEL] T4 · EL TITULAR DE QUIÉNES SOMOS EN VOLUMEN — «Queremos hacer algo distinto, no lo mismo de siempre»,
 * desde 1024, con el material y el filo de los demás títulos. Cada renglón son dos títulos de la escena (una fuente por
 * título): lo de siempre en la Chivo 400 y lo marcado con su peso del DOM (`pesosDelTitular`: el subrayado en la 700, el
 * tachado en la 300), que lleva su raya extruida; y el ≠, un título sin letras con sus cuatro trazos. Las rayas crecen con
 * la misma cuenta que las del DOM (`trazos3d.ts`); las letras se levantan con la llegada del titular, como «El equipo».
 * El DOM no cambia lo que lee el lector ni lo que se ve abajo de 1024: el texto de siempre, apagado (no escondido) cuando
 * la escena armó el suyo.
 */

/** El progreso quieto (sin coreografía: abajo de 1024 o con movimiento reducido): las rayas, ya dibujadas, como las del DOM. */
const DIBUJADO = motionValue(1)

/** La fuente de lo marcado, la del peso con que el DOM lo pinta. */
const FUENTE_DE_LO_MARCADO: Readonly<Record<TipoDeTrazo, FuenteDelTitulo>> = { subrayado: 'chivo-700', tachado: 'chivo-300' }

type Renglon = (typeof TRAMOS_DEL_TITULAR)[number]

/** Un renglón del reparto de dos (desde la banda de tablet): lo de siempre y lo marcado, cada uno con su título de volumen. */
// [PULIDO 11] A2 · los dos títulos del renglón esquivan el logo mientras la sección entra (lo cruzaban al subir).
export function RenglonDeVolumen({ renglon, indice, entrada, trazo }: { readonly renglon: Renglon; readonly indice: number; readonly entrada: Progreso; readonly trazo: Progreso }): React.JSX.Element {
  const avance = useTransform(trazo ?? DIBUJADO, (p) => avanceDelTrazo(renglon.tipo, p))
  // [PASADA FINAL] D2 · el tachado despinta lo tachado con su avance, como el DOM (de la tinta a la tinta media).
  const trazos = useMemo<readonly TrazoDelTitulo[]>(() => [{ medir: rayaDelTrazo, nace: 'punta', avance, despinta: renglon.tipo === 'tachado' }], [avance, renglon.tipo])
  const { lugar: lugarDeAntes, listo: antesListo } = useTextoDeVolumen<HTMLSpanElement>({ id: `agencia-${String(indice + 1)}-antes`, texto: renglon.antes, fuente: 'chivo-400', gesto: 'levanta', llegada: entrada, queda: false, esquivaElLogo: true })
  const { lugar: lugarDeLoMarcado, listo: marcadoListo } = useTextoDeVolumen<HTMLSpanElement>({ id: `agencia-${String(indice + 1)}-marcado`, texto: `${renglon.marcado}${renglon.cierre}`, fuente: FUENTE_DE_LO_MARCADO[renglon.tipo], gesto: 'levanta', llegada: entrada, queda: false, trazos, esquivaElLogo: true })
  return (
    <CanalDePieza progreso={entrada} patron="P1" cantidad={TRAMOS_DEL_TITULAR.length} indice={indice} como="span" className="block">
      <span ref={lugarDeAntes} className={cn(antesListo && TEXTO_REEMPLAZADO)}>
        {renglon.antes}
      </span>{' '}
      <span ref={lugarDeLoMarcado} className={cn(marcadoListo && TEXTO_REEMPLAZADO)}>
        <Trazo progreso={trazo} tipo={renglon.tipo} className={GEOMETRIA.pesosDelTitular[renglon.tipo]}>
          {renglon.marcado}
        </Trazo>
        {renglon.cierre}
      </span>
    </CanalDePieza>
  )
}

/** El ≠ en volumen: un título sin letras con sus cuatro trazos (las dos barras con el subrayado, la diagonal con el tachado). */
// [PULIDO 2] 2f · con la llegada del titular (`entrada`): en un viaje se desarma como los demás y llega con ellos.
export function SignoDeVolumen({ progreso, entrada }: { readonly progreso: Progreso; readonly entrada: Progreso }): React.JSX.Element {
  const avances = useTransform(progreso ?? DIBUJADO, (p) => avancesDelSigno(p))
  const arriba = useTransform(avances, (a) => a[0])
  const abajo = useTransform(avances, (a) => a[1])
  const diagonal = useTransform(avances, (a) => a[2])
  const trazos = useMemo<readonly TrazoDelTitulo[]>(
    () => [
      { medir: (l) => trazosDelSigno(l)[0], nace: 'medio', avance: arriba },
      { medir: (l) => trazosDelSigno(l)[1], nace: 'medio', avance: abajo },
      { medir: (l) => trazosDelSigno(l)[2], nace: 'punta', avance: diagonal },
      { medir: (l) => trazosDelSigno(l)[3], nace: 'punta', avance: diagonal },
    ],
    [arriba, abajo, diagonal],
  )
  const { lugar, listo } = useTextoDeVolumen<HTMLDivElement>({ id: 'agencia-signo', texto: '', fuente: 'chivo-400', gesto: 'letras', llegada: entrada, queda: false, trazos })
  return (
    <div ref={lugar} className={cn(listo && TEXTO_REEMPLAZADO)}>
      <SignoDistinto progreso={progreso} className={MEZCLA_SOBRE_LA_ESCENA} />
    </div>
  )
}
