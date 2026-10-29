/**
 * [L5] LAS RESEÑAS, EL CTA, EL PIE Y EL FAQ (cola 3, 70 y 71 de la revisión 3) — lo que L5 agregó y no cubría otra suite. Sin navegador.
 *
 *   1 · el piso se abre de verdad bajo el aro (el dibujo descarta la corona; la simulación, al ras) y se cierra solo
 *   2 · el reflejo del CTA, sólo con el CTA llegado (escondido se veía delante del logo)
 *   3 · el CTA de la lista del home es un gatillo (se dispara y vuelve, sin titilar)
 *   4 · el pie → el FAQ: el botón en un renglón, la introducción, el aviso centrado, el WhatsApp que se hunde como el del pie
 *   5 · el aro sin selección de texto
 *
 * Cada afirmación lleva su control (el código de antes la pone roja). Las clases arbitrarias se arman partidas (el escaneo de Tailwind 4).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { GATILLO_EN_LA_LISTA, LISTA_DEL_CTA, objetivoEnLaLista } from '../escena/ctaDelFinal/transformacion'
import { FINAL_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { poseDelBloque, poseDelCambio } from '../escena/pie3d/faqDeVolumen'
import { abrirElHueco, armarElHueco, soltarElHueco } from '../escena/resenas/huecoDelAro'
import { HUNDIMIENTO_DEL_PIE } from '../formularios/volteo'
import { TEXTOS_DEL_FAQ } from '../../_componentes/faq/preguntas'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const cerca = (a: number, b: number, tol = 1e-6): boolean => Math.abs(a - b) <= tol

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · [L5] El piso se abre de verdad bajo el aro y se vuelve a cerrar')

// El dibujo del piso no se arma sin WebGL: se mira lo que el final le inyecta (su texto) y el uniforme compartido.
const descarta = (f: string, u: Record<string, unknown>): boolean => f.includes('if ( alAnilloDelAro( vPiso.xz ) < 0.0 ) discard;') && f.includes('float alAnilloDelAro( vec2 xz )') && 'uAnilloDelAro' in u
const enElPisoTs = leer('_lib/escena/final/enElPiso.ts')
afirmar(descarta(enElPisoTs, FINAL_EN_EL_PISO), 'el dibujo del piso descarta la corona del aro abierta (con los descartes de los huecos del pie) y recibe su uniforme')
controlPositivo('  el detector ve el piso de antes (entero: las placas lo atravesaban)', enElPisoTs.replace('\\n\\tif ( alAnilloDelAro( vPiso.xz ) < 0.0 ) discard;', ''), (f) => descarta(f.replace(/\\n\\t/g, '\n'), FINAL_EN_EL_PISO))

const simulacion = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const alRas = (s: string): boolean => s.includes('dibujo = min( dibujo, techoDelAnillo( xz ) );') && s.includes('float techoDelAnillo( vec2 xz )')
afirmar(alRas(simulacion), 'la simulación deja al ras los bloques alrededor de la corona abierta (el mouse no los levanta sobre las placas)')
controlPositivo('  el detector ve la simulación sin el techo del anillo', simulacion.replace('dibujo = min( dibujo, techoDelAnillo( xz ) );', ''), alRas)
const pisoVivo = leer('_lib/escena/piso/PisoVivo.tsx')
afirmar(pisoVivo.includes('uAnilloDelAro: FINAL_EN_EL_PISO.uAnilloDelAro,'), '  y la simulación recibe el uniforme (sin él WebGL lo deja en cero)')

const hueco = armarElHueco(5.6, 1)
const estado = (): readonly number[] => FINAL_EN_EL_PISO.uAnilloDelAro.value.toArray()
abrirElHueco(hueco, 1)
const abierto = [...estado(), hueco.grupo.visible ? 1 : 0]
abrirElHueco(hueco, 0)
const cerrado = [...estado(), hueco.grupo.visible ? 1 : 0]
const abreYCierra = (a: readonly number[], c: readonly number[]): boolean => a[0] === 5.6 && a[1] > 0.3 && a[2] === 1 && a[3] === 1 && c[2] === 0 && c[3] === 0
afirmar(abreYCierra(abierto, cerrado), `el pozo y el anillo del piso: abiertos con el hueco (radio ${String(abierto[0])}, medio ancho ${abierto[1].toFixed(2)}), cerrados en 0 (el piso entero)`)
controlPositivo('  el detector ve un anillo que queda abierto', [abierto, abierto] as const, ([a, c]) => abreYCierra(a, c))
afirmar(hueco.afuera.material.side === THREE.BackSide && hueco.adentro.material.side === THREE.FrontSide && hueco.fondo.position.y < hueco.adentro.position.y, '  el pozo: la pared de afuera vista desde adentro, la de adentro desde afuera, y el fondo debajo de las dos')
soltarElHueco(hueco)
afirmar(FINAL_EN_EL_PISO.uAnilloDelAro.value.z === 0, '  al soltarse, el piso queda entero')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · [L5] El reflejo del CTA, sólo con el CTA llegado (lote2/10)')
const cta = leer('_componentes/ctaDelFinal/CtaDelFinal.tsx')
const reflejoConElCta = (f: string): boolean => f.includes('{llego && <Reluciente />}') && f.includes("useMotionValueEvent(progreso, 'change', (p) => setLlego(tocable(p)))") && !/\n\s*<Reluciente \/>\n\s*<\/motion\.a>/.test(f)
afirmar(reflejoConElCta(cta), 'el reflejo de «HABLANOS» se monta sólo cuando el CTA se puede tocar (antes, escondido, su franja pasaba delante del logo)')
controlPositivo('  el detector ve el reflejo de siempre', cta.replace('{llego && <Reluciente />}', '<Reluciente />'), reflejoConElCta)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · [L5] El CTA de la lista del home es un gatillo (se lee solo)')
const objetivoBien = (f: (r: number, previo: 0 | 1) => 0 | 1): boolean =>
  f(LISTA_DEL_CTA.desde - 0.01, 0) === 0 && f(LISTA_DEL_CTA.desde + 0.01, 0) === 1 && f(0.15, 1) === 1 && f(LISTA_DEL_CTA.aparece[0] - 0.01, 1) === 0 && f(0.15, 0) === 0
afirmar(objetivoBien(objetivoEnLaLista), `se dispara pasado ${String(GATILLO_EN_LA_LISTA.entra)} del bloque clavado y vuelve antes de ${String(GATILLO_EN_LA_LISTA.sale)} (en el medio, no titila)`)
controlPositivo('  el detector ve un umbral sin margen (titila)', (r: number) => (r > LISTA_DEL_CTA.desde ? 1 : 0), objetivoBien)
afirmar(GATILLO_EN_LA_LISTA.duracionS * 0.5 >= 1.2, `  y se lee: el deslizamiento dura ${(GATILLO_EN_LA_LISTA.duracionS * 0.5).toFixed(1)} s (no ultrarrápido)`)
const porQue = leer('_secciones/por-que-develop/PorQueDevelop.tsx')
const medir = leer('_componentes/ctaDelFinal/CtaDelFinal.tsx')
const cableado = (p: string, m: string): boolean => p.includes('<MedirLaLista caja={cajaDelCta} progreso={transformacion} entrada={entrada} gatillo />') && m.includes('const siguiente = objetivoEnLaLista(r, objetivo.current)') && m.includes('if (!gatillo || quieto) {')
afirmar(cableado(porQue, medir), '  el home lo pide; la página no (el gatillo es opcional, el scroll de siempre por defecto) y con menos movimiento, quieto')
controlPositivo('  el detector ve el home sin el gatillo', [porQue.replace(' gatillo />', ' />'), medir] as const, ([p, m]) => cableado(p, m))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · [L5] El pie → el FAQ en escritorio')
const boton = leer('_componentes/faq/BotonDelFaq.tsx')
const tope = ['max-w-[calc(var(--spacing-20)', '*3.5)]'].join('')
const unRenglon = (f: string): boolean => f.includes('className="whitespace-nowrap"') && !f.includes(tope) && f.includes(['bottom-[var(--spacing-', '4)]'].join(''))
afirmar(unRenglon(boton), 'el botón «Scrolleá una vez más…» en un renglón y más abajo (lote2/14)')
controlPositivo('  el detector ve el botón de antes (partido en dos renglones)', boton.replace('className="whitespace-nowrap"', `className="${tope} text-balance"`), unRenglon)

const escenario = leer('_componentes/faq/FaqEnEscenario.tsx')
const lista = leer('_componentes/faq/FaqEnLista.tsx')
const conIntro = (f: string): boolean => f.indexOf('{TEXTOS_DEL_FAQ.titulo}') < f.indexOf('{TEXTOS_DEL_FAQ.intro}') && f.indexOf('{TEXTOS_DEL_FAQ.intro}') < f.indexOf('<ul role="list"')
afirmar(TEXTOS_DEL_FAQ.intro === 'Lo que más nos preguntan antes de arrancar. Si no está acá, escribinos.' && conIntro(escenario) && conIntro(lista), 'el bloque: «Preguntas frecuentes», la introducción y las preguntas (en escritorio y en la lista)')
controlPositivo('  el detector ve el bloque sin la introducción', escenario.replace('{TEXTOS_DEL_FAQ.intro}', ''), conIntro)

// [L8a] El aviso y las respuestas, todos centrados en su bloque (lote3/08-09); la letra de la respuesta la ajusta `RespuestaDelFaq`.
const centrado = ['flex min-h-[', 'inherit] flex-col justify-center p-[var(--spacing-6)] text-center'].join('')
const avisoCentrado = (f: string): boolean => f.includes(`'${centrado}'`)
afirmar(avisoCentrado(escenario), '«Tocá una pregunta y mirá lo que pasa.» y las respuestas, centrados en su bloque (lote2/18, lote3/09)')
controlPositivo('  el detector ve el aviso arriba a la izquierda', escenario.replace(`'${centrado}'`, "''"), avisoCentrado)

const volumen = leer('_lib/escena/pie3d/faqDeVolumen.ts')
// [INT] El hundido vive en su archivo (s8-montaje: `faqDeVolumen.ts` pasaba las 300 líneas de código).
const hundido = leer('_lib/escena/pie3d/hundidoDelFaq.ts')
const sonido = leer('_chrome/sonido/ControlDelSonido.tsx')
const comoElDelPie = (v: string, e: string, s: string): boolean =>
  v.includes("if (b.id === 'whatsapp') hundirComoElPie(b, e.quieto, e.dt)") && v.includes('const caraY = s.caraY - b.hundido * mpp') && hundido.includes('cuantoSeHunde(h, HUNDIDA_DEL_PIE.encima / HUNDIDA_DEL_PIE.apretada) * HUNDIDA_DEL_PIE.apretada') && e.includes('useHundido(whatsapp, volumen)') && s.includes('[data-bloque-del-faq="whatsapp"]')
afirmar(comoElDelPie(volumen, escenario, sonido), 'el WhatsApp del FAQ hace lo del pie: se hunde con el mouse, el foco y al apretar (el mismo hundido), se aclara y suena')
controlPositivo('  el detector ve el WhatsApp de antes (una placa quieta)', [volumen.replace("if (b.id === 'whatsapp') hundirComoElPie(b, e.quieto, e.dt)", ''), escenario, sonido] as const, ([v, e, s]) => comoElDelPie(v, e, s))

// El cambio de la respuesta, el del formulario: la placa entera baja por el hueco ABIERTO, después el piso se cierra encima, y vuelve.
type Pose = ReturnType<typeof poseDelCambio>
const comoElFormulario = (f: (t: number) => Pose): boolean => {
  const [a, b, c, d] = [f(0), f(HUNDIMIENTO_DEL_PIE.baja), f(0.5), f(1)]
  const bajo = (p: Pose): number => a.caraY - p.caraY
  return cerca(bajo(a), 0) && a.abre === 1 && cerca(bajo(b), HUNDIMIENTO_DEL_PIE.espesores * a.espesor) && b.abre > 0.999 && b.texto === 0 && c.abre < 1e-6 && cerca(bajo(d), 0) && d.abre === 1 && d.texto === 1
}
const MPP = 0.02
afirmar(comoElFormulario((t) => poseDelCambio(t, MPP)), `[L5] la respuesta cambia como el formulario: baja ${String(HUNDIMIENTO_DEL_PIE.espesores)} espesores con el hueco abierto, el piso se cierra encima a la mitad y vuelve (lote2/19)`)
controlPositivo('  el detector ve el cambio de antes (la subida de la entrada: casi no bajaba y el piso se cerraba en seguida)', (t: number) => poseDelBloque(Math.abs(1 - 2 * t), MPP), comoElFormulario)
const cableadoDelCambio = (v: string, e: string): boolean => v.includes('cambio !== null ? poseDelCambio(cambio, mpp) : poseDelBloque(v, mpp)') && e.includes("nivelDelBloque('respuesta', enElCambio ? niveles.faq : Math.min(niveles.faq, paso.nivel), enElCambio ? paso.cambio : null)")
afirmar(cableadoDelCambio(volumen, escenario), '  el cuadro del FAQ le pasa el tiempo del cambio y la escena lo usa')
controlPositivo('  el detector ve la escena sin el cambio', [volumen.replace('cambio !== null ? poseDelCambio(cambio, mpp) : poseDelBloque(v, mpp)', 'poseDelBloque(v, mpp)'), escenario] as const, ([v, e]) => cableadoDelCambio(v, e))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · [L5] Arrastrar el aro no selecciona texto (lote2/08)')
const capa = leer('_secciones/por-que-develop/resenas/CapaDelAro.tsx')
const sinSeleccion = (f: string): boolean => f.includes('className="pointer-events-none absolute inset-0 select-none"')
afirmar(sinSeleccion(capa), 'la capa del aro (y sus tarjetas, adentro) sin selección de texto')
controlPositivo('  el detector ve la capa de antes', capa.replace(' select-none"', '"'), sinSeleccion)

cerrar('s88-l5')
