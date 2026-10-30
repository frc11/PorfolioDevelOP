/**
 * [M3] EL MOMENTO DE CADA PÁGINA — lo que Valentino eligió del laboratorio (2026-10-30), después de «Qué hacemos» (el bloque cuyo texto el
 * momento muestra):
 *   · Desarrollo web: la pantalla que se dibuja y luego se vuelve celular, con el menú de trabajos (`pantalla/`);
 *   · Software a medida: lo de siempre tachado contra la solución, y el sistema que se ordena (`orden/`);
 *   · Integraciones con IA: el chat que atiende y el módulo de automatizaciones con la lista que pasa sola (`atiende/`).
 * Server: arma los datos (los trabajos de la página, de PROYECTOS) y monta las piezas de cliente.
 */

import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import type { Servicio } from '../tipos'
import { Automatizaciones, ElChat } from './atiende/Bloques'
import { ElOrden } from './orden/ElOrden'
import { LoDeSiempre } from './orden/LoDeSiempre'
import { LaPantalla, type TrabajoDeLaPantalla } from './pantalla/LaPantalla'

/** Los trabajos de la página web, en su orden (los casos de `prueba`), con lo que la pantalla usa de PROYECTOS: nombre, rubro y medios. */
export function trabajosDeLaPantalla(servicio: Servicio): readonly TrabajoDeLaPantalla[] {
  return servicio.prueba.casos.flatMap((c) => {
    if (c.tipo !== 'proyecto') return []
    const p = FUENTE_DE_PROYECTOS.find((x) => x.slug === c.slug)
    return p === undefined ? [] : [{ slug: p.slug, nombre: p.nombre, rubro: p.rubro, medios: p.medios }]
  })
}

export function MomentoDelServicio({ servicio }: { readonly servicio: Servicio }): React.JSX.Element | null {
  switch (servicio.slug) {
    case 'paginas-web': {
      const trabajos = trabajosDeLaPantalla(servicio)
      return trabajos.length === 0 ? null : <LaPantalla trabajos={trabajos} />
    }
    case 'software-a-medida':
      return (
        <>
          <LoDeSiempre />
          <ElOrden />
        </>
      )
    case 'ia-y-automatizaciones':
      return (
        <>
          <ElChat />
          <Automatizaciones />
        </>
      )
  }
}
