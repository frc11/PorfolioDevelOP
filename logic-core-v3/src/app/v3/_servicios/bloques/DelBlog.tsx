/**
 * [SERVICIOS S1b] 10 · DEL BLOG — los artículos relacionados (SPEC §5). Oculto mientras no exista el blog: un artículo sin
 * `href` no se monta, y sin ningún artículo montable el bloque entero no existe (ni en desarrollo).
 */

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import type { Articulo } from '../tipos'
import { Bloque } from './Bloque'

const TITULO = 'Del blog' // C2: provisorio (el nombre de SPEC §5)

export function DelBlog({ articulos }: { readonly articulos: readonly Articulo[] }): React.JSX.Element | null {
  const enlaces = articulos.flatMap((articulo) =>
    articulo.href === null ? [] : [{ titulo: articulo.titulo, href: articulo.href }],
  )
  if (enlaces.length === 0) return null
  return (
    <Bloque nombre="del-blog" titulo={TITULO}>
      <ul role="list" className="flex flex-col">
        {enlaces.map((enlace) => (
          <li key={enlace.href} className="border-b border-borde py-4">
            <a href={enlace.href} className="underline-offset-4 hover:underline">
              <Cuerpo como="span">{enlace.titulo}</Cuerpo>
            </a>
          </li>
        ))}
      </ul>
    </Bloque>
  )
}
