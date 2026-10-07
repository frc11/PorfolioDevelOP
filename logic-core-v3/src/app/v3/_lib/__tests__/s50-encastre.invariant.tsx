/**
 * EL ENCASTRE — el invariante: npm run test:s50-encastre
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1B · la aparición de las demos persigue al scroll con una velocidad tope (como el amanecer), en los dos anchos y en
 *        las dos direcciones; abajo de 1024 la capa rígida crece en 1,4 vacíos; el título es «Demos», como Portfolio.
 *   1C · los nanobots bajo el mouse: se desarman en un radio chico alrededor del cursor (en el sombreador, con el cursor
 *        como uniforme) y vuelven con resorte; conservan su color; sólo con mouse y con movimiento.
 *   1D · la placa del contacto: mientras viaja desde el fondo no responde al mouse; al llegar entra suave el paralaje
 *        inverso (se corre al revés del mouse y se le ve el costado de ese lado).
 *   1E · los formularios del contacto (el panel y el pie): el foco lo dibuja la pastilla (sin el recuadro adentro), el Tab
 *        llega a los campos, sin «/» delante de las preguntas, el único obligatorio es el contacto (en el cliente y en
 *        el endpoint) y la nota nueva.
 *   2A · el final del pie arranca solo al llegar al pie y corre a su ritmo; el scroll hacia abajo lo adelanta; un gesto
 *        hacia arriba, salir del pie o un viaje del menú lo revierten.
 * (1A, el túnel en k = 1,8 sin la bandera `tunelk`, lo afirma s49 1C al día.) Lo que se mira en vivo:
 * `~/.cache/b4-medicion/encastre/mirar.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { CAMPOS, PIE } from '../../_chrome/contacto/contenido'
import { validarContacto, type DatosDeContacto } from '../../_chrome/contacto/enviarContacto'
import { HojaParaElInvariante } from '../../_chrome/contacto/FormularioDeContacto'
import { SELECTOR_DE_FOCALIZABLES } from '../../_secciones/trabajos/demos/dialogo'
import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { APARICION, LLEGADA, aparicionPedida, enElTramo, escalaDeDemos, llegadaDeDemos, llegadaDeLaAparicion, perseguirLaAparicion, tramoDelLibro } from '../../_secciones/trabajos/demos/entrada'
import { FIN_DE_LA_LLEGADA_EN_EL_VACIO, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
import { CORRIMIENTO_DE_LA_PLACA, ENTRADA_DEL_PARALAJE, paralajeDe } from '../../_chrome/contacto/placa'
import { VERTICE_DEL_ENJAMBRE } from '../nanobots/enjambre'
import { PUNTERO_DEL_ENJAMBRE, pasoDelPuntero, punteroQuieto, type ObjetivoDelPuntero, type PunteroDelEnjambre } from '../nanobots/puntero'
import { validarElPie } from '../formularios/validar'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL, acostado, apertura as aperturaDelHueco, aterrizaje, blancoDelFinal, hundido, poder as poderDelFinal, poseDelLogo, segundosDelFinal, subida } from '../escena/final/recorridoDelFinal'
import { FLOOR_Y } from '../escena/probeScene'
import { HUECO, crearElPozo } from '../escena/final/hueco'
import { RASTRO_EN_EL_PISO, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { pasoDelRastro, rastroQuieto } from '../escena/final/rastro'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1B · Las demos: la aparición persigue al scroll con una velocidad tope (también abajo de 1024) y el título es «Demos»')

type Seguidor = (mostrada: number, pedida: number, dt: number) => number
const DT = 1 / 60
/** Cuánto tarda lo mostrado en ir de `desde` a `hasta` con lo pedido clavado en `hasta` (s); `Infinity`: no llega. */
const cuantoTarda = (seguir: Seguidor, desde: number, hasta: number): number => {
  let m = desde
  for (let i = 1; i <= 6000; i += 1) {
    m = seguir(m, hasta, DT)
    if (m === hasta) return i * DT
  }
  return Number.POSITIVE_INFINITY
}
/** Con un pedido que sube despacio (la mitad del tope), lo mostrado va con él cuadro a cuadro. */
const vaConElScroll = (seguir: Seguidor): boolean => {
  let [m, p] = [0, 0]
  for (let i = 0; i < 200; i += 1) {
    p = Math.min(1, p + (0.5 * DT) / APARICION.minimoS)
    m = seguir(m, p, DT)
    if (m !== p) return false
  }
  return true
}
const conTope = (seguir: Seguidor): boolean => {
  const ida = cuantoTarda(seguir, 0, 1)
  const vuelta = cuantoTarda(seguir, 1, 0)
  return ida >= APARICION.minimoS - DT && ida <= APARICION.minimoS + 2 * DT && vuelta >= APARICION.minimoS - DT && vuelta <= APARICION.minimoS + 2 * DT && vaConElScroll(seguir)
}
afirmar(conTope(perseguirLaAparicion) && APARICION.minimoS === 1.8, 'lo mostrado persigue a lo pedido con un tope: un salto del scroll (la aparición entera de una vez) se ve en no menos de 1,8 s, de ida y de vuelta, y lo alcanza exacto; con un scroll lento va con el scroll cuadro a cuadro', `0 → 1 en ${cuantoTarda(perseguirLaAparicion, 0, 1).toFixed(2)} s · 1 → 0 en ${cuantoTarda(perseguirLaAparicion, 1, 0).toFixed(2)} s`)
controlPositivo('el detector VE la aparición de CIERRE (atada al scroll: un salto, en un cuadro)', ((_m: number, p: number) => p) as Seguidor, conTope)
controlPositivo('  y una que nunca termina de alcanzar (se acerca sin llegar, de a mitades)', ((m: number, p: number) => m + (p - m) / 2) as Seguidor, conTope)

// Desde 1024: lo que se persigue es la parte que se VE (del título por salir al último libro); el vacío solo no espera.
const primerProgreso = (f: (m: number) => number, umbral: number): number => {
  for (let x = 0; x < 9000; x += 1) if (f(progresoDelPxDelTunel(x)) >= umbral) return progresoDelPxDelTunel(x)
  return Number.NaN
}
const ultimoLibro = primerProgreso((m) => llegadaDeDemos(m), 1)
// En cada píxel del túnel: 0 mientras el reloj de la llegada no pasó el arranque del título, 1 recién con el último libro.
let soloLoQueSeVe = true
for (let x = 0; x < 9000; x += 1) {
  const m = progresoDelPxDelTunel(x)
  const [l, a] = [llegadaDeDemos(m), aparicionPedida(m, false)]
  if ((l <= LLEGADA.titulo.desde) !== (a === 0) || (l >= 1) !== (a === 1)) soloLoQueSeVe = false
}
const aparicionBien = soloLoQueSeVe && llegadaDeLaAparicion(0) === LLEGADA.titulo.desde && enElTramo(llegadaDeLaAparicion(0), LLEGADA.titulo) === 0 && llegadaDeLaAparicion(1) === 1 && enElTramo(llegadaDeLaAparicion(1), tramoDelLibro(CATALOGO_DE_DEMOS.length - 1, CATALOGO_DE_DEMOS.length)) === 1
afirmar(aparicionBien, '  desde 1024 la aparición es la parte que se ve de la llegada: 0 hasta que el título sale (el vacío solo no espera a nadie), 1 con el último libro asentado; con 0 el título sigue abajo y con 1 todo está en su lugar')

// Abajo de 1024: la capa rígida crece en 1,4 vacíos (antes, en uno: con el vacío), y termina donde termina la de escritorio.
const vacioLleno = primerProgreso(escalaDeDemos, 1)
const angostaBien = (escala: (m: number) => number): boolean => {
  const nace = primerProgreso(escala, 1e-9)
  const termina = primerProgreso(escala, 1)
  return Math.abs(escala(vacioLleno) - 1 / FIN_DE_LA_LLEGADA_EN_EL_VACIO) < 0.01 && Math.abs(termina - ultimoLibro) < 2e-4 && nace <= primerProgreso(escalaDeDemos, 1e-9) + 2e-4
}
afirmar(angostaBien((m) => aparicionPedida(m, true)) && APARICION.escalaEnVacios === FIN_DE_LA_LLEGADA_EN_EL_VACIO, 'abajo de 1024 la capa rígida nace con el vacío y crece en 1,4 vacíos: con el vacío lleno va por el 71 % y termina donde se asienta el último libro de escritorio (el piso del regulador ya la espera); con la misma velocidad tope', `con el vacío lleno: ${(aparicionPedida(vacioLleno, true) * 100).toFixed(0)} %`)
controlPositivo('el detector VE la capa rígida de CIERRE (crecía con el vacío: llena con el vacío lleno)', escalaDeDemos, angostaBien)

// El cableado: la capa pide con el ancho que decidió el CSS y persigue; el carrusel y el teclado esperan lo mostrado.
const capa = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const cableada = (c: string): boolean =>
  c.includes('p.pedida = aparicionPedida(valor, rigida.current)') && c.includes('perseguir(p, llegar)') && c.includes("capa.current?.style.setProperty('--demos-escala', a.toFixed(5))") &&
  c.includes('const l = llegadaDeLaAparicion(a)') && c.includes('aparicion.current.mostrada >= 1') && c.includes('const llegaEntera = (): number => aparicion.current.mostrada') && c.includes('alcanzar(p)')
afirmar(cableada(capa), '  el cableado: lo pedido sale del ancho que decidió el CSS; lo mostrado escribe la capa rígida o la llegada escalonada; el carrusel y el empujón del teclado esperan lo mostrado; al cambiar de ancho y al desmontarse se alcanza de una vez')
controlPositivo('el detector VE la capa rígida atada al vacío', capa.replace("setProperty('--demos-escala', a.toFixed(5))", "setProperty('--demos-escala', escalaDeDemos(mostrado.get()).toFixed(5))"), cableada)

// El título: «Demos», como Portfolio (s42 D3 al día afirma el gesto, el nivel y las clases).
const texto = sinComentarios(leer('_secciones/trabajos/demos/TextoDeDemos.tsx'))
const piezas = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const comoPortfolio = (t: string): boolean => /<Titular nivel="display-xl" como="h2" className=\{CLASE_DEL_TITULAR_DEL_CARTEL\}>/.test(piezas) && /minimoS=\{LENTOS\.llegadaDePortfolioS\}/.test(piezas) && /<Titular nivel="display-xl" como="h3" className=\{CLASE_DEL_TITULAR_DEL_CARTEL\}>/.test(t) && /gesto: 'letras', llegada: progreso, queda: false, minimoS: LENTOS\.llegadaDePortfolioS/.test(t) && /useAcompananteDelTitulo<HTMLDivElement>\('demos'\)/.test(t)
afirmar(comoPortfolio(texto), '«Demos» con el nivel, las clases angostas y la llegada del titular de Portfolio (las letras desde la profundidad, con su mínimo); el párrafo va en su plano')
controlPositivo('el detector VE el título de antes (titulo-l, dos renglones)', texto.replace('nivel="display-xl" como="h3"', 'nivel="titulo-l" como="h3"'), comoPortfolio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1C · Los nanobots bajo el mouse: se desarman en un radio chico alrededor del cursor y vuelven con resorte')

// Los dos resortes, a 60 cuadros por segundo: entra al centro, se queda, sale.
type Paso = (p: PunteroDelEnjambre, o: ObjetivoDelPuntero, dt: number) => void
interface Recorrido { readonly picoAlEntrar: number; readonly asentado: number; readonly valleAlSalir: number; readonly cerradoEnS: number; readonly atrasoA50ms: number; readonly atrasoA400ms: number; readonly saltoAlEntrar: number }
const recorrer = (paso: Paso): Recorrido => {
  const p = punteroQuieto()
  p.x = -0.8
  p.y = -0.8
  let pico = 0
  for (let i = 0; i < 90; i += 1) {
    paso(p, { x: 0.1, y: 0.2, dentro: true }, DT)
    pico = Math.max(pico, p.fuerza)
  }
  const saltoAlEntrar = Math.hypot(p.x - 0.1, p.y - 0.2)
  const asentado = p.fuerza
  // El cursor se corre 0,3 a la derecha: cuánto se atrasa el hueco.
  for (let i = 0; i < 3; i += 1) paso(p, { x: 0.4, y: 0.2, dentro: true }, DT)
  const atrasoA50ms = Math.abs(0.4 - p.x)
  for (let i = 0; i < 21; i += 1) paso(p, { x: 0.4, y: 0.2, dentro: true }, DT)
  const atrasoA400ms = Math.abs(0.4 - p.x)
  let valle = 1
  let cerradoEnS = Number.POSITIVE_INFINITY
  for (let i = 1; i <= 240; i += 1) {
    paso(p, { x: 0.9, y: 0.2, dentro: false }, DT)
    valle = Math.min(valle, p.fuerza)
    if (p.fuerza === 0 && p.velocidad === 0 && !Number.isFinite(cerradoEnS)) cerradoEnS = i * DT
  }
  return { picoAlEntrar: pico, asentado, valleAlSalir: valle, cerradoEnS, atrasoA50ms, atrasoA400ms, saltoAlEntrar }
}
// [RETOQUE DEL ENCASTRE] 2A · cambió por pedido: el hueco va JUSTO donde se ve el cursor (el de la sala ya trae su
// interpolación); antes seguía al puntero nativo con un resorte, con atraso (s51 2A).
const conResorte = (r: Recorrido): boolean => r.picoAlEntrar > 1.05 && Math.abs(r.asentado - 1) < 0.02 && r.valleAlSalir < -0.05 && r.cerradoEnS <= 2.5 && r.atrasoA50ms < 1e-9 && r.atrasoA400ms < 1e-9 && r.saltoAlEntrar < 1e-6
const medido = recorrer(pasoDelPuntero)
afirmar(conResorte(medido), 'la fuerza se abre al entrar pasándose un poco y, al salir, vuelve a cero pasándose hacia adentro y se asienta en cero exacto (el resorte); el hueco va justo donde se ve el cursor (RETOQUE DEL ENCASTRE 2A) y, al entrar, aparece ahí (no cruza el símbolo)', `pico ${medido.picoAlEntrar.toFixed(2)} · valle ${medido.valleAlSalir.toFixed(2)} · cerrado en ${medido.cerradoEnS.toFixed(2)} s · atraso a 50 ms ${medido.atrasoA50ms.toFixed(2)}`)
const sinResorte: Paso = (p, o) => {
  p.x = o.x
  p.y = o.y
  p.fuerza = o.dentro ? 1 : 0
  p.velocidad = 0
}
controlPositivo('el detector VE un hueco que se abre y se cierra de golpe (sin física)', sinResorte, (paso: Paso) => conResorte(recorrer(paso)))

// En el sombreador: un radio chico, sólo la posición (el color no se toca) y sin fuerza no aparta a nadie.
const vertice = VERTICE_DEL_ENJAMBRE
const enElSombreador = (v: string): boolean =>
  v.includes('uniform vec4 uPuntero;') && v.includes('gl_Position = vec4( apartadoPorElPuntero( p.xy * cerca * 0.82, t ), 0.0, 1.0 );') && v.includes('if ( abs( fuerza ) < 0.0005 ) return q;') && v.includes('if ( r >= radio ) return q;') &&
  v.includes('vColor = mix( mix( colorDe( uDesde, dA ), colorDe( uHacia, dB ), ec ), vec3( 1.0 ), 0.35 * pulso );') && !/vColor[^;]*uPuntero/.test(v)
afirmar(enElSombreador(vertice) && PUNTERO_DEL_ENJAMBRE.radio <= 0.25, 'en el sombreador, con el cursor como uniforme: sólo se apartan los que caen en el radio (un quinto de medio lienzo, cada uno con el suyo); el color es el de siempre; con la fuerza en cero, nadie se mueve (un cuadro sin mouse es el de antes)', `radio ${String(PUNTERO_DEL_ENJAMBRE.radio)}`)
controlPositivo('el detector VE un desarme que tiñe', vertice.replace('vColor = mix( mix( colorDe( uDesde, dA ), colorDe( uHacia, dB ), ec ), vec3( 1.0 ), 0.35 * pulso );', 'vColor = mix( colorDe( uDesde, dA ), vec3( 1.0 ), uPuntero.z );'), enElSombreador)
const montajeDelEnjambre = sinComentarios(leer('_lib/nanobots/montaje.ts'))
const oidoBien = (m: string): boolean =>
  m.includes("if (e.pointerType === 'touch') return") && /if \(mouse\.medir\) \{\s*mouse\.medir = false\s*const r = lienzo\.getBoundingClientRect\(\)/.test(m) && m.includes('return quieto ? { ...objetivo, dentro: false } : objetivo') && m.includes('oido.soltar()') && m.includes('enjambre.apuntar(puntero)')
afirmar(oidoBien(montajeDelEnjambre), '  el oído: sólo mouse o lápiz (el dedo no), medido al moverse o al scrollear (no en cada cuadro), apagado con movimiento reducido y soltado al desmontarse; el lazo de siempre (pausa fuera de pantalla) le pasa el hueco al sombreador')
controlPositivo('el detector VE el dedo desarmando el símbolo', montajeDelEnjambre.replace("if (e.pointerType === 'touch') return", ''), oidoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1D · La placa del contacto: quieta mientras viaja; al llegar, el paralaje inverso entra suave')

// Al revés del mouse: con el mouse a la izquierda se corre a la derecha (y se le ve el costado izquierdo: s49 2B).
const inverso = (par: typeof paralajeDe): boolean =>
  par(0.04, 0.5).corrimientoX > 0 && par(0.96, 0.5).corrimientoX < 0 && par(0.5, 0.04).corrimientoY > 0 && par(0.5, 0.96).corrimientoY < 0 &&
  par(0.5, 0.5).corrimientoX === 0 && par(0.04, 0.5).rotateY > 0 && Math.abs(par(0, 0.5).corrimientoX - CORRIMIENTO_DE_LA_PLACA.x) < 1e-12
afirmar(inverso(paralajeDe), 'al revés del mouse: con el mouse a la izquierda la placa se corre a la derecha (hasta 3,5 % del cuadro) y gira mostrando su costado izquierdo; arriba, se corre hacia abajo; al centro, quieta', `${(paralajeDe(0, 0.5).corrimientoX * 1440).toFixed(0)} px a 1440 con el mouse en el borde`)
controlPositivo('el detector VE una placa que sigue al mouse (se corre hacia él)', ((x: number, y: number) => ({ ...paralajeDe(x, y), corrimientoX: -paralajeDe(x, y).corrimientoX, corrimientoY: -paralajeDe(x, y).corrimientoY })) as typeof paralajeDe, inverso)
// Todo multiplicado por la ganancia: 0 hasta que el viaje terminó (el punto de vista en el centro: antes, la que viajaba
// seguía al mouse porque el punto de vista se corría con él), y al llegar sube a 1, suave.
const placaTs = sinComentarios(leer('_chrome/contacto/placa.ts'))
const placaTsx = sinComentarios(leer('_chrome/contacto/PlacaDelContacto.tsx'))
const quietaAlViajar = (ts: string, tsx: string): boolean =>
  ts.includes('rotateY.set(p.rotateY * g)') && ts.includes('origenX.set(50 + (p.origenX - 50) * g)') && ts.includes('x.set(p.corrimientoX * g * window.innerWidth)') && /if \(!activo \|\| !llego\) \{\s*ganancia\.set\(0\)/.test(ts) && ts.includes('animate(ganancia, 1, ENTRADA_DEL_PARALAJE)') && ts.includes("ganancia.on('change', aplicar)") &&
  tsx.includes('const paralaje = useParalaje(activa, llego)') && tsx.includes('onAnimationComplete={() => setLlego(true)}') && tsx.includes('x: paralaje.x, y: paralaje.y, rotateX: paralaje.rotateX, rotateY: paralaje.rotateY')
afirmar(quietaAlViajar(placaTs, placaTsx) && ENTRADA_DEL_PARALAJE.duration >= 0.5, 'mientras viaja desde el fondo no responde (ganancia 0: sin giro, sin corrimiento y con el punto de vista en el centro); cuando el viaje termina la ganancia sube a 1 en 0,8 s con el último puntero (entra suave, desde quieta); cada apertura monta la placa de nuevo', `${String(ENTRADA_DEL_PARALAJE.duration)} s`)
controlPositivo('el detector VE la placa de CIERRE (respondía desde el primer cuadro del viaje)', placaTs.replace('rotateY.set(p.rotateY * g)', 'rotateY.set(p.rotateY)'), (ts: string) => quietaAlViajar(ts, placaTsx))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1E · Los formularios del contacto: el foco en la pastilla, el Tab en los campos, sin «/», sólo el contacto obligatorio')

// El foco: el anillo del control se MUDA a la caja que se ve (su borde, más oscuro y más grueso); nunca transparente solo.
const foco = leer('_estilos/foco.css').replace(/\/\*[\s\S]*?\*\//g, '')
const reglaDe = (css: string, selector: string): string => {
  const i = css.indexOf(`${selector} {`)
  return i < 0 ? '' : css.slice(i, css.indexOf('}', i))
}
const seMuda = (css: string): boolean => {
  const pastilla = reglaDe(css, '[data-v3] [data-foco="pastilla"]:has(:focus-visible)')
  const campo = reglaDe(css, '[data-v3][data-v3] [data-foco="campo"]:focus-visible')
  const adentro = reglaDe(css, '[data-v3][data-v3] [data-foco="pastilla"] :focus-visible')
  const dibuja = (r: string): boolean => r.includes('border-color: var(--color-tinta);') && r.includes('box-shadow: inset 0 0 0 var(--border-hairline) var(--color-tinta);')
  // Cada contorno transparente vive SÓLO adentro de una caja que dibuja el foco.
  const transparentes = [...css.matchAll(/([^{}]+)\{[^}]*outline-color: transparent;/g)].map((m) => m[1].trim())
  const soloEnCajas = transparentes.every((s) => s.includes('[data-foco="pastilla"]') || s.includes('[data-foco="campo"]') || s.includes('[data-pieza="carrusel"]'))
  return dibuja(pastilla) && dibuja(campo) && campo.includes('outline-color: transparent;') && adentro.includes('outline-color: transparent;') && soloEnCajas
}
afirmar(seMuda(foco), 'el foco de un campo lo dibuja su caja: el borde (con su redondeo) pasa a la tinta y al doble de grueso (una línea por dentro: nada se corre); el contorno del control queda transparente SÓLO adentro de esas cajas')
controlPositivo('el detector VE un contorno apagado sin caja que lo reemplace', `${foco}\n[data-v3][data-v3] input:focus-visible { outline-color: transparent; }`, seMuda)
controlPositivo('  y una pastilla que no dibuja nada', foco.replace('[data-v3] [data-foco="pastilla"]:has(:focus-visible) {\n  border-color: var(--color-tinta);', '[data-v3] [data-foco="pastilla"]:has(:focus-visible) {\n  border-color: var(--color-borde-fuerte);'), seMuda)
// En el marcado: cada campo de texto del panel, en su pastilla; los del pie, su propia caja; sin «/»; un solo obligatorio.
const hoja = renderToStaticMarkup(<HojaParaElInvariante />)
const panelBien = (h: string): boolean =>
  (h.match(/<label data-foco="pastilla"/g) ?? []).length === 5 && !/>\/ </.test(h) && /<p[^>]*>1\. ¿Qué querés hacer\?<\/p>/.test(h) &&
  [...h.matchAll(/<(input|textarea)[^>]*\srequired=""[^>]*>/g)].map((m) => /name="([^"]+)"/.exec(m[0])?.[1]).join() === 'medio' && h.includes(PIE)
afirmar(panelBien(hoja) && PIE === 'Si sos vago, con tu mail alcanza.' && CAMPOS.empresa.rotulo === 'Empresa', 'el panel: los cinco campos de texto en su pastilla (`data-foco`); las preguntas sin la barra de nk («1. ¿Qué querés hacer?»); el único `required`, el del email o teléfono; la nota nueva; la empresa sin «(opcional)» (ahora todo lo es)')
controlPositivo('el detector VE la barra de antes', hoja.replace('>1. ¿Qué', '><span aria-hidden="true" class="text-tinta-media">/ </span>1. ¿Qué'), panelBien)
const pie = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
afirmar((pie.match(/data-foco="campo"/g) ?? []).length === 2 && pie.includes("required={k === 'mail'}") && !/\srequired\s/.test(pie), '  el pie: sus campos son su propia caja (`data-foco="campo"`: el borde del pozo, claro sobre la placa) y el único obligatorio es el mail')
// El Tab llega a los campos: la trampa del diálogo (la del contacto) cuenta los controles de formulario.
const focalizables = (sel: string): boolean => ['input', 'textarea', 'select'].every((t) => sel.includes(`${t}:not([disabled])`)) && sel.includes(':not([type="hidden"])')
afirmar(focalizables(SELECTOR_DE_FOCALIZABLES), 'el Tab llega a los campos del panel: la trampa de foco (la de las demos, que el contacto usa) cuenta los controles de formulario (antes daba la vuelta entre la cruz, Enviar y el mail sin entrar NUNCA a un campo)')
controlPositivo('el detector VE la trampa de antes', 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', focalizables)
// Sólo el contacto es obligatorio, en el navegador y en el servidor.
const NADA: DatosDeContacto = { intereses: [], presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }
const soloElContacto = Object.keys(validarContacto({ ...NADA, medio: 'ana@empresa.com' })).length === 0 && Object.keys(validarContacto({ ...NADA, medio: '11 5566 7788' })).length === 0 && Object.keys(validarContacto(NADA)).join() === 'medio' && Object.keys(validarElPie({ nombre: '', mail: 'ana@empresa.com', mensaje: '' })).length === 0 && Object.keys(validarElPie({ nombre: '', mail: '', mensaje: '' })).join() === 'mail'
const ruta = sinComentarios(readFileSync('src/app/api/contacto/route.ts', 'utf8').replace(/\r\n/g, '\n'))
const servidorBien = (r: string): boolean =>
  r.includes('const opcional = (max: number): z.ZodString => z.string().trim().max(max)') && !/\.min\(/.test(r) && r.includes('intereses: z.array(z.enum(IDS)).max(IDS.length)') && r.includes('mail: z.string().trim().max(MAXIMOS.contacto).regex(EMAIL)') && /medio: z\s*\.string\(\)\s*\.trim\(\)\s*\.max\(MAXIMOS\.contacto\)\s*\.refine/.test(r)
afirmar(soloElContacto && servidorBien(ruta), 'el único obligatorio es el contacto: en el panel el email o el teléfono, en el pie el mail; lo demás puede ir vacío, en el navegador y en el endpoint (que sigue frenando el largo y el límite por IP)')
controlPositivo('el detector VE el endpoint de RONDA 2 (pedía nombre y mensaje)', ruta.replace('nombre: opcional(MAXIMOS.nombre),\n  mail', 'nombre: z.string().trim().min(2).max(MAXIMOS.nombre),\n  mail'), servidorBien)
// El contacto pedido con el menú del teléfono abierto: primero se cierra el menú y la hoja se abre al soltar su trampa.
const apertura = sinComentarios(leer('_chrome/contacto/apertura.ts'))
const menuMovil = sinComentarios(leer('_chrome/menu/MenuMovil.tsx'))
const cierraElMenu = (a: string, m: string): boolean =>
  /if \(menuAbierto !== null\) \{\s*const cerrarElMenu = menuAbierto\s*menuAbierto = null\s*cerrarElMenu\(\(\) => abrirContacto\(precarga, origen\)\)\s*return/.test(a) &&
  m.includes('despuesDelMenu.current = despues') && m.includes('menu.current?.cerrar()') && m.includes('if (despues !== null || haciaElContacto.current) anotarElMenuAbierto(null)')
afirmar(cierraElMenu(apertura, menuMovil), 'con el menú del teléfono abierto, un pedido del contacto primero lo cierra (su Genie) y abre la hoja al soltar la trampa: el foco entra a la hoja (antes la trampa del menú lo retenía)')
controlPositivo('el detector VE la apertura de antes (con el menú abierto, la hoja detrás)', apertura.replace(/if \(menuAbierto !== null\) \{[\s\S]*?return\s*\}/, ''), (a: string) => cierraElMenu(a, menuMovil))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2A · El final del pie arranca solo al llegar al pie; el scroll lo adelanta; un gesto hacia arriba lo revierte')

// [RETOQUE DEL ENCASTRE] 1D · cambió por pedido: sin cola, el scroll ya no adelanta la secuencia; arranca cuando el pie
// llegó entero y un gesto hacia arriba la REBOBINA (antes la revertía y se quedaba en cero). El reloj nuevo, con este
// como control positivo, lo afirma s51 1D.
// [2D] el cuadro del final vive en `cuadroDelFinal.ts` (el componente lo llama).
const finalTsx = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
afirmar(RELOJ_DEL_FINAL.duracionS === 6.4 && finalTsx.includes('EN_VIVO.fin = s.reloj.fin') && finalTsx.includes('pasoDelReloj(s.reloj, {'), 'la secuencia dura 6,4 s a su ritmo y `fin` es el de su reloj (cómo arranca, se rebobina y se deshace: s51 1D)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2B · El logo se acuesta en su lugar (sobre su centro), cae derecho al piso; la cámara sube en paralelo, centrada en el logo')

const TAM = { alto: 4.78, espesor: 0.56 } as const
type Pose = (fin: number, t: typeof TAM, destino: { centro: THREE.Vector3; rotacionX: number }) => void
const recorrerLaPose = (pose: Pose): { readonly enSuLugar: boolean; readonly quietoAlAcostarse: boolean; readonly acostadoA: number; readonly cae: boolean; readonly enElPiso: number } => {
  const p = { centro: new THREE.Vector3(), rotacionX: 0 }
  let [enSuLugar, quietoAlAcostarse, cae, antesY] = [true, true, true, Number.POSITIVE_INFINITY]
  let acostadoA = Number.NaN
  for (let i = 0; i <= 640; i += 1) {
    const fin = i / 640
    const s = segundosDelFinal(fin)
    pose(fin, TAM, p)
    if (Math.abs(p.centro.x) > 1e-9 || Math.abs(p.centro.z) > 1e-9) enSuLugar = false
    if (s <= FINAL_DEL_PIE.acostarseS && Math.abs(p.centro.y) > 1e-9) quietoAlAcostarse = false
    if (Number.isNaN(acostadoA) && Math.abs(p.rotacionX + Math.PI / 2) < 1e-6) acostadoA = s
    if (s >= FINAL_DEL_PIE.caida.desdeS && s <= aterrizaje(TAM) && p.centro.y > antesY + 1e-9) cae = false
    antesY = p.centro.y
  }
  return { enSuLugar, quietoAlAcostarse, acostadoA, cae, enElPiso: antesY }
}
const laPose = recorrerLaPose(poseDelLogo)
afirmar(laPose.enSuLugar && laPose.quietoAlAcostarse && Math.abs(laPose.acostadoA - FINAL_DEL_PIE.acostarseS) < 0.02 && laPose.cae && laPose.enElPiso < FLOOR_Y + TAM.espesor / 2, 'se acuesta EN SU LUGAR: gira sobre su propio centro (el centro quieto, sobre el eje) hasta −90° y recién ahí cae derecho al piso, con gravedad', `acostado a los ${laPose.acostadoA.toFixed(2)} s · toca el piso a los ${aterrizaje(TAM).toFixed(2)} s`)
// El control: la pose de CIERRE (giraba sobre su base: el centro se corría hacia el fondo la mitad del alto).
const poseDeCierre: Pose = (fin, t, d) => {
  const k = acostado(fin)
  const tita = (-Math.PI / 2) * k
  d.centro.set(0, -t.alto / 2 + (t.alto / 2) * Math.cos(tita), (t.alto / 2) * Math.sin(tita))
  d.rotacionX = tita
}
controlPositivo('el detector VE la pose de CIERRE (sobre su base: el logo se corría)', poseDeCierre, (p: Pose) => recorrerLaPose(p).enSuLugar)
// La cámara: sube en paralelo con el logo que se acuesta; su blanco es el centro del logo y con la caída baja al piso, centrado.
const blanco = new THREE.Vector3()
let blancoBien = true
for (let i = 0; i <= 64; i += 1) {
  const fin = i / 64
  blancoDelFinal(fin, blanco)
  if (blanco.x !== 0 || blanco.z !== 0 || (segundosDelFinal(fin) <= FINAL_DEL_PIE.caida.desdeS && blanco.y !== 0)) blancoBien = false
}
blancoDelFinal(1, blanco)
// [2D] El 80 % de la subida va en paralelo con el logo (justo lo que se acostó, por 0,8) y el resto mientras se encastra:
// desde el cenit el logo acostado tapaba su propio hueco.
const enParalelo = [0.25, 0.5, 0.75, 1].every((u) => Math.abs(subida((u * FINAL_DEL_PIE.acostarseS) / RELOJ_DEL_FINAL.duracionS) - FINAL_DEL_PIE.subida.conElLogo * acostado((u * FINAL_DEL_PIE.acostarseS) / RELOJ_DEL_FINAL.duracionS)) < 1e-9)
afirmar(blancoBien && Math.abs(blanco.y - FLOOR_Y) < 1e-9 && enParalelo && subida(FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS) === 1, 'la cámara sube en paralelo con el logo (el 80 % de su camino mientras se acuesta; el resto, mientras se encastra) y mira siempre al eje: el centro del logo mientras se acuesta y, con la caída, el piso donde se encastra')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2C · El vapor: [RETOQUE DEL ENCASTRE] 1A · cambió por pedido: se fue entero (sin partículas; lo afirma s51 1A)')

afirmar(!existsSync(`${V3}/_lib/escena/final/vapor.ts`) && !existsSync(`${V3}/_lib/escena/final/explosion.ts`) && !/vapor|Points/i.test(finalTsx), 'el final no tiene partículas: ni el vapor de EL ENCASTRE ni la explosión de CIERRE (se abre el hueco y el logo encaja)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2D · El hueco exacto: se abre cuando el logo está por llegar, el logo cae justo ahí y se hunde lento, a presión, hasta el ras')

// El hundimiento: de la cara de abajo al ras del borde (0) al ras del piso (1), en tramos que resisten y ceden.
type Hundido = (fin: number, t: typeof TAM) => number
const presionDe = (h: Hundido): { readonly sube: boolean; readonly completo: boolean; readonly lento: boolean; readonly cedeDeGolpe: boolean; readonly duraS: number } => {
  const t0 = aterrizaje(TAM)
  const t1 = FINAL_DEL_PIE.presion.hastaS
  const muestras = Array.from({ length: 2001 }, (_, i) => t0 + ((t1 - t0) * i) / 2000).map((s) => h(s / RELOJ_DEL_FINAL.duracionS, TAM))
  const sube = muestras.every((v, i) => i === 0 || v >= muestras[i - 1] - 1e-12)
  const completo = muestras[0] === 0 && h(t1 / RELOJ_DEL_FINAL.duracionS, TAM) === 1 && h(1, TAM) === 1
  // Lento: en ningún momento baja más rápido que un espesor en 0,4 s (una caída libre lo haría en centésimas).
  const paso = (t1 - t0) / 2000
  const velocidades = muestras.slice(1).map((v, i) => (v - muestras[i]) / paso)
  const lento = Math.max(...velocidades) < 1 / 0.12
  // A presión: hay momentos de casi nada (resiste) y momentos de mucho (cede), no una bajada pareja.
  const quietos = velocidades.filter((v) => v < 0.2).length / velocidades.length
  const cedeDeGolpe = quietos > 0.4 && Math.max(...velocidades) > 3 * (1 / (t1 - t0))
  return { sube, completo, lento, cedeDeGolpe, duraS: t1 - t0 }
}
const aPresion = (p: ReturnType<typeof presionDe>): boolean => p.sube && p.completo && p.lento && p.cedeDeGolpe && p.duraS > 1.5
const medidaLaPresion = presionDe(hundido)
afirmar(aPresion(medidaLaPresion), 'cae justo en el hueco y se hunde LENTO y a presión hasta quedar al ras: en tramos que resisten (casi no baja, tiembla) y ceden de a poco, sin volver nunca para arriba', `${medidaLaPresion.duraS.toFixed(2)} s, en ${String(FINAL_DEL_PIE.presion.tramos.length)} tramos`)
const conRebote: Hundido = (fin, t) => {
  const u = Math.min(1, Math.max(0, (segundosDelFinal(fin) - aterrizaje(t)) / 1.2))
  return u <= 0 ? 0 : 1 - Math.exp(-5 * u) * Math.cos(10 * u)
}
controlPositivo('el detector VE el encastre de CIERRE (un rebote rápido)', conRebote, (h: Hundido) => aPresion(presionDe(h)))
const parejo: Hundido = (fin, t) => Math.min(1, Math.max(0, (segundosDelFinal(fin) - aterrizaje(t)) / (FINAL_DEL_PIE.presion.hastaS - aterrizaje(t))))
controlPositivo('  y uno parejo (sin presión: baja siempre igual)', parejo, (h: Hundido) => aPresion(presionDe(h)))
const alRas = { centro: new THREE.Vector3(), rotacionX: 0 }
poseDelLogo(1, TAM, alRas)
afirmar(Math.abs(alRas.centro.y + TAM.espesor / 2 - FLOOR_Y) < 1e-9, '  al final, al ras: la cara de arriba del logo en el piso')
// Se abre cuando el logo está por llegar (cerrado mientras se acuesta, abierto antes de que caiga adentro).
afirmar(aperturaDelHueco(1.5 / RELOJ_DEL_FINAL.duracionS) === 0 && aperturaDelHueco(HUECO.abre.hastaS / RELOJ_DEL_FINAL.duracionS) === 1 && HUECO.abre.hastaS < aterrizaje(TAM) && HUECO.abre.desdeS > FINAL_DEL_PIE.caida.desdeS - 1, 'el hueco se abre cuando el logo está por llegar: arranca en el último tramo del acostarse y está abierto antes de que el logo toque', `de ${String(HUECO.abre.desdeS)} a ${String(HUECO.abre.hastaS)} s · toca a los ${aterrizaje(TAM).toFixed(2)} s`)
// En el piso: descarta sus tapas y costados donde la máscara (en el plano del logo: x, −z) dice adentro y la apertura deja.
const enElPisoTs = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const huecoEnElPiso = (c: string): boolean =>
  c.includes('vec2 uv = ( vec2( xz.x, - xz.y ) - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw;') && c.includes('return m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95;') && c.includes('\\n\\tif ( enElHueco( vPiso.xz ) ) discard;') &&
  c.includes("'vec2 m = manchaDelContacto( vPiso.xz ) * ( 1.0 - uSinMancha );'") && c.includes("'if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {'") && c.includes('dibujo *= 1.0 - calmaDelFinal( xz );')
afirmar(huecoEnElPiso(enElPisoTs), '  en el piso: las tapas y los costados se descartan donde la máscara del logo acostado dice adentro (y la apertura deja: se abre desde el medio de los trazos hasta el borde exacto); alrededor el mar se calma y el techo que esquivaba al logo se apaga (entra en el piso); la mancha de contacto se va con la cámara')
controlPositivo('el detector VE un hueco que no se abre (sin descarte)', enElPisoTs.replace('\\n\\tif ( enElHueco( vPiso.xz ) ) discard;', ''), huecoEnElPiso)
const simulacionConElFinal = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
afirmar(simulacionConElFinal.includes('if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {') && simulacionConElFinal.includes('dibujo *= 1.0 - calmaDelFinal( xz );'), '  y la simulación del piso de verdad lo lleva (las anclas siguen ahí)')
// El pozo: las paredes con la forma del logo y el fondo, de un espesor y un pelo de hondo, acostado al ras del piso.
const cuadrado = new THREE.Shape([new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1), new THREE.Vector2(1, 1), new THREE.Vector2(-1, 1)])
const pozo = crearElPozo([cuadrado], TAM.espesor)
const caja3 = new THREE.Box3().setFromObject(pozo.grupo)
// [RETOQUE DEL ENCASTRE] 1C · cambió por pedido: el tope del pozo, un pelo debajo del piso (`HUECO.bajoElRas`: sin contorno; s51 1C).
const pozoBien = !pozo.grupo.visible && Math.abs(caja3.max.y - (FLOOR_Y - HUECO.bajoElRas)) < 1e-6 && Math.abs(caja3.min.y - (FLOOR_Y - HUECO.bajoElRas - TAM.espesor * HUECO.hondo)) < 1e-6 && pozo.grupo.children.length === 2 && (((pozo.grupo.children[0] as THREE.Mesh).material as THREE.Material[])[0].visible === false)
pozo.soltar()
afirmar(pozoBien, '  el pozo: las paredes (sin las tapas de la extrusión: la de arriba taparía el hueco) y el fondo, de un espesor del logo y un pelo de hondo, con su tope apenas debajo del piso; invisible hasta que el hueco se abre', `${(TAM.espesor * HUECO.hondo).toFixed(3)} u de hondo`)
// [RETOQUE DEL ENCASTRE] 1A · cambió por pedido: el vapor que caía adentro del hueco se fue con el vapor (s51 1A).

// ═══════════════════════════════════════════════════════════════════════════
titulo('2E · El poder: al quedar al ras, un pulso centrado en el logo; [RETOQUE DEL ENCASTRE] 1F · energiza el piso (luz, no tinta)')

// El poder: 0 hasta quedar al ras; un destello y después entero; función de `fin` (al revertir se apaga).
const alRasS = FINAL_DEL_PIE.presion.hastaS
const enS = (s: number): number => poderDelFinal(s / RELOJ_DEL_FINAL.duracionS)
const pico = Math.max(...Array.from({ length: 60 }, (_, i) => enS(alRasS + (i * 0.6) / 60)))
const poderBien = enS(alRasS - 0.01) === 0 && enS(alRasS - 1) === 0 && pico > 1.3 && Math.abs(enS(RELOJ_DEL_FINAL.duracionS) - 1) < 1e-9 && enS(alRasS + 0.05) > 0
afirmar(poderBien, 'el poder se libera cuando el logo queda al ras (ni antes): un destello y se asienta entero; es función de `fin`, así que al revertir se apaga', `destello ${pico.toFixed(2)} · al ras a los ${String(alRasS)} s`)
// El golpe (su pulso) cae al quedar al ras y nace en el centro del logo; al tocar el piso, sólo un golpecito.
const golpeBien = (c: string): boolean => c.includes('const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS') && c.includes('piso.uGolpe.value.set(t, 0, 0, 1)') && c.includes('piso.uPoder.value = poder(fin)') && c.includes('if (!s.estatico && s.antes < aterriza && fin >= aterriza) s.tocoEn = t') && c.includes('if (!s.estatico && s.antes < golpe && fin >= golpe) {')
afirmar(golpeBien(finalTsx), '  el pulso nace en el centro del logo al quedar al ras (una vez por bajada) y corre por el piso con su física; al tocar el piso, sólo un golpecito de la cámara')
controlPositivo('el detector VE el golpe de CIERRE (al tocar el piso)', finalTsx.replace('const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS', 'const golpe = aterrizaje(tamano) / RELOJ_DEL_FINAL.duracionS'), golpeBien)
// El dibujo: [RETOQUE DEL ENCASTRE] 1F · cambió por pedido: el resplandor de tinta alrededor del logo (núcleo negro en la
// junta, halo y aura) se fue: después del encastre el piso entero queda energizado y la luz sale por las rendijas que abren
// las ondas, el mar y el pulso del golpe (s51 1F). Sin tinta en el dibujo, y sin la banda oscura de CIERRE.
// [NOCTURNO FINAL] B2 · cambió por pedido: lo que energiza el piso después del encastre es la lava del piso entero (s52 B2).
const sinTinta = (c: string): boolean => c.includes('gl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );') && c.includes('float energia = min( 1.0, uPoder ) * fueraDeLaCalma( xz );') && c.includes('return conLaLava( color, lava.x, lava.y );') && !/vec3\( 0\.045 \)/.test(c) && !/GOLPE_EN_EL_PISO\.banda|\bbanda: 0\.55/.test(c)
afirmar(sinTinta(enElPisoTs), 'el poder liberado no dibuja tinta: energiza el piso (NOCTURNO FINAL B2: la lava, por las juntas); la banda oscura de CIERRE, que se leía como una mancha, no vuelve')
controlPositivo('el detector VE la tinta de EL ENCASTRE', enElPisoTs + "\nreturn mix( color, vec3( 0.045 ), clamp( junta * r, 0.0, 0.96 ) );", sinTinta)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2F · El piso bajo el mouse: los bloques se levantan y por las rendijas sale el resplandor de abajo; se calma con inercia')

// El rastro: la cabeza sigue al mouse y deja puntos cada `cada`; al irse el mouse, todos se apagan de a poco (no de golpe).
type PasoDelRastro = typeof pasoDelRastro
const rastroDe = (paso: PasoDelRastro): { readonly dejados: number; readonly separados: boolean; readonly alIrse: number; readonly aLos3s: number; readonly aLos5s: number; readonly quieto: number } => {
  const puntos = Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0))
  const e = rastroQuieto()
  for (let i = 0; i <= 60; i += 1) paso(puntos, e, -3 + i * 0.05, 1, 1, 1 / 60)
  const vivos = puntos.filter((q) => q.z > 0.2)
  // Los que quedaron atrás (sin la cabeza, que sigue al mouse y acaba de nacer junto al último).
  const xs = vivos.map((q) => q.x).sort((a, b) => a - b).slice(0, -1)
  const separados = xs.length > 2 && xs.slice(1).every((x, i) => x - xs[i] > RASTRO_EN_EL_PISO.cada * 0.8)
  for (let i = 0; i < 6; i += 1) paso(puntos, e, 0, 1, 0, 1 / 60)
  const alIrse = Math.max(...puntos.map((q) => q.z))
  for (let i = 0; i < 180; i += 1) paso(puntos, e, 0, 1, 0, 1 / 60)
  const aLos3s = Math.max(...puntos.map((q) => q.z))
  for (let i = 0; i < 120; i += 1) paso(puntos, e, 0, 1, 0, 1 / 60)
  const aLos5s = Math.max(...puntos.map((q) => q.z))
  const otros = Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0))
  const eq = rastroQuieto()
  for (let i = 0; i < 120; i += 1) paso(otros, eq, 2, 2, 1, 1 / 60)
  return { dejados: vivos.length, separados, alIrse, aLos3s, aLos5s, quieto: Math.max(...otros.map((q) => q.z)) }
}
const conInercia = (r: ReturnType<typeof rastroDe>): boolean => r.dejados >= 4 && r.separados && r.alIrse > 0.8 && r.aLos3s < 0.05 && r.aLos5s === 0 && r.quieto === 1
const medidoElRastro = rastroDe(pasoDelRastro)
afirmar(conInercia(medidoElRastro), 'donde pasa el mouse deja un rastro (puntos separados, no un círculo que lo sigue); con el mouse quieto, la cabeza queda entera; al irse, se calma con inercia (a los 0,1 s sigue casi entero; a los 3 s, casi nada; a los 5 s, nada)', `${String(medidoElRastro.dejados)} puntos vivos · al irse ${medidoElRastro.alIrse.toFixed(2)}`)
const sinInercia: PasoDelRastro = (puntos, e, x, z, vale, dt) => {
  if (vale <= 0) for (const q of puntos) q.z = 0
  else pasoDelRastro(puntos, e, x, z, vale, dt)
}
controlPositivo('el detector VE un piso que se apaga de golpe al irse el mouse', sinInercia, (p: PasoDelRastro) => conInercia(rastroDe(p)))
// En el piso: levanta los bloques (la simulación) y el resplandor sale por las juntas, más por las rendijas que se abren
// (el vecino más bajo); el círculo oscuro de CIERRE (una mancha plana que seguía al mouse) se fue.
// [RETOQUE DEL ENCASTRE] 1E · cambió por pedido: lo que sale por las rendijas bajo el mouse es LUZ, no tinta (s51 1E).
// [NOCTURNO FINAL] B2 · cambió por pedido: el mouse ya no hace brillo; su rastro sólo levanta los bloques (s51 1E, s52 B2).
const conElRastro = (piso: string, simulacion: string): boolean =>
  simulacion.includes('fuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );') && !piso.includes('resplandorDelRastro') && !piso.slice(piso.indexOf('const DIBUJO_GLSL'), piso.indexOf('export const ANCLAS_DEL_HUECO')).includes('uRastro[') && !/cuantoDelFinal|uCursorDelFinal|uVibraDelFinal/.test(piso)
const simulacionDelRastro = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
afirmar(conElRastro(enElPisoTs, simulacionDelRastro) && RASTRO_EN_EL_PISO.alto < 0.6, 'los bloques del rastro se levantan un poco (menos que la loma del cursor), sin brillo (NOCTURNO FINAL B2); el círculo oscuro de CIERRE se fue', `${String(RASTRO_EN_EL_PISO.alto)} u · radio ${String(RASTRO_EN_EL_PISO.radio)} u`)
controlPositivo('el detector VE el círculo oscuro de CIERRE', enElPisoTs + '\nfloat cuantoDelFinal( vec2 xz ) {', (c: string) => conElRastro(c, simulacionDelRastro))
// Con el poder: antes de quedar al ras, el mouse no deja nada.
afirmar(finalTsx.includes('const vale = toca !== null ? Math.min(1, piso.uPoder.value) * s.presencia : 0') && finalTsx.includes('apagarElRastro(p.uRastro.value, s.rastro)'), '  sólo con el poder liberado (antes, el mouse no deja nada) y se apaga entero al soltar el final')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2G · Quieto en el pie: como ahora, la cámara gira y se aleja; arranca 1,4 s después de que el final quedó entero')

// El final arranca solo, así que al terminar ya llevaba más de 1,4 s sin scroll: el quieto espera también al final entero.
// [RETOQUE DEL ENCASTRE] 1D · cambió por pedido: espera también a un rato sin gestos (al fondo un gesto no mueve la página).
const esperaAlFinal = (c: string): boolean => c.includes('s.enteroS = fin > 0.995 ? s.enteroS + dt : 0') && c.includes('relojDelQuieto(s.quietoS, fin > 0.995, Math.min(s.sinScrollS, s.enteroS, sinGestoS), dt, EN_VIVO)')
afirmar(esperaAlFinal(finalTsx) && FINAL_DEL_PIE.quieto.desdeS === 1.4, 'el quieto (la cámara que gira sin fin y se aleja hacia su tope, s49) arranca 1,4 s después de que el final quedó entero y sin scroll: no en el mismo instante en que termina el encastre', `${String(FINAL_DEL_PIE.quieto.desdeS)} s`)
controlPositivo('el detector VE el quieto de CIERRE (sólo el scroll: con el arranque solo, empezaba al terminar)', finalTsx.replace('Math.min(s.sinScrollS, s.enteroS, sinGestoS)', 's.sinScrollS'), esperaAlFinal)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2H · Las piezas del pie de frente y usables; sólo desde 1024 (abajo y con movimiento reducido, el pie de hoy, s49); costo acotado')

// De frente: cada pieza copia la orientación de la cámara sin el mouse, y el final mueve esa cámara con la viva (sube,
// gira en el quieto): las piezas van con ella durante toda la secuencia.
const colocacion = sinComentarios(leer('_lib/escena/pie3d/colocacion.ts'))
const armadasTs = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const deFrente = (c: string, ar: string, fi: string): boolean => c.includes('grupo.quaternion.copy(camara.quaternion)') && ar.includes('colocarLaPieza(a.grupo, CAMARA_SIN_EL_MOUSE,') && fi.includes('camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, s.sacudon.lengthSq() > 0 ? s.sacudon : null, distancia)') && fi.includes('camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null, distancia)')
afirmar(deFrente(colocacion, armadasTs, finalTsx), 'las piezas del pie miran siempre a la cámara sin el mouse, que el final lleva con la viva (sube, gira en el quieto): de frente durante toda la secuencia; su DOM va por la homografía (usable donde se ve)')
controlPositivo('el detector VE un final que mueve sólo la cámara viva (las piezas se quedarían mirando al costado)', finalTsx.replace('camaraDelFinal(CAMARA_SIN_EL_MOUSE,', 'camaraDelFinal(null,'), (fi: string) => deFrente(colocacion, armadasTs, fi))
// Costo: el final suma como mucho dos dibujos (las paredes y el fondo del pozo), invisibles fuera del final; el resplandor,
// el hueco y el rastro van adentro del shader del piso (cero dibujos), con lazos acotados. [RETOQUE DEL ENCASTRE] 1A · eran
// tres con el vapor (cambió por pedido: el vapor se fue).
const pozoDeCosto = crearElPozo([new THREE.Shape([new THREE.Vector2(-1, -1), new THREE.Vector2(1, -1), new THREE.Vector2(1, 1)])], TAM.espesor)
const dibujosDelFinal = [...pozoDeCosto.grupo.children]
const costoBien = dibujosDelFinal.length <= 2 && !pozoDeCosto.grupo.visible && RASTRO_EN_EL_PISO.puntos <= 8 && !/new THREE\.(Mesh|Points|Line)/.test(enElPisoTs)
pozoDeCosto.soltar()
afirmar(costoBien, 'costo acotado: el final suma como mucho 2 dibujos (paredes y fondo del pozo), invisibles fuera del final (nada fuera del pie); el resplandor y el rastro van en el shader del piso, sin dibujos nuevos', `${String(dibujosDelFinal.length)} dibujos · rastro de ${String(RASTRO_EN_EL_PISO.puntos)}`)

cerrar('s50-encastre')
