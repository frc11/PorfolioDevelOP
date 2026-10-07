/**
 * SPRINT NAVBAR V3 — el invariante del sprint: el menú propio del home, con sus controles positivos.
 *
 *   T1 · los ítems y los destinos: el orden, Quiénes somos un poco antes y el nudo de Panel. [Retoque 3] Portfolio y Por
 *        qué develOP viajan como todos y, al llegar, el título repite su llegada aislado (la llegada «a la vista» se borró).
 *   T2 · la barra de escritorio, propia de /v3: la misma pastilla visual (y la misma geometría), los ítems del home con
 *        el rollover de dos copias, y la pieza compartida intacta para la galería.
 *   T3 · el menú del teléfono de vidrio líquido: el Genie de las demos desde el botón, el material (con la lente sólo
 *        en Chromium), el tono de la zona con el texto en AA contra cualquier fondo, y el diálogo.
 *   T4 · el contacto en el teléfono, entero en una pantalla: los mismos campos, la hoja compacta sólo en el teléfono.
 *   Retoque 4 · el hover tranquilo de la barra: el resaltado que se desliza (la variante `b`, la que quedó al cierre).
 *   Retoques 1 y 2 · el menú nace con su vidrio (la silueta del Genie lo recorta, sin copia plana ni relevo) y la
 *        forma se funde en el círculo del botón: sus esquinas van del radio del panel al del botón.
 *
 * Lo que necesita navegador está en los bancos de `scripts-navbar/` y sus entregas en `~/.cache/b4-medicion/navbar/`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { BarraDelHome, modoDelChrome } from '../../_chrome/barra/BarraDelHome'
import { conLente } from '../../_chrome/menu/LenteDelVidrio'
import { aplicarLaSilueta, caminoDeLaSilueta, radioDeLaSilueta, siluetaDelGenie } from '../../_chrome/menu/silueta'
import { BORDE_DE_LA_LENTE, desplazamientoEn, mapaDeLaLente } from '../../_chrome/menu/lente'
import { CamposDelContacto } from '../../_chrome/contacto/CamposDelContacto'
import { ENLACES_DEL_HOME } from '../../_chrome/enlaces'
import { centradoDebajoDeLaBarra, destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { MS_DE_LA_LLEGADA_DEL_TITULO, repetirLaLlegadaDelTitulo } from '../../_componentes/llegadaDelTitulo'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { liderDelGenie, type Caja } from '../../_secciones/trabajos/demos/genie'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from './afirmar'
import { NodoFalso, VENTANA, conDomFalso } from './s27-dom-falso'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Los ítems: el orden pedido, una sola lista para la barra y el menú')

afirmarIgual(ENLACES_DEL_HOME.map((e) => e.rotulo), ['Quiénes somos', 'Portfolio', 'Servicios', 'Panel', 'Por qué develOP', 'Contacto'], 'los seis, en el orden pedido: «Trabajos» pasa a «Portfolio» y «Panel» es nuevo')
const secciones = ENLACES_DEL_HOME.filter((e) => e.destino !== '#contacto')
afirmar(secciones.every((e) => (IDS_DE_SECCION as readonly string[]).includes(e.destino.slice(1)) && e.destino === `#${e.id}`), '  cada uno lleva a una sección de la tabla («Portfolio» sigue siendo `#trabajos`, «Panel» es `#tu-panel`)')
afirmarIgual(ENLACES_DEL_HOME[ENLACES_DEL_HOME.length - 1], { id: 'cierre', rotulo: 'Contacto', destino: '#contacto' }, '  y «Contacto» sigue siendo el de hoy: abre el formulario')
const USAN_LA_LISTA = ['_chrome/menu/PanelDelMenu.tsx']
// [RETOQUE 3D] N1: las secciones de la lista del home (`ENLACES_DE_SECCION`) y Contacto aparte.
afirmar(USAN_LA_LISTA.every((r) => leer(r).includes('ENLACES_DE_SECCION.map(')) && !/ENLACES_DE_MUESTRA/.test(USAN_LA_LISTA.map(leer).join('\n')), '  el menú del teléfono usa la lista del home, no la de muestra de la pastilla compartida')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Los destinos nuevos: un tramo centrado debajo de la barra')

afirmarIgual(centradoDebajoDeLaBarra(900, 1124, 1650, 900, 72), 901, 'un tramo de 526 px en los 828 libres queda con 151 arriba y 151 abajo')
afirmarIgual(centradoDebajoDeLaBarra(900, 1000, 1200, 900, 72), 900, '  sin asomar la sección de arriba: nunca antes de su tope')
afirmarIgual(centradoDebajoDeLaBarra(900, 1124, 2400, 900, 72), 1052, '  y si no entra, su tope apenas debajo de la barra')
controlPositivo('el chequeo de «sin asomar» vería el centro crudo, antes del tope', 1000 - 72 - (900 - 72 - 200) / 2, (y: number) => y >= 900)

conDomFalso(900, 72, () => {
  VENTANA.scrollY = 0
  const cabecera = new NodoFalso({ tope: 19086 + 80, alto: 540 })
  const tuPanel = new NodoFalso({ tope: 19086, alto: 4119 }, { 'data-panel': 'tu-panel' }).responde('[data-pieza="encabezado-del-panel"]', cabecera)
  afirmarIgual(destinoDelViaje(tuPanel as unknown as HTMLElement), 19086, 'Panel: la cabecera de Tu panel entera a la vista (con lugar de sobra, el tope de la sección: la de arriba no asoma)')
  const alta = new NodoFalso({ tope: 19086 + 80, alto: 1200 })
  const tuPanelAlta = new NodoFalso({ tope: 19086, alto: 4119 }, { 'data-panel': 'tu-panel' }).responde('[data-pieza="encabezado-del-panel"]', alta)
  afirmarIgual(destinoDelViaje(tuPanelAlta as unknown as HTMLElement), 19086 + 80 - 72, '  y si la cabecera no entra, su tope debajo de la barra')
})
afirmar(/'tu-panel': \(panel, v\) => \{/.test(leer('_componentes/destinosDelViaje.ts')), '  Tu panel tiene nudo (antes caía en el ancla: con la barra encima, 72 px de Servicios a la vista)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Retoque 3 · Portfolio y Por qué develOP: el viaje de todos, y después la llegada del título, aislada')

const EFECTO = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
afirmar(!/antesDeLaLlegada|recorrerLaLlegada|DURACION_DE_LA_LLEGADA_MS/.test(EFECTO + sinComentarios(leer('_componentes/destinosDelViaje.ts')) + sinComentarios(leer('_componentes/deslizamiento.ts'))) && EFECTO.includes('empezarElViaje(planDelViaje(seccion.id, destinoEnPx))'), 'el viaje va derecho al nudo, con la duración de todos (la llegada «a la vista» de T1 se borró: el sitio no espera al texto)')
const terminarElVuelo = EFECTO.slice(EFECTO.indexOf('const terminar = (llego: boolean): void => {'), EFECTO.indexOf('const alClick'))
afirmar(terminarElVuelo.includes('if (llego && destino !== null) repetirLaLlegadaDelTitulo(destino.id, duracionDelFundido(zona))') && terminarElVuelo.indexOf('repetirLaLlegadaDelTitulo(') < terminarElVuelo.indexOf('zona.removeAttribute(ATRIBUTO_DEL_VELO)'), '  al llegar pide la llegada del título ANTES de quitar el velo (vuelve a cero sin verse) y para después del fundido')
afirmar(leer('_secciones/trabajos/piezas.tsx').includes('<CanalDeUnaPieza progreso={progresoDeLaMascara} patron="P2" como="span" className="block" llegadaDe={seccion.id}>') && (leer('_secciones/por-que-develop/PorQueDevelop.tsx').match(/<CanalDeUnaPieza progreso=\{frase\} patron="P5" como="span" className="block" llegadaDe="por-que-develop">/g) ?? []).length === 2 && leer('_secciones/_contrato/canales.tsx').includes('progreso={useLlegadaDelTitulo(id, progreso)}'), '  la escuchan «Portfolio» (su máscara) y las dos mitades de la frase de Por qué develOP, en su canal: sólo el texto, sin cámara ni página')
afirmar(!repetirLaLlegadaDelTitulo('servicios', 0) && MS_DE_LA_LLEGADA_DEL_TITULO >= 600 && MS_DE_LA_LLEGADA_DEL_TITULO <= 1200, `  las demás secciones no la tienen, y dura ${String(MS_DE_LA_LLEGADA_DEL_TITULO)} ms, encima del viaje y después`)
const LLEGADA = sinComentarios(leer('_componentes/llegadaDelTitulo.ts'))
// [RONDA 2] F2: al terminar, además de volver al scroll, baja el contador de llegadas que corren (`REPETICIONES`).
afirmar(LLEGADA.includes('(r < 0 ? p : Math.min(p, r))') && /void control\.then\(\(\) => \{\s*repeticion\.set\(-1\)/.test(LLEGADA), '  el progreso del título: el del scroll, salvo mientras corre la llegada (y nunca más adelante que el scroll); al terminar vuelve al del scroll, que en el nudo ya vale 1')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · La barra de escritorio, propia de /v3')

const BARRA_HTML = renderToStaticMarkup(<BarraDelHome />)
const enlaces = [...BARRA_HTML.matchAll(/<a [^>]*data-pieza="barra-enlace"[^>]*>([\s\S]*?)<\/a>/g)]
afirmarIgual(enlaces.map((m) => /href="([^"]+)"/.exec(m[0])?.[1]), ENLACES_DEL_HOME.map((e) => e.destino), 'seis enlaces, los del home, en su orden')
const visible = (html: string): string => html.replace(/<span data-copia="b" aria-hidden="true">[^<]*<\/span>/g, '').replace(/<[^>]+>/g, '')
afirmar(enlaces.every((m, i) => !m[1].includes('data-rollover') && visible(m[1]) === ENLACES_DEL_HOME[i].rotulo), '  [NAVBAR] Retoque 4: sin el rollover tipo botón (quedó en el CTA, el mail, WhatsApp y los proyectos), y el nombre accesible es el rótulo')
controlPositivo('el chequeo del nombre vería una copia B que se anuncia', '<span data-rollover=""><span data-copia="a">Panel</span><span data-copia="b">Panel</span></span>', (h: string) => visible(h) === 'Panel')
afirmar(/<header data-pieza="barra"[^>]*><nav data-parte="pastilla" aria-label="Navegación principal"><ul data-parte="lista">/.test(BARRA_HTML) && BARRA_HTML.includes('data-parte="resaltado" aria-hidden="true"'), '  el banner con su navegación (el landmark de siempre) y el indicador del activo, mudo')

const BARRA_CSS = sinComentarios(leer('_estilos/barra.css'))
const NAV_CSS = sinComentarios(leer('_estilos/navegacion.css'))
const escapar = (s: string): string => s.replace(/[[\]().*+?^$|\\]/g, '\\$&')
const declaracion = (hoja: string, selector: string, prop: string): string => new RegExp(`${escapar(selector)} \\{[^}]*?\\n\\s*${prop}: ([^;]+);`).exec(hoja)?.[1] ?? '?'
const VISUAL = ['border', 'border-radius', 'background-color', 'backdrop-filter', 'box-shadow', 'padding-inline', 'block-size', 'top']
const iguales = (a: string, b: string): boolean => a !== '?' && a.replaceAll('--barra-', '--nav-') === b
afirmar(VISUAL.every((p) => iguales(declaracion(BARRA_CSS, '[data-v3] [data-pieza="barra"] > [data-parte="pastilla"]', p), declaracion(NAV_CSS, '[data-v3] [data-pieza="navegacion"] > [data-parte="pastilla"]', p))), 'la MISMA pastilla visual que la de siempre: borde, radio, superficie, desenfoque, sombra, relleno, alto y nacimiento')
controlPositivo('  el chequeo vería una pastilla con otro radio', declaracion(BARRA_CSS, '[data-v3] [data-pieza="barra"] > [data-parte="pastilla"]', 'border-radius').replace('fuerte', 'medio'), (r: string) => iguales(r, declaracion(NAV_CSS, '[data-v3] [data-pieza="navegacion"] > [data-parte="pastilla"]', 'border-radius')))
const GEOMETRIA = ['reposo', 'alto', 'margen-al-pie', 'nacimiento', 'umbral']
afirmar(GEOMETRIA.every((n) => iguales(declaracion(BARRA_CSS, '[data-v3] [data-pieza="barra"]', `--barra-${n}`), declaracion(NAV_CSS, '[data-v3] [data-pieza="navegacion"]', `--nav-${n}`))), '  y la misma geometría con nombres propios: las constantes de `_lib/navegacion.ts` (Trabajos, Servicios, las anclas) la siguen describiendo')
afirmar(!/\[data-modo="barra"\][^{]*\{[^}]*visibility: visible/.test(BARRA_CSS) && modoDelChrome(562, 900, true) === 'menu', 'abajo de `medio` la pastilla apagada es el menú: ninguna regla la vuelve visible (la de siempre la mostraba de 628 a 860 sin menú)')
const CHROME = leer('_chrome/ChromeDelHome.tsx')
afirmar(CHROME.includes('<BarraDelHome className={CLASE_DE_LA_PASTILLA_APAGADA} />') && !/Navegacion(DelHome)?['\s]/.test(sinComentarios(CHROME).replace(/'[^']*barra[^']*'/g, '')) && leer('layout.tsx').includes("import './_estilos/barra.css'"), 'el home monta la barra propia (y su hoja entra por el layout, como todas)')
const intacto = (ruta: string): boolean => {
  try {
    execFileSync('git', ['diff', '--quiet', 'b3e2dc31', '--', ruta])
    return true
  } catch {
    return false
  }
}
afirmar(['src/app/v3/_componentes/chrome/Navegacion.tsx', 'src/app/v3/_estilos/navegacion.css', 'src/app/v3/_lib/navegacion.ts'].every(intacto), 'la pieza compartida (la pastilla, su hoja y su lista de muestra) quedó como estaba antes del sprint: la sigue usando la galería')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · El menú del teléfono: el Genie, el vidrio, el tono y el diálogo')

// El menú son tres archivos: el botón (`MenuMovil`), el panel con sus fases y el Genie (`MenuDeVidrio`), y el adentro
// y la geometría (`PanelDelMenu`).
const MENU = sinComentarios(['_chrome/menu/MenuMovil.tsx', '_chrome/menu/MenuDeVidrio.tsx', '_chrome/menu/PanelDelMenu.tsx'].map(leer).join('\n'))
const GENIE = sinComentarios(leer('_chrome/menu/GenieDelMenu.tsx'))
afirmar(MENU.includes("import { MS_DEL_GENIE, correrPorTiempo, liderDelGenie } from '../../_secciones/trabajos/demos/genie'") && GENIE.includes('esquinasDeLaTira(i, TIRAS_DEL_MENU, m, ventana, destino, lider, SOLAPE)') && leer('_secciones/trabajos/demos/VentanaDeDemo.tsx').includes('correrPorTiempo as correr'), 'el Genie es el de las demos: la misma geometría, la misma duración y el mismo reloj (que ahora comparten)')
afirmar(MENU.includes('destino: cajaDe(boton)') && MENU.includes('(t) => cuadro(1 - t / MS_DEL_GENIE)') && /cuadro\(desde \+ \(1 - desde\)/.test(MENU), '  sale del botón al abrir y vuelve a él al cerrar (desde donde iba, si se cierra abriendo)')
afirmar(MENU.includes('cancelar.current = fundir(1, listo)') && MENU.includes('MS_DEL_FUNDIDO') && /geometria !== null && !reducido &&/.test(MENU), '  con movimiento reducido no hay Genie: el fundido corto de las demos')
afirmar(GENIE.includes('const enLaRendija = piezas.filter(') && !/children/.test(GENIE) && MENU.includes("className=\"invisible\"") && MENU.includes("capaDelGenie.current?.style.setProperty('visibility', estado === 'genie' ? 'visible' : 'hidden')"), '  y abrir no monta nada: cada tira lleva sólo las piezas medidas de su rendija y la capa se muestra con `visibility` (medido con la CPU ×4 en navbar/t3-menu)')
afirmar(MENU.includes('className="invisible fixed inset-[var(--spacing-4)] flex flex-col"') && MENU.includes('data-pieza="vidrio"'), 'casi toda la pantalla, centrado, con margen en los cuatro lados')

const VIDRIO = sinComentarios(leer('_estilos/vidrio.css'))
const conWebkit = /-webkit-backdrop-filter: blur\(var\(--vidrio-desenfoque\)\) saturate\(var\(--vidrio-saturacion\)\);/.test(VIDRIO)
afirmar(conWebkit && /\[data-pieza="vidrio"\]\[data-lente\] \{\s*backdrop-filter: blur\(var\(--vidrio-desenfoque\)\) url\(#lente-del-menu\) saturate/.test(VIDRIO) && (VIDRIO.match(/url\(#lente-del-menu\)/g) ?? []).length === 1, 'el material: desenfoque y saturación (con el prefijo de Safari) y la lente SÓLO bajo `data-lente`, después del desenfoque')
afirmar(VIDRIO.includes('::before') && VIDRIO.includes('inset 0 var(--border-hairline) 0 0') && VIDRIO.includes('inset 0 0 0 var(--border-hairline)') && VIDRIO.includes('@supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none))'), '  el especular arriba, el filo de luz, y un tinte casi opaco donde no hay `backdrop-filter`')
afirmar(!conLente(), '  fuera de Chromium no hay lente (Safari no pinta un filtro SVG en el `backdrop-filter` y, con él, se queda sin desenfoque)')
const [cx, cy] = desplazamientoEn(179, 406, 358, 812, 30, BORDE_DE_LA_LENTE)
const [ix] = desplazamientoEn(1, 406, 358, 812, 30, BORDE_DE_LA_LENTE)
const [dx] = desplazamientoEn(357, 406, 358, 812, 30, BORDE_DE_LA_LENTE)
const [, ay] = desplazamientoEn(179, 1, 358, 812, 30, BORDE_DE_LA_LENTE)
afirmar(cx === 0 && cy === 0 && ix > 0.8 && dx < -0.8 && ay > 0.8, 'la lente: quieta en el centro (como una losa) y en el canto el fondo se toma de adentro, de los cuatro lados')
const mapa = mapaDeLaLente(358, 812, 30)
afirmar(mapa.pixeles[((Math.floor(mapa.alto / 2) * mapa.ancho + Math.floor(mapa.ancho / 2)) * 4)] === 128, '  el mapa codifica 128 («quieto») en el centro', `${String(mapa.ancho)} × ${String(mapa.alto)}`)

/** El peor contraste del texto: la tinta de cada tono contra su tinte sobre el fondo más adverso, detrás del velo del menú. */
const TEMA = { papel: '#F7F7F5', tinta: '#111111', invertidoFondo: '#0E0E0E' }
const canal = (hex: string, i: number): number => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
const mezcla = (a: string, b: string, t: number): string => `#${[0, 1, 2].map((i) => Math.round(canal(a, i) * t + canal(b, i) * (1 - t)).toString(16).padStart(2, '0')).join('')}`
const VELO = 0.2
const tinte = Number.parseFloat(/--vidrio-tinte: ([\d.]+)%;/.exec(VIDRIO)?.[1] ?? '0') / 100
const peorContraste = (t: number): number => {
  // Detrás del velo (la tinta al 20 %) lo más claro es el papel velado y lo más oscuro, el negro.
  const masClaro = mezcla(TEMA.tinta, '#ffffff', VELO)
  const claro = razonDeContraste(TEMA.tinta, mezcla(TEMA.papel, '#000000', t))
  const oscuro = razonDeContraste(TEMA.papel, mezcla(TEMA.invertidoFondo, masClaro, t))
  return Math.min(claro, oscuro)
}
afirmar(peorContraste(tinte) >= 4.5, `el texto en AA contra CUALQUIER fondo: con el tinte del ${String(Math.round(tinte * 100))} % el peor caso (vidrio claro sobre negro, oscuro sobre blanco velado) da ${peorContraste(tinte).toFixed(2)}:1 (medido en píxeles: 6,5 y 6,7)`)
controlPositivo('  el chequeo vería un tinte demasiado transparente', 0.4, (t: number) => peorContraste(t) >= 4.5)
afirmar(MENU.includes('menu.current?.abrir(!zonaOscura())') && MENU.includes('tonoBajo(debajo, nocheQueSeVe())') && MENU.includes("el?.setAttribute('data-seccion', 'invertida')"), 'el tono de la zona, leído al abrir: sobre zona oscura vidrio claro, sobre zona clara vidrio oscuro (los tokens de la sala invertida)')

// [NOCTURNO FINAL] C5 · el que cierra es la franja de arriba (su nombre, lo que dice: «Click para cerrar» y «el menú»).
afirmar(MENU.includes('{abierto && <TrampaDelMenu caja={caja} alCerrar={cerrar} alSoltar={alSoltar} />}') && /data-parte="cerrar-el-menu" onClick=\{alCerrar\}/.test(MENU) && MENU.includes('{ROTULO_DEL_MENU.franja}'), 'el diálogo: la trampa de foco sólo abierto, y el que cierra está adentro')
afirmar(MENU.includes('min-h-[var(--spacing-12)]') && MENU.includes('text-titulo-m'), '  ítems grandes y tocables: un renglón de 48 px como mínimo, en `titulo-m`')
afirmar(MENU.includes("caja.current?.querySelector<HTMLElement>('[data-parte=\"item-del-menu\"]')?.focus({ preventScroll: true })") && MENU.includes('boton.current?.focus({ preventScroll: true })'), '  al abrir, el foco al primer ítem; al cerrar, de vuelta al botón del menú')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Retoques 1 y 2 · El menú nace con su vidrio y se funde en el círculo del botón')

// Un teléfono de 390 × 844: el panel con `--spacing-4` de margen y el botón de 48 arriba al centro.
const PANEL: Caja = { x: 16, y: 16, ancho: 358, alto: 812 }
const BOTON: Caja = { x: 171, y: 16, ancho: 48, alto: 48 }
const LIDER = liderDelGenie(PANEL, BOTON)
const RADIO_DEL_PANEL = 30

/** Los puntos de un camino de la silueta: los extremos de cada tramo y el medio de cada curva (sobre la curva). */
function puntosDelCamino(d: string): { x: number; y: number }[] {
  const n = d.split(' ')
  const puntos: { x: number; y: number }[] = []
  let ultimo = { x: 0, y: 0 }
  for (let i = 0; i < n.length; ) {
    const orden = n[i]
    const par = (k: number): { x: number; y: number } => ({ x: Number(n[i + 1 + k * 2]), y: Number(n[i + 2 + k * 2]) })
    if (orden === 'M' || orden === 'L') {
      ultimo = par(0)
      puntos.push(ultimo)
      i += 3
    } else if (orden === 'C') {
      const [c1, c2, fin] = [par(0), par(1), par(2)]
      const medio = (a: number, b: number, c: number, e: number): number => (a + 3 * b + 3 * c + e) / 8
      puntos.push({ x: medio(ultimo.x, c1.x, c2.x, fin.x), y: medio(ultimo.y, c1.y, c2.y, fin.y) }, fin)
      ultimo = fin
      i += 7
    } else i += 1
  }
  return puntos
}
const CENTRO_DEL_BOTON = { x: BOTON.x + BOTON.ancho / 2, y: BOTON.y + BOTON.alto / 2 }
const lejosDelCirculo = (d: string): number => Math.max(...puntosDelCamino(d).map((p) => Math.abs(Math.hypot(p.x - CENTRO_DEL_BOTON.x, p.y - CENTRO_DEL_BOTON.y) - BOTON.ancho / 2)))
const adentro = siluetaDelGenie(1, PANEL, BOTON, LIDER)
const caminoAdentro = caminoDeLaSilueta(adentro, radioDeLaSilueta(1, RADIO_DEL_PANEL, BOTON.ancho / 2))
afirmar(lejosDelCirculo(caminoAdentro) < 0.5, `adentro del botón la forma ES su círculo: ningún punto se aparta más de medio píxel (${lejosDelCirculo(caminoAdentro).toFixed(2)} px)`)
controlPositivo('  el chequeo vería las puntas de un cuadrado', caminoDeLaSilueta(adentro, 0), (d: string) => lejosDelCirculo(d) < 0.5)
afirmar(radioDeLaSilueta(0, 30, 24) === 30 && radioDeLaSilueta(1, 30, 24) === 24 && radioDeLaSilueta(0.5, 30, 24) === 27, '  las esquinas van del radio del panel (abierto) al del botón (adentro)')
const abiertoXs = puntosDelCamino(caminoDeLaSilueta(siluetaDelGenie(0, PANEL, BOTON, LIDER), RADIO_DEL_PANEL, PANEL))
afirmar(Math.min(...abiertoXs.map((p) => Math.min(p.x, p.y))) >= -0.05 && Math.min(...abiertoXs.map((p) => p.x)) < 0.05 && Math.max(...abiertoXs.map((p) => p.x)) <= PANEL.ancho + 0.05 && Math.max(...abiertoXs.map((p) => p.y)) <= PANEL.alto + 0.05, '  abierto, la forma es la caja del panel (en sus coordenadas)')
const cadaCuadro = Array.from({ length: 21 }, (_, k) => caminoDeLaSilueta(siluetaDelGenie(k / 20, PANEL, BOTON, LIDER), radioDeLaSilueta(k / 20, RADIO_DEL_PANEL, 24)))
afirmar(cadaCuadro.every((d) => (d.match(/ C /g) ?? []).length === 4 && !d.includes('NaN')), '  en cada cuadro del Genie, cuatro esquinas redondeadas: nunca una punta')

// El cuadro de verdad: lo que `aplicarLaSilueta` le hace al vidrio, al texto y al filo.
const anotado = new Map<string, string>()
const falso = (nombre: string): { style: { setProperty: (k: string, v: string) => void; removeProperty: (k: string) => void }; setAttribute: (k: string, v: string) => void } => ({
  style: { setProperty: (k, v) => anotado.set(`${nombre}.${k}`, v), removeProperty: (k) => anotado.delete(`${nombre}.${k}`) },
  setAttribute: (k, v) => anotado.set(`${nombre}.${k}`, v),
})
aplicarLaSilueta(1, PANEL, BOTON, LIDER, RADIO_DEL_PANEL, { vidrio: falso('vidrio') as unknown as HTMLElement, texto: falso('texto') as unknown as HTMLElement, filo: falso('filo') as unknown as SVGPathElement })
const recorte = (clave: string): string => /^path\('(.*)'\)$/.exec(anotado.get(clave) ?? '')?.[1] ?? ''
afirmar(recorte('vidrio.clip-path') !== '' && anotado.get('filo.d') === recorte('vidrio.clip-path') && lejosDelCirculo(recorte('texto.clip-path')) < 0.5, 'el vidrio de verdad, recortado por la silueta; el texto, por la MISMA forma (en la pantalla); el filo la dibuja')

const VIDRIO_GENIE = sinComentarios(leer('_estilos/vidrio.css'))
afirmar(!VIDRIO_GENIE.includes('vidrio-plano') && !MENU.includes('MS_DEL_RELEVO') && !GENIE.includes('fondo'), 'sin copia plana ni relevo: el material es el mismo de punta a punta')
afirmar(/\[data-pieza="vidrio"\]\[data-genie\] \{\s*box-shadow: none;\s*\}/.test(VIDRIO_GENIE) && /\[data-genie\] > :not\(\[data-parte="filo-del-genie"\]\) \{\s*visibility: hidden;\s*\}/.test(VIDRIO_GENIE), '  durante el Genie el vidrio no cambia ni su tinte ni su opacidad: sólo esconde su contenido (que viaja en las tiras)')
afirmar(/const cuadro = useCallback\(\s*\(m: number\): void => \{\s*metido\.current = m\s*forma\(m\)\s*velo\.current\?\.style\.setProperty\('opacity'/.test(MENU), '  cada cuadro mueve la forma; la opacidad que cambia es la del velo de atrás, no la del vidrio')
afirmar(/menu\.current\?\.abrir\(!zonaOscura\(\)\)\s*salaDetrasDelMenu\(true\)\s*startTransition\(\(\) => setAbierto\(true\)\)/.test(MENU) && GENIE.includes('export const GenieDelMenu = memo(GenieDelMenuSinMemo)'), 'el clic arranca el Genie a mano en su cuadro; lo de React va en una transición y las tiras no se vuelven a dibujar')
afirmar(MENU.includes("el?.style.setProperty('opacity', '0.01')") && MENU.includes('forma(0.5)') && MENU.includes('const precalentado = useRef(false)'), '  y antes del primer clic, el vidrio y las tiras se pintaron una vez (precalentar): el primer cuadro no compila')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · El contacto en el teléfono, entero en una pantalla')

const vacio = { intereses: [], presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }
const sinNada = (): void => undefined
const campos = (compacto: boolean): string => renderToStaticMarkup(<CamposDelContacto datos={vacio} errores={{}} alternarInteres={sinNada} escribir={sinNada} compacto={compacto} />)
const controles = (h: string): string[] => [...h.matchAll(/<(input|textarea)[^>]*name="([^"]+)"/g)].map((m) => `${m[1]}:${m[2]}`)
afirmarIgual(controles(campos(true)), controles(campos(false)), 'los MISMOS campos en la hoja del teléfono: no se sacó ninguno (los siete intereses, el presupuesto, el nombre, el medio, la empresa y el mensaje)')
afirmar(controles(campos(true)).length === 12 && /<textarea[^>]*rows="2"/.test(campos(true)) && /<textarea[^>]*rows="3"/.test(campos(false)), '  el mensaje en dos renglones en el teléfono (tres en escritorio)')
const HOJA = sinComentarios(leer('_chrome/contacto/FormularioDeContacto.tsx'))
afirmar(HOJA.includes('const compacto = !desdeArriba') && HOJA.includes("compacto ? 'gap-[var(--spacing-4)] px-[var(--spacing-5)] py-[var(--spacing-5)]' : 'gap-[var(--spacing-8)] px-[var(--pad-lateral-compacto)] py-[var(--spacing-12)]'") && HOJA.includes('compacto={compacto}'), 'compacta sólo la hoja del teléfono (la que sube de abajo, en el modo del menú): la de escritorio queda como estaba')
// [RONDA 2] F1: el botón dice «Enviando…» mientras viaja.
afirmar(HOJA.includes("compacto ? 'flex-row items-center justify-between gap-[var(--spacing-3)] pt-[var(--spacing-3)]'") && HOJA.includes('<Cta type="submit" rotulo={enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO}'), '  el pie al lado del botón de enviar: el botón a la vista sin deslizar (medido: 390 × 844, 375 × 667 y 390 × 664 entran; navbar/t4-contacto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Retoque 4 · El hover de la barra: tranquilo, el resaltado que se desliza')

afirmar(!existsSync(`${V3}/_chrome/barra/hover.ts`) && !/navhover|subrayado-activo/.test(leer('_chrome/barra/BarraDelHome.tsx') + leer('_estilos/barra.css')), 'una sola variante, la `b`: sin la `a` (la línea desde el centro), sin la bandera de la URL y sin el subrayado aparte')
const ROLLOVER_FUERA = ['_secciones/cierre/PiezasDeContacto.tsx', '_secciones/trabajos/Proyecto.tsx', '_secciones/trabajos/CapaDelTunel.tsx']
afirmar(!/DosCopias/.test(leer('_chrome/barra/BarraDelHome.tsx')) && ROLLOVER_FUERA.every((r) => leer(r).includes('<DosCopias')), 'el rollover tipo botón salió de la barra y se queda afuera: el mail y WhatsApp, los proyectos, el CTA del túnel')
afirmar((BARRA_HTML.match(/data-parte="resaltado"/g) ?? []).length === 1 && !/\[data-parte="resaltado"\] \{[^}]*display: none/.test(BARRA_CSS), 'UN resaltado que viaja (no uno por ítem), siempre montado: es el indicador del activo en reposo')
const BARRA_TSX = sinComentarios(leer('_chrome/barra/BarraDelHome.tsx'))
afirmar(BARRA_TSX.includes("barra.addEventListener('pointerover', alEntrar)") && BARRA_TSX.includes("barra.addEventListener('focusin', alEntrar)") && BARRA_TSX.includes('ubicarBajo(resaltado.current, senalado.current ?? delActivo)'), '  sigue al mouse y al foco del teclado, y vuelve al activo al salir')

cerrar('s39-navbar')
