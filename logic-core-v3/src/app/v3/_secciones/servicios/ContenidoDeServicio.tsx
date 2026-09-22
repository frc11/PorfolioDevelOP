'use client'

import type { Servicio } from '../_contrato/acento'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { ContenidoDeSeccion } from '../_contrato/Seccion'
import { BloqueDeServicio } from './BloqueDeServicio'
import { RotuloDeServicio } from './RotuloDeServicio'

/**
 * UN SERVICIO EN LA RAMA APILADA — rótulo arriba, contenido abajo.
 *
 * ── Qué quedó acá, después de partir el archivo ───────────────────────────
 *
 * Este componente servía a las DOS ramas y llevaba adentro la composición de
 * las dos. Ya no: la rama pinneada dejó de tener «un servicio» como unidad de
 * montaje —su rótulo vive en el rodillo y su contenido en la tira, en columnas
 * distintas y con mecanismos distintos— así que esto es, explícitamente, la
 * composición de la rama apilada y nada más.
 *
 * Las PIEZAS siguen siendo las mismas para las dos, y ése es el punto: el
 * rótulo sale de `RotuloDeServicio` y el contenido de `BloqueDeServicio`, los
 * dos compartidos. Lo que cambia entre ramas es cómo se acomodan, no qué dicen.
 * Con dos árboles escritos a mano, la persona que entra desde un teléfono
 * termina leyendo un contenido distinto del de escritorio y nadie se entera;
 * `s6-servicios` §3 compara lo anunciado carácter por carácter justamente para
 * que eso no pueda pasar en silencio.
 *
 * ── El orden del documento es el que manda ────────────────────────────────
 *
 * Rótulo, después párrafo, después medio, después caso. La tira publica ese
 * mismo orden por servicio —con el rótulo en su copia `sr-only` acotada— y por
 * eso las dos ramas anuncian lo mismo aunque se vean completamente distinto.
 *
 * ── Sin coreografía, por construcción ─────────────────────────────────────
 *
 * Los canales reciben `null` y rinden su forma quieta. No es una decisión de
 * este archivo: abajo de 1025 —y con movimiento reducido a cualquier ancho— la
 * compuerta no instala las primitivas y el `Bloque` entrega `progreso === null`.
 */

export interface ContenidoDeServicioProps {
  readonly servicio: Servicio
}

export function ContenidoDeServicio({ servicio }: ContenidoDeServicioProps): React.JSX.Element {
  return (
    // El `py` es `--spacing-8` (32 px por lado) y no `--spacing-12`: con 48, la
    // banda entre el titular de la sección y el rótulo del servicio medía 104 px
    // en el cuadro del medio del pin y 125 en el del tercer cuarto, arriba del
    // techo del bloque. Es aire de composición, no separación que alguien lea.
    // Medido en B1 a 1920.
    <ContenidoDeSeccion claseDeContenido="flex w-full flex-col gap-[var(--spacing-8)] py-[var(--spacing-8)]">
      <CanalDeUnaPieza progreso={null} patron="P2">
        <RotuloDeServicio servicio={servicio} />
      </CanalDeUnaPieza>
      <BloqueDeServicio servicio={servicio} pintura={null} disposicion="apilada" />
    </ContenidoDeSeccion>
  )
}
