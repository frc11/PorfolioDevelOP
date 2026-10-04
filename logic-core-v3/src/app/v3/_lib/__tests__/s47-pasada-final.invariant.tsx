/**
 * PASADA FINAL — el invariante: npm run test:s47-pasada-final
 *
 * La regla de esta pasada: cada comportamiento aprobado que se toca queda FIJADO acá (duraciones, recorridos, orden),
 * con su control positivo. Una sección por ticket:
 *   A1 · el titular del hero sin parpadeo 2D: desde 1024 el texto sale oculto del servidor y lo que se ve son sus
 *        letras de volumen, armadas apenas la escena monta; el 2D sólo como respaldo (la escena caída, sin títulos, o el
 *        3D que no llega a tiempo), con un plazo que el hook y la hoja comparten; y nada de lo armado se rearma porque
 *        otro título entre o salga del registro.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/pasada-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS, useTitular2D } from '../../_componentes/titulos3d/titular2d'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { Hero } from '../../_secciones/hero/Hero'
import { laEscenaCayo, marcarLaEscenaCaida, suscribirALaCaida } from '../escena/caida'
import { mismaForma } from '../escena/titulos3d/sincronia'
import type { TituloDeVolumen } from '../titulos3d/registro'
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
const forma = (parte: Partial<TituloDeVolumen>): TituloDeVolumen => ({ id: 'x', texto: 'TU NEGOCIO', lugar: null as unknown as HTMLElement, lectura: 0, subida: 0, llegada: 0, salida: 0, queda: true, corrida: 0, fuente: 'archivo-700', gesto: 'azar', colocacion: 'pantalla', rearma: false, minimoS: 2.4, salidaMinimaS: null, trazos: [], ...parte })
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

cerrar('s47-pasada-final')
