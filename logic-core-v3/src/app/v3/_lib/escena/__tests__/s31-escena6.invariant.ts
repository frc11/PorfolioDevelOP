/**
 * SPRINT ESCENA 6 — lo que la ronda 2 promete sin navegador. Cada afirmación lleva su control
 * positivo donde el chequeo podría pasar por no mirar nada.
 *
 * §1 · las banderas: 5a, 5c y 5d en el producto; las pruebas nuevas apagadas y el pedido del banco.
 * §2 · los fondos del texto: la máscara del pulso no existe más, en ningún lado.
 * §3 · (la formación pasó a `s32-escena7`: ESCENA 7 le sacó las fallas y la hizo la fábrica gigante).
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
import { DIA_DESDE_AFUERA, diaDesdeAfueraEn, frenteEn } from '../dia/desdeAfuera'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { ENCENDIDO, GUION_S, avanzarElEncendido, encendidoInicial, guionEn, type EstadoDelEncendido } from '../entorno/encendido'
import { ESTRELLAS } from '../estrellas/Estrellas'
import { FORMACION } from '../formacion/enFormacion'
import type { BloqueOpaco } from '../nocheDisparada'
import { RASANTE } from '../niebla/rasante'
import { PISO_VIVO, grillaDelPiso } from '../piso/bloques'
import { FISICA } from '../polvo/simulacion'
import { POSARSE, avanzarElPolvo, polvoInicial, NUNCA } from '../polvo/posarse'
import { CAMERA_FOV, FLOOR_RADIUS, FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS } from '../probeMoire'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
/** El alto de la «cp» entera en el espacio de la copia (medido en el banco). */
const ALTO_DE_LA_COPIA = 5
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · 5a, 5c y 5d en el producto; lo nuevo apagado')
afirmar(ENTORNO.obstaculo && ENTORNO.sombraHaz && ENTORNO.motas, 'el producto trae el obstáculo (5a), la sombra según el haz (5c) y las motas (5d)')
afirmar(ENTORNO.moire && ENTORNO.polvoParejo, '  y sigue con el moiré vivo y el polvo parejo')
afirmar(!BASE_LIMPIA.obstaculo && !BASE_LIMPIA.sombraHaz && !BASE_LIMPIA.motas, '  la base, sin ninguno')
afirmar(Object.values(PRUEBAS_APAGADAS).every((v) => v === false || v === 'no'), 'todas las pruebas de ESCENA 6 van apagadas', JSON.stringify(PRUEBAS_APAGADAS))
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, '  y el producto no trae ninguna')
const pedido = entornoPedido('producto,piso=pulso,inercia,remolinos,rasante,velocidad,encendido,calor,dia=afuera')
afirmarIgual(
  pedido.pruebas,
  { pisoVivo: 'pulso', inercia: true, remolinos: true, nieblaRasante: true, nieblaVelocidad: true, hazEncendido: true, aireCaliente: true, diaDesdeAfuera: true },
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

// ── §4 · las estrellas ────────────────────────────────────────────────────
titulo('§4 · las estrellas: un cielo de verdad, donde se ve')
const clases = ESTRELLAS.clases
afirmar(Math.abs(clases.punto.parte + clases.media.parte + clases.brillante.parte - 1) < 1e-9, 'las tres clases suman todo el cielo')
afirmar(clases.punto.parte > clases.media.parte && clases.media.parte > clases.brillante.parte, 'muchas débiles y pocas brillantes', `${String(clases.punto.parte)} / ${String(clases.media.parte)} / ${String(clases.brillante.parte)}`)
afirmar(clases.punto.brillo[1] <= clases.media.brillo[1] && clases.media.brillo[1] <= clases.brillante.brillo[0], '  y las brillantes, las más brillantes')
afirmar(clases.punto.lado === 1 && clases.brillante.lado % 2 === 1 && ESTRELLAS.halo < 0.5, 'la débil es un píxel; la brillante lleva un halo mínimo (menos de la mitad del núcleo)')
afirmar(ESTRELLAS.titileo.hasta <= 0.5 && ESTRELLAS.titileo.hondo[1] < 0.5, 'el titileo es lento y leve', `hasta ${String(ESTRELLAS.titileo.hasta)} Hz, baja a lo sumo ${String(ESTRELLAS.titileo.hondo[1] * 100)} %`)
// La banda: todo lo que se ve por encima del piso de afuera, desde cualquier pose.
const f = FORMACION
const cieloDesde = f.radioDelCielo
const sueloEnElCielo = FLOOR_Y - f.desnivel
const masBajo = Math.min(...CHOREO_KEYFRAMES.map((k) => (Math.atan2(sueloEnElCielo - k.pose.height - MOUSE_HEIGHT_FACTOR * k.pose.distance, cieloDesde - k.pose.distance) * 180) / Math.PI))
const subida = Math.max(...CHOREO_KEYFRAMES.map((k) => (-Math.atan2(k.pose.height, k.pose.distance) * 180) / Math.PI))
afirmar(ESTRELLAS.elevacion.desde < masBajo, 'la banda llega abajo hasta el cielo más bajo que se ve por encima del piso', `el más bajo, ${masBajo.toFixed(1)}°; la banda arranca en ${String(ESTRELLAS.elevacion.desde)}°`)
afirmar(ESTRELLAS.elevacion.hasta > subida + CAMERA_FOV / 2, '  y arriba, hasta lo más alto que mira la cámara', `${(subida + CAMERA_FOV / 2).toFixed(1)}°`)

// ── §5 · el polvo con física ──────────────────────────────────────────────
titulo('§5 · el polvo que se posa, con física')
afirmar(POSARSE.velocidad === 16, 'el despertar sale a 16 u/s (los tiempos de la quietud, a la mitad, en s32)')
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
afirmar(RASANTE.alto.minimo + RASANTE.alto.suma < ALTO_DE_LA_COPIA * f.escala, '  y es baja: un banco lleno no pasa la altura de una copia', `${String(RASANTE.alto.minimo + RASANTE.alto.suma)} contra ${(ALTO_DE_LA_COPIA * f.escala).toFixed(1)}`)
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
