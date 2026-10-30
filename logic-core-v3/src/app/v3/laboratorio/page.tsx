import type { Metadata } from 'next'

import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { PROTOTIPOS } from './_lab/prototipos'

export const metadata: Metadata = {
  title: 'Laboratorio · prototipos para las páginas nuevas',
  description: 'Ideas y efectos para las páginas nuevas de develOP, sacados del home. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * [L7e] EL ÍNDICE DEL LABORATORIO — cada prototipo con qué mirar y de qué sale. El orden es el de `docs/ideas/COMO-MIRAR.md` (los que
 * más creo, primero). Papel opaco: la escena, sin preset, pinta un cuadro y duerme debajo.
 */
export default function Laboratorio(): React.JSX.Element {
  return (
    <main className="relative z-10 min-h-svh bg-fondo text-tinta">
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">develOP · L7e · sólo para mirar</p>
        <h1 className="mt-3 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">El laboratorio</span>
          <span className="block font-liviano tracking-titulo italic uppercase">de las páginas nuevas</span>
        </h1>
        <p className="mt-6 max-w-2xl text-cuerpo leading-texto">
          Prototipos de los momentos que podrían tener las páginas nuevas, cada uno sacado de algo que el home ya hace. Están crudos por
          dentro: se miran moviéndose. Cada uno tiene abajo a la derecha una leyenda con qué mirar. El porqué de cada idea está en{' '}
          <code className="font-codigo text-caption">docs/ideas/MOMENTOS.md</code>, y el recorrido sugerido, en{' '}
          <code className="font-codigo text-caption">docs/ideas/COMO-MIRAR.md</code>.
        </p>
        <ol className="mt-12 divide-y divide-borde border-y border-borde">
          {PROTOTIPOS.map((p, i) => (
            <li key={p.slug}>
              <EnlaceDeRuta href={`/v3/laboratorio/${p.slug}`} className="group grid gap-1 py-5 no-underline escritorio:grid-cols-[3rem_1fr_10rem] escritorio:gap-6">
                <span className="font-codigo text-caption text-tinta-media">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-titulo-s font-semi underline-offset-4 group-hover:underline">{p.titulo}</span>
                  <span className="mt-1 block text-cuerpo leading-texto text-tinta-media">{p.mirar}</span>
                </span>
                <span className="font-codigo text-caption text-tinta-media uppercase escritorio:text-right">
                  {p.codigo} · {p.pagina}
                </span>
              </EnlaceDeRuta>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
