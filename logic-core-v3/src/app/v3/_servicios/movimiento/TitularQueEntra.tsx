'use client'

import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import type { Peso } from '../../_lib/tipografia'
import type { TipoDeTexto } from '../../_lib/motion/texto'
import { CanalDeTexto } from '../../_secciones/_contrato/canales'
import { Bloque as BloqueMedido } from '../../_secciones/_contrato/coreografia'

/**
 * [SERVICIOS S1b] EL TEXTO QUE ENTRA POR LÍNEA — el canal del texto del home (`CanalDeTexto`: el título por línea con máscara,
 * el párrafo por línea, la etiqueta por palabra), con un `Titular` adentro.
 *
 * El elemento, su `id`, sus clases y su caja son los mismos en las dos ramas (lo dice el canal): el árbol de encabezados no cambia
 * y `aria-labelledby` sigue apuntando al mismo `id`. Sin coreografía —SSR, abajo de 1025, movimiento reducido— sale el `Titular`
 * con su texto, tal cual. Va en un archivo de cliente por lo mismo que `Revelado`: el canal recibe una función como hijo.
 *
 * `claseDelBloque` es del `div` que se mide (el que ocupa la celda de la grilla); `className`, del encabezado.
 */
interface TitularQueEntraProps {
  readonly texto: string
  readonly nivel: NivelDeTitular
  readonly como: 'h1' | 'h2' | 'p'
  /** La familia del movimiento: el título por línea, el párrafo por línea o la etiqueta por palabra. */
  readonly tipo?: TipoDeTexto
  readonly peso?: Peso
  readonly id?: string
  readonly className?: string
  readonly claseDelBloque?: string
}

export function TitularQueEntra({
  texto,
  nivel,
  como,
  tipo = 'titulo',
  peso,
  id,
  className,
  claseDelBloque,
}: TitularQueEntraProps): React.JSX.Element {
  return (
    <BloqueMedido patron="P2" rango="ventana-visible" className={claseDelBloque ?? 'block w-full'}>
      {(progreso) => (
        <CanalDeTexto progreso={progreso} tipo={tipo} texto={texto}>
          {(contenido) => (
            <Titular nivel={nivel} como={como} peso={peso} id={id} className={className}>
              {contenido}
            </Titular>
          )}
        </CanalDeTexto>
      )}
    </BloqueMedido>
  )
}
