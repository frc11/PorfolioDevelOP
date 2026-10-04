/**
 * PASADA FINAL — el invariante: npm run test:s47-pasada-final
 *
 * La regla de esta pasada: cada comportamiento aprobado que se toca queda FIJADO acá (duraciones, recorridos, orden),
 * con su control positivo. Una sección por ticket:
 *   A1 · el titular del hero sin parpadeo 2D: desde 1024 el texto sale oculto del servidor y lo que se ve son sus
 *        letras de volumen, armadas apenas la escena monta; el 2D sólo como respaldo (la escena caída, sin títulos, o el
 *        3D que no llega a tiempo), con un plazo que el hook y la hoja comparten; y nada de lo armado se rearma porque
 *        otro título entre o salga del registro.
 *   A3 · «Seis razones / para elegirnos»: los tres tramos fijados en pantallas del pin (se arma en 0,6, queda quieta 1,
 *        se va en 0,4), la cámara quieta hasta que termina el tramo quieto, la llegada 3D con el mínimo de ESCENA 10 y el
 *        asiento «armado» (frenar a mitad la termina; subir la desarma), la salida con los 2 s de A5.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/pasada-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS, useTitular2D } from '../../_componentes/titulos3d/titular2d'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { Hero } from '../../_secciones/hero/Hero'
import { VENTANA_DE_LA_FRASE, VENTANA_DE_LA_LEVANTADA, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../../_secciones/por-que-develop/geometria'
import { pantallasDe } from '../escena/anclaje'
import { laEscenaCayo, marcarLaEscenaCaida, suscribirALaCaida } from '../escena/caida'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { TIEMPOS_DEL_FINAL, progresoDelFinal } from '../escena/finalDelRecorrido'
import { mostradoDelScroll } from '../escena/titulos3d/llegada'
import { mismaForma } from '../escena/titulos3d/sincronia'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import type { TituloDeVolumen } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { valorDeToken } from './s10-css'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · El titular del hero sin parpadeo 2D')

// El estado del texto 2D, como sale del servidor (sin efectos): oculto; con el título armado, reemplazado.
function Sonda({ listo }: { readonly listo: boolean }): React.JSX.Element {
  return <i data-estado={useTitular2D(listo)} />
}
afirmarIgual(renderToStaticMarkup(<Sonda listo={false} />), '<i data-estado="oculto"></i>', 'en el servidor y al hidratar el texto 2D sale OCULTO: nunca se pinta primero')
afirmarIgual(renderToStaticMarkup(<Sonda listo />), '<i data-estado="reemplazado"></i>', '  y con el título de volumen armado, reemplazado')

const hero = seccionDe('hero')
const quieto = marcar(<Hero seccion={hero} />, { anima: false })
const conMotion = marcar(<Hero seccion={hero} />, { anima: true })
const dosRegistrosOcultos = (html: string): boolean => veces(html, 'data-titular-2d="oculto"') === 2 && !html.includes('escritorio:opacity-0')
afirmar(dosRegistrosOcultos(quieto) && dosRegistrosOcultos(conMotion), 'los dos registros del `h1` llevan el estado (en las dos ramas) y ya no la clase que los apagaba al llegar el 3D')
controlPositivo('el detector VE el hero de antes (sin estado, con la clase de apagado)', quieto.replace(/ data-titular-2d="oculto"/g, '').replace('class="', 'class="escritorio:opacity-0 '), dosRegistrosOcultos)
afirmar(/<span class="[^"]*" data-titular-2d="oculto"/.test(conMotion) && !/data-titular-2d="oculto"[^>]*aria-hidden/.test(conMotion), '  el estado va en el mismo `span` que pinta el texto (sin copia `sr-only` ni `aria-hidden`: el `h1` sigue siendo el nodo accesible)')

// El plazo: uno solo, en el hook y en la hoja (el seguro sin JS).
const hoja = leer('_estilos/titular.css')
const plazoDeLaHoja = /--respaldo-2d:\s*(\d+)ms/.exec(hoja)
afirmar(plazoDeLaHoja !== null && Number(plazoDeLaHoja[1]) === RESPALDO_2D_MS && RESPALDO_2D_MS === 2500, 'el plazo del respaldo es UNO (2,5 s): el del hook y el de la hoja', `${String(RESPALDO_2D_MS)} ms`)
controlPositivo('el detector VE la hoja con otro plazo', hoja.replace('2500ms', '3000ms'), (h: string) => Number(/--respaldo-2d:\s*(\d+)ms/.exec(h)?.[1]) === RESPALDO_2D_MS)
afirmar(RESPALDO_2D_CON_ESCENA_MS > RESPALDO_2D_MS && RESPALDO_2D_CON_ESCENA_MS <= 5000, '  con la escena ya montada (el lienzo existe) el 3D viene en camino: se le da más, y no más de 5 s', `${String(RESPALDO_2D_CON_ESCENA_MS)} ms`)
const hook = sinComentarios(leer('_componentes/titulos3d/titular2d.ts'))
afirmar(/document\.querySelector\('\[data-escena\] canvas'\) !== null\) reloj = window\.setTimeout\(\(\) => setVencido\(true\), desdeElArranque\(RESPALDO_2D_CON_ESCENA_MS\)\)/.test(hook) && /else setVencido\(true\)/.test(hook) && /desdeElArranque\(RESPALDO_2D_MS\)/.test(hook), '  los dos plazos se cuentan desde el arranque de la página (la misma cuenta que la animación de la hoja)')
afirmar(/if \(listo\) return 'reemplazado'/.test(hook) && /return caida \|\| vencido \|\| sinVolumen \? 'respaldo' : 'oculto'/.test(hook), '  el 3D armado manda; sin él, el respaldo con la escena caída, sin títulos de volumen o vencido el plazo')

// La hoja: los estados rigen desde 1024 (el corte, literal, atado al token) y el oculto sólo con movimiento.
const corte = /@media \(width >= (\d+)px\)/.exec(hoja)
afirmar(corte !== null && Number(corte[1]) === Number(valorDeToken('--breakpoint-escritorio').replace('px', '')), '`titular.css` declara el corte como literal y dice EXACTAMENTE lo mismo que `--breakpoint-escritorio`', corte?.[1])
const reglaDelOculto = /@media \(width >= \d+px\) and \(prefers-reduced-motion: no-preference\) \{\s*\[data-v3\] \[data-titular-2d='oculto'\] \{\s*opacity: 0;\s*animation: titular-2d-respaldo var\(--duracion-media\) var\(--ease-salida\) var\(--respaldo-2d\) both;/
afirmar(reglaDelOculto.test(hoja) && /\[data-v3\] \[data-titular-2d='reemplazado'\] \{\s*opacity: 0;/.test(hoja) && /@keyframes titular-2d-respaldo \{\s*to \{\s*opacity: 1;/.test(hoja), '  oculto: invisible sólo con movimiento, con la animación que a los 2,5 s lo deja ver sin JS; reemplazado: apagado también con movimiento reducido')
controlPositivo('el detector VE el oculto sin el seguro sin JS', hoja.replace(/animation: titular-2d-respaldo[^;]*;/, ''), (h: string) => reglaDelOculto.test(h))
afirmar(!/\[data-titular-2d='respaldo'\]/.test(hoja) && /transition: opacity var\(--duracion-media\) var\(--ease-salida\)/.test(hoja), '  el respaldo es el estado de reposo (opacidad 1 con la transición): aparece con un fundido, y si el 3D llega después, se va con el mismo')

// La escena: el registro se sincroniza por diferencia; el hero se arma apenas están las fuentes, antes del ocio.
const sincronia = sinComentarios(leer('_lib/escena/titulos3d/sincronia.ts'))
const escena = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const elHeroPrimero = (c: string): boolean => {
  const urgentes = c.indexOf('armarElLote(t, armados, urgentes, vivo)')
  const ocio = c.indexOf('soltarElOcio = enOcio(')
  return urgentes > 0 && ocio > urgentes && /const urgentes = faltan\.filter\(\(x\) => !x\.rearma\)/.test(c) && /void document\.fonts\.ready\.then\(/.test(c)
}
afirmar(elHeroPrimero(sincronia), 'los títulos que llegan una vez por carga (el hero: `rearma: false`) se arman apenas están las fuentes, sin esperar el ocio; los demás, en el ocio')
controlPositivo('el detector VE el hero esperando el ocio como los demás', sincronia.replace('armarElLote(t, armados, urgentes, vivo)', '').replace('if (pendiente && vivo()) armarElLote(t, armados, demorados, vivo)', 'if (pendiente && vivo()) armarElLote(t, armados, [...urgentes, ...demorados], vivo)'), elHeroPrimero)
afirmar(/return sincronizar\(\{ gl, escena, camara, raiz: g, variante, estudio: \(\) => estudio\.current \}, m\.current\.armados, TITULOS_DE_VOLUMEN\.values\(\), \(\) => vivo\.current\)\s*\}, \[version, variante, gl, escena, camara\]\)/.test(escena) && !/for \(const t of TITULOS_DE_VOLUMEN\.values\(\)\) \{\s*const a = armar/.test(escena), '  la escena sincroniza con cada cambio del registro en vez de soltar y rearmar todos los títulos')
const forma = (parte: Partial<TituloDeVolumen>): TituloDeVolumen => ({ id: 'x', texto: 'TU NEGOCIO', lugar: null as unknown as HTMLElement, lectura: 0, subida: 0, llegada: 0, salida: 0, queda: true, corrida: 0, fuente: 'archivo-700', gesto: 'azar', colocacion: 'pantalla', rearma: false, minimoS: 2.4, salidaMinimaS: null, asiento: 'cercano', trazos: [], ...parte })
afirmar(mismaForma(forma({}), forma({ lugar: null as unknown as HTMLElement })) && !mismaForma(forma({}), forma({ texto: 'OTRO' })) && !mismaForma(forma({}), forma({ fuente: 'chivo-400' })) && !mismaForma(forma({}), forma({ gesto: 'letras' })), '  el mismo título vuelto a anotar en otro elemento (el `h1` remontado) tiene la misma forma: sólo cambia de lugar; otro texto, otra fuente u otro gesto, no')
controlPositivo('el detector VE dos formas distintas como distintas (otro texto no es la misma forma)', [forma({}), forma({ texto: 'OTRO' })] as const, (par: readonly [TituloDeVolumen, TituloDeVolumen]) => mismaForma(par[0], par[1]))
afirmar(/if \(mismaForma\(a\.titulo, titulo\)\) \{\s*a\.titulo = titulo\s*a\.colocado = false\s*continue/.test(sincronia) && /calentar\(t\.gl, t\.escena, t\.camara\)\s*for \(const a of nuevos\) if \(armados\.includes\(a\)\) marcarListo\(a\.titulo\.id, true\)/.test(sincronia), '  remontado, se vuelve a colocar sin rearmar (su «listo» y su llegada siguen); lo nuevo avisa «listo» recién compilado y calentado')

// La precarga del módulo y la escena caída.
const compuerta = sinComentarios(leer('_componentes/EscenarioCompuerta.tsx'))
afirmar(/if \(arribaDelUmbral && entornoDeLaEscena\(\)\.titulos !== 'no'\) void precargarLosTitulos\(\)/.test(compuerta) && /import\('\.\/TitulosDeVolumen'\)/.test(leer('_lib/escena/titulos3d/precarga.ts')), 'desde 1024 el módulo de los títulos se pide apenas hidrata el chrome (el mismo trozo que la escena carga perezoso)')
const escudo = sinComentarios(leer('_lib/escena/EscudoDeLaEscena.tsx'))
afirmar(/componentDidCatch\(error: Error\) \{[\s\S]*?marcarLaEscenaCaida\(\)/.test(escudo), 'si el lienzo tira (sin WebGL), el escudo lo publica')
let avisos = 0
const dejarDeOir = suscribirALaCaida(() => {
  avisos += 1
})
afirmar(!laEscenaCayo(), '  y antes de eso la escena no está caída')
marcarLaEscenaCaida()
marcarLaEscenaCaida()
afirmar(laEscenaCayo() && avisos === 1, '  caída una vez: los oyentes se enteran una vez (el titular pasa al respaldo en el acto)')
dejarDeOir()

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · «Seis razones / para elegirnos»: llegada lenta, un tramo quieto, salida lenta — los tres tramos, fijados')

const T = TIEMPOS_DEL_FINAL
const PIN = PANTALLAS_DE_POR_QUE_DEVELOP - 1
const enPantallas = (p: number): number => p * PIN
/** Los tres tramos, en pantallas del pin: lo que tarda en armarse, lo que queda quieta y lo que tarda en irse. */
const tramos = (frase: { readonly armada: number; readonly hasta: number }, ventanaDeLaFrase: { readonly hasta: number }, subeDesde: number, levantada: { readonly desde: number; readonly hasta: number }) => ({
  llegada: enPantallas(ventanaDeLaFrase.hasta),
  quieta: Math.min(frase.hasta, enPantallas(subeDesde)) - enPantallas(ventanaDeLaFrase.hasta),
  salida: enPantallas(levantada.hasta - levantada.desde),
  armadaEsLaVentana: Math.abs(enPantallas(ventanaDeLaFrase.hasta) - frase.armada) < 1e-9,
})
const EPS = 1e-9 // las ventanas van y vuelven por progresoDelPin: el redondeo binario no es un tramo mas corto
const bien = (t: ReturnType<typeof tramos>): boolean => t.armadaEsLaVentana && t.llegada >= 0.5 - EPS && t.llegada <= 1 + EPS && t.quieta >= 1 - EPS && t.salida >= 0.4 - EPS
const deAhora = tramos(T.frase, VENTANA_DE_LA_FRASE, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.desde, VENTANA_DE_LA_LEVANTADA)
afirmar(bien(deAhora), 'la frase se arma en al menos media pantalla de scroll (su ventana ES `frase.armada`), queda quieta UNA pantalla entera y se va en al menos 0,4', `llegada ${deAhora.llegada.toFixed(2)} · quieta ${deAhora.quieta.toFixed(2)} · salida ${deAhora.salida.toFixed(2)} pantallas`)
controlPositivo('el detector VE la de RETOQUE PANEL T3 (llegaba en 0,45 y quedaba quieta 0,55)', tramos({ armada: 0.45, hasta: 1 }, { hasta: 0.45 / PIN }, 1 / PIN, { desde: 2 / PIN, hasta: 2.4 / PIN }), bien)
afirmar(PANTALLAS_DE_POR_QUE_DEVELOP === 5 && pantallasDe(seccionDe('por-que-develop').alto) === 5 && T.valores.llega - T.frase.hasta >= 0.8 - EPS, '  la sección declara las cinco pantallas (la tabla mueve la escena) y la cámara baja a los valores en no menos de 0,8 pantallas (el techo de velocidad de s23)', seccionDe('por-que-develop').alto)
// La cámara: quieta en A desde que la sección asoma hasta que la frase termina su tramo quieto.
const k = (nombre: string): { readonly at: number; readonly pose: Record<string, number> } | undefined => CHOREO_KEYFRAMES.find((x) => x.name === nombre)
const A = k('frase')
const sosten = k('frase · sostén')
const mismaPose = (a: Record<string, number> | undefined, b: Record<string, number> | undefined): boolean => a !== undefined && b !== undefined && Object.keys(b).every((c) => a[c] === b[c])
afirmar(A !== undefined && sosten !== undefined && mismaPose(A.pose, sosten.pose) && Math.abs(sosten.at - progresoDelFinal(T.frase.hasta)) <= 5e-5 && sosten.at > progresoDelFinal(T.frase.armada), '  la cámara no se mueve mientras la frase llega ni mientras se lee: la pose de «frase» se sostiene hasta `frase.hasta`', `A en ${String(A?.at)} · sostén en ${String(sosten?.at)}`)
controlPositivo('el detector VE un sostén que termina antes de que la frase termine de armarse', { at: progresoDelFinal(T.frase.armada) - 0.001, pose: sosten?.pose ?? {} }, (s: { readonly at: number; readonly pose: Record<string, number> }) => mismaPose(A?.pose, s.pose) && s.at > progresoDelFinal(T.frase.armada))
// El 3D: la llegada con el mínimo de ESCENA 10 y el asiento «armado»; la salida con los 2 s de A5. Función del scroll.
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const escena3d = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const conMinimo = (c: string): boolean => /<TituloDeVolumen [^>]*minimoS=\{LENTOS\.llegadaDeLaFraseS\} asiento="armado" salidaMinimaS=\{LENTOS\.salidaDeLaFraseS\}[^>]*llegadaDe="por-que-develop" \/>/.test(c)
afirmar(conMinimo(porQue) && LENTOS.llegadaDeLaFraseS === 1.4 && LENTOS.salidaDeLaFraseS === 2 && /mostradoDelScroll\(a\.mostrado\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS, a\.titulo\.asiento\)/.test(escena3d), 'la frase pide su mínimo de llegada (1,4 s), su asiento armado y su salida lenta (2 s), y la escena los usa; en un viaje del menú se desarma rápido')
controlPositivo('el detector VE la frase sin su mínimo de llegada', porQue.replace(' minimoS={LENTOS.llegadaDeLaFraseS} asiento="armado"', ''), conMinimo)
const DT = 1 / 60
const frase = (m: number, p: number, a: boolean): number => mostradoDelScroll(m, p, a, DT, LENTOS.llegadaDeLaFraseS, 'armado')
const cuantoTarda = (desde: number, pedido: number, asentar: boolean, destino: number): number => {
  let m = desde
  for (let t = 0; t < 10; t += DT) {
    if (m === destino) return t
    m = frase(m, pedido, asentar)
  }
  return Number.POSITIVE_INFINITY
}
const tarda = cuantoTarda(0, 1, false, 1)
afirmar(tarda >= LENTOS.llegadaDeLaFraseS - DT && tarda <= LENTOS.llegadaDeLaFraseS + 2 * DT, '  un scroll que salta la ventana entera igual la ve armarse en 1,4 s (lo mostrado persigue al scroll con el mínimo)', `${tarda.toFixed(2)} s`)
let aMitad = 0
for (let t = 0; t < 0.3; t += DT) aMitad = frase(aMitad, 0.25, false)
const parado = cuantoTarda(aMitad, 0.25, true, 1)
afirmar(aMitad > 0.1 && aMitad < 0.25 && Number.isFinite(parado), '  frenado a un cuarto del camino, termina de armarse (el asiento «armado»): un título para leer no se desarma delante de quien lo lee', `desde ${aMitad.toFixed(2)} llega en ${parado.toFixed(2)} s`)
controlPositivo('el detector VE el asiento de F2 (al extremo más cercano: a un cuarto, se desarma)', 'cercano' as const, (asiento: 'cercano' | 'armado') => {
  let m = aMitad
  for (let t = 0; t < 3; t += DT) m = mostradoDelScroll(m, 0.25, true, DT, LENTOS.llegadaDeLaFraseS, asiento)
  return m === 1
})
let vuelta = 1
for (let t = 0; t < 3; t += DT) vuelta = frase(vuelta, 0, true)
afirmar(vuelta === 0, '  y subiendo el scroll por encima de la ventana se desarma del todo: sigue siendo función del scroll')

// Al reanudarse el lazo (la escena se para detras de un panel opaco), lo mostrado vuelve a lo que dice el scroll.
const reanuda = (c: string): boolean => /const reanudado = s\.ultimoCuadro > 0 && ahora - s\.ultimoCuadro > PAUSA_DEL_LAZO_MS\s*s\.ultimoCuadro = ahora/.test(c) && /if \(reanudado\) \{\s*a\.mostrado\.llegada = acotar01\(enViaje \? 0 : a\.titulo\.llegada\)\s*a\.mostrado\.salida = acotar01\(a\.titulo\.salida\)/.test(c) && /if \(reanudado && a\.titulo\.rearma\) m\.llegada = acotar01\(enViaje \? 0 : a\.titulo\.llegada\)/.test(c) && /const PAUSA_DEL_LAZO_MS = 250/.test(c)
afirmar(reanuda(escena3d), '  al reanudarse el lazo de la escena (se para detras de Tu panel) lo mostrado vuelve a lo que dice el scroll: ningun estado viejo se deshace delante de quien vuelve')
controlPositivo('el detector VE la escena que persigue desde el estado congelado', escena3d.replace('if (reanudado) {', 'if (false) {'), reanuda)

cerrar('s47-pasada-final')
