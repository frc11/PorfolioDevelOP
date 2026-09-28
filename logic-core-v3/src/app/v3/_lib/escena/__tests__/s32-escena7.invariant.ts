/**
 * SPRINT ESCENA 7 — lo que la ronda 3 promete sin navegador. Cada afirmación lleva su control positivo
 * donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T2 · la formación, «la fábrica gigante»: encendida, sin fallas, negra, en un piso plano, con muchas
 *      más filas, un poco menos densa, en bandas intercaladas; el presupuesto, la cámara y 375.
 * T3 · el cielo de noche: encendido, siempre detrás de la trama, más denso y más luminoso, con la vía
 *      láctea (banda difusa con franjas de polvo) cruzando el cielo que se ve; monocromo, nítido, lento.
 * T4 · el polvo que se posa: encendido, con los tiempos a la mitad; el remolino, a velocidad real.
 * T5 · el piso vivo: encendido, un mar continuo que sube y baja, sin scroll, a paso fijo, que no toca al
 *      logo; el borde, el presupuesto y los planos del piso escondidos.
 * T6 · 6a, el aire con inercia: encendido, tal cual se aprobó.
 * T7 · el obstáculo natural: sin burbuja; el aire rodea al logo (flujo potencial) y la mota lo sigue con su
 *      inercia; la que entra más rápido que el umbral queda pegada un momento; los remolinos (6b), borrados.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { buildTrack, sampleTrack } from '../choreographySampler'
import type { MutableChoreoPose } from '../choreographyTypes'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../entorno'
import { FORMACION, anguloDe, bandas, cuantasFilas, formar, radioDeLaFila, triangulosDeLaFormacion, type Copia } from '../formacion/enFormacion'
import { CIELO, ESTRELLAS } from '../estrellas/Estrellas'
import { VIA_LACTEA, densidadDeLaBanda, direccionDe, enLaBanda, polvoDeLaBanda } from '../estrellas/cielo'
import { POSARSE, avanzarElPolvo, polvoInicial, NUNCA } from '../polvo/posarse'
import { PISO_VIVO, grillaDelPiso, marejadasEn } from '../piso/bloques'
import { FLOOR_RADIUS } from '../probeScene'
import { INERCIA } from '../polvo/Aire'
import { FISICA, flujoAlrededor } from '../polvo/simulacion'
import { HOLGURA } from '../polvo/obstaculo'
import { MOIRE_FAR_RADIUS } from '../probeMoire'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')
const codigo = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? (d.name === '__tests__' ? [] : codigo(path.join(dir, d.name))) : /\.tsx?$/.test(d.name) ? [readFileSync(path.join(dir, d.name), 'utf8')] : []))
/** El ancho de la «cp» entera en el espacio de la copia (medido en el banco). */
const ANCHO_DE_LA_COPIA = 6.86

// ── T2 · la formación ─────────────────────────────────────────────────────
titulo('T2 · la formación, «la fábrica gigante»')
afirmar(ENTORNO.formacion && !BASE_LIMPIA.formacion, 'encendida en el producto (y no en la base)')
afirmar(!entornoPedido('producto,formacion=no').formacion && entornoPedido('producto').formacion && entornoPedido('formacion').formacion, '  el banco la apaga con `formacion=no` para comparar')
controlPositivo('el detector VE un producto sin formación', 'producto,formacion=no', (p: string) => entornoPedido(p).formacion)
// Sin fallas: ni el código ni el test de «ninguna perfecta».
afirmar(!existsSync(path.join(ESCENA, 'formacion/regiones.ts')), 'las fallas se borraron: `formacion/regiones.ts` no existe')
const FALLAS = /FALLAS|esPerfecta|piezaDe|tonoApenas|sinFallasVisibles|fallas=no|enLaRegion|EN_LA_REGION/
afirmar(!codigo(ESCENA).some((c) => FALLAS.test(c)), '  y ningún fuente de la escena nombra una falla')
controlPositivo('el detector VE una falla', "const falla = FALLAS[0]", (c: string) => !FALLAS.test(c))
afirmar(!FALLAS.test(leer('__tests__/s31-escena6.invariant.ts')), '  ni queda el test de «ninguna perfecta»')
afirmar(/uTinta: \{ value: lineal\(INK_COLOR\) \}/.test(leer('formacion/materiales.ts')), 'todas negras, con la tinta del logo')
// El piso plano.
afirmar(!/pendiente/.test(leer('formacion/enFormacion.ts').replace(/\/\*\*[\s\S]*?\*\//g, '')) && !/pendiente/.test(leer('StudioFloor.tsx').replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'el piso de la formación es plano: ni la formación ni el piso tienen pendiente')
afirmar(/escenario === undefined && <mesh position=\{\[0, FLOOR_Y, 0\]\} geometry=\{cycGeometry\}/.test(leer('StudioFloor.tsx')), '  y con la formación no hay ciclorama: el piso de abajo llega al horizonte')
// Muchas más filas, un poco menos densa y un poco más separada.
const copias = formar()
const filas = cuantasFilas()
afirmar(filas >= 6 * 7, 'muchas más filas hacia atrás', `${String(filas)} filas (ESCENA 6: 7)`)
afirmar(FORMACION.paso > 6.85 && FORMACION.paso < 6.85 * 1.2, 'un poco menos densa: el paso a lo largo de la fila creció poco', `${String(FORMACION.paso)} contra 6,85`)
afirmar(FORMACION.entreFilas > 3.24 && FORMACION.entreFilas < 3.24 * 1.2, '  y un poco más separadas las filas', `${String(FORMACION.entreFilas)} contra 3,24`)
// Continua en los 360°, pareja y mirando al centro.
let peorHueco = 0
let peorPaso = 0
let menorPaso = Infinity
for (let fila = 0; fila < filas; fila += 1) {
  const deLaFila = copias.filter((c) => c.fila === fila)
  const angulos = deLaFila.map((c) => Math.atan2(c.x, c.z)).sort((a, b) => a - b)
  for (let i = 0; i < angulos.length; i += 1) peorHueco = Math.max(peorHueco, ((i + 1 < angulos.length ? angulos[i + 1] : angulos[0] + Math.PI * 2) - angulos[i]) * deLaFila[0].columnas / (Math.PI * 2))
  const paso = (2 * Math.PI * radioDeLaFila(fila)) / deLaFila[0].columnas
  peorPaso = Math.max(peorPaso, paso)
  menorPaso = Math.min(menorPaso, paso)
}
afirmar(Math.abs(peorHueco - 1) < 1e-9, 'continua en los 360°: en cada fila ningún hueco más grande que una columna (sin bloques ni pasillos)')
afirmar(menorPaso >= FORMACION.paso * 0.94 && peorPaso <= FORMACION.paso * FORMACION.crece + 1e-9, '  la densidad, pareja lejos y cerca: el paso de toda fila está entre el de arranque y `crece` veces', `${menorPaso.toFixed(2)} a ${peorPaso.toFixed(2)} u`)
controlPositivo('el detector VE filas con las columnas de ESCENA 6 hasta el fondo', [6.85, 6.85 * 4], (p: number[]) => Math.max(...p) <= FORMACION.paso * FORMACION.crece)
afirmar(copias.every((c) => Math.sin(c.mira) * -c.x / Math.hypot(c.x, c.z) + Math.cos(c.mira) * -c.z / Math.hypot(c.x, c.z) > 1 - 1e-9), 'todas miran al centro, al original')
const intercaladas = bandas().every((b) => copias.filter((c) => c.fila >= b.desde && c.fila < b.desde + b.filas).every((c) => Math.abs(Math.atan2(c.x, c.z) - Math.atan2(Math.sin(anguloDe(c.columna, c.fila - b.desde, b.columnas)), Math.cos(anguloDe(c.columna, c.fila - b.desde, b.columnas)))) < 1e-9))
const corridas = bandas().filter((b) => b.filas > 1).every((b) => Math.abs(anguloDe(0, 1, b.columnas) - anguloDe(0, 0, b.columnas) - Math.PI / b.columnas) < 1e-12)
afirmar(intercaladas && corridas, 'adentro de cada banda todas las filas tienen las mismas columnas y la impar va corrida media columna', `${String(bandas().length)} bandas`)
const pasos = Array.from({ length: filas - 1 }, (_u, i) => radioDeLaFila(i + 1) - radioDeLaFila(i))
afirmar(pasos.every((p) => Math.abs(p - FORMACION.entreFilas) < 1e-9), 'el mismo paso entre todas las filas', `${String(FORMACION.entreFilas)} u`)
afirmar(FORMACION.paso > ANCHO_DE_LA_COPIA * FORMACION.escala, 'de costado no se pisan: el paso es más que el ancho de una copia', `${String(FORMACION.paso)} contra ${(ANCHO_DE_LA_COPIA * FORMACION.escala).toFixed(2)}`)
const medioAncho = (ANCHO_DE_LA_COPIA * FORMACION.escala) / 2
const medioHondo = 0.3
const esquinas = (c: Copia): [number, number][] =>
  [[-medioAncho, -medioHondo], [medioAncho, -medioHondo], [medioAncho, medioHondo], [-medioAncho, medioHondo]].map(([a, b]) => [c.x + a * Math.cos(c.mira) + b * Math.sin(c.mira), c.z - a * Math.sin(c.mira) + b * Math.cos(c.mira)])
const huella = copias.flatMap((c) => esquinas(c).map(([x, z]) => Math.hypot(x, z)))
afirmar(Math.min(...huella) > FORMACION.radioDelEscenario + 1, 'ninguna copia entra en el escenario', `la más adentro, a ${Math.min(...huella).toFixed(2)}`)
afirmar(Math.max(...huella) + 10 < FORMACION.radioDelPisoDeAbajo && FORMACION.radioDelPisoDeAbajo < FORMACION.radioDelCielo, '  el piso de abajo pasa la última fila y el cielo está más allá de todo', `la más afuera a ${Math.max(...huella).toFixed(1)}; piso ${String(FORMACION.radioDelPisoDeAbajo)}, cielo ${String(FORMACION.radioDelCielo)}`)
// El presupuesto: dos llamadas y ~50.000 triángulos.
const tri = triangulosDeLaFormacion(copias)
afirmar(tri <= FORMACION.presupuesto, 'el presupuesto de triángulos', `${String(tri)} para ${String(copias.length)} copias (ESCENA 6: 33.440 para 308)`)
const armado = leer('formacion/armado.ts')
afirmar(/const geometrias = \[horneada\.geometria, cuadrado\]/.test(armado) && /grupos\.map\(/.test(armado), '  dos mallas instanciadas (dos llamadas): la primera fila entera y las siluetas')
afirmar(/gl_FragColor\.a = alfa;/.test(leer('formacion/materiales.ts')) && /transparent: silueta !== null/.test(leer('formacion/materiales.ts')), '  la silueta se mezcla con su borde (y escribe su alfa: el lienzo lo compone)')
afirmar(/calidad !== 'compacta'/.test(leer('formacion/Formacion.tsx')), 'en el teléfono (375) no hay formación')
// La cámara, en todo el recorrido: adentro de la capa gruesa y lejos de las copias.
const pista = buildTrack(CHOREO_KEYFRAMES)
const pose: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
let radioMaximo = 0
let masCerca = Infinity
const primera = copias.filter((c) => c.fila === 0)
for (let p = 0; p <= 1; p += 0.001) {
  sampleTrack(pista, p, pose)
  radioMaximo = Math.max(radioMaximo, pose.distance)
  for (const extra of [-8, 0, 8]) {
    const a = ((pose.angleDeg + extra) * Math.PI) / 180
    for (const c of primera) {
      const [dx, dz] = [Math.sin(a) * pose.distance - c.x, Math.cos(a) * pose.distance - c.z]
      const costado = dx * Math.cos(c.mira) - dz * Math.sin(c.mira)
      const frente = dx * Math.sin(c.mira) + dz * Math.cos(c.mira)
      masCerca = Math.min(masCerca, Math.hypot(Math.max(0, Math.abs(costado) - medioAncho), Math.max(0, Math.abs(frente) - medioHondo)))
    }
  }
}
afirmar(radioMaximo < MOIRE_FAR_RADIUS, 'la cámara no sale nunca del cilindro de la trama', `radio máximo ${radioMaximo.toFixed(1)} contra ${String(MOIRE_FAR_RADIUS)}`)
afirmar(masCerca > 6, '  ni se acerca a una copia', `la más cercana, a ${masCerca.toFixed(1)}`)
afirmarIgual(copias.length, copias.filter((c) => c.fila < filas).length, 'todas las copias caen en alguna fila')

// ── T3 · el cielo de noche ────────────────────────────────────────────────
titulo('T3 · el cielo de noche: una noche en el campo, detrás de la trama')
afirmar(ENTORNO.cielo && !BASE_LIMPIA.cielo && !entornoPedido('producto,cielo=no').cielo, 'encendido en el producto; el banco lo apaga con `cielo=no`')
const estrellas = leer('estrellas/Estrellas.tsx')
const cielo = leer('estrellas/cielo.ts')
afirmar(/if \( vAlfa > 0\.001 \) vAlfa \*= delanteDeLaTrama\( o, d \);/.test(estrellas), 'el bug: cada estrella lee la trama donde su rayo la cruza y detrás de una raya no se ve')
afirmar(/float pasa = delanteDeLaTrama\( cameraPosition, d \);/.test(estrellas), '  y la vía láctea también')
afirmar(['uTramaGruesa', 'uTramaFina', 'uMatGruesa', 'uMatFina', 'uMezclaB', 'envolventeDeLaBanda'].every((u) => cielo.includes(u)), '  con las dos capas, su transformación de hoy (la gruesa baja, la fina se corre y mezcla dos desajustes) y su envolvente')
controlPositivo('el detector VE una estrella que no lee la trama', 'vAlfa = aEstrella.x * titila * aparece;', (c: string) => /vAlfa \*= delanteDeLaTrama/.test(c))
afirmar(ESTRELLAS.cuantas + ESTRELLAS.enLaBanda >= 1.5 * 60000, 'más densidad', `${String(ESTRELLAS.cuantas + ESTRELLAS.enLaBanda)} estrellas (ESCENA 6: 60.000)`)
afirmar(ESTRELLAS.clases.punto.brillo[0] > 0.22 && ESTRELLAS.clases.media.brillo[0] > 0.5, '  y más luminosas', `débiles desde ${String(ESTRELLAS.clases.punto.brillo[0])} (ESCENA 6: 0,22)`)
const c = ESTRELLAS.clases
afirmar(c.punto.parte > c.media.parte && c.media.parte > c.brillante.parte && ESTRELLAS.deLaBanda.punto > 0.8, 'muchas débiles y algunas brillantes (y las de la banda, casi todas débiles)')
// La vía láctea: una banda que cruza el cielo que se ve de noche, con franjas de polvo.
const vista = enLaBanda(direccionDe(-61, 18))
afirmar(Math.abs(vista.b) < VIA_LACTEA.ancho, 'la vía láctea cruza el cielo que la cámara mira de noche (hacia −61°, desde el piso hacia arriba)', `a ${(vista.b * 180 / Math.PI).toFixed(1)}° de su centro`)
afirmar(densidadDeLaBanda(0.3, 0) > 4 * densidadDeLaBanda(0.3, 2.5 * VIA_LACTEA.ancho), '  es una banda: se apaga hacia los costados')
let masPolvo = 0
for (let l = -1.5; l <= 1.5; l += 0.01) for (let b = -0.3; b <= 0.3; b += 0.005) masPolvo = Math.max(masPolvo, polvoDeLaBanda(l, b))
afirmar(masPolvo > 0.9 && VIA_LACTEA.polvo > 0.6, '  con franjas oscuras de polvo que la parten', `el polvo tapa hasta el ${(VIA_LACTEA.polvo * 100).toFixed(0)} %`)
afirmar(/vec4\( vec3\( luz \), oscuro \)/.test(estrellas) && /vec4\( vec3\( vAlfa \* cuanto \), 1\.0 \)/.test(estrellas), 'monocromo: la banda y las estrellas pintan los tres canales iguales')
afirmar(CIELO.desde > 0 && CIELO.oscuro < 1, 'el cielo se oscurece hacia arriba y en el horizonte queda del color de la bruma (empalma con el piso del fondo)')
afirmar(/floor\( px \) \+ 0\.5/.test(estrellas) && ESTRELLAS.titileo.hasta <= 0.3 && /fueraDelTunel/.test(estrellas) && /smoothstep\( aEstrella\.y/.test(estrellas), 'siguen igual: nítidas (al centro del píxel), titileo lento, aparecen con la noche y se van antes del túnel')

// ── T4 · el polvo que se posa ─────────────────────────────────────────────
titulo('T4 · el polvo que se posa, con los tiempos a la mitad')
afirmar(ENTORNO.posarse && !BASE_LIMPIA.posarse && !entornoPedido('producto,posarse=no').posarse, 'encendido en el producto; el banco lo apaga con `posarse=no`')
afirmar(POSARSE.empiezaS === 8 / 2 && POSARSE.asentadoS <= 10 && POSARSE.desparejoS === 3 / 2, 'los tiempos a la mitad: empieza a los 4 s y la caída apunta a los ~10 s (ESCENA 6: 8 s y ~20 s medidos)', `${String(POSARSE.empiezaS)} s / ${String(POSARSE.asentadoS)} s / ${String(POSARSE.desparejoS)} s`)
controlPositivo('el detector VE los tiempos de antes', { empiezaS: 8, asentadoS: 25, desparejoS: 3 }, (t: { empiezaS: number; asentadoS: number; desparejoS: number }) => t.empiezaS === 4 && t.asentadoS <= 10 && t.desparejoS === 1.5)
afirmar(avanzarElPolvo(polvoInicial(0), 30, null, true).quieto === NUNCA, 'con movimiento reducido no se posa (como antes)')
const fisica = leer('polvo/Fisica.tsx')
afirmar(/const dt = quieto \? 0 : dtReal \* m\.escala/.test(fisica) && !/camaraLenta\(0\.25\)/.test(fisica), 'el remolino va a velocidad real: la cámara lenta es sólo un gancho del banco')
afirmar(/if \(!e\.polvoParejo \|\| !e\.posarse\) return null/.test(fisica), '  y la física corre en el producto (con el polvo parejo)')

// ── T5 · el piso vivo ─────────────────────────────────────────────────────
titulo('T5 · el piso vivo: un mar de bloques')
afirmar(ENTORNO.pisoVivo && !BASE_LIMPIA.pisoVivo && !entornoPedido('producto,piso=no').pisoVivo, 'encendido en el producto; el banco lo apaga con `piso=no`')
const pisoVivo = leer('piso/PisoVivo.tsx')
const bloques = leer('piso/bloques.ts')
afirmar(!/progress|agita|scroll/i.test(pisoVivo.replace(/\/\*\*[\s\S]*?\*\//g, '')) && !/uAgita/.test(bloques), 'no reacciona al scroll: ni el componente ni la simulación lo leen')
controlPositivo('el detector VE el scroll', 'const progreso = rig.current.progress', (c: string) => !/progress|agita|scroll/i.test(c))
afirmar(/uCursor/.test(bloques) && /empujeDelAnillo/.test(bloques) && /for \( int i = 0; i < \$\{ANILLOS_EN_EL_SHADER\}; i\+\+ \) fuerza \+= empujeDelAnillo/.test(bloques), '  sólo al cursor y al pulso (cada anillo empuja con su frente)')
// El mar: sube y baja, se mueve siempre, sin saltos y sin repetirse.
let [minimo, maximo, salto] = [Infinity, -Infinity, 0]
for (let t = 0; t < 60; t += 0.5) for (let x = -40; x <= 40; x += 4) for (let z = -40; z <= 40; z += 4) {
  const h = marejadasEn(x, z, t)
  minimo = Math.min(minimo, h)
  maximo = Math.max(maximo, h)
  salto = Math.max(salto, Math.abs(marejadasEn(x, z, t + 1 / 120) - h))
}
afirmar(minimo < -0.12 && maximo > 0.12, 'sube Y baja respecto del reposo', `de ${minimo.toFixed(2)} a ${maximo.toFixed(2)} u (ESCENA 6: 0 a 0,1, sólo arriba)`)
afirmar(maximo < 0.5 && minimo > -0.5, '  sin exagerar: el mar solo no pasa de medio bloque', `el lado del bloque es ${(PISO_VIVO.lado * 45 / 34).toFixed(2)} u con la formación`)
afirmar(salto < 0.01, '  continuo: en un paso de 1/120 s ningún bloque se mueve más de 1 cm', `máximo ${salto.toFixed(4)} u`)
afirmar(!/floor\( h \/|escalon\.toFixed|reposoDelPiso/.test(bloques), '  y sin escalones de altura (ESCENA 6 redondeaba a 0,05 y el movimiento saltaba)')
const rumbos = PISO_VIVO.mar.marejadas.map((m) => m[0])
const largos = PISO_VIVO.mar.marejadas.map((m) => m[1])
let racional = false
for (let i = 0; i < largos.length; i += 1) for (let j = i + 1; j < largos.length; j += 1) for (let q = 1; q <= 4; q += 1) { const p = (largos[i] / largos[j]) * q; if (Math.abs(p - Math.round(p)) < 0.02) racional = true }
afirmar(PISO_VIVO.mar.marejadas.length >= 4 && new Set(rumbos).size === rumbos.length && !racional, 'no se repite: marejadas con rumbos distintos y largos sin relación simple entre sí, y un agrupamiento que cambia en el tiempo', `${String(largos.length)} marejadas`)
afirmar(/ruidoDelPiso\( vec3\( x \* /.test(bloques), '  el agrupamiento y el picado son ruido que cambia con el tiempo')
afirmar(/const paso = PISO_VIVO\.onda\.paso/.test(pisoVivo) && /while \(m\.reloj \+ paso <= t/.test(pisoVivo) && PISO_VIVO.onda.paso === 1 / 120, 'estable a cualquier cantidad de cuadros: la simulación corre a paso fijo de 1/120 s y el mar es una cuenta del reloj')
afirmar(/4\.0 \* cruz \+ esquinas - 20\.0 \* h/.test(bloques), '  y la ola es isótropa (el frente no sale cuadrado)')
afirmar(/caraDelLogo\( \( uLogoInverso \* vec4\( tapa, 1\.0 \) \)\.xyz \) - 0\.7072 \* uLado - /.test(bloques) && PISO_VIVO.techo.margen > 0.05, 'nunca toca al logo: cada tapa, menos media diagonal, guarda un margen con la forma del logo', `margen ${String(PISO_VIVO.techo.margen)} u`)
// El borde: los bloques cubren el disco entero (recortados al círculo); el presupuesto.
for (const radio of [FLOOR_RADIUS, 45]) {
  const g = grillaDelPiso(radio)
  afirmar(g.cuantas * 10 <= 60000, `con el piso de radio ${String(radio)}: ~60.000 triángulos`, `${String(g.cuantas)} bloques, ${String(g.cuantas * 10)} triángulos`)
  const celdas = new Set<string>()
  for (let k = 0; k < g.cuantas; k += 1) celdas.add(`${String(g.celdas[k * 2])},${String(g.celdas[k * 2 + 1])}`)
  let sinBloque = 0
  for (let a = 0; a < 360; a += 3) for (let r = 0; r < radio; r += 0.5) {
    const [x, z] = [Math.sin((a * Math.PI) / 180) * r, Math.cos((a * Math.PI) / 180) * r]
    if (!celdas.has(`${String(Math.floor(x / g.lado + g.n / 2))},${String(Math.floor(z / g.lado + g.n / 2))}`)) sinBloque += 1
  }
  afirmar(sinBloque === 0, '  los bloques cubren el disco entero (los del borde se recortan al círculo)')
}
afirmar(/if \( rr > uRadioDelPiso \) xz \*= uRadioDelPiso \/ rr;/.test(bloques) && /smoothstep\( radio - /.test(bloques), '  recortados al círculo, y el mar se apaga en el borde (al ras del canto)')
afirmar(/\{!conPisoVivo && \(/.test(leer('StudioFloor.tsx')), '  sin losa debajo: los valles bajan más que ella')
const entornoTsx = leer('entorno/Entorno.tsx')
afirmar(/<Haz conCharco=\{!e\.pisoVivo\} \/>/.test(entornoTsx) && /!e\.pisoVivo && <Pulso \/>/.test(entornoTsx) && /const enElPiso = entorno\.pisoVivo/.test(leer('ContactOcclusion.tsx')), 'el anillo, el charco y la mancha de contacto los pinta el piso (sin él, los planos de siempre)')
afirmar(/pisoEn\( p\.xz \)/.test(leer('polvo/simulacion.ts')), 'el polvo posado se apoya en su bloque y sube y baja con el mar')

// ── T6 · el aire con inercia ──────────────────────────────────────────────
titulo('T6 · 6a, el aire con inercia, tal cual')
afirmar(ENTORNO.inercia && !BASE_LIMPIA.inercia && !entornoPedido('producto,inercia=no').inercia, 'encendido en el producto; el banco lo apaga con `inercia=no`')
afirmarIgual({ ...INERCIA }, { arrastre: 0.25, tomaS: 0.4, frenaS: 2.2 }, '  con los valores aprobados de ESCENA 6 (toma el 25 % de la cámara en 0,4 s y frena en 2,2 s)')
afirmar(/e\.polvoParejo && e\.inercia \? '#define AIRE_INERCIA'/.test(leer('polvo/parche.ts')) && /if \(e\.inercia\) \{/.test(leer('polvo/Aire.tsx')), '  y el mismo código: el volumen corrido por el aire antes de repetirse')

// ── T7 · el obstáculo natural ─────────────────────────────────────────────
titulo('T7 · el obstáculo, como un obstáculo de verdad')
afirmar(ENTORNO.obstaculo, 'encendido (5a sigue en el producto)')
const REMOLINOS = /remolinos|vientoDeLaEstela|uRemolinos|soltarRemolinos|FISICA\.estela/
afirmar(!codigo(ESCENA).some((c) => REMOLINOS.test(c)) && !('remolinos' in entornoPedido('producto,remolinos').pruebas), '6b · los remolinos se borraron: ni el código ni la bandera')
controlPositivo('el detector VE un remolino', 'uniform vec4 uRemolinos[ 6 ];', (c: string) => !REMOLINOS.test(c))
const BURBUJA = /uAbrir|alAbrir|ABRE_TAU_S/
afirmar(!codigo(ESCENA).some((c) => BURBUJA.test(c)) && Object.keys(HOLGURA).join(',') === 'polvo,bokeh', 'sin burbuja: la holgura ya no se abre con la velocidad ni se cierra a la fuerza')
controlPositivo('el detector VE la burbuja', 'HOLGURA_DEL_CAMPO + uAbrir * 3.20', (c: string) => !BURBUJA.test(c))
const sim7 = leer('polvo/simulacion.ts')
afirmar(/return \( m \* vec4\( t, 1\.0 \) \)\.xyz;/.test(sim7) && /#if defined\( AIRE_OBSTACULO \) && ! defined\( AIRE_FISICA \)/.test(leer('polvo/parche.ts')), '  con física, la mota no se corre del logo en reposo: lo hace el aire que lo rodea (sin física, el bokeh, la holgura fija)')
// El flujo potencial: en la cara, el aire no entra; de costado, pasa más rápido; lejos, no hay nada.
const n: [number, number, number] = [0, 0, 1]
const aire: [number, number, number] = [0.6, 0, -2]
const enLaCara = flujoAlrededor(aire, n, 0)
const total = [aire[0] + enLaCara[0], aire[1] + enLaCara[1], aire[2] + enLaCara[2]]
afirmar(Math.abs(total[2]) < 1e-12 && Math.abs(total[0]) > Math.abs(aire[0]), 'el aire rodea al logo: en su cara no entra, y lo que pasa de costado se acelera', `normal ${total[2].toFixed(3)}, costado ${aire[0]} → ${total[0].toFixed(2)} u/s`)
const lejos = flujoAlrededor(aire, n, 6 * FISICA.obstaculo.radio)
afirmar(Math.hypot(...lejos) < 0.02 * Math.hypot(...aire), '  y lejos del logo el aire no se entera', `a ${String(6 * FISICA.obstaculo.radio)} u: ${(Math.hypot(...lejos) / Math.hypot(...aire) * 100).toFixed(2)} %`)
afirmar(/vec3 viento = vientoDelDespertar\( p \) \+ alrededorDelLogo\( p, uVientoDelAire \);/.test(sim7) && /\/ \$\{FISICA\.aire\.arrastre\.toFixed\(2\)\}/.test(sim7), '  la mota del aire sigue ese flujo con su arrastre (su inercia): lenta, dobla; rápida, choca')
afirmar(/if \( entra > \$\{FISICA\.obstaculo\.pegar\.toFixed\(2\)\} \)/.test(sim7) && /modo > 5\.5 && modo < 6\.5/.test(sim7), 'con fuerza, queda pegada (modo 6) y se desprende siguiendo el aire', `umbral ${String(FISICA.obstaculo.pegar)} u/s entrando a la cara; pegada de ${String(FISICA.obstaculo.pega[0])} a ${String(FISICA.obstaculo.pega[1])} s`)
afirmar(FISICA.obstaculo.pegar > 0.5 && FISICA.obstaculo.pegar < 4.8, '  el umbral cae entre el aire de un scroll suave (~0,5 u/s, medido) y el de uno fuerte (~5 u/s, medido)')
afirmar(/\( modoDeLaFisica > 5\.5 && modoDeLaFisica < 6\.5 \) \) mundo = \( uLogo/.test(sim7), '  la pegada acompaña al logo (guardada en su espacio)')

cerrar('s32-escena7')
