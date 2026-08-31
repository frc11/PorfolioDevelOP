'use client'

import { cn } from '@/lib/utils'

import type { MotionValue } from 'motion/react'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Caption, Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { CLASES_DE_ACENTO, type Servicio } from '../_contrato/acento'
import { CanalDePieza, CanalDePiezas, CanalDeUnaPieza } from '../_contrato/canales'
import { seccionDe } from '../_contrato/forma'
import { MarcoDeMedio } from '../_contrato/medios'
import { ContenidoDeSeccion, EncabezadoDeSeccion } from '../_contrato/Seccion'
import {
  ALTO_DEL_MEDIO,
  ANCHO_DEL_MEDIO,
  CONTENIDO,
  ITEMS_POR_SERVICIO,
  SIZES_DEL_MEDIO,
  palabrasDelParrafo,
} from './contenido'
import { clasesDeNivel } from './geometria'

/**
 * EL CONTENIDO DE UN SERVICIO — escrito UNA vez, para las dos ramas.
 *
 * ── Por qué hay un solo componente y no dos ───────────────────────────────
 *
 * Porque el modo de falla que importa no es unos KiB de más: es que la persona
 * que entra desde un teléfono lea un contenido distinto del de escritorio. Con
 * dos árboles escritos a mano eso pasa sin que nadie lo note. Acá el contenido
 * está una vez y lo único que cambia es si se le cuelga un `MotionValue`: los
 * canales del contrato ya traen su rama quieta adentro, así que `progreso ===
 * null` no es una rama de este archivo, es una propiedad de lo que consume.
 *
 * El instrumento afirma la consecuencia sobre el marcado real: el texto de la
 * rama apilada es EXACTAMENTE la concatenación de los tres tramos de la rama
 * pinneada.
 *
 * ── El progreso que entra acá es el LOCAL, no el de la sección ────────────
 *
 * La sección tiene UN progreso. `tramoDeSecuencia` lo parte en tres tercios y
 * este componente recibe el progreso DENTRO del tercio activo. Por eso los tres
 * canales continuos —párrafo, lista y filas— se reinician juntos en cada
 * límite: no es que estén coordinados, es que leen el mismo número.
 *
 * ── Los tres canales, y qué patrón les toca ───────────────────────────────
 *
 *   filas    P2 · `yPercent` 60 → 0 · un target por fila, el escalonado inerte
 *   párrafo  P3 · `opacity` 0,3 → 1 · palabra por palabra, sin mover nada
 *   lista    P4 · `y` 100 → 0 px reales y `opacity` 0 → 1, en `power4.out`
 *
 * ── El acento entra por el ANCESTRO, y acá solo se consume el alias ───────
 *
 * Ningún elemento de este archivo nombra un servicio en un color. Las tres
 * apariciones del acento usan `CLASES_DE_ACENTO`, que resuelven
 * `--color-acento`; quién es ese acento lo decide el `[data-servicio]` que
 * pone la rama de arriba. Escribir el valor concreto funcionaría en la pantalla
 * y rompería el mecanismo: ese elemento dejaría de retiñirse con el contexto.
 */

export interface ContenidoDeServicioProps {
  readonly servicio: Servicio
  /** El progreso LOCAL del tramo, o `null` cuando no hay coreografía. */
  readonly progreso: MotionValue<number> | null
}

/** El nombre visible de la sección sale de la tabla del sitio, no de acá. */
const NOMBRE_DE_SECCION = seccionDe('servicios').nombre

/**
 * El separador de acento debajo del nombre.
 *
 * Va como RELLENO —`bg-acento`— y no como borde ni como texto: es la única
 * forma del acento que funciona en las dos superficies, y sobre la invertida un
 * borde de acento no llega ni a 3:1. `aria-hidden` porque es una regla
 * decorativa: no dice nada que el nombre de arriba no diga.
 */
function ReglaDeAcento(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={`${CLASES_DE_ACENTO.relleno} block h-[var(--foco-grosor)] w-full`}
    />
  )
}

export function ContenidoDeServicio({
  servicio,
  progreso,
}: ContenidoDeServicioProps): React.JSX.Element {
  const contenido = CONTENIDO[servicio.id]
  const palabras = palabrasDelParrafo(servicio.id)

  return (
    <ContenidoDeSeccion claseDeContenido="flex w-full flex-col gap-[var(--spacing-8)] py-[var(--spacing-12)]">
      {/* ── FILA 1 · el rótulo ── P2, un target ── */}
      <CanalDeUnaPieza progreso={progreso} patron="P2">
        <div data-fila="rotulo" className="flex flex-col gap-[var(--spacing-3)]">
          <EncabezadoDeSeccion seccion={seccionDe('servicios')} nombre={NOMBRE_DE_SECCION} />
          {/* El color va DIRECTO en el componente de texto. Los dos lanes lo
              habían tenido que poner en un envoltorio para que `cn()` no se
              comiera la clase de tamaño; SITIO-S7 arregló la raíz en
              `src/lib/utils.ts` y el rodeo se saca. Un arreglo de raíz que deja
              los parches es código muerto que esconde el arreglo. */}
          <Caption como="p" className={cn(CLASES_DE_ACENTO.texto, 'uppercase')}>
            {contenido.rubro}
          </Caption>
          <Titular nivel="titulo-xl" como="h2">
            {servicio.nombre}
          </Titular>
          <ReglaDeAcento />
        </div>
      </CanalDeUnaPieza>

      <Grilla columnas={2} className="items-start">
        <div className="flex flex-col gap-[var(--spacing-6)]">
          {/* ── CANAL P3 · el párrafo que se enciende, palabra por palabra ──
              El espacio va DENTRO de la pieza, adelante de la palabra. Sin eso,
              dos piezas vecinas se anuncian pegadas —el defecto que este repo ya
              tiene registrado como "PomeloExplore"— y el instrumento lo caza
              reconstruyendo el texto sin insertar separadores. */}
          <div data-canal="parrafo">
            <CanalDePiezas
              progreso={progreso}
              patron="P3"
              cantidad={palabras.length}
              como="span"
              contenedor={clasesDeNivel('cuerpo')}
              render={(i) => (i === 0 ? palabras[i] : ` ${palabras[i]}`)}
            />
          </div>

          {/* ── CANAL P4 · la lista, ítem por ítem, muy frenada ──
              Es `<ul><li>` y no once `div`: quien navega por listas la tiene que
              encontrar. La pieza va ADENTRO del `li` —`CanalDePieza`, no
              `CanalDePiezas`— porque el marcado lo pone el consumidor. */}
          <ul data-canal="lista" className="flex flex-col gap-[var(--spacing-2)]">
            {contenido.items.map((item, i) => (
              <li key={item} className={clasesDeNivel('cuerpo')}>
                <CanalDePieza
                  progreso={progreso}
                  patron="P4"
                  cantidad={ITEMS_POR_SERVICIO}
                  indice={i}
                  className="flex items-baseline gap-[var(--spacing-2)]"
                >
                  <span
                    aria-hidden="true"
                    className={`${CLASES_DE_ACENTO.relleno} block h-[var(--spacing-1)] w-[var(--spacing-1)] shrink-0`}
                  />
                  <span>{item}</span>
                </CanalDePieza>
              </li>
            ))}
          </ul>
        </div>

        {/* ── FILA 2 · el medio ── P2, un target ──
            Es un HUECO y no un `<video>`: el archivo no existe todavía. Un
            `<video>` sin fuente compila perfecto y en el navegador es un
            rectángulo negro. El hueco reserva la relación de aspecto y el
            `sizes` real, que es lo único que se puede reservar de verdad. */}
        <CanalDeUnaPieza progreso={progreso} patron="P2">
          <div data-fila="medio">
            <MarcoDeMedio
              clase="video"
              marcador="[VIDEO]"
              poster="[PÓSTER]"
              fuente={null}
              alt={contenido.medio}
              ancho={ANCHO_DEL_MEDIO}
              alto={ALTO_DEL_MEDIO}
              sizes={SIZES_DEL_MEDIO}
              descripcion={contenido.medio}
            />
          </div>
        </CanalDeUnaPieza>
      </Grilla>

      {/* ── FILA 3 · el caso ── P2, un target ── */}
      <CanalDeUnaPieza progreso={progreso} patron="P2">
        {/* El `data-fila` se queda: lo cuenta el instrumento. Lo que se fue es
            el `text-tinta-media` del envoltorio, que estaba ahí para que `cn()`
            no se comiera el tamaño del `<Micro>`. Ver `src/lib/utils.ts`. */}
        <div data-fila="caso">
          <Micro como="p" className="text-tinta-media uppercase">
            {contenido.caso}
          </Micro>
        </div>
      </CanalDeUnaPieza>
    </ContenidoDeSeccion>
  )
}
