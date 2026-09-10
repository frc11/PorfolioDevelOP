/**
 * PIEZAS DE `s5-contenido.invariant.tsx` — sus dos últimos bloques.
 *
 * Módulo auxiliar: acá viven §7 (el pedido de prosa, sin entradas colgadas) y
 * §8 (los nombres que SÍ son verdad). Salieron del invariante en B12 §4, cuando
 * la llave del contenido inventado lo cruzó las 300 líneas. **Se mudó el
 * bloque: no se tocó una afirmación ni un control positivo.**
 *
 * El corte es por tema y no por tamaño: los dos bloques miran el PEDIDO y la
 * VERDAD, no los detectores de cifras, que son el corazón del invariante y se
 * quedan allá.
 */

import { MODULOS_DE_S5 as REGISTRO } from './s5-modulos'
import { NOMBRES_REALES } from '../../_secciones/_contrato/escaneo'
import { entradasColgadas, pedidoPorClase, type EntradaDePedido } from '../../_secciones/_contrato/pedido'

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

/** Los dos bloques, en orden. Recibe el renderizador del invariante para no
 *  montar las secciones dos veces. */
export function afirmarElPedidoYLasVerdades(marcarQuieto: (indice: number) => string): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('7 · El pedido de prosa: declarado, y sin entradas colgadas')

  for (const { id, contenido, pedido } of REGISTRO) {
    afirmarIgual(
      entradasColgadas(contenido, pedido),
      [],
      `\`${id}\` — cada entrada del pedido apunta a una ruta que existe en el contenido`,
    )
    afirmar(pedido.length > 0, `  y declara ${pedido.length} entrada(s) de pedido`)
  }

  controlPositivo(
    'el detector ve una entrada del pedido que apunta a una ruta inexistente',
    { contenido: { titular: 'x' }, pedido: [{ ruta: 'bajada', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'la bajada', formato: 'texto plano' }] },
    (caso: { contenido: unknown; pedido: readonly EntradaDePedido[] }) =>
      entradasColgadas(caso.contenido, caso.pedido).length === 0,
  )

  console.log('\n  ── EL PEDIDO A FRANCO — prosa y datos declarados ──')
  for (const { id, pedido } of REGISTRO) {
    for (const [clase, entradas] of pedidoPorClase(pedido)) {
      for (const e of entradas) console.log(`  ${id.padEnd(15)} ${clase.padEnd(10)} ${e.ruta.padEnd(28)} ${e.que}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('8 · Los nombres que SÍ son verdad sobreviven')

  /**
   * La regla no es "no escribir nada": es no inventar. Lo verdadero se usa, y hay
   * que comprobar que sigue estando — un escáner demasiado celoso que empujara a
   * borrar los nombres reales convertiría una sección honesta en una vacía.
   */
  /**
   * ⚠️ **LOS NOMBRES DE CLIENTE SE DERIVAN (V3-D).** Estaban escritos acá, uno
   * por fila, y lo mismo pasaba en otros tres instrumentos: cuatro copias del
   * mismo trío. Por eso `Matsu Automotores` —que NO es un cliente: ese trabajo no
   * se hizo— pasó cinco revisiones en verde. Las copias no se pueden contradecir
   * entre sí, así que ninguna comprobación estaba comprobando nada sobre la
   * realidad: sólo que las cuatro decían lo mismo.
   *
   * Ahora salen de `NOMBRES_REALES`, que es la única lista. Eso NO prueba que los
   * nombres sean reales —ningún instrumento puede probarlo— pero convierte
   * corregir la realidad en una línea en vez de nueve, y deja un solo lugar donde
   * una persona tiene que mirar y decir "sí, ése es cliente".
   */
  const VERDADES: readonly { texto: string; donde: string }[] = [
    ...NOMBRES_REALES.map((texto) => ({ texto, donde: 'trabajos' })),
    { texto: 'Tucumán', donde: 'quienes-somos' },
  ]

  for (const { texto, donde } of VERDADES) {
    const indice = REGISTRO.findIndex((m) => m.id === donde)
    const html = marcarQuieto(indice)
    afirmar(html.includes(texto), `\`${texto}\` aparece en \`${donde}\` — es verdad y se usa`)
  }

  controlPositivo(
    'el buscador de verdades vería una ausente',
    '<section>sin nombres</section>',
    (html: string) => VERDADES.every((v) => html.includes(v.texto)),
  )

}
