import type { Ref } from 'react'

import { LIENZO, type Plano as DatosDelPlano, type Traza } from './planos'

/** El marco de la pantalla: la primera traza de todos los planos (el borde, apenas adentro para que no lo recorte el marco). */
const BORDE: Traza = { t: 'rect', x: 1, y: 1, w: LIENZO.ancho - 2, h: LIENZO.alto - 2, r: 10 }

/** Las trazas en el orden en que se dibujan: el borde y después la página. */
export function trazasDe(plano: DatosDelPlano): readonly Traza[] {
  return [BORDE, ...plano.trazas]
}

function UnaTraza({ traza }: { readonly traza: Traza }): React.JSX.Element {
  switch (traza.t) {
    case 'linea':
      return <line data-traza="" x1={traza.x1} y1={traza.y1} x2={traza.x2} y2={traza.y2} />
    case 'rect':
      return <rect data-traza="" x={traza.x} y={traza.y} width={traza.w} height={traza.h} rx={traza.r ?? 0} />
    case 'circulo':
      return <circle data-traza="" cx={traza.cx} cy={traza.cy} r={traza.r} />
    case 'camino':
      return <path data-traza="" d={traza.d} />
  }
}

/**
 * [M3] EL PLANO DE UN TRABAJO — sus trazas en el oscuro del acento, con el trazo fino del globo de Servicios: sin relleno, remate redondo.
 * Sin `vector-effect` (con él, el guion se mide en píxeles y el largo en unidades, y queda cortado): el grosor lo escribe quien lo
 * dibuja, en unidades del lienzo, según el ancho del marco. Sin JS sale dibujado entero.
 */
export function Plano({ plano, svg }: { readonly plano: DatosDelPlano; readonly svg?: Ref<SVGSVGElement> }): React.JSX.Element {
  return (
    <svg
      ref={svg}
      data-plano=""
      aria-hidden="true"
      viewBox={`0 0 ${String(LIENZO.ancho)} ${String(LIENZO.alto)}`}
      preserveAspectRatio="none"
      className="absolute inset-0 size-full text-acento"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazasDe(plano).map((t, i) => (
        <UnaTraza key={i} traza={t} />
      ))}
    </svg>
  )
}

/** Los rótulos de las partes, en monoespaciada sobre el plano (en % del lienzo). Aparecen con su traza y se van al abrirse la pantalla. */
export function RotulosDelPlano({ plano }: { readonly plano: DatosDelPlano }): React.JSX.Element {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {plano.rotulos.map((r) => (
        <span
          key={r.texto}
          data-rotulo-del-plano={r.despues + 1}
          className="absolute font-codigo text-micro tracking-wide text-acento uppercase"
          style={{ left: `${((r.x / LIENZO.ancho) * 100).toFixed(2)}%`, top: `${((r.y / LIENZO.alto) * 100).toFixed(2)}%`, translate: '0 -50%' }}
        >
          {r.texto}
        </span>
      ))}
    </div>
  )
}
