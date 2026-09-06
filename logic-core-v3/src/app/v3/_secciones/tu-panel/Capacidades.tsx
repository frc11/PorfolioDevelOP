'use client'

import { useTransform, type MotionValue } from 'motion/react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { type Progreso } from '../_contrato/coreografia'
import { CanalDePieza } from '../_contrato/canales'
import { asentar } from './asentamiento'
import { CAPACIDADES } from './contenido'

/**
 * LA LISTA DE CAPACIDADES — P4, ítem por ítem, muy frenada.
 *
 * ── Por qué esto es un `<ul>` y no once `div` ─────────────────────────────
 *
 * `CanalDePiezas` emite `div` o `span` y su contenedor también es un `div`. Once
 * `div` con una frase adentro no son una lista para nadie que navegue por
 * listas: el lector de pantalla no anuncia "lista de once elementos" ni permite
 * saltar de ítem en ítem. Por eso el marcado lo pone este componente —`<ul>` con
 * sus `<li>`— y la pieza animada va ADENTRO de cada `<li>`, que es exactamente
 * el caso para el que el contrato expone `CanalDePieza`.
 *
 * ── El escalonado sale de cuántos ítems hay, no de un número escrito ──────
 *
 * `cantidad` es `CAPACIDADES.length`. P4 declara 2 s de duración y 0,2 s de
 * escalonado, así que la duración APLICADA es `2 + 0,2·(N−1)`: con once ítems son
 * 4 s de recorrido. Si mañana la lista tiene nueve, el cronograma se acorta solo.
 *
 * ── La regla horizontal no se mueve, el texto sí ──────────────────────────
 *
 * El `border-t` vive en el `<li>` y la pieza animada es su hijo: la retícula
 * queda quieta y lo que sube es el texto. Al revés —el borde adentro de la
 * pieza— la lista entera se vería temblar mientras entra.
 *
 * ── B1 · LA RESTA: por qué a escritorio la lista pierde una columna ────────
 *
 * En dos columnas los once ítems caen en **seis filas**, y seis filas no llenan
 * una pantalla de 1080: la captura del tiempo 2 medía 227,12 px de cola vacía
 * abajo y, con `content-between`, seis filas repartidas dejarían un paso de
 * 137,7 px — o sea **una banda vacía de 115 px entre fila y fila**, arriba del
 * techo de 104 px que B1 fija.
 *
 * Con `escritorio:grid-cols-1` son **once filas**: el mismo contenido, diez
 * costuras en vez de cinco, y el paso baja a ~79 px con bandas de ~62. Es
 * además la forma que el ancho da: a 1856 px una capacidad entra en un renglón,
 * y once reglas a sangre se leen como el índice que la lista es.
 *
 * ⚠ El cambio es SÓLO de escritorio para arriba. Abajo de 768 la lista ya era
 * de una columna y entre 768 y 1024 sigue siendo de dos: ahí la pantalla es
 * angosta, la frase ocupa dos o tres renglones y once filas se irían de una
 * pantalla. La sección mide dos pantallas en los dos lados del umbral.
 */

export interface CapacidadesProps {
  /** El progreso del bloque de P4, o `null` cuando no hay coreografía. */
  readonly progreso: Progreso
}

/**
 * ── B2 · LOS MOMENTOS: la lista ATERRIZA y se queda quieta ─────────────────
 *
 * El progreso del bloque pasa por `asentar` antes de llegar a los once ítems.
 * De dónde sale la fracción —de las propias anclas, no de un gusto— y qué se
 * midió para necesitarla está en `asentamiento.ts`. En una línea: el ancla de
 * P4 termina en `bottom top`, así que **la lista seguía armándose mientras se
 * iba por arriba del cuadro** y el censo de acontecimientos la leía como un
 * único grupo de 960 px con once aterrizajes seguidos, uno cada 97,9 px.
 *
 * El remapeo se aplica ACÁ y en un solo lugar, que es la condición de que los
 * once sigan leyendo el mismo número: remapear ítem por ítem daría once relojes
 * que se ven parecidos y no lo son.
 */
export function Capacidades({ progreso }: CapacidadesProps): React.JSX.Element {
  if (progreso === null) return <ListaDeCapacidades progreso={null} />
  return <CapacidadesAsentadas progreso={progreso} />
}

/**
 * La rama con coreografía. Existe como componente aparte —y no como una rama
 * adentro de `Capacidades`— porque `useTransform` es un hook: llamarlo detrás
 * de un `if` sería llamarlo condicionalmente. Es la misma forma que
 * `ServiciosEnSecuencia` ya usa para su propio asentamiento.
 */
function CapacidadesAsentadas({
  progreso,
}: {
  readonly progreso: MotionValue<number>
}): React.JSX.Element {
  const asentado = useTransform(progreso, asentar)
  return <ListaDeCapacidades progreso={asentado} />
}

function ListaDeCapacidades({ progreso }: CapacidadesProps): React.JSX.Element {
  return (
    <ul className="grid flex-1 grid-cols-1 content-between gap-x-[var(--grilla-canal-amplio)] gap-y-[var(--spacing-6)] tablet:grid-cols-2 escritorio:grid-cols-1">
      {CAPACIDADES.map((capacidad, indice) => (
        <li key={capacidad} className="border-borde border-t pt-[var(--spacing-3)]">
          <CanalDePieza
            progreso={progreso}
            patron="P4"
            cantidad={CAPACIDADES.length}
            indice={indice}
          >
            <Cuerpo>{capacidad}</Cuerpo>
          </CanalDePieza>
        </li>
      ))}
    </ul>
  )
}
