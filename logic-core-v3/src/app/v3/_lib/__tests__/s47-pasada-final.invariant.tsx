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
 *        curva cúbica, 1,4 s de mínimo) y la cámara con que se ve ([AJUSTES FINALES] A1: la cámara de ESCENA 10 en ese
 *        tramo y la colocación de entonces, 0,4718; la relación entre las dos la ata s48).
 *   A3 · «Seis razones / para elegirnos»: los tres tramos fijados en pantallas del pin (se arma en 0,6, queda quieta 1,
 *        se va en 0,4), la cámara quieta hasta que termina el tramo quieto, la llegada 3D con el mínimo de ESCENA 10 y el
 *        asiento «armado» (frenar a mitad la termina; subir la desarma), la salida con los 2 s de A5.
 *   A4 · el sonido guardado como prendido arranca solo: el motor se carga con la PRIMERA interacción (la rueda también),
 *        cada acción despierta el contexto, howler no lo suspende solo (el ambiente generativo se quedaba mudo a los
 *        30 s) y el botón muestra lo real (`data-estado`).
 *   0  · las llegadas de Portfolio de antes, con bandera: [AJUSTES FINALES] A1 las borró (Valentino eligió e10, que pasó
 *        al producto: s48).
 *   C1 · el parlante, justo encima del infinito y centrado con él (una sola columna fija en la esquina): el ícono que
 *        dibuja o corta sus ondas, el cartel «Sonido / activado|desactivado» que se va solo y el anuncio aparte.
 *   C2 · el pie llega por columnas (en 3D, desde 1025): el titular, el mail y WhatsApp desde atrás y abajo (las letras
 *        como Portfolio), el formulario como una tapa, lo demás en un fundido escalonado; tres tramos seguidos sobre la
 *        última pantalla, con su mínimo, que asientan por columna (función del scroll, como F2).
 *   C3 · la sombra de los títulos en el piso vivo: [AJUSTES FINALES] A2 la pasó al producto, mejorada (s48); acá queda que
 *        la del logo sigue igual byte por byte.
 *   C4 · Servicios: los nanobots (la nube, el globo de red, los engranajes, el robot con su flujo) en lugar de la torta,
 *        [AJUSTES FINALES] A6 los rehízo macizos y parejos (s48): acá quedan el motor, el traspaso y lo que no cambió.
 *        que queda de respaldo; el traspaso con el disparo del rodillo, por nanobot, con inercia y dispersión; three
 *        perezoso; pausa fuera de pantalla; con movimiento reducido, quieto; en el teléfono, menos.
 *   B  · Tu panel: el caos del nocturno con las demos usables a escala, la rueda que no queda atrapada, el marco que flota,
 *        una sola demo corriendo; y la causa principal de los cuadros perdidos (segunda tanda): ningún `:has()` en la raíz
 *        con algo debajo (la barra se esconde con una marca que pone el formulario de contacto).
 *   D  · la pasada senior: cada arreglo directo con lo que lo fija (desbordes, contraste, foco, tokens, rendimiento).
 *        D10 (la cabeza de Servicios libre del menú) iba con bandera: [AJUSTES FINALES] A5 la pasó al producto (s48).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/pasada-final/mirar.txt`.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'

import { motionValue } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { ESCALON_DE_LAS_ONDAS_S, IconoDelParlante, ONDAS_EN_ESPERA, TRAZO_DEL_ICONO } from '../../_chrome/sonido/IconoDelParlante'
import { MARCA_DEL_CONTACTO_ABIERTO } from '../../_chrome/contacto/FormularioDeContacto'
import { estadoDelMotor } from '../../_chrome/sonido/motorCompartido'
import { ENTRE_MONTAJES_MS, informarVisibilidad, laQueCorre } from '../../_panel-vivo/escenario'
import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS, useTitular2D } from '../../_componentes/titulos3d/titular2d'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { TABLA_DEL_CAOS, TAMANOS } from '../../_secciones/tu-panel/geometria'
import { marcar } from '../../_secciones/_invariantes/render'
import { Hero } from '../../_secciones/hero/Hero'
import { ALTO_DEL_CTA_EN_LISTA_SVH, VENTANA_DE_LA_FRASE, VENTANA_DE_LA_LEVANTADA, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../../_secciones/por-que-develop/geometria'
import { pantallasDe } from '../escena/anclaje'
import { CURVAS } from '../motion/curvas'
import { ACENTOS_DEL_ENJAMBRE, FISICA_DEL_ENJAMBRE, VERTICE_DEL_ENJAMBRE, resorteDelEnjambre, tramoDelEnjambre } from '../nanobots/enjambre'
import { FLUJO } from '../nanobots/robot'
import { CUANTOS_SIMBOLOS, ENGRANAJES, GLOBO, PUNTOS_DEL_ENJAMBRE, radioDelDiente, simbolosDelEnjambre } from '../nanobots/simbolos'
import type { LetraDelPie } from '../pie3d/medida'
import { laEscenaCayo, marcarLaEscenaCaida, suscribirALaCaida } from '../escena/caida'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { GESTOS_DEL_PIE, LIBRE_DEL_PIE_S, TRAMOS_DEL_PIE, apareceDeLaPieza, asientoDelPie, avanceDelPie, deLaPieza, ordenesDelGrupo, poseDeLaPieza, salida, uniformesDelPie, type TramoDelPie, type UniformesDelPie } from '../escena/pie3d/coreografia'
import { armarLaPieza, type FuentesDelPie } from '../escena/pie3d/geometria'
import { materialDelPie } from '../escena/pie3d/material'
import { APLICAR_LA_SOMBRA_GLSL, SOMBRA_DEL_LOGO_GLSL, crearMapaDeLaSombra, materialDelMapa } from '../escena/sombra/delLogo'
import { TINTA_MEDIA_DEL_TEMA, despinteDelTitulo } from '../escena/titulos3d/armado'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { TIEMPOS_DEL_FINAL, progresoDelFinal } from '../escena/finalDelRecorrido'
import { LLEGADA_DE_LAS_LETRAS, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, llegadaDeLaLetra, mostradoDelScroll } from '../escena/titulos3d/llegada'
import { mismaForma } from '../escena/titulos3d/sincronia'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { LECTURA, LLEGADA_DE_PORTFOLIO, type TituloDeVolumen } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { valorDeToken } from './s10-css'
import { LIMITE_DE_LINEAS_DE_CODIGO, lineasDeCodigo } from './s8-largos'

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
// [AJUSTES FINALES] A4 · `vencer` deja el plazo vencido para toda la carga (el `h1` se remonta con la coreografía); la cuenta es la misma.
afirmar(/document\.querySelector\('\[data-escena\] canvas'\) !== null\) reloj = window\.setTimeout\(vencer, desdeElArranque\(RESPALDO_2D_CON_ESCENA_MS\)\)/.test(hook) && /else vencer\(\)/.test(hook) && /desdeElArranque\(RESPALDO_2D_MS\)/.test(hook), '  los dos plazos se cuentan desde el arranque de la página (la misma cuenta que la animación de la hoja)')
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
// La cámara con que se ve: [AJUSTES FINALES] A1 · la de ESCENA 10 en ese tramo y la colocación de entonces (s48 ata la relación).
afirmar(LECTURA.portfolio === 0.4718 && LLEGADA_DE_PORTFOLIO.termina > 0.4426 && LLEGADA_DE_PORTFOLIO.termina < 0.5, 'el título se coloca con la cámara de ESCENA 10 (0,4718), y la medida de dónde termina la llegada hoy sigue siendo la de la tabla de hoy (después de donde terminaba entonces, antes del nudo de Números)', `${String(LECTURA.portfolio)} · termina ${String(LLEGADA_DE_PORTFOLIO.termina)}`)
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
// [AJUSTES FINALES] A3 · la transición del trazo pasó a una constante local (`transicion`: la de siempre, y en espera con el latido de la opacidad): lo que se fija es lo mismo.
afirmar(sinDibujo(icono(false, false, true)) && fuenteDelIcono.includes('transition: reducido ? { duration: 0 } : transicion') && fuenteDelIcono.includes("const transicion = espera ? { ...TRAZO_DEL_ICONO, delay: demora, opacity: LATIDO } : { ...TRAZO_DEL_ICONO, delay: demora }") && fuenteDelIcono.includes('stroke="currentColor" strokeWidth={1.5}'), '  con movimiento reducido no se dibuja ni late (aparece y desaparece); el trazo, de 1,5 como los íconos')
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · La llegada del pie por columnas: atrás (titular, mail, WhatsApp), tapa (formulario), fundido (lo demás) — función del scroll, robusta como F2')

// Los tramos: en orden, sin pisarse (así asienta cada columna), donde cada columna ya se ve, con su mínimo.
const TP = TRAMOS_DEL_PIE
const tramosEnOrden = (ts: readonly TramoDelPie[]): boolean => ts.length === 3 && ts.map((t) => t.llegada).join(',') === 'atras,tapa,fundido' && ts.every((t, k) => t.desde < t.hasta && (k === 0 || Math.abs(t.desde - ts[k - 1].hasta) < 1e-9)) && ts[0].desde >= 0.5 && ts[2].hasta <= 1
// [RETOQUE DEL ENCASTRE] 2B · cambió por pedido: los mínimos, más cortos (1,4 / 0,9 / 0,9 → 0,6 / 0,4 / 0,4 s; s51 2B).
afirmar(tramosEnOrden(TP) && TP[0].desde === 0.56 && TP[0].hasta === 0.8 && TP[1].hasta === 0.92 && TP[2].hasta === 1 && TP[0].minimoS === 0.6 && TP[1].minimoS === 0.4 && TP[2].minimoS === 0.4, 'tres tramos seguidos y sin pisarse sobre la última pantalla, donde cada columna ya se ve (0,56–0,80 · 0,80–0,92 · 0,92–1), con su mínimo (RETOQUE DEL ENCASTRE 2B: 0,6 s la de atrás; 0,4 s las otras)', TP.map((t) => `${t.llegada} ${String(t.desde)}–${String(t.hasta)} ${String(t.minimoS)} s`).join(' · '))
controlPositivo('el detector VE dos tramos que se pisan', TP.map((t, k) => (k === 1 ? { ...t, desde: 0.7 } : t)), tramosEnOrden)

// El seguidor: nunca fuera de 0…1, se da vuelta en el cuadro siguiente, asienta por columna, respeta los mínimos y el orden.
const DTP = 1 / 60
type SeguidorDelPie = (m: number, p: number, asentar: boolean, dt: number, libre?: boolean) => number
const robustoComoF2 = (f: SeguidorDelPie): boolean => {
  let m = 0
  for (let t = 0; t < 0.4; t += DTP) m = f(m, 1, false, DTP)
  const antes = m
  const seDaVuelta = antes > 0.01 && antes < 0.99 && f(m, 0, false, DTP) < antes
  let azar = 11
  for (let k = 0; k < 900; k += 1) {
    azar = (azar * 9301 + 49297) % 233280
    m = f(m, azar / 233280, false, DTP)
    if (!(m >= 0 && m <= 1)) return false
  }
  return seDaVuelta
}
afirmar(robustoComoF2(avanceDelPie), 'lo mostrado persigue al scroll: se da vuelta en el cuadro siguiente y nunca sale de 0…1, con cualquier ida y vuelta')
controlPositivo('el detector VE un seguidor que se pasa de largo', ((m, p, a, dt) => avanceDelPie(m, p, a, dt) * 1.02) as SeguidorDelPie, robustoComoF2)
const asientaPorColumna = (f: SeguidorDelPie): boolean => {
  for (let pedido = 0.4; pedido <= 1; pedido += 0.013) {
    let m = 0
    for (let t = 0; t < 8; t += DTP) m = f(m, pedido, t > 0.5, DTP)
    if (TP.some((t) => m > t.desde + 1e-6 && m < t.hasta - 1e-6)) return false
  }
  return true
}
afirmar(asientaPorColumna(avanceDelPie) && asientoDelPie(0.62) === 0.56 && asientoDelPie(0.88) === 0.92 && asientoDelPie(0.5) === 0.5, '  con el scroll quieto a mitad de un tramo, se asienta en su extremo más cercano: ninguna columna queda a medias (0,62 → se deshace, 0,88 → se completa; fuera de los tramos, lo pedido)')
controlPositivo('el detector VE un seguidor sin asiento', ((m, p, _a, dt) => avanceDelPie(m, p, false, dt)) as SeguidorDelPie, asientaPorColumna)
const cuandoCruza = (f: SeguidorDelPie): number[] => {
  const cruces: number[] = []
  let [m, t] = [0, 0]
  for (const b of [TP[0].desde, TP[0].hasta, TP[1].hasta, TP[2].hasta]) {
    while (m < b - 1e-9 && t < 20) {
      m = f(m, 1, false, DTP)
      t += DTP
    }
    cruces.push(t)
  }
  return cruces
}
const enOrdenYConSuMinimo = (f: SeguidorDelPie): boolean => {
  const [a, b, c, d] = cuandoCruza(f)
  return b - a >= TP[0].minimoS - DTP && c - b >= TP[1].minimoS - DTP && d - c >= TP[2].minimoS - DTP && a < 0.5
}
const [c0, c1, c2, c3] = cuandoCruza(avanceDelPie)
afirmar(enOrdenYConSuMinimo(avanceDelPie), '  un salto al último píxel: las columnas se ven una después de la otra, cada una con su mínimo (nunca llegan de golpe)', `atrás ${(c1 - c0).toFixed(2)} s · tapa ${(c2 - c1).toFixed(2)} s · fundido ${(c3 - c2).toFixed(2)} s`)
controlPositivo('el detector VE un seguidor a una sola velocidad', ((m, p, _a, dt) => m + Math.max(-dt / 0.5, Math.min(dt / 0.5, p - m))) as SeguidorDelPie, enOrdenYConSuMinimo)
let trasElViaje = 1
for (let t = 0; t < LIBRE_DEL_PIE_S + 0.05; t += DTP) trasElViaje = avanceDelPie(trasElViaje, 0, false, DTP, true)
afirmar(trasElViaje === 0 && LIBRE_DEL_PIE_S === 0.5, '  en un viaje del menú se desarma rápido (de punta a punta en medio segundo), y llega con sus tramos al terminar')
const armadasFuente = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
afirmar(/const pedido = enViaje \? 0 : \(PROGRESO_DEL_PIE\.valor\?\.get\(\) \?\? 1\)/.test(armadasFuente) && /c\.mostrado = avanceDelPie\(c\.mostrado, pedido, !enViaje && ahora - c\.cuando > ASIENTO\.quietoMs, dt, enViaje\)/.test(armadasFuente), '  la escena lo avanza cada cuadro con el progreso de la última pantalla (sin pie anotado, todo llegado) y el asiento de F2 (180 ms quieto, sin viaje)')

// Los gestos de cada columna, en el espacio de la pieza (px; y hacia arriba; la cara en z = 0, el cuerpo hacia atrás).
const CAJA = { ancho: 240, alto: 40, espesor: 22 } as const
const M = new THREE.Matrix4()
const punto = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z).applyMatrix4(M)
const normal = (): THREE.Vector3 => new THREE.Vector3(0, 0, 1).applyMatrix3(new THREE.Matrix3().setFromMatrix4(M)).normalize()
poseDeLaPieza('atras', 0, CAJA, false, false, M)
const centroAtras = punto(120, -20, -11)
const desdeAtras = Math.abs(centroAtras.x - 120) < 1e-6 && Math.abs(centroAtras.y - (-20 - 1.2 * 40)) < 1e-6 && Math.abs(centroAtras.z - (-11 - 16 * 40)) < 1e-6
poseDeLaPieza('atras', 1, CAJA, false, false, M)
const atrasLlega = M.equals(new THREE.Matrix4())
afirmar(desdeAtras && atrasLlega && apareceDeLaPieza('atras', 0, false) === 0 && apareceDeLaPieza('atras', 0.35, false) === 1, 'atrás: el mail y WhatsApp salen 16 altos de placa atrás y 1,2 abajo, girados, y llegan a su lugar (disueltos al salir, enteros desde el 35 % de su llegada)', `centro ${centroAtras.toArray().map((v) => v.toFixed(0)).join(', ')}`)
const tapaAcostada = (llegada: 'tapa' | 'fundido'): boolean => {
  poseDeLaPieza(llegada, 0, CAJA, false, false, M)
  const n = normal()
  const bisagra = punto(120, -40, -22)
  const arriba = punto(120, 0, 0)
  return n.y > 0.99 && Math.abs(bisagra.x - 120) < 1e-6 && Math.abs(bisagra.y - (-40 - GESTOS_DEL_PIE.tapa.subida * 40)) < 1e-6 && Math.abs(bisagra.z + 22) < 1e-6 && arriba.z < -30
}
afirmar(tapaAcostada('tapa') && M.equals(new THREE.Matrix4()) === false && (poseDeLaPieza('tapa', 1, CAJA, false, false, M), M.equals(new THREE.Matrix4())), 'tapa: el formulario empieza acostado hacia atrás sobre su canto de abajo (la cara mirando arriba), más abajo, y se levanta hasta quedar de pie', `subida ${String(GESTOS_DEL_PIE.tapa.subida)} altos`)
controlPositivo('el detector VE un formulario que no se acuesta (sube derecho)', 'fundido' as const, tapaAcostada)
poseDeLaPieza('fundido', 0, CAJA, false, false, M)
const fundidoSube = Math.abs(punto(0, 0, 0).y + GESTOS_DEL_PIE.fundido.subida) < 1e-9 && apareceDeLaPieza('fundido', 0, false) === 0 && apareceDeLaPieza('fundido', 1, false) === 1
const quietas = (['atras', 'tapa', 'fundido'] as const).every((l) => (poseDeLaPieza(l, 0.2, CAJA, false, true, M), M.equals(new THREE.Matrix4()))) && (poseDeLaPieza('atras', 0.2, CAJA, true, false, M), M.equals(new THREE.Matrix4()))
afirmar(fundidoSube && quietas && apareceDeLaPieza('atras', 0, true) === 1, 'fundido: aparece subiendo 12 px; con movimiento reducido nada se mueve (sólo se disuelven); el titular no se mueve entero: llega cada letra')
const orden = ordenesDelGrupo([{ x: 500, y: 100 }, { x: 0, y: 300 }, { x: 0, y: 100 }, { x: 900, y: 103 }])
afirmar(orden.join(',') === [1 / 3, 1, 0, 2 / 3].join(',') && deLaPieza(0.5, 0, 0.5) === 1 && deLaPieza(0.5, 1, 0.5) === 0 && salida(0.5) === 1 - 0.5 ** 3, '  escalonadas de arriba abajo y de izquierda a derecha (filas de 8 px), cada pieza con su parte del tramo y la curva cúbica de las letras')

// El titular, letra por letra en el sombreador; un material por pieza con un solo programa; la cara, de la letra quieta.
const shaderDelPie = { uniforms: {} as Record<string, unknown>, vertexShader: '#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>', fragmentShader: '#include <common>\n#include <clipping_planes_fragment>\n#include <color_fragment>' }
const uA = uniformesDelPie()
const matA = materialDelPie(uA)
matA.onBeforeCompile(shaderDelPie as unknown as Parameters<THREE.Material['onBeforeCompile']>[0], {} as THREE.WebGLRenderer)
const programaDelPie = (s: typeof shaderDelPie, u: UniformesDelPie, otro: UniformesDelPie): boolean => s.vertexShader.includes('attribute vec4 aLetraDelPie;') && s.vertexShader.indexOf('vTapaDelPie = step( 0.999, abs( objectNormal.z ) );') < s.vertexShader.indexOf('objectNormal = giroDelPie * objectNormal;') && s.vertexShader.includes('transformed = aLetraDelPie.xyz + giroDelPie * ( transformed - aLetraDelPie.xyz )') && s.fragmentShader.includes('>= vApareceDelPie ) discard;') && s.uniforms.uLetrasDelPie === u.uLetrasDelPie && u.uLetrasDelPie !== otro.uLetrasDelPie && matA.customProgramCacheKey() === 'pie-de-volumen'
afirmar(programaDelPie(shaderDelPie, uA, uniformesDelPie()), 'el titular llega letra por letra en el sombreador (desde atrás y abajo, girando, como Portfolio); cada pieza tiene su material y sus uniformes, con un solo programa; la cara negra se lee de la letra quieta y todo se disuelve con el tramado de los títulos')
controlPositivo('el detector VE dos piezas con los mismos uniformes', uA, (u: UniformesDelPie) => programaDelPie(shaderDelPie, uA, u))
const FUENTES_DEL_PIE: FuentesDelPie = { 400: new Font(fuenteDe('chivo-400-pie.json')), 500: new Font(fuenteDe('chivo-500-pie.json')), 600: new Font(fuenteDe('chivo-600-pie.json')) }
const letraDelPie = (ch: string, x: number): LetraDelPie => ({ ch, x, arriba: 10, alto: 56 * 1.2, cuerpo: 56, peso: 400, enLaTecla: false })
const delTitular = armarLaPieza('texto', { caja: { x: 0, y: 0, ancho: 300, alto: 80, radio: 0 }, letras: [...'Lo'].map((c, k) => letraDelPie(c, k * 34)), trazos: [], pozos: [], tecla: null }, FUENTES_DEL_PIE).fija?.getAttribute('aLetraDelPie')
const deLaPlaca = armarLaPieza('placa', { caja: { x: 0, y: 0, ancho: 120, alto: 34, radio: 0 }, letras: [], trazos: [], pozos: [], tecla: null }, FUENTES_DEL_PIE).hundible?.getAttribute('aLetraDelPie')
afirmar(delTitular !== undefined && delTitular.getW(0) === 0 && delTitular.getW(delTitular.count - 1) === 1 && delTitular.getX(0) < delTitular.getX(delTitular.count - 1) && deLaPlaca !== undefined && deLaPlaca.getW(0) === 0 && deLaPlaca.getX(0) === 0, '  cada vértice del texto lleva su letra (su centro y su orden: la «L» primero, la «o» última); la placa, en cero (llega entera)')

// Lo del DOM: los grupos, por contexto; el progreso de la pantalla; el DOM donde la pieza va a quedar, sin clics hasta que llega.
const cierreC2 = sinComentarios(leer('_secciones/cierre/Cierre.tsx'))
const columnasC2 = sinComentarios(leer('_secciones/cierre/ColumnasDelPie.tsx'))
const registroC2 = sinComentarios(leer('_lib/pie3d/registro.ts'))
const porColumnas = (ci: string): boolean => /<LlegadaDelPie value="atras">\s*<div id=\{idDelTitularDeSeccion\(seccion\.id\)\}>[\s\S]*?<\/div>\s*<ContactoDelPie \/>\s*<\/LlegadaDelPie>/.test(ci) && /useProgresoDelPie\(volumen \? deLaSeccion : null\)/.test(ci) && /<LlegadaDelPie value="tapa">\s*<FormularioDelPie \/>\s*<\/LlegadaDelPie>/.test(columnasC2) && /createContext<LlegadaDeLaPieza>\('fundido'\)/.test(registroC2) && /PIEZAS_DEL_PIE\.set\(id, \{ id, forma, elemento: el, orden, llegada \}\)/.test(registroC2)
afirmar(porColumnas(cierreC2), 'las columnas: el titular, el mail y WhatsApp, atrás; el formulario, tapa; lo demás, fundido (el que no dice nada); la escena lee el progreso de la última pantalla')
controlPositivo('el detector VE el mail fuera de su columna', cierreC2.replace('<ContactoDelPie />\n          </LlegadaDelPie>', '</LlegadaDelPie>\n          <ContactoDelPie />'), porColumnas)
afirmar(/const progreso = volumen \? null : deLaSeccion/.test(cierreC2) && /export const LLEGADAS_DEL_PIE = \{\s*izquierda: \[0\.3, 0\.6\],\s*derecha: \[0\.4, 0\.75\],\s*abajo: \[0\.55, 0\.9\],\s*\} as const/.test(cierreC2), '  abajo de 1025 (el pie plano) no cambia nada: las mismas ventanas del DOM')
// [NOCTURNO FINAL] A4 · el pie ya no proyecta sombra en el piso (lo pide el ticket): lo que va en el piso con la pieza en camino es su caja para el polvo (B4).
const elDomEspera = (c: string): boolean => {
  const [i, s, l] = [c.indexOf('a.viaje.matrix.identity()'), c.indexOf('seguirLaPieza(a, viva, cuadro, izquierda, arriba, s)'), c.indexOf('llegar(a, s)\n')]
  return i > 0 && i < s && s < l && /const tocable = e >= 0\.999/.test(c) && /a\.pieza\.elemento\.style\.pointerEvents = tocable \? '' : 'none'/.test(c) && /escribirLaCaja\(cajas, a\.viaje\.matrixWorld, a\.caja\)/.test(c) && /SOMBRAS_DEL_PIE\.uCuantasSombrasDelPie\.value = 0/.test(c)
}
afirmar(elDomEspera(armadasFuente), '  lo interactivo va donde la pieza va a quedar (con el viaje en cero) y no recibe clics hasta que llegó; la caja del polvo va con la pieza en camino (sombra del pie, ninguna)')
controlPositivo('el detector VE el DOM que viaja con la pieza', armadasFuente.replace('a.viaje.matrix.identity()', '').replace('llegar(a, s)\n', 'llegar(a, s)\n    a.viaje.matrix.identity()\n'), elDomEspera)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C3 · La sombra de los títulos en el piso vivo: [AJUSTES FINALES] A2 la pasó al producto (s48); acá, que la del logo no se tocó')

// La del logo no se tocó: la misma técnica, generalizada, con sus cifras por defecto (huellas tomadas antes del cambio).
const huella = (s: string): string => createHash('sha256').update(s).digest('hex').slice(0, 16)
const mapaDelLogo = crearMapaDeLaSombra()
const desenfoqueDelLogo = mapaDelLogo.desenfoque.escena.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
const materialDelLogo = materialDelMapa()
const huellasDelLogo = [huella(SOMBRA_DEL_LOGO_GLSL), huella(APLICAR_LA_SOMBRA_GLSL), huella(materialDelLogo.vertexShader), huella(materialDelLogo.fragmentShader), huella(desenfoqueDelLogo.material.vertexShader), huella(desenfoqueDelLogo.material.fragmentShader)].join(' ')
afirmar(huellasDelLogo === '4aa416f79b7aa847 b1f90f07d0eb5e67 6d148c00feb63165 39cc5e0d40066745 ff349f9b99ca6ea6 e6cc9d8f63e2778e' && mapaDelLogo.bufer.width === 256 && mapaDelLogo.camara.right === 4.4 && mapaDelLogo.camara.far === 40, 'la sombra del logo, la misma byte por byte (sus sombreadores, su mapa de 256 y su caja): la técnica se generalizó sin moverla')
mapaDelLogo.soltar()

// ═══════════════════════════════════════════════════════════════════════════
titulo('C4 · Servicios: los nanobots que se transforman (la nube, el globo de red, los engranajes, el robot con su flujo), con el disparo del rodillo')

// Los símbolos: n puntos cada uno, siempre los mismos, y cada uno con su forma.
const N4 = 600
const [nubeC4, globoC4, engranajesC4, robotC4] = simbolosDelEnjambre(N4)
const puntosDe = (d: Float32Array): [number, number, number, number][] => Array.from({ length: d.length / 4 }, (_, i) => [d[4 * i], d[4 * i + 1], d[4 * i + 2], d[4 * i + 3]])
const mismos = simbolosDelEnjambre(N4).every((d, k) => d.every((v, i) => v === [nubeC4, globoC4, engranajesC4, robotC4][k][i]))
// [AJUSTES FINALES] A6 · `w` llega a 5 (las capas del robot); las coordenadas, dentro del espacio de −1 a 1.
afirmar([nubeC4, globoC4, engranajesC4, robotC4].every((d) => d.length === N4 * 4 && d.every((v, i) => Number.isFinite(v) && (i % 4 === 3 ? v >= 0 && v < 5 : Math.abs(v) < 1.1))) && mismos && CUANTOS_SIMBOLOS === 4, 'cuatro símbolos de exactamente n nanobots cada uno (cada nanobot tiene un lugar en cada uno), los mismos en cada carga')
// [AJUSTES FINALES] A6 · el globo se rehízo limpio, sin los nodos ni las conexiones al azar: acá queda que la red sigue sobre la esfera (lo demás, en s48 A6).
const enLaEsferaC4 = puntosDe(globoC4).every((p) => Math.abs(Math.hypot(p[0], p[1], p[2]) - GLOBO.radio) < 0.03)
const aroC4 = puntosDe(globoC4).filter((p) => p[3] > 0.5)
afirmar(enLaEsferaC4 && aroC4.length > 0 && aroC4.every((p) => Math.abs(p[2] - GLOBO.aro.z) < 1e-6), 'web: un globo de red (meridianos y paralelos sobre la esfera, y el aro de la silueta, también sobre ella: donde la mirada la toca)', `${String(aroC4.length)} en el aro`)
const [gA, gB] = [ENGRANAJES.a, ENGRANAJES.b]
const encajan = Math.abs(Math.hypot(gB.centro[0] - gA.centro[0], gB.centro[1] - gA.centro[1]) - (gA.primitivo + gB.primitivo)) < 1e-9 && ENGRANAJES.razon === gA.dientes / gB.dientes
const deCadaUno = puntosDe(engranajesC4).every((p) => {
  const c = p[3] < 0.5 ? gA : gB
  return Math.hypot(p[0] - c.centro[0], p[1] - c.centro[1]) <= c.punta + 0.02
})
afirmar(encajan && deCadaUno && Math.abs(radioDelDiente(gA, gA.fase + (0.25 * 2 * Math.PI) / gA.dientes) - gA.punta) < 1e-9 && Math.abs(radioDelDiente(gA, gA.fase + (0.75 * 2 * Math.PI) / gA.dientes) - gA.pie) < 1e-9, 'software: dos engranajes que encajan (sus círculos primitivos tangentes, 12 y 8 dientes: el chico gira 1,5 veces más rápido y al revés), cada nanobot en el suyo', `${String(gA.dientes)}:${String(gB.dientes)}`)
// [AJUSTES FINALES] A6 · el robot se rehízo (habla por un globo de diálogo; el flujo es de anillos, con bifurcación): las capas de `w` son las de `robot.ts` (s48 A6 mide la forma).
const flujoC4 = puntosDe(robotC4).filter((p) => p[3] >= 3)
const robotSolo = puntosDe(robotC4).filter((p) => p[3] < 1)
// [CIERRE] 2A · el flujo ya no sale de la cabeza en diagonal: es una figura aparte, horizontal, debajo del robot (s49 2A).
const debajoDelRobot = flujoC4.length > 0 && flujoC4.every((p) => p[1] < 0 && p[3] < 5) && robotSolo.every((p) => p[0] < 0 && p[1] > 0.1)
afirmar(debajoDelRobot && FLUJO.nodos.every(([x], k) => k === 0 || x > FLUJO.nodos[0][0]), 'IA y automatización: el robot del chatbot (cabeza, antena, ojos, boca) a la izquierda y su flujo de nodos conectados, aparte y debajo, de izquierda a derecha (con su recorrido, para el pulso)')
const sombreadorC4 = VERTICE_DEL_ENJAMBRE
afirmar(ACENTOS_DEL_ENJAMBRE.web === '#06b6d4' && ACENTOS_DEL_ENJAMBRE.ia === '#10b981' && ACENTOS_DEL_ENJAMBRE.automatizacion === '#f59e0b' && ACENTOS_DEL_ENJAMBRE.software === '#8b5cf6' && sombreadorC4.includes('return d.w < 3.00000 ? uColores[ 3 ] : uColores[ 4 ];'), '  con los acentos de marca (web, software, IA; el flujo, el de automatización) y el color pasa de uno al otro con el avance')

// El traspaso: con el disparo del rodillo, por nanobot, con inercia y dispersión; nunca un fundido.
const tramos4 = [0, 0.5, 1, 1.5, 2.25, 3].map((p) => tramoDelEnjambre(p, false))
afirmar(tramos4[0].desde === 0 && tramos4[0].avance === 1 && tramos4[1].desde === 0 && tramos4[1].hacia === 1 && tramos4[1].avance === 0.5 && tramos4[2].desde === 1 && tramos4[2].hacia === 1 && tramos4[4].desde === 2 && tramos4[4].hacia === 3 && Math.abs(tramos4[4].avance - 0.25) < 1e-9 && tramos4[5].desde === 3 && tramos4[5].avance === 1, 'de qué símbolo a cuál y cuánto sale de la posición disparada del rodillo: posada en un entero, quieta en ese símbolo; en el medio, el traspaso')
const conReducido = (f: typeof tramoDelEnjambre): boolean => [0.2, 0.49, 0.51, 1.7, 2.6].every((p) => {
  const t = f(p, true)
  return t.desde === t.hacia && t.avance === 1
})
afirmar(conReducido(tramoDelEnjambre) && tramoDelEnjambre(0.4, true).desde === 0 && tramoDelEnjambre(0.6, true).desde === 1 && sombreadorC4.includes('float t = uTiempo * ( 1.0 - uQuieto );'), '  con movimiento reducido, el símbolo quieto: sin reloj y el cambio de golpe (el más cercano)')
controlPositivo('el detector VE un traspaso con movimiento reducido', ((p: number) => tramoDelEnjambre(p, false)) as typeof tramoDelEnjambre, conReducido)
const conInercia = (r: (t: number) => number): boolean => {
  const muestras = Array.from({ length: 401 }, (_, k) => r(k / 400))
  const pico = Math.max(...muestras)
  return r(0) === 0 && r(1) === 1 && Math.min(...muestras) >= 0 && pico > 1.05 && pico < 1.15
}
afirmar(conInercia(resorteDelEnjambre) && FISICA_DEL_ENJAMBRE.retraso === 0.4 && FISICA_DEL_ENJAMBRE.dispersion > 0, 'cada nanobot sale con su retraso, viaja con un resorte que se pasa un 10 % y vuelve (la inercia) y llega exacto', `pico ${Math.max(...Array.from({ length: 401 }, (_, k) => resorteDelEnjambre(k / 400))).toFixed(3)}`)
controlPositivo('el detector VE un traspaso sin inercia (una curva que no se pasa)', (t: number) => Math.min(1, Math.max(0, 1 - (1 - t) ** 3)), conInercia)
const morphEnLaGpu = (s: string): boolean => s.includes('float u = clamp( ( uAvance - aAzar.x * ') && s.includes('vec3 p = mix( vivo( uDesde, dA, t ), vivo( uHacia, dB, t ), e );') && s.includes('p += ( aAzar.yzw * 2.0 - 1.0 ) * ') && s.includes('* sin( 3.14159265 * u );') && !/alpha|opacity|vAlfa \* uAvance/.test(s.replace('float a = smoothstep', ''))
afirmar(morphEnLaGpu(sombreadorC4), '  el morph es del sombreador: de los destinos de un símbolo a los del otro, desparramándose a mitad de camino y recogiéndose al llegar — se desarman y se arman, nunca un fundido')
controlPositivo('el detector VE un fundido entre símbolos', `${sombreadorC4}\nvAlfa = vAlfa * uAvance;`.replace('vAlfa = vAlfa * uAvance;', 'vAlfa * uAvance'), morphEnLaGpu)
afirmar(sombreadorC4.includes('p.xz = girar( p.xz, t * 0.35 );') && sombreadorC4.includes(`float a = d.w < 0.5 ? t * 0.6 : - t * 0.6 * ${ENGRANAJES.razon.toFixed(5)};`) && sombreadorC4.includes('float cerca = 3.0 / ( 3.0 - p.z );') && sombreadorC4.includes('vAlfa = mix( 0.38, 1.0, clamp( ( p.z + 1.0 ) * 0.5, 0.0, 1.0 ) )'), '  vivos: el globo gira, los engranajes giran cada uno sobre su centro (al revés y en su razón), el flujo lleva un pulso; la profundidad agranda lo cercano y apaga lo lejano')

// En la página: con el disparo de siempre, la torta de respaldo, three perezoso, pausa fuera de pantalla, menos en el teléfono.
const panelC4 = sinComentarios(leer('_secciones/servicios/ServiciosEnSecuencia.tsx'))
const angostoC4 = sinComentarios(leer('_secciones/servicios/angosto.tsx'))
const graficoC4 = sinComentarios(leer('_secciones/servicios/GraficoDeServicios.tsx'))
const montajeC4 = sinComentarios(leer('_lib/nanobots/montaje.ts'))
const enganchado = (p: string, a: string, g: string): boolean => p.includes('<GraficoDeServicios progreso={progreso} medida={medida} posicion={posicion} puntos={PUNTOS_DEL_ENJAMBRE.ancho} />') && a.includes('<GraficoDeServicios progreso={progreso} medida={medida} posicion={posicion} puntos={PUNTOS_DEL_ENJAMBRE.angosto} />') && (p.match(/useEstadoDisparado\(/g) ?? []).length === 1 && !/\banimate\(|setTimeout|setInterval/.test(g + montajeC4) && montajeC4.includes('enjambre.dibujar((performance.now() - t0) / 1000, posicion.get(), quieto.current)')
afirmar(enganchado(panelC4, angostoC4, graficoC4), 'se engancha a la posición disparada que ya existe (el mismo `MotionValue` que el rodillo y el CTA, UN disparo): ningún reloj propio para el traspaso')
controlPositivo('el detector VE un traspaso con su propio reloj', graficoC4 + '\nanimate(posicion, 1)', (g: string) => enganchado(panelC4, angostoC4, g))
const respaldoYPerezoso = (g: string): boolean => /\{!listos && <GraficoDeTorta progreso=\{progreso\} medida=\{medida\} posicion=\{posicion\} \/>\}/.test(g) && /void import\('\.\.\/\.\.\/_lib\/nanobots\/enjambre'\)/.test(g) && !/from '\.\.\/\.\.\/_lib\/nanobots\/enjambre'|from 'three'/.test(g.replace("import type", '')) && !/from 'three'/.test(montajeC4)
afirmar(respaldoYPerezoso(graficoC4) && PUNTOS_DEL_ENJAMBRE.ancho === 3000 && PUNTOS_DEL_ENJAMBRE.angosto < PUNTOS_DEL_ENJAMBRE.ancho, 'la torta queda de respaldo (sale del servidor y vuelve sin WebGL o si se pierde el contexto); three llega perezoso (no entra al paquete de la página); en el teléfono, menos nanobots', `${String(PUNTOS_DEL_ENJAMBRE.ancho)} · ${String(PUNTOS_DEL_ENJAMBRE.angosto)}`)
controlPositivo('el detector VE three importado de entrada', `import { crearEnjambre } from '../../_lib/nanobots/enjambre'\n${graficoC4}`, respaldoYPerezoso)
const pausaFuera = (m: string): boolean => /if \(!visible \|\| pausado \|\| document\.visibilityState !== 'visible'\) return/.test(m) && /new IntersectionObserver\(\(entradas\) => \{\s*visible = entradas\.some\(\(e\) => e\.isIntersecting\)/.test(m) && /lienzo\.addEventListener\('webglcontextlost', perdido\)/.test(m)
afirmar(pausaFuera(montajeC4), '  pausa fuera de pantalla (y con la pestaña oculta): el lazo sólo corre con el gráfico a la vista (medido: 0 cuadros en un segundo fuera de pantalla)')
controlPositivo('el detector VE un lazo que no para', montajeC4.replace("if (!visible || pausado || document.visibilityState !== 'visible') return", 'if (pausado) return'), pausaFuera)

/** Los `.ts`/`.tsx` de una carpeta, con sus subcarpetas. */
const archivosDe = (dir: string): string[] => readdirSync(dir).flatMap((a) => (statSync(`${dir}/${a}`).isDirectory() ? archivosDe(`${dir}/${a}`) : /\.tsx?$/.test(a) ? [`${dir}/${a}`] : []))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B · Tu panel: el caos del nocturno con las demos usables, el marco que flota, y una sola demo corriendo')

// B1 · la distribución (la tabla, los tamaños y el barrido los fija s6-tu-panel §6-§7); acá, lo que cruza carpetas.
afirmar(Object.values(TAMANOS).every((t) => t.ancho >= 42 && t.ancho < 60) && TABLA_DEL_CAOS.length === 8, 'ningún módulo a lo ancho: las ocho features van del 42 al 56 % del ancho útil (más chicas que las del retoque, más grandes que las del nocturno)', Object.values(TAMANOS).map((t) => String(t.ancho)).join(' · '))
const cargador = sinComentarios(leer('_panel-vivo/DemoDelPanel.tsx'))
// [NOCTURNO FINAL] C2 · en escritorio, la pantalla natural (como antes); abajo de 1024, la angosta de su tarjeta (`pantallaAngosta`), también a escala.
const escalada = (c: string): boolean => /style=\{escalada \? \{ width: dibujo\.pantalla\.ancho, height: dibujo\.pantalla\.alto, transform: `scale\(\$\{dibujo\.escala\.toFixed\(4\)\}\)` \} : undefined\}/.test(c) && /const enUso = escritorio \? pantalla : pantallaAngosta\(el\.clientWidth\)\s*setDibujo\(\{ pantalla: enUso, escala: el\.clientWidth \/ enUso\.ancho \}\)/.test(c)
afirmar(escalada(cargador), '  adentro de cada tarjeta el panel se dibuja a su pantalla natural (abajo de 1024, a la angosta de su tarjeta) y se escala con `transform` al ancho de la tarjeta (se ve entero, se usa ahí mismo)')
controlPositivo('el detector VE una demo dibujada al tamaño de la tarjeta (sin escala)', cargador.replace('transform: `scale(${dibujo.escala.toFixed(4)})`', 'transform: undefined'), escalada)
controlPositivo('el detector VE la pantalla angosta también en escritorio', cargador.replace('const enUso = escritorio ? pantalla : pantallaAngosta(el.clientWidth)', 'const enUso = pantallaAngosta(el.clientWidth)'), escalada)
const rueda = sinComentarios(leer('_panel-vivo/rueda.ts'))
const marco = sinComentarios(leer('_panel-vivo/MarcoDelPanel.tsx'))
const ruedaAdentro = (r: string, m: string): boolean =>
  /const puede = e\.deltaY > 0 \? el\.scrollTop \+ el\.clientHeight < el\.scrollHeight - 1 : e\.deltaY < 0 \? el\.scrollTop > 0 : false/.test(r) &&
  /if \(puede\) el\.setAttribute\('data-lenis-prevent', ''\)\s*else el\.removeAttribute\('data-lenis-prevent'\)/.test(r) &&
  /el\.addEventListener\('wheel', decidir, \{ capture: true, passive: true \}\)/.test(r) &&
  /const contenido = useRuedaAdentro<HTMLDivElement>\(\)/.test(m) &&
  /<div ref=\{contenido\} data-parte="contenido-del-panel"/.test(m) &&
  !/data-lenis-prevent=""/.test(m)
afirmar(ruedaAdentro(rueda, marco), '  la rueda scrollea adentro sólo con el puntero encima y mientras haya recorrido: `data-lenis-prevent` se decide en cada rueda, antes de que Lenis la vea; en el borde, la rueda es de la página')
controlPositivo('el detector VE el contenido del panel que secuestraba la rueda (el atributo fijo)', [rueda, marco.replace('<div ref={contenido} data-parte="contenido-del-panel"', '<div data-parte="contenido-del-panel" data-lenis-prevent=""')] as const, ([r, m]: readonly [string, string]) => ruedaAdentro(r, m))
afirmar(/const textoDelDetalle = useRuedaAdentro<HTMLDivElement>\(\)/.test(sinComentarios(leer('_panel-vivo/demos/servicios/Servicios.tsx'))), '  y el detalle de un módulo (que vive encima del marco) también')

// B2 · el marco que flota (las clases las fija s6-tu-panel §9); la prueba de los bordes se borró.
afirmar(!existsSync(`${V3}/_secciones/tu-panel/borde.ts`) && !('panelBorde' in PRUEBAS_APAGADAS) && !/panelborde/.test(sinComentarios(leer('_lib/escena/entorno.ts'))), 'las variantes `panelborde=a|b` se borraron: el marco es un módulo con esquinas y sombra, sin halo ni fundido')

// B3 · una sola demo corriendo, congeladas las demás, montaje escalonado, `contain`, sin desenfoques.
informarVisibilidad('demo-a', 0.4)
informarVisibilidad('demo-b', 0.9)
const correLaB = laQueCorre() === 'demo-b'
informarVisibilidad('demo-a', 0.9)
const sigueLaB = laQueCorre() === 'demo-b'
informarVisibilidad('demo-b', 0)
const pasaALaA = laQueCorre() === 'demo-a'
informarVisibilidad('demo-a', 0)
afirmar(correLaB && sigueLaB && pasaALaA && laQueCorre() === null, 'corre la demo más visible; con empate sigue la que corría; al irse, pasa a la otra; sin ninguna a la vista, ninguna', `${String(correLaB)} · ${String(sigueLaB)} · ${String(pasaALaA)}`)
const unaSola = (c: string): boolean => /const laMasVisible = useSyncExternalStore\(suscribirAlEscenario, \(\) => laQueCorre\(\) === demo, \(\) => false\)/.test(c) && /const corre = laMasVisible && pestana && !pausada && !reducido/.test(c) && /threshold: FRACCIONES/.test(c) && /informarVisibilidad\(demo, 0\)/.test(c)
afirmar(unaSola(cargador), '  cada demo informa qué fracción de sí está en cuadro y corre sólo si es la más visible (al desmontarse, se olvida)')
controlPositivo('el detector VE las demos de antes (todas las que estaban a la vista corrían)', cargador.replace('const corre = laMasVisible && pestana && !pausada && !reducido', 'const corre = pestana && !pausada && !reducido'), unaSola)
afirmar(/const CONGELADA = '\[&_\*\]:\[animation-play-state:paused\]'/.test(cargador) && /\$\{corre \? '' : ` \$\{CONGELADA\}`\}/.test(cargador), '  las que no corren quedan congeladas: sus animaciones de CSS (latidos, giros) se pausan')
afirmar(/cancelarElTurno = montarEnTurno\(\(\) => setMontada\(true\)\)/.test(cargador) && ENTRE_MONTAJES_MS >= 100 && /const cuando = Math\.max\(ahora, ultimoMontaje \+ ENTRE_MONTAJES_MS\)/.test(sinComentarios(leer('_panel-vivo/escenario.ts'))), `  el montaje es escalonado: las que se acercan juntas se montan de a una, con ${String(ENTRE_MONTAJES_MS)} ms entre cada una`)
const conBlur = archivosDe(`${V3}/_panel-vivo/demos`).filter((a) => /\bblur-\[|backdrop-blur/.test(sinComentarios(readFileSync(a, 'utf8'))))
afirmar(conBlur.length === 0, '  ninguna demo lleva un desenfoque (`blur-[…]`, `backdrop-blur`): los brillos son degradés radiales', conBlur.join(' · ') || 'ninguna')
afirmar(/contain-layout contain-paint/.test(sinComentarios(leer('_secciones/tu-panel/Tarjeta.tsx'))), '  el marco aísla el layout y la pintura de la demo (`contain`): lo que pasa adentro no le cuesta a la página')

// B3 (segunda tanda) · la causa principal a ×1: un `:has()` en la raíz con algo debajo (medido con la traza de Chrome).
const HOJAS_V3 = readdirSync(`${V3}/_estilos`).filter((a) => a.endsWith('.css')).map((a) => `_estilos/${a}`)
const conHasEnLaRaiz = (css: string): string[] => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[},])\s*((?:html|body|\[data-v3\])(?:\[[^\]]*\]|\.[\w-]+|:[\w-]+)*:has\([^{}]*?\)\s*[^{},\s][^{},]*)\{/g)].map((m) => m[1].trim())
// Exclusión con su motivo: `navegacion.css` es la pieza compartida de la galería (s39 la fija byte por byte desde b3e2dc31);
// su regla del contacto no se monta en el home (no hay `[data-pieza="navegacion"]`) y, medido, no cuesta (2 y 1 por pasada).
const EXCLUIDAS_DEL_HAS = new Set(['_estilos/navegacion.css'])
const peligrosas = HOJAS_V3.filter((h) => !EXCLUIDAS_DEL_HAS.has(h)).flatMap((h) => conHasEnLaRaiz(leer(h)).map((r) => `${h}: ${r}`))
afirmar(peligrosas.length === 0 && HOJAS_V3.length > 5, 'ninguna hoja de /v3 pone un `:has()` en la raíz (html, body, [data-v3]) con algo debajo: Chrome recalcula la página ENTERA ante cualquier nodo nuevo (era la causa de los ~25 cuadros perdidos por pasada en Tu panel: el número del infinito, 5437 elementos, 28 ms)', peligrosas.join(' · ') || `${String(HOJAS_V3.length)} hojas`)
controlPositivo('el detector VE la regla de antes de la barra', '[data-v3]:has([data-pieza="contacto"]) [data-pieza="barra"] > [data-parte="pastilla"] { opacity: 0; }', (css: string) => conHasEnLaRaiz(css).length === 0)
afirmar(conHasEnLaRaiz('html:has([data-v3]) { scroll-padding-top: 1px; }').length === 0 && conHasEnLaRaiz('[data-v3] [data-pieza="libro"]:has(+ [data-pieza="libro"]:hover) > [data-parte="cara"] { }').length === 0, '  (no cuentan un `:has()` que sólo estiliza a la raíz misma, como el `scroll-padding` de html, ni uno de una pieza de adentro)')
const formularioB3 = sinComentarios(leer('_chrome/contacto/FormularioDeContacto.tsx'))
const conLaMarca = (f: string, barra: string): boolean => /const v3 = raiz\.current\?\.closest\('\[data-v3\]'\) \?\? null\s*v3\?\.setAttribute\(MARCA_DEL_CONTACTO_ABIERTO, ''\)\s*return \(\) => v3\?\.removeAttribute\(MARCA_DEL_CONTACTO_ABIERTO\)/.test(f) && /<div ref=\{raiz\} data-pieza="contacto"/.test(f) && barra.includes('[data-v3][data-contacto-abierto] [data-pieza="barra"] > [data-parte="pastilla"] {') && MARCA_DEL_CONTACTO_ABIERTO === 'data-contacto-abierto'
afirmar(conLaMarca(formularioB3, leer('_estilos/barra.css')), '  la barra se sigue escondiendo con el formulario abierto (también en su salida): el formulario pone la marca en la raíz al montarse y la saca al desmontarse (medido en vivo: abierto y saliendo, marca y pastilla en 0; cerrado, sin marca y en 1)')
controlPositivo('el detector VE un formulario que no saca la marca', formularioB3.replace('return () => v3?.removeAttribute(MARCA_DEL_CONTACTO_ABIERTO)', 'return undefined'), (f: string) => conLaMarca(f, leer('_estilos/barra.css')))

// ═══════════════════════════════════════════════════════════════════════════
titulo('D · La pasada senior: lo que se arregló directo, cada cosa con lo que la fija')

// D1 · los 6 px de más en Trabajos a 1440: el margen del recorte del túnel (para los anillos de foco) se escapaba del cuadro.
const trabajosD = sinComentarios(leer('_secciones/trabajos/Trabajos.tsx'))
const bloqueRecortado = (c: string): boolean => {
  const bloque = /animada: \{[\s\S]*?bloque: '([^']*)'/.exec(c)?.[1] ?? ''
  return bloque.split(' ').includes('overflow-x-clip') && !bloque.includes('max-escritorio:overflow-x-clip')
}
afirmar(bloqueRecortado(trabajosD) && /overflowClipMargin: `\$\{MARGEN_DEL_RECORTE_PX\}px`/.test(sinComentarios(leer('_secciones/trabajos/CapaDelTunel.tsx'))), 'Trabajos recorta a lo ancho en todos los anchos (no sólo abajo de 1024): el túnel sigue pintando sus anillos de foco con su margen, y lo que ese margen deja afuera del cuadro ya no ensancha la página (medido: el documento mide lo que la ventana a 1440, 1024 y 390, en todo el recorrido; antes, 1446 a 1440)')
controlPositivo('el detector VE el recorte sólo en el teléfono', trabajosD.replace("'relative h-full w-full overflow-x-clip max-escritorio:sticky", "'relative h-full w-full max-escritorio:overflow-x-clip max-escritorio:sticky"), bloqueRecortado)


// D2 · el tachado 3D de «lo mismo de siempre» se despinta como el del DOM (de la tinta a la tinta media), con su avance.
const titularD2 = sinComentarios(leer('_secciones/quienes-somos/titular3d.tsx'))
const armadoD2 = sinComentarios(leer('_lib/escena/titulos3d/armado.ts'))
const escenaD2 = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const tachadoQueDespinta = (t: string): boolean => /\[\{ medir: rayaDelTrazo, nace: 'punta', avance, despinta: renglon\.tipo === 'tachado' \}\]/.test(t)
afirmar(tachadoQueDespinta(titularD2) && TINTA_MEDIA_DEL_TEMA.toLowerCase() === valorDeToken('--color-tinta-media').toLowerCase(), 'el tachado despinta su título (sólo el tachado, como en el DOM), hacia la tinta media del tema (el mismo valor que el token)', TINTA_MEDIA_DEL_TEMA)
controlPositivo('el detector VE el tachado que no despinta', titularD2.replace(", despinta: renglon.tipo === 'tachado'", ''), tachadoQueDespinta)
const tituloConTrazos = (trazos: readonly { readonly avance: number; readonly despinta?: boolean }[]): TituloDeVolumen => ({ trazos: trazos.map((t) => ({ medir: () => null, nace: 'punta' as const, avance: motionValue(t.avance), despinta: t.despinta })) }) as unknown as TituloDeVolumen
afirmar(despinteDelTitulo(tituloConTrazos([{ avance: 0.6, despinta: true }])) === 0.6 && despinteDelTitulo(tituloConTrazos([{ avance: 0.8 }])) === 0 && despinteDelTitulo(tituloConTrazos([{ avance: 1.4, despinta: true }])) === 1 && despinteDelTitulo(tituloConTrazos([])) === 0, '  con el MISMO avance que dibuja la raya (acotado de 0 a 1); un subrayado no despinta nada')
const conElDespinte = (a: string, e: string): boolean => a.includes(".replace('#include <common>', '#include <common>\\nuniform float uDespinte;')") && a.includes('${costadoDeDiaGlsl(EMISION_EN_LA_NOCHE)}\\n${DESPINTE_GLSL}') && /const DESPINTE_GLSL = `\\tdiffuseColor\.rgb = mix\( diffuseColor\.rgb, vec3\( \$\{despintado\.r\.toFixed\(5\)\}, \$\{despintado\.g\.toFixed\(5\)\}, \$\{despintado\.b\.toFixed\(5\)\} \), uDespinte \);`/.test(a) && (e.match(/a\.uniforms\.uDespinte\.value = despinteDelTitulo\(a\.titulo\)/g) ?? []).length === 2
afirmar(conElDespinte(armadoD2, escenaD2), '  el negro mezcla sus letras (y su raya) hacia ese gris con el despinte, que la escena escribe en cada cuadro (en los dos caminos: el que se queda y el que va con el scroll) — medido en vivo: tachado entero, «lo mismo de siempre» queda gris y «no» negro, como en el DOM')
controlPositivo('el detector VE la escena que no escribe el despinte', escenaD2.replace('a.uniforms.uDespinte.value = despinteDelTitulo(a.titulo)', ''), (e: string) => conElDespinte(armadoD2, e))


// D3 · Por qué develOP sin valores escritos a mano (s6-tokens fallaba desde FINAL 3: un `70svh` y una grilla `auto 1fr`).
const porQueD3 = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const sinAMano = (c: string): boolean => !/\b70svh\b|grid-rows-\[auto_1fr\]/.test(c) && /<div data-pieza="cta-del-final" style=\{ESTILO_DE_LA_LISTA\} className="flex min-h-\[var\(--alto-del-cta-en-lista\)\]/.test(c) && (c.match(/<div className="@container min-h-0 flex-1">/g) ?? []).length === 2
afirmar(sinAMano(porQueD3) && ALTO_DEL_CTA_EN_LISTA_SVH === 70, 'el alto del CTA de la lista sale de la geometría (70 svh, como era) y las columnas de valores son flex (el ancho de la frase arriba y el contenedor, el resto): s6-tokens vuelve a verde (medido: columnas de 626 px de alto con su contenedor entero a 1440; CTA de 590,8 px a 390×844)')
controlPositivo('el detector VE el 70svh escrito a mano', porQueD3.replace('min-h-[var(--alto-del-cta-en-lista)]', 'min-h-[70svh]'), sinAMano)


// D4 · los libros de la biblioteca: el hover y el foco en la misma regla (la paridad de s3-foco), sin perder el foco sin hover.
const demosD4 = leer('_estilos/demos.css').replace(/\/\*[\s\S]*?\*\//g, '')
const libroConParidad = (css: string): boolean => {
  const dentro = /@media \(hover: hover\) \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
  const afuera = css.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')
  return (dentro.match(/:is\(:hover, :focus-visible\)/g) ?? []).length === 4 && !/libro"\]:hover/.test(dentro) && (afuera.match(/\[data-pieza="libro"\]:focus-visible|:has\(\+ \[data-pieza="libro"\]:focus-visible\)/g) ?? []).length === 4
}
afirmar(libroConParidad(demosD4), 'cada regla de hover de los libros nombra también el foco (s3-foco vuelve a verde), y las de foco de afuera siguen para los dispositivos sin hover (medido: con el mouse y con Tab el libro pasa a la misma pose abierta)')
controlPositivo('el detector VE un hover sin su foco', demosD4.replace('[data-v3] [data-pieza="libro"]:is(:hover, :focus-visible) > [data-parte="cara"]', '[data-v3] [data-pieza="libro"]:hover > [data-parte="cara"]'), libroConParidad)


// D5 · el cartel de las demos es la pastilla del navbar token por token, también el radio (se había quedado con el de antes).
const cartelD5 = leer('_estilos/demos.css').replace(/\/\*[\s\S]*?\*\//g, '')
const navD5 = leer('_estilos/navegacion.css').replace(/\/\*[\s\S]*?\*\//g, '')
const radioDe = (css: string, selector: string): string => {
  const i = css.indexOf(`${selector} {`)
  return i < 0 ? '?' : (/border-radius: ([^;]+);/.exec(css.slice(i, css.indexOf('}', i)))?.[1] ?? '?')
}
const mismoRadio = (c: string): boolean => radioDe(c, '[data-v3] [data-pieza="cartel-de-demos"]') === radioDe(navD5, '[data-v3] [data-pieza="navegacion"] > [data-parte="pastilla"]') && radioDe(navD5, '[data-v3] [data-pieza="navegacion"] > [data-parte="pastilla"]') === 'var(--radius-fuerte)'
afirmar(mismoRadio(cartelD5), 'el cartel de las demos lleva el radio de la pastilla del navbar (el de CONTACTO): s5-trabajos vuelve a verde (su lector ahora salta los comentarios: uno se comía el radio del navbar)')
controlPositivo('el detector VE el cartel con el radio de antes', cartelD5.replace('border-radius: var(--radius-fuerte);', 'border-radius: var(--radius-pastilla-l);'), mismoRadio)


// D5 (2) · y el cartel del cursor sobre los libros, la misma pastilla del estante (s38): el mismo radio, el del navbar.
const cursorD5 = leer('_estilos/cursor-sala.css').replace(/\/\*[\s\S]*?\*\//g, '')
const tresIguales = (c: string): boolean => radioDe(c, '[data-v3] [data-pieza="cursor-sala"] [data-parte="cartel"]') === radioDe(cartelD5, '[data-v3] [data-pieza="cartel-de-demos"]') && radioDe(cartelD5, '[data-v3] [data-pieza="cartel-de-demos"]') === 'var(--radius-fuerte)'
afirmar(tresIguales(cursorD5), '  el cartel del cursor (sobre un libro), el del estante y la pastilla del navbar, con el mismo radio: s38 y s5-trabajos en verde a la vez')
controlPositivo('el detector VE el cartel del cursor con el radio de antes', cursorD5.replace('border-radius: var(--radius-fuerte);', 'border-radius: var(--radius-pastilla-l);'), tresIguales)


// D7 · la página no se ensancha con el puntero en un borde: lo que sigue a la cámara viva se salía del cuadro.
const paginaD7 = sinComentarios(readFileSync(`${V3}/page.tsx`, 'utf8').replace(/\r\n/g, '\n'))
const mainRecortado = (c: string): boolean => {
  const clase = /<main className="([^"]+)"/.exec(c)?.[1] ?? ''
  const partes = clase.split(' ')
  return partes.includes('overflow-x-clip') && partes.includes('max-escritorio:z-auto') && !partes.some((p) => /^(max-escritorio:)?(transform|filter|opacity|mask|will-change|isolate|overflow-hidden|overflow-x-hidden)/.test(p))
}
afirmar(mainRecortado(paginaD7), 'el `<main>` de /v3 recorta a lo ancho con `overflow: clip` (no abre contexto de apilamiento ni caja de scroll: la mezcla de Quiénes somos abajo de 1025 y los sticky siguen): medido, el documento mide lo que la ventana a 1440 y 1024 con el puntero en los dos bordes (antes, 1551 y 1042 con el puntero a la derecha; 1183 a 1024 a la izquierda) y a 390')
controlPositivo('el detector VE un main que recorta con hidden (eso sí rompería los sticky)', paginaD7.replace('overflow-x-clip', 'overflow-x-hidden'), mainRecortado)

// D8 · el piso bajo las 300 líneas de código: ya tenía 303 y C3 lo llevó a 305 (s8-montaje). La geometría del bloque, aparte.
const bloquesD8 = leer('_lib/escena/piso/bloques.ts')
const geometriaD8 = leer('_lib/escena/piso/geometriaDelBloque.ts')
const pisoPartido = (b: string): boolean => lineasDeCodigo(b).length <= LIMITE_DE_LINEAS_DE_CODIGO && !b.includes('function geometriaDelBloque')
afirmar(pisoPartido(bloquesD8) && lineasDeCodigo(geometriaD8).length <= LIMITE_DE_LINEAS_DE_CODIGO && geometriaD8.includes('export function geometriaDelBloque(lado: number): THREE.BufferGeometry {'), 'el piso (`piso/bloques.ts`) queda bajo las 300 líneas de código con el criterio de s8 (`lineasDeCodigo`) y la geometría del bloque vive en su archivo, tal cual (s8-montaje sigue en rojo por s32 y s34, de antes de esta pasada)', `${String(lineasDeCodigo(bloquesD8).length)} y ${String(lineasDeCodigo(geometriaD8).length)} líneas de código`)
controlPositivo('el detector VE el piso con la geometría de vuelta adentro', `${bloquesD8}\n${geometriaD8}`, pisoPartido)

// D10 · la cabeza fija de Servicios (abajo de 1024) y el menú: iba con bandera; [AJUSTES FINALES] A5 la aprobó y la pasó al
// producto (s48 A5 la fija). Acá queda que los tokens de la barra que la cabeza despeja siguen siendo los mismos.
const barraD10 = leer('_estilos/barra.css')
const menuD10 = leer('_chrome/menu/MenuMovil.tsx')
const delMenu = (b: string, m: string): boolean => b.includes('--barra-reposo: var(--spacing-6);') && b.includes('--barra-alto: calc(var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto));') && /fixed inset-x-0 top-\[var\(--spacing-4\)\] mx-auto grid size-\[var\(--spacing-12\)\]/.test(m)
afirmar(delMenu(barraD10, menuD10), 'D10 · la barra (24 de reposo + 48 de alto) y el botón del menú del teléfono (16 + 48) miden lo que la cabeza de Servicios despeja (A5)')
controlPositivo('el detector VE la barra que cambió de alto (el relleno dejaría de despejarla)', barraD10.replace('--barra-alto: calc(var(--spacing-3) * 2', '--barra-alto: calc(var(--spacing-4) * 2'), (b: string) => delMenu(b, menuD10))

cerrar('s47-pasada-final')
