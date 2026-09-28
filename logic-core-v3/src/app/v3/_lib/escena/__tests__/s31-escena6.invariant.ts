/**
 * SPRINT ESCENA 6 — lo que la ronda 2 promete sin navegador. Cada afirmación lleva su control
 * positivo donde el chequeo podría pasar por no mirar nada.
 *
 * §1 · las banderas: 5a, 5c y 5d en el producto; las pruebas nuevas apagadas y el pedido del banco.
 * §2 · los fondos del texto: la máscara del pulso no existe más, en ningún lado.
 * §3 · (la formación pasó a `s32-escena7`: ESCENA 7 le sacó las fallas y la hizo la fábrica gigante).
 * §4 · las estrellas: muchas débiles y pocas brillantes, el halo sólo en las brillantes, y la banda
 *      cubre todo el cielo que se ve por encima del piso.
 * §5 · el polvo con física: los modos y el despertar (6b se borró en ESCENA 7).
 * §6 · (el piso vivo pasó a `s32-escena7`: ESCENA 7 lo hizo un mar, encendido).
 * §7 · (6e pasó a `s32-escena7`: ESCENA 7 lo encendió y lo hizo más notorio).
 * §8 · (6g pasó a `s32-escena7`: ESCENA 7 la hizo el amanecer, T11).
 * §9 · (6c y 6d pasaron a `s32-escena7`: ESCENA 7 las juntó en la niebla de afuera, encendida).
 * §10 · la limpieza: el relieve (R1/R2), las cajas de texto y F-mirada no dejan código.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { MOUSE_HEIGHT_FACTOR } from '../choreographyPhysics'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { ESTRELLAS } from '../estrellas/Estrellas'
import { FORMACION } from '../formacion/enFormacion'
import { FISICA } from '../polvo/simulacion'
import { POSARSE, avanzarElPolvo, polvoInicial, NUNCA } from '../polvo/posarse'
import { CAMERA_FOV, FLOOR_Y } from '../probeScene'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · 5a, 5c y 5d en el producto; lo nuevo apagado')
afirmar(ENTORNO.obstaculo && ENTORNO.sombraHaz && ENTORNO.motas, 'el producto trae el obstáculo (5a), la sombra según el haz (5c) y las motas (5d)')
afirmar(ENTORNO.moire && ENTORNO.polvoParejo, '  y sigue con el moiré vivo y el polvo parejo')
afirmar(!BASE_LIMPIA.obstaculo && !BASE_LIMPIA.sombraHaz && !BASE_LIMPIA.motas, '  la base, sin ninguno')
afirmar(Object.values(PRUEBAS_APAGADAS).every((v) => v === false || v === 'no'), 'todas las pruebas de ESCENA 6 van apagadas', JSON.stringify(PRUEBAS_APAGADAS))
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, '  y el producto no trae ninguna')
// [ESCENA 8] El amanecer (6g) dejó de ser una prueba: el pedido lo nombra como a cualquier bandera del producto.
const pedido = entornoPedido('E1,amanecer')
afirmar(pedido.amanecer && !entornoPedido('E1').amanecer && !entornoPedido('E1,amanecer').moire, 'el pedido del banco prende lo nombrado (y sólo eso)')
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
afirmar(/despertar\.desperto - despertar\.antes > POSARSE\.empiezaS/.test(leer('polvo/Fisica.tsx')), 'el remolino del despertar sólo sopla si el polvo llegó a posarse')

// ── §10 · la limpieza ─────────────────────────────────────────────────────
titulo('§10 · el relieve, las cajas de texto y F-mirada no dejan código')
afirmar(!existsSync(path.join(ESCENA, 'relieve')), 'la carpeta `relieve/` no existe')
const codigo = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? (d.name === '__tests__' ? [] : codigo(path.join(dir, d.name))) : /\.tsx?$/.test(d.name) ? [readFileSync(path.join(dir, d.name), 'utf8')] : []))
const RESTOS = /PisoDeBloques|<Paredes|relieveVivo|pruebas\.relieve|uMirada|anguloAlCentro|movil=menos|SOBRE_EL_PISO_DE_BLOQUES|POSARSE_GLSL/
afirmar(!codigo(ESCENA).some((c) => RESTOS.test(c)), '  y ningún fuente de la escena nombra lo que se borró')
controlPositivo('el detector VE un resto', 'const x = entornoDeLaEscena().pruebas.relieve', (c: string) => !RESTOS.test(c))

cerrar('s31-escena6')
