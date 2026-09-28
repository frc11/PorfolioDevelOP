/**
 * SPRINT ESCENA 7 — lo que la ronda 3 promete sin navegador. Cada afirmación lleva su control positivo
 * donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T2 · la formación, «la fábrica gigante»: encendida, sin fallas, negra, en un piso plano, con muchas
 *      más filas, un poco menos densa, en bandas intercaladas; el presupuesto, la cámara y 375.
 * T3 · el cielo de noche: encendido, siempre detrás de la trama, más denso y más luminoso, con la vía
 *      láctea (banda difusa con franjas de polvo) cruzando el cielo que se ve; monocromo, nítido, lento.
 * T4 · el polvo que se posa: encendido, con los tiempos a la mitad; el remolino, a velocidad real.
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
afirmar(/if \(!e\.polvoParejo \|\| \(!e\.posarse/.test(fisica), '  y la física corre en el producto (con el polvo parejo)')

cerrar('s32-escena7')
