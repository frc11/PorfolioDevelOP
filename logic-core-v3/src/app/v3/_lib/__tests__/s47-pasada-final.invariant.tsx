/**
 * PASADA FINAL — el invariante: npm run test:s47-pasada-final
 *
 * La regla de esta pasada: cada comportamiento aprobado que se toca queda FIJADO acá (duraciones, recorridos, orden),
 * con su control positivo. Una sección por ticket:
 *   A1 · el titular del hero sin parpadeo 2D: desde 1024 el texto sale oculto del servidor y lo que se ve son sus
 *        letras de volumen, armadas apenas la escena monta; el 2D sólo como respaldo (la escena caída, sin títulos, o el
 *        3D que no llega a tiempo), con un plazo que el hook y la hoja comparten; y nada de lo armado se rearma porque
 *        otro título entre o salga del registro.
 *   A2 · la llegada de Portfolio es la de ESCENA 10: los números de las letras (16 em atrás, una vuelta y cuarto, la
 *        curva cúbica, 1,4 s de mínimo) y la cámara con que se ve (el título se coloca con la cámara que guarda, con la
 *        del final de la llegada de hoy, la relación de ESCENA 10: la tabla de secciones había corrido el mapeo).
 *   A3 · «Seis razones / para elegirnos»: los tres tramos fijados en pantallas del pin (se arma en 0,6, queda quieta 1,
 *        se va en 0,4), la cámara quieta hasta que termina el tramo quieto, la llegada 3D con el mínimo de ESCENA 10 y el
 *        asiento «armado» (frenar a mitad la termina; subir la desarma), la salida con los 2 s de A5.
 *   A4 · el sonido guardado como prendido arranca solo: el motor se carga con la PRIMERA interacción (la rueda también),
 *        cada acción despierta el contexto, howler no lo suspende solo (el ambiente generativo se quedaba mudo a los
 *        30 s) y el botón muestra lo real (`data-estado`).
 *   0  · las llegadas de Portfolio de antes, con bandera (`?pruebas=portfolio=e9|e10|3ds|lejos`): las cifras de cada
 *        commit escritas acá, F2 en las cuatro, la de hoy por defecto, y la cámara de entonces (los pares medidos).
 *   C1 · el parlante, justo encima del infinito y centrado con él (una sola columna fija en la esquina): el ícono que
 *        dibuja o corta sus ondas, el cartel «Sonido / activado|desactivado» que se va solo y el anuncio aparte.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/pasada-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { ESCALON_DE_LAS_ONDAS_S, IconoDelParlante, ONDAS_EN_ESPERA, TRAZO_DEL_ICONO } from '../../_chrome/sonido/IconoDelParlante'
import { estadoDelMotor } from '../../_chrome/sonido/motorCompartido'
import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS, useTitular2D } from '../../_componentes/titulos3d/titular2d'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { Hero } from '../../_secciones/hero/Hero'
import { VENTANA_DE_LA_FRASE, VENTANA_DE_LA_LEVANTADA, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../../_secciones/por-que-develop/geometria'
import { pantallasDe } from '../escena/anclaje'
import { CURVAS } from '../motion/curvas'
import { laEscenaCayo, marcarLaEscenaCaida, suscribirALaCaida } from '../escena/caida'
import { PARES_DE_LA_CAMARA, comoEntonces, progresoDeLaCamara } from '../escena/camaraDeEntonces'
import { PRUEBAS_APAGADAS, VARIANTES_DE_PORTFOLIO, entornoPedido } from '../escena/entorno'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { TIEMPOS_DEL_FINAL, progresoDelFinal } from '../escena/finalDelRecorrido'
import { poseDeLaLectura, type Lectura } from '../escena/titulos3d/colocacion'
import { FORMA_DE_LAS_LETRAS, LLEGADA_DE_LAS_LETRAS, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, llegadaDeLaLetra, llegadaNormalGlsl, llegadaParsGlsl, llegadaPosicionGlsl, mismaLlegada, mostradoDelScroll, type FormaDeLaLlegada } from '../escena/titulos3d/llegada'
import { mismaForma } from '../escena/titulos3d/sincronia'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { LECTURA, LLEGADA_DE_PORTFOLIO, type TituloDeVolumen } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { LLEGADAS_DE_PORTFOLIO } from '../titulos3d/variantesDePortfolio'
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
const forma = (parte: Partial<TituloDeVolumen>): TituloDeVolumen => ({ id: 'x', texto: 'TU NEGOCIO', lugar: null as unknown as HTMLElement, lectura: 0, subida: 0, llegada: 0, salida: 0, queda: true, corrida: 0, fuente: 'archivo-700', gesto: 'azar', colocacion: 'pantalla', rearma: false, minimoS: 2.4, salidaMinimaS: null, asiento: 'cercano', trazos: [], forma: null, ...parte })
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
titulo('A2 · La llegada de Portfolio: la de ESCENA 10 (distancia, curva, duración y la cámara con que se ve), fijada')

const L = LLEGADA_DE_LAS_LETRAS
const ESCENA_10 = { profundidad: 16, subida: 1.2, vueltas: 1.25, inclinacion: 0.12, dura: 0.6, aparece: 0.35, minimoS: 1.4 } as const
const comoEscena10 = (l: Record<keyof typeof ESCENA_10, number>): boolean => (Object.keys(ESCENA_10) as (keyof typeof ESCENA_10)[]).every((k) => l[k] === ESCENA_10[k])
afirmar(comoEscena10(L) && LENTOS.llegadaDePortfolioS === L.minimoS, 'las letras vienen de 16 em atrás y 1,2 arriba, girando una vuelta y cuarto, cada una en el 60 % del progreso con la curva cúbica, disolviéndose hasta el 35 %, y en no menos de 1,4 s de punta a punta (los números de ESCENA 10, eec0b4e3)', JSON.stringify(L))
controlPositivo('el detector VE una llegada más corta (8 em)', { ...L, profundidad: 8 }, comoEscena10)
const llegada = (p: number, orden: number): number => 1 - (1 - Math.min(1, Math.max(0, (p - orden * 0.4) / 0.6))) ** 3
afirmar([0, 0.3, 0.5, 0.8, 1].every((p) => Math.abs(llegadaDeLaLetra(p, 0) - llegada(p, 0)) < 1e-12 && Math.abs(llegadaDeLaLetra(p, 1) - llegada(p, 1)) < 1e-12) && /return 1\.0 - pow\( 1\.0 - u, 3\.0 \);/.test(LLEGADA_PARS_GLSL) && /aPivote \+ giroDeLaLetra \* \( transformed - aPivote \) \+ faltaDeLaLetra \* aDesde/.test(LLEGADA_POSICION_GLSL), '  la curva (cúbica, frenando al final) y el recorrido (desde `aDesde`, girando sobre su pivote) son los mismos en JS y en el sombreador')
// La cámara: en ESCENA 10 el título se colocaba 0,0292 de progreso DESPUÉS de terminar de llegar (0,4718 − 0,4426), con
// la cámara orbitando hacia Números: por eso las letras se veían venir desde el fondo. La tabla de RETOQUE PANEL T3 corrió
// el mapeo y la llegada terminó cayendo en 0,4727: con la colocación en 0,4718 venían de frente, cortas.
const pose = (l: Lectura): { readonly angleDeg: number; readonly height: number; readonly distance: number } => ({ ...poseDeLaLectura(l) })
const aprobada = { az: pose(0.4718).angleDeg - pose(0.4426).angleDeg, y: pose(0.4718).height - pose(0.4426).height, d: pose(0.4718).distance - pose(0.4426).distance }
const relacion = (lectura: Lectura): boolean => {
  const colocacion = pose(lectura)
  const fin = pose(LLEGADA_DE_PORTFOLIO.termina)
  return Math.abs(colocacion.angleDeg - fin.angleDeg - aprobada.az) < 1e-9 && Math.abs(colocacion.height - fin.height - aprobada.y) < 1e-9 && Math.abs(colocacion.distance - fin.distance - aprobada.d) < 1e-9
}
afirmar(aprobada.az > 5 && aprobada.y > 1 && relacion(LECTURA.portfolio), 'el título se coloca con la cámara que guarda, con la del final de la llegada de HOY, la relación de ESCENA 10 (la cámara seguía orbitando: 8° de azimut y 1,8 de altura entre terminar de llegar y colocarse)', `aprobada Δaz ${aprobada.az.toFixed(2)}° Δy ${aprobada.y.toFixed(2)} Δd ${aprobada.d.toFixed(2)} · colocación hoy az ${pose(LECTURA.portfolio).angleDeg.toFixed(1)} y ${pose(LECTURA.portfolio).height.toFixed(2)}`)
controlPositivo('el detector VE la colocación de antes (0,4718: hoy, encima de la llegada, con la órbita ya terminada)', 0.4718, relacion)
afirmar(LLEGADA_DE_PORTFOLIO.termina > 0.4426 && LLEGADA_DE_PORTFOLIO.termina < 0.5 && typeof LECTURA.portfolio === 'object' && LECTURA.portfolio.en === LLEGADA_DE_PORTFOLIO.termina, '  y la medida es la de hoy: la llegada termina después de donde terminaba en ESCENA 10 y antes del nudo de Números; la lectura relativa parte de ahí', String(LLEGADA_DE_PORTFOLIO.termina))
const piezasDePortfolio = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
afirmar(/<TituloDeVolumen id="portfolio"[^>]*lectura=\{LECTURA\.portfolio\}[^>]*minimoS=\{LENTOS\.llegadaDePortfolioS\} queda \/>/.test(piezasDePortfolio), '  Portfolio sigue pidiendo esa lectura, su mínimo y quedarse (lo robusto de F2 y A4 lo cubre s45: se da vuelta con el scroll, nunca a medias, converge)')

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · El sonido que no arrancaba: se desbloquea y carga con la primera interacción, y lo mostrado es lo real')

const motorDelSonido = sinComentarios(leer('_lib/sonido/motor.ts'))
const sinSuspension = (c: string): boolean => c.indexOf('Howler.autoSuspend = false') > 0 && c.indexOf('Howler.autoSuspend = false') < c.indexOf('const howl = new Howl(')
afirmar(sinSuspension(motorDelSonido), 'howler ya no suspende el contexto solo a los 30 s (el ambiente generativo no es un sonido suyo y se quedaba mudo con el parlante prendido): `autoSuspend` apagado antes de crear el Howl')
controlPositivo('el detector VE el motor con la suspensión automática', motorDelSonido.replace('Howler.autoSuspend = false', ''), sinSuspension)
afirmar(/if \(ctx !== undefined && ctx\.state !== 'running'\) void ctx\.resume\(\)\.then\(alCambiar, \(\) => undefined\)/.test(motorDelSonido) && /estado: \(\) => \(!cargado \? 'cargando' : Howler\.ctx\?\.state === 'running' \? 'listo' : 'suspendido'\)/.test(motorDelSonido) && /onload: \(\) => \{\s*cargado = true\s*alCambiar\(\)/.test(motorDelSonido) && /Howler\.ctx\.onstatechange = alCambiar/.test(motorDelSonido), '  el motor despierta el contexto suspendido y publica lo real (el archivo cargado y el contexto corriendo), avisando con cada cambio')
const generativo = sinComentarios(leer('_lib/sonido/ambienteGenerativo.ts'))
const despiertaAlPedir = (c: string): boolean => /tocar: \(si\) => \{\s*if \(si && ctx\.state === 'suspended'\) void ctx\.resume\(\)\s*if \(si === suena\) return/.test(c)
afirmar(despiertaAlPedir(generativo), '  pedir que el ambiente suene despierta el contexto aunque ya «sonara»: el reintento de cada segundo lo cura')
controlPositivo('el detector VE el ambiente que vuelve temprano con el contexto parado', generativo.replace("if (si && ctx.state === 'suspended') void ctx.resume()\n", ''), despiertaAlPedir)
const control = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
const cargaConLaPrimera = (c: string): boolean => ["window.addEventListener('pointerdown', cargar, true)", "window.addEventListener('keydown', cargar, true)", "window.addEventListener('wheel', cargar, true)", "window.addEventListener('touchstart', cargar, true)"].every((l) => c.includes(l))
afirmar(cargaConLaPrimera(control), 'guardado como prendido, el motor se carga con la PRIMERA interacción: un toque, una tecla, la rueda o el dedo (antes, sólo un toque o una tecla: quien sólo scrolleaba no oía nada con el parlante prendido)')
controlPositivo('el detector VE el control de antes (sin la rueda)', control.replace("window.addEventListener('wheel', cargar, true)", ''), cargaConLaPrimera)
const despiertaEnCadaAccion = (c: string): boolean => /const despertar = \(\): void => motor\.current\?\.despertar\(\)/.test(c) && ["window.addEventListener('pointerdown', despertar, true)", "window.addEventListener('keydown', despertar, true)", "window.addEventListener('touchend', despertar, true)"].every((l) => c.includes(l)) && ["window.removeEventListener('pointerdown', despertar, true)", "window.removeEventListener('keydown', despertar, true)", "window.removeEventListener('touchend', despertar, true)"].every((l) => c.includes(l))
afirmar(despiertaEnCadaAccion(control), '  y cada acción de verdad despierta el contexto si quedó suspendido (dentro del gesto, como pide Safari), mientras el parlante está prendido')
controlPositivo('el detector VE el control sin despertar', control.replace("window.addEventListener('pointerdown', despertar, true)", ''), despiertaEnCadaAccion)
const estadoMostrado = (c: string): boolean => /const estadoReal = useSyncExternalStore\(suscribirAlMotor, estadoDelMotor, \(\) => 'sin-motor'\)/.test(c) && /data-estado=\{!prendido \? 'apagado' : estadoReal === 'listo' \? 'suena' : 'esperando'\}/.test(c) && /aria-pressed=\{prendido\}/.test(c)
afirmar(estadoMostrado(control), '  lo mostrado coincide con lo real: `aria-pressed` es la elección y `data-estado` lo que pasa (apagado · esperando la primera acción · suena)')
controlPositivo('el detector VE un botón que sólo muestra la elección', control.replace(/ data-estado=\{[^}]*\}/, ''), estadoMostrado)
afirmar(estadoDelMotor() === 'sin-motor' && /export function estadoDelMotor\(\): EstadoDelMotor \{\s*if \(promesa === null\) return 'sin-motor'\s*if \(motorActual === null\) return 'cargando'\s*return motorActual\.estado\(\)/.test(sinComentarios(leer('_chrome/sonido/motorCompartido.ts'))), '  sin motor pedido no hay nada que mostrar (el producto): el estado real sale del motor compartido')

const fuenteDe = (archivo: string): FontData => JSON.parse(readFileSync(`${V3}/_fuentes/${archivo}`, 'utf8')) as FontData

// ═══════════════════════════════════════════════════════════════════════════
titulo('0 · Las llegadas de Portfolio de antes, con bandera (`?pruebas=portfolio=e9|e10|3ds|lejos`): las cifras de cada commit, F2 y la cámara de entonces')

afirmar(PRUEBAS_APAGADAS.portfolio === 'no' && entornoPedido('producto').pruebas.portfolio === 'no' && entornoPedido('producto,portfolio=otra').pruebas.portfolio === 'no' && VARIANTES_DE_PORTFOLIO.every((v) => entornoPedido(`producto,portfolio=${v}`).pruebas.portfolio === v), 'la bandera pide cada una por su nombre; sin ella (o con otro nombre), ninguna: la de hoy queda como predeterminada', VARIANTES_DE_PORTFOLIO.join(' · '))
const piezasConPrueba = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const laDeHoyPorDefecto = (c: string): boolean => /\{variante === 'no' \? \(\s*<TituloDeVolumen id="portfolio" texto=\{CONTENIDO\.titular\} lectura=\{LECTURA\.portfolio\} llegada=\{progresoDeLaMascara\} salida=\{salidaDelTitulo\} llegadaDe=\{seccion\.id\} minimoS=\{LENTOS\.llegadaDePortfolioS\} queda \/>\s*\) : \(\s*<PortfolioDePrueba variante=\{variante\} texto=\{CONTENIDO\.titular\} llegada=\{progresoDeLaMascara\} huida=\{huidaDelTitulo\} llegadaDe=\{seccion\.id\} \/>/.test(c) && /huidaDelTitulo\.set\(huida\.current\)/.test(c)
afirmar(laDeHoyPorDefecto(piezasConPrueba), '  sin la bandera, Portfolio es el de hoy tal cual; con ella, el de la prueba, que se va con la huida del cartel (como entonces)')
controlPositivo('el detector VE la prueba montada siempre', piezasConPrueba.replace("variante === 'no' ?", 'false ?'), laDeHoyPorDefecto)

// Las cifras, escritas acá desde cada commit (la tabla las copia; si alguien las «retoca», esto se pone rojo).
const V = LLEGADAS_DE_PORTFOLIO
const E9 = { desde: [0, -0.3, -3], porAlto: true, vueltas: 0, inclinacion: -84 / 360, dura: 0.5, aparece: 1, pivote: 'base' } as const // 64bb4a96: LLEGADA_3D (giro 84°, subida 0,3, dura 0,5) y TITULOS_3D.profundidad (3 alturas)
const E10 = { desde: [0, 1.2, -16], porAlto: false, vueltas: 1.25, inclinacion: 0.12, dura: 0.6, aparece: 0.35, pivote: 'centro' } as const // eec0b4e3: LLEGADA_DE_LAS_LETRAS
const igualA = (f: FormaDeLaLlegada, h: typeof E9 | typeof E10): boolean => f.desde.every((x, k) => x === h.desde[k]) && f.porAlto === h.porAlto && f.vueltas === h.vueltas && f.inclinacion === h.inclinacion && f.dura === h.dura && f.aparece === h.aparece && f.pivote === h.pivote
afirmar(igualA(V.e9.forma, E9) && V.e9.minimoS === null && V.e9.colocacion === 'pantalla', 'e9 (ESCENA 9 T5, 64bb4a96): acostada 84° hacia atrás sobre su base, 3 alturas de letra atrás y 0,3 abajo, escalonado 0,5, disuelta en toda la llegada, con el scroll (sin mínimo) y pegada a su lugar de la pantalla')
afirmar(igualA(V.e10.forma, E10) && mismaLlegada(V.e10.forma, FORMA_DE_LAS_LETRAS) && V.e10.minimoS === 1.4 && V.e10.salidaMinimaS === 1.4 && V.e10.lectura === 0.4718 && V.e10.colocacion === 'lectura', '  e10 (ESCENA 10 T3, eec0b4e3): 16 em atrás y 1,2 arriba, 1,25 vueltas, inclinación 0,12, escalonado 0,6, 1,4 s, quieta en el mundo colocada con la cámara de 0,4718')
afirmar(igualA(V['3ds'].forma, E10) && V['3ds'].minimoS === V.e10.minimoS && V['3ds'].lectura === V.e10.lectura && V['3ds'].colocacion === V.e10.colocacion, '  3ds (3D Y SONIDO T1, 92d345e8): la misma de ESCENA 10 (ese sprint no tocó ni las cifras ni la cámara)')
afirmar(V.lejos.forma.desde.every((x, k) => x === 2 * E10.desde[k]) && V.lejos.forma.vueltas === E10.vueltas && V.lejos.forma.dura === E10.dura && V.lejos.minimoS !== null && V.lejos.minimoS > 1.4 && V.lejos.lectura === 0.4718, '  lejos: la de ESCENA 10 naciendo el doble de lejos (32 em atrás, 2,4 arriba) y un poco más lenta', `${String(V.lejos.minimoS)} s`)
controlPositivo('el detector VE una e10 con la mitad de distancia', { ...V.e10.forma, desde: [0, 1.2, -8] as const }, (f: FormaDeLaLlegada) => igualA(f, E10))

// Cada forma, su programa: la de siempre no cambia de texto; e9 gira sobre la base.
const conLaDeSiempre = llegadaParsGlsl(FORMA_DE_LAS_LETRAS) === LLEGADA_PARS_GLSL && llegadaNormalGlsl(FORMA_DE_LAS_LETRAS) === LLEGADA_NORMAL_GLSL && llegadaPosicionGlsl(FORMA_DE_LAS_LETRAS) === LLEGADA_POSICION_GLSL
const deE9 = llegadaParsGlsl(V.e9.forma) + llegadaPosicionGlsl(V.e9.forma)
afirmar(conLaDeSiempre && deE9.includes('vec3 pivoteDeLaLetra = vec3( aPivote.x, 0.0, aPivote.z );') && deE9.includes(`orden * ${(0.5).toFixed(5)} ) / ${(0.5).toFixed(5)}`) && deE9.includes(`falta * ${((-84 / 360) * 2 * Math.PI).toFixed(5)}`), 'los sombreadores salen de la forma: con la de siempre, el MISMO texto de antes; e9, con su escalonado, su giro y sobre la base')
const armadoFuente = sinComentarios(leer('_lib/escena/titulos3d/armado.ts'))
afirmar(/const propia = !mismaLlegada\(forma, FORMA_DE_LAS_LETRAS\)/.test(armadoFuente) && /if \(propia\) material\.customProgramCacheKey = \(\) => `titulo-de-volumen-\$\{variante\}\|\$\{forma\.id\}`/.test(armadoFuente), '  una forma distinta de la de siempre es su propio programa (la de e10 y 3ds coincide con la de siempre: el mismo)')
const deTapa = armarElTitulo(new Font(fuenteDe('chivo-400-titulos.json')), 'Po', null, 'letras', [], V.e9.forma).geometria.getAttribute('aDesde')
const deSiempre = armarElTitulo(new Font(fuenteDe('chivo-400-titulos.json')), 'Po', null, 'letras', [], FORMA_DE_LAS_LETRAS).geometria.getAttribute('aDesde')
const zDeLaP = deTapa.getZ(0)
const zDeLaO = deTapa.getZ(deTapa.count - 1)
afirmar(zDeLaP < -1.8 && zDeLaP > -2.4 && zDeLaO > zDeLaP && deSiempre.getZ(0) === -16 && deSiempre.getY(0) === Math.fround(1.2), '  e9 mide la distancia en alturas de cada letra (la «P», más alta, viene de más atrás que la «o»); la de siempre, en em', `P ${zDeLaP.toFixed(2)} · o ${zDeLaO.toFixed(2)} em`)

// Con lo robusto de F2: se dan vuelta con el scroll y al frenar a mitad terminan armadas o desarmadas.
const DT0 = 1 / 60
type SeguidorDeLaPrueba = (m: number, p: number, asentar: boolean, dt: number) => number
const robusta = (f: SeguidorDeLaPrueba): boolean => {
  // Hasta un tercio del camino (la que va con el scroll llega enseguida; la de mínimo, en su tiempo) y el scroll vuelve.
  let m = 0
  for (let t = 0; t < 3 && m < 0.3; t += DT0) m = f(m, 1, false, DT0)
  const antes = m
  const seDaVuelta = antes > 0.02 && antes < 0.98 && f(m, 0, false, DT0) < antes
  let azar = 7
  for (let k = 0; k < 600; k += 1) {
    azar = (azar * 9301 + 49297) % 233280
    m = f(m, azar / 233280, false, DT0)
    if (!(m >= 0 && m <= 1)) return false
  }
  for (let t = 0; t < 4; t += DT0) m = f(m, 0.62, true, DT0)
  return seDaVuelta && (m === 0 || m === 1)
}
const seguidorDe = (minimoS: number | null): SeguidorDeLaPrueba => (m, p, a, dt) => mostradoDelScroll(m, p, a, dt, minimoS)
afirmar(VARIANTES_DE_PORTFOLIO.every((v) => robusta(seguidorDe(V[v].minimoS))), 'las cuatro, con lo robusto de F2: se dan vuelta en el cuadro siguiente, nunca salen de [0, 1] y al frenar a mitad asientan en armado o desarmado del todo')
controlPositivo('el detector VE un seguidor sin asiento (al frenar a mitad queda a mitad)', ((m, p, _a, dt) => mostradoDelScroll(m, p, false, dt, 1.4)) as SeguidorDeLaPrueba, robusta)

// La cámara de entonces: la misma afuera de su tramo; adentro, la de ESCENA 10 en el mismo scroll.
const PARES = PARES_DE_LA_CAMARA
afirmar([0, 0.05, 0.125, 0.625, 0.8, 1].every((p) => comoEntonces(p) === p) && progresoDeLaCamara(0.47) === 0.47, 'sin la bandera la cámara es la de hoy; con ella, la de hoy fuera de Quiénes somos → Trabajos')
afirmar(PARES.every(([h, e]) => Math.abs(comoEntonces(h) - e) < 1e-9), '  en cada scroll medido es la de entonces (los pares de ESCENA 10 contra hoy, a 1440×900)', `${String(PARES.length)} pares`)
const monotona = (f: (p: number) => number): boolean => {
  let previo = f(0)
  for (let p = 0.0005; p <= 1; p += 0.0005) {
    const v = f(p)
    if (!(v > previo) || v - previo > 0.01) return false
    previo = v
  }
  return true
}
afirmar(monotona(comoEntonces), '  y nunca va para atrás ni salta: creciente y continua en todo el recorrido')
controlPositivo('el detector VE una cámara que vuelve atrás', (p: number) => (p > 0.45 && p < 0.46 ? 0.4 : comoEntonces(p)), monotona)
const az = (p: number): number => poseDeLaLectura(p).angleDeg
const barridoHoy = az(0.4713) - az(0.4561)
const barridoEntonces = az(comoEntonces(0.4713)) - az(comoEntonces(0.4561))
afirmar(Math.abs(comoEntonces(0.4713) - 0.4426) < 0.003 && barridoEntonces > 2 * barridoHoy, 'mientras llegan las letras la cámara gira como entonces (el doble que hoy): eso es lo que las hacía venir de lejos', `hoy ${barridoHoy.toFixed(1)}° · entonces ${barridoEntonces.toFixed(1)}°`)
afirmar(/sampleTrack\(track, progresoDeLaCamara\(progress\), target\)/.test(sinComentarios(leer('_lib/escena/OrbitRig.tsx'))), '  sólo la cámara: el rig la muestrea con ese progreso (la luz, la noche y el resto siguen al scroll como hoy)')
const prueba = sinComentarios(leer('_componentes/titulos3d/PortfolioDePrueba.tsx'))
afirmar(/useTituloDeVolumen\(\{ id: 'portfolio', texto, lugar, lectura: v\.lectura, llegada: llegada === null \? null : repetible, salida: huida, forma: v\.forma, colocacion: v\.colocacion, minimoS: v\.minimoS, salidaMinimaS: v\.salidaMinimaS, activo:/.test(prueba), '  el título de la prueba se anota con la forma, la colocación, los tiempos y la huida de su variante (y la llegada repetida de los viajes)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · El parlante: justo encima del infinito, con el ícono animado, el cartel «Sonido / activado» y su anuncio')

// La esquina: una columna fija; el parlante, encima del infinito y centrado con él (antes, a su izquierda en escritorio).
const esquinaDelRecorrido = sinComentarios(leer('_chrome/recorrido/InfinitoDelRecorrido.tsx'))
const parlanteEncima = (c: string): boolean => {
  const columna = c.indexOf('data-pieza="esquina-del-recorrido"')
  const encima = c.indexOf('{encima}')
  const infinito = c.indexOf('data-pieza="infinito-del-recorrido"')
  return columna > 0 && columna < encima && encima < infinito && /data-pieza="esquina-del-recorrido" className="pointer-events-none fixed [^"]*flex-col items-center/.test(c) && /data-pieza="infinito-del-recorrido" aria-hidden="true"/.test(c)
}
afirmar(parlanteEncima(esquinaDelRecorrido), 'la esquina es UNA columna fija: lo que va encima (el parlante), justo encima del infinito y centrado con él; la columna no se come el puntero y el infinito sigue mudo')
controlPositivo('el detector VE el parlante debajo del infinito', esquinaDelRecorrido.replace('{encima}', '').replace('</svg>', '</svg>{encima}'), parlanteEncima)
const chromeDelHome = sinComentarios(leer('_chrome/ChromeDelHome.tsx'))
const claseDe = (c: string, pieza: string): string => new RegExp(`data-pieza="${pieza}"[^>]*?className="([^"]*)"`).exec(c)?.[1] ?? 'no está'
const enLaColumna = (ch: string): boolean => ch.includes('<InfinitoDelRecorrido encima={<SonidoDelHome />} />') && !ch.replace('<InfinitoDelRecorrido encima={<SonidoDelHome />} />', '').includes('<SonidoDelHome />')
const sueltoDeLaEsquina = (c: string): boolean => claseDe(c, 'sonido-de-la-esquina').split(' ').includes('pointer-events-auto') && !/\bfixed\b/.test(claseDe(c, 'sonido-de-la-esquina')) && !/\bfixed\b/.test(claseDe(c, 'control-del-sonido'))
afirmar(enLaColumna(chromeDelHome) && sueltoDeLaEsquina(control), '  el chrome se lo da al infinito (no se ubica solo: ya no hay dos cajas fijas que puedan chocar) y sólo él recibe el puntero')
controlPositivo('el detector VE el parlante suelto de antes (montado aparte)', chromeDelHome.replace('<InfinitoDelRecorrido encima={<SonidoDelHome />} />', '<InfinitoDelRecorrido />\n      <SonidoDelHome />'), enLaColumna)
controlPositivo('el detector VE el botón fijo por su cuenta', control.replace('data-pieza="control-del-sonido"', 'data-pieza="control-del-sonido" className="fixed"'), sueltoDeLaEsquina)

// El ícono: las ondas se dibujan o se cortan (una tras otra), la cruz de siempre al apagarlo; con movimiento reducido, fundidos.
type Icono = (prendido: boolean, suena: boolean, reducido: boolean) => string
const icono: Icono = (prendido, suena, reducido) => renderToStaticMarkup(<IconoDelParlante prendido={prendido} suena={suena} reducido={reducido} />)
const partesDe = (html: string, parte: string): { readonly opacidad: number; readonly trazo: string | null }[] => Array.from(html.matchAll(new RegExp(`<path data-parte="${parte}"[^>]*>`, 'g')), (m) => ({ opacidad: Number(/opacity="([\d.]+)"/.exec(m[0])?.[1] ?? 'NaN'), trazo: /stroke-dasharray="([^"]+)"/.exec(m[0])?.[1] ?? null }))
const asi = (html: string, parte: string, opacidad: number): boolean => {
  const ps = partesDe(html, parte)
  return ps.length === 4 && ps.every((p) => p.opacidad === opacidad && p.trazo === (opacidad === 0 ? '0 1' : '1 1'))
}
const estadosDelIcono = (f: Icono): boolean => asi(f(true, true, false), 'onda', 1) && asi(f(true, true, false), 'cruz', 0) && asi(f(true, false, false), 'onda', ONDAS_EN_ESPERA) && asi(f(false, false, false), 'onda', 0) && asi(f(false, false, false), 'cruz', 1)
afirmar(estadosDelIcono(icono), 'el ícono: sonando, las dos ondas dibujadas; prendido esperando la primera acción, tenues (lo que se ve es lo real); apagado, cortadas y la cruz de siempre', `en espera ${String(ONDAS_EN_ESPERA)}`)
controlPositivo('el detector VE un ícono que apagado no tacha', ((p, s, r) => icono(p, s, r).replace(/data-parte="cruz"([^>]*)opacity="1"/g, 'data-parte="cruz"$1opacity="0"')) as Icono, estadosDelIcono)
const fuenteDelIcono = sinComentarios(leer('_chrome/sonido/IconoDelParlante.tsx'))
const unaTrasOtra = (c: string): boolean => c.includes('d={ONDA_CORTA} {...onda(prendido ? 0 : ESCALON_DE_LAS_ONDAS_S)}') && c.includes('d={ONDA_LARGA} {...onda(prendido ? ESCALON_DE_LAS_ONDAS_S : 0)}') && c.includes('delay: prendido ? 0 : (2 + k) * ESCALON_DE_LAS_ONDAS_S') && c.includes('{ ...TRAZO_DEL_ICONO, delay: demora }')
afirmar(unaTrasOtra(fuenteDelIcono) && ESCALON_DE_LAS_ONDAS_S === 0.08 && TRAZO_DEL_ICONO.duration === 0.3, '  en orden: al prender, la onda corta y 80 ms después la larga; al apagar, la larga primero, la corta y después los dos trazos de la cruz (0,3 s cada trazo)')
controlPositivo('el detector VE las ondas a la vez', fuenteDelIcono.replace('onda(prendido ? ESCALON_DE_LAS_ONDAS_S : 0)', 'onda(0)'), unaTrasOtra)
// Medido en vivo: con el resorte de los íconos (400/15) el largo pasaba por −0,27 al cortar, y un trazo con guiones negativos se dibuja ENTERO.
const sinRebote = (c: string, t: { readonly ease: unknown }): boolean => !/spring|stiffness|damping/.test(c) && t.ease === CURVAS.principal
afirmar(sinRebote(fuenteDelIcono, TRAZO_DEL_ICONO), '  sin resorte: con la curva principal, el largo de cada trazo nunca sale de 0…1 (un tween interrumpido arranca de donde está), así no hay destello ni punta que tiembla')
controlPositivo('el detector VE un trazo con resorte', fuenteDelIcono.replace('{ ...TRAZO_DEL_ICONO, delay: demora }', "{ type: 'spring', stiffness: 400, damping: 15, delay: demora }"), (c: string) => sinRebote(c, TRAZO_DEL_ICONO))
const sinDibujo = (html: string): boolean => !html.includes('stroke-dasharray') && partesDe(html, 'cruz').every((p) => p.opacidad === 1) && partesDe(html, 'onda').every((p) => p.opacidad === 0)
afirmar(sinDibujo(icono(false, false, true)) && fuenteDelIcono.includes('transition: reducido ? { duration: 0 } : { ...TRAZO_DEL_ICONO, delay: demora }') && fuenteDelIcono.includes('stroke="currentColor" strokeWidth={1.5}'), '  con movimiento reducido no se dibuja (aparece y desaparece); el trazo, de 1,5 como los íconos')
controlPositivo('el detector VE el dibujo con movimiento reducido', icono(false, false, false), sinDibujo)

// El cartel: dos líneas encima, cambia con su animación y se va solo; lo que se ve no se anuncia, se anuncia aparte.
const cartelMs = Number(/export const CARTEL_MS = (\d+)/.exec(control)?.[1] ?? 'NaN')
const conCartel = (c: string): boolean => /<AnimatePresence mode="wait">\s*\{cartel && \(\s*<motion\.div\s+key=\{prendido \? 'activado' : 'desactivado'\}\s+data-pieza="cartel-del-sonido"/.test(c) && /<Micro como="span"[^>]*>\s*Sonido\s*<\/Micro>\s*<Micro como="span"[^>]*>\s*\{prendido \? 'activado' : 'desactivado'\}\s*<\/Micro>/.test(c) && /<div aria-hidden="true" className="pointer-events-none absolute bottom-full [^"]*">\s*<AnimatePresence/.test(c) && /const reloj = window\.setTimeout\(\(\) => setCartel\(false\), CARTEL_MS\)\s*return \(\) => window\.clearTimeout\(reloj\)\s*\}, \[cartel, prendido\]\)/.test(c)
afirmar(conCartel(control) && cartelMs >= 1200 && cartelMs <= 2500, 'al tocarlo, un cartel encima en dos líneas, «Sonido» y «activado» o «desactivado»: cambia con su animación (sale uno y entra el otro) y se va solo; otro toque lo renueva', `${String(cartelMs)} ms`)
controlPositivo('el detector VE un cartel que no se va', control.replace('const reloj = window.setTimeout(() => setCartel(false), CARTEL_MS)', 'const reloj = 0'), conCartel)
const conSusMovimientos = (c: string): boolean => /initial=\{reducido \? \{ opacity: 0 \} : \{ opacity: 0, y: 6, scale: 0\.96 \}\}/.test(c) && /exit=\{reducido \? \{ opacity: 0, transition: SALIDA_DEL_CARTEL \} : \{ opacity: 0, y: -4, scale: 0\.98, transition: SALIDA_DEL_CARTEL \}\}/.test(c) && /transition=\{\{ type: 'spring', stiffness: 380, damping: 38, mass: 0\.9 \}\}/.test(c) && /const SALIDA_DEL_CARTEL = \{ duration: 0\.14, ease: CURVAS\.principal \} as const/.test(c)
afirmar(conSusMovimientos(control), '  sube un poco al entrar, con el resorte de la interfaz (380/38/0,9), y se va subiendo en 140 ms (medido: con el resorte también a la salida, el cambio de texto tardaba ~700 ms, con 300 ms sin cartel); con movimiento reducido, sólo fundidos')
controlPositivo('el detector VE el cartel que se mueve con movimiento reducido', control.replace('initial={reducido ? { opacity: 0 } :', 'initial={'), conSusMovimientos)
const anuncia = (c: string): boolean => {
  const region = c.indexOf('<span role="status" data-pieza="anuncio-del-sonido" className="sr-only">')
  return region > 0 && region < c.indexOf('{cartel && (') && /const tocar = \(\): void => \{\s*guardarPrendido\(!prendido\)\s*setCartel\(true\)\s*setAnuncio\(prendido \? 'Sonido desactivado' : 'Sonido activado'\)\s*\}/.test(c) && /onClick=\{tocar\}/.test(c) && /aria-pressed=\{prendido\}/.test(c) && /aria-label="Sonido"/.test(c)
}
afirmar(anuncia(control), '  accesible: el botón dice su estado (`aria-pressed`) y una región viva que está SIEMPRE (no el cartel, que es visual y se desmonta) anuncia «Sonido activado» o «Sonido desactivado» al tocarlo')
controlPositivo('el detector VE un anuncio que sólo existe con el cartel', control.replace('<span role="status" data-pieza="anuncio-del-sonido" className="sr-only">', '').replace('{cartel && (', '{cartel && (<span role="status" data-pieza="anuncio-del-sonido" className="sr-only">'), anuncia)

cerrar('s47-pasada-final')
