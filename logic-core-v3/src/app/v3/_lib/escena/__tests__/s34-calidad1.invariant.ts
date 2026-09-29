/**
 * SPRINT CALIDAD 1 — el cierre de ESCENA 8 y el motor, lo que se puede prometer sin navegador. Cada afirmación
 * lleva su control positivo donde el chequeo podría pasar por no mirar nada. Una sección por punto.
 *
 * A1 · el menú no dispara el amanecer: en un viaje de día a día el amanecer no corre (ni de ida ni de vuelta por Tu
 *      panel); desde el primer cuadro, la compuerta del destino con el día entero, sostenido al llegar hasta que el
 *      scroll lo alcanza o vuelve para atrás. Los viajes que cambian de luz, como antes.
 * A2 · el cielo de día: el pintado celeste encendido en el producto (el banco lo apaga), las otras cinco variantes
 *      borradas (código y banderas) y la excepción a la regla monocroma registrada en ESTADO-ESCENA.md.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { AMANECER, SOLTAR_LA_LLEGADA, avanceDelCuadro, avanceDelScroll, compuertaEnLaLlegada, pasoDelAmanecer, type CuadroDelAmanecer, type MemoriaDelAmanecer } from '../amanecer/linea'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

// ── A1 · el menú no dispara el amanecer ───────────────────────────────────
titulo('A1 · un viaje de día a día no dispara el amanecer')
const ALTO = 812
const DT = 1 / 60
const cuadro = (c: Partial<CuadroDelAmanecer>): CuadroDelAmanecer => ({ recien: false, carga: false, quieto: false, viaje: false, oculto: false, pie: false, ...c })

/**
 * Un viaje del hero a «Por qué develOP» a 375 (medido: la llegada pide 0,851): 120 cuadros, con el borde de Tu panel
 * que sube de abajo del cuadro hasta su lugar en el destino. La compuerta de la escena abre a mitad de camino (cuando
 * Tu panel deja ver la sala); la del destino, desde el primer cuadro. Devuelve el avance mostrado en cada cuadro del
 * viaje y en los 60 de después, quieto en la llegada.
 */
type Regla = 'hoy' | 'antes'
function viajeAlFinal(regla: Regla): number[] {
  const pieEnElDestino = ALTO * AMANECER.visible - 0.851 * ALTO * (AMANECER.visible - AMANECER.hasta)
  const m: MemoriaDelAmanecer = { avance: 0, entero: false, pedidoAlLlegar: 0 }
  let activo = false
  const avances: number[] = []
  for (let i = 0; i <= 180; i += 1) {
    const viajando = i <= 120
    const pie = viajando ? ALTO * 3 + (pieEnElDestino - ALTO * 3) * (i / 120) : pieEnElDestino
    const abierta = pie < ALTO * AMANECER.visible
    const pedido = abierta ? avanceDelScroll(pie, ALTO) : 0
    // La regla de hoy: en el viaje, la compuerta del destino; la de antes (ESCENA 8): la de la escena, y el avance va al pedido.
    const ahora: boolean = regla === 'hoy' && viajando ? compuertaEnLaLlegada(pieEnElDestino, ALTO) : abierta || (activo && pie < ALTO)
    const recien = ahora && !activo
    activo = ahora
    if (!activo) {
      m.avance = 0
      m.entero = false
    } else if (regla === 'hoy') pasoDelAmanecer(m, viajando, pedido, DT, cuadro({ recien, viaje: viajando }))
    else m.avance = avanceDelCuadro(m.avance, pedido, DT, cuadro({ recien, viaje: viajando }))
    avances.push(activo ? m.avance : 1)
  }
  return avances
}
/** Sin evento: el amanecer nunca queda a medias (sólo el día entero, o apagado, que también es el día). */
const sinEvento = (avances: readonly number[]): boolean => avances.every((a) => a === 1)
afirmar(sinEvento(viajeAlFinal('hoy')), 'del hero a «Por qué develOP» a 375: el día entero en todo el viaje y quieto al llegar', `mínimo ${Math.min(...viajeAlFinal('hoy')).toFixed(3)}`)
controlPositivo('el detector VE la regla de ESCENA 8 (el amanecer corre con el scroll del viaje)', 'antes' as Regla, (r) => sinEvento(viajeAlFinal(r)))

// Después de llegar: sostenido mientras el scroll no vuelva para atrás de la llegada; volviendo, la vuelta de siempre.
const llegado = (): MemoriaDelAmanecer => {
  const m: MemoriaDelAmanecer = { avance: 0, entero: false, pedidoAlLlegar: 0 }
  pasoDelAmanecer(m, true, 0.851, DT, cuadro({ viaje: true }))
  return m
}
const bajando = llegado()
for (const p of [0.86, 0.9, 0.97, 1, 1]) pasoDelAmanecer(bajando, false, p, DT, cuadro({}))
afirmar(bajando.avance === 1 && !bajando.entero, '  bajando desde la llegada sigue entero, y al alcanzarlo el scroll (1) se suelta sin moverse')
const subiendo = llegado()
pasoDelAmanecer(subiendo, false, 0.851 - SOLTAR_LA_LLEGADA * 2, DT, cuadro({}))
afirmar(!subiendo.entero && subiendo.avance < 1 && subiendo.avance > 1 - DT / AMANECER.minimoS - 1e-9, '  volviendo para atrás de la llegada se suelta y corre la vuelta con la velocidad tope de siempre')
const quieto = llegado()
for (let i = 0; i < 300; i += 1) pasoDelAmanecer(quieto, false, 0.851, DT, cuadro({}))
afirmar(quieto.avance === 1, '  quieto en la llegada (5 s) no corre para atrás', `avance ${quieto.avance.toFixed(3)}`)

// La compuerta del destino: prendida con Tu panel arriba del cuadro, apagada con Tu panel todavía abajo.
afirmar(compuertaEnLaLlegada(-200, ALTO) && !compuertaEnLaLlegada(ALTO * 2.5, ALTO) && !compuertaEnLaLlegada(ALTO * AMANECER.visible, ALTO), '  la compuerta del destino: prendida si Tu panel deja ver la sala allá, apagada si no')

// Cableado: el componente usa la regla (y sólo en los viajes de día a día: los que llevan luz).
const componente = leer('amanecer/Amanecer.tsx')
afirmar(/const luzDelViaje = viajeEnCurso\(\)\?\.luz \?\? null/.test(componente) && /compuertaEnLaLlegada\(bloque\.tuPanel\.pie - \(luzDelViaje\.y1 - window\.scrollY\), bloque\.alto\)/.test(componente) && /pasoDelAmanecer\(m, enLaLlegada !== null,/.test(componente), '  el componente la usa: la compuerta del destino con Tu panel corrido allá, sólo en los viajes que llevan luz (de día a día)')
afirmar(/viaje: viajeEnCurso\(\) !== null/.test(componente), '  los viajes que cambian de luz siguen con la regla de antes')

// ── A2 · el cielo de día: pintado celeste ─────────────────────────────────
titulo('A2 · el cielo de día: el pintado celeste, encendido')
afirmar(ENTORNO.cieloDeDia && !BASE_LIMPIA.cieloDeDia && !entornoPedido('producto,cielo-dia=no').cieloDeDia && entornoPedido('producto').cieloDeDia, 'encendido en el producto; el banco lo apaga con `cielo-dia=no` (la hoja antes/después)')
controlPositivo('el detector VE un producto sin el cielo', { ...ENTORNO, cieloDeDia: false }, (e) => e.cieloDeDia)
const delCielo = [leer('cieloDeDia/nubes.ts'), leer('cieloDeDia/CieloDeDia.tsx'), leer('entorno.ts')]
/** Restos de las otras cinco en el código (no en la prosa): sus variantes, el tono mono, las funciones y el pedido por nombre. */
const RESTOS = /nubesDeBloques|nubesDePolvo|'particulas'|'bloques'|'mono'|mono:|TonoDelCielo|VarianteDelCielo|CIELO_PINTADO|PedidoDelCielo|cielo-dia=pintado/
afirmar(delCielo.every((c) => !RESTOS.test(c)) && Object.keys(PRUEBAS_APAGADAS).length === 0, 'las otras cinco se borraron: ni el código ni las banderas (y no queda ninguna prueba)')
controlPositivo('el detector VE un resto de ESCENA 8', "const [variante, tono] = pedido.split('-') as [VarianteDelCielo, 'mono']", (c: string) => !RESTOS.test(c))
const estado = readFileSync(path.join(process.cwd(), 'docs/rediseno/ESTADO-ESCENA.md'), 'utf8')
/** La excepción, escrita donde el próximo sprint la lee: el celeste, la regla monocroma y que está aprobada. */
const registrada = (doc: string): boolean => /excepci[oó]n aprobada/i.test(doc) && /celeste/.test(doc) && /monocrom/.test(doc)
afirmar(registrada(estado), 'la excepción a la regla monocroma está registrada en ESTADO-ESCENA.md (para que nadie la «corrija»)')
controlPositivo('el detector VE un estado sin la excepción', estado.replace(/excepci[oó]n aprobada/gi, 'prueba'), registrada)

cerrar('s34-calidad1')
