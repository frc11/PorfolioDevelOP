'use client'

import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { MotionValue } from 'motion/react'

import { FormularioDeNovedades } from '../../_componentes/chrome/Novedades'
import { BloqueDeColumnasDelPie } from '../../_componentes/chrome/Pie'
import { EnlaceDelPieConIcono } from '../../_componentes/chrome/PiePiezas'
import { Caption, EtiquetaDeSeccion, Micro } from '../../_componentes/tipografia/Textos'
import { PATRONES } from '../../_lib/motion/patrones'
import { CanalDePieza } from '../_contrato/Canales'
import {
  COLUMNAS,
  DESTINOS_DE_LA_RUTA,
  NOVEDADES,
  PEDIDOS_DE_CONTACTO,
  type ClaseDeColumna,
} from './contenido'

/**
 * LAS COLUMNAS QUE SUBEN — P2 con escalonado, sobre la grilla del pie.
 *
 * ── La desviación declarada del uso medido de P2 ──────────────────────────
 *
 * P2 tiene **un solo target por instancia** en la referencia, y por eso su
 * escalonado de 0,1 s queda inerte: con `cantidad − 1 = 0` no hay nada que
 * desparramar y la duración aplicada coincide con la declarada. Acá las
 * columnas son **N piezas de un mismo conjunto**, así que el escalonado sí se
 * aplica y la duración aplicada pasa de 0,5 a 0,7 s. Es la desviación que la
 * instrucción pide —"las columnas del pie, con escalonado"— y está declarada
 * en `USOS_DECLARADOS`, no escondida acá.
 *
 * `cantidad` sale de `COLUMNAS.length` y no de un número escrito al lado: si
 * mañana el pie tiene cuatro columnas, el escalonado se reparte entre cuatro
 * sin que nadie se acuerde de tocar esto.
 *
 * ── Los enlaces no pueden llevar a la nada ────────────────────────────────
 *
 * La columna del recorrido lleva a las anclas que EXISTEN, con sus nombres
 * sacados de la misma fila de la tabla. La de contacto no tiene destino real,
 * así que muestra su forma con el marcador en TEXTO y nunca con un `<a>`.
 *
 * ── El texto secundario va en tinta con opacidad, no en `tinta-media` ─────
 *
 * `--color-tinta-media` y `--color-tinta-tenue` **no se redefinen** en el
 * bloque `[data-seccion="invertida"]` del tema: sobre el fondo oscuro quedan
 * gris medio sobre casi negro. `opacity-casi` sobre la tinta, en cambio, se da
 * vuelta con ella y pasa AA en las dos superficies. El instrumento publica las
 * dos razones de contraste.
 *
 * ── ⚠️ `cn()` se come clases sin decir nada — la trampa medida ────────────
 *
 * `cn()` es `twMerge` sobre `clsx` y **no conoce los nombres del sistema v3**:
 * mete `text-<tamaño>` y `text-<color>` en el mismo grupo y descarta uno de los
 * dos, en silencio; y como `font-medio` no es un peso que twMerge reconozca, lo
 * trata como FAMILIA. De ahí salen dos reglas para este archivo:
 *
 *   · **ningún `text-<color>` por `className`** a un componente de texto ni a
 *     una pieza del pie. El color se hereda de la superficie —que es además lo
 *     que hace a la sección correcta con las dos— y así no compite con nada;
 *   · **`font-codigo` sólo sin `peso`**. Con `peso="medio"` la pieza perdía la
 *     familia Y el peso a la vez. Sin `peso`, el `font-normal` del componente
 *     sobrevive porque ése sí es un peso conocido, y lo único que se reemplaza
 *     es la familia, que es exactamente lo que se quiso.
 *
 * El invariante lo afirma sobre el marcado renderizado: cada elemento con
 * `data-nivel` conserva su utilidad de tamaño.
 */

/** 16px, el tamaño de icono de sección de la convención. Token, no `size`. */
const CLASE_ICONO = 'size-[var(--spacing-4)]'

export interface ColumnasDelPieProps {
  /** El progreso del bloque de P2. `null` cuando no hay coreografía. */
  readonly progreso: MotionValue<number> | null
}

export function ColumnasDelPie({ progreso }: ColumnasDelPieProps): React.JSX.Element {
  return (
    <BloqueDeColumnasDelPie>
      {COLUMNAS.map((columna, indice) => (
        <CanalDePieza
          key={columna.id}
          progreso={progreso}
          patron={PATRONES.P2}
          cantidad={COLUMNAS.length}
          indice={indice}
          className="flex flex-col gap-[var(--spacing-4)]"
        >
          <EtiquetaDeSeccion como="h3" sangria={false}>
            {columna.titulo}
          </EtiquetaDeSeccion>
          <CuerpoDeColumna clase={columna.clase} />
        </CanalDePieza>
      ))}
    </BloqueDeColumnasDelPie>
  )
}

function CuerpoDeColumna({ clase }: { readonly clase: ClaseDeColumna }): React.JSX.Element {
  if (clase === 'recorrido') return <ColumnaDelRecorrido />
  if (clase === 'pedido') return <ColumnaDePedido />
  return <ColumnaDeNovedades />
}

/**
 * Una lista de verdad y no tres `div`: quien navega por listas la encuentra, y
 * anuncia cuántos destinos hay antes de recorrerlos.
 */
function ColumnaDelRecorrido(): React.JSX.Element {
  return (
    <ul className="flex flex-col gap-[var(--spacing-2)]">
      {DESTINOS_DE_LA_RUTA.map((destino) => (
        <li key={destino.ancla}>
          <EnlaceDelPieConIcono
            href={destino.ancla}
            rotulo={destino.rotulo}
            icono={<ArrowUpRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
          />
        </li>
      ))}
    </ul>
  )
}

/** El marcador va como TEXTO. Un `<a>` acá sería un enlace a la nada. */
function ColumnaDePedido(): React.JSX.Element {
  return (
    <ul className="flex flex-col gap-[var(--spacing-2)]">
      {PEDIDOS_DE_CONTACTO.map((pedido) => (
        <li key={pedido.descripcion} className="flex flex-col">
          {/* SIN `peso`. Ver la nota de `cn()` arriba: con `peso="medio"` esta
              misma línea perdía la familia Y el peso, en silencio. */}
          <Caption como="span" className="font-codigo uppercase">
            {pedido.marcador}
          </Caption>
          <Micro como="span" className="opacity-casi uppercase">
            {pedido.descripcion}
          </Micro>
        </li>
      ))}
    </ul>
  )
}

/**
 * Deshabilitado y con el motivo dicho, porque no hay a dónde enviarlo.
 *
 * El botón de envío es el ÚNICO botón del formulario y renderiza `disabled`:
 * con el botón por defecto deshabilitado el navegador tampoco envía con Enter.
 */
function ColumnaDeNovedades(): React.JSX.Element {
  return (
    <FormularioDeNovedades
      id={NOVEDADES.id}
      rotulo={NOVEDADES.rotulo}
      placeholder={NOVEDADES.placeholder}
      textoDeAyuda={NOVEDADES.ayuda}
      rotuloDeEnvio={NOVEDADES.rotuloDeEnvio}
      deshabilitado
      icono={<ArrowRight className={CLASE_ICONO} strokeWidth={1.5} aria-hidden="true" />}
    />
  )
}
