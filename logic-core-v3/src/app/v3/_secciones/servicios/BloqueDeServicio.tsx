'use client'

import type { MotionValue } from 'motion/react'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Micro } from '../../_componentes/tipografia/Textos'
import type { Servicio } from '../_contrato/acento'
import { CanalDePiezas, CanalDeUnaPieza } from '../_contrato/canales'
import {
  ALTO_DEL_MEDIO,
  ANCHO_DEL_MEDIO,
  CONTENIDO,
  VIDEO_DE_MUESTRA,
  SIZES_DEL_MEDIO,
  palabrasDelParrafo,
} from './contenido'
import { ParrafoQueSePinta } from './ParrafoQueSePinta'
import { VideoDeServicio } from './VideoDeServicio'
import { NIVEL_DEL_PARRAFO, clasesDeNivel } from './geometria'

/**
 * EL CONTENIDO DE UN SERVICIO — párrafo, medio y caso. SIN el rótulo.
 *
 * Es la pieza que las dos ramas comparten, y está escrita UNA vez por el motivo
 * de siempre: con dos árboles a mano, la persona que entra desde un teléfono
 * termina leyendo un contenido distinto del de escritorio y nadie se entera.
 *
 * El rótulo NO está acá porque en la rama pinneada no viaja con el contenido:
 * se ve en el rodillo de la izquierda y se anuncia —`sr-only`, acotado— desde la
 * tira. Cada rama lo pone en su lugar; ver `RotuloDeServicio.tsx`.
 *
 * ── ⚠️ EN EL PANEL NO HAY CANAL, Y ES A PROPÓSITO ─────────────────────────
 *
 * Los tres canales reciben `progreso={null}` en la rama pinneada, así que rinden
 * su forma quieta. **La única cosa que mueve el contenido de la derecha es la
 * traslación de la tira**, y la única que lo cambia es la pintura del párrafo.
 * Un P2 por bloque haría que el medio y el caso se movieran RESPECTO de la tira
 * mientras la tira se mueve, que es exactamente la clase de movimiento que este
 * sprint vino a sacar: dos mecanismos encima del mismo contenido.
 *
 * Los envoltorios de canal se quedan igual, con su patrón nombrado, por dos
 * razones que no son inercia: el marcado de las dos ramas tiene que seguir
 * siendo el mismo —`s6-servicios` §3 compara lo anunciado carácter por
 * carácter— y el padrón de `USOS_DECLARADOS` sigue diciendo la verdad sobre qué
 * patrones nombra la sección.
 */

export type DisposicionDeServicio = 'apilada' | 'panel'

export interface BloqueDeServicioProps {
  readonly servicio: Servicio
  /** Cuánto está pintado el párrafo, ya resuelto. Null: sale pintado entero. */
  readonly pintura: MotionValue<number> | null
  readonly disposicion?: DisposicionDeServicio
}

export function BloqueDeServicio({
  servicio,
  pintura,
  disposicion = 'apilada',
}: BloqueDeServicioProps): React.JSX.Element {
  const contenido = CONTENIDO[servicio.id]
  const palabras = palabrasDelParrafo(servicio.id)
  const enPanel = disposicion === 'panel'
  // El panel lee en `NIVEL_DEL_PARRAFO` —la perilla de `geometria.ts`— y la
  // apilada se queda en `cuerpo`: abajo de 1025 el párrafo comparte el ancho con
  // el medio, y un escalón grande lo partiría en demasiados renglones.
  const nivelDeLectura = enPanel ? NIVEL_DEL_PARRAFO : 'cuerpo'

  /* ── EL PÁRRAFO ──
     El espacio va DENTRO de la pieza, adelante de la palabra. Sin eso, dos
     piezas vecinas se anuncian pegadas —el defecto que este repo registró como
     "PomeloExplore"— y el instrumento lo caza reconstruyendo el texto sin
     insertar separadores. */
  const parrafo = (
    <div data-canal="parrafo">
      {enPanel ? (
        <ParrafoQueSePinta
          pintura={pintura}
          palabras={palabras}
          className={clasesDeNivel(nivelDeLectura)}
        />
      ) : (
        <CanalDePiezas
          progreso={null}
          patron="P3"
          cantidad={palabras.length}
          como="span"
          contenedor={clasesDeNivel(nivelDeLectura)}
          render={(i) => (i === 0 ? palabras[i] : ` ${palabras[i]}`)}
        />
      )}
    </div>
  )

  /* ── EL MEDIO ──
     Es un HUECO y no un `<video>`: el archivo no existe todavía. Un `<video>`
     sin fuente compila perfecto y en el navegador es un rectángulo negro. El
     hueco reserva la relación de aspecto y el `sizes` real, que es lo único que
     se puede reservar de verdad. */
  const medio = (
    <CanalDeUnaPieza progreso={null} patron="P2">
      <div data-fila="medio">
        {/* RECURSOS: el mismo video de muestra en los tres frentes, por ahora. */}
        <VideoDeServicio
          fuente={VIDEO_DE_MUESTRA.fuente}
          poster={VIDEO_DE_MUESTRA.poster}
          descripcion={contenido.medio}
          ancho={ANCHO_DEL_MEDIO}
          alto={ALTO_DEL_MEDIO}
          sizes={SIZES_DEL_MEDIO}
        />
      </div>
    </CanalDeUnaPieza>
  )

  const caso = (
    <CanalDeUnaPieza progreso={null} patron="P2">
      <div data-fila="caso">
        <Micro como="p" className="text-tinta-media uppercase">
          {contenido.caso}
        </Micro>
      </div>
    </CanalDeUnaPieza>
  )

  if (enPanel) {
    return (
      <>
        {parrafo}
        {medio}
        {caso}
      </>
    )
  }

  /* ⚠️ **B1 ACHICÓ EL HUECO DEL MEDIO Y SE REVIRTIÓ, CON LOS DOS NÚMEROS.** El
     hueco de `[VIDEO]` a 1920 medía 920 × 517,5 px —30,79 % del área del
     bloque— y B1 lo bajó a 608 × 342 (16,12 %) metiendo una tercera columna. El
     resultado medido fue PEOR: el aire muerto de Servicios subió de 33,52 % a
     44,72 % y su banda vacía continua máxima de 104 a 120 px, porque ese marco
     punteado era la ÚNICA tinta de esas filas. La proporción se queda en mitad
     y mitad. */
  return (
    <>
      <Grilla columnas={2} className="items-start">
        <div className="flex flex-col gap-[var(--spacing-6)]">{parrafo}</div>
        {medio}
      </Grilla>
      {caso}
    </>
  )
}
