/**
 * INVARIANTE — Las páginas de servicio: el template y la ruta. **[SERVICIOS S1b]**
 *
 * Corre a mano (P-H7: ningún script de package.json lo ve): `npx tsx src/app/v3/_servicios/__tests__/pagina.invariant.tsx`.
 *
 * Renderiza `PaginaDeServicio` DE VERDAD (`renderToStaticMarkup`, sin `Contacto`) con los tres servicios, en desarrollo y en
 * producción, y afirma sobre el MARCADO. Cada comprobación lleva su control positivo: el MISMO detector, contra una entrada
 * armada para fallar. Los detectores viven en `pagina-detectores.ts`.
 *
 * [S3b] La página tiene dos partes: la INTRO (`data-intro-de-servicio`, lo único invertido, con el acento claro) y el CUERPO, en
 * papel, con el token oscuro del servicio. La comparación del vidrio contra la fórmula del Portfolio se RETIRÓ con el vidrio
 * (la funcionalidad ya no existe): en su lugar, §10 afirma que no queda ningún vidrio.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ResolvedMetadata } from 'next'
import { renderToStaticMarkup } from 'react-dom/server'

import { PRECARGA_POR_SERVICIO } from '../../_chrome/contacto/contenido'
import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { MARCA_HOME_QUIETO } from '../../_secciones/_contrato/marcaHomeQuieto'
import { CLASES_DEL_PAPEL } from '../bloques/Bloque'
import { Precio } from '../bloques/Precio'
import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { SERVICIOS } from '../datos/servicios'
import { SOFTWARE_A_MEDIDA } from '../datos/software-a-medida'
import { ESTILO_DEL_CTA, tokenDelAcento } from '../estiloDelAcento'
import { MARCADOR_A_DEFINIR, numero, usd } from '../formato'
import { ATRIBUTO_DE_LA_INTRO } from '../Intro'
import { PaginaDeServicio } from '../PaginaDeServicio'
import { PRECIOS_DESDE } from '../precios'
import { HREF_DEL_HOME, PUBLICADOS, hrefDe } from '../rutas'
import { jsonLdDe } from '../seo'
import type { Plan, Servicio } from '../tipos'
import {
  MARCADORES_DE_LA_LLAVE, acentosDelTemaPorServicio, aperturaDe, aperturas, arbitrariasSinToken, bloqueDe, bloquesEnOrden, clasesQueNoApilan,
  elementoConAtributo, enlacesInternos, fondosOpacos, hexSueltos, nivelesDeEncabezado, numerosInventados,
  reservadosEnElMarcado, respetaElOrden, saltaNiveles, sinComentarios, textoVisible, tokensDelTema, valoresDe, valoresProhibidos,
  vidrios,
} from './pagina-detectores'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const pagina = (servicio: Servicio, enDesarrollo: boolean): string =>
  renderToStaticMarkup(<PaginaDeServicio servicio={servicio} enDesarrollo={enDesarrollo} />)

interface Pagina { readonly servicio: Servicio; readonly enDesarrollo: boolean; readonly html: string; readonly nombre: string }
const PAGINAS: readonly Pagina[] = SERVICIOS.flatMap((servicio) =>
  [true, false].map((enDesarrollo) => ({ servicio, enDesarrollo, html: pagina(servicio, enDesarrollo), nombre: `${servicio.slug} (${enDesarrollo ? 'dev' : 'prod'})` })),
)
const WEB_DEV = pagina(PAGINAS_WEB, true)
const WEB_PROD = pagina(PAGINAS_WEB, false)
/** Los nombres de las páginas (de los tres servicios, en los dos modos) que NO cumplen. `[]` = todas cumplen. */
const fallan = (cumple: (p: Pagina) => boolean): string[] => PAGINAS.filter((p) => !cumple(p)).map((p) => p.nombre)
/** [S3b] La intro entera (`null` si no está) y el cuerpo: todo lo que no es la intro. */
const intro = (html: string): string | null => elementoConAtributo(html, ATRIBUTO_DE_LA_INTRO)
const cuerpo = (html: string): string => {
  const marcado = intro(html)
  return marcado === null ? html : html.replace(marcado, '')
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La intro es lo primero: lleva su atributo, el único h1 (el problema) y su bajada')

const unSoloH1 = (html: string): boolean => aperturas(html, 'h1').length === 1
const h1Dice = (servicio: Servicio) => (html: string): boolean =>
  unSoloH1(html) && textoVisible(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '') === servicio.problema.titulo
afirmarIgual(fallan((p) => h1Dice(p.servicio)(p.html)), [], 'las tres páginas, en los dos modos: un solo h1, con el título del problema de SUS datos')
controlPositivo('dos h1 se detectan', '<main><h1>a</h1><h1>b</h1></main>', unSoloH1)
controlPositivo('un h1 con otro título se detecta', '<h1>otro</h1>', h1Dice(PAGINAS_WEB))
/** La primera etiqueta adentro de la raíz. */
const primeroDeLaRaiz = (html: string): string => /^<div[^>]*>(<[^>]+>)/.exec(html)?.[1] ?? ''
const laIntro = (servicio: Servicio) => (html: string): boolean => {
  const marcado = intro(html)
  if (marcado === null) return false
  return primeroDeLaRaiz(html) === aperturaDe(marcado) && aperturaDe(marcado).includes(` ${ATRIBUTO_DE_LA_INTRO}="${servicio.slug}"`) &&
    h1Dice(servicio)(marcado) && aperturas(cuerpo(html), 'h1').length === 0 &&
    textoVisible(marcado).includes(servicio.problema.texto) && !textoVisible(cuerpo(html)).includes(servicio.problema.texto)
}
afirmarIgual(fallan((p) => laIntro(p.servicio)(p.html)), [], `y ese h1 va en la intro: lo primero de la raíz, con ${ATRIBUTO_DE_LA_INTRO} y su slug, el h1 y la bajada (el texto del problema); el cuerpo no lleva ninguno de los dos`)
controlPositivo('una intro sin su atributo se detecta', WEB_PROD.replace(` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.slug}"`, ''), laIntro(PAGINAS_WEB))
controlPositivo('un h1 que se va al cuerpo se detecta', WEB_PROD.replace(/<h1(?=[\s>])/, '<h2').replace('</h1>', '</h2>').replace('<main>', `<main><h1>${PAGINAS_WEB.problema.titulo}</h1>`), laIntro(PAGINAS_WEB))
controlPositivo('algo antes de la intro se detecta', WEB_PROD.replace(/^(<div[^>]*>)/, '$1<p>antes</p>'), laIntro(PAGINAS_WEB))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los bloques, en el orden de SPEC §5')

const ORDEN_DEL_SPEC = ['problema', 'que-hacemos', 'que-incluye', 'precio', 'extra', 'proceso', 'prueba', 'faq', 'llamado', 'del-blog', 'cierre']
afirmarIgual(bloquesEnOrden(WEB_DEV), ORDEN_DEL_SPEC.filter((b) => b !== 'del-blog'), 'Páginas web: los diez bloques con contenido, en orden — Del blog no se monta (sus artículos no tienen href)')
afirmarIgual(fallan((p) => respetaElOrden(bloquesEnOrden(p.html), ORDEN_DEL_SPEC)), [], 'las tres páginas, en los dos modos: los bloques que hay respetan el orden del SPEC')
const conBlog = pagina({ ...PAGINAS_WEB, articulos: [{ titulo: 'Una nota', href: '/v3/blog/una-nota' }] }, false)
afirmar(bloquesEnOrden(conBlog).join() === ORDEN_DEL_SPEC.join(), 'con un artículo que sí tiene href, Del blog se monta entre el llamado y el cierre')
controlPositivo('dos bloques cambiados de lugar se detectan', ['problema', 'que-incluye', 'que-hacemos', 'precio'], (s: string[]) => respetaElOrden(s, ORDEN_DEL_SPEC))
controlPositivo('un bloque que no es del SPEC se detecta', ['problema', 'inventado'], (s: string[]) => respetaElOrden(s, ORDEN_DEL_SPEC))
// S3b · el orden, ajustado a la intro: el problema es la intro y el cuerpo arranca en Qué hacemos.
const partidaEnDos = (html: string): boolean =>
  JSON.stringify(bloquesEnOrden(intro(html) ?? '')) === JSON.stringify(['problema']) && bloquesEnOrden(cuerpo(html))[0] === 'que-hacemos' &&
  respetaElOrden(bloquesEnOrden(cuerpo(html)), ORDEN_DEL_SPEC.filter((b) => b !== 'problema'))
afirmarIgual(fallan((p) => partidaEnDos(p.html)), [], 'las tres páginas, en los dos modos: la intro lleva un solo bloque, el problema, y el cuerpo empieza en Qué hacemos y sigue el orden del SPEC')
controlPositivo('un bloque del cuerpo metido en la intro se detecta', `<div><div ${ATRIBUTO_DE_LA_INTRO}="x"><section data-bloque="problema"></section><section data-bloque="que-hacemos"></section></div><main><section data-bloque="que-incluye"></section></main></div>`, partidaEnDos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El CTA abre el contacto y precarga el servicio — sin data-servicio (P-S1)')

const envoltorios = (html: string): string[] => aperturas(html, 'div').filter((d) => d.includes('data-abre-contacto'))
const lleva = (idEnElHome: string) => (apertura: string): boolean =>
  apertura.includes('data-abre-contacto="panel"') && apertura.includes(`data-precarga="${idEnElHome}"`)
afirmarIgual(envoltorios(WEB_PROD).length, 2, 'Páginas web: dos envoltorios de apertura — el bloque del CTA y el cierre')
afirmar(envoltorios(bloqueDe(WEB_PROD, 'llamado') ?? '').length === 1, '  y el bloque del CTA tiene uno')
afirmarIgual(fallan((p) => envoltorios(p.html).length > 0 && envoltorios(p.html).every(lleva(p.servicio.idEnElHome))), [], 'cada envoltorio lleva data-abre-contacto="panel" y data-precarga con el id del servicio en el home')
afirmar((PRECARGA_POR_SERVICIO[PAGINAS_WEB.idEnElHome]?.length ?? 0) > 0, `  y el home sabe qué marcar: «${PAGINAS_WEB.idEnElHome}» está en PRECARGA_POR_SERVICIO`)
controlPositivo('un envoltorio sin data-precarga se detecta', '<div data-abre-contacto="panel" class="a">', lleva('web'))
const sinDataServicio = (html: string): boolean => !html.includes('data-servicio')
afirmarIgual(fallan((p) => sinDataServicio(p.html)), [], 'no hay data-servicio en ninguna parte del marcado de ninguna página')
controlPositivo('un data-servicio armado se detecta', '<div data-servicio="paginas-web">x</div>', sinDataServicio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · «[a definir]» solo en desarrollo')

const cuenta = (html: string, aguja: string): number => html.split(aguja).length - 1
const hayMarcador = (html: string): boolean => cuenta(html, MARCADOR_A_DEFINIR) > 0
afirmarIgual(cuenta(WEB_DEV, MARCADOR_A_DEFINIR), 2, 'Páginas web en desarrollo: dos marcadores — la Simple (autogestionable) y el plan mensual del mantenimiento')
afirmar(textoVisible(WEB_DEV).includes('Plan mensual') && !textoVisible(WEB_PROD).includes('Plan mensual'), '  la fila «Plan mensual» solo existe en desarrollo')
afirmarIgual([cuenta(WEB_DEV, 'Autogestionable'), cuenta(WEB_PROD, 'Autogestionable')], [3, 2], '  «Autogestionable»: tres veces en desarrollo, dos en producción (la Simple no lo dice mientras esté en [a definir])')
afirmarIgual(fallan((p) => p.enDesarrollo || !hayMarcador(p.html)), [], 'en producción no sale ningún marcador, en ninguna de las tres páginas')
afirmarIgual(fallan((p) => !p.enDesarrollo || hayMarcador(p.html)), [], 'y en desarrollo las tres lo muestran (web: la Simple y el plan mensual; software: los casos y las respuestas sin dato; IA: funcionalidades e implementación)')
controlPositivo('los modos cruzados: producción no puede mostrar el marcador', WEB_DEV, (h: string) => !hayMarcador(h))
controlPositivo('los modos cruzados: desarrollo tiene que mostrarlo', WEB_PROD, hayMarcador)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Nada del home: ni ids, ni atributos de la escena, ni más de un data-seccion')

const limpio = (html: string): boolean => reservadosEnElMarcado(html, ATRIBUTO_DE_LA_INTRO).length === 0
afirmarIgual(fallan((p) => limpio(p.html)), [], 'ninguna página emite un id que el home busque, ni portfolio-…, ni data-panel, data-seccion-id o data-signo-de-la-tuya; data-seccion solo es «invertida», una vez, en la intro (S3b: ya no en la raíz)')
controlPositivo('un id="cierre" se detecta', `${WEB_PROD}<i id="cierre"></i>`, limpio)
controlPositivo('un id portfolio-la-tuya se detecta', `${WEB_PROD}<i id="portfolio-la-tuya"></i>`, limpio)
controlPositivo('un data-panel se detecta', `${WEB_PROD}<i data-panel="x"></i>`, limpio)
controlPositivo('un data-seccion que no es «invertida» se detecta', `${WEB_PROD}<i data-seccion="claro"></i>`, limpio)
controlPositivo('un segundo data-seccion «invertida» se detecta', `${WEB_PROD}<i data-seccion="invertida"></i>`, limpio)
controlPositivo('el data-seccion en la raíz y no en la intro se detecta', WEB_PROD.replace(' data-seccion="invertida"', '').replace(/^<div /, '<div data-seccion="invertida" '), limpio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El único hex es el claro, en la intro; el cuerpo lleva el token oscuro de SU servicio')

const sinHexEnElCuerpo = (html: string): boolean => hexSueltos(cuerpo(html)).length === 0
afirmarIgual(fallan((p) => sinHexEnElCuerpo(p.html)), [], 'el cuerpo de cada página —todo lo que no es la intro— no tiene ningún hex')
afirmarIgual(fallan((p) => JSON.stringify(hexSueltos(p.html)) === JSON.stringify([p.servicio.acento.claro]) && aperturaDe(intro(p.html)).includes(` style="--color-acento:${p.servicio.acento.claro}"`)), [], '  y el único hex del marcado es el acento.claro de SUS datos, en el style de la intro (P-H2)')
controlPositivo('un hex en el cuerpo se detecta', WEB_PROD.replace('<main>', '<main><p style="color:#1D5B8F">x</p>'), sinHexEnElCuerpo)
controlPositivo('el claro puesto en el cuerpo se detecta', WEB_PROD.replace('<main>', `<main><p style="color:${PAGINAS_WEB.acento.claro}">x</p>`), sinHexEnElCuerpo)
// Lo esperado sale del TEMA (sus reglas de contexto por servicio), no de `tokenDelAcento`: si la derivación se rompe, esto lo ve.
const TEMA = readFileSync(path.join(AQUI, '../../../theme-develop.css'), 'utf8')
const TOKENS_DEL_TEMA = tokensDelTema(TEMA)
const ACENTO_DEL_TEMA = acentosDelTemaPorServicio(TEMA)
const tokenSegunElTema = (id: string): string => ACENTO_DEL_TEMA.get(id) ?? '(el tema no lo dice)'
afirmarIgual(IDS_DE_SERVICIO.filter((id) => !TOKENS_DEL_TEMA.has(tokenSegunElTema(id)) || tokenDelAcento(id) !== tokenSegunElTema(id)), [], `el token oscuro de cada servicio es el que el tema le da en su contexto, y está declarado en su @theme static: ${IDS_DE_SERVICIO.map(tokenSegunElTema).join(', ')}`)
controlPositivo('un token que el tema no declara se detecta', '--color-acento-otro', (token: string) => TOKENS_DEL_TEMA.has(token))
controlPositivo('un servicio que el tema no conoce se detecta', 'otro', (id: string) => ACENTO_DEL_TEMA.has(id))
const acentoDelCuerpo = (servicio: Servicio) => (html: string): boolean =>
  (/^<div style="([^"]*)"/.exec(html)?.[1] ?? '') === `--color-acento:var(${tokenSegunElTema(servicio.idEnElHome)})`
afirmarIgual(fallan((p) => acentoDelCuerpo(p.servicio)(p.html)), [], '  y la raíz fija el acento del cuerpo con el token de SU servicio, derivado de idEnElHome, por var(): ningún hex')
controlPositivo('el token de otro servicio se detecta', WEB_PROD.replace(`var(${tokenSegunElTema('web')})`, `var(${tokenSegunElTema('software')})`), acentoDelCuerpo(PAGINAS_WEB))
controlPositivo('el claro en la raíz se detecta', WEB_PROD.replace(`var(${tokenSegunElTema('web')})`, PAGINAS_WEB.acento.claro), acentoDelCuerpo(PAGINAS_WEB))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · De PROYECTOS salen el nombre, el rubro, la dirección y el póster — nunca la reseña ni lo resuelto')

const PROHIBIDOS = valoresProhibidos(FUENTE_DE_PROYECTOS)
afirmar(PROHIBIDOS.length > 0, `la lista de lo prohibido no es vacía: ${PROHIBIDOS.length} valores de resena, problemaResuelto, problemaCliente, queHicimos y resultado`)
const sinLoProhibido = (html: string): boolean => {
  const texto = textoVisible(html)
  return [...PROHIBIDOS, ...MARCADORES_DE_LA_LLAVE].every((valor) => !texto.includes(valor))
}
afirmarIgual(fallan((p) => sinLoProhibido(p.html)), [], 'ninguno de esos valores llega al marcado, ni los marcadores de la llave del contenido inventado')
controlPositivo('un render que pinta una reseña se detecta', `${WEB_PROD}<p>${PROHIBIDOS.at(0) ?? 'x'}</p>`, sinLoProhibido)
controlPositivo('un render que pinta el marcador de la llave se detecta', `${WEB_PROD}<p>[TESTIMONIO] · pendiente</p>`, sinLoProhibido)
const FUENTE_DE_PRUEBA = sinComentarios(readFileSync(path.join(AQUI, '../bloques/Prueba.tsx'), 'utf8'))
const leeLoProhibido = (fuente: string): boolean => /\b(resena|problemaResuelto|problemaCliente|queHicimos|resultado)\b/.test(fuente)
afirmar(!leeLoProhibido(FUENTE_DE_PRUEBA), 'y el código de Prueba.tsx ni nombra esos campos (solo lee nombre, rubro, url, póster y alt)')
controlPositivo('un fuente que lee la reseña se detecta', 'const r = proyecto.resena', (f: string) => !leeLoProhibido(f))
const CASOS_DE_WEB = PAGINAS_WEB.prueba.casos.flatMap((caso) => (caso.tipo === 'proyecto' ? [caso] : []))
const muestraAlProyecto = (html: string) => (slug: string, texto: string): boolean => {
  const proyecto = FUENTE_DE_PROYECTOS.find((p) => p.slug === slug)
  if (proyecto === undefined) return false
  return [proyecto.nombre, proyecto.rubro ?? '', texto].every((t) => textoVisible(html).includes(t)) &&
    valoresDe(html, 'href').includes(proyecto.url) && html.includes(encodeURIComponent(proyecto.medios.poster.escritorio)) && html.includes(encodeURIComponent(proyecto.medios.poster.movil))
}
afirmarIgual(CASOS_DE_WEB.filter((c) => !muestraAlProyecto(WEB_PROD)(c.slug, c.texto)).map((c) => c.slug), [], `los ${CASOS_DE_WEB.length} casos de Páginas web muestran su nombre, rubro, texto, enlace y los dos pósters, todo de la fuente`)
controlPositivo('una página sin los casos se detecta', '<main></main>', (h: string) => CASOS_DE_WEB.every((c) => muestraAlProyecto(h)(c.slug, c.texto)))
const imagenesBien = (html: string): boolean => aperturas(html, 'img').every((i) => /\salt="[^"]+"/.test(i) && /\ssizes="[^"]+"/.test(i))
afirmar(aperturas(WEB_PROD, 'img').length === CASOS_DE_WEB.length * 2 && imagenesBien(WEB_PROD), '  seis imágenes, todas con alt y con sizes (descriptores de ancho)')
controlPositivo('una imagen sin alt ni sizes se detecta', '<img src="/x.webp">', imagenesBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Los tres slots de precio: calibres, proyecto y planes')

const slot = (s: Servicio, enDesarrollo: boolean): string => renderToStaticMarkup(<Precio precio={s.precio} enDesarrollo={enDesarrollo} />)
afirmarIgual(SERVICIOS.map((s) => s.precio.tipo), ['calibres', 'proyecto', 'planes'], 'los tres tipos de precio: calibres (web), proyecto (software) y planes (IA)')
afirmarIgual(fallan((p) => bloqueDe(p.html, 'precio') !== null), [], 'las tres páginas tienen su bloque de precio, en los dos modos: ya no queda un slot sin componente')
afirmar(textoVisible(slot(SOFTWARE_A_MEDIDA, false)).includes(usd(PRECIOS_DESDE['software-a-medida'].usd)), 'software: el «desde» es el de PRECIOS_DESDE, sacado del dato (USD 1.000)')
const IA_PROD = slot(IA_Y_AUTOMATIZACIONES, false)
const IA_DEV = slot(IA_Y_AUTOMATIZACIONES, true)
const cuentaDe = (html: string, patron: RegExp): number => (html.match(patron) ?? []).length
const COLUMNAS = /<th[^>]*scope="col"/g
const FILAS = /<th[^>]*scope="row"/g
afirmarIgual([cuentaDe(IA_PROD, COLUMNAS), cuentaDe(IA_PROD, FILAS)], [4, 4], 'IA en producción: una tabla de verdad con 4 encabezados de columna (el vacío y los tres planes) y 4 de fila')
afirmarIgual([cuentaDe(IA_DEV, COLUMNAS), cuentaDe(IA_DEV, FILAS)], [4, 5], '  y en desarrollo suma la fila de funcionalidades')
afirmar(!IA_PROD.includes(MARCADOR_A_DEFINIR) && IA_DEV.includes(MARCADOR_A_DEFINIR), '  con el marcador (funcionalidades, implementación) solo en desarrollo')
const cajaConScroll = (html: string): boolean => /<div role="region" aria-label="Planes" tabindex="0" class="[^"]*overflow-x-auto/.test(html)
afirmar(cajaConScroll(IA_PROD), 'la tabla scrollea adentro de su caja (overflow-x-auto), y la caja es una región con nombre que recibe el foco: el teclado la mueve')
controlPositivo('una tabla sin su caja se detecta', '<table><tr><td>x</td></tr></table>', cajaConScroll)

// S2c · los planes en dos versiones: la tabla desde 768 (el `md` de Tailwind) y una tarjeta por plan por debajo. Las dos van en el marcado; el CSS elige.
const claseDe = (apertura: string): string[] => (/\sclass="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)
const versionesDeLosPlanes = (html: string, cual: 'tabla' | 'tarjetas'): string[] => aperturas(html, cual === 'tabla' ? 'div' : 'ul').filter((a) => a.includes(`data-planes="${cual}"`))
/** Una tabla y una lista de tarjetas, cada una oculta SOLO en el ancho que no le toca: la tabla bajo 768, las tarjetas desde 768. */
const dosVersiones = (html: string): boolean => {
  const tabla = claseDe(versionesDeLosPlanes(html, 'tabla')[0] ?? '')
  const tarjetas = claseDe(versionesDeLosPlanes(html, 'tarjetas')[0] ?? '')
  return versionesDeLosPlanes(html, 'tabla').length === 1 && versionesDeLosPlanes(html, 'tarjetas').length === 1 &&
    tabla.includes('max-md:hidden') && !tabla.includes('md:hidden') && tarjetas.includes('md:hidden') && !tarjetas.includes('max-md:hidden')
}
const cambiandoClases = (html: string, cambio: (clase: string) => string): string =>
  html.replace(/\sclass="([^"]*)"/g, (_t, valor: string) => ` class="${valor.split(/\s+/).map(cambio).filter((c) => c !== '').join(' ')}"`)
afirmar(dosVersiones(IA_PROD) && dosVersiones(IA_DEV), 'IA, en los dos modos: la tabla y las tarjetas están en el marcado; la tabla se oculta bajo 768 y las tarjetas desde 768 (display none: tampoco las lee el lector de pantalla ni las alcanza el teclado)')
afirmarIgual(fallan((p) => (p.servicio.precio.tipo === 'planes' ? dosVersiones(p.html) : versionesDeLosPlanes(p.html, 'tabla').length + versionesDeLosPlanes(p.html, 'tarjetas').length === 0)), [], '  en la página de IA, entera y en los dos modos, están las dos versiones; en las otras dos páginas, ninguna')
controlPositivo('una tabla que no se oculta bajo 768 se detecta', cambiandoClases(IA_PROD, (c) => (c === 'max-md:hidden' ? '' : c)), dosVersiones)
controlPositivo('unas tarjetas que no se ocultan desde 768 se detectan', cambiandoClases(IA_PROD, (c) => (c === 'md:hidden' ? '' : c)), dosVersiones)
controlPositivo('las clases de ocultar cruzadas se detectan', cambiandoClases(IA_PROD, (c) => (c === 'max-md:hidden' ? 'md:hidden' : c === 'md:hidden' ? 'max-md:hidden' : c)), dosVersiones)
// El corte viejo se arma por partes: una clase entera escrita acá la emitiría el escaneo de Tailwind (que lee hasta los tests) como una regla muerta.
controlPositivo('un corte viejo, el sm de Tailwind (640), se detecta', cambiandoClases(IA_PROD, (c) => (c === 'max-md:hidden' ? `max-${'sm'}:hidden` : c === 'md:hidden' ? `${'sm'}:hidden` : c)), dosVersiones)
controlPositivo('una página con una sola de las dos versiones se detecta', IA_PROD.replace(/<ul[^>]*data-planes="tarjetas"[\s\S]*?<\/ul>/, ''), dosVersiones)

const PLANES_DE_IA = ((): readonly Plan[] => {
  const precio = IA_Y_AUTOMATIZACIONES.precio
  if (precio.tipo !== 'planes') throw new Error('ia-y-automatizaciones: el precio ya no es por planes')
  return precio.planes
})()
/** De cada tarjeta del marcado: el nombre (h3) y sus pares rótulo/valor (dt/dd), como los lee un lector de pantalla. La fila de funcionalidades no cuenta: es un sexto dato, sin dato todavía. */
const tarjetasDelMarcado = (html: string): { nombre: string; datos: string[] }[] => {
  const lista = /<ul[^>]*data-planes="tarjetas"[^>]*>([\s\S]*?)<\/ul>/.exec(html)?.[1] ?? ''
  return [...lista.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) => ({
    nombre: textoVisible(/<h3[^>]*>([\s\S]*?)<\/h3>/.exec(li[1] ?? '')?.[1] ?? ''),
    datos: [...(li[1] ?? '').matchAll(/<dt[^>]*>([\s\S]*?)<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/g)]
      .map((par) => `${textoVisible(par[1] ?? '')}: ${textoVisible(par[2] ?? '')}`)
      .filter((dato) => !dato.startsWith('Funcionalidades: ')),
  }))
}
const TARJETAS_DEL_DATO = PLANES_DE_IA.map((plan) => ({
  nombre: plan.nombre,
  datos: [`Por mes: ${usd(plan.mensual)}`, `Conversaciones: ${numero(plan.conversaciones)}`, `Soporte: ${plan.soporte}`, `Cambios web incluidos: ${plan.cambiosWeb}`],
}))
const cadaPlanConSusCincoDatos = (html: string): boolean => JSON.stringify(tarjetasDelMarcado(html)) === JSON.stringify(TARJETAS_DEL_DATO)
afirmar(PLANES_DE_IA.length === 3 && cadaPlanConSusCincoDatos(IA_PROD) && cadaPlanConSusCincoDatos(IA_DEV), `cada uno de los ${PLANES_DE_IA.length} planes tiene su tarjeta con los cinco datos —nombre, por mes, conversaciones, soporte y cambios web—, cada dato con su rótulo, sacados del dato del plan; en los dos modos`)
controlPositivo('una tarjeta a la que le falta un dato se detecta', IA_PROD.replace(/<dt[^>]*>[\s\S]*?<\/dt><dd[^>]*>[\s\S]*?<\/dd>/, ''), cadaPlanConSusCincoDatos)
controlPositivo('un dato sin su rótulo se detecta', IA_PROD.replace('>Por mes</dt>', '></dt>'), cadaPlanConSusCincoDatos)
controlPositivo('un plan sin tarjeta se detecta', IA_PROD.replace(/<li[^>]*>(?:(?!<\/li>)[\s\S])*?<h3[\s\S]*?<\/li>/, ''), cadaPlanConSusCincoDatos)
/** El nivel tipográfico de cada valor de cada tarjeta: el primer `data-nivel` de su `dd` (un Titular pone el suyo en el span de adentro, un Cuerpo en el propio `dd`). */
const nivelesDeLosValores = (html: string): string[][] => {
  const lista = /<ul[^>]*data-planes="tarjetas"[^>]*>([\s\S]*?)<\/ul>/.exec(html)?.[1] ?? ''
  return [...lista.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) => [...(li[1] ?? '').matchAll(/<dd[^>]*>[\s\S]*?<\/dd>/g)].map((dd) => /data-nivel="([^"]+)"/.exec(dd[0])?.[1] ?? ''))
}
const precioMasGrande = (html: string): boolean => {
  const tarjetas = nivelesDeLosValores(html)
  return tarjetas.length === PLANES_DE_IA.length && tarjetas.every((niveles) => niveles.length > 1 && niveles[0] === 'titulo-m' && niveles.slice(1).every((nivel) => nivel === 'cuerpo'))
}
afirmar(precioMasGrande(IA_PROD) && precioMasGrande(IA_DEV), 'en cada tarjeta el «Por mes» va en el nivel titulo-m del Titular (el del precio de los calibres de Páginas web) y los demás valores en Cuerpo: es el más grande y sale de la escala del home, sin un tamaño propio; en los dos modos')
controlPositivo('un «Por mes» en Cuerpo, igual que los demás valores, se detecta', IA_PROD.replace(/data-nivel="titulo-m"/g, 'data-nivel="cuerpo"'), precioMasGrande)
controlPositivo('un «Por mes» en un nivel más chico del Titular se detecta', IA_PROD.replace(/data-nivel="titulo-m"/g, 'data-nivel="titulo-s"'), precioMasGrande)
controlPositivo('otro valor en el nivel del precio se detecta', IA_PROD.replace(/(<dd data-pieza="texto" data-nivel=")cuerpo(")/, '$1titulo-m$2'), precioMasGrande)
const sinCeroInventado = (html: string): boolean => !/(^|[^\d.,])0([^\d.,]|$)/.test(textoVisible(html))
afirmarIgual(fallan((p) => sinCeroInventado(p.html)), [], 'ningún precio ni dato sin valor se pinta como 0, en ninguna de las tres páginas')
controlPositivo('un precio nulo pintado como 0 se detecta', '<p>USD 0</p>', sinCeroInventado)
afirmarIgual(fallan((p) => !/whatsapp/i.test(textoVisible(p.html))), [], 'el bot de WhatsApp no se ofrece: ni una mención en el texto de ninguna página (el título del blog que lo nombra no se monta: no tiene href)')
controlPositivo('un texto que lo ofrece se detecta', '<p>Atendé por WhatsApp</p>', (h: string) => !/whatsapp/i.test(textoVisible(h)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Estructura: headings, cifras, apilado, clases, enlaces y fuentes')

afirmarIgual(fallan((p) => !saltaNiveles(nivelesDeEncabezado(p.html))), [], 'los headings empiezan en h1 y no saltan de nivel')
controlPositivo('un salto de h1 a h3 se detecta', [1, 3], (n: number[]) => !saltaNiveles(n))
controlPositivo('una página que empieza en h2 se detecta', [2, 3], (n: number[]) => !saltaNiveles(n))
afirmarIgual(fallan((p) => numerosInventados(p.html, p.servicio).length === 0), [], 'todo número del texto sale de los datos (o es el número de lugar de un paso): ninguna cifra escrita en el JSX')
controlPositivo('una cifra inventada se detecta', `${WEB_PROD}<p>USD 777</p>`, (h: string) => numerosInventados(h, PAGINAS_WEB).length === 0)
afirmarIgual(fallan((p) => clasesQueNoApilan(p.html).length === 0), [], 'ninguna clase parte en columnas o en fila sin el prefijo de ancho: por debajo de 1024 todo apila')
controlPositivo('una grilla de tres columnas sin prefijo se detecta', '<div class="grid grid-cols-3">', (h: string) => clasesQueNoApilan(h).length === 0)
const CON_TOKEN = valoresDe(WEB_PROD, 'class').flatMap((c) => c.split(/\s+/)).filter((c) => c.includes('[')).length
afirmar(CON_TOKEN > 0 && fallan((p) => arbitrariasSinToken(p.html).length === 0).length === 0, `toda clase arbitraria lee un token con var() (${CON_TOKEN} en la página, ninguna suelta)`)
controlPositivo('una clase arbitraria sin var() se detecta', `<div class="${['w-', '[', '37px', ']'].join('')}">`, (h: string) => arbitrariasSinToken(h).length === 0)
const listasConRol = (html: string): boolean => [...aperturas(html, 'ul'), ...aperturas(html, 'ol')].every((l) => l.includes('role="list"'))
afirmarIgual(fallan((p) => listasConRol(p.html)), [], 'toda lista (ul y ol) lleva role="list": sin marcadores, el navegador le saca la semántica de lista al lector de pantalla')
controlPositivo('una lista sin role se detecta', '<ul class="flex"><li>a</li></ul>', listasConRol)
const PERMITIDOS = new Set<string>([HREF_DEL_HOME, ...PUBLICADOS.map(hrefDe), '/login'])
const enlacesBien = (html: string): boolean => aperturas(html, 'a').every((a) => /\shref="[^"]+"/.test(a)) && enlacesInternos(html).every((h) => PERMITIDOS.has(h))
afirmarIgual(fallan((p) => enlacesBien(p.html)), [], 'todo <a> tiene href, y los internos solo llevan al home, a una página de PUBLICADOS o a /login')
controlPositivo('un enlace a una página que no es de PUBLICADOS se detecta', '<a href="/v3/otra-pagina">x</a>', enlacesBien)
afirmarIgual(fallan((p) => valoresDe(bloqueDe(p.html, 'cierre') ?? '', 'href').join() === [HREF_DEL_HOME, ...PUBLICADOS.map(hrefDe)].join()), [], 'el cierre de cada página enlaza al home y a las páginas de PUBLICADOS, nada más: con las tres publicadas, las tres')
controlPositivo('un cierre que no enlaza a todas se detecta', '<footer data-bloque="cierre"><a href="/v3">a</a><a href="/v3/paginas-web">b</a></footer>', (h: string) => valoresDe(bloqueDe(h, 'cierre') ?? '', 'href').join() === [HREF_DEL_HOME, ...PUBLICADOS.map(hrefDe)].join())
afirmarIgual(PUBLICADOS, SERVICIOS.map((s) => s.slug), 'PUBLICADOS tiene los tres servicios, en el orden del SPEC (S2b)')
controlPositivo('un PUBLICADOS al que le falta uno se detecta', ['paginas-web', 'software-a-medida'], (l: readonly string[]) => JSON.stringify(l) === JSON.stringify(SERVICIOS.map((s) => s.slug)))
const conCabecera = (html: string): boolean => new RegExp(`<header>[\\s\\S]*?<a href="${HREF_DEL_HOME}"[^>]*>[\\s\\S]*?${LOGOTIPO}[\\s\\S]*?</a>[\\s\\S]*?</header>[\\s\\S]*?<main`).test(html) &&
  (intro(html) ?? '').includes('<header>') // S3b: adentro de la intro, en claro (el único data-seccion es el de ella)
afirmar(conCabecera(WEB_PROD), `el encabezado es un enlace a ${HREF_DEL_HOME} con el logotipo, antes del main y adentro de la intro`)
controlPositivo('una página sin el enlace del encabezado se detecta', '<header></header><main></main>', conCabecera)
const HEADER_DE_LA_WEB = /<header>[\s\S]*?<\/header>/.exec(WEB_PROD)?.[0] ?? ''
controlPositivo('un encabezado fuera de la intro se detecta', WEB_PROD.replace(HEADER_DE_LA_WEB, '').replace(/^(<div[^>]*>)/, `$1${HEADER_DE_LA_WEB}`), conCabecera)
const preguntas = PAGINAS_WEB.faq.filter((f) => f.respuesta !== null).length
afirmar(aperturas(WEB_PROD, 'details').length === preguntas && aperturas(WEB_PROD, 'summary').length === preguntas, `el FAQ es un <details> con su <summary> por pregunta: ${preguntas}, con la respuesta en el HTML`)

const raiz = path.join(AQUI, '..')
const fuentes = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === '__tests__' ? [] : fuentes(path.join(dir, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [])
const FUENTES = fuentes(raiz).map((f) => ({ f: path.relative(raiz, f), codigo: sinComentarios(readFileSync(f, 'utf8')) }))
const navegaConElRouter = (codigo: string): boolean => /next\/link|next\/navigation|useRouter|router\.push|triggerTransition/.test(codigo)
afirmarIgual(FUENTES.filter((x) => navegaConElRouter(x.codigo)).map((x) => x.f), [], `ninguno de los ${FUENTES.length} fuentes de _servicios usa next/link, el router ni triggerTransition: navegan con <a href>`)
controlPositivo('un fuente con next/link se detecta', "import Link from 'next/link'", (c: string) => !navegaConElRouter(c))
controlPositivo('un fuente con router.push se detecta', 'router.push(href)', (c: string) => !navegaConElRouter(c))
const nombresQueChocan = (archivos: readonly string[]): string[] => {
  const porNombre = new Map<string, string[]>()
  for (const f of archivos) porNombre.set(f.toLowerCase().replace(/\.tsx?$/, ''), [...(porNombre.get(f.toLowerCase().replace(/\.tsx?$/, '')) ?? []), f])
  return [...porNombre.values()].filter((grupo) => grupo.length > 1).map((grupo) => grupo.join(' ≟ '))
}
afirmarIgual(nombresQueChocan(FUENTES.map((x) => x.f.replace(/\\/g, '/'))), [], 'ningún par de archivos comparte el nombre sin contar mayúsculas ni extensión (Planes.tsx contra planes.ts): en Windows el import resuelve al equivocado y el componente llega undefined')
controlPositivo('Planes.tsx y planes.ts juntos se detectan', ['bloques/precio/Planes.tsx', 'bloques/precio/planes.ts'], (l: string[]) => nombresQueChocan(l).length === 0)
const deCliente = (codigo: string): boolean => /^\s*['"]use client['"]/.test(codigo)
const dondeEsDeCliente = (lista: readonly { f: string; codigo: string }[]): string[] => lista.filter((x) => deCliente(x.codigo)).map((x) => x.f.replace(/\\/g, '/')).sort()
afirmarIgual(dondeEsDeCliente(FUENTES), ['movimiento/Revelado.tsx', 'movimiento/TitularQueEntra.tsx'], 'el único código de cliente son los dos envoltorios de movimiento/ (el contrato del revelado recibe funciones como hijo): todo lo demás es de servidor')
controlPositivo('un bloque de cliente fuera de movimiento/ se detecta', ["'use client'", 'export const x = 1'].join('\n'), (c: string) => !deCliente(c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Papel y movimiento: el cuerpo es papel opaco, la intro se lee sobre la tapa, sin vidrio, revelados del home')

const SIN_PROBLEMA = (html: string): string[] => bloquesEnOrden(html).filter((b) => b !== 'problema')
const clasesDe = (apertura: string): string[] => (/\sclass="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)
const tapas = (html: string): string[] => fondosOpacos(html).filter((clases) => ['fixed', 'inset-0', '-z-10'].every((c) => clases.split(/\s+/).includes(c)))
afirmarIgual(fallan((p) => tapas(p.html).length === 1 && tapas(intro(p.html) ?? '').length === 1), [], 'la tapa interina (fixed, inset-0, -z-10, bg-fondo) es una sola y va adentro de la intro: pinta la noche')
const introSinFondo = (html: string): boolean => {
  const marcado = intro(html) ?? ''
  return marcado !== '' && fondosOpacos(marcado).length === tapas(marcado).length && !clasesDe(aperturaDe(marcado)).some((c) => c.startsWith('bg-'))
}
afirmarIgual(fallan((p) => introSinFondo(p.html)), [], '  y la intro no pinta fondo propio: lo único con fondo adentro de ella es la tapa')
const APERTURA_DE_LA_INTRO = aperturaDe(intro(WEB_PROD))
controlPositivo('una intro con fondo propio se detecta', WEB_PROD.replace(APERTURA_DE_LA_INTRO, APERTURA_DE_LA_INTRO.replace(' class="', ' class="bg-fondo ')), introSinFondo)
const bloquesDelCuerpo = (html: string): string[] => [...aperturas(cuerpo(html), 'section'), ...aperturas(cuerpo(html), 'footer')].filter((a) => a.includes(' data-bloque="'))
const cuerpoEnPapel = (html: string): boolean => {
  const bloques = bloquesDelCuerpo(html)
  return bloques.length > 0 && bloques.length === bloquesEnOrden(cuerpo(html)).length && bloques.every((a) => CLASES_DEL_PAPEL.split(/\s+/).every((c) => clasesDe(a).includes(c)))
}
afirmarIgual(fallan((p) => cuerpoEnPapel(p.html)), [], `cada bloque del cuerpo, del Qué hacemos al cierre, es una sección opaca en papel: lleva la superficie papel-opaco del home (${CLASES_DEL_PAPEL})`)
controlPositivo('un bloque del cuerpo sin papel se detecta', WEB_PROD.replace(/(<section data-bloque="precio"[^>]*class=")([^"]*)"/, (_t, antes: string, clases: string) => `${antes}${clases.replace('bg-fondo', '')}"`), cuerpoEnPapel)
const sinVidrio = (html: string): boolean => vidrios(html) === 0 && !valoresDe(html, 'style').some((estilo) => /background/.test(estilo))
afirmarIgual(fallan((p) => sinVidrio(p.html)), [], 'sin vidrio: ningún backdrop-filter y ningún fondo en un style (S3b: el vidrio se fue, y su test con él)')
controlPositivo('un panel de vidrio se detecta', `${WEB_PROD}<div style="background:color-mix(in srgb, var(--color-tinta) 4%, transparent);backdrop-filter:blur(20px) saturate(180%)"></div>`, sinVidrio)
controlPositivo('un style con un fondo opaco se detecta', '<div style="background:rgb(14,14,14)"></div>', sinVidrio)
const conRevelado = (html: string, nombre: string): boolean => (bloqueDe(html, nombre) ?? '').includes(`data-arbol="${MARCA_HOME_QUIETO}"`)
afirmarIgual(fallan((p) => bloquesEnOrden(p.html).every((b) => conRevelado(p.html, b))), [], 'cada bloque cuelga de los patrones de revelado del home (el seam `Bloque`: sin coreografía, el contenido sale quieto y en su lugar)')
controlPositivo('un bloque sin revelado se detecta', '<section data-bloque="faq"><h2>FAQ</h2></section>', (h: string) => conRevelado(h, 'faq'))
const marcasDeRevelado = (html: string, nombre: string): number => ((bloqueDe(html, nombre) ?? '').match(new RegExp(`data-arbol="${MARCA_HOME_QUIETO}"`, 'g')) ?? []).length
const MARCAS_ESPERADAS = (nombre: string): number => (nombre === 'faq' || nombre === 'cierre' ? 1 : 2) // título + panel; el FAQ no revela el panel y el cierre no tiene título
afirmarIgual(fallan((p) => SIN_PROBLEMA(p.html).every((b) => marcasDeRevelado(p.html, b) === MARCAS_ESPERADAS(b))), [], 'se revela el título y el panel de cada bloque, menos el panel del FAQ (S2b): al abrir una pregunta cambia de alto, el motor vuelve a medir y un panel atado al scroll se corría de 15 a 27 px')
controlPositivo('un FAQ con el panel revelado se detecta', `<section data-bloque="faq"><div data-arbol="${MARCA_HOME_QUIETO}"></div><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, (h: string) => marcasDeRevelado(h, 'faq') === MARCAS_ESPERADAS('faq'))
controlPositivo('un bloque con el panel sin revelar se detecta', `<section data-bloque="precio"><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, (h: string) => marcasDeRevelado(h, 'precio') === MARCAS_ESPERADAS('precio'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · El JSON-LD llega al HTML, y el FAQ se lee igual que se declara')

const SCRIPTS_DE_JSON_LD = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
const cuerposDeJsonLd = (html: string): string[] => [...html.matchAll(SCRIPTS_DE_JSON_LD)].map((m) => m[1] ?? '')
const documentosDelHtml = (html: string): unknown[] => cuerposDeJsonLd(html).map((cuerpo) => JSON.parse(cuerpo))
afirmarIgual(fallan((p) => JSON.stringify(documentosDelHtml(p.html)) === JSON.stringify(jsonLdDe(p.servicio))), [], 'cada página lleva sus documentos JSON-LD en el HTML —un script por documento— y leídos dan exactamente lo que arma seo.ts')
afirmarIgual(fallan((p) => cuerposDeJsonLd(p.html).every((cuerpo) => !cuerpo.includes('<'))), [], '  sin un `<` adentro: ningún texto puede cerrar el script')
afirmarIgual(fallan((p) => !textoVisible(p.html).includes('@context')), [], '  y el JSON no es texto visible: no cambia lo que se lee')
const cuerposParseables = (html: string): boolean => {
  try {
    return cuerposDeJsonLd(html).length > 0 && documentosDelHtml(html).length > 0
  } catch {
    return false
  }
}
controlPositivo('un script con JSON roto se detecta', '<script type="application/ld+json">{"@type":</script>', cuerposParseables)

const detalles = (html: string): { pregunta: string; respuesta: string }[] =>
  [...html.matchAll(/<details>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({ pregunta: textoVisible(m[1] ?? ''), respuesta: textoVisible(m[2] ?? '') }))
const esperadas = (s: Servicio, enDesarrollo: boolean): { pregunta: string; respuesta: string }[] =>
  s.faq.flatMap((f) => (f.respuesta !== null ? [{ pregunta: f.pregunta, respuesta: f.respuesta }] : enDesarrollo ? [{ pregunta: f.pregunta, respuesta: MARCADOR_A_DEFINIR }] : []))
const faqLegible = (html: string, s: Servicio, enDesarrollo: boolean): boolean => JSON.stringify(detalles(html)) === JSON.stringify(esperadas(s, enDesarrollo))
afirmarIgual(fallan((p) => faqLegible(p.html, p.servicio, p.enDesarrollo)), [], 'el FAQ de cada página: un <details> por pregunta con su <summary> primero, la pregunta y la respuesta de los datos y en orden; en producción solo las que tienen respuesta')
controlPositivo('un details con la respuesta antes del summary se detecta', '<details><p>r</p><summary>q</summary></details>', (h: string) => detalles(h).length === 1)
const faqSinAtributosPropios = (html: string): boolean => aperturas(html, 'details').every((a) => a === '<details>') && aperturas(html, 'summary').every((a) => !/\s(aria-[a-z]+|tabindex|role|on[a-z]+)=/.test(a))
afirmarIgual(fallan((p) => faqSinAtributosPropios(p.html)), [], '  sin aria-expanded, tabindex, role ni manejadores propios: el elemento nativo ya resuelve el teclado y el estado')
controlPositivo('un summary con tabindex se detecta', '<details><summary tabindex="0">q</summary><p>r</p></details>', faqSinAtributosPropios)
const faqEnLista = (html: string): boolean => {
  const faq = bloqueDe(html, 'faq') ?? ''
  return faq.includes('<ul role="list"') && aperturas(faq, 'details').length === (faq.match(/<li[^>]*><details>/g) ?? []).length
}
afirmarIgual(fallan((p) => faqEnLista(p.html)), [], '  las preguntas son una lista (ul con role="list") y cada li lleva un solo details')
controlPositivo('un FAQ sin lista se detecta', '<section data-bloque="faq"><details><summary>q</summary><p>r</p></details></section>', faqEnLista)
const preguntasUnicas = (s: Servicio): boolean => new Set(s.faq.map((f) => f.pregunta)).size === s.faq.length
afirmarIgual(fallan((p) => preguntasUnicas(p.servicio)), [], '  y ninguna pregunta se repite (son la clave de cada ítem)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · «Probá el panel» (IA) es el CtaEnlace del home, tal cual, y va en tinta como acción secundaria')

// El Cta del home no tiene una variante «secundaria» (sus dos variantes son de forma: en línea y en bloque). La jerarquía de la página la pone
// el envoltorio de los llamados principales (`ESTILO_DEL_CTA`, que recolorea la tinta del botón con el acento); el enlace al panel no lo lleva.
const PANEL = IA_Y_AUTOMATIZACIONES.prueba.ctaPanel
const CTA_DEL_HOME = PANEL === null || PANEL.href === null ? '' : renderToStaticMarkup(<CtaEnlace href={PANEL.href} rotulo={PANEL.rotulo} />)
const IA_PAGINA = PAGINAS.find((p) => p.servicio.slug === 'ia-y-automatizaciones' && !p.enDesarrollo)?.html ?? ''
const traeElCtaDelHome = (html: string): boolean => CTA_DEL_HOME !== '' && (bloqueDe(html, 'prueba') ?? '').includes(CTA_DEL_HOME)
// Redefinir la variable (`--color-tinta:`), no leerla: un style que solo la lee con var() no recolorea nada.
const recoloreaLaTinta = (html: string): boolean => valoresDe(html, 'style').some((estilo) => /(^|;)\s*--color-tinta\s*:/.test(estilo))
const enTinta = (html: string): boolean => !recoloreaLaTinta(bloqueDe(html, 'prueba') ?? '')
afirmar(CTA_DEL_HOME.includes('data-pieza="cta"') && CTA_DEL_HOME.includes('href="/login"'), 'el CtaEnlace del home con los datos de «Probá el panel» es un <a data-pieza="cta"> a /login (D11)')
afirmarIgual(fallan((p) => p.servicio.prueba.ctaPanel === null || (traeElCtaDelHome(p.html) && enTinta(p.html))), [], 'en IA, en los dos modos, el bloque Prueba lleva ese <a> byte por byte —sin clase ni style propios— y ningún envoltorio le recolorea la tinta')
afirmar(recoloreaLaTinta(bloqueDe(IA_PAGINA, 'llamado') ?? ''), '  los llamados principales, en cambio, sí van en el acento (su envoltorio recolorea la tinta): esa es la diferencia entre principal y secundaria')
controlPositivo('un enlace con una clase propia se detecta', IA_PAGINA.replace(CTA_DEL_HOME, CTA_DEL_HOME.replace('class="', 'class="text-acento ')), traeElCtaDelHome)
controlPositivo('un enlace dentro del envoltorio de los llamados se detecta', renderToStaticMarkup(<section data-bloque="prueba"><div style={ESTILO_DEL_CTA}><CtaEnlace href="/login" rotulo="Probá el panel" /></div></section>), enTinta)

// ═══════════════════════════════════════════════════════════════════════════
titulo('13 · La ruta: publica exactamente PUBLICADOS, y la metadata no hereda el canonical del home')

async function laRuta(): Promise<void> {
  let ruta: typeof import('../../[servicio]/page')
  try {
    ruta = await import('../../[servicio]/page')
  } catch (error) {
    noCorre('la ruta', `no se pudo importar en Node (${String(error).slice(0, 120)}): se comprueba en el dev`)
    return
  }
  const publica = (lista: readonly { servicio: string }[]): boolean => JSON.stringify(lista) === JSON.stringify(PUBLICADOS.map((servicio) => ({ servicio })))
  afirmar(publica(ruta.generateStaticParams()), `generateStaticParams sale de PUBLICADOS: ${PUBLICADOS.join(', ')}`)
  controlPositivo('una lista a la que le falta un slug se detecta', [{ servicio: 'paginas-web' }, { servicio: 'software-a-medida' }], publica)
  afirmar(ruta.dynamicParams === false, 'dynamicParams es false: cualquier otro slug es 404')
  const padre = Promise.resolve({ openGraph: null } as unknown as ResolvedMetadata)
  const metadataDe = (servicio: string) => ruta.generateMetadata({ params: Promise.resolve({ servicio }) }, padre)
  const rechaza = async (servicio: string): Promise<boolean> => metadataDe(servicio).then(() => false, () => true)
  afirmarIgual([await rechaza('xyz'), await rechaza('paginas-web/x'), await rechaza('Paginas-Web')], [true, true, true], 'un slug que no es de ningún servicio da 404 (notFound): xyz, un hijo de una página y una mayúscula de más')
  for (const servicio of SERVICIOS) {
    afirmar(!(await rechaza(servicio.slug)), `${servicio.slug}: publicada, no da 404`)
    const meta = await metadataDe(servicio.slug)
    const robots = typeof meta.robots === 'object' && meta.robots !== null && !(meta.robots instanceof URL) ? meta.robots : null
    afirmar(meta.title === servicio.seo.title && meta.description === servicio.seo.description, '  title y description salen de SUS datos')
    afirmar(robots !== null && !('index' in robots ? robots.index : true), '  robots: noindex, como todo /v3')
    afirmar(meta.alternates?.canonical === hrefDe(servicio.slug) && meta.openGraph?.url === hrefDe(servicio.slug), `  alternates.canonical y openGraph.url son los de la propia página (${hrefDe(servicio.slug)}), no los del home`)
  }
  controlPositivo('un slug publicado no da 404', await rechaza('paginas-web'), (r: boolean) => r)
  controlPositivo('el canonical del home se detecta', 'https://develop.com.ar', (c: string) => c === hrefDe('paginas-web'))
}

laRuta().then(() => cerrar('pagina.invariant'), (error: unknown) => { console.error(error); process.exit(1) })
