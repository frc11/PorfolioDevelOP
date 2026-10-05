/**
 * CIERRE + FINAL DEL PIE — el invariante: npm run test:s49-cierre-final
 *
 * Cada arreglo y cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1A · el velo de carga siempre se va: abajo de 1024 espera sólo las fuentes y el primer cuadro de la escena; con
 *        JavaScript, el seguro de 4 s sin condiciones; sin hidratar, la hoja lo saca en los dos modos de movimiento.
 *   1B · la llegada de los demos de Trabajos (título, párrafo y libros, en el vacío del túnel) dura el doble de scroll:
 *        arranca donde siempre y su reloj corre a la mitad; el vacío no cambia; el piso del regulador la espera entera.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/cierre-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { LLEGADA, escalaDeDemos, llegadaDeDemos, tramoDelLibro } from '../../_secciones/trabajos/demos/entrada'
import { BANDA_DEL_EFECTO, FIN_DE_LA_LLEGADA_EN_EL_VACIO, LLEGADA_DE_LOS_DEMOS, MARGEN_DEL_DESPINEADO, PX_DEL_FIN_DE_LA_LLEGADA, PX_DE_LA_SECCION, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
import { enElRiel } from '../../_secciones/trabajos/regulador'
import { CARGA, SEGURO_DEL_VELO_MS, estaTodo, type EstadoDeLaCarga } from '../carga'
import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1A · El velo de carga siempre se va, en todos los anchos (en el teléfono quedaba tapando la página)')

// Qué espera, por ancho: el peor caso es el titular anotado y nunca armado (lo que la hipótesis del teléfono temía).
const ANCHOS = [320, 360, 390, 412, 600, 768, 1000, 1023, 1024, 1025, 1280, 1440, 1920] as const
type Regla = (e: EstadoDeLaCarga) => boolean
const conLoQueHayAhi = (regla: Regla): boolean =>
  ANCHOS.every((ancho) => {
    const escritorio = ancho >= ESCENARIO_MIN_ANCHO_PX
    const peor = { fuentes: true, primerCuadro: true, caida: false, escritorio, conTitular: true, titularListo: false }
    // Abajo de 1024 alcanzan las fuentes y el primer cuadro (o la escena caída); desde 1024 se espera el titular anotado.
    return regla(peor) === !escritorio && regla({ ...peor, primerCuadro: false, caida: true }) === !escritorio && !regla({ ...peor, fuentes: false }) && !regla({ ...peor, primerCuadro: false }) && regla({ ...peor, titularListo: true })
  })
afirmar(conLoQueHayAhi(estaTodo) && ESCENARIO_MIN_ANCHO_PX === 1024, 'abajo de 1024 (el umbral del sitio: desde ahí se monta como escritorio) el velo espera sólo lo que existe ahí —las fuentes y el primer cuadro de la escena (o la escena caída)—, aunque un titular de volumen estuviera anotado; desde 1024, además el titular del hero armado', `${String(ANCHOS.length)} anchos, de ${String(ANCHOS[0])} a ${String(ANCHOS[ANCHOS.length - 1])}`)
controlPositivo('el detector VE la regla de A4 (el titular anotado se esperaba en cualquier ancho)', (e: EstadoDeLaCarga) => e.fuentes && (e.primerCuadro || e.caida) && (!e.conTitular || e.titularListo), conLoQueHayAhi)

// Sin hidratar (el teléfono por la IP de la red, un módulo que no llega): la hoja sola. Cuándo se va, por modo de movimiento.
const hoja = leer('_estilos/carga.css')
const politica = readFileSync('src/app/globals.css', 'utf8').replace(/\r\n/g, '\n')
const reglaReducida = /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{([^}]*)\}/.exec(politica)?.[1] ?? ''
const laPoliticaSacaLaEspera = /animation-delay: 0ms !important/.test(reglaReducida) && /animation-duration: 1ms !important/.test(reglaReducida)
/** Cuándo se va el velo sin JavaScript (ms desde el arranque); `Infinity`: nunca. Con movimiento reducido manda la política. */
const seVaSinJs = (h: string, reducido: boolean): number => {
  const plazo = Number(/--velo-espera: (\d+)ms/.exec(h)?.[1])
  const fundido = Number(/--velo-fundido: (\d+)ms/.exec(h)?.[1])
  if (!reducido) return /\[data-velo='espera'\] \{\s*animation: velo-de-carga-sale var\(--velo-fundido\) var\(--ease-salida\) var\(--velo-espera\) both;/.test(h) ? plazo + fundido : Infinity
  // La regla de la espera con movimiento reducido (si la hay): `animation: none` la deja opaca para siempre.
  const enReducido = /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza='velo-de-carga'\]\[data-velo='espera'\] \{([^}]*)\}/.exec(h)?.[1] ?? ''
  if (/animation: none/.test(enReducido)) return Infinity
  // Si no le devuelve la espera con `!important`, la política se la saca: se iría en el acto, antes de que esté nada.
  if (!/animation-delay: var\(--velo-espera\) !important;/.test(enReducido)) return laPoliticaSacaLaEspera ? 0 : plazo
  // Con la espera devuelta, la animación de la política (1 ms) es un corte a los `plazo` (en escalón: no hay fundido).
  return /animation-timing-function: step-end;/.test(enReducido) ? plazo : plazo + 1
}
const siempreSeVa = (h: string): boolean => [false, true].every((reducido) => seVaSinJs(h, reducido) >= CARGA.plazoMs && seVaSinJs(h, reducido) <= CARGA.plazoMs + CARGA.fundidoMs)
afirmar(laPoliticaSacaLaEspera && siempreSeVa(hoja) && /<style>\{`\[data-v3\] \[data-pieza='velo-de-carga'\] \{ display: none; \}`\}<\/style>/.test(leer('_componentes/VeloDeCarga.tsx')), 'sin hidratar, la hoja lo saca sola a los 4 s en los dos modos: con movimiento, con su fundido (4–4,8 s); con movimiento reducido, de golpe a los 4 s (el `!important` le devuelve la espera que la política le saca); sin JavaScript, el `<noscript>`', `con movimiento ${String(seVaSinJs(hoja, false))} ms · reducido ${String(seVaSinJs(hoja, true))} ms`)
controlPositivo('el detector VE la hoja de A4 (con movimiento reducido la espera no se animaba: opaco para siempre)', hoja.replace(/animation-timing-function: step-end;\s*animation-delay: var\(--velo-espera\) !important;/, 'animation: none;'), siempreSeVa)
controlPositivo('  y VE el corte sin `!important` (la política le saca la espera: destapado antes de que esté nada)', hoja.replace('animation-delay: var(--velo-espera) !important;', 'animation-delay: var(--velo-espera);'), siempreSeVa)

// Con JavaScript: el seguro sin condiciones (ni de lo que llegó, ni del ancho, ni de la etapa).
const velo = sinComentarios(leer('_componentes/VeloDeCarga.tsx'))
const seguroSinCondiciones = (c: string): boolean => /useEffect\(\(\) => \{\s*const reloj = window\.setTimeout\(terminar, Math\.max\(0, SEGURO_DEL_VELO_MS - performance\.now\(\)\)\)\s*return \(\) => window\.clearTimeout\(reloj\)\s*\}, \[terminar\]\)/.test(c) && /const terminar = useCallback\(\(\): void => \{\s*abrirLaCarga\(\)\s*setEtapa\('fuera'\)\s*\}, \[\]\)/.test(c) && /if \(etapa === 'fuera'\) return null/.test(c)
afirmar(seguroSinCondiciones(velo) && SEGURO_DEL_VELO_MS === CARGA.plazoMs + CARGA.fundidoMs + CARGA.margenMs && SEGURO_DEL_VELO_MS <= 5200, 'con JavaScript, a los 5,2 s del arranque se va igual, sin ninguna condición (antes, el seguro dependía de lo que esperaba y se podía correr)', `${String(SEGURO_DEL_VELO_MS)} ms`)
controlPositivo('el detector VE un seguro que depende de lo que esperaba', velo.replace('}, [terminar])', '}, [terminar, todo])').replace('const reloj = window.setTimeout(terminar, Math.max(0, SEGURO_DEL_VELO_MS', 'if (!todo) return undefined\n    const reloj = window.setTimeout(terminar, Math.max(0, SEGURO_DEL_VELO_MS'), seguroSinCondiciones)

// La causa en el teléfono: el servidor de desarrollo rechazaba la conexión de recarga desde la IP de la red y la hidratación
// colgaba de ella (Next 16). Sólo afecta a `next dev`: el teléfono por la red local tiene que hidratar para probarse.
const config = readFileSync('next.config.ts', 'utf8')
afirmar(/allowedDevOrigins: \['192\.168\.1\.\*'\],/.test(config), '  en desarrollo, la red local (192.168.1.x) puede abrir /v3 entera: el teléfono hidrata (sin eso la página quedaba muerta)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1B · Las demos de Trabajos llegan el doble de lento (en scroll): el título, el párrafo y los libros, en el vacío')

// Dónde pasa cada cosa, en px del túnel (la regla de la referencia, desde el arranque del túnel), con un reloj dado.
const primerPx = (reloj: (mostrado: number) => number, umbral: number): number => {
  let px = 0
  while (px < 8000 && reloj(progresoDelPxDelTunel(px)) < umbral) px += 1
  return px
}
const tramoDeLaLlegada = (reloj: (mostrado: number) => number): { readonly titulo: number; readonly ultimoLibro: number } => ({ titulo: primerPx(reloj, LLEGADA.titulo.desde), ultimoLibro: primerPx(reloj, tramoDelLibro(CATALOGO_DE_DEMOS.length - 1, CATALOGO_DE_DEMOS.length).hasta) })
const antes = tramoDeLaLlegada(escalaDeDemos)
const ahora = tramoDeLaLlegada(llegadaDeDemos)
const dobleDeLento = (t: { readonly titulo: number; readonly ultimoLibro: number }): boolean => t.titulo === antes.titulo && Math.abs(t.ultimoLibro - t.titulo - 2 * (antes.ultimoLibro - antes.titulo)) <= 2
afirmar(dobleDeLento(ahora) && LLEGADA_DE_LOS_DEMOS.lenta === 2 && LLEGADA.titulo.desde === LLEGADA_DE_LOS_DEMOS.desde, 'la aparición dura el doble de scroll: el título sube donde siempre (el vacío al 60 %) y el último libro se asienta el doble de lejos', `antes ${String(antes.ultimoLibro - antes.titulo)} px de la regla (${String(antes.titulo)} → ${String(antes.ultimoLibro)}) · ahora ${String(ahora.ultimoLibro - ahora.titulo)} px (→ ${String(ahora.ultimoLibro)})`)
controlPositivo('el detector VE la llegada de antes (atada al vacío: 388 px)', escalaDeDemos, (r: (m: number) => number) => dobleDeLento(tramoDeLaLlegada(r)))
// El reloj es el vacío hasta el título (nada llega antes) y a la mitad después; el vacío no cambió: llena el cuadro donde siempre.
let mismoHastaElTitulo = true
for (let px = 0; px <= antes.titulo; px += 7) if (Math.abs(llegadaDeDemos(progresoDelPxDelTunel(px)) - escalaDeDemos(progresoDelPxDelTunel(px))) > 1e-9) mismoHastaElTitulo = false
const vacioLleno = primerPx(escalaDeDemos, 1)
afirmar(mismoHastaElTitulo && vacioLleno === antes.ultimoLibro && Math.abs(FIN_DE_LA_LLEGADA_EN_EL_VACIO - 1.4) < 1e-12, '  hasta el título el reloj es la fracción del vacío, y el vacío llena el cuadro en el mismo píxel que antes (la salida por el vacío no cambia): el último libro se asienta ya con el vacío lleno', `vacío lleno en ${String(vacioLleno)}`)
// El piso del regulador: el tramo del túnel y el salto, los de siempre; la llegada entera una muesca antes del despineado.
const piso = BANDA_DEL_EFECTO.piso
const ultimo = piso[piso.length - 1]
afirmar(piso.length === 4 && ultimo.scroll === PX_DE_LA_SECCION - MARGEN_DEL_DESPINEADO && ultimo.efecto === PX_DEL_FIN_DE_LA_LLEGADA && enElRiel(piso, PX_DE_LA_SECCION - MARGEN_DEL_DESPINEADO) >= PX_DEL_FIN_DE_LA_LLEGADA && piso[1].scroll === piso[2].scroll, '  el piso del regulador termina la llegada una muesca antes del despineado (el túnel y el salto sobre la espera, los de siempre: s5-trabajos lo simula a todas las velocidades)')

// La capa: lo que llega usa el reloj de la llegada; abajo de 1024 la capa rígida sigue escalando con el vacío.
const capa = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const cableada = (c: string): boolean => /progresoDelTitulo\.set\(enElTramo\(l, LLEGADA\.titulo\)\)/.test(c) && /const delParrafo = enElTramo\(l, LLEGADA\.parrafo\)/.test(c) && /poseDelLibro\(enElTramo\(l, tramoDelLibro\(i, libros\.current\.length\)\)\)/.test(c) && /setProperty\('--demos-escala', u\.toFixed\(5\)\)/.test(c) && /\(rigida\.current \? escala\.current : llegada\.current\) >= 1/.test(c)
afirmar(cableada(capa), '  la capa: el título, el párrafo y los libros siguen el reloj de la llegada; el carrusel arranca cuando todo llegó; abajo de 1024 la capa rígida sigue con el vacío')
controlPositivo('el detector VE los libros atados al vacío', capa.replace('poseDelLibro(enElTramo(l, ', 'poseDelLibro(enElTramo(u, '), cableada)

cerrar('s49-cierre-final')
