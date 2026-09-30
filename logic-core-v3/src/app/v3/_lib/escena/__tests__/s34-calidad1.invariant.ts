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
 * B0 · el instrumento: el perfil de la GPU sólo existe con banco, y lo que se dibuja tiene nombre (el perfil agrupa
 *      por nombre: sin él, una pasada nueva aparece como «(sin nombre)» y nadie sabe qué cuesta).
 * B1 · precompilar: la escena entera compilada al arrancar (también lo invisible) y calentada con un dibujo de un
 *      píxel; el lazo de los rayos con tope uniforme; los campos del logo horneados de a poco, con el mismo resultado.
 * B2 · cero reservas por cuadro: ningún `useFrame` de la escena reserva (clones, vectores, arreglos, objetos) salvo
 *      con banco o en el primer cuadro; las variantes que escriben en un objeto fijo dan lo mismo que las puras; ni
 *      la atadura al scroll ni el tono del menú llaman a React en cada cuadro sin cambio.
 * B3 · independiente del framerate: la física del polvo integra con Euler exponencial (la misma trayectoria a 60, 75,
 *      120 y 144 Hz); el resto de lo que corre por cuadro ya era exacto en el tiempo (amortiguadores exponenciales,
 *      relojes, pasos fijos) y queda afirmado.
 * B4 · nada aparece ni se va de golpe: la visibilidad del polvo es continua al pasar del aire a suelta y de vuelta (el
 *      peso de la mota suelta que la simulación guarda en el modo), la repetición de la caja queda siempre apagada en
 *      el aire, y el remolino ya no lanza las motas de abajo del piso.
 * B5 · los rayos del amanecer a media resolución: su escena aparte en un búfer de la mitad del lienzo por lado (medio
 *      punto flotante), sumada por un cuadrado con el mismo aditivo; precompilada y calentada con el resto.
 */
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { CAMPO_DEL_FLUJO, campoDeAPoco, campoDelLogo, contornoDeLaMalla, distanciaDelCampo } from '../polvo/campoDelLogo'
import { FISICA, PESO_EN_EL_MODO, flujoAlrededor, pasoDelAire } from '../polvo/simulacion'
import { HACES } from '../amanecer/haces'
import { AMANECER, SOLTAR_LA_LLEGADA, avanceDelCuadro, avanceDelScroll, compuertaEnLaLlegada, momentoEn, pasoDelAmanecer, type CuadroDelAmanecer, type MemoriaDelAmanecer, type MomentoVivo } from '../amanecer/linea'
import { avanzarElPolvo, avanzarElPolvoEn, polvoInicial, type EstadoDelPolvoVivo } from '../polvo/posarse'
import { bloqueVivo, medirElBloqueOpaco, medirElBloqueOpacoEn } from '../nocheDisparada'
import { medirLasSecciones, medirLasSeccionesEn } from '../extensionDeLasSecciones'
import { avanzarElPulso, pulsoInicial } from '../entorno/maquinaDelPulso'
import { avanzarElEncendido, encendidoInicial } from '../entorno/encendido'

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
afirmar(/viaje = viajeEnCurso\(\) !== null/.test(componente), '  los viajes que cambian de luz siguen con la regla de antes')

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
afirmar(/float d = flujoDelLogo\( q \);/.test(rodeoA3) && /normalDelFlujo\( q \)/.test(rodeoA3) && /campoDeAPoco\(contorno, CAMPO_DEL_FLUJO\)/.test(fisica) && /publicarElFlujo\(f\)/.test(fisica) && /\.\.\.FLUJO_EN_VIVO/.test(fisica), 'el flujo de la simulación lee el campo del flujo, que la física hornea y publica')
afirmar(/#ifdef AIRE_FISICA\s*vec3 fuera = afueraDelCampo\( enElMundo, HOLGURA_TRAS_EL_CURSOR \);/.test(parche) && /CAMPO_EN_VIVO, \{ uTiempo/.test(parche), '  tras el cursor, la mota empujada contra el logo se corre a su cara real (la boca y el ojo, abiertos)')

// ── B0 · el instrumento ───────────────────────────────────────────────────
titulo('B0 · el instrumento: el perfil de la GPU, sólo con banco, y todo lo que se dibuja con nombre')
const perfilGpu = leer('gpu/PerfilDeLaGpu.tsx')
afirmar(/if \(!hayBanco\(\)\) return undefined/.test(perfilGpu) && /<PerfilDeLaGpu \/>/.test(leer('ProbeStage.tsx')), 'el perfil de la GPU se monta en la escena y sin banco no hace nada')
/** Lo que se dibuja, por archivo, y el nombre con que el perfil lo agrupa. */
const NOMBRES: readonly (readonly [string, string])[] = [
  ['ProbeStage.tsx', 'name="logo"'], ['ProbeStage.tsx', 'name="polvo"'], ['ProbeStage.tsx', 'name="bokeh"'], ['StudioFloor.tsx', 'name="piso"'],
  ['ContactOcclusion.tsx', 'name="contacto"'], ['MoireScreen.tsx', "'trama gruesa' : 'trama fina'"], ['MoireScreen.tsx', 'name="zócalo"'], ['entorno/Haz.tsx', 'name="haz"'],
  ['entorno/Pulso.tsx', 'name="pulso"'], ['estrellas/Estrellas.tsx', "puntos.name = 'estrellas'"], ['estrellas/Estrellas.tsx', "cupula.name = 'vía láctea'"], ['estrellas/Fugaz.tsx', "linea.name = 'fugaz'"],
  ['formacion/armado.ts', "'formación · primeras filas' : 'formación · siluetas'"], ['cieloDeDia/CieloDeDia.tsx', "cupula.name = 'cielo de día'"], ['piso/PisoVivo.tsx', "bloques.name = 'piso vivo'"], ['amanecer/haces.ts', "malla.name = 'rayos del amanecer'"], ['amanecer/haces.ts', "composicion.name = 'rayos del amanecer · composición'"],
]
const conNombre = (lista: readonly (readonly [string, string])[]): boolean => lista.every(([a, n]) => leer(a).includes(n))
afirmar(conNombre(NOMBRES), '  todo lo que se dibuja tiene nombre (el perfil de la GPU agrupa por nombre)', `${String(NOMBRES.length)} nombres en ${String(new Set(NOMBRES.map(([a]) => a)).size)} archivos`)
controlPositivo('el detector VE un objeto sin nombre', [...NOMBRES, ['piso/PisoVivo.tsx', "bloques.name = 'otro'"] as const], conNombre)

// ── B1 · precompilar ──────────────────────────────────────────────────────
titulo('B1 · precompilar: nada se compila la primera vez que aparece')
const precompilar = leer('gpu/Precompilar.tsx')
afirmar(/<Precompilar logoMaterialRef=\{logoMaterialRef\} \/>/.test(leer('ProbeStage.tsx')) && /gl\.compileAsync\(escena, camara\)/.test(precompilar), 'la escena entera se compila al arrancar, en paralelo (`compileAsync` recorre también lo invisible)')
/** El calentamiento: un dibujo de UN píxel con todo prendido y sin descarte, y todo devuelto como estaba. */
const calienta = (c: string): boolean => /gl\.setScissor\(0, 0, 1, 1\)/.test(c) && /o\.visible = true/.test(c) && /o\.frustumCulled = false/.test(c) && /t\.o\.visible = t\.visible/.test(c) && /t\.o\.frustumCulled = t\.descarte/.test(c) && /gl\.setScissorTest\(false\)/.test(c)
afirmar(calienta(precompilar), '  y se calienta con un dibujo de un píxel (ANGLE arma el ejecutable en el primer dibujo), devolviendo visibilidad y descarte')
controlPositivo('el detector VE un calentamiento que no devuelve la visibilidad', precompilar.replace('t.o.visible = t.visible', 't.o.visible = true'), calienta)
const haces = leer('amanecer/haces.ts') // [CALIDAD 1] B5: los haces se mudaron a su archivo
const topeUniforme = (c: string): boolean => /for \( int i = 0; i < uPasos; i\+\+ \)/.test(c) && /uniform int uPasos;/.test(c) && !/i < \$\{HACES\.pasos\}/.test(c)
afirmar(topeUniforme(haces), 'el lazo de los rayos tiene tope uniforme (con uno fijo Direct3D lo desenrolla: 85 contra 51 ms de enlace medidos)')
controlPositivo('el detector VE el lazo de tope fijo', haces.replace('i < uPasos;', 'i < ${HACES.pasos};'), topeUniforme)
// El campo de a poco da EXACTAMENTE el mismo campo que de una vez (la «c» de prueba de A3).
const deAPoco = (() => {
  const horno = campoDeAPoco(contornoC, CAMPO_DEL_FLUJO)
  let pasos = 0
  while (!horno.paso(0.05)) pasos += 1
  return { campo: horno.campo(), pasos }
})()
const igualito = (a: Float32Array, b: Float32Array): boolean => a.length === b.length && a.every((v, i) => v === b[i])
afirmar(igualito(deAPoco.campo.datos, flujo.datos) && deAPoco.pasos > 10, 'los campos del logo se hornean de a poco (momentos libres de pocos ms) y dan el mismo campo, celda por celda', `${String(deAPoco.pasos)} pasos de 0,05 ms`)
const cortado = (() => {
  const horno = campoDeAPoco(contornoC, CAMPO_DEL_FLUJO)
  horno.paso(0.05)
  return horno.campo().datos
})()
controlPositivo('el detector VE un horno cortado a mitad de camino', cortado, (d: Float32Array) => igualito(d, flujo.datos))
const fisicaB1 = leer('polvo/Fisica.tsx')
afirmar(/const PRESUPUESTO_DEL_HORNO_MS = [1-8]\b/.test(fisicaB1) && /hornearDeAPoco\(fino,/.test(fisicaB1) && /hornearDeAPoco\(flujo,/.test(fisicaB1) && !/campoDelLogo\(contorno/.test(fisicaB1), '  la física hornea los dos campos de a poco, con un presupuesto por momento libre (antes, dos tareas de ~90 ms al cargar)')

// ── B2 · cero reservas por cuadro ─────────────────────────────────────────
titulo('B2 · cero reservas por cuadro en los useFrame de la escena y en sus manejadores')
/** El cuerpo de cada `useFrame((…) => { … })` de un fuente (por llaves). */
function cuerposDeUseFrame(fuente: string): string[] {
  const cuerpos: string[] = []
  let desde = fuente.indexOf('useFrame(')
  while (desde >= 0) {
    const abre = fuente.indexOf('{', fuente.indexOf('=>', desde))
    let nivel = 0
    let i = abre
    for (; i < fuente.length; i += 1) {
      if (fuente[i] === '{') nivel += 1
      else if (fuente[i] === '}') {
        nivel -= 1
        if (nivel === 0) break
      }
    }
    cuerpos.push(fuente.slice(abre, i + 1))
    desde = fuente.indexOf('useFrame(', i)
  }
  return cuerpos
}
/** Lo que reserva: clones, vectores y matrices nuevos, arreglos armados, map/filter/forEach, objetos esparcidos. */
const RESERVA = /\.clone\(\)|new THREE\.(Vector[234]|Matrix[34]|Quaternion|Euler|Color|Box3)\(|\.map\(|\.filter\(|\.forEach\(|\[\.\.\.|\{ \.\.\./
/**
 * Las líneas que pueden reservar: sólo con banco (`hayBanco()` o marcadas `// banco`), o las que arman algo UNA vez
 * (marcadas `// una vez`: el primer cuadro, o cuando termina un horneado). La marca es la regla, escrita en el código.
 */
const PERMITIDA = /hayBanco\(\)|\/\/ banco|\/\/ una vez|\?\?=/
const reservasEn = (fuente: string): string[] => cuerposDeUseFrame(fuente).flatMap((c) => c.split('\n')).filter((l) => RESERVA.test(l) && !PERMITIDA.test(l)).map((l) => l.trim())
const CON_USE_FRAME = ['polvo/Fisica.tsx', 'polvo/Aire.tsx', 'piso/PisoVivo.tsx', 'amanecer/Amanecer.tsx', 'entorno/Entorno.tsx', 'entorno/Rebote.tsx', 'moire/MoireVivo.tsx', 'estrellas/Estrellas.tsx', 'estrellas/Fugaz.tsx', 'formacion/Formacion.tsx', 'cieloDeDia/CieloDeDia.tsx', 'ContactOcclusion.tsx', 'OrbitRig.tsx']
const sobran = CON_USE_FRAME.flatMap((a) => reservasEn(leer(a)).map((l) => `${a}: ${l.slice(0, 90)}`))
afirmar(sobran.length === 0, 'ningún useFrame de la escena reserva en cada cuadro (salvo con banco o armando algo la primera vez)', sobran.length === 0 ? `${String(CON_USE_FRAME.length)} archivos` : sobran.join(' | '))
controlPositivo('el detector VE un clon en un useFrame', "useFrame((state) => {\n    const antes = m.logoAntes.clone()\n  })", (c: string) => reservasEn(c).length === 0)
// Las variantes que escriben en un objeto fijo dan lo mismo que las puras.
const vivo: EstadoDelPolvoVivo = { ...polvoInicial(0), origen: [0, 0, 0] }
let puro = polvoInicial(0)
const movimientos: (readonly [number, number, number] | null)[] = [null, [1, 2, 3], [1.5, 2, 3], null, null, [4, 5, 6], null]
let igualPolvo = true
movimientos.forEach((mov, i) => {
  puro = avanzarElPolvo(puro, i * 0.4, mov, false)
  avanzarElPolvoEn(vivo, i * 0.4, mov, false)
  igualPolvo &&= JSON.stringify(puro) === JSON.stringify(vivo)
})
afirmar(igualPolvo, '  el polvo que se posa: la variante escribible da lo mismo que la pura (y copia el origen, no lo guarda)')
const momentoVivo = momentoEn(0) as MomentoVivo
const igualMomento = [0, 0.7, 2.5, 4.4, 4.9, 6.1, 7.2, 8].every((t) => JSON.stringify(momentoEn(t)) === JSON.stringify(momentoEn(t, momentoVivo)))
afirmar(igualMomento, '  el momento del amanecer: escrito en un objeto fijo, igual')
const falso = (tope: number, pie: number) => ({ getBoundingClientRect: () => ({ top: tope, bottom: pie }) })
const documentoFalso = { querySelector: (sel: string) => (sel.includes('servicios') ? falso(-300, 400) : falso(400, 1300)), querySelectorAll: () => [falso(-500, 200), falso(200, 900), falso(900, 2000)] }
afirmar(JSON.stringify(medirElBloqueOpacoEn(documentoFalso, 900, bloqueVivo())) === JSON.stringify(medirElBloqueOpaco(documentoFalso, 900)) && JSON.stringify(medirLasSeccionesEn(documentoFalso, 100, { arriba: 0, abajo: 0 })) === JSON.stringify(medirLasSecciones(documentoFalso, 100)), '  el bloque opaco y la extensión de las secciones: medidos en objetos fijos, igual')
// Las máquinas que corren en cada cuadro devuelven el MISMO estado cuando nada cambia (en reposo, cero objetos).
const pulso = pulsoInicial(0)
const quietoPulso = avanzarElPulso(avanzarElPulso(pulso, { t: 0.1, scrollEnMovimiento: false, hover: false, reducido: true }), { t: 0.2, scrollEnMovimiento: false, hover: false, reducido: true })
const encendido = avanzarElEncendido(encendidoInicial(1, 0), 1, 30, false)
afirmar(avanzarElPulso(quietoPulso, { t: 0.3, scrollEnMovimiento: false, hover: false, reducido: true }) === quietoPulso && avanzarElEncendido(encendido, 1, 31, false) === encendido, '  el pulso apagado y el haz prendido y asentado devuelven el mismo estado (nada nuevo por cuadro)')
// Nadie llama a React en cada cuadro sin un cambio.
afirmar(/if \(siguiente\(estadoRef\.current, evento\) !== estadoRef\.current\) setEstado/.test(leer('ataduraAlScroll.ts')) && /if \(tono !== ultimo\) \{\s*ultimo = tono\s*setTono\(tono\)/.test(readFileSync(path.join(process.cwd(), 'src/app/v3/_chrome/menu/useTonoDebajo.ts'), 'utf8')), 'la atadura al scroll y el tono del menú llaman a React sólo cuando algo cambia (antes, en cada cuadro)')

// ── B3 · independiente del framerate ──────────────────────────────────────
titulo('B3 · independiente del framerate: la misma escena a 60, 75, 120 y 144 Hz')
type PasoDelAire = (d: number, v: number, viento: number, dt: number) => { readonly d: number; readonly v: number }
/** El gesto canónico: el viento sopla 3 u/s 0,6 s y se va con la inercia del aire (1,4 s). */
const vientoDelGesto = (t: number): number => (t < 0.6 ? 3 : 3 * Math.exp(-(t - 0.6) / 1.4))
/** El paso de antes de B3 (Euler explícito), para el control positivo. */
function eulerDeAntes(d: number, v: number, viento: number, dt: number): { readonly d: number; readonly v: number } {
  const v1 = v + ((viento - v) / FISICA.aire.arrastre - FISICA.aire.rigidez * d - FISICA.aire.amortigua * v) * dt
  return { d: d + v1 * dt, v: v1 }
}
function trayectoria(paso: PasoDelAire, hz: number): readonly (readonly [number, number])[] {
  const dt = 1 / hz
  let [d, v] = [0, 0]
  const salida: [number, number][] = []
  for (let t = 0; t < 4; t += dt) {
    const r = paso(d, v, vientoDelGesto(t), dt)
    ;[d, v] = [r.d, r.v]
    salida.push([t + dt, d])
  }
  return salida
}
/** La referencia en el instante `t`, interpolada entre sus dos muestras (cada muestra se compara en SU instante). */
function enT(serie: readonly (readonly [number, number])[], t: number): number {
  const i = serie.findIndex(([x]) => x >= t)
  if (i <= 0) return serie[Math.max(i, 0)][1]
  const [[x0, y0], [x1, y1]] = [serie[i - 1], serie[i]]
  return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0)
}
const continuo = trayectoria(pasoDelAire, 20000)
const picoDelAire = Math.max(...continuo.map(([, d]) => Math.abs(d)))
/** Cuánto se aparta (fracción del pico) del tiempo continuo, en la peor de las cuatro frecuencias. */
const peorDesvio = (paso: PasoDelAire): number => Math.max(...[60, 75, 120, 144].flatMap((hz) => trayectoria(paso, hz).filter(([t]) => t < 3.9).map(([t, d]) => Math.abs(d - enT(continuo, t)) / picoDelAire)))
afirmar(peorDesvio(pasoDelAire) < 0.0075, 'el aire del polvo: la misma trayectoria a 60, 75, 120 y 144 Hz (Euler exponencial)', `se aparta a lo sumo ${(peorDesvio(pasoDelAire) * 100).toFixed(2)} % del pico del tiempo continuo (Euler explícito: ${(peorDesvio(eulerDeAntes) * 100).toFixed(2)} %)`)
controlPositivo('el detector VE el Euler explícito de antes (1,0 % a 60 Hz)', eulerDeAntes, (paso) => peorDesvio(paso) < 0.0075)
const simulacionB3 = leer('polvo/simulacion.ts')
afirmar((simulacionB3.match(/(d|p) \+= relajar\( v,/g) ?? []).length === 4 && !/\bd \+= v \* dt;|\bp \+= v \* dt;/.test(simulacionB3), '  los cuatro modos que mueven motas (aire, caída, deslizando, levantada) integran con `relajar`, ninguno con Euler explícito')
// Lo demás que corre por cuadro ya era exacto en el tiempo: se afirma para que siga así.
const exactos: readonly (readonly [string, RegExp, string])[] = [
  ['choreographySampler.ts', /current \+ diff \* \(1 - Math\.exp\(-dt \/ tau\)\)/, 'la cámara y el puntero persiguen con un amortiguador exponencial'],
  ['polvo/Aire.tsx', /m\.aire\.lerp\(m\.empuje, 1 - Math\.exp\(-dt \/ tau\)\)/, 'el aire toma y suelta la velocidad con un amortiguador exponencial'],
  ['entorno/Entorno.tsx', /1 - Math\.exp\(-dt \/ ESTELA_TAU_S\)/, 'la estela del polvo (E6) sigue a la cámara con un amortiguador exponencial'],
  ['moire/MoireVivo.tsx', /1 - Math\.exp\(-dt \/ M2\.tauS\)/, 'el moiré acelera con el scroll con un amortiguador exponencial'],
  ['piso/PisoVivo.tsx', /while \(m\.reloj \+ paso <= t \+ 1e-9 && pasos < PASOS_POR_CUADRO\)/, 'el piso vivo avanza a pasos fijos del reloj de la escena'],
  ['amanecer/linea.ts', /const tope = dt \/ AMANECER\.minimoS/, 'el amanecer persigue al scroll con una velocidad tope en unidades por segundo'],
  ['derivaDelAire.ts', /shell\.rotation\.y = elapsed \* spin\[index\]/, 'las conchas del polvo giran con el reloj'],
]
const noExactos = exactos.filter(([a, r]) => !r.test(leer(a))).map(([a, , q]) => `${a}: ${q}`)
afirmar(noExactos.length === 0, 'lo demás que corre por cuadro es exacto en el tiempo (no cuenta cuadros)', noExactos.length === 0 ? exactos.map(([, , q]) => q).join('; ') : noExactos.join(' | '))

// ── B4 · nada aparece ni se va de golpe ───────────────────────────────────
titulo('B4 · los bordes del volumen: las motas entran y salen con un fundido')
const simB4 = leer('polvo/simulacion.ts')
const volumenB4 = leer('polvo/volumen.ts')
/**
 * El corte del volumen del aire (lo que multiplica a la cámara y la sala), la cuenta del material: `caras` y `piso` son los
 * fundidos del lugar de la mota en la caja; `peso`, el de la mota suelta (ya suavizado). `sinTope` es el primer intento
 * (sin el `min`), para el control positivo.
 */
function corteDelAire(modo: number, peso: number, caras: number, piso: number, sinTope = false): number {
  const pesoCaras = modo === 0 && !sinTope ? Math.min(peso, caras) : peso
  return (caras + (1 - caras) * pesoCaras) * (piso + (1 - piso) * peso)
}
/** El de antes de B4: el del aire en el modo 0, nada en los sueltos (la visibilidad cambiaba de régimen de golpe). */
const corteDeAntes = (modo: number, _peso: number, caras: number, piso: number): number => (modo === 0 ? caras * piso : 1)
type Corte = (modo: number, peso: number, caras: number, piso: number) => number
const grilla = [0, 0.1, 0.35, 0.6, 0.9, 1]
/** ¿Continua al soltarse del aire (peso 0) y al volver a él (con su lugar lejos de las caras, la compuerta)? */
const continua = (corte: Corte): boolean =>
  grilla.every((caras) => grilla.every((piso) => Math.abs(corte(0, 0, caras, piso) - corte(1, 0, caras, piso)) < 1e-9)) &&
  grilla.every((piso) => grilla.every((peso) => Math.abs(corte(5, peso, 1, piso) - corte(0, peso, 1, piso)) < 1e-9))
/** ¿En el aire, donde la caja se repite (caras 0), la mota está apagada con cualquier peso? */
const repeticionOculta = (corte: Corte): boolean => grilla.every((piso) => grilla.every((peso) => (peso === 1 ? true : corte(0, peso, 0, piso) === 0)))
afirmar(continua(corteDelAire) && repeticionOculta(corteDelAire) && corteDelAire(0, 0, 0.4, 0.7) === 0.4 * 0.7 && corteDelAire(2, 1, 0.4, 0.7) === 1, 'la visibilidad es continua al soltarse del aire y al volver, y en el aire la repetición de la caja queda apagada', 'en reposo, igual que antes: el corte entero en el aire, ninguno suelta')
controlPositivo('el detector VE el cambio de régimen de antes (aparecían en el piso y se iban en el aire de golpe)', corteDeAntes, continua)
controlPositivo('y VE el intento sin tope: la mota que vuelve se vería saltar donde la caja se repite', (m: number, p: number, c: number, q: number) => corteDelAire(m, p, c, q, true), repeticionOculta)
afirmar(/vParejo \*= mix\( carasDelAire, 1\.0, modoDeLaFisica < 0\.5 \? min\( pesoSuelta, carasDelAire \) : pesoSuelta \);/.test(simB4) && /vParejo \*= mix\( pisoDelAire, 1\.0, pesoSuelta \);/.test(simB4) && /carasDelAire = 1\.0 - smoothstep/.test(volumenB4) && /pisoDelAire = smoothstep/.test(volumenB4), '  el material hace esa cuenta (las caras y el piso del volumen, aparte, mezclados por el peso)')
afirmar(/float lejos = distance\( mundo, cameraPosition \);\s*float pesoSuelta/.test(simB4), '  la cámara y la sala se cuentan donde se DIBUJA la mota (en el aire, con su corrimiento), no en su lugar de la caja')
// El peso: en la parte fraccionaria del modo, escrito en cada salida, en segundos (no en cuadros).
const escrituras = simB4.match(/salida0 = vec4\([^;]*\);/g) ?? []
afirmar(escrituras.filter((e) => !e.includes('vec4( 0.0 )')).every((e) => e.includes('modoConPeso(')) && escrituras.length === 9, 'cada salida de la simulación escribe el modo con su peso', `${String(escrituras.length - 1)} salidas`)
afirmar(PESO_EN_EL_MODO < 0.5 && [0, 1, 2, 3, 4, 5].every((m) => [0, 0.5, 1].every((w) => Math.round(m + PESO_EN_EL_MODO * w) === m)), '  el modo se sigue leyendo igual (redondeado) con cualquier peso', `el peso ocupa de 0 a ${String(PESO_EN_EL_MODO)}`)
const pasosHasta = (hz: number, s: number): number => Math.ceil(s * hz) / hz
afirmar(/peso \+ dt \/ \$\{FISICA\.fundido\.entraS\.toFixed\(2\)\}/.test(simB4) && /peso - dt \/ \$\{FISICA\.fundido\.saleS\.toFixed\(2\)\}/.test(simB4) && Math.abs(pasosHasta(60, FISICA.fundido.entraS) - pasosHasta(144, FISICA.fundido.entraS)) < 0.02, '  el peso avanza con dt: el mismo fundido a 60 y a 144 Hz', `aparece en ${String(FISICA.fundido.entraS)} s, se va en ${String(FISICA.fundido.saleS)} s`)
afirmar(new RegExp(`&& bordeDeF < \\$\\{\\(1 - POLVO_PAREJO\\.fundido\\)\\.toFixed\\(3\\)\\}`).test(simB4), 'la levantada vuelve al aire sólo con su lugar lejos de las caras de la caja (ahí el aire la dibuja entera)')
// El remolino: la aspiración ya no crece debajo del piso.
const aspiraDeAntes = (alto: number): number => FISICA.remolino.aspira * Math.exp(-alto / 1.2)
const aspiraAhora = (alto: number): number => FISICA.remolino.aspira * Math.exp(-Math.max(alto, 0) / 1.2)
/** ¿Ninguna normal del campo se normaliza sin red? (Con gradiente nulo, `normalize` de cero es NaN.) */
const normalesSeguras = (c: string): boolean => !/normalize\( mat3\( uLogo \) \* normalDel(Campo|Flujo)\( q \) \)/.test(c) && (c.match(/normalSegura\( mat3\( uLogo \) \* normalDel(Campo|Flujo)\( q \) \)/g) ?? []).length === 4 && /return largo > 1e-6 \? n \/ largo : vec3\( 0\.0, 1\.0, 0\.0 \);/.test(c)
afirmar(normalesSeguras(simB4), 'ninguna mota se pierde en NaN contra el logo: las normales del campo tienen red (medido: 12 de 14.000 quedaban trabadas cayendo, ahora 0)')
controlPositivo('el detector VE la normal sin red de antes', simB4.replace('vec3 n = normalSegura( mat3( uLogo ) * normalDelCampo( q ) );', 'vec3 n = normalize( mat3( uLogo ) * normalDelCampo( q ) );'), normalesSeguras)
afirmar(/exp\( - max\( alto, 0\.0 \) \/ 1\.2 \)/.test(simB4) && !/exp\( - alto \/ 1\.2 \)/.test(simB4) && aspiraAhora(-20) === aspiraAhora(0), 'el remolino no aspira más fuerte debajo del piso (antes lanzaba esas motas a millones de unidades)', `a 20 u debajo del piso: ${aspiraDeAntes(-20).toExponential(1)} u/s antes, ${aspiraAhora(-20).toFixed(1)} ahora`)

// ── B5 · los rayos del amanecer a media resolución ───────────────────────
titulo('B5 · los rayos del amanecer: la misma luz, un cuarto de los píxeles')
const hacesB5 = leer('amanecer/haces.ts')
const amanecerB5 = leer('amanecer/Amanecer.tsx')
/** ¿Los haces van a su búfer (una escena aparte, fondo negro) y un cuadrado los suma, como se sumaban? */
const aMediaResolucion = (h: string): boolean =>
  /gl\.setRenderTarget\(h\.bufer\)\s*gl\.render\(h\.escena, camara\)\s*gl\.setRenderTarget\(previo\)/.test(h) &&
  /Math\.ceil\(h\.lienzo\.x \* HACES\.resolucion\)/.test(h) &&
  /escena\.background = new THREE\.Color\(0, 0, 0\)/.test(h) &&
  /type: THREE\.HalfFloatType/.test(h) &&
  /composicion\.renderOrder = 3/.test(h) &&
  /blending: THREE\.AdditiveBlending,\s*\}\)\s*const composicion/.test(h) &&
  !/escena\.add\(composicion\)/.test(h)
afirmar(aMediaResolucion(hacesB5) && HACES.resolucion === 0.5 && /<primitive object=\{haces\.composicion\} \/>/.test(amanecerB5) && /dibujarLosHaces\(haces, state\.gl, state\.camera\)/.test(amanecerB5), 'los haces se dibujan en su búfer a la mitad del lienzo por lado (medio flotante) y un cuadrado aditivo los suma a la escena', 'un cuarto de los píxeles; la cuenta por píxel no cambió')
controlPositivo('el detector VE los haces dibujados en la escena, a resolución completa (antes de B5)', hacesB5.replace('gl.setRenderTarget(h.bufer)', 'gl.setRenderTarget(null)'), aMediaResolucion)
afirmar(/for \( int i = 0; i < uPasos; i\+\+ \)/.test(hacesB5) && /pasos: 20, luz: 0\.0035, alto: 10/.test(hacesB5), '  la misma cuenta: 20 tramos por píxel, la misma luz y el mismo aire (lo que se ve no cambia)')
const precompilarB5 = leer('gpu/Precompilar.tsx')
afirmar(/ESCENAS_APARTE\.add\(aparte\)/.test(amanecerB5) && /ESCENAS_APARTE\.delete\(aparte\)/.test(amanecerB5) && /\.\.\.\[\.\.\.ESCENAS_APARTE\]\.map\(\(a\) => gl\.compileAsync\(a\.escena, camara\)\)/.test(precompilarB5) && /for \(const a of ESCENAS_APARTE\) \{\s*const previo = gl\.getRenderTarget\(\)\s*gl\.setRenderTarget\(a\.bufer\)\s*calentar\(gl, a\.escena, camara\)/.test(precompilarB5), 'la escena aparte de los haces se precompila y se calienta al arrancar, en su búfer (nada se compila tarde: medido, 26 programas al cargar y 26 al final)')
afirmar(/abrir\(s\.name !== '' \? s\.name : /.test(leer('gpu/PerfilDeLaGpu.tsx')), '  y el perfil de la GPU la mide con su nombre')

cerrar('s34-calidad1')
