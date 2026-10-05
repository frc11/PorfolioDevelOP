/**
 * EL ENCASTRE — el invariante: npm run test:s50-encastre
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1B · la aparición de las demos persigue al scroll con una velocidad tope (como el amanecer), en los dos anchos y en
 *        las dos direcciones; abajo de 1024 la capa rígida crece en 1,4 vacíos; el título es «Demos», como Portfolio.
 * (1A, el túnel en k = 1,8 sin la bandera `tunelk`, lo afirma s49 1C al día.) Lo que se mira en vivo:
 * `~/.cache/b4-medicion/encastre/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { APARICION, LLEGADA, aparicionPedida, enElTramo, escalaDeDemos, llegadaDeDemos, llegadaDeLaAparicion, perseguirLaAparicion, tramoDelLibro } from '../../_secciones/trabajos/demos/entrada'
import { FIN_DE_LA_LLEGADA_EN_EL_VACIO, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
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

cerrar('s50-encastre')
