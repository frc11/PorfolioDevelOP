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
 * T8 · la niebla de afuera: 6c y 6d en un solo efecto, encendido, más densa, que esconde las filas de atrás,
 *      se abre con la velocidad y se posa rápido; sin planos, sin repetición, sin escalones.
 * T9 · el haz se enciende: encendido; falla más tiempo y más tenue que la luz final, prende con un golpe
 *      y queda más arriba; la histéresis de siempre; las motas, la sombra y el rebote siguen su intensidad.
 * T10 · la nitidez del polvo: encendida; motas chicas y definidas, sólo las muy cercanas desenfocadas y
 *      poco; menos bokeh y más chico; el aire caliente (6f), borrado.
 * T12 · el haz en el piso: de noche el piso iluminado aclara apenas la cara de abajo del logo; sigue la
 *      intensidad del haz. [ESCENA 8] Las sombritas de las motas se borraron.
 * T11 · el amanecer ([ESCENA 8] T3: encendido y atado al scroll; el avance, en s33): el orden (estrellas, resplandor, filas de afuera adentro, la
 *      trama, el piso, el logo), la compuerta, que no quede atrás del scroll, y la vuelta escondida.
 * T13 · las pruebas nuevas: [ESCENA 8] la estrella fugaz, encendida (de noche, detrás de la trama, cada 5
 *      a 10 s, tenue y rápida); las fibras, el foco que busca y el grano, borrados.
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
import { ABRE_CON } from '../formacion/Formacion'
import { CORRIDO_POR_PIXEL, RASANTE } from '../niebla/rasante'
import { ENCENDIDO, FALLA_S, FIRME, GUION, GUION_S, avanzarElEncendido, encendidoInicial, guionEn, type EstadoDelEncendido } from '../entorno/encendido'
import { BOKEH_NITIDO, NITIDEZ, ladoDeLaMota } from '../polvo/nitidez'
import { BOKEH_COUNT, BOKEH_SIZE, PARTICLE_SIZE } from '../probeParticles'
import { REBOTE } from '../entorno/Rebote'
import { AMANECER, amanecerEn, frenteEn, frenteHasta, momentoEn } from '../amanecer/linea'
import type { BloqueOpaco } from '../nocheDisparada'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'
import { FUGAZ, franjaLibre, trayectoriaDeLaFugaz } from '../estrellas/Fugaz'

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
// El techo del ojo: con la cámara al ras (Números, 0,7 u sobre el piso) una cresta con el anillo encima subía
// un bloque cercano por encima de la cámara y tapaba medio cuadro. Modelo del techo blando del shader.
const ojo = PISO_VIVO.ojo
const techoBlando = (x: number, techo: number): number => (x > techo - ojo.suave ? techo - ojo.suave * Math.exp(-(x - techo + ojo.suave) / ojo.suave) : x)
const aLaAltura = (alto: number, d: number): number => ojo.margen - Math.max(0, d - ojo.desde) * ojo.sube - alto
let cercaDebajo = true
let asomaMax = 0
for (const alto of [0.3, 0.5, 0.7, 1.2, 3]) for (let d = 0.5; d <= FLOOR_RADIUS; d += 0.5) for (let x = -0.4; x <= 1.2; x += 0.02) {
  const tapa = techoBlando(x, alto - aLaAltura(0, d))
  if (d <= ojo.desde && tapa > alto - ojo.margen + 1e-9) cercaDebajo = false
  asomaMax = Math.max(asomaMax, (Math.atan2(tapa - alto, d) * 180) / Math.PI)
}
afirmar(cercaDebajo && asomaMax < 1.2, 'nunca por encima del ojo: a menos de 6 u cada tapa queda 0,15 debajo de la cámara; lejos asoma sobre el horizonte, como mucho', `${asomaMax.toFixed(2)}° (con alturas de hasta 1,2 u y la cámara de 0,3 a 3 u sobre el piso)`)
controlPositivo('el detector VE un bloque por encima del ojo (el medido en Números: la cámara a 0,7, el bloque a 0,72 a 2 u)', { alto: 0.7, tapa: 0.72, d: 2 }, (c: { alto: number; tapa: number; d: number }) => !(c.d <= ojo.desde && c.tapa > c.alto - ojo.margen))
afirmar(/if \( uCamara\.y > \$\{f\(FLOOR_Y\)\} \) \{/.test(bloques) && /state\.camera\.getWorldPosition\(m\.ojo\)\)/.test(pisoVivo) && /uCamara\.value as THREE\.Vector3\)\.copy\(camara\)/.test(pisoVivo), '  el techo sale de la cámara de cada paso, sólo con la cámara arriba del piso (y lo leen los bloques, el polvo posado y la mancha)')
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
// [ESCENA 9] T1: el obstáculo entero (el rodeo del flujo, el contacto y la holgura) se borró, código y bandera: lo afirma
// s35. Queda lo que T7 había sacado (los remolinos de 6b y la burbuja), que no tiene que volver.
titulo('T7 · el obstáculo (borrado en ESCENA 9): lo que T7 sacó no vuelve')
afirmar(!('obstaculo' in ENTORNO), 'la bandera del obstáculo no existe')
const REMOLINOS = /remolinos|vientoDeLaEstela|uRemolinos|soltarRemolinos|FISICA\.estela/
afirmar(!codigo(ESCENA).some((c) => REMOLINOS.test(c)) && !('remolinos' in entornoPedido('producto,remolinos').pruebas), '6b · los remolinos se borraron: ni el código ni la bandera')
controlPositivo('el detector VE un remolino', 'uniform vec4 uRemolinos[ 6 ];', (c: string) => !REMOLINOS.test(c))
const BURBUJA = /uAbrir|alAbrir|ABRE_TAU_S/
afirmar(!codigo(ESCENA).some((c) => BURBUJA.test(c)), 'sin burbuja: nada se abre con la velocidad ni se cierra a la fuerza')
controlPositivo('el detector VE la burbuja', 'HOLGURA_DEL_CAMPO + uAbrir * 3.20', (c: string) => !BURBUJA.test(c))
// ── T8 · la niebla de afuera ──────────────────────────────────────────────
titulo('T8 · la niebla de afuera: 6c y 6d, un solo efecto')
afirmar(ENTORNO.niebla && !BASE_LIMPIA.niebla && !entornoPedido('producto,niebla=no').niebla, 'encendida en el producto; el banco la apaga con `niebla=no`')
const pruebas7 = entornoPedido('producto,rasante,velocidad').pruebas
afirmar(!('nieblaRasante' in pruebas7) && !('nieblaVelocidad' in pruebas7), '  un solo efecto: ya no hay una bandera para la rasante y otra para la velocidad')
afirmar(RASANTE.densidad.fondo > 2 * 0.45 && RASANTE.hasta === FORMACION.radioDelPisoDeAbajo, 'más densa (ESCENA 6: 0,45 por unidad) y en todo el piso de la formación', `de ${String(RASANTE.densidad.adelante)} adelante a ${String(RASANTE.densidad.fondo)} en el fondo, hasta ${String(RASANTE.hasta)}`)
afirmar(RASANTE.alto.minimo + RASANTE.alto.suma < 5 * FORMACION.escala && RASANTE.alto.minimo + RASANTE.alto.suma + RASANTE.alto.fondo > 5 * FORMACION.escala, 'adelante es baja (no tapa una copia entera); atrás tapa copias enteras: esconde las filas de atrás', `adelante hasta ${(RASANTE.alto.minimo + RASANTE.alto.suma).toFixed(1)} u, atrás hasta ${(RASANTE.alto.minimo + RASANTE.alto.suma + RASANTE.alto.fondo).toFixed(1)} u; una copia, ${(5 * FORMACION.escala).toFixed(1)} u`)
afirmar(RASANTE.pasos >= 10 && leer('StudioFloor.tsx').includes('CORRIDO_POR_PIXEL') && CORRIDO_POR_PIXEL.includes('gl_FragCoord'), 'sin escalones: integrada en tramos corridos por píxel en el piso (y por vértice en las copias)')
afirmar(!/Plane|Sprite|PlaneGeometry/.test(leer('niebla/rasante.ts')), '  sin planos: es una densidad en el espacio')
afirmar(/mat2\( cos\( a \), sin\( a \), - sin\( a \), cos\( a \) \)/.test(leer('niebla/rasante.ts')) && /z \* 1\.7/.test(leer('niebla/rasante.ts')), '  sin repetición: el ruido gira y cambia de forma con el tiempo')
afirmar(RASANTE.abre.rasante < 1 && RASANTE.abre.neblina < 1, 'con el scroll rápido se abre (pero no se borra del todo)')
afirmar(ABRE_CON.bajaS < 0.7, '  y al frenar se vuelve a posar rápido', `en ${String(ABRE_CON.bajaS)} s (ESCENA 6: 0,7 s)`)
afirmar(MOIRE_NEAR_RADIUS < RASANTE.desde, 'nunca entra a la trama')

// ── T9 · el haz se enciende ───────────────────────────────────────────────
titulo('T9 · el haz se enciende, más notorio')
afirmar(ENTORNO.hazEncendido && !BASE_LIMPIA.hazEncendido && !entornoPedido('producto,encendido=no').hazEncendido, 'encendido en el producto; el banco lo apaga con `encendido=no`')
const muestras = Array.from({ length: Math.round(GUION_S * 1000) }, (_u, i) => [i / 1000, guionEn(i / 1000)] as const)
const falla = muestras.filter(([s]) => s < FALLA_S).map(([, k]) => k)
const golpe = Math.max(...muestras.filter(([s]) => s >= FALLA_S).map(([, k]) => k))
afirmar(Math.max(...falla) < FIRME && Math.max(...falla) > 0.2, 'los intentos que fallan, más tenues que la luz final', `el más fuerte, ${Math.max(...falla).toFixed(2)}; la luz final, ${String(FIRME)}`)
afirmar(FIRME > 1 && golpe > FIRME, 'el encendido final, más fuerte: un golpe que se asienta más arriba que el haz de ESCENA 6', `golpe ${golpe.toFixed(2)}, firme ${String(FIRME)} (ESCENA 6: firme 1)`)
afirmar(FALLA_S > 1.25 && GUION.filter(([, , k]) => k < FIRME).length >= 3, 'la falla dura más que en ESCENA 6 y son varios intentos ([ESCENA 8] T1 los bajó a la mitad: la cuenta, en s33)', `${String(FALLA_S)} s, ${String(GUION.filter(([, , k]) => k < FIRME).length)} intentos (ESCENA 6: 1,25 s)`)
afirmar(falla.some((k) => k === 0) && guionEn(FALLA_S - 0.1) === 0, '  entre intento e intento, y antes del golpe, se apaga (se entiende que falla)')
controlPositivo('el detector VE un guion de ESCENA 6 (destellos por encima del final)', [2.2, 1.8, 1.35], (picos: number[]) => Math.max(...picos) < 1)
const correr = (e: EstadoDelEncendido, noches: readonly number[], desde: number, dt = 0.05): { e: EstadoDelEncendido; fases: string[] } => {
  let t = desde
  const fases: string[] = []
  for (const n of noches) {
    e = avanzarElEncendido(e, n, t, false)
    fases.push(e.fase)
    t += dt
  }
  return { e, fases }
}
const noche = (s: number): number[] => Array.from({ length: Math.round(s / 0.05) }, () => 1)
const dia = (s: number): number[] => Array.from({ length: Math.round(s / 0.05) }, () => 0)
const ida = correr(encendidoInicial(0, 0), noche(GUION_S + 0.5), 0)
afirmar(ida.fases.includes('encendiendo') && ida.e.fase === 'prendido' && ida.e.k === FIRME, 'cae la noche: el guion, y termina prendido en la luz final')
const vuelta = correr(ida.e, dia(ENCENDIDO.apagaS + 0.2), GUION_S + 0.5)
afirmar(vuelta.e.fase === 'apagado' && vuelta.e.k === 0, 'vuelve el día: se apaga suave hasta cero')
const otra = correr(vuelta.e, noche(1), GUION_S + 0.5 + ENCENDIDO.apagaS + 0.2)
afirmar(!otra.fases.includes('encendiendo') && otra.e.fase === 'prendido', 'otra vez de noche enseguida: prende sin repetir la falla (histéresis)')
const aireTsx = leer('polvo/Aire.tsx')
// [ESCENA 10] T1: con la noche EN EL LOGO (la del amanecer, hasta que su frente lo alcanza), no la de la sala.
// [CIERRE RETOQUE 3D] B3: las motas, la sombra y la lámpara con su parte del encendido (`repartoDelEncendido`, s42).
afirmar(/Math\.min\(1, VIVO\.uNocheDelLogo\.value \* HAZ_ENCENDIDO\.motas\)/.test(aireTsx) && /uBrilloDeLasMotas\.value = Math\.max\(1, HAZ_ENCENDIDO\.k\)/.test(aireTsx), 'las motas siguen su intensidad (el destello sube; el freno no pasa del de siempre)')
afirmar(/manchasDelHaz\(VIVO\.uNocheDelLogo\.value, HAZ_ENCENDIDO\.luz,/.test(leer('ContactOcclusion.tsx')) && /nivel\.noche\[0\] \* reparto\.luz/.test(leer('entorno/Entorno.tsx')), '  y la sombra según el haz, la columna, el charco y el polvo del haz también')

// ── T10 · la nitidez del polvo ────────────────────────────────────────────
titulo('T10 · el polvo nítido')
afirmar(ENTORNO.nitidez && !BASE_LIMPIA.nitidez && !entornoPedido('producto,nitidez=no').nitidez, 'encendida en el producto; el banco la apaga con `nitidez=no`')
const CALOR = /aireCaliente|__calorDelBanco|CALOR\b|<Calor/
afirmar(!existsSync(path.join(ESCENA, 'entorno/Calor.tsx')) && !codigo(ESCENA).some((c) => CALOR.test(c)), '6f · el aire caliente se borró: ni el componente, ni la bandera, ni la pasada extra')
controlPositivo('el detector VE el aire caliente', '<Calor calidad={calidad} />', (c: string) => !CALOR.test(c))
// El lado de una mota a 900 px de alto: lo de antes (0,17 × 450 / d) contra el de ahora.
const antes = (d: number): number => (PARTICLE_SIZE * 450) / d
let enFocoMax = 0
for (let d = NITIDEZ.desenfocaDesde; d <= 24; d += 0.25) enFocoMax = Math.max(enFocoMax, ladoDeLaMota(antes(d), d).enFoco + ladoDeLaMota(antes(d), d).desenfoque)
afirmar(enFocoMax <= NITIDEZ.tam[1] + 1e-9, 'todas nítidas: de la distancia de foco en adelante ninguna mota pasa de 3,2 px', `a 4 u antes medía ${antes(4).toFixed(0)} px; ahora ${String(NITIDEZ.tam[1])}`)
const cerca = ladoDeLaMota(antes(NITIDEZ.cerca), NITIDEZ.cerca)
afirmar(cerca.desenfoque > 0 && cerca.enFoco + cerca.desenfoque < 12, 'sólo las muy cercanas se desenfocan, y poco', `la más cercana (${String(NITIDEZ.cerca)} u) mide ${(cerca.enFoco + cerca.desenfoque).toFixed(1)} px; antes, ${antes(3.5).toFixed(0)} px a 3,5 u`)
afirmar(NITIDEZ.cerca < 3.5, '  (se desvanece contra la lente más cerca que antes: quedan unas pocas, no una nube)')
afirmar(/0\.75 \/ max\( vLadoN, 1\.0 \)/.test(leer('polvo/nitidez.ts')) && /#ifdef POLVO_NITIDO/.test(leer('polvo/parche.ts')), 'el borde de la mota es de un píxel (no el sprite blando)')
afirmar(BOKEH_NITIDO.cuantos <= BOKEH_COUNT / 2 && BOKEH_NITIDO.tam <= BOKEH_SIZE / 2, 'menos bokeh y más chico', `${String(BOKEH_NITIDO.cuantos)} discos de ${String(BOKEH_NITIDO.tam)} (antes ${String(BOKEH_COUNT)} de ${String(BOKEH_SIZE)})`)

// ── T12 · el haz en el piso ───────────────────────────────────────────────
titulo('T12 · el piso rebota luz (las sombras de las motas, borradas en ESCENA 8)')
afirmar(ENTORNO.rebote && !BASE_LIMPIA.rebote && !entornoPedido('producto,rebote=no').rebote, 'encendido en el producto; el banco lo apaga con `rebote=no`')
const SOMBRITAS = /materialDeLasSombras|SOMBRAS_EN_VIVO|polvo\/sombras/
afirmar(!existsSync(path.join(ESCENA, 'polvo/sombras.ts')) && !codigo(ESCENA).some((c) => SOMBRITAS.test(c)), '[ESCENA 8] las sombritas de las motas se borraron: ni el archivo ni la pasada')
controlPositivo('el detector VE la pasada de las sombritas', "import { SOMBRAS_EN_VIVO, materialDeLasSombras } from './polvo/sombras'", (c: string) => !SOMBRITAS.test(c))
const rebote = leer('entorno/Rebote.tsx')
afirmar(/uRebote\.current\.value = REBOTE\.cuanto \* VIVO\.uNocheDelLogo\.value/.test(rebote) && /charcoDelHaz\( vMundoDelRebote\.xz \) \* uRebote \* abajo \* cerca/.test(rebote) && REBOTE.cuanto <= 1, 'de noche, la luz del charco aclara la cara de abajo del logo (más cerca del piso, más)')
afirmar(!/Rebote|rebote/.test(readFileSync(path.join(ESCENA, 'ProbeLogo.tsx'), 'utf8')), '  sin tocar `ProbeLogo`: el parche es sobre su material')
// [CIERRE RETOQUE 3D] B3: el charco con la luz del reparto del encendido.
afirmar(/nivel\.noche\[1\] \* reparto\.luz/.test(leer('entorno/Entorno.tsx')), '  sigue la intensidad del haz (el charco de noche lleva el encendido, T9)')

// ── T11 · el amanecer ─────────────────────────────────────────────────────
titulo('T11 · el amanecer: un evento de luz ([ESCENA 8] encendido)')
afirmar(ENTORNO.amanecer && !BASE_LIMPIA.amanecer && !entornoPedido('producto,amanecer=no').amanecer, '[ESCENA 8] encendido en el producto; el banco lo apaga con `amanecer=no`')
afirmar(!existsSync(path.join(ESCENA, 'dia')) && !codigo(ESCENA).some((c) => /dia=afuera|DIA_DESDE_AFUERA|hayDiaDesdeAfuera/.test(c)), '  6g se volvió el amanecer: la carpeta `dia/` no existe y nada nombra la variante vieja')
// El orden, en el reloj del amanecer.
const estrellasFuera = AMANECER.estrellas[1]
const resplandorArriba = AMANECER.resplandor[1]
const alaTrama = frenteHasta(44)
const alPiso = frenteHasta(38)
const alLogo = frenteHasta(3)
afirmar(momentoEn(0).estrellas === 1 && momentoEn(estrellasFuera).estrellas === 0 && estrellasFuera < AMANECER.cambio, '1 · antes de que entre la luz se apagan las estrellas (la sala sigue de noche)', `se apagan en ${String(estrellasFuera)} s; la luz entra a los ${String(AMANECER.cambio)} s`)
afirmar(momentoEn(resplandorArriba - 0.01).resplandor > 0.99 && momentoEn(resplandorArriba - 0.01).sostieneLaNoche && momentoEn(resplandorArriba - 0.01).frente >= FORMACION.hasta, '2 · la luz nace en el horizonte, detrás de la formación, con la sala todavía de noche (a contraluz)')
let baja = true
for (let t = AMANECER.cambio; t < AMANECER.final; t += 0.01) if (frenteEn(t + 0.01) > frenteEn(t) + 1e-9) baja = false
afirmar(baja && frenteEn(AMANECER.cambio) > FORMACION.hasta && frenteHasta(FORMACION.radioDeLaPrimeraFila) > frenteHasta(FORMACION.hasta), '3 · el frente avanza fila por fila, de las lejanas a las cercanas', `la última fila a los ${frenteHasta(FORMACION.hasta).toFixed(2)} s, la primera a los ${frenteHasta(FORMACION.radioDeLaPrimeraFila).toFixed(2)} s`)
const [r0, r1, r2] = AMANECER.rayos
afirmar(r0 < alaTrama && r1 >= alaTrama - 0.3 && r1 <= alPiso + 0.3 && r2 > alPiso, '4 · entra por los cuadrados de la trama: los haces pican cuando el frente cruza la trama', `la trama a los ${alaTrama.toFixed(2)}–${alPiso.toFixed(2)} s; los haces pican a los ${String(r1)} s`)
afirmar(alPiso < alLogo && alLogo <= AMANECER.final, '5 · llega al piso vivo y, por último, al logo', `el piso a los ${alPiso.toFixed(2)} s, el logo a los ${alLogo.toFixed(2)} s; todo asentado a los ${String(AMANECER.final)} s`)
afirmar(/delanteDeLaTrama\( \$\{mundo\}, uSolDelAmanecer \)/.test(leer('amanecer/luz.ts')) && /suma \+= delanteDeLaTrama\( p, uSolDelAmanecer \)/.test(leer('amanecer/haces.ts')), '  el sol pasa por los huecos de las dos capas: cuadros de luz en el piso y haces en el aire') // [CALIDAD 1] B5: los haces se mudaron a haces.ts
afirmar(/mix\( vec3\( \$\{LOGO_DE_NOCHE/.test(leer('amanecer/luz.ts')) && /mix\( vec3\( 1\.0 \), diffuseColor\.rgb, alcanzadoPorElDia/.test(leer('polvo/parche.ts')), '  el logo guarda su gris de noche y el polvo su blanco hasta que el frente los alcanza (el logo es lo último)')
// La compuerta y el scroll.
const bloque = (pie: number): BloqueOpaco => ({ servicios: { tope: pie - 4500, pie: pie - 1800 }, tuPanel: { tope: pie - 1800, pie }, alto: 900 })
let prendido = false
const bajando: boolean[] = []
for (let pie = 3000; pie >= 0; pie -= 10) {
  prendido = amanecerEn(bloque(pie), prendido, (pie - 4500 + pie) / 2 < 450)
  bajando.push(prendido)
}
const primero = 3000 - bajando.indexOf(true) * 10
afirmar(primero < 900 * AMANECER.visible && primero > 900 * AMANECER.visible - 20, 'el momento: arranca cuando el borde de Tu panel deja ver la sala', `con el borde en ${String(primero)} px de 900`)
const subiendo: boolean[] = []
for (let pie = 0; pie <= 3000; pie += 10) {
  prendido = amanecerEn(bloque(pie), prendido, (pie - 4500 + pie) / 2 < 450)
  subiendo.push(prendido)
}
afirmar(subiendo.lastIndexOf(true) * 10 > 900, 'la vuelta a la noche sigue escondida (se apaga con el bloque tapando todo)')
afirmar(AMANECER.minimoS >= 2.5 && !('acelera' in AMANECER) && !('titulo' in AMANECER), '[ESCENA 8] ya no es un reloj que se acelera: el avance persigue al scroll con una velocidad tope (s33, T3)', `de punta a punta, ${String(AMANECER.minimoS)} s como mínimo`)
afirmar(/NOCHE_DEL_AMANECER\.sostenida \? 0 : NOCHE_DISPARADA\.cantidad|!NOCHE_DEL_AMANECER\.sostenida \? 0/.test(leer('nocheDisparada.ts')), 'la sala sigue de noche hasta que entra la luz (la noche se sostiene)')

// ── T13 · las pruebas nuevas ──────────────────────────────────────────────
titulo('T13 · la estrella fugaz, encendida; fibras, foco que busca y grano, borrados (ESCENA 8)')
afirmar(ENTORNO.fugaz && !BASE_LIMPIA.fugaz && !entornoPedido('producto,fugaz=no').fugaz && entornoPedido('fugaz').fugaz, 'la fugaz, encendida en el producto; el banco la apaga con `fugaz=no`')
const BORRADAS = /<Fibras|<Enfoque|<Grano|__enfoqueDelBanco|POLVO_ENFOQUE|uBusca|GRANO\b|FIBRAS\b/
afirmar(!existsSync(path.join(ESCENA, 'pruebas')) && !codigo(ESCENA).some((c) => BORRADAS.test(c)), 'las fibras, el foco que busca y el grano se borraron: ni los archivos ni el montaje ni el parche del polvo')
controlPositivo('el detector VE el montaje del grano', '<Grano />', (c: string) => !BORRADAS.test(c))
afirmar(!['fibras', 'enfoque', 'grano'].some((b) => b in entornoPedido('producto,fibras,enfoque,grano').pruebas), '  y sus banderas tampoco existen')
afirmar(leer('ProbeStage.tsx').includes('<Fugaz rig={rig} />'), '  la fugaz, montada en la escena')
// La estrella fugaz.
const fugaz = leer('estrellas/Fugaz.tsx')
afirmar(FUGAZ.cada[0] === 5 && FUGAZ.cada[1] === 10, 'fugaz: cada 5 a 10 s')
afirmar(FUGAZ.dura[1] < 1 && FUGAZ.brillo < 1, '  tenue y rápida', `cruza en ${String(FUGAZ.dura[0])} a ${String(FUGAZ.dura[1])} s, con ${String(FUGAZ.brillo)} de brillo en el pico`)
afirmar(/VIVO\.uNoche\.value >= FUGAZ\.noche/.test(fugaz) && /fueraDelTunel\(rig\.current\.progress\) > 0\.99/.test(fugaz), '  sólo de noche y fuera del túnel')
const leeLaTrama = (c: string): boolean => /\* delanteDeLaTrama\( cameraPosition, d \)/.test(c)
afirmar(leeLaTrama(fugaz) && /renderOrder = MOIRE_FAR_ORDER - 1/.test(fugaz), '  detrás de la trama y de la formación: lee la trama como las estrellas y se dibuja antes que ella')
controlPositivo('el detector VE una fugaz delante de la trama', 'vAlfa = uBrillo * aK * aK * aparece;', leeLaTrama)
// Los dos extremos en el cuadro y fuera del logo: el arco (un círculo máximo alrededor del ojo) se proyecta como una recta.
const adentro = (tr: readonly number[]): boolean => tr.every((v) => Math.abs(v) <= FUGAZ.borde)
const enLaFranja = (tr: readonly number[], [a, b]: readonly [number, number]): boolean => adentro(tr) && [tr[0], tr[2]].every((x) => x >= a - 1e-9 && x <= b + 1e-9)
// Logos de prueba en el cuadro: el de Números (a la izquierda, medido), uno al centro, uno a la derecha, uno abajo.
const LOGOS = [{ x0: -0.85, x1: -0.05, y0: -0.55, y1: 0.75 }, { x0: -0.3, x1: 0.3, y0: -0.5, y1: 0.5 }, { x0: 0.2, x1: 0.9, y0: -0.4, y1: 0.6 }, { x0: -0.4, x1: 0.4, y0: -0.9, y1: 0.1 }] as const
let cruzan = 0
let bien = true
for (const logo of [...LOGOS, null]) {
  const libre = franjaLibre(logo)
  if (logo !== null && logo.y1 >= 0.19 && (libre[0] < logo.x1 + 1e-9 && libre[1] > logo.x0 - 1e-9)) bien = false
  for (let n = 0; n < 400; n += 1) {
    const tr = trayectoriaDeLaFugaz(n, libre)
    if (tr === null) continue
    cruzan += 1
    if (!enLaFranja(tr, libre) || tr[3] >= tr[1] || Math.abs(tr[2]) > Math.abs(tr[0]) + FUGAZ.recorre.x[1]) bien = false
  }
}
afirmar(bien && cruzan > 1500, '  nace arriba, en el lado que el logo deja libre, y cae de costado: el trazo entero en el cuadro y sin pasar detrás del logo', `${String(cruzan)} de 2.000 con cinco logos de prueba`)
controlPositivo('el detector VE un trazo que sale del cuadro (el medido antes del arreglo)', [-0.75, 0.66, -1.07, 0.38], (tr: readonly number[]) => adentro(tr))
controlPositivo('el detector VE un trazo detrás del logo (el medido en Números)', [-0.5, 0.48, -0.27, 0.35], (tr: readonly number[]) => enLaFranja(tr, franjaLibre(LOGOS[0])))
afirmar(/if \(tr === null \|\| Math\.min\(desde\.y, hasta\.y\) < f\.horizonte\)/.test(fugaz) && /franjaLibre\(logoEnElCuadro\(camara\)\)/.test(fugaz), '  la franja sale del logo proyectado en cada cruce; si no hay cielo libre, esa no sale (ni tapada por el piso ni por el logo)')
cerrar('s32-escena7')
