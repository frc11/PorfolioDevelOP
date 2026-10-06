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
 * (1A, el túnel en k = 1,8 sin la bandera `tunelk`, lo afirma s49 1C al día.) Lo que se mira en vivo:
 * `~/.cache/b4-medicion/encastre/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

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
const conResorte = (r: Recorrido): boolean => r.picoAlEntrar > 1.05 && Math.abs(r.asentado - 1) < 0.02 && r.valleAlSalir < -0.05 && r.cerradoEnS <= 2.5 && r.atrasoA50ms > 0.1 && r.atrasoA400ms < 0.01 && r.saltoAlEntrar < 1e-6
const medido = recorrer(pasoDelPuntero)
afirmar(conResorte(medido), 'la fuerza se abre al entrar pasándose un poco y, al salir, vuelve a cero pasándose hacia adentro y se asienta en cero exacto (el resorte); el hueco sigue al cursor con atraso y, cerrado, salta adonde entra el mouse (no cruza el símbolo)', `pico ${medido.picoAlEntrar.toFixed(2)} · valle ${medido.valleAlSalir.toFixed(2)} · cerrado en ${medido.cerradoEnS.toFixed(2)} s · atraso a 50 ms ${medido.atrasoA50ms.toFixed(2)}`)
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

cerrar('s50-encastre')
