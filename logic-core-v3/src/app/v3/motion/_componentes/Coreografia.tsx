'use client'

import { useState } from 'react'

import { MARCA_MOTION } from '../../_lib/motion/marcaMotion'
import { INSTANCIAS_MEDIDAS, ORDEN_DE_PATRONES, PATRONES } from '../../_lib/motion/patrones'
import { AJUSTES_MEDIDOS, type Ajustes } from './ajustes'
import { Controles } from './Controles'
import { SeccionDePatron } from './SeccionDePatron'

/**
 * LA COREOGRAFÍA — los nueve patrones, corriendo.
 *
 * ⚠ ÉSTE es el módulo perezoso de la compuerta de 1025. Es el único archivo de la
 * aplicación que importa `MARCA_MOTION`, y de eso depende que
 * `motion-bundle.invariant.ts` pueda distinguir "el chunk no baja" de "el
 * buscador está ciego". Si esta marca aparece en cualquier módulo de la carga
 * inicial de `/v3/motion`, la compuerta gotea y la comprobación lo dice.
 *
 * `export default` porque `next/dynamic` importa el default del módulo.
 */
export default function Coreografia(): React.JSX.Element {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_MEDIDOS)

  return (
    // La MARCA viaja como valor de atributo: se USA en tiempo de ejecución, así
    // que ningún minificador la pliega ni ningún tree-shaking la poda.
    //
    // `bg-fondo`: el layout de /v3 monta el canvas de prueba de S1 —dos bandas
    // de color, fijas y a viewport completo— detrás del flujo. Es correcto que
    // esté ahí y no se toca, pero un fondo de dos tonos detrás de un patrón de
    // motion es ruido justo donde hay que juzgar. Esta ruta se pinta sobre el
    // papel, que es lo que hace un panel `papel-opaco` del sistema de S1.
    <div data-motion={MARCA_MOTION} className="bg-fondo">
      <Controles ajustes={ajustes} alCambiar={setAjustes} />

      <header className="px-[var(--pad-lateral-compacto)] pt-20 pb-12">
        <div className="max-w-tope mx-auto flex flex-col gap-6">
          <p className="font-codigo text-micro tracking-micro text-tinta-media uppercase">
            instrumento interno · no forma parte del sitio
          </p>
          <h1 className="font-titulo text-titulo-l leading-titulo tracking-titulo">
            Los nueve patrones
          </h1>
          <p className="font-cuerpo text-cuerpo leading-texto tracking-texto max-w-tope">
            {INSTANCIAS_MEDIDAS} instancias de animación medidas en la referencia se reducen a
            nueve patrones. Uno solo cubre el 58 %; dos cubren el 90 %. Están todos atados al
            progreso de scroll y son exactamente reversibles: al retroceder se reproducen al
            revés. El panel de la derecha varía duración, escalonado y curva sin recompilar.
          </p>
          <nav aria-label="Índice de patrones">
            <ul className="flex flex-wrap gap-3">
              {ORDEN_DE_PATRONES.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="font-codigo text-micro tracking-micro border-borde hover:bg-superficie-3 border px-3 py-1 uppercase"
                  >
                    {id} · {PATRONES[id].nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {ORDEN_DE_PATRONES.map((id) => (
        <SeccionDePatron key={id} patron={PATRONES[id]} ajustes={ajustes} />
      ))}

      <footer className="px-[var(--pad-lateral-compacto)] pb-20">
        <p className="max-w-tope font-codigo text-caption text-tinta-media mx-auto">
          Fin de los nueve. El recorrido de cada patrón sale de su ancla medida, no de un número
          elegido: ver `escenografia.ts`.
        </p>
      </footer>
    </div>
  )
}
