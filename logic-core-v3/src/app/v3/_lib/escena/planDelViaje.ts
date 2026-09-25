import { SECCIONES } from '../secciones'
import { SUPERFICIES, type DefinicionSuperficie } from '../superficies'
import { sampleLightArc } from './choreographySampler'
import type { MutableLightLevels } from './choreographyTypes'
import { medirLasSecciones, panelEn, SELECTOR_DE_LAS_SECCIONES, ATRIBUTO_DEL_PANEL } from './extensionDeLasSecciones'
import { NIVEL_NATURAL } from './nocheDisparada'
import { RIM_NIGHT_LEVEL } from './probeLighting'
import { progresoDelScroll } from './recorrido'
import { claseDelViaje, type Luz, type ViajeEnCurso } from './viaje'

/**
 * EL PLAN DE LUZ DE UN VIAJE — qué se ve al salir y al llegar, decidido en el click. **[VIAJES]**
 *
 * La luz de cada punta es la que se VE ahí:
 *   · una sección invertida (Trabajos) es de noche;
 *   · una opaca de papel (Servicios, Tu panel) es de día: lo que haya en la sala detrás no se ve;
 *   · una que deja ver la sala es de noche si su luz queda bajo `RIM_NIGHT_LEVEL`, el umbral en
 *     que la sala se invierte (motas claras, logo que emite). A la salida es la luz de este cuadro;
 *     a la llegada, la del arco en el destino, sin noche disparada encima: las secciones
 *     transparentes a las que se viaja quedan antes del disparo (Hero, Quiénes somos) o después
 *     del día del final (Por qué develOP), así que ahí la noche disparada no rige.
 *
 * Un viaje de día a día lleva además su luz: de la de salida a la de llegada, sin pasar por la
 * noche. Si una punta es opaca, su luz es la de la otra: ahí la sala no se ve.
 */

const SUPERFICIE_DE = new Map(SECCIONES.map((s) => [s.id, SUPERFICIES[s.superficie]]))

function luzDe(superficie: DefinicionSuperficie, nivel: number): Luz {
  if (superficie.invertida) return 'noche'
  if (!superficie.dejaVerElCanvas) return 'dia'
  return nivel < RIM_NIGHT_LEVEL ? 'noche' : 'dia'
}

const verLaSala = (s: DefinicionSuperficie): boolean => s.dejaVerElCanvas && !s.invertida

export function planDelViaje(destino: string, y1: number): ViajeEnCurso {
  const v = window.innerHeight
  const y0 = window.scrollY
  const secciones = medirLasSecciones(document, y0)
  const nivelDelArcoEn = (y: number): number => {
    if (secciones === null) return 1
    const arco: MutableLightLevels = { level: 1, kelvin: 0, azimuthDeg: 0, elevationDeg: 0 }
    sampleLightArc(progresoDelScroll(y, secciones.arriba, secciones.abajo, v), arco)
    return arco.level
  }
  const paneles = [...document.querySelectorAll<HTMLElement>(SELECTOR_DE_LAS_SECCIONES)].map((p) => {
    const r = p.getBoundingClientRect()
    return { id: p.getAttribute(ATRIBUTO_DEL_PANEL) ?? '', tope: r.top, pie: r.bottom }
  })
  const salida = SUPERFICIE_DE.get(panelEn(paneles, v / 2) ?? '') ?? SUPERFICIES['papel-transparente']
  const llegada = SUPERFICIE_DE.get(destino) ?? SUPERFICIES['papel-transparente']
  const nivelDeSalida = verLaSala(salida) ? NIVEL_NATURAL.valor : null
  const nivelDeLlegada = verLaSala(llegada) ? nivelDelArcoEn(y1) : null
  const clase = claseDelViaje(luzDe(salida, NIVEL_NATURAL.valor), luzDe(llegada, nivelDeLlegada ?? 1))
  if (clase !== 'dia-a-dia') return { destino, clase, luz: null }
  const desde = nivelDeSalida ?? nivelDeLlegada ?? 1
  return { destino, clase, luz: { desde, hasta: nivelDeLlegada ?? desde, y0, y1 } }
}
