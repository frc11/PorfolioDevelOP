/**
 * s8 · EL CIERRE — el pie armado alrededor del logo, al final del recorrido. **[FINAL]**
 *
 * Reescrito con la sección. Se afirma la composición (identidad y contacto a la izquierda,
 * las columnas a la derecha, redes y legales abajo, el centro libre para el logo), que el
 * contenido es el de siempre reacomodado —lo que falta sigue pedido, nada inventado—, que
 * el pie llega DESPUÉS del alejamiento y termina en el último píxel, y que las dos ramas
 * anuncian lo mismo.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, huecoDelLogo } from '../../_lib/escena/finalDelRecorrido'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../../_lib/secciones'
import { seccionDe } from '../_contrato/forma'
import { escanearLoReal, marcadoresRealesEn, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { leer } from '../_invariantes/soporte'
import { Cierre, LLEGADAS_DEL_PIE } from './Cierre'
import { HREF_DEL_MAIL, LINEA_LEGAL, MAIL, REDES, WHATSAPP } from './contacto'
import { COLUMNAS, CONTACTO_DEL_PIE, DESTINOS_DE_LA_RUTA, PEDIDO, TITULAR_DE_CIERRE } from './contenido'

const ID = 'cierre'
const montado = <Cierre seccion={seccionDe(ID)} />
const [quieto, movido] = [false, true].map((anima) => marcar(montado, { anima }))
const FUENTE = ['Cierre.tsx', 'ColumnasDelPie.tsx', 'PiezasDeContacto.tsx', 'contenido.ts', 'contacto.ts'].map((f) => quitarComentarios(leer(`src/app/v3/_secciones/cierre/${f}`))).join('\n')
const anunciado = (html: string): string => textoVisible(html.replace(/<svg[\s\S]*?<\/svg>/g, ' ')).replace(/\s+/g, ' ').trim()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La composición: el centro libre para el logo')

afirmar(/<footer[^>]*data-pieza="pie"/.test(quieto), 'el pie es el `<footer>` de la página, adentro de la sección de cierre')
afirmarIgual(COLUMNAS.map((c) => c.titulo), ['El recorrido', 'Contacto'], 'a la derecha, las columnas de hoy: el recorrido y el contacto')
afirmar(quieto.indexOf(TITULAR_DE_CIERRE) < quieto.indexOf('El recorrido') && quieto.indexOf('El recorrido') < quieto.indexOf(LINEA_LEGAL), '  en orden de lectura: la identidad y el contacto, la navegación y el pie de página')
afirmar((FUENTE.match(/w-\[calc\(50%-var\(--hueco-del-pie\)\)\]/g) ?? []).length === 2, 'las dos columnas dejan libre el hueco del logo: medio cuadro menos el hueco, a cada lado')
const hueco = huecoDelLogo(POSES_DEL_FINAL.pie.distance)
afirmar(hueco > 10 && hueco < 25, `el hueco sale de la pose E (a ${String(POSES_DEL_FINAL.pie.distance)}): ${hueco.toFixed(1)} svh`)
afirmar(!/CabeceraDeSeccion|MarcaDeSeccion|PrefijoDeServicio|Isotipo/.test(FUENTE) && !/data-pieza="(marca-de-seccion|prefijo-de-servicio|isotipo)"/.test(quieto + movido), 'sin el punto azul (ni la marca de sección ni el prefijo) y sin el logo chico: el 3D ya está detrás')
afirmar(!/<form\b|<input\b/.test(quieto), 'el newsletter no está: vive en el panel')
afirmar(/href="#contacto"/.test(quieto) && CONTACTO_DEL_PIE.rotulo === 'Hablanos', 'la columna de contacto enlaza al contacto («Hablanos», a #contacto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · [FINAL 3] El contenido: datos reales, sin un solo marcador')

afirmarIgual(escanearLoReal(textoVisible(quieto)), [], 'ni una cifra en el pie')
afirmarIgual(marcadoresRealesEn(textoVisible(quieto)), [], 'ni un marcador a la vista: se fueron [ENLACE], [FECHA], [NOMBRE] y las leyendas')
controlPositivo('  el chequeo vería un marcador que quedó', '[ENLACE] las redes, una por red', (t: string) => marcadoresRealesEn(t).length === 0)
afirmar(!/cuando exista/.test(textoVisible(quieto)), '  ni un «cuando exista»')
afirmarIgual(PEDIDO.length, 0, '  y el pedido del pie quedó vacío')
afirmar(quieto.includes(`href="${HREF_DEL_MAIL}"`) && MAIL === 'contacto@develop.com.ar', `el mail (${MAIL}), con su mailto`)
afirmar(WHATSAPP.href.startsWith('https://wa.me/5493814154708?text=') && quieto.includes('data-pieza="whatsapp"'), 'WhatsApp abre wa.me con el mensaje precargado')
afirmarIgual(REDES.map((r) => r.rotulo), ['Instagram', 'LinkedIn', 'TikTok', 'Facebook'], 'las cuatro redes, en orden')
afirmar(REDES.every((r) => quieto.includes(`aria-label="${r.rotulo}"`)), '  cada una con su nombre accesible (son sólo íconos)')
afirmar(textoVisible(quieto).includes(LINEA_LEGAL), `la línea legal: «${LINEA_LEGAL}»`)
afirmarIgual(DESTINOS_DE_LA_RUTA.map((d) => d.rotulo), ['Inicio', 'Quiénes somos', 'Trabajos', 'Servicios', 'Tu panel', 'Por qué develOP'], 'la navegación: sin Números (no se monta) y con «Inicio» en lugar de «Hero»')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Llega después del alejamiento, y termina en el último píxel')

/** El alejamiento D, en fracción de la última pantalla (la del pie subiendo). */
const FIN_DEL_ALEJAMIENTO = TIEMPOS_DEL_FINAL.pie.llega - (PANTALLAS_DE_POR_QUE_DEVELOP - 1)
const llegadas = Object.values(LLEGADAS_DEL_PIE)
const despuesYAdentro = (ls: readonly (readonly [number, number])[]): boolean => ls.every(([a, b]) => a >= FIN_DEL_ALEJAMIENTO && b <= 1 && b > a)
afirmar(despuesYAdentro(llegadas), `las tres llegadas arrancan después del alejamiento (${FIN_DEL_ALEJAMIENTO.toFixed(2)} de la última pantalla) y terminan antes del último píxel`, llegadas.map(([a, b]) => `${String(a)}–${String(b)}`).join(' · '))
afirmar(LLEGADAS_DEL_PIE.izquierda[0] < LLEGADAS_DEL_PIE.derecha[0] && LLEGADAS_DEL_PIE.derecha[0] < LLEGADAS_DEL_PIE.abajo[0], '  escalonadas: izquierda, derecha, abajo')
controlPositivo('  el chequeo vería una llegada que termina después del final del scroll (se quedaría a medio entrar)', [[0.4, 1.1]] as const, despuesYAdentro)
afirmar(/<Bloque patron="P2" anclaje="seccion"/.test(FUENTE), '  el progreso es el de la sección entrando: P2 sobre la sección, de `top bottom` a `bottom bottom`')
// El `<footer>` ya trae su padding del estilo del pie: una caja que sume alto o padding estira la sección y deja scroll de más.
const sinAltoPropio = (fuente: string): boolean => !/claseDeContenido="[^"]*(min-h-|py-)/.test(fuente)
afirmar(sinAltoPropio(FUENTE), '  la sección mide lo que declara: la caja del pie no suma alto ni padding, así el último píxel es el pie terminado')
controlPositivo('  el chequeo vería la caja que estiraba la sección 160 px', 'claseDeContenido="relative grid py-0 escritorio:min-h-svh"', sinAltoPropio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las dos ramas anuncian lo mismo')

afirmarIgual(anunciado(movido), anunciado(quieto), 'la rama con coreografía y la quieta anuncian el mismo texto')
afirmarIgual([...quieto.matchAll(/style="[^"]*transform:[^"]*"/g)].length, 0, 'la quieta no escribe una sola transformada')
afirmar([...movido.matchAll(/style="[^"]*transform:[^"]*"/g)].length > 0, '  (control: la animada sí)')

cerrar('s8-cierre.invariant')
