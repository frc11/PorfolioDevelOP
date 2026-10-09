/**
 * PULIDO 9 — el invariante: npm run test:s60-pulido-9
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   H1 · el polvo posado se vuelve a levantar: con la rueda (muescas con pausas cortas) el frente del despertar ya no se apaga,
 *        y a los N s la altura media y la dispersión vuelven a las del polvo suspendido; reversible.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-9.md`.
 */
import { readFileSync } from 'node:fs'

import { FLOOR_Y } from '../escena/probeScene'
import { NUNCA, POSARSE, avanzarElPolvoEn, frenteInicial, polvoInicial, tomarElFrente, type EstadoDelPolvoVivo, type FrenteDelPolvo } from '../escena/polvo/posarse'
import { FISICA, SIMULACION_DEL_POLVO_GLSL } from '../escena/polvo/simulacion'
import { POLVO_PAREJO, posicionesDelPolvoParejo } from '../escena/polvo/volumen'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('H1 · El polvo posado se vuelve a levantar')

// La máquina de la quietud es la de verdad (`avanzarElPolvoEn`); lo que la escena le pasa a la simulación (el despertar y su
// origen) sale del cableado de `Fisica.tsx`, fijado por texto abajo. Cada mota sigue, en la vertical, las reglas del shader con
// sus constantes: se suelta del aire con la quietud, cae al piso a tiempo, la levanta el frente (la regla `despierta`, fijada
// por texto) y sube a su lugar; pasado el soplo, vuelve al aire.
type Cableado = (e: EstadoDelPolvoVivo, f: FrenteDelPolvo) => { readonly desperto: number; readonly origen: readonly number[] }
const cableadoDeHoy: Cableado = (e, f) => {
  if (e.desperto - e.antes > POSARSE.empiezaS) tomarElFrente(f, e)
  return { desperto: f.desperto, origen: f.origen }
}
/** El de antes: el despertar sólo en el cuadro en que era el último, si no uno de nunca. */
const cableadoDeAntes: Cableado = (e) => ({ desperto: e.desperto - e.antes > POSARSE.empiezaS ? e.desperto : -1e9, origen: e.origen })

const DT = 1 / 30
const L = POLVO_PAREJO.lado
// La cámara mira hacia −z; la caja va delante (como `libre` del shader) y el despertar del scroll sale 6 u delante de ella.
const CAMARA = [0, FLOOR_Y + 3, 0] as const
const CENTRO = [0, CAMARA[1], -(L / 2 - POLVO_PAREJO.atras)] as const
const ORIGEN = [0, FLOOR_Y, -6] as const
const posiciones = posicionesDelPolvoParejo()
const N = posiciones.length / 3
const azar = (k: number): number => {
  const s = Math.sin(k * 12.9898 + 4.1414) * 43758.5453
  return s - Math.floor(s)
}
const [fx, fy, fz] = [new Float32Array(N), new Float32Array(N), new Float32Array(N)]
const pisoDe = new Float32Array(N)
for (let k = 0; k < N; k += 1) {
  fx[k] = CENTRO[0] + posiciones[k * 3]
  fy[k] = CENTRO[1] + posiciones[k * 3 + 1]
  fz[k] = CENTRO[2] + posiciones[k * 3 + 2]
  const r = azar(k) * 7.31
  pisoDe[k] = FLOOR_Y + 0.02 + (r - Math.floor(r)) * POSARSE.alturaPosada
}
// Las que el aire dibuja (su lugar arriba del piso del volumen): su altura y su dispersión en el aire son las de referencia.
const visibles = [...Array(N).keys()].filter((k) => fy[k] > POLVO_PAREJO.piso)
const estadistica = (alturas: (k: number) => number): { media: number; dispersion: number } => {
  let [s, s2] = [0, 0]
  for (const k of visibles) {
    s += alturas(k)
    s2 += alturas(k) ** 2
  }
  const media = s / visibles.length
  return { media, dispersion: Math.sqrt(Math.max(0, s2 / visibles.length - media * media)) }
}
const SUSPENDIDO = estadistica((k) => fy[k])

/** Un guion: cuántos segundos y si en cada instante hay movimiento (la rueda: una muesca de 0,1 s cada 0,6 s). */
interface Tramo {
  readonly s: number
  readonly mueve: (t: number) => boolean
}
const QUIETO: Tramo = { s: 15, mueve: () => false }
const RUEDA_S = 10
const RUEDA: Tramo = { s: RUEDA_S, mueve: (t) => t % 0.6 < 0.1 }

/** Corre el guion; devuelve la altura media y la dispersión al final de cada tramo. */
function simular(cableado: Cableado, guion: readonly Tramo[]): { media: number; dispersion: number }[] {
  const modo = new Uint8Array(N)
  const y = Float32Array.from(fy)
  const desde = new Float32Array(N)
  const polvo: EstadoDelPolvoVivo = { ...polvoInicial(0), origen: [0, 0, 0] }
  const frente = frenteInicial()
  let reloj = 0
  const salida: { media: number; dispersion: number }[] = []
  for (const tramo of guion) {
    for (let t = 0; t < tramo.s; t += DT) {
      reloj += DT
      avanzarElPolvoEn(polvo, reloj, tramo.mueve(t) ? ORIGEN : null, false)
      const u = cableado(polvo, frente)
      const quieta = reloj - polvo.quieto
      for (let k = 0; k < N; k += 1) {
        const retraso = azar(k) * POSARSE.desparejoS
        const piso = pisoDe[k]
        const despierta = u.desperto > desde[k] && reloj >= u.desperto + Math.hypot(fx[k] - u.origen[0], fz[k] - u.origen[2]) / POSARSE.velocidad
        if (modo[k] === 0) {
          if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
          else y[k] = fy[k]
          continue
        }
        if (modo[k] === 1 || modo[k] === 2) {
          if (despierta) [modo[k], desde[k]] = [5, reloj]
          else if (modo[k] === 1) {
            const falta = Math.max(0.6, POSARSE.asentadoS + retraso * 0.3 - quieta)
            y[k] -= Math.max(FISICA.caida.minima, (y[k] - piso) / falta) * DT
            if (y[k] <= piso) [y[k], modo[k]] = [piso, 2]
            continue
          } else continue
        }
        // Levantada: sube a su lugar (con su constante y su tope) y, pasado el soplo, si llegó vuelve al aire.
        const lugar = Math.max(fy[k], piso)
        const hacia = Math.max(-FISICA.vuelta.tope, Math.min(FISICA.vuelta.tope, (lugar - y[k]) / FISICA.vuelta.s))
        y[k] = Math.max(piso, y[k] + hacia * DT)
        const pasado = reloj - desde[k] - (FISICA.soplo.s + azar(k) * FISICA.soplo.azar)
        if (pasado <= 0) continue
        const llego = Math.abs(y[k] - fy[k]) < FISICA.vuelta.entrega || fy[k] < POLVO_PAREJO.piso || pasado > FISICA.vuelta.esperaS
        if (llego) modo[k] = 0
        else if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
      }
    }
    salida.push(estadistica((k) => (modo[k] === 0 ? fy[k] : y[k])))
  }
  return salida
}

// 1 · Con la rueda vuelve: posado (15 s quieto) → la rueda → a los RUEDA_S, la media y la dispersión del polvo suspendido.
// Y otra vez (reversible).
const GUION = [QUIETO, RUEDA, QUIETO, RUEDA] as const
const vuelve = (c: Cableado): boolean => {
  const [posado, levantado, otraVezPosado, otraVezLevantado] = simular(c, GUION)
  const enElPiso = (e: { media: number }): boolean => e.media < FLOOR_Y + 0.3
  const suspendido = (e: { media: number; dispersion: number }): boolean => Math.abs(e.media - SUSPENDIDO.media) < 0.3 && Math.abs(e.dispersion - SUSPENDIDO.dispersion) < 0.3
  return enElPiso(posado) && suspendido(levantado) && enElPiso(otraVezPosado) && suspendido(otraVezLevantado)
}
const medido = simular(cableadoDeHoy, GUION).map((e) => `${e.media.toFixed(2)} ± ${e.dispersion.toFixed(2)}`).join(' → ')
afirmar(vuelve(cableadoDeHoy), `1 · posado, con la rueda se levanta y a los ${String(RUEDA_S)} s tiene la altura media y la dispersión del polvo suspendido; otra vez quieto se posa y vuelve igual`, `suspendido ${SUSPENDIDO.media.toFixed(2)} ± ${SUSPENDIDO.dispersion.toFixed(2)}; posado → rueda → posado → rueda: ${medido}`)
controlPositivo('1 · el detector VE el código de antes: la muesca siguiente apaga el frente y lo lejano queda en el piso', cableadoDeAntes, vuelve)

// 2 · El cableado de la escena es ése: el frente se toma del despertar que encontró el polvo posado y es lo que lee la
// simulación (el despertar, su origen y el remolino). Y la regla del shader con la que llega a cada mota es la del modelo.
const fisica = leer('_lib/escena/polvo/Fisica.tsx')
const cableado = (c: string): boolean =>
  /const conRemolino = despertar\.desperto - despertar\.antes > POSARSE\.empiezaS\n\s*\/\/[^\n]*\n\s*if \(conRemolino\) tomarElFrente\(m\.frente, despertar\)/.test(c) &&
  c.includes('p.desperto = m.frente.desperto\n') &&
  c.includes('p.origen = m.frente.origen\n') &&
  c.includes('p.remolino = m.frente.delCursor ? 1 : 0') &&
  !c.includes('-1e9')
afirmar(cableado(fisica) && /bool despierta = uDesperto > desde && uReloj >= uDesperto \+ distance\( p\.xz, uOrigen\.xz \) \/ \$\{POSARSE\.velocidad\.toFixed\(1\)\};/.test(leer('_lib/escena/polvo/simulacion.ts')), '2 · la escena le pasa a la simulación el frente del último despertar con polvo posado; el shader lo hace llegar a cada mota como el modelo')
controlPositivo('2 · el detector VE el cableado de antes (un despertar de nunca fuera de su cuadro)', fisica.replace('p.desperto = m.frente.desperto\n', 'p.desperto = conRemolino ? despertar.desperto : -1e9\n'), cableado)
const frente = frenteInicial()
const estado: EstadoDelPolvoVivo = { ...polvoInicial(0), desperto: 9, antes: 2, origen: [1, 2, 3], delCursor: true }
tomarElFrente(frente, estado)
estado.origen[0] = 7
afirmar(frenteInicial().desperto === -NUNCA && frente.desperto === 9 && frente.origen.join() === '1,2,3' && frente.delCursor, '  el frente empieza en nunca y copia el despertar (el origen se copia, no se guarda)')

// 3 · Ninguna levantada queda así mientras hay movimiento: la de cerca de las caras de la caja, cuando llegó, se apaga en su
// lugar (su peso baja) y recién apagada es del aire; con la quietud se posa antes, como siempre.
const sim = SIMULACION_DEL_POLVO_GLSL
const vuelveDeCerca = (c: string): boolean => {
  const posa = c.indexOf(`if ( uPosarse > 0.5 && quieta > ${POSARSE.empiezaS.toFixed(1)} + retraso ) {\n\t\t\tsalida0 = vec4( p, modoConPeso( 1.0, peso, dt ) );`)
  const apaga = c.indexOf(`\t\tif ( llego ) {\n\t\t\tif ( peso <= dt / ${FISICA.fundido.saleS.toFixed(2)} ) {\n\t\t\t\tsalida0 = vec4( p - f, modoConPeso( 0.0, peso, dt ) );`)
  return posa > 0 && apaga > posa && c.slice(apaga).includes('salida0 = vec4( p, 5.0 + modoConPeso( 0.0, peso, dt ) );')
}
afirmar(vuelveDeCerca(sim), '3 · la levantada de cerca de las caras vuelve al aire cuando llegó, apagándose (con la quietud se posa antes)', 'medido en Portfolio de noche después de 15 s de rueda: antes 5.125 de 14.000 seguían levantadas; ahora 0')
controlPositivo('3 · el detector VE la levantada de cerca de las caras sin salida', sim.replace(/\t\tif \( llego \) \{[\s\S]*?\n\t\t\}\n\t\}/, '\t}'), vuelveDeCerca)

cerrar('s60-pulido-9')
