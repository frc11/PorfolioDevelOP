import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, TEXTO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'

/** El giro y la altura de cada libro en el estante (fijos: el desorden es siempre el mismo). */
const POSE = [
  { giro: -5, baja: 3 },
  { giro: 3, baja: 0 },
  { giro: -2, baja: 5 },
  { giro: 4, baja: 1 },
  { giro: -3, baja: 4 },
] as const

/** Qué son y cómo funcionan, en tres pasos: la bajada de Valentino (05-TEXTOS) partida, sin agregar nada. */
const COMO_FUNCIONAN = [
  { titulo: 'Una muestra', texto: 'Son sitios de ejemplo: una muestra de lo que somos capaces de hacer.' },
  { titulo: 'Para cualquier rubro', texto: 'Cada una está pensada para un rubro, pero se adaptan a cualquiera.' },
  { titulo: 'La hacemos tuya', texto: 'Si te gusta alguna, la tomamos de base y la hacemos tuya.' },
] as const

/**
 * [L7e · P2] LAS DEMOS, EN CONJUNTO — ESTRUCTURA pide en el Portfolio «las demos al final, en conjunto: qué son y cómo funcionan, no una
 * por una». Las cinco tapas de la Biblioteca del home en un estante, una encima de la otra y apenas torcidas, como libros apoyados: con el
 * mouse (o el foco) una se levanta, se endereza y dice su rubro; un clic la abre en otra pestaña. Debajo, qué son en tres pasos con el
 * gatillo. Las tapas y el texto son los del catálogo del home (`CATALOGO_DE_DEMOS`), importados. Sin JS: es todo CSS (`group-hover`).
 */
export function DemosEnConjunto(): React.JSX.Element {
  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pt-36 pb-12 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Portfolio · las demos</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">{TEXTO_DE_DEMOS.titulo}</span>
          <span className="block font-liviano tracking-titulo italic uppercase">para cualquier rubro</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-texto">{TEXTO_DE_DEMOS.parrafo}</p>
      </header>
      <ul aria-label="Las demos" className="mx-auto flex max-w-6xl items-end justify-center px-6 pt-10 pb-20">
        {CATALOGO_DE_DEMOS.map((d, i) => {
          const pose = POSE[i % POSE.length]
          return (
            <li key={d.slug} className="group relative -mx-[2.5vw] w-[22vw] max-w-[15rem] hover:z-10 focus-within:z-10 escritorio:-mx-6">
              <a href={d.url} target="_blank" rel="noopener noreferrer" aria-label={`${d.nombre}, demo de ${d.rubro} (se abre en una pestaña nueva)`} className="block no-underline">
                <span
                  className="block origin-bottom translate-y-[var(--baja)] rotate-[var(--giro)] transition-[translate,rotate] duration-[var(--duracion-media)] ease-[var(--ease-salida)] group-hover:-translate-y-6 group-hover:rotate-0 group-focus-within:-translate-y-6 group-focus-within:rotate-0 motion-reduce:transition-none"
                  style={{ '--giro': `${String(pose.giro)}deg`, '--baja': `${String(pose.baja)}%` } as React.CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- prototipo: las portadas ya optimizadas de la Biblioteca */}
                  <img src={d.portada} alt="" width={MEDIDA_DE_LA_PORTADA.ancho / 4} height={MEDIDA_DE_LA_PORTADA.alto / 4} className="block aspect-[2/3] w-full rounded-medio object-cover shadow-xl shadow-tinta/25" />
                </span>
                <span className="mt-4 block text-center font-codigo text-micro tracking-wide text-tinta-media uppercase opacity-0 transition-opacity duration-[var(--duracion-media)] ease-[var(--ease-salida)] group-hover:opacity-100 group-focus-within:opacity-100 tablet:text-caption">
                  {d.rubro}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
      <ol className="mx-auto grid max-w-6xl gap-10 px-6 pb-48 tablet:grid-cols-3">
        {COMO_FUNCIONAN.map((p, i) => (
          <li key={p.titulo}>
            <Gatillo desde="abajo">
              <p className="font-codigo text-caption text-tinta-media">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-2 font-display text-titulo-m leading-titulo font-fuerte tracking-display uppercase">{p.titulo}</h2>
              <p className="mt-3 text-base leading-texto">{p.texto}</p>
            </Gatillo>
          </li>
        ))}
      </ol>
    </>
  )
}
