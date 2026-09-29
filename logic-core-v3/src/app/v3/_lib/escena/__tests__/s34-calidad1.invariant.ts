/**
 * SPRINT CALIDAD 1 — el cierre de ESCENA 8 y el motor, lo que se puede prometer sin navegador. Cada afirmación
 * lleva su control positivo donde el chequeo podría pasar por no mirar nada. Una sección por punto.
 *
 * A1 · el menú no dispara el amanecer: en un viaje de día a día el amanecer no corre (ni de ida ni de vuelta por Tu
 *      panel); desde el primer cuadro, la compuerta del destino con el día entero, sostenido al llegar hasta que el
 *      scroll lo alcanza o vuelve para atrás. Los viajes que cambian de luz, como antes.
 * A2 · el cielo de día: el pintado celeste encendido en el producto (el banco lo apaga), las otras cinco variantes
 *      borradas (código y banderas) y la excepción a la regla monocroma registrada en ESTADO-ESCENA.md.
 * A3 · el obstáculo sin pegado: el modo 6 borrado; el flujo que rodea al logo contra la malla real (un campo del flujo,
 *      más grueso y de más alcance): el aire pasa por la boca de la «c» y por el ojo de la «p»; la que choca se corre
 *      por la cara sin rebote; el empuje tras el cursor también contra la malla real. Lo posado sobre el logo, igual.
 */
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { CAMPO_DEL_FLUJO, campoDelLogo, contornoDeLaMalla, distanciaDelCampo } from '../polvo/campoDelLogo'
import { FISICA, flujoAlrededor } from '../polvo/simulacion'
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

// ── A3 · el obstáculo sin pegado ──────────────────────────────────────────
titulo('A3 · el obstáculo: sin pegado, el flujo por los huecos')
const simulacion = leer('polvo/simulacion.ts')
const fisica = leer('polvo/Fisica.tsx')
const parche = leer('polvo/parche.ts')
/** Restos del pegado (el modo 6): escribirlo, leerlo, soltarlo o desprenderlo. */
const PEGADO = /, 6\.0 \)|modo > 5\.5 && modo < 6\.5|modoDeLaFisica > 5\.5|LOGO_QUIETO|despegue\(|obstaculo\.pegar|contacto\.hasta/
afirmar(!PEGADO.test(simulacion) && !PEGADO.test(parche) && Object.keys(FISICA.obstaculo).join() === 'radio' && Object.keys(FISICA.contacto).join() === 'detecta,queda', 'el pegado (modo 6) se borró: ni se escribe ni se lee, y sus constantes tampoco están')
controlPositivo('el detector VE el pegado de ESCENA 8', 'salida0 = vec4( ( uLogoInverso * vec4( enLaCara, 1.0 ) ).xyz, 6.0 );', (c: string) => !PEGADO.test(c))
afirmar(/const cuenta = \[0, 0, 0, 0, 0, 0\]/.test(fisica) && !/movimientoDelLogo/.test(fisica), '  el banco cuenta seis modos, y ya no se mide cuánto se mueve el logo (sólo servía para soltar las pegadas)')
// Sin rebote: al tocar la cara sólo se quita lo que entra (la velocidad relativa a la superficie); nada sale para afuera.
afirmar(/v \+= n \* max\( 0\.0, entra \);/.test(simulacion) && /v -= n \* min\( 0\.0, dot\( v - velocidadDelLogo\( p \), n \) \);/.test(simulacion), 'la que llega a la cara se corre por ella, sin rebote: sólo se le quita lo que entra')
// Lo posado sobre el logo (aprobado) sigue, con el campo fino.
afirmar(/if \( n\.y > \$\{FISICA\.logo\.cara\.toFixed\(2\)\} \)/.test(simulacion) && /float d = campoDelLogo\( q \);/.test(simulacion), '  el polvo que se posa SOBRE el logo sigue igual (contra el campo fino de la malla real)')

// El flujo, contra la malla real: una «c» de prueba como la de s33 (extruida por three, con bisel; la boca a la derecha).
const [RC, rc, hc] = [2, 1.26, 0.28]
const bocaC = Math.PI / 6
const formaC = new THREE.Shape()
formaC.absarc(0, 0, RC, bocaC, 2 * Math.PI - bocaC, false)
formaC.absarc(0, 0, rc, 2 * Math.PI - bocaC, bocaC, true)
const mallaC = new THREE.ExtrudeGeometry(formaC, { depth: 2 * hc, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 5, curveSegments: 64 })
mallaC.translate(0, 0, -hc)
const contornoC = contornoDeLaMalla([{ posiciones: mallaC.getAttribute('position').array, indices: mallaC.index?.array ?? null, matriz: new THREE.Matrix4() }])
mallaC.dispose()
const flujo = campoDelLogo(contornoC, CAMPO_DEL_FLUJO)
const fino = campoDelLogo(contornoC)
type Distancia = (q: readonly [number, number, number]) => number
const delFlujo: Distancia = (q) => distanciaDelCampo(flujo, q)
const delFino: Distancia = (q) => distanciaDelCampo(fino, q)
/** El anillo entero de ESCENA 7 (las formas de siempre): la boca de la «c», una pared. */
const anilloEntero: Distancia = (q) => {
  const d2 = Math.abs(Math.hypot(q[0], q[1]) - (RC + rc) / 2) - (RC - rc) / 2
  const dz = Math.abs(q[2]) - hc
  return Math.hypot(Math.max(d2, 0), Math.max(dz, 0)) + Math.min(Math.max(d2, dz), 0)
}
/** El aire que resulta en un punto (el de afuera más lo que el logo le hace), con la normal por diferencias centradas. */
const aireEn = (d: Distancia, q: readonly [number, number, number], aire: [number, number, number]): number[] => {
  const e = CAMPO_DEL_FLUJO.celda
  const g = [0, 1, 2].map((k) => d(q.map((v, i) => (i === k ? v + e : v)) as [number, number, number]) - d(q.map((v, i) => (i === k ? v - e : v)) as [number, number, number]))
  const l = Math.hypot(g[0], g[1], g[2]) || 1
  const pert = flujoAlrededor(aire, [g[0] / l, g[1] / l, g[2] / l], d(q))
  return aire.map((a, k) => a + pert[k])
}
// En la boca (un poco afuera del eje, donde el campo tiene pendiente), con el aire entrando por ella.
const enLaBocaC: [number, number, number] = [(RC + rc) / 2 + 0.1, 0.06, 0]
const entrando: [number, number, number] = [-2, 0, 0]
const pasaPorLaBoca = (d: Distancia): boolean => aireEn(d, enLaBocaC, entrando)[0] < 0.5 * entrando[0]
afirmar(pasaPorLaBoca(delFlujo), 'el aire pasa por la boca de la «c»: con la malla real, entra con más de la mitad de su velocidad', `${aireEn(delFlujo, enLaBocaC, entrando)[0].toFixed(2)} u/s de ${String(entrando[0])}`)
controlPositivo('el detector VE la boca cerrada de las formas de siempre (el anillo entero)', anilloEntero, pasaPorLaBoca)
// El hueco de adentro (como el ojo de la «p»): abierto, lejos de las paredes.
const abierto = (d: Distancia): boolean => d([0, 0, 0]) > 1
afirmar(abierto(delFlujo), '  el hueco de adentro (como el ojo de la «p») está abierto', `a ${delFlujo([0, 0, 0]).toFixed(2)} u de la pared`)
controlPositivo('el detector VE un hueco tapado', (q: readonly [number, number, number]) => Math.hypot(q[0], q[1]) - RC, abierto)
// Alcance: donde el aire ya empieza a doblar el campo del flujo sabe la distancia; el fino no (su tope es 1,2 u). Abajo
// a la izquierda, adentro de la caja del campo fino y a más de 1,2 u del contorno.
const enDiagonal: [number, number, number] = [-2.4, -2.4, 0]
const lejosDeVerdad = Math.hypot(2.4, 2.4) - RC
const sabeLejos = (d: Distancia): boolean => Math.abs(d(enDiagonal) - lejosDeVerdad) < 0.1
afirmar(sabeLejos(delFlujo), '  el campo del flujo sabe la distancia hasta donde el aire empieza a doblar', `a ${lejosDeVerdad.toFixed(2)} u da ${delFlujo(enDiagonal).toFixed(2)} (el fino, ${delFino(enDiagonal).toFixed(2)}: tope de 1,2)`)
controlPositivo('el detector VE el campo fino (topado a 1,2 u)', delFino, sabeLejos)
// Cableado: el flujo lee el campo del flujo; la física lo hornea en otro momento libre; tras el cursor, la malla real.
const rodeoA3 = /vec3 alrededorDelLogo\( vec3 p, vec3 aire \) \{[\s\S]*?\n\}/.exec(simulacion)?.[0] ?? ''
afirmar(/float d = flujoDelLogo\( q \);/.test(rodeoA3) && /normalDelFlujo\( q \)/.test(rodeoA3) && /campoDelLogo\(contorno, CAMPO_DEL_FLUJO\)/.test(fisica) && /publicarElFlujo\(flujo\)/.test(fisica) && /\.\.\.FLUJO_EN_VIVO/.test(fisica), 'el flujo de la simulación lee el campo del flujo, que la física hornea y publica')
afirmar(/#ifdef AIRE_FISICA\s*vec3 fuera = afueraDelCampo\( enElMundo, HOLGURA_TRAS_EL_CURSOR \);/.test(parche) && /CAMPO_EN_VIVO, \{ uTiempo/.test(parche), '  tras el cursor, la mota empujada contra el logo se corre a su cara real (la boca y el ojo, abiertos)')

cerrar('s34-calidad1')
