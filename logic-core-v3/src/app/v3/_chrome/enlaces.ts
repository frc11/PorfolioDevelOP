import type { EnlaceDeNavegacion } from '../_lib/navegacion'

/**
 * [NAVBAR] LOS ÍTEMS DEL MENÚ DEL HOME — los de la barra de escritorio y los del menú del teléfono, en este orden.
 *
 * Son del home y no de la pastilla compartida (`_componentes/chrome/Navegacion.tsx` sigue con `ENLACES_DE_MUESTRA`
 * para la galería). «Trabajos» pasa a llamarse «Portfolio» (la sección sigue siendo `#trabajos`), y «Panel» es nuevo:
 * lleva a Tu panel. Cada destino es el nudo de su sección (`destinosDelViaje.ts`).
 *
 * [RETOQUE 3D] 3I · «Contacto» va al formulario del pie (`#contacto`: el viaje lo resuelve a su sección). N1 · sale de la
 * pastilla: con «Login» (el login del sitio, `/login`) va a la esquina de arriba a la derecha; en el teléfono, los dos
 * separados al pie del menú de vidrio. `ENLACES_DEL_HOME` sigue siendo la lista entera (las secciones y Contacto).
 */
export const ENLACES_DEL_HOME: readonly EnlaceDeNavegacion[] = [
  { id: 'quienes-somos', rotulo: 'Quiénes somos', destino: '#quienes-somos' },
  { id: 'trabajos', rotulo: 'Portfolio', destino: '#trabajos' },
  { id: 'servicios', rotulo: 'Servicios', destino: '#servicios' },
  { id: 'tu-panel', rotulo: 'Panel', destino: '#tu-panel' },
  { id: 'por-que-develop', rotulo: 'Por qué develOP', destino: '#por-que-develop' },
  { id: 'cierre', rotulo: 'Contacto', destino: '#contacto' },
]

/** [RETOQUE 3D] N1 · las secciones (la pastilla y la lista del menú del teléfono). */
export const ENLACES_DE_SECCION: readonly EnlaceDeNavegacion[] = ENLACES_DEL_HOME.filter((e) => e.destino !== '#contacto')

/** [RETOQUE 3D] N1 · Contacto y Login (la esquina de la barra; el pie del menú del teléfono). */
export const ENLACE_DE_CONTACTO: EnlaceDeNavegacion = ENLACES_DEL_HOME.find((e) => e.destino === '#contacto') ?? { id: 'cierre', rotulo: 'Contacto', destino: '#contacto' }
export const ENLACE_DE_LOGIN: EnlaceDeNavegacion = { id: 'login', rotulo: 'Login', destino: '/login' }
