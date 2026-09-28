/**
 * SPRINT ESCENA 6 — lo que la ronda 2 promete sin navegador. Cada afirmación lleva su control
 * positivo donde el chequeo podría pasar por no mirar nada.
 *
 * §1 · las banderas: 5a, 5c y 5d en el producto; las pruebas nuevas apagadas y el pedido del banco.
 * §2 · los fondos del texto: la máscara del pulso no existe más, en ningún lado.
 * §3 · la formación: continua en los 360°, uniforme, mirando al centro, intercalada; las fallas sólo
 *      en la pieza; NINGUNA perfecta (tampoco sin fallas visibles); el presupuesto; la cámara; 375.
 * §4 · las estrellas: muchas débiles y pocas brillantes, el halo sólo en las brillantes, y la banda
 *      cubre todo el cielo que se ve por encima del piso.
 * §5 · el polvo con física: los tiempos de siempre, los modos, la estela de 6b que no pasa de unos metros.
 * §6 · el piso vivo: el presupuesto de bloques en los dos radios y los planos del piso escondidos.
 * §7 · 6e: el encendido parpadea una vez, se asienta, y la frontera de la noche no lo repite.
 * §8 · 6g: la compuerta de la variante se ve al bajar y vuelve escondida; el frente va de afuera adentro.
 * §9 · 6c y 6d: la niebla rasante vive afuera y baja; la velocidad la abre pero no la borra.
 * §10 · la limpieza: el relieve (R1/R2), las cajas de texto y F-mirada no dejan código.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { MOUSE_HEIGHT_FACTOR } from '../choreographyPhysics'
import { buildTrack, sampleTrack } from '../choreographySampler'
import type { MutableChoreoPose } from '../choreographyTypes'
import { DIA_DESDE_AFUERA, diaDesdeAfueraEn, frenteEn } from '../dia/desdeAfuera'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { ENCENDIDO, GUION_S, avanzarElEncendido, encendidoInicial, guionEn, type EstadoDelEncendido } from '../entorno/encendido'
import { ESTRELLAS } from '../estrellas/Estrellas'
import { FALLAS, FORMACION, anguloDe, esPerfecta, formar, radioDeLaFila, triangulosDeLaFormacion, type Copia, type MedidasDeLaCopia } from '../formacion/enFormacion'
import { REGION } from '../formacion/regiones'
import type { BloqueOpaco } from '../nocheDisparada'
import { RASANTE } from '../niebla/rasante'
import { PISO_VIVO, grillaDelPiso } from '../piso/bloques'
import { FISICA } from '../polvo/simulacion'
import { POSARSE, avanzarElPolvo, polvoInicial, NUNCA } from '../polvo/posarse'
import { CAMERA_FOV, FLOOR_RADIUS, FLOOR_Y } from '../probeScene'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · 5a, 5c y 5d en el producto; lo nuevo apagado')
afirmar(ENTORNO.obstaculo && ENTORNO.sombraHaz && ENTORNO.motas, 'el producto trae el obstáculo (5a), la sombra según el haz (5c) y las motas (5d)')
afirmar(ENTORNO.moire && ENTORNO.polvoParejo, '  y sigue con el moiré vivo y el polvo parejo')
afirmar(!BASE_LIMPIA.obstaculo && !BASE_LIMPIA.sombraHaz && !BASE_LIMPIA.motas, '  la base, sin ninguno')
afirmar(Object.values(PRUEBAS_APAGADAS).every((v) => v === false || v === 'no'), 'todas las pruebas de ESCENA 6 van apagadas', JSON.stringify(PRUEBAS_APAGADAS))
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, '  y el producto no trae ninguna')
const pedido = entornoPedido('producto,formacion,fallas=no,estrellas,posarse,piso=pulso,inercia,remolinos,rasante,velocidad,encendido,calor,dia=afuera')
afirmarIgual(
  pedido.pruebas,
  { formacion: true, sinFallasVisibles: true, estrellas: true, posarse: true, pisoVivo: 'pulso', inercia: true, remolinos: true, nieblaRasante: true, nieblaVelocidad: true, hazEncendido: true, aireCaliente: true, diaDesdeAfuera: true },
  'el pedido del banco prende cada prueba',
)
afirmar(entornoPedido('producto,piso').pruebas.pisoVivo === 'si', '  `piso` es el piso vivo sin el pulso')
const sin = entornoPedido('producto,obstaculo=no,sombra=blanda,motas=no')
afirmar(!sin.obstaculo && !sin.sombraHaz && !sin.motas && sin.E1 && sin.moire, 'el banco puede apagar 5a, 5c y 5d para comparar, y el resto sigue')
controlPositivo('el detector VE un producto sin 5c', 'producto,sombra=blanda', (p: string) => entornoPedido(p).sombraHaz)

// ── §2 · los fondos del texto ─────────────────────────────────────────────
titulo('§2 · la máscara de texto del pulso no existe más')
const MASCARA = /uTexto|fueraDelTexto|CAJAS_DE_TEXTO|leerCajasDeTexto|mascaraDeTexto|uPluma/
afirmar(!existsSync(path.join(ESCENA, 'entorno/cajasDeTexto.ts')), '`entorno/cajasDeTexto.ts` no existe')
afirmar(!['entorno/Pulso.tsx', 'entorno/vivo.ts', 'entorno/Entorno.tsx', 'entorno.ts'].some((f) => MASCARA.test(leer(f))), '  y ni el pulso, ni lo compartido, ni el entorno, ni las banderas la nombran')
controlPositivo('el detector VE la máscara vieja', 'uniform vec4 uTexto[ 6 ];', (c: string) => !MASCARA.test(c))
afirmar(/float cuanto = cuantoDelPulso\( length\( vPlano \) \);/.test(leer('entorno/Pulso.tsx')), 'el anillo se dibuja entero: su cuenta no lleva ningún factor de texto')

// ── §3 · la formación ─────────────────────────────────────────────────────
titulo('§3 · la formación: completa, uniforme, fallada sólo en la pieza')
// Una «cp» de juguete con las medidas del logo (6,86 × 5,0): alcanza para las reglas, que no miran la malla.
const medidas: MedidasDeLaCopia = { ancho: 6.86, alto: 5, caja: () => ({ x0: -3.43, x1: 3.43, y0: 0, y1: 5, z0: -0.28, z1: 0.28 }) }
const f = FORMACION
const todas: { nombre: string; copias: Copia[] }[] = []
for (const semilla of [0x0cf0a11a, 1, 2, 3, 4, 5, 6, 7]) for (const sinFallasVisibles of [false, true]) todas.push({ nombre: `semilla ${String(semilla)}${sinFallasVisibles ? ' sin fallas visibles' : ''}`, copias: formar(medidas, { semilla, sinFallasVisibles }) })
const sanas = todas.flatMap((t) => t.copias.filter(esPerfecta).map(() => t.nombre))
afirmar(sanas.length === 0, 'NINGUNA copia sale perfecta, con ninguna semilla ni en la variante sin fallas visibles', `${String(todas.reduce((n, t) => n + t.copias.length, 0))} copias revisadas`)
const sana: Copia = { x: 50, z: 0, mira: 0, columna: 0, fila: 0, falla: 'blanca', pieza: { region: REGION.todo, corte: 0, tono: f.tono.base, otra: null } }
controlPositivo('una copia sana, armada a mano, SÍ se detecta como perfecta', [sana], (copias) => copias.filter(esPerfecta).length === 0)
const base = formar(medidas)
const usadas = new Set(base.map((c) => c.falla))
afirmar(FALLAS.every((x) => usadas.has(x)), 'cada falla de pieza aparece en la formación', `${String(usadas.size)} de ${String(FALLAS.length)}`)
const DE_SILUETA = /girada|Girada|chica|Chica|vuelta|Vuelta|espejad|montad|torcid|invertid|corrid|caid|separad|desalinead|espesor/
afirmar(!FALLAS.some((x) => DE_SILUETA.test(x)), 'no queda ninguna falla que cambie la escala, el giro o la posición', FALLAS.join(', '))
controlPositivo('el detector VE una falla de silueta', ['soloC', 'espejado'], (lista: string[]) => !lista.some((x) => DE_SILUETA.test(x)))
const piezaCampos = Object.keys(base[0].pieza).sort().join(',')
afirmar(piezaCampos === 'corte,otra,region,tono', '  y la pieza ya no tiene giro, escala ni corrimiento: sólo qué parte y qué tono', piezaCampos)
const sinFallas = formar(medidas, { sinFallasVisibles: true })
afirmar(sinFallas.every((c) => c.pieza.region === REGION.todo && c.pieza.otra === null && Math.abs(c.pieza.tono - f.tono.base) <= f.tonoApenas), 'sin fallas visibles: todas enteras, del tono de siempre salvo un corrimiento de ±1,2 %')
// Continua en los 360°: en cada fila, las columnas parejas alrededor de la vuelta.
let peorHueco = 0
for (let fila = 0; fila < f.filas; fila += 1) {
  const angulos = base.filter((c) => c.fila === fila).map((c) => Math.atan2(c.x, c.z)).sort((a, b) => a - b)
  afirmar(angulos.length === f.columnas, `  la fila ${String(fila + 1)} tiene sus ${String(f.columnas)} columnas`)
  for (let i = 0; i < angulos.length; i += 1) peorHueco = Math.max(peorHueco, (i + 1 < angulos.length ? angulos[i + 1] : angulos[0] + Math.PI * 2) - angulos[i])
}
afirmar(Math.abs(peorHueco - (Math.PI * 2) / f.columnas) < 1e-9, 'continua en los 360°: ningún hueco más grande que el paso (no hay bloques ni pasillos)', `paso ${((360 / f.columnas)).toFixed(2)}°`)
controlPositivo('el detector VE un pasillo', [0, 1, 2, 4, 5].map((k) => (k / 6) * Math.PI * 2), (a: number[]) => Math.max(...a.map((x, i) => (i + 1 < a.length ? a[i + 1] : a[0] + Math.PI * 2) - x)) <= (Math.PI * 2) / 6 + 1e-9)
const alCentro = base.every((c) => Math.sin(c.mira) * -c.x / Math.hypot(c.x, c.z) + Math.cos(c.mira) * -c.z / Math.hypot(c.x, c.z) > 1 - 1e-9)
afirmar(alCentro, 'todas miran al centro, al original')
const intercaladas = base.every((c) => Math.abs(anguloDe(c.columna, c.fila) - anguloDe(c.columna, 0) - (c.fila % 2) * (Math.PI / f.columnas)) < 1e-9)
afirmar(intercaladas, 'las filas van intercaladas: la impar, corrida media columna')
const pasos = Array.from({ length: f.filas - 1 }, (_u, i) => radioDeLaFila(i + 1, medidas.alto) - radioDeLaFila(i, medidas.alto))
afirmar(pasos.every((p) => Math.abs(p - pasos[0]) < 1e-9), 'el mismo paso entre filas', `${pasos[0].toFixed(2)} u`)
const pasoDeLaPrimera = (2 * Math.PI * f.radioDeLaPrimeraFila) / f.columnas
afirmar(pasoDeLaPrimera > medidas.ancho * f.escala, 'de costado no se pisan: el paso de la primera fila es más que el ancho de una copia', `${pasoDeLaPrimera.toFixed(2)} contra ${(medidas.ancho * f.escala).toFixed(2)}`)
// La huella de cada copia: un rectángulo ancho de costado (tangente) y fino de fondo (radial).
const medioAncho = (medidas.ancho * f.escala) / 2
const medioHondo = 0.3
const esquinas = (c: Copia): [number, number][] =>
  [[-medioAncho, -medioHondo], [medioAncho, -medioHondo], [medioAncho, medioHondo], [-medioAncho, medioHondo]].map(([a, b]) => [c.x + a * Math.cos(c.mira) + b * Math.sin(c.mira), c.z - a * Math.sin(c.mira) + b * Math.cos(c.mira)])
const huella = base.flatMap((c) => [...esquinas(c).map(([x, z]) => Math.hypot(x, z)), Math.hypot(c.x, c.z) - medioHondo])
afirmar(Math.min(...huella) > f.radioDelEscenario + 1, 'ninguna copia entra en el escenario (ni su borde)', `la más adentro, a ${Math.min(...huella).toFixed(2)}`)
afirmar(Math.max(...huella) + 1 < f.radioDelPisoDeAbajo, '  ni sale del piso de abajo', `la más afuera, a ${Math.max(...huella).toFixed(1)} contra ${String(f.radioDelPisoDeAbajo)}`)
afirmar(f.escala >= 0.85 && f.escala <= 1, 'del tamaño casi del logo', `escala ${String(f.escala)}`)
afirmar(triangulosDeLaFormacion() <= f.presupuesto, 'el presupuesto de triángulos', `${String(triangulosDeLaFormacion())} (medido en el banco: 33.440) contra ${String(f.presupuesto)}`)
afirmar(/calidad !== 'compacta'/.test(leer('formacion/Formacion.tsx')), 'en el teléfono (375) no hay formación')
// La cámara, en todo el recorrido: adentro de la capa gruesa y lejos de las copias.
const pista = buildTrack(CHOREO_KEYFRAMES)
const pose: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
let radioMaximo = 0
let masCerca = Infinity
for (let p = 0; p <= 1; p += 0.001) {
  sampleTrack(pista, p, pose)
  radioMaximo = Math.max(radioMaximo, pose.distance)
  for (const extra of [-8, 0, 8]) {
    const a = ((pose.angleDeg + extra) * Math.PI) / 180
    for (const c of base) {
      // La cámara en el espacio de la copia: el ancho va de costado y el espesor hacia donde mira.
      const [dx, dz] = [Math.sin(a) * pose.distance - c.x, Math.cos(a) * pose.distance - c.z]
      const costado = dx * Math.cos(c.mira) - dz * Math.sin(c.mira)
      const frente = dx * Math.sin(c.mira) + dz * Math.cos(c.mira)
      masCerca = Math.min(masCerca, Math.hypot(Math.max(0, Math.abs(costado) - medioAncho), Math.max(0, Math.abs(frente) - medioHondo)))
    }
  }
}
afirmar(radioMaximo < MOIRE_FAR_RADIUS, 'la cámara no sale nunca del cilindro de la trama', `radio máximo ${radioMaximo.toFixed(1)} contra ${String(MOIRE_FAR_RADIUS)}`)
afirmar(masCerca > 6, '  ni se acerca a una copia', `la más cercana, a ${masCerca.toFixed(1)}`)

// ── §4 · las estrellas ────────────────────────────────────────────────────
titulo('§4 · las estrellas: un cielo de verdad, donde se ve')
const clases = ESTRELLAS.clases
afirmar(Math.abs(clases.punto.parte + clases.media.parte + clases.brillante.parte - 1) < 1e-9, 'las tres clases suman todo el cielo')
afirmar(clases.punto.parte > clases.media.parte && clases.media.parte > clases.brillante.parte, 'muchas débiles y pocas brillantes', `${String(clases.punto.parte)} / ${String(clases.media.parte)} / ${String(clases.brillante.parte)}`)
afirmar(clases.punto.brillo[1] <= clases.media.brillo[1] && clases.media.brillo[1] <= clases.brillante.brillo[0], '  y las brillantes, las más brillantes')
afirmar(clases.punto.lado === 1 && clases.brillante.lado % 2 === 1 && ESTRELLAS.halo < 0.5, 'la débil es un píxel; la brillante lleva un halo mínimo (menos de la mitad del núcleo)')
afirmar(ESTRELLAS.titileo.hasta <= 0.5 && ESTRELLAS.titileo.hondo[1] < 0.5, 'el titileo es lento y leve', `hasta ${String(ESTRELLAS.titileo.hasta)} Hz, baja a lo sumo ${String(ESTRELLAS.titileo.hondo[1] * 100)} %`)
// La banda: todo lo que se ve por encima del piso de afuera, desde cualquier pose.
const cieloDesde = f.radioDelPisoDeAbajo
const sueloEnElCielo = FLOOR_Y - f.desnivel + f.pendiente * (cieloDesde - f.radioDelEscenario)
const masBajo = Math.min(...CHOREO_KEYFRAMES.map((k) => (Math.atan2(sueloEnElCielo - k.pose.height - MOUSE_HEIGHT_FACTOR * k.pose.distance, cieloDesde - k.pose.distance) * 180) / Math.PI))
const subida = Math.max(...CHOREO_KEYFRAMES.map((k) => (-Math.atan2(k.pose.height, k.pose.distance) * 180) / Math.PI))
afirmar(ESTRELLAS.elevacion.desde < masBajo, 'la banda llega abajo hasta el cielo más bajo que se ve por encima del piso', `el más bajo, ${masBajo.toFixed(1)}°; la banda arranca en ${String(ESTRELLAS.elevacion.desde)}°`)
afirmar(ESTRELLAS.elevacion.hasta > subida + CAMERA_FOV / 2, '  y arriba, hasta lo más alto que mira la cámara', `${(subida + CAMERA_FOV / 2).toFixed(1)}°`)

// ── §5 · el polvo con física ──────────────────────────────────────────────
titulo('§5 · el polvo que se posa, con física')
afirmar(POSARSE.empiezaS === 8 && POSARSE.asentadoS === 25 && POSARSE.velocidad === 16, 'los tiempos de arranque de ESCENA 5: empieza a los 8 s, en el piso a los 25, el despertar a 16 u/s')
afirmar(avanzarElPolvo(polvoInicial(0), 30, null, true).quieto === NUNCA, 'con movimiento reducido no se posa nunca')
const sim = leer('polvo/simulacion.ts')
afirmar(['modo < 0.5', 'modo > 0.5 && modo < 1.5', 'modo > 1.5 && modo < 2.5', 'modo > 2.5 && modo < 3.5', 'modo > 3.5 && modo < 4.5', 'salida0 = vec4( p, 5.0 )'].every((m) => sim.includes(m)), 'los seis modos están en la simulación (aire, cayendo, piso, logo, deslizando y, lo que queda, levantada)')
afirmar(/turbulencia\( p \)/.test(sim) && /arrastre/.test(sim), '  la caída lleva arrastre y turbulencia (no baja en línea recta)')
afirmar(FISICA.logo.cara > 0.5 && FISICA.logo.cara < 0.9, '  el polvo se queda en las caras de arriba del logo', `normal a menos de ${(Math.acos(FISICA.logo.cara) * 180 / Math.PI).toFixed(0)}° de la vertical`)
afirmar(FISICA.estela.alcance <= 4 && FISICA.estela.alto <= 5, '6b · la estela del logo no pasa de unos metros (un vórtice suelto llega lejos)', `alcance ${String(FISICA.estela.alcance)} u`)
afirmar(/despertar\.desperto - despertar\.antes > POSARSE\.empiezaS/.test(leer('polvo/Fisica.tsx')), 'el remolino del despertar sólo sopla si el polvo llegó a posarse')

// ── §6 · el piso vivo ─────────────────────────────────────────────────────
titulo('§6 · el piso vivo: el presupuesto y lo que el piso tiene encima')
for (const radio of [FLOOR_RADIUS, f.radioDelEscenario]) {
  const g = grillaDelPiso(radio)
  afirmar(g.cuantas * 10 <= 60000, `con el piso de radio ${String(radio)}: ~60.000 triángulos`, `${String(g.cuantas)} bloques, ${String(g.cuantas * 10)} triángulos`)
  let afuera = 0
  for (let k = 0; k < g.cuantas; k += 1) {
    const [i, j] = [g.celdas[k * 2], g.celdas[k * 2 + 1]]
    for (const di of [0, 1]) for (const dj of [0, 1]) if (Math.hypot((i + di - g.n / 2) * g.lado, (j + dj - g.n / 2) * g.lado) > radio + 1e-9) afuera += 1
  }
  afirmar(afuera === 0, '  todos los bloques enteros adentro del disco')
}
const entorno = leer('entorno/Entorno.tsx')
afirmar(/pisoVivo === 'no' && <Pulso \/>/.test(entorno) && /conCharco=\{e\.pruebas\.pisoVivo === 'no'\}/.test(entorno), 'con el piso vivo el anillo y el charco los pinta el piso (sin él, los planos de siempre)')
afirmar(/enElPiso[\s\S]*mesh\.visible = false/.test(leer('ContactOcclusion.tsx')), '  y la mancha de contacto también')
afirmar(PISO_VIVO.escalon * PISO_VIVO.reposo <= 0.1, 'en reposo es casi plano', `a lo sumo ${String(PISO_VIVO.escalon * PISO_VIVO.reposo)} u`)

// ── §7 · 6e ───────────────────────────────────────────────────────────────
titulo('§7 · 6e: el haz se enciende una vez')
const correr = (e: EstadoDelEncendido, noches: readonly number[], desde: number, dt = 0.05): { e: EstadoDelEncendido; fases: string[]; kMax: number } => {
  let t = desde
  const fases: string[] = []
  let kMax = 0
  for (const n of noches) {
    e = avanzarElEncendido(e, n, t, false)
    fases.push(e.fase)
    kMax = Math.max(kMax, e.k)
    t += dt
  }
  return { e, fases, kMax }
}
const noche = (s: number): number[] => Array.from({ length: Math.round(s / 0.05) }, () => 1)
const dia = (s: number): number[] => Array.from({ length: Math.round(s / 0.05) }, () => 0)
const ida = correr(encendidoInicial(0, 0), noche(GUION_S + 0.5), 0)
afirmar(ida.fases.includes('encendiendo') && ida.e.fase === 'prendido' && ida.e.k === 1, 'cae la noche: arranca con el guion y termina prendido en 1')
afirmar(ida.kMax > 1.5 && guionEn(0.1) > 1 && guionEn(0.25) === 0, '  el guion destella por encima de 1 y entre destellos se apaga (se nota)')
const vuelta = correr(ida.e, dia(ENCENDIDO.apagaS + 0.2), GUION_S + 0.5)
afirmar(vuelta.e.fase === 'apagado' && vuelta.e.k === 0 && vuelta.fases.includes('apagando'), 'vuelve el día: se apaga suave hasta cero')
const otra = correr(vuelta.e, noche(1), GUION_S + 0.5 + ENCENDIDO.apagaS + 0.2)
afirmar(!otra.fases.includes('encendiendo') && otra.e.fase === 'prendido', 'otra vez de noche enseguida: prende sin repetir el parpadeo (histéresis)')
const tarde = correr(vuelta.e, noche(0.2), 100)
afirmar(tarde.fases.includes('encendiendo'), '  y si pasó un rato, el parpadeo vuelve')
const tibia = correr(ida.e, Array.from({ length: 40 }, () => 0.45), 10)
afirmar(tibia.e.fase === 'prendido', 'entre las dos fronteras (0,35 y 0,55) no cambia nada')
controlPositivo('el detector VE un encendido que repite el parpadeo', ['apagado', 'encendiendo', 'prendido', 'apagando', 'apagado', 'encendiendo'], (fs: string[]) => fs.filter((x) => x === 'encendiendo').length <= 1)

// ── §8 · 6g ───────────────────────────────────────────────────────────────
titulo('§8 · 6g: el día entra desde afuera, visible al bajar y escondido al subir')
const bloque = (pie: number): BloqueOpaco => ({ servicios: { tope: pie - 4500, pie: pie - 1800 }, tuPanel: { tope: pie - 1800, pie }, alto: 900 })
let prendido = false
const bajando: boolean[] = []
for (let pie = 3000; pie >= 0; pie -= 10) {
  prendido = diaDesdeAfueraEn(bloque(pie), prendido, (pie - 4500 + pie) / 2 < 450)
  bajando.push(prendido)
}
const primero = 3000 - bajando.indexOf(true) * 10
afirmar(primero < 900 * DIA_DESDE_AFUERA.visible && primero > 900 * DIA_DESDE_AFUERA.visible - 20, 'bajando, prende recién cuando Tu panel deja ver la sala', `con el borde en ${String(primero)} px de 900`)
const subiendo: boolean[] = []
for (let pie = 0; pie <= 3000; pie += 10) {
  prendido = diaDesdeAfueraEn(bloque(pie), prendido, (pie - 4500 + pie) / 2 < 450)
  subiendo.push(prendido)
}
const ultimo = subiendo.lastIndexOf(true) * 10
afirmar(ultimo > 900, 'subiendo, sigue de día hasta que el bloque tapa todo (la noche vuelve escondida)', `se apaga con el borde en ${String(ultimo)} px`)
afirmar(frenteEn(0) === DIA_DESDE_AFUERA.desde && frenteEn(DIA_DESDE_AFUERA.duracionS) === DIA_DESDE_AFUERA.hasta && frenteEn(1) < frenteEn(0.5), 'el frente va de afuera (118) hasta el logo, siempre hacia adentro')
afirmar(DIA_DESDE_AFUERA.desde > f.radioDelPisoDeAbajo && DIA_DESDE_AFUERA.hasta < 0, '  y arranca más allá de la formación y termina pasando el logo')

// ── §9 · 6c y 6d ──────────────────────────────────────────────────────────
titulo('§9 · 6c y 6d: la niebla de afuera')
afirmar(RASANTE.desde > f.radioDelEscenario, 'la niebla rasante vive afuera del escenario', `desde ${String(RASANTE.desde)}`)
afirmar(RASANTE.alto.minimo + RASANTE.alto.suma < medidas.alto * f.escala, '  y es baja: un banco lleno no pasa la altura de una copia', `${String(RASANTE.alto.minimo + RASANTE.alto.suma)} contra ${(medidas.alto * f.escala).toFixed(1)}`)
afirmar(RASANTE.pasos >= 10 && /corrido/.test(leer('niebla/rasante.ts')), '  integrada en varios tramos por rayo, con un corrimiento por píxel (sin escalones)')
afirmar(RASANTE.abre.neblina < 1 && RASANTE.abre.rasante < 1, '6d · la velocidad la abre pero no la borra del todo')
afirmar(MOIRE_NEAR_RADIUS < RASANTE.desde, '  y nunca entra a la trama')

// ── §10 · la limpieza ─────────────────────────────────────────────────────
titulo('§10 · el relieve, las cajas de texto y F-mirada no dejan código')
afirmar(!existsSync(path.join(ESCENA, 'relieve')), 'la carpeta `relieve/` no existe')
const codigo = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? (d.name === '__tests__' ? [] : codigo(path.join(dir, d.name))) : /\.tsx?$/.test(d.name) ? [readFileSync(path.join(dir, d.name), 'utf8')] : []))
const RESTOS = /PisoDeBloques|<Paredes|relieveVivo|pruebas\.relieve|uMirada|anguloAlCentro|movil=menos|SOBRE_EL_PISO_DE_BLOQUES|POSARSE_GLSL/
afirmar(!codigo(ESCENA).some((c) => RESTOS.test(c)), '  y ningún fuente de la escena nombra lo que se borró')
controlPositivo('el detector VE un resto', 'const x = entornoDeLaEscena().pruebas.relieve', (c: string) => !RESTOS.test(c))

cerrar('s31-escena6')
