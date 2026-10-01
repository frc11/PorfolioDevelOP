import type { EnlaceDeNavegacion } from '../_lib/navegacion'

/**
 * [NAVBAR] LOS ÍTEMS DEL MENÚ DEL HOME — los de la barra de escritorio y los del menú del teléfono, en este orden.
 *
 * Son del home y no de la pastilla compartida (`_componentes/chrome/Navegacion.tsx` sigue con `ENLACES_DE_MUESTRA`
 * para la galería). «Trabajos» pasa a llamarse «Portfolio» (la sección sigue siendo `#trabajos`), y «Panel» es nuevo:
 * lleva a Tu panel. «Contacto» abre el formulario: `#contacto` no es una sección, el viaje lo deja pasar y lo intercepta
 * el contacto (`contacto/apertura.ts`). Cada destino es el nudo de su sección (`destinosDelViaje.ts`).
 */
export const ENLACES_DEL_HOME: readonly EnlaceDeNavegacion[] = [
  { id: 'quienes-somos', rotulo: 'Quiénes somos', destino: '#quienes-somos' },
  { id: 'trabajos', rotulo: 'Portfolio', destino: '#trabajos' },
  { id: 'servicios', rotulo: 'Servicios', destino: '#servicios' },
  { id: 'tu-panel', rotulo: 'Panel', destino: '#tu-panel' },
  { id: 'por-que-develop', rotulo: 'Por qué develOP', destino: '#por-que-develop' },
  { id: 'cierre', rotulo: 'Contacto', destino: '#contacto' },
]
