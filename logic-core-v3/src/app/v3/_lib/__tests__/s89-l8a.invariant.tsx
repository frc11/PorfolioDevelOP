/**
 * [L8a] LA REVISIÓN DE VALENTINO SOBRE LA COLA 3, SÓLO ESCRITORIO — lo que L8a agregó. Sin navegador (las medidas están en L8a-resultado.md).
 *
 *   1 · la etiqueta del equipo en la esquina de la foto, sin margen (desde 1024)
 *   2 · el abanico de Demos centrado bajo su texto
 *   3 · el recomendador: alto de su primer paso, encabezado quieto; contacto con la página arriba y «Empezar de nuevo» / «Enviar» abajo
 *   4 · el FAQ: la letra de la respuesta es la más grande que entra; el WhatsApp aparece en su lugar
 *
 * Cada afirmación lleva su control. Las clases arbitrarias se arman partidas (el escaneo de Tailwind 4 lee hasta los comentarios).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { LETRA_DE_LA_RESPUESTA, letraQueEntra } from '../../_componentes/faq/RespuestaDelFaq'
import { altoDeLaCaja } from '../../_secciones/servicios/recomendador/useAltoDelRecomendador'
import { poseDelBloque } from '../escena/pie3d/faqDeVolumen'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const clase = (...partes: string[]): string => partes.join('')

titulo('1 · [L8a] La etiqueta del nombre, en la esquina de la foto')
const marco = leer('_secciones/quienes-somos/marco.tsx')
const enLaEsquina = (f: string): boolean => f.includes(clase('escritorio:', 'top-0')) && f.includes(clase('escritorio:', 'left-0')) && f.includes(clase('escritorio:', 'right-0'))
afirmar(enLaEsquina(marco), 'desde 1024 la etiqueta de Franco (arriba a la izquierda) y la de Valentino (arriba a la derecha) pegan con la esquina de la foto, sin margen')
controlPositivo('  el detector ve la etiqueta con margen', marco.replace(clase('escritorio:', 'top-0'), clase('escritorio:', 'top-[var(--spacing-4)]')), enLaEsquina)

titulo('2 · [L8a] El abanico de Demos, centrado bajo el texto')
const demos = leer('_estilos/demos.css')
const biblioteca = leer('_secciones/trabajos/demos/Biblioteca.tsx')
const centrado = (css: string, tsx: string): boolean => css.includes('--libro-corrimiento: max(0px, calc((100cqw') && tsx.includes(clase('escritorio:ms-[var(--libro-', 'corrimiento)]')) && tsx.includes('i === 0')
afirmar(centrado(demos, biblioteca), 'la primera placa se corre medio sobrante del estante (más lo que el giro le saca a la derecha), sólo desde 1024')
controlPositivo('  el detector ve el abanico arrimado a la izquierda (sin el corrimiento)', [demos, biblioteca.replace('i === 0', 'false')] as const, ([c, t]) => centrado(c, t))

titulo('3 · [L8a] El recomendador no salta')
afirmar(altoDeLaCaja(661, 812) === 812 && altoDeLaCaja(661, 500) === 661, 'la caja nunca baja del alto de su primer paso y crece con lo que necesita')
controlPositivo('  el detector ve una caja que se achica con el contenido', (b: number, c: number) => c, (f) => f(661, 500) === 661)
const recomendador = leer('_secciones/servicios/recomendador/Recomendador.tsx')
const hook = leer('_secciones/servicios/recomendador/useAltoDelRecomendador.ts')
const quieto = (r: string, h: string): boolean => r.includes("useAltoDelRecomendador(raiz, cuerpo, interior, encabezado, estado.fase === 'preguntas' && estado.etapa === 0)") && r.includes(clase('escritorio:', 'self-start')) && r.includes('--tope-del-encabezado') && h.includes("'--tope-del-encabezado'")
afirmar(quieto(recomendador, hook), 'el encabezado va arriba de su celda con el tope de la primera medida (no se recentra) y la caja lee su alto de la variable')
controlPositivo('  el detector ve el recomendador sin el alto fijo', [recomendador.replace('useAltoDelRecomendador(raiz', 'noHace(raiz'), hook] as const, ([r, h]) => quieto(r, h))
const contacto = leer('_secciones/servicios/recomendador/ContactoDelRecomendador.tsx')
const orden = (f: string): boolean => {
  const [cabecera, enlace, fila, empezar, enviar] = ['data-parte="cabecera-del-contacto"', '<EnlaceDelServicio', 'data-parte="fila-del-envio"', 'parte="empezar-de-nuevo"', '<Cta type="submit"'].map((s) => f.indexOf(s))
  return cabecera >= 0 && cabecera < enlace && enlace < fila && fila < empezar && empezar < enviar
}
afirmar(orden(contacto), 'la página del servicio arriba (a la derecha del título); abajo, «Empezar de nuevo» a la izquierda y «Enviar» a la derecha')
controlPositivo('  el detector ve el orden de antes (Enviar primero)', contacto.replace('data-parte="fila-del-envio"', '<Cta type="submit" /> data-parte="fila-del-envio"'), orden)

titulo('4 · [L8a] El FAQ: la respuesta llena su bloque y el WhatsApp aparece en su lugar')
// 24 px de letra por renglón de 3 px por cada 0,1 de letra: cabe(px) = px ≤ 30.
const cabe30 = (px: number): boolean => px <= 30
afirmar(letraQueEntra(cabe30) === 30, 'la letra es la más grande que entra (30 px con ese límite)')
afirmar(letraQueEntra(() => false) === LETRA_DE_LA_RESPUESTA.minimo && letraQueEntra(() => true) === LETRA_DE_LA_RESPUESTA.maximo, 'una respuesta que no entra baja al mínimo; una corta, al máximo')
controlPositivo('  el detector ve una letra fija (la de antes)', (): number => LETRA_DE_LA_RESPUESTA.minimo, (f) => f() === 30)
const volumen = leer('_lib/escena/pie3d/faqDeVolumen.ts')
const enSuLugar = (f: string): boolean => f.includes("b.id === 'whatsapp' ? { ...poseDelBloque(1, mpp), abre: v, texto: v }") && f.includes('fundirLaPlaca(b.material, v)')
afirmar(enSuLugar(volumen) && poseDelBloque(1, 0.02).sube === 1, 'el WhatsApp usa la pose de arriba con cualquier nivel (no sube del piso) y su placa, su hueco y su texto siguen el nivel (el fundido)')
controlPositivo('  el detector ve el WhatsApp que sube (el de antes)', volumen.replace("b.id === 'whatsapp' ? { ...poseDelBloque(1, mpp)", 'false ? { ...poseDelBloque(1, mpp)'), enSuLugar)

cerrar('s89-l8a')
