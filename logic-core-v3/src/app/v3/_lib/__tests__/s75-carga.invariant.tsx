/**
 * CIERRE A-ter — A13 · LA CARGA A PRUEBA DE TODO (`docs/rediseno/SPRINT-CIERRE-A-TER.md`). Cada cosa con su control positivo (el detector
 * ve el estado de antes o uno roto a propósito).
 *   · El detector de fallas de la carga (`_lib/diagnostico/fallas.ts`): el que usa el arnés de estrés (`scripts-carga/estres.ts`) sobre
 *     `window.__v3diag` (`?diag=carga`), 1,5 s después de llegar a una sección.
 *   · El arnés en el sitio (el recibo de `scripts-carga/resumen.ts`: `docs/rediseno/entregas/cierre-a-ter/carga.json`): el «antes» (el
 *     diagnóstico sin los arreglos) falla y el «después» no (a los 5,5 s de llegar y después de scrollear, cero; a los 1,5 s, sólo el fundido
 *     del DOM con la escena compilando su primer cuadro bajo la CPU ×4 o la red lenta); el control positivo (sin la reimpresión, con las
 *     fuentes demoradas) falla.
 *   · Las causas, arregladas (lo que se puede afirmar sin navegador): H1 las fuentes (cada texto espera la suya y se rehace si cambia la
 *     métrica), H2 el segundo clic en vuelo, H3 la medición sin lo pegado y la época cuando cambia el layout, H4 la época con la pestaña
 *     oculta, la noche y el remate después de un salto, H5 el contexto perdido, y el perro guardián.
 */
import { readFileSync } from 'node:fs'

import { UMBRALES_DE_LA_CARGA, fallasDe, type EstadoDelDiag, type TextoDelDiag, type TipoDeFalla } from '../diagnostico/fallas'
import { contextoPerdido, vigilarElContexto } from '../escena/contextoDelLienzo'
import { ESQUIVA } from '../escena/titulos3d/esquivaDelLogo'
import { GUARDIAN, estaTrabado, letrasCorridas, type EstadoDelTitulo } from '../escena/titulos3d/sincronia'
import { topeEnReposo } from '../motion/enReposo'
import { EPOCA_INICIAL, reducirEpoca, type EstadoDeEpoca } from '../motion/epoca'
import { gestoDelCruce, puestoTras } from '../../_secciones/_contrato/cruce'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

// ═══════════════════════════════════════════════════════════════════════════
titulo('A13 · El detector de fallas de la carga (el del arnés, sobre `window.__v3diag`)')

const IMPRESO = { version: 1, t: 900, fuenteCargada: true, conectado: true } as const
const TEXTO_SANO: TextoDelDiag = { id: 'titulo:x', sistema: 'titulo', listo: true, enPantalla: true, domOpacidad: 0, impreso: IMPRESO, fuenteCargadaAhora: true, letrasCorridasEm: 0, dibujada: true, debeDibujarse: true }
const SANO: EstadoDelDiag = {
  t: 5000,
  visible: true,
  scrollY: 3000,
  viaje: null,
  epoca: { epoca: 1, alto: 900 },
  textos: [TEXTO_SANO, { ...TEXTO_SANO, id: 'pie:y', sistema: 'pie', letrasCorridasEm: null, dibujada: null, debeDibujarse: false }],
  bloques: [{ id: 'trabajos|seccion|x|0', enPantalla: true, medido: true, progreso: 0.5, esperado: 0.51 }, { id: 'servicios|propia|y|0', enPantalla: false, medido: false, progreso: 0, esperado: 0.7 }],
  noche: { actual: 1, esperada: 1 },
  remate: { enPantalla: true, estado: 'vivo' },
  tunel: { enPantalla: true, corriendo: true, mostrado: 0.4, pedido: 0.42 },
}
const conTexto = (x: Partial<TextoDelDiag>): EstadoDelDiag => ({ ...SANO, textos: [{ ...TEXTO_SANO, ...x }] })
/** Un estado roto por falla, con sólo esa falla. */
const ROTOS: readonly (readonly [TipoDeFalla, EstadoDelDiag])[] = [
  ['sin-imprimir', conTexto({ listo: false, domOpacidad: 1 })],
  ['fuente-de-respaldo', conTexto({ impreso: { ...IMPRESO, fuenteCargada: false } })],
  ['letras-corridas', conTexto({ letrasCorridasEm: 3 * UMBRALES_DE_LA_CARGA.letrasEm })],
  ['dom-visible', conTexto({ domOpacidad: 1, dibujada: false })],
  ['ninguno-visible', conTexto({ dibujada: false })],
  ['animacion-desfasada', { ...SANO, bloques: [{ id: 'b', enPantalla: true, medido: true, progreso: 0.2, esperado: 0.6 }] }],
  ['epoca-sin-medir', { ...SANO, epoca: { epoca: 0, alto: 0 } }],
  ['noche-desfasada', { ...SANO, noche: { actual: 0, esperada: 1 } }],
  ['remate-dormido', { ...SANO, remate: { enPantalla: true, estado: 'espera' } }],
  ['tunel-desfasado', { ...SANO, tunel: { enPantalla: true, corriendo: false, mostrado: 0, pedido: 0.6 } }],
]
const tiposDe = (e: EstadoDelDiag): string => [...new Set(fallasDe(e).map((f) => f.tipo))].join(',')
const sana = (e: EstadoDelDiag): boolean => fallasDe(e).length === 0
afirmar(sana(SANO), '  una carga sana (los textos impresos con su fuente, el DOM apagado, los bloques y la noche donde dice el scroll): ninguna falla')
afirmar(ROTOS.every(([t, e]) => tiposDe(e) === t), `  cada falla se ve por su nombre y sola: ${ROTOS.map(([t]) => t).join(', ')}`)
for (const [t, e] of ROTOS) controlPositivo(`  el detector VE ${t}`, e, sana)
// Lo que no es falla: con la pestaña oculta nada se mide; en un viaje, los bloques, la noche y lo que no se dibuja no cuentan; fuera de pantalla, tampoco.
const NO_SON: readonly EstadoDelDiag[] = [
  { ...ROTOS[0][1], visible: false },
  { ...ROTOS[5][1], viaje: 'trabajos' },
  { ...ROTOS[7][1], viaje: 'servicios' },
  { ...conTexto({ dibujada: false }), viaje: 'trabajos' },
  conTexto({ listo: false, domOpacidad: 1, enPantalla: false }),
  { ...SANO, noche: { actual: 0, esperada: null } },
]
afirmar(NO_SON.every(sana), '  y no confunde: con la pestaña oculta, en un viaje o fuera de pantalla no cuenta; donde la noche no rige, tampoco')
controlPositivo('  el detector VE un texto sin imprimir en pantalla aunque haya pasado un viaje antes', conTexto({ listo: false, domOpacidad: 1 }), sana)
// El cambio del DOM al impreso (el fundido del DOM, ~0,4 s) no es «los dos a la vista»: cuenta recién listo hace más de `cambioMs`.
const recienListo = conTexto({ domOpacidad: 0.5, listoHaceMs: 300 })
afirmar(sana(recienListo) && tiposDe(conTexto({ domOpacidad: 0.5, listoHaceMs: 3 * UMBRALES_DE_LA_CARGA.cambioMs })) === 'dom-visible', `  el fundido del DOM no cuenta: recién listo (300 ms) no es falla; listo hace ${String(3 * UMBRALES_DE_LA_CARGA.cambioMs)} ms con el DOM a la vista, sí`)
controlPositivo('  el detector VE un detector que cuenta el fundido como «los dos»', recienListo, (e: EstadoDelDiag) => fallasDe(e, { ...UMBRALES_DE_LA_CARGA, cambioMs: 0 }).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A13 · Las causas, arregladas (lo que se afirma sin navegador; en el sitio, el arnés)')

const leer = (ruta: string): string => readFileSync(new URL(ruta, import.meta.url), 'utf8')
interface Fuentes {
  readonly esquiva: string
  readonly sincronia: string
  readonly registro: string
  readonly titulos: string
  readonly pie: string
  readonly tarjeta: string
  readonly cta: string
  readonly epoca: string
  readonly progreso: string
  readonly viaje: string
  readonly gota: string
  readonly remate: string
}
const F: Fuentes = {
  esquiva: leer('../escena/titulos3d/esquivaDelLogo.ts'),
  sincronia: leer('../escena/titulos3d/sincronia.ts'),
  registro: leer('../titulos3d/registro.ts'),
  titulos: leer('../escena/titulos3d/TitulosDeVolumen.tsx'),
  pie: leer('../escena/pie3d/PieDeVolumen.tsx'),
  tarjeta: leer('../escena/pie3d/tarjetaImpresa.ts'),
  cta: leer('../escena/ctaDelFinal/enVivo.ts'),
  epoca: leer('../motion/epoca.ts'),
  progreso: leer('../motion/useProgresoDePatron.ts'),
  viaje: leer('../../_componentes/useDeslizamientoDelCta.ts'),
  gota: leer('../../_secciones/trabajos/CapaDeLaGota.tsx'),
  remate: leer('../../_secciones/tu-panel/Remate.tsx'),
}

// H1 · LAS FUENTES. Cada título espera la cara de su DOM (no `fonts.ready`, que resuelve con nada cargando); lo armado con otra métrica (sus
// letras ya no están donde las midió) se vuelve a armar; el registro, el pie, la tarjeta, el CTA del final y la época se enteran de cada tanda.
const fuentesBien = (f: Fuentes): boolean =>
  /conReimpresion\(\) \? Promise\.all\(faltan\.map\(\(x\) => esperarLaFuenteDe\(x\.lugar\)\)\) : document\.fonts\.ready/.test(f.sincronia) && f.sincronia.includes('if (conReimpresion() && cambioSuMetrica(a))') && f.sincronia.includes('TANDA_DEL_ARMADO.set(a, versionDeLasFuentes())') &&
  f.registro.includes('alCargarseLasFuentes(pedirOtraSincronia)') && f.pie.includes('alCargarseLasFuentes(pedir)') && f.tarjeta.includes('versionDeLasFuentes()') &&
  f.cta.includes('alCargarseLasFuentes(avisarDelLugar)') && f.epoca.includes('alCargarseLasFuentes(alCargar)')
// Y los títulos a la vista se arman sin esperar el ocio (la sección adonde se llegó primero: con la CPU lenta el ocio tardaba segundos).
const vistaBien = (c: string): boolean => c.includes('const urgentes = faltan.filter((x) => !x.rearma || aLaVista(x.lugar))')
afirmar(vistaBien(F.sincronia), '  los títulos a la vista (la sección adonde se llegó) se arman sin esperar el ocio, como el hero')
controlPositivo('  el detector VE el reparto de antes (sólo el hero sin esperar)', F.sincronia.replace(' || aLaVista(x.lugar)', ''), vistaBien)
afirmar(fuentesBien(F), '  H1 · cada título espera la cara de su DOM y se rehace si sus letras cambiaron de lugar; el pie, la tarjeta, el CTA y la época, con cada tanda de fuentes')
controlPositivo('  el detector VE la espera de antes (`document.fonts.ready` para todos)', { ...F, sincronia: F.sincronia.replace('Promise.all(faltan.map((x) => esperarLaFuenteDe(x.lugar)))', 'document.fonts.ready') }, fuentesBien)
controlPositivo('  y un pie que no se entera de las fuentes que cargan después', { ...F, pie: F.pie.replace('alCargarseLasFuentes(pedir)', '(() => () => undefined)()') }, fuentesBien)
const LETRAS = [0, 0.61, 1.18, 1.79]
type Corridas = (medidas: readonly number[] | null, ahora: readonly number[] | null) => boolean
const letrasBien = (f: Corridas): boolean => !f(LETRAS, [...LETRAS]) && f(LETRAS, LETRAS.map((x, k) => x + 0.02 * k)) && f(LETRAS, LETRAS.slice(1)) && !f(null, LETRAS) && !f(LETRAS, null)
afirmar(letrasBien(letrasCorridas), '  las letras corridas: las mismas no; una que se corrió 0,02 em o una de menos, sí; sin medida, no se sabe (no)')
controlPositivo('  el detector VE una tolerancia que no ve nada (1 em)', ((a, b) => letrasCorridas(a, b, 1)) as Corridas, letrasBien)

// H2 · EL SEGUNDO CLIC EN VUELO: el `preventDefault` antes de ignorarlo (el ancla nativa ya no salta encima del viaje); y en vuelo recién con el
// destino calculado (una cuenta que falla no deja ignorados los clics para siempre).
// Y el reloj de seguridad no aborta un viaje que Lenis sigue haciendo con la pestaña a la vista (con la CPU lenta el viaje tarda más que su
// total: abortado, la escena asentaba la noche en otra sección).
const clicBien = (v: string): boolean =>
  /evento\.preventDefault\(\)\s*\n\s*if \(enVuelo\) return/.test(v) && v.indexOf('enVuelo = true') > v.indexOf('const curva = curvaDelViaje(') &&
  v.includes("if (lenis !== null && lenis.isScrolling !== false && document.visibilityState === 'visible') reloj = window.setTimeout(vigilarElViaje, MARGEN_DEL_RELOJ_MS)")
afirmar(clicBien(F.viaje), '  H2 · un clic con el viaje en vuelo se ignora de verdad (sin el salto nativo del ancla) y el vuelo empieza con el destino calculado')
controlPositivo('  y el reloj de antes (aborta a la duración nominal aunque el viaje siga)', F.viaje.replace("lenis.isScrolling !== false && document.visibilityState === 'visible'", 'false'), clicBien)
controlPositivo('  el detector VE el orden de antes (el `return` antes del `preventDefault`)', F.viaje.replace(/evento\.preventDefault\(\)\s*\n\s*if \(enVuelo\) return/, 'if (enVuelo) return\n      evento.preventDefault()'), clicBien)

// H3 · LA MEDICIÓN EN EL LAYOUT: un bloque adentro de un `sticky` pegado (la página a 3000, el sticky en su lugar a 2400, pegado arriba) y
// de un ancestro transformado (corrido 50 px, como el paralaje de la galería de Tu panel) mide el tope de su lugar (2520), no el de donde lo
// dejan el sticky y la transformada (3170). Un DOM de mentira con lo que la medición lee (su caja, su `offsetTop`, su `position`).
interface DeMentira {
  natural: string
  style: { position: string }
  parentElement: DeMentira | null
  offsetParent: DeMentira | null
  readonly offsetTop: number
  getBoundingClientRect: () => { readonly top: number }
}
const PAGINA = 3000
const global = globalThis as unknown as { window?: { scrollY: number }; HTMLElement?: unknown; getComputedStyle?: (e: DeMentira) => { position: string } }
class ElementoDeMentira {}
const deMentira = (x: Omit<DeMentira, 'offsetTop'> & { readonly tope: () => number }): DeMentira => {
  const e = Object.create(ElementoDeMentira.prototype) as DeMentira & { tope: () => number }
  Object.assign(e, x)
  Object.defineProperty(e, 'offsetTop', { get: () => e.tope() })
  return e
}
const pegado = deMentira({ natural: 'sticky', style: { position: '' }, parentElement: null, offsetParent: null, tope: () => (pegado.style.position === 'static' ? 2400 : PAGINA), getBoundingClientRect: () => ({ top: pegado.style.position === 'static' ? 2400 - PAGINA : 0 }) })
const movido = deMentira({ natural: 'static', style: { position: '' }, parentElement: pegado, offsetParent: pegado, tope: () => 40, getBoundingClientRect: () => ({ top: pegado.getBoundingClientRect().top + 40 + 50 }) })
const bloque = deMentira({ natural: 'static', style: { position: '' }, parentElement: movido, offsetParent: movido, tope: () => 80, getBoundingClientRect: () => ({ top: movido.getBoundingClientRect().top + 80 }) })
global.window = { scrollY: PAGINA }
global.HTMLElement = ElementoDeMentira
global.getComputedStyle = (e) => ({ position: e.style.position === '' ? e.natural : e.style.position })
const enReposo = topeEnReposo(bloque as unknown as HTMLElement)
const comoAntes = bloque.getBoundingClientRect().top + PAGINA
delete global.window
delete global.HTMLElement
delete global.getComputedStyle
afirmar(enReposo === 2520 && pegado.style.position === '', `  H3 · un bloque adentro de un sticky pegado y de un ancestro transformado mide ${String(enReposo)} (su lugar: 2520; antes, ${String(comoAntes)}) y el sticky queda como estaba`)
controlPositivo('  el detector VE la medición de antes (con lo que corren el sticky y la transformada)', comoAntes, (x: number) => x === 2520)
const medicionBien = (p: string, e: string): boolean => p.includes('topDoc: topeEnReposo(elemento)') && p.includes('alto: elemento.offsetHeight') && /new ResizeObserver\([\s\S]*?\.observe\(document\.body\)/.test(e)
afirmar(medicionBien(F.progreso, F.epoca), '  y el motor mide así; la época también avanza cuando el cuerpo cambia de alto (la página que crece), con el mismo reposo')
controlPositivo('  el detector VE el motor de antes', { p: F.progreso.replace('topDoc: topeEnReposo(elemento)', 'topDoc: caja.top + window.scrollY'), e: F.epoca }, (x: { p: string; e: string }) => medicionBien(x.p, x.e))

// H4 · LA PESTAÑA OCULTA AL CABLEARSE LA ÉPOCA: la medición del montaje queda debida y se toma al volver (antes, el alto en 0 para siempre).
const alVolver = (cableada: EstadoDeEpoca): number => reducirEpoca(cableada, 'visible').epoca
const epocaBien = (e: string, cableada: EstadoDeEpoca): boolean => e.includes('estado = { ...EPOCA_INICIAL, visible, pendiente: !visible }') && alVolver(cableada) === 1
afirmar(epocaBien(F.epoca, { ...EPOCA_INICIAL, visible: false, pendiente: true }), '  H4 · cableada con la pestaña oculta, al volver a verse se mide (la época avanza)')
controlPositivo('  el detector VE el cableado de antes (oculta y sin nada debido: no mide nunca)', { ...EPOCA_INICIAL, visible: false }, (c: EstadoDeEpoca) => epocaBien(F.epoca, c))
// La noche y el remate después de un salto que pasó por encima del disparo: el cruce no tiene gesto, pero ya pasaron: se posan sin gesto.
const saltoBien = (g: string, rm: string): boolean =>
  ['abajo-subiendo', 'abajo-bajando'].every((c) => gestoDelCruce(c as 'abajo-subiendo') === 'nada' && puestoTras(c as 'abajo-subiendo')) &&
  /else if \(gesto === 'nada' && sentido === null && viajeEnCurso\(\) === null && !DIA_DEL_FINAL\.activo\) NOCHE_DISPARADA\.cantidad = nocheDelScroll\(\)/.test(g) &&
  /else if \(animaciones\.length === 0 && puestoTras\(cruce\)\) \{[\s\S]*?armar\(\)\s*\n\s*for \(const a of animaciones\) a\.finish\(\)/.test(rm)
// Y el titular que esquiva el logo mientras su sección entra: con la página quieta `sueltaMs`, llega igual (el salto nativo del ancla deja
// Quiénes somos «entrando» con el titular encima del logo: pedía 0 para siempre con su DOM apagado, y no se veía ninguno de los dos).
const esquivaBien = (e: string, suelta: number): boolean => suelta >= 500 && suelta <= 2000 && e.includes('const entrando = enElCuadro !== null && enElCuadro.entrando && ahora - QUIETA.desde < ESQUIVA.sueltaMs')
afirmar(esquivaBien(F.esquiva, ESQUIVA.sueltaMs), `  H4 · el titular que esquiva el logo llega igual con la página quieta ${String(ESQUIVA.sueltaMs)} ms (en una pausa corta sigue esquivando)`)
controlPositivo('  el detector VE la esquiva de antes (para siempre mientras la sección «entra»)', F.esquiva.replace(' && ahora - QUIETA.desde < ESQUIVA.sueltaMs', ''), (e: string) => esquivaBien(e, ESQUIVA.sueltaMs))
controlPositivo('  y una que se suelta en cualquier pausa del scroll (180 ms: aparecería sobre el logo al frenar)', 180, (x: number) => esquivaBien(F.esquiva, x))
afirmar(saltoBien(F.gota, F.remate), '  H4 · después de un salto que pasó por encima del disparo, la noche es la que deja el scroll y el remate de Tu panel queda puesto (sin gesto)')
controlPositivo('  el detector VE la noche de antes (sólo la ida)', { g: F.gota.replace(/\n\s*else if \(gesto === 'nada'[^\n]*/, ''), rm: F.remate }, (x: { g: string; rm: string }) => saltoBien(x.g, x.rm))
controlPositivo('  y el remate de antes (dormido después del salto)', { g: F.gota, rm: F.remate.replace('} else if (animaciones.length === 0 && puestoTras(cruce)) {', '} else if (false) {') }, (x: { g: string; rm: string }) => saltoBien(x.g, x.rm))

// H5 · EL CONTEXTO PERDIDO: el estado lo sigue (un lienzo de mentira con sus dos eventos); perdido, los títulos se sueltan (su DOM a la
// vista) y al reponerse se rehacen el estudio y lo armado (el de los títulos y el del pie).
const lienzo = new EventTarget()
vigilarElContexto(lienzo as unknown as HTMLCanvasElement)
lienzo.dispatchEvent(new Event('webglcontextlost'))
const perdidoAlPerder = contextoPerdido()
lienzo.dispatchEvent(new Event('webglcontextrestored'))
const contextoBien = (f: Fuentes, alPerder: boolean): boolean =>
  alPerder && !contextoPerdido() && /if \(contextoPerdido\(\)\) \{\s*\n\s*soltarTodos\(t, armados\)/.test(f.sincronia) && f.titulos.includes('}, [gl, contexto])') && f.titulos.includes('escena, camara, contexto])') && f.pie.includes('}, [gl, contexto])') && f.pie.includes('contextoPerdido()) return')
afirmar(contextoBien(F, perdidoAlPerder), '  H5 · perdido, lo impreso se suelta (el DOM a la vista); repuesto, el estudio y lo armado de nuevo (los títulos y el pie)')
controlPositivo('  el detector VE los títulos de antes (el estudio sólo con el lienzo)', { ...F, titulos: F.titulos.replace('}, [gl, contexto])', '}, [gl])') }, (f: Fuentes) => contextoBien(f, perdidoAlPerder))

// EL PERRO GUARDIÁN: trabado es a la vista, con su fuente, sin armar y sin nada en curso (lo que espera su fuente o compila no se toca: si
// no, con la CPU lenta se rearmaría para siempre); a los 2 s se rearma y lo dice en la consola.
const TRABADO: EstadoDelTitulo = { listo: false, esperando: false, compilando: false, aLaVista: true, conSuFuente: true }
const guardianBien = (f: (e: EstadoDelTitulo) => boolean): boolean =>
  f(TRABADO) && !f({ ...TRABADO, listo: true }) && !f({ ...TRABADO, esperando: true }) && !f({ ...TRABADO, compilando: true }) && !f({ ...TRABADO, aLaVista: false }) && !f({ ...TRABADO, conSuFuente: false })
afirmar(guardianBien(estaTrabado) && GUARDIAN.plazoMs === 2000 && F.sincronia.includes('console.warn(`[v3-carga]'), `  el guardián: trabado sólo a la vista, con su fuente, sin armar y sin nada en curso; a los ${String(GUARDIAN.plazoMs / 1000)} s se rearma con su aviso \`[v3-carga]\``)
controlPositivo('  el detector VE un guardián que rearma lo que todavía espera su fuente (con la CPU lenta, para siempre)', (e: EstadoDelTitulo) => e.aLaVista && !e.listo, guardianBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A13 · El arnés en el sitio: el antes falla, el después no, el control positivo falla (el recibo)')

interface TasaDelRecibo {
  readonly corridas: number
  readonly alLlegar: number
  readonly estricto: number
  readonly persistente: number
  readonly trasScroll: number
}
interface TandaDelRecibo {
  readonly modo: string
  readonly tanda: string
  readonly gpu: string
  readonly total: TasaDelRecibo
  readonly porCondicion: Readonly<Record<string, TasaDelRecibo>>
  readonly tipos: { readonly estricto: Readonly<Record<string, number>>; readonly persistente: Readonly<Record<string, number>> }
  readonly clicsNativos: number
  readonly avisosDelGuardian: number
  readonly erroresDeConsola: number
}
const RECIBO = JSON.parse(readFileSync(new URL('../../../../../docs/rediseno/entregas/cierre-a-ter/carga.json', import.meta.url), 'utf8')) as readonly TandaDelRecibo[]
const tandaDe = (nombre: string): TandaDelRecibo => {
  const t = RECIBO.find((x) => x.modo === 'build' && x.tanda === nombre)
  if (t === undefined) throw new Error(`falta la tanda ${nombre} en el recibo`)
  return t
}
const [ANTES, ANTES_FONDO, DESPUES, DESPUES_FONDO, CONTROL] = ['antes', 'antes-fondo', 'despues-2', 'despues-fondo', 'control'].map(tandaDe)
// El después: con la placa de alto rendimiento, cero a los 5,5 s y después de scrollear en todas; a los 1,5 s con la escena, a lo sumo el
// fundido del DOM bajo la CPU lenta o la red lenta (la escena compilando su primer cuadro), nunca en la condición normal; ni un salto nativo,
// ni un aviso del guardián, ni un error en la consola.
const despuesBien = (ts: readonly TandaDelRecibo[]): boolean =>
  ts.every((t) => t.gpu.includes('NVIDIA') && t.total.corridas >= 26 && t.total.persistente === 0 && t.total.trasScroll === 0 && t.clicsNativos === 0 && t.avisosDelGuardian === 0 && t.erroresDeConsola === 0 &&
    Object.keys(t.tipos.estricto).every((k) => k === 'dom-visible') && t.total.estricto <= 0.05 * t.total.corridas && (t.porCondicion.normal?.estricto ?? 0) === 0)
afirmar(despuesBien([DESPUES, DESPUES_FONDO]), `  después: a los 5,5 s y tras scrollear 0 de ${String(DESPUES.total.corridas + DESPUES_FONDO.total.corridas)}; a los 1,5 s con la escena ${String(DESPUES.total.estricto + DESPUES_FONDO.total.estricto)} (sólo el fundido del DOM con la CPU o la red lentas); 0 saltos nativos, 0 avisos del guardián`)
controlPositivo('  el detector VE el antes (las mismas corridas sin los arreglos)', [ANTES, ANTES_FONDO], despuesBien)
// El antes: el detector ve las causas (H1 la fuente de respaldo en las cargas con caché, H4 la época sin medir con la pestaña oculta).
const antesVisto = ANTES.total.persistente >= 0.5 * ANTES.total.corridas && (ANTES.tipos.persistente['fuente-de-respaldo'] ?? 0) > 0 && ANTES_FONDO.total.persistente === ANTES_FONDO.total.corridas && (ANTES_FONDO.tipos.persistente['epoca-sin-medir'] ?? 0) > 0
afirmar(antesVisto, `  antes: ${String(ANTES.total.persistente)} de ${String(ANTES.total.corridas)} a los 5,5 s (la fuente de respaldo en ${String(ANTES.tipos.persistente['fuente-de-respaldo'] ?? 0)}) y con la pestaña oculta al cargar ${String(ANTES_FONDO.total.persistente)} de ${String(ANTES_FONDO.total.corridas)} (la época sin medir: todo quieto)`)
// El control positivo: sin la reimpresión por fuente y con las fuentes demoradas, falla (la fuente de respaldo).
const controlFalla = CONTROL.total.persistente >= 0.5 * CONTROL.total.corridas && (CONTROL.tipos.persistente['fuente-de-respaldo'] ?? 0) > 0
afirmar(controlFalla, `  el control positivo (\`?reimpresion=no\`, las fuentes 5 s tarde): ${String(CONTROL.total.persistente)} de ${String(CONTROL.total.corridas)} con la fuente de respaldo a los 5,5 s`)

cerrar('s75-carga')
