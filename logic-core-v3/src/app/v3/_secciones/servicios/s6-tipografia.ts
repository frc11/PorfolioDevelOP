/**
 * §13 DEL INVARIANTE DE SERVICIOS — `cn()` y las clases de tipografía.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas**, y el corte es
 * por TEMA: es la única sección del invariante que afirma sobre lo que hace
 * `twMerge` con los nombres del sistema, que es un asunto de la utilidad y no de
 * esta sección — el repo ya tiene `s7-cn.invariant.ts` sobre lo mismo. Misma
 * costura que `s6-asentamiento.ts`.
 *
 * ⚠️ **El archivo de Servicios vivía EXACTAMENTE en 300 líneas**, así que
 * cualquier agregado lo rompía. B2 le saca dos temas para que tenga margen, no
 * para raspar hasta el límite otra vez.
 */

import { cn } from '@/lib/utils'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
// prettier-ignore
import { elementosTipograficos, familiasDeCuerpoPerdidas, familiasDeTituloPerdidas, tamanosPerdidos } from './deteccion'

/** §13 entero. Recibe las dos ramas ya renderizadas: no vuelve a montar nada. */
export function afirmarLaTipografia(quieto: string, animado: string): void {
  titulo('13 · `cn()` no se comió ninguna clase de tipografía')
  /**
   * La trampa es REAL y está medida en este repo: `cn` es `twMerge`, que no
   * conoce los nombres del sistema v3 y mete `text-<tamaño>` y `text-<color>` en
   * el mismo grupo. El control positivo de abajo NO es una entrada fabricada: es
   * la lista de clases que producía `<Micro className="text-tinta-media">` antes
   * del arreglo, corrida por el `cn` de verdad.
   */
  const elementos = elementosTipograficos(quieto)
  afirmarIgual(tamanosPerdidos(quieto), [], `los ${elementos} elementos tipográficos conservan su clase de tamaño`)
  afirmarIgual(tamanosPerdidos(animado), [], '  y también con coreografía')
  afirmarIgual(familiasDeTituloPerdidas(quieto), [], '  y ningún titular cayó a la familia de cuerpo — la pérdida que SÍ se ve')
  afirmar(elementos >= 3 * 5, `el contrapeso: ${elementos} elementos con data-nivel inspeccionados`)

  // HEREDADO, se publica y no se afirma en cero (regla 13). Son de piezas
  // compartidas que este lane no toca: `EtiquetaDeSeccion` y el `<Caption>` de
  // `HuecoDeMedio`, los dos con `peso="medio"`. Heredan `font-cuerpo` de la raíz
  // de /v3, así que no se ve — pero el mecanismo es el mismo que sí se vería en
  // un titular. El bound es `<=`: si alguien lo arregla, esto no se pone rojo.
  const heredadas = familiasDeCuerpoPerdidas(quieto)
  console.log(`  ${heredadas.length} pérdidas de \`font-cuerpo\` HEREDADAS de piezas compartidas:`)
  for (const h of new Set(heredadas)) console.log(`    ${h}`)
  afirmar(heredadas.length <= 6, `no las agrega esta sección: ${heredadas.length} sobre ${elementos} elementos`, 'de `EtiquetaDeSeccion` y del marco de medio — el rótulo de sección quedó UNO en S11')
  /**
   * ⚠ ESTOS DOS CONTROLES AFIRMABAN EL DEFECTO, Y SITIO-S7 LO ARREGLÓ.
   *
   * Corrían `cn()` con las clases reales y exigían que el tamaño y la familia
   * DESAPARECIERAN. Era lo correcto mientras el arreglo estuviera fuera del
   * alcance del lane. Ahora la raíz está arreglada, así que se afirma lo
   * contrario con el mismo caso: sobreviven. Si alguien revirtiera el arreglo,
   * esto se pone en rojo — que es para lo que sirve dar vuelta una comprobación
   * en vez de borrarla.
   */
  const CON_COLOR = cn('font-cuerpo', 'text-fluido-micro', 'leading-micro', 'tracking-micro', 'font-normal', 'text-tinta-media uppercase')
  afirmar(CON_COLOR.split(' ').includes('text-fluido-micro'), 'el tamaño sobrevive a un color por `className`', CON_COLOR)
  const CON_FAMILIA = cn('font-cuerpo', 'text-fluido-caption', 'leading-texto', 'tracking-texto', 'font-medio', 'font-codigo uppercase')
  afirmar(CON_FAMILIA.split(' ').includes('font-medio'), '  y el peso sobrevive a otra familia', CON_FAMILIA)
  afirmar(CON_FAMILIA.split(' ').includes('font-codigo'), '  con la familia que gana siendo la última, que es lo correcto')
  controlPositivo('el detector ve un elemento al que le falta el tamaño', '<p data-pieza="texto" data-nivel="micro" class="font-cuerpo leading-micro font-normal text-tinta-media"></p>', (h) => tamanosPerdidos(h).length === 0)
  controlPositivo('y un titular al que le falta font-titulo', '<h2 data-nivel="titulo-xl" class="font-cuerpo text-fluido-titulo-xl"></h2>', (h) => familiasDeTituloPerdidas(h).length === 0)
}
