/**
 * INVARIANTE — SERVICIOS ([B4], 2026-10-22): la sección nueva, renderizada REAL a HTML en las dos ramas (`anima` sí y no), afirmada
 * sobre el marcado y sobre su código. La máquina de gatillos, los tiempos y el truco de profundidad los afirma s81 (son puros).
 *
 * ⚠️ REEMPLAZADO POR LA SPEC (B4). Este archivo afirmaba la sección de antes (el rodillo, la tira, la torta, el CTA que rota y la
 * cabeza fija del teléfono). Valentino la rehízo entera (CIERRE-HOME-V3, B4) y la de antes quedó en la carpeta SIN MONTAR: lo que
 * afirmaba sobre ella ya no describe el home. Lo que sigue valiendo se afirma igual sobre la nueva, con sus controles: los tokens, el
 * foco, el acento por contexto, ningún número que se lea como un hecho, el mismo texto en las dos ramas y el alto de la tabla.
 *
 * ⚠️ ESTE ARCHIVO NO SE ESCANEA A SÍ MISMO: contiene a propósito la frase con cifras inventadas y un hex (`codigoDeLaSeccion` excluye
 * los `*.invariant.*`).
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import { apagadosDeFoco, arbitrariosSinVar, funcionesDeColorEncontradas, hexEncontrados, literalesConUnidad, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { SERVICIOS } from '../_contrato/acento'
import { seccionDe } from '../_contrato/forma'
import { escanearLoReal, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { CONTENIDO } from './contenido'
import { cuenta, focalizablesDe } from './deteccion'
import { LEER_MAS, SUBTITULO, TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from './escenario/datos'
import { TEXTOS_DEL_RECOMENDADOR } from './recomendador/logica'
import { TITULO_DEL_RECOMENDADOR } from './recomendador/Recomendador'
import { Servicios } from './Servicios'

const CONTENIDO_PROHIBIDO_DE_CONTROL = 'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

const montada = <Servicios seccion={seccionDe('servicios')} />
const quieto = marcar(montada, { anima: false })
const animado = marcar(montada, { anima: true })
/** Los archivos de la sección nueva (la de antes sigue en la carpeta, sin montar: no se escanea como si se viera). */
const NUEVOS = codigoDeLaSeccion('servicios').filter((a) => /\/(escenario|movil|recomendador)\/|\/Servicios\.tsx$|\/tramoDeServicios\.ts$/.test(a))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las dos ramas: sin coreografía, las pantallas quietas; con coreografía, el escenario anclado')

afirmar(NUEVOS.length >= 12 && NUEVOS.every((a) => contarLineasDeCodigo(leer(a)) <= LIMITE_DE_LINEAS_DE_CODIGO), `${String(NUEVOS.length)} archivos de la sección nueva, ninguno pasa las 300 líneas de código`)
afirmar(quieto.includes('data-pieza="servicios-deslizar"') && !quieto.includes('data-pieza="escenario-de-servicios"') && cuenta(quieto, /data-pieza="pantalla-de-servicio"/g) === SERVICIOS.length, 'sin coreografía (el servidor, menos movimiento, abajo de 1024 por defecto): la entrada y una pantalla por servicio, en el flujo')
afirmar(animado.includes('data-pieza="escenario-de-servicios"') && animado.includes('data-pieza="pista-de-servicios"') && cuenta(animado, /data-pieza="panel-de-servicio"/g) === SERVICIOS.length && animado.includes('data-pieza="nanobots-de-servicios"'), 'con coreografía: la pista, el escenario pegado, un panel por servicio y UN lienzo para los nanobots')
const paneles = [...animado.matchAll(/data-pieza="panel-de-servicio"[^>]*style="translate:([^;"]+)/g)].map((m) => m[1].trim())
afirmarIgual(paneles, ['-100.000% 0', '100.000% 0', '0 -100.000%'], 'los paneles salen del servidor afuera, cada uno del lado por donde entra: web por la izquierda, software por la derecha, IA por arriba')
afirmar(/data-pieza="nanobots-de-servicios" data-capa="detras"/.test(animado), 'los nanobots arrancan DETRÁS del título (la capa la cambia la coreografía en el cuadro limpio)')
afirmar(animado.includes(`min-height:${seccionDe('servicios').alto}`) && quieto.includes(`min-height:${seccionDe('servicios').alto}`), 'el alto sale de la tabla (800svh desde 1024: la sección la llena exacta, k = 1)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El mismo texto en las dos ramas, y los encabezados')

// [C2-51] El texto del recomendador son dos párrafos (05-TEXTOS): cada uno, entero.
const textos = [SUBTITULO, TITULO_DEL_RECOMENDADOR, ...TEXTOS_DEL_RECOMENDADOR.parrafos, ...SERVICIOS.flatMap((s) => [TITULO_DEL_SERVICIO[s.id].derecho, TITULO_DEL_SERVICIO[s.id].cursiva]), LEER_MAS]
const visibleQuieto = textoVisible(quieto)
const visibleAnimado = textoVisible(animado)
const faltan = (t: string): string[] => textos.filter((x) => !t.includes(x))
afirmarIgual([faltan(visibleQuieto), faltan(visibleAnimado)], [[], []], 'la bajada, el recomendador y cada servicio (los dos renglones de su título y, L3, «Leer más…» en lugar del CTA) están en las dos ramas')
// [C2-50] El texto del medio nuevo (05-TEXTOS: cuatro párrafos), el mismo en las dos ramas.
const palabrasDe = (t: string, id: keyof typeof CONTENIDO): boolean => TEXTO_DEL_MEDIO[id].join(' ').split(' ').every((p) => t.includes(p))
afirmar(SERVICIOS.every((s) => palabrasDe(visibleQuieto, s.id) && palabrasDe(visibleAnimado, s.id)), '  y el párrafo de cada servicio, palabra por palabra (en el escenario va partido para levantarse por renglón)')
const encabezados = (h: string): string[] => [...h.matchAll(/<(h[1-6])\b/g)].map((m) => m[1])
afirmarIgual([encabezados(quieto), encabezados(animado)], [['h2', 'h3', 'h3', 'h3', 'h3'], ['h2', 'h3', 'h3', 'h3', 'h3']], 'el árbol de encabezados es el mismo: el h2 de la sección y un h3 por servicio y el del recomendador')
afirmar(quieto.includes('id="titular-servicios"') && animado.includes('id="titular-servicios"'), '  y el h2 es el que nombra a la `<section>` (`aria-labelledby`)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Ningún número que se lea como un hecho, y sin precio «desde»')

afirmarIgual([escanearLoReal(visibleQuieto).map((h) => h.fragmento), escanearLoReal(visibleAnimado).map((h) => h.fragmento)], [[], []], 'ni una cifra, ni un precio, ni un número sin declarar, en las dos ramas')
afirmar(escanearLoReal(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, 'CONTROL: el escáner ve la deuda real de develOP')
afirmar(!/\bdesde \$|PRECIOS_DESDE/.test(visibleQuieto + visibleAnimado + NUEVOS.map(leer).join('\n')), 'ningún precio «desde» en el home (P-H8 sin efecto: va sólo en las páginas de servicio)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, y el acento por contexto')

const fuentes = NUEVOS.map((a) => ({ a, texto: quitarComentarios(leer(a)) }))
afirmarIgual(fuentes.flatMap((f) => hexEncontrados(f.texto)), [], 'ningún color escrito a mano')
afirmarIgual(fuentes.flatMap((f) => funcionesDeColorEncontradas(f.texto)), [], 'ninguna función de color literal')
afirmarIgual(fuentes.flatMap((f) => literalesConUnidad(f.texto)), [], 'ningún literal con unidad')
afirmarIgual(fuentes.flatMap((f) => arbitrariosSinVar(f.texto)), [], 'toda clase arbitraria consume var(--token)')
controlPositivo('los detectores ven un hex, un px suelto y un arbitrario sin var', 'className="p-[16px] text-[#ff0000]" color: rgba(0,0,0,.1)', (t) => hexEncontrados(t).length + literalesConUnidad(t).length + arbitrariosSinVar(t).length + funcionesDeColorEncontradas(t).length === 0)
// [L3] Reemplazada por la spec: el CTA se fue; el título y «Leer más…» consumen el alias por la clase (`text-acento`), dos por servicio.
const conAcento = (h: string): boolean => SERVICIOS.every((s) => new RegExp(`data-servicio="${s.id}"`).test(h)) && cuenta(h, /class="[^"]*\btext-acento\b/g) >= 2 * SERVICIOS.length
afirmar(conAcento(quieto) && conAcento(animado), 'cada servicio pone su acento por `data-servicio`, y su título y su «Leer más…» lo consumen por el alias (`text-acento`): un acento por panel')
controlPositivo('  el detector ve el título y el enlace sin el alias', quieto.replaceAll('text-acento', 'text-tinta'), conAcento)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El foco y el teclado')

afirmarIgual(fuentes.flatMap((f) => apagadosDeFoco(f.texto)), [], 'ningún archivo apaga el anillo de foco')
// [L3] Un enlace con `tabindex="-1"` (el del video, que repite al del título) no es una parada del teclado.
const recorrido = (h: string): string => focalizablesDe(h.replace(/<a\b[^>]*tabindex="-1"[^>]*>/g, '')).join(' ')
// [C2-51] Reemplazada por la spec: el recomendador va por etapas; el servidor publica la primera (cinco opciones y «Siguiente»).
// [L3] Reemplazada por la spec: por servicio, el título y «Leer más…» (el video lleva a la misma página, fuera del Tab).
const esperado = [...SERVICIOS.flatMap(() => ['<a', '<a']), ...Array.from({ length: 5 }, () => '<input'), '<button'].join(' ')
afirmarIgual([recorrido(quieto), recorrido(animado)], [esperado, esperado], 'el recorrido del teclado: el título y «Leer más…» de cada servicio (su página), las cinco opciones de la primera etapa del recomendador y «Siguiente»; el mismo en las dos ramas')
afirmar(cuenta(animado, /<a\b[^>]*tabindex="-1"[^>]*data-viaje-del-servicio|<a\b[^>]*data-viaje-del-servicio[^>]*tabindex="-1"/g) === SERVICIOS.length && cuenta(animado, /aria-hidden="true"[^>]*tabindex="-1"|tabindex="-1"[^>]*aria-hidden="true"/g) >= SERVICIOS.length, '  [L3] el video también lleva a la página, sin anunciarse ni entrar al Tab (uno por servicio)')
afirmar(/onFocus|data-pieza="panel-de-servicio"/.test(leer('src/app/v3/_secciones/servicios/escenario/PanelDeServicio.tsx')) && /onFocus=\{\(\) => foco\(estado\)\}/.test(leer('src/app/v3/_secciones/servicios/escenario/PanelDeServicio.tsx')), 'con el escenario, el foco que entra en un panel que no se ve lleva la página a ese servicio (el teclado ve lo que enfoca)')
controlPositivo('el buscador de focalizables no está ciego', '<button>x</button><a href="#y">y</a>', (h) => focalizablesDe(h).length === 0)

cerrar('s6-servicios.invariant')
