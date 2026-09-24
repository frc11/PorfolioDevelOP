import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { seccionDe } from '../_contrato/forma'

import { NOMBRE_CORTO } from './contenido'
import { LINEA_ANGOSTA } from './angosto'
import { SERVICIOS } from '../_contrato/acento'
import { fronterasDeEstado, type MedidaDeLaTira } from './TiraDeServicios'

/**
 * SERVICIOS ABAJO DE 1024 — lo llama `s6-servicios`. **[MÓVIL 2]**
 *
 * Sin hueco antes del panel (la sección mide su contenido), la cabeza fija que
 * suelta con el último servicio, un CTA por servicio y el nombre corto sólo en la
 * cabeza. Cada chequeo, con su control.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (...partes: string[]): string => readFileSync(path.join(AQUI, ...partes), 'utf8')

/** Lo que suelta el alto abajo de 1024 en las tres capas que lo imponían: panel, bloque del pin y cada servicio. */
function sinHueco(fuentes: { readonly tabla: string | undefined; readonly panel: string; readonly servicios: string }): boolean {
  return (
    fuentes.tabla === 'contenido' &&
    /seccion\.altoAngosto === 'contenido' \? 'max-escritorio:min-h-0!'/.test(fuentes.panel) &&
    /style=\{\{ minHeight: ALTO_DECLARADO \}\}[\s\S]{0,200}className="relative max-escritorio:min-h-0!"/.test(fuentes.servicios) &&
    /CLASE_DE_BLOQUE_DE_SERVICIO\} max-escritorio:min-h-0`/.test(fuentes.servicios)
  )
}

export function afirmarServiciosAngostos(): void {
  titulo('M2 · Servicios abajo de 1024: sin hueco, la cabeza fija y un CTA por servicio')

  // ── SIN HUECO ENTRE EL ÚLTIMO SERVICIO Y EL PANEL ──────────────────────
  const fuentes = { tabla: seccionDe('servicios').altoAngosto, panel: leer('../../_componentes/Panel.tsx'), servicios: leer('Servicios.tsx') }
  afirmar(
    sinHueco(fuentes),
    'abajo de 1024 la sección mide lo que mide su contenido: el panel, el bloque del pin y cada servicio sueltan sus 800 / 800 / 100 svh; entre el último servicio y el panel queda sólo el margen de siempre',
  )
  controlPositivo('  el chequeo vería el bloque del pin con su alto de escritorio en todo ancho', { ...fuentes, servicios: fuentes.servicios.replace('relative max-escritorio:min-h-0!', 'relative') }, sinHueco)
  controlPositivo('  y la tabla sin el alto angosto', { ...fuentes, tabla: undefined }, sinHueco)

  // ── LA CABEZA SUELTA CON EL ÚLTIMO, Y LAS CUATRO RANURAS SE ENCIENDEN ─
  const ANGOSTO = leer('angosto.tsx')
  afirmar(ANGOSTO.includes('100%+100svh-var(--alto-de-la-cabeza)') && ANGOSTO.includes('patron="pin"'), 'la regla del pin mide la caja más un cuadro menos la cabeza: el progreso llega a 1 cuando la cabeza suelta, con el último servicio')
  // Una lista como la de 390 medida: tres bloques de 490 px, ventana de 712 bajo la cabeza.
  const medida: MedidaDeLaTira = { recorrido: 1468, alto: 712, topes: [0, 490, 979] }
  const fronteras = fronterasDeEstado(medida, LINEA_ANGOSTA)
  afirmar(fronteras.every((f, i) => f < 1 && (i === 0 || f > fronteras[i - 1])), `con esa medida las tres fronteras caen adentro del recorrido y en orden: ${fronteras.map((f) => f.toFixed(3)).join(' · ')}`)
  const sobreLaCaja: MedidaDeLaTira = { recorrido: 1468 + 132 - 844, alto: 712, topes: [0, 490, 979] }
  controlPositivo('  el chequeo vería el pin sobre la caja, donde el 03 no se enciende nunca', sobreLaCaja, (m: MedidaDeLaTira) => fronterasDeEstado(m, LINEA_ANGOSTA).every((f) => f < 1))

  // ── UN CTA AL TERMINAR CADA SERVICIO, CON SU ACENTO ────────────────────
  const CONTENIDO_DE_SERVICIO = leer('ContenidoDeServicio.tsx')
  const TIRA = leer('TiraDeServicios.tsx')
  afirmar(/<CtaDelServicio servicio=\{servicio\} \/>\s*<\/ContenidoDeSeccion>/.test(CONTENIDO_DE_SERVICIO), 'el CTA va al final de cada servicio, adentro del bloque que lleva su `[data-servicio]`: el acento lo hereda de ahí')
  afirmar(/<CtaDelServicio servicio=\{servicio\} \/>/.test(TIRA), '  y está también en la tira de escritorio (oculto): las dos ramas anuncian lo mismo')
  afirmar(/className="escritorio:hidden"/.test(leer('CtaDelServicio.tsx')), '  y desde 1024 no se ve: ahí rota uno solo')

  // ── EL NOMBRE CORTO ES SÓLO DE LA CABEZA ───────────────────────────────
  afirmarIgual(Object.keys(NOMBRE_CORTO), ['ia-automatizacion'], 'el único nombre corto es el de IA y Automatizaciones')
  afirmar(SERVICIOS.find((s) => s.id === 'ia-automatizacion')?.nombre === 'Integraciones de IA y Automatizaciones', '  y el nombre del servicio sigue siendo el completo')
  const ROTULO = leer('RotuloDeServicio.tsx')
  const soloDecorativo = (f: string): boolean => /nombreCorto: decorativo \? NOMBRE_CORTO\[servicio\.id\] : undefined/.test(f)
  afirmar(soloDecorativo(ROTULO), '  y lo lleva sólo el rótulo decorativo: el anunciado y el de la lista dicen el completo')
  controlPositivo('  el chequeo vería el corto en todos los rótulos', ROTULO.replace('nombreCorto: decorativo ? NOMBRE_CORTO[servicio.id] : undefined', 'nombreCorto: NOMBRE_CORTO[servicio.id]'), soloDecorativo)
}
