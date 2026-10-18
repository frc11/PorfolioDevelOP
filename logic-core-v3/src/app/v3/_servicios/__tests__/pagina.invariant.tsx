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
 *
 * [M1] La maqueta: el h1 es el nombre y la bajada son dos párrafos (§1), el orden nuevo con el CTA del precio y el slot de trabajos
 * (§2-§3), ningún hex porque el claro es el token del tema (§6), los trabajos como frases con el enlace al caso en el Portfolio (§7) y
 * cómo entra cada bloque, con el gatillo y su guarda en reposo (§10). RETIRADAS por quitar la funcionalidad, no aflojadas: los casos con rubro, enlace y
 * pósters y las seis imágenes (§7, la sección de casos se fue) y «con un artículo con href, Del blog se monta» (§2: Del blog salió del
 * orden; en su lugar se afirma que no se monta ni con href).
 *
 * [M3] El video de trabajos (§12): solo en Páginas web, un `<video>` sin `src` ni `autoplay` en el HTML servido, sin video con
 * movimiento reducido, la pausa que alterna, el velo y la línea literal. RETIRADAS por quitar la funcionalidad: el marcador del video
 * (§4: el video ya existe) y «Probá el panel» en el slot de trabajos de IA (el viejo §12: en Software e IA el slot no se monta).
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ResolvedMetadata } from 'next'
import { renderToStaticMarkup } from 'react-dom/server'

import { PRECARGA_POR_SERVICIO } from '../../_chrome/contacto/contenido'
import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { ENTRADAS_AL_TRAMO } from '../../_secciones/_contrato/cruce'
import { MARCA_HOME_QUIETO } from '../../_secciones/_contrato/marcaHomeQuieto'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { DISPARO_DEL_REMATE } from '../../_secciones/tu-panel/entrada'
import { CLASES_DEL_PAPEL } from '../bloques/Bloque'
import { CLASES_DEL_VELO, VELO_DEL_VIDEO } from '../bloques/veloDelVideo'
import { Precio } from '../bloques/Precio'
import { FUENTE_DE_DEMOS } from '../datos/fuenteDeDemos'
import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { SERVICIOS } from '../datos/servicios'
import { SOFTWARE_A_MEDIDA } from '../datos/software-a-medida'
import { tokenDelAcento, tokenDelAcentoClaro } from '../estiloDelAcento'
import { MARCADOR_A_DEFINIR, numero, usd } from '../formato'
import { ATRIBUTO_DE_LA_INTRO } from '../Intro'
import { ESTADOS_DEL_GATILLO, LINEA_DEL_DISPARO, estaALaVista, siguienteEstado, type EstadoDelGatillo } from '../movimiento/disparo'
import { ROTULO_DE_LA_PAUSA, debeReproducirse, siguienteDeLaPausa, type MomentoDelVideo } from '../movimiento/reproduccion'
import { BotonDePausa, CapaDelVideo } from '../movimiento/VideoDeFondo'
import { PaginaDeServicio } from '../PaginaDeServicio'
import { PRECIOS_DESDE } from '../precios'
import { HREF_DEL_HOME, PUBLICADOS, hrefDe } from '../rutas'
import { jsonLdDe } from '../seo'
import type { Plan, Servicio } from '../tipos'
import {
  MARCADORES_DE_LA_LLAVE, acentosDelTemaPorServicio, aperturaDe, aperturas, arbitrariasSinToken, bloqueDe, bloquesEnOrden, clasesQueNoApilan,
  declaracionDelTemaPorServicio, elementoConAtributo, enlacesInternos, fondosOpacos, hexSueltos, nivelesDeEncabezado, numerosInventados,
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
titulo('1 · La intro es lo primero: su atributo con el IdDeServicio, el único h1 (el nombre) y la bajada en dos párrafos')

const unSoloH1 = (html: string): boolean => aperturas(html, 'h1').length === 1
// [M1] El h1 es el NOMBRE del servicio: el mismo texto que el título 3D de B12a.
const h1Dice = (servicio: Servicio) => (html: string): boolean =>
  unSoloH1(html) && textoVisible(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '') === servicio.nombre
afirmarIgual(fallan((p) => h1Dice(p.servicio)(p.html)), [], 'las tres páginas, en los dos modos: un solo h1, con el nombre de SUS datos («Páginas web»)')
controlPositivo('dos h1 se detectan', '<main><h1>a</h1><h1>b</h1></main>', unSoloH1)
controlPositivo('un h1 con otro título se detecta', '<h1>otro</h1>', h1Dice(PAGINAS_WEB))
controlPositivo('  y el h1 de antes del M1, el título del problema, también', `<h1>${PAGINAS_WEB.problema.titulo}</h1>`, h1Dice(PAGINAS_WEB))
/** Los textos de los párrafos de un marcado, en orden. */
const parrafos = (marcado: string): string[] => [...marcado.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => textoVisible(m[1] ?? ''))
/** Los textos de los encabezados (h1 a h6) de un marcado. */
const encabezados = (marcado: string): string[] => [...marcado.matchAll(/<h([1-6])(?=[\s>])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => textoVisible(m[2] ?? ''))
// [M1] La bajada sale del problema: dos párrafos, la entrada (su título) y su texto, literales y en ese orden. Ningún heading los lleva.
const bajadaEnDosParrafos = (servicio: Servicio) => (marcado: string): boolean =>
  JSON.stringify(parrafos(marcado)) === JSON.stringify([servicio.problema.titulo, servicio.problema.texto]) &&
  !encabezados(marcado).some((t) => t === servicio.problema.titulo || t === servicio.problema.texto)
/** La primera etiqueta adentro de la raíz. */
const primeroDeLaRaiz = (html: string): string => /^<div[^>]*>(<[^>]+>)/.exec(html)?.[1] ?? ''
const laIntro = (servicio: Servicio) => (html: string): boolean => {
  const marcado = intro(html)
  if (marcado === null) return false
  return primeroDeLaRaiz(html) === aperturaDe(marcado) && aperturaDe(marcado).includes(` ${ATRIBUTO_DE_LA_INTRO}="${servicio.idEnElHome}"`) &&
    h1Dice(servicio)(marcado) && aperturas(cuerpo(html), 'h1').length === 0 && bajadaEnDosParrafos(servicio)(marcado) &&
    !textoVisible(cuerpo(html)).includes(servicio.problema.texto)
}
afirmarIgual(fallan((p) => laIntro(p.servicio)(p.html)), [], `y ese h1 va en la intro: lo primero de la raíz, con ${ATRIBUTO_DE_LA_INTRO} y el IdDeServicio del home (P-H20), el h1 y la bajada en dos párrafos; el cuerpo no lleva ninguno de los dos`)
controlPositivo('una intro sin su atributo se detecta', WEB_PROD.replace(` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.idEnElHome}"`, ''), laIntro(PAGINAS_WEB))
controlPositivo('  y una con el slug en vez del IdDeServicio', WEB_PROD.replace(` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.idEnElHome}"`, ` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.slug}"`), laIntro(PAGINAS_WEB))
controlPositivo('un h1 que se va al cuerpo se detecta', WEB_PROD.replace(/<h1(?=[\s>])/, '<h2').replace('</h1>', '</h2>').replace('<main>', `<main><h1>${PAGINAS_WEB.nombre}</h1>`), laIntro(PAGINAS_WEB))
controlPositivo('algo antes de la intro se detecta', WEB_PROD.replace(/^(<div[^>]*>)/, '$1<p>antes</p>'), laIntro(PAGINAS_WEB))
controlPositivo('la bajada en un solo párrafo se detecta', `<div><p>${PAGINAS_WEB.problema.titulo} ${PAGINAS_WEB.problema.texto}</p></div>`, bajadaEnDosParrafos(PAGINAS_WEB))
controlPositivo('  y el título del problema como heading', `<div><h2>${PAGINAS_WEB.problema.titulo}</h2><p>${PAGINAS_WEB.problema.titulo}</p><p>${PAGINAS_WEB.problema.texto}</p></div>`, bajadaEnDosParrafos(PAGINAS_WEB))
// El nombre manda en los cuatro lugares que lo dicen: el h1, el `Service` y la segunda miga del JSON-LD, y el comienzo del title.
const nombreCoherente = (servicio: Servicio, html: string, ld: string): boolean =>
  h1Dice(servicio)(html) && ld.includes(`"@type":"Service","name":${JSON.stringify(servicio.nombre)}`) &&
  ld.includes(`"position":2,"name":${JSON.stringify(servicio.nombre)}`) && servicio.seo.title.startsWith(`${servicio.nombre} · `)
afirmarIgual(fallan((p) => nombreCoherente(p.servicio, p.html, JSON.stringify(jsonLdDe(p.servicio)))), [], '  el h1 dice lo mismo que el Service y la segunda miga del JSON-LD y que el comienzo del title')
controlPositivo('  un JSON-LD con otro nombre se detecta', JSON.stringify(jsonLdDe(PAGINAS_WEB)).replace(`"position":2,"name":"${PAGINAS_WEB.nombre}"`, '"position":2,"name":"Otra"'), (ld: string) => nombreCoherente(PAGINAS_WEB, WEB_PROD, ld))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los bloques, en el orden de la maqueta (M0 §1.3)')

// [M1] El orden de la maqueta: la intro (el problema) y los diez del cuerpo. «Prueba» y «Del blog» salieron (funcionalidad quitada).
const ORDEN_DE_LA_MAQUETA = ['problema', 'que-hacemos', 'que-incluye', 'precio', 'llamado-del-precio', 'extra', 'trabajos', 'proceso', 'faq', 'llamado', 'cierre']
const sin = (...fuera: string[]): string[] => ORDEN_DE_LA_MAQUETA.filter((b) => !fuera.includes(b))
/** Lo que lleva cada página: Extra y [M3] el video de trabajos solo existen en web, en los dos modos. */
const ESPERADO: Readonly<Record<string, { readonly dev: readonly string[]; readonly prod: readonly string[] }>> = {
  'paginas-web': { dev: ORDEN_DE_LA_MAQUETA, prod: ORDEN_DE_LA_MAQUETA },
  'software-a-medida': { dev: sin('extra', 'trabajos'), prod: sin('extra', 'trabajos') },
  'ia-y-automatizaciones': { dev: sin('extra', 'trabajos'), prod: sin('extra', 'trabajos') },
}
afirmarIgual(fallan((p) => JSON.stringify(bloquesEnOrden(p.html)) === JSON.stringify(ESPERADO[p.servicio.slug]?.[p.enDesarrollo ? 'dev' : 'prod'])), [], 'las tres páginas, en los dos modos: exactamente los bloques que les tocan, en el orden de la maqueta')
afirmarIgual(fallan((p) => respetaElOrden(bloquesEnOrden(p.html), ORDEN_DE_LA_MAQUETA)), [], '  y ninguno fuera de su lugar')
controlPositivo('dos bloques cambiados de lugar se detectan', ['problema', 'que-incluye', 'que-hacemos', 'precio'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('un bloque que no es de la maqueta se detecta', ['problema', 'inventado'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('  y la sección de casos de antes, «prueba», también', [...sin('trabajos', 'proceso', 'faq', 'llamado', 'cierre'), 'prueba'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
// Del blog salió del orden: ni con un artículo que sí tenga href se monta.
const conBlog = pagina({ ...PAGINAS_WEB, articulos: [{ titulo: 'Una nota', href: '/v3/blog/una-nota' }] }, false)
const sinDelBlog = (html: string): boolean => !bloquesEnOrden(html).includes('del-blog') && !textoVisible(html).includes('Del blog')
afirmar(sinDelBlog(conBlog) && JSON.stringify(bloquesEnOrden(conBlog)) === JSON.stringify(ESPERADO['paginas-web']?.prod), 'Del blog no se monta, ni con un artículo que tiene href: salió del orden hasta que exista el blog')
controlPositivo('  una página con Del blog se detecta', `${WEB_PROD}<section data-bloque="del-blog"><h2>Del blog</h2></section>`, sinDelBlog)
// S3b · el orden, ajustado a la intro: el problema es la intro y el cuerpo arranca en Qué hacemos.
const partidaEnDos = (html: string): boolean =>
  JSON.stringify(bloquesEnOrden(intro(html) ?? '')) === JSON.stringify(['problema']) && bloquesEnOrden(cuerpo(html))[0] === 'que-hacemos' &&
  respetaElOrden(bloquesEnOrden(cuerpo(html)), sin('problema'))
afirmarIgual(fallan((p) => partidaEnDos(p.html)), [], 'las tres páginas, en los dos modos: la intro lleva un solo bloque, el problema, y el cuerpo empieza en Qué hacemos y sigue el orden del SPEC')
controlPositivo('un bloque del cuerpo metido en la intro se detecta', `<div><div ${ATRIBUTO_DE_LA_INTRO}="x"><section data-bloque="problema"></section><section data-bloque="que-hacemos"></section></div><main><section data-bloque="que-incluye"></section></main></div>`, partidaEnDos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El CTA abre el contacto y precarga el servicio — sin data-servicio (P-S1)')

const envoltorios = (html: string): string[] => aperturas(html, 'div').filter((d) => d.includes('data-abre-contacto'))
const lleva = (idEnElHome: string) => (apertura: string): boolean =>
  apertura.includes('data-abre-contacto="panel"') && apertura.includes(`data-precarga="${idEnElHome}"`)
afirmarIgual(envoltorios(WEB_PROD).length, 3, 'Páginas web: tres envoltorios de apertura — el CTA del precio, el llamado y el cierre')
afirmar(envoltorios(bloqueDe(WEB_PROD, 'llamado') ?? '').length === 1, '  y el bloque del llamado tiene uno')
// [M1] El CTA de debajo del precio (D3): el bloque que sigue al precio, con un solo envoltorio y SOLO el botón (ni título ni texto).
const ctaDelPrecio = (servicio: Servicio) => (html: string): boolean => {
  const orden = bloquesEnOrden(html)
  const bloque = bloqueDe(html, 'llamado-del-precio') ?? ''
  const soloElRotulo = textoVisible(bloque).split(servicio.cta.boton).join('').trim() === '' && textoVisible(bloque).includes(servicio.cta.boton)
  return orden[orden.indexOf('precio') + 1] === 'llamado-del-precio' && envoltorios(bloque).length === 1 && envoltorios(bloque).every(lleva(servicio.idEnElHome)) &&
    encabezados(bloque).length === 0 && soloElRotulo
}
afirmarIgual(fallan((p) => ctaDelPrecio(p.servicio)(p.html)), [], 'las tres páginas: debajo del precio va el CTA, solo el botón, con data-abre-contacto="panel" y la precarga de SU servicio')
const BLOQUE_DEL_CTA_DEL_PRECIO = bloqueDe(WEB_PROD, 'llamado-del-precio') ?? ''
controlPositivo('  un CTA del precio con título se detecta', WEB_PROD.replace(BLOQUE_DEL_CTA_DEL_PRECIO, BLOQUE_DEL_CTA_DEL_PRECIO.replace('<div', '<h2>¿Arrancamos?</h2><div')), ctaDelPrecio(PAGINAS_WEB))
controlPositivo('  uno con la precarga de otro servicio', WEB_PROD.replace(BLOQUE_DEL_CTA_DEL_PRECIO, BLOQUE_DEL_CTA_DEL_PRECIO.replace('data-precarga="web"', 'data-precarga="software"')), ctaDelPrecio(PAGINAS_WEB))
controlPositivo('  y uno que se fue detrás de Extra', WEB_PROD.replace(BLOQUE_DEL_CTA_DEL_PRECIO, '').replace(/(<section data-bloque="extra"[\s\S]*?<\/section>)/, `$1${BLOQUE_DEL_CTA_DEL_PRECIO}`), ctaDelPrecio(PAGINAS_WEB))
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
// [M3] El marcador del video se RETIRÓ con su funcionalidad: el video existe, y el slot de trabajos se monta en los dos modos.
// [M2a] El precio de web va en dos versiones (la de debajo de 768 y las diagonales): la Simple lleva su marcador en cada una.
const versionDelPrecio = (html: string, cual: 'calibres' | 'diagonales'): string => elementoConAtributo(bloqueDe(html, 'precio') ?? '', 'data-precio="' + cual + '"') ?? ''
afirmarIgual([cuenta(WEB_DEV, MARCADOR_A_DEFINIR), cuenta(versionDelPrecio(WEB_DEV, 'calibres'), MARCADOR_A_DEFINIR), cuenta(versionDelPrecio(WEB_DEV, 'diagonales'), MARCADOR_A_DEFINIR)], [3, 1, 1], 'Páginas web en desarrollo: tres marcadores — la Simple (autogestionable), una vez en cada versión del precio, y el plan mensual del mantenimiento')
afirmar(!(bloqueDe(WEB_DEV, 'trabajos') ?? MARCADOR_A_DEFINIR).includes(MARCADOR_A_DEFINIR) && bloqueDe(WEB_PROD, 'trabajos') !== null, '  [M3] el slot de trabajos ya no lleva marcador: se monta con el video, en desarrollo y en producción')
afirmar(textoVisible(WEB_DEV).includes('Plan mensual') && !textoVisible(WEB_PROD).includes('Plan mensual'), '  la fila «Plan mensual» solo existe en desarrollo')
afirmarIgual((['calibres', 'diagonales'] as const).map((cual) => [cuenta(versionDelPrecio(WEB_DEV, cual), 'Autogestionable'), cuenta(versionDelPrecio(WEB_PROD, cual), 'Autogestionable')]), [[3, 2], [3, 2]], '  «Autogestionable», en cada versión del precio: tres veces en desarrollo, dos en producción (la Simple no lo dice mientras esté en [a definir])')
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
titulo('6 · Ningún hex: la intro lleva el token claro de SU servicio y el cuerpo el oscuro, los dos del tema')

// [M1] P-H2 cerrado: el claro dejó de ser un hex en los datos y es el token del tema. Ningún hex en ninguna parte del marcado.
const sinHex = (html: string): boolean => hexSueltos(html).length === 0
afirmarIgual(fallan((p) => sinHex(p.html)), [], 'ninguna página tiene un hex en el marcado, ni en el cuerpo ni en la intro')
controlPositivo('un hex en el cuerpo se detecta', WEB_PROD.replace('<main>', '<main><p style="color:#1D5B8F">x</p>'), sinHex)
controlPositivo('  y el claro de antes, escrito en el style de la intro', WEB_PROD.replace('--color-acento:var(--color-acento-web-claro)', '--color-acento:#8FC0E8'), sinHex)
// Lo esperado sale del TEMA (sus reglas de contexto por servicio), no de `tokenDelAcento`: si la derivación se rompe, esto lo ve.
const TEMA = readFileSync(path.join(AQUI, '../../../theme-develop.css'), 'utf8')
const TOKENS_DEL_TEMA = tokensDelTema(TEMA)
const ACENTO_DEL_TEMA = acentosDelTemaPorServicio(TEMA)
const tokenSegunElTema = (id: string): string => ACENTO_DEL_TEMA.get(id) ?? '(el tema no lo dice)'
// [M1] El lector del tema lee la declaración que busca entre todas las de la regla: desde B1.2c cada una trae dos (merge-2 §5).
const leeLasTresReglas = (lector: (css: string) => Map<string, string>): boolean => IDS_DE_SERVICIO.every((id) => lector(TEMA).has(id))
afirmar(leeLasTresReglas(acentosDelTemaPorServicio) && leeLasTresReglas((css) => declaracionDelTemaPorServicio(css, '--color-acento-claro')), 'el lector del tema encuentra las tres reglas [data-servicio], el acento y su alias claro, aunque cada regla traiga dos declaraciones')
afirmar(declaracionDelTemaPorServicio('[data-servicio="web"] { --color-acento-claro: var(--b); --color-acento: var(--a); }', '--color-acento').get('web') === '--a', '  y en cualquier orden: el alias claro no se confunde con el acento')
const LECTOR_DE_ANTES = (css: string): Map<string, string> =>
  new Map([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\[data-servicio="([^"]+)"\]\s*\{\s*--color-acento:\s*var\((--[a-z0-9-]+)\);\s*\}/g)].map((m) => [m[1] ?? '', m[2] ?? '']))
controlPositivo('  el lector de antes, que esperaba una sola declaración por regla, se detecta', LECTOR_DE_ANTES, leeLasTresReglas)
const CLARO_DEL_TEMA = declaracionDelTemaPorServicio(TEMA, '--color-acento-claro')
const claroSegunElTema = (id: string): string => CLARO_DEL_TEMA.get(id) ?? '(el tema no lo dice)'
afirmarIgual(IDS_DE_SERVICIO.filter((id) => !TOKENS_DEL_TEMA.has(claroSegunElTema(id)) || tokenDelAcentoClaro(id) !== claroSegunElTema(id)), [], `el token claro de cada servicio es el que el tema le da a su alias claro en su contexto, y está declarado en su @theme static: ${IDS_DE_SERVICIO.map(claroSegunElTema).join(', ')}`)
controlPositivo('  un servicio sin claro en el tema se detecta', 'otro', (id: string) => CLARO_DEL_TEMA.has(id))
const acentoDeLaIntro = (servicio: Servicio) => (html: string): boolean =>
  (/\sstyle="([^"]*)"/.exec(aperturaDe(intro(html)))?.[1] ?? '') === `--color-acento:var(${claroSegunElTema(servicio.idEnElHome)})`
afirmarIgual(fallan((p) => acentoDeLaIntro(p.servicio)(p.html)), [], '  y la intro fija el acento con el token claro de SU servicio, derivado de idEnElHome, por var()')
controlPositivo('  el claro de otro servicio en la intro se detecta', WEB_PROD.replace(`var(${claroSegunElTema('web')})`, `var(${claroSegunElTema('software')})`), acentoDeLaIntro(PAGINAS_WEB))
controlPositivo('  y el oscuro en la intro', WEB_PROD.replace(`var(${claroSegunElTema('web')})`, `var(${tokenSegunElTema('web')})`), acentoDeLaIntro(PAGINAS_WEB))
afirmarIgual(IDS_DE_SERVICIO.filter((id) => !TOKENS_DEL_TEMA.has(tokenSegunElTema(id)) || tokenDelAcento(id) !== tokenSegunElTema(id)), [], `el token oscuro de cada servicio es el que el tema le da en su contexto, y está declarado en su @theme static: ${IDS_DE_SERVICIO.map(tokenSegunElTema).join(', ')}`)
controlPositivo('un token que el tema no declara se detecta', '--color-acento-otro', (token: string) => TOKENS_DEL_TEMA.has(token))
controlPositivo('un servicio que el tema no conoce se detecta', 'otro', (id: string) => ACENTO_DEL_TEMA.has(id))
const acentoDelCuerpo = (servicio: Servicio) => (html: string): boolean =>
  (/^<div style="([^"]*)"/.exec(html)?.[1] ?? '') === `--color-acento:var(${tokenSegunElTema(servicio.idEnElHome)})`
afirmarIgual(fallan((p) => acentoDelCuerpo(p.servicio)(p.html)), [], '  y la raíz fija el acento del cuerpo con el token de SU servicio, derivado de idEnElHome, por var(): ningún hex')
controlPositivo('el token de otro servicio se detecta', WEB_PROD.replace(`var(${tokenSegunElTema('web')})`, `var(${tokenSegunElTema('software')})`), acentoDelCuerpo(PAGINAS_WEB))
controlPositivo('el claro en la raíz se detecta', WEB_PROD.replace(`var(${tokenSegunElTema('web')})`, `var(${claroSegunElTema('web')})`), acentoDelCuerpo(PAGINAS_WEB))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Los trabajos: de PROYECTOS sale el nombre (nunca la reseña ni lo resuelto), y el enlace va al caso en el Portfolio')

const PROHIBIDOS = valoresProhibidos(FUENTE_DE_PROYECTOS)
afirmar(PROHIBIDOS.length > 0, `la lista de lo prohibido no es vacía: ${PROHIBIDOS.length} valores de resena, problemaResuelto, problemaCliente, queHicimos y resultado`)
const sinLoProhibido = (html: string): boolean => {
  const texto = textoVisible(html)
  return [...PROHIBIDOS, ...MARCADORES_DE_LA_LLAVE].every((valor) => !texto.includes(valor))
}
afirmarIgual(fallan((p) => sinLoProhibido(p.html)), [], 'ninguno de esos valores llega al marcado, ni los marcadores de la llave del contenido inventado')
controlPositivo('un render que pinta una reseña se detecta', `${WEB_PROD}<p>${PROHIBIDOS.at(0) ?? 'x'}</p>`, sinLoProhibido)
controlPositivo('un render que pinta el marcador de la llave se detecta', `${WEB_PROD}<p>[TESTIMONIO] · pendiente</p>`, sinLoProhibido)
// [M1] La sección de casos con pósters (`Prueba.tsx`) se RETIRÓ con su funcionalidad, y con ella sus tres afirmaciones (los casos con
// rubro, enlace y pósters, y las seis imágenes con alt y sizes). Los trabajos pasan a ser una frase cada uno en Cómo trabajamos.
const LEEN_PROYECTOS = ['../bloques/Proceso.tsx', '../rutas.ts'].map((f) => ({ f, codigo: sinComentarios(readFileSync(path.join(AQUI, f), 'utf8')) }))
const leeLoProhibido = (fuente: string): boolean => /\b(resena|problemaResuelto|problemaCliente|queHicimos|resultado)\b/.test(fuente)
afirmarIgual(LEEN_PROYECTOS.filter((x) => leeLoProhibido(x.codigo)).map((x) => x.f), [], 'y el código que lee PROYECTOS (Proceso.tsx y rutas.ts) ni nombra esos campos: solo el slug y el nombre')
controlPositivo('un fuente que lee la reseña se detecta', 'const r = proyecto.resena', (f: string) => !leeLoProhibido(f))
const CASOS_DE_WEB = PAGINAS_WEB.prueba.casos.flatMap((caso) => (caso.tipo === 'proyecto' ? [caso] : []))
const fraseDelTrabajo = (html: string) => (slug: string, texto: string): boolean => {
  const proyecto = FUENTE_DE_PROYECTOS.find((p) => p.slug === slug)
  const lista = /<ul[^>]*data-pieza="trabajos-de-servicio"[^>]*>([\s\S]*?)<\/ul>/.exec(bloqueDe(html, 'proceso') ?? '')?.[1] ?? ''
  return proyecto !== undefined && [...lista.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].some((li) => textoVisible(li[1] ?? '') === `${proyecto.nombre}${texto}`)
}
afirmarIgual(CASOS_DE_WEB.filter((c) => !fraseDelTrabajo(WEB_PROD)(c.slug, c.texto)).map((c) => c.slug), [], `Cómo trabajamos, en Páginas web: una frase por cada uno de los ${CASOS_DE_WEB.length} trabajos, con el nombre de la fuente y el texto propio que ya existía`)
controlPositivo('una página sin las frases se detecta', '<main></main>', (h: string) => CASOS_DE_WEB.every((c) => fraseDelTrabajo(h)(c.slug, c.texto)))
// [M3] Las únicas imágenes son los dos pósters del video de trabajos (Páginas web): decorativas, adentro de su capa aria-hidden.
const VIDEO_DE_WEB = PAGINAS_WEB.prueba.video
const POSTERS_DE_WEB = VIDEO_DE_WEB === null ? [] : [VIDEO_DE_WEB.horizontal.poster, VIDEO_DE_WEB.vertical.poster]
const capaDelVideo = (html: string): string => /<div aria-hidden="true" class="absolute inset-0">[\s\S]*?<\/div>/.exec(bloqueDe(html, 'trabajos') ?? '')?.[0] ?? ''
const soloLosPosters = (servicio: Servicio) => (html: string): boolean => {
  const imagenes = aperturas(html, 'img')
  if (servicio.prueba.video === null) return imagenes.length === 0
  const enLaCapa = aperturas(capaDelVideo(html), 'img')
  return imagenes.length === 2 && enLaCapa.length === 2 && enLaCapa.every((img) => img.includes(' alt=""')) &&
    POSTERS_DE_WEB.every((poster) => enLaCapa.some((img) => img.includes(encodeURIComponent(poster))))
}
afirmar(POSTERS_DE_WEB.length === 2, 'Páginas web tiene video de trabajos, con dos pósters')
afirmarIgual(fallan((p) => soloLosPosters(p.servicio)(p.html)), [], '  y son las únicas imágenes de las tres páginas: los dos, decorativos (alt vacío), adentro de la capa aria-hidden del slot de trabajos; Software e IA, ninguna')
controlPositivo('  una imagen fuera de la capa se detecta', `${WEB_PROD}<img src="/portfolio/el-garage/escritorio.webp" alt="El Garage">`, soloLosPosters(PAGINAS_WEB))
controlPositivo('  un póster con texto alternativo se detecta', WEB_PROD.replace(' alt=""', ' alt="Trabajos"'), soloLosPosters(PAGINAS_WEB))
controlPositivo('  un póster en Software se detecta', `${pagina(SOFTWARE_A_MEDIDA, false)}<img src="/x.webp" alt="">`, soloLosPosters(SOFTWARE_A_MEDIDA))
const sinCasosDeWeb = (html: string): boolean => CASOS_DE_WEB.every((c) => !textoVisible(html).includes(c.texto))
afirmarIgual(fallan((p) => p.servicio.slug === 'paginas-web' || sinCasosDeWeb(p.html)), [], '  y en Software e IA no aparece ningún caso de Páginas web (tampoco en el slot de trabajos)')
controlPositivo('  un caso de web en otra página se detecta', `${pagina(SOFTWARE_A_MEDIDA, false)}<p>${CASOS_DE_WEB[0]?.texto ?? 'x'}</p>`, sinCasosDeWeb)
// El deep link del Portfolio de B1: `#portfolio-<slug>` (docs/rediseno/SPRINT-B1-PORTFOLIO.md:471). Lo esperado se escribe acá con el
// formato del documento —no con la función que lo arma— y se confirma que el ancla existe en el home.
const AL_GARAGE = `${HREF_DEL_HOME}#portfolio-el-garage`
afirmar(ANCLAS_DEL_PORTFOLIO.some((a) => `${HREF_DEL_HOME}#${a.id}` === AL_GARAGE), `el ancla de El Garage existe en el Portfolio del home (portfolio/anclas.ts): ${AL_GARAGE}`)
const enlacesAlPortfolio = (html: string): string[] => valoresDe(bloqueDe(html, 'proceso') ?? '', 'href').filter((h) => h.startsWith(`${HREF_DEL_HOME}#`))
const vaAlGarage = (html: string): boolean => JSON.stringify(enlacesAlPortfolio(html)) === JSON.stringify([AL_GARAGE])
afirmar(vaAlGarage(WEB_PROD) && vaAlGarage(WEB_DEV), 'Cómo trabajamos, en Páginas web: un enlace, al caso de El Garage en el Portfolio, con el deep link de B1')
afirmarIgual(fallan((p) => p.servicio.slug === 'paginas-web' || enlacesAlPortfolio(p.html).length === 0), [], '  y en Software e IA, sin un proyecto del Portfolio entre sus casos, no hay enlace a un caso de web')
controlPositivo('  un enlace a otro caso se detecta', WEB_PROD.replace(AL_GARAGE, `${HREF_DEL_HOME}#portfolio-esquina-estudio`), vaAlGarage)
controlPositivo('  y uno a la sección y no al caso', WEB_PROD.replace(AL_GARAGE, `${HREF_DEL_HOME}#trabajos`), vaAlGarage)

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
afirmarIgual(fallan((p) => !/whatsapp/i.test(textoVisible(p.html))), [], 'el bot de WhatsApp no se ofrece: ni una mención en el texto de ninguna página (el título del blog que lo nombra no se monta: Del blog salió del orden)')
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
// [M1] Más los deep links del Portfolio del home (las anclas que el home publica, `portfolio/anclas.ts`).
const PERMITIDOS = new Set<string>([HREF_DEL_HOME, ...PUBLICADOS.map(hrefDe), '/login', ...ANCLAS_DEL_PORTFOLIO.map((a) => `${HREF_DEL_HOME}#${a.id}`)])
const enlacesBien = (html: string): boolean => aperturas(html, 'a').every((a) => /\shref="[^"]+"/.test(a)) && enlacesInternos(html).every((h) => PERMITIDOS.has(h))
afirmarIgual(fallan((p) => enlacesBien(p.html)), [], 'todo <a> tiene href, y los internos solo llevan al home, a una página de PUBLICADOS, a /login o a un ancla del Portfolio del home')
controlPositivo('un enlace a una página que no es de PUBLICADOS se detecta', '<a href="/v3/otra-pagina">x</a>', enlacesBien)
controlPositivo('  y uno a un ancla del Portfolio que no existe', `<a href="${HREF_DEL_HOME}#portfolio-otro">x</a>`, enlacesBien)
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
afirmarIgual(dondeEsDeCliente(FUENTES), ['movimiento/Gatillo.tsx', 'movimiento/RepartoDelPrecio.tsx', 'movimiento/Revelado.tsx', 'movimiento/TitularQueEntra.tsx', 'movimiento/VideoDeFondo.tsx'], 'el único código de cliente son los cinco de movimiento/ (los dos envoltorios del revelado, [M1] el gatillo, que observa un cruce, [M2a] el reparto del precio en diagonales y [M3] el video de trabajos): todo lo demás es de servidor')
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
/**
 * [M1] CÓMO ENTRA CADA BLOQUE, la tabla del M0: las marcas del árbol quieto de los revelados del home (`data-arbol`: el título y el
 * panel progresivos) y los gatillos (`data-gatillo`). El FAQ revela solo el título (S2b: el panel cambia de alto al abrir una pregunta y
 * un revelado atado al scroll lo corría de 15 a 27 px); los CTA y el slot del video entran con el gatillo; el cierre, sin revelado (así se
 * fueron los 21 px que quedaba corrido al final del scroll).
 */
const REVELADO_ESPERADO: Readonly<Record<string, { readonly arbol: number; readonly gatillo: number }>> = {
  'que-hacemos': { arbol: 2, gatillo: 0 },
  'que-incluye': { arbol: 2, gatillo: 0 },
  precio: { arbol: 2, gatillo: 0 },
  'llamado-del-precio': { arbol: 0, gatillo: 1 },
  extra: { arbol: 2, gatillo: 0 },
  trabajos: { arbol: 0, gatillo: 1 }, // [M3] el texto entero con el gatillo: el título vive al pie de un cuadro de una pantalla
  proceso: { arbol: 2, gatillo: 0 },
  faq: { arbol: 1, gatillo: 0 },
  llamado: { arbol: 1, gatillo: 1 },
  cierre: { arbol: 0, gatillo: 0 },
}
const cuentaEnElBloque = (html: string, nombre: string, aguja: string): number => (bloqueDe(html, nombre) ?? '').split(aguja).length - 1
// [M2a] El precio en diagonales (web) suma el Bloque del contrato que reparte el progreso a los tres paneles: una marca más.
const ESPERADO_DE_LAS_DIAGONALES = { arbol: 3, gatillo: 0 }
const entraComoDice = (html: string): boolean => SIN_PROBLEMA(html).every((b) => {
  const esperado = b === 'precio' && (bloqueDe(html, 'precio') ?? '').includes('data-precio="diagonales"') ? ESPERADO_DE_LAS_DIAGONALES : REVELADO_ESPERADO[b]
  return esperado !== undefined && cuentaEnElBloque(html, b, `data-arbol="${MARCA_HOME_QUIETO}"`) === esperado.arbol && cuentaEnElBloque(html, b, ' data-gatillo="') === esperado.gatillo
})
afirmarIgual(fallan((p) => entraComoDice(p.html)), [], 'cada bloque entra como dice la tabla del M0: progresivo (título y panel), el panel del FAQ quieto, los dos CTA y el slot del video con el gatillo y el cierre sin revelado')
controlPositivo('un cierre con revelado se detecta', `<footer data-bloque="cierre"><div data-arbol="${MARCA_HOME_QUIETO}"></div></footer>`, entraComoDice)
controlPositivo('un FAQ con el panel revelado se detecta', `<section data-bloque="faq"><div data-arbol="${MARCA_HOME_QUIETO}"></div><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, entraComoDice)
controlPositivo('un llamado con el panel progresivo en vez del gatillo se detecta', `<section data-bloque="llamado"><div data-arbol="${MARCA_HOME_QUIETO}"></div><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, entraComoDice)
controlPositivo('un bloque con el panel sin revelar se detecta', `<section data-bloque="precio"><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, entraComoDice)
// [M1] El gatillo en reposo: en el HTML servido (sin la coreografía instalada, que es lo mismo que con movimiento reducido) cada uno está
// QUIETO, a la vista y sin transformada. Nada invisible en reposo.
/** Las clases del hijo de cada gatillo: el que se corre y se funde. */
const clasesDeLosGatillos = (html: string): string[][] => [...html.matchAll(/\sdata-gatillo="[^"]*"[^>]*><div class="([^"]*)"/g)].map((m) => (m[1] ?? '').split(/\s+/))
const gatillosALaVista = (html: string): boolean =>
  valoresDe(html, 'data-gatillo').length > 0 && valoresDe(html, 'data-gatillo').every((e) => e === 'quieto') &&
  clasesDeLosGatillos(html).length === valoresDe(html, 'data-gatillo').length &&
  !clasesDeLosGatillos(html).some((clases) => clases.some((clase) => clase === 'opacity-0' || clase.startsWith('translate-')))
afirmarIgual(fallan((p) => gatillosALaVista(p.html)), [], 'cada gatillo, en el HTML servido y con movimiento reducido, está quieto y a la vista: sin opacidad cero ni corrimiento')
controlPositivo('  un gatillo escondido en el servidor se detecta', WEB_PROD.replace('data-gatillo="quieto"', 'data-gatillo="espera"'), gatillosALaVista)
controlPositivo('  y uno con la clase del escondido', WEB_PROD.replace('data-gatillo="quieto"><div class="', 'data-gatillo="quieto"><div class="opacity-0 '), gatillosALaVista)
// La máquina del gatillo, pura (`movimiento/disparo.ts`): las reglas del remate del home, sobre las cuatro entradas de `_contrato/cruce.ts`.
const sinMovimientoALaVista = (maquina: typeof siguienteEstado): boolean => ESTADOS_DEL_GATILLO.every((e) => estaALaVista(maquina(e, { tipo: 'sin-movimiento' })))
afirmar(sinMovimientoALaVista(siguienteEstado), 'el gatillo sin movimiento (reducido, o sin la coreografía) queda quieto y a la vista desde cualquiera de sus cuatro estados')
controlPositivo('  una máquina que sin movimiento deja lo escondido escondido se detecta', ((e: EstadoDelGatillo) => e) as typeof siguienteEstado, sinMovimientoALaVista)
const cargas = (maquina: typeof siguienteEstado): EstadoDelGatillo[] => ENTRADAS_AL_TRAMO.map((entrada) => maquina('quieto', { tipo: 'carga', entrada }))
afirmarIgual(cargas(siguienteEstado), ['quieto', 'espera', 'quieto', 'quieto'], 'al cargar se posa sin gesto: a la vista en todo cruce salvo debajo de la línea (arriba-bajando, arriba-subiendo, abajo-bajando, abajo-subiendo)')
const cruces = (maquina: typeof siguienteEstado, desde: EstadoDelGatillo): EstadoDelGatillo[] => ENTRADAS_AL_TRAMO.map((entrada) => maquina(desde, { tipo: 'cruce', entrada }))
afirmarIgual([cruces(siguienteEstado, 'espera'), cruces(siguienteEstado, 'puesto')], [['puesto', 'ido', 'quieto', 'quieto'], ['puesto', 'ido', 'puesto', 'puesto']], '  bajando por la línea entra, subiendo por encima se va en espejo, y pasarla de largo no la saca; un salto por encima de la línea se posa (A13)')
const maquinaQueLaSacaArriba: typeof siguienteEstado = (estado, evento) => (evento.tipo === 'cruce' && evento.entrada === 'abajo-bajando' ? 'ido' : siguienteEstado(estado, evento))
controlPositivo('  una máquina que la saca cuando se va por arriba, bajando, se detecta', maquinaQueLaSacaArriba, (m: typeof siguienteEstado) => JSON.stringify(cruces(m, 'puesto')) === JSON.stringify(['puesto', 'ido', 'puesto', 'puesto']))
// [M1] La línea vuelve a la del remate del home, para que la salida al subir pase a la vista; la franja de debajo la cubre la guarda.
const lineaDelRemate = (linea: number): boolean => linea === DISPARO_DEL_REMATE
afirmar(lineaDelRemate(LINEA_DEL_DISPARO), `la línea de disparo es la del remate del home: ${String(DISPARO_DEL_REMATE)} % desde abajo (tu-panel/entrada.ts)`)
controlPositivo('  la línea en el borde (la salida pasaría fuera de la vista) se detecta', 0, lineaDelRemate)
// [M1] LA GUARDA EN REPOSO (P-H25): con el scroll quieto, lo que está a la vista y no se disparó se dispara; lejos de la vista, nada.
const reposos = (maquina: typeof siguienteEstado, aLaVista: boolean): EstadoDelGatillo[] => ESTADOS_DEL_GATILLO.map((e) => maquina(e, { tipo: 'reposo', aLaVista }))
afirmarIgual([reposos(siguienteEstado, true), reposos(siguienteEstado, false)], [['quieto', 'puesto', 'puesto', 'puesto'], ['quieto', 'espera', 'puesto', 'ido']], 'en reposo, a la vista se dispara lo que no se disparó (espera e ido pasan a puesto); fuera de la vista nada cambia')
// El caso de 1024: cargó con el tope ya en el cuadro pero debajo de la línea, y el scroll paró sin cruzarla.
const enLaFranja = (maquina: typeof siguienteEstado): boolean => estaALaVista(maquina(maquina('quieto', { tipo: 'carga', entrada: 'arriba-subiendo' }), { tipo: 'reposo', aLaVista: true }))
afirmar(enLaFranja(siguienteEstado), '  un gatillo a la vista que no cruzó la línea queda visible en reposo (el CTA del precio a 1024)')
const maquinaSinLaGuarda: typeof siguienteEstado = (estado, evento) => (evento.tipo === 'reposo' ? estado : siguienteEstado(estado, evento))
controlPositivo('  sin la guarda, queda escondido a la vista: se detecta', maquinaSinLaGuarda, enLaFranja)
// La salida sigue: subiendo por encima de la línea se va, y fuera de la vista el reposo no la vuelve a poner.
const saleYSeQueda = (maquina: typeof siguienteEstado): boolean => maquina(maquina('puesto', { tipo: 'cruce', entrada: 'arriba-subiendo' }), { tipo: 'reposo', aLaVista: false }) === 'ido'
afirmar(saleYSeQueda(siguienteEstado), '  y la salida al subir sigue: se va al cruzar la línea, y fuera de la vista el reposo no la trae de vuelta')
const maquinaQueTodoLoPone: typeof siguienteEstado = (estado, evento) => (evento.tipo === 'reposo' ? 'puesto' : siguienteEstado(estado, evento))
controlPositivo('  una guarda que pone también lo que no está a la vista se detecta', maquinaQueTodoLoPone, saleYSeQueda)

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
titulo('12 · [M3] El video de trabajos: solo en Páginas web, sin autoplay, con la pausa que alterna, el velo y la línea literal')

// El viejo §12 («Probá el panel» en el slot de trabajos de IA, como el CtaEnlace del home) se RETIRÓ con su funcionalidad: el slot es
// solo de Páginas web. El dato sigue en IA para la réplica (`datos.invariant.ts`).
const VIDEO = ((): NonNullable<typeof VIDEO_DE_WEB> => {
  if (VIDEO_DE_WEB === null) throw new Error('paginas-web: no tiene video de trabajos')
  return VIDEO_DE_WEB
})()
afirmarIgual(SERVICIOS.filter((s) => s.prueba.video !== null).map((s) => s.slug), ['paginas-web'], 'solo Páginas web tiene video de trabajos en sus datos')
const videos = (html: string): string[] => aperturas(html, 'video')
/**
 * Sin movimiento reducido (el árbol ya hidratado): UN `<video>`, mudo, en bucle, en línea y sin precarga, con su atributo propio, y sin
 * `autoplay` ni `src`. El HTML que sirve /v3 es la rama reducida (el proveedor del home sirve `reducedMotion: 'always'` hasta hidratar):
 * ahí van solo los pósters, y el navegador lo confirma.
 */
const videoServido = (html: string): boolean => {
  const lista = videos(html)
  const v = lista[0] ?? ''
  return lista.length === 1 && [' muted=""', ' loop=""', ' playsinline=""', ' preload="none"', ' data-video-de-trabajos=""'].every((a) => v.toLowerCase().includes(a)) &&
    !/\s(autoplay|src)=/i.test(v)
}
afirmar(videoServido(bloqueDe(WEB_PROD, 'trabajos') ?? '') && videoServido(bloqueDe(WEB_DEV, 'trabajos') ?? '') && videoServido(WEB_PROD), 'Páginas web, en los dos modos, sin movimiento reducido: un solo <video> —muted, loop, playsInline, preload="none", data-video-de-trabajos—, en el slot de trabajos, sin autoplay ni src (la fuente se pide al acercarse)')
const BLOQUE_DEL_VIDEO = bloqueDe(WEB_PROD, 'trabajos') ?? ''
controlPositivo('  un <video> con autoplay se detecta', BLOQUE_DEL_VIDEO.replace('<video ', '<video autoplay="" '), videoServido)
controlPositivo('  uno con la fuente en el HTML servido', BLOQUE_DEL_VIDEO.replace('<video ', `<video src="${VIDEO.horizontal.video}" `), videoServido)
controlPositivo('  y dos <video>', BLOQUE_DEL_VIDEO.replace(/(<video [^>]*><\/video>)/, '$1$1'), videoServido)
// Con movimiento reducido, solo el póster: la capa del medio sin <video>, y la decisión de reproducir nunca da verdadero.
const capa = (reducido: boolean): string => renderToStaticMarkup(<CapaDelVideo horizontal={VIDEO.horizontal} vertical={VIDEO.vertical} reducido={reducido} />)
const soloElPoster = (html: string): boolean => videos(html).length === 0 && aperturas(html, 'img').length === 2 && !/autoplay/i.test(html)
afirmar(soloElPoster(capa(true)), 'con movimiento reducido no hay autoplay: la capa del medio no monta el <video> y quedan los dos pósters')
controlPositivo('  la capa con el video (sin reducir) se detecta', capa(false), soloElPoster)
const BOOLEANOS = [false, true] as const
const MOMENTOS: MomentoDelVideo[] = BOOLEANOS.flatMap((reducido) => BOOLEANOS.flatMap((conFuente) => BOOLEANOS.flatMap((enPantalla) =>
  BOOLEANOS.flatMap((pausadoPorQuienMira) => BOOLEANOS.map((scrollEnMovimiento) => ({ reducido, conFuente, enPantalla, pausadoPorQuienMira, scrollEnMovimiento }))))))
const nuncaConReducido = (decide: typeof debeReproducirse): boolean => MOMENTOS.every((m) => !m.reducido || !decide(m))
afirmar(MOMENTOS.length === 32 && nuncaConReducido(debeReproducirse), '  y la decisión de reproducir nunca da verdadero con movimiento reducido, en los 32 momentos posibles')
afirmarIgual(MOMENTOS.filter(debeReproducirse), [{ reducido: false, conFuente: true, enPantalla: true, pausadoPorQuienMira: false, scrollEnMovimiento: false }], '  sin reducir, anda en un solo momento: con la fuente, en pantalla, sin pausa y con el scroll quieto')
controlPositivo('  una decisión que ignora el reducido se detecta', ((m: MomentoDelVideo) => debeReproducirse({ ...m, reducido: false })) as typeof debeReproducirse, nuncaConReducido)
// La pausa (D5, WCAG 2.2.2): un botón conmutable con nombre fijo, `aria-pressed`, el ícono que cambia, y que alterna.
const botonDeLaPausa = (html: string): string => /<button[^>]*data-pieza="pausa-del-video"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0] ?? ''
const PAUSADO = botonDeLaPausa(renderToStaticMarkup(<BotonDePausa pausado={true} />))
const pausaQueAlterna = (html: string, alterna: (pausado: boolean) => boolean): boolean => {
  const andando = botonDeLaPausa(html)
  return andando.includes(' type="button"') && andando.includes(` aria-label="${ROTULO_DE_LA_PAUSA}"`) && andando.includes(' aria-pressed="false"') && andando.includes('lucide-pause') &&
    PAUSADO.includes(' aria-pressed="true"') && PAUSADO.includes('lucide-play') && alterna(false) && !alterna(true) && alterna(alterna(false)) === false
}
afirmar(pausaQueAlterna(BLOQUE_DEL_VIDEO, siguienteDeLaPausa), `el botón de pausa existe en el slot: type="button", nombre «${ROTULO_DE_LA_PAUSA}», aria-pressed="false" con el ícono de pausa; pausado dice aria-pressed="true" con el de reproducir, y apretarlo alterna`)
controlPositivo('  un botón sin nombre se detecta', BLOQUE_DEL_VIDEO.replace(` aria-label="${ROTULO_DE_LA_PAUSA}"`, ''), (h: string) => pausaQueAlterna(h, siguienteDeLaPausa))
controlPositivo('  un botón que no alterna se detecta', (() => true) as (pausado: boolean) => boolean, (alterna: (pausado: boolean) => boolean) => pausaQueAlterna(BLOQUE_DEL_VIDEO, alterna))
controlPositivo('  y una página sin el botón', WEB_PROD.replace(botonDeLaPausa(WEB_PROD), ''), (h: string) => pausaQueAlterna(h, siguienteDeLaPausa))
const FUENTE_DEL_VIDEO = readFileSync(path.join(AQUI, '../movimiento/VideoDeFondo.tsx'), 'utf8')
const conElPedido = (fuente: string): boolean => fuente.includes('P-H21: reemplazar por BotonPausa')
afirmar(conElPedido(FUENTE_DEL_VIDEO), '  el botón lleva el comentario «P-H21: reemplazar por BotonPausa»: es nuestro hasta que el home publique el suyo')
controlPositivo('  un fuente sin el comentario se detecta', FUENTE_DEL_VIDEO.replace('P-H21', 'P-H2'), conElPedido)
// La línea, dictada (M3), literal. Sus nombres salen de las fuentes: los casos de PROYECTOS, las demos del catálogo del home y la marca de
// LOGOTIPO. El dictado decía «Ethernal, Noir y Skyline»: ganan los nombres del home.
const LINEA_DICTADA = 'Sitios para clientes (El Garage, Esquina Estudio y Banú Scents) y demos propias de develOP (The Ethereal Resort, Noir Dining in the Void y Skyline Estates).'
const laLinea = (html: string): boolean => parrafos(bloqueDe(html, 'trabajos') ?? '').includes(LINEA_DICTADA)
afirmar(laLinea(WEB_PROD) && laLinea(WEB_DEV) && VIDEO.linea === LINEA_DICTADA, `la línea del video es literal, en un párrafo del slot: «${LINEA_DICTADA}»`)
controlPositivo('  la línea con un carácter cambiado se detecta', WEB_PROD.replace('Banú Scents)', 'Banu Scents)'), laLinea)
controlPositivo('  y la del dictado con los nombres cortos', WEB_PROD.replace('The Ethereal Resort, Noir Dining in the Void y Skyline Estates', 'Ethernal, Noir y Skyline'), laLinea)
const nombresDeLasFuentes = (linea: string): boolean =>
  linea.includes(LOGOTIPO) && CASOS_DE_WEB.every((c) => linea.includes(FUENTE_DE_PROYECTOS.find((p) => p.slug === c.slug)?.nombre ?? '\u0000')) &&
  VIDEO.demos.length === 3 && VIDEO.demos.every((slug) => linea.includes(FUENTE_DE_DEMOS.find((d) => d.slug === slug)?.nombre ?? '\u0000'))
afirmar(nombresDeLasFuentes(VIDEO.linea), '  y dice la marca (LOGOTIPO), los tres casos con su nombre de PROYECTOS y las tres demos con su nombre de la sección Demos del home')
controlPositivo('  una línea sin una de las demos se detecta', VIDEO.linea.replace('Skyline Estates', 'Skyline'), nombresDeLasFuentes)
// En Software e IA el slot no se monta: ni el bloque, ni un <video>, ni la pausa.
const sinVideoDeTrabajos = (html: string): boolean => bloqueDe(html, 'trabajos') === null && videos(html).length === 0 && !html.includes('data-video-de-trabajos') && !html.includes('pausa-del-video')
afirmarIgual(fallan((p) => p.servicio.slug === 'paginas-web' || sinVideoDeTrabajos(p.html)), [], 'en Software e IA, en los dos modos, el slot de trabajos no se monta: ni el bloque, ni un <video>, ni la pausa')
controlPositivo('  Software con el video de web se detecta', pagina({ ...SOFTWARE_A_MEDIDA, prueba: { ...SOFTWARE_A_MEDIDA.prueba, video: VIDEO } }, false), sinVideoDeTrabajos)
// El velo (D4): las clases dicen los números de `veloDelVideo.ts`, y el texto del slot va en el papel (`text-fondo`) encima.
const pct = (alfa: number): number => Math.round(alfa * 100)
const veloComoDice = (clases: string): boolean => {
  const c = clases.split(/\s+/)
  return c.includes('bg-linear-to-t') && c.includes(`from-tinta/${pct(VELO_DEL_VIDEO.alfaAlPie)}`) && c.includes(`via-tinta/${pct(VELO_DEL_VIDEO.alfaBajoElTexto)}`) &&
    c.includes(`via-${pct(VELO_DEL_VIDEO.altoDelTexto)}%`) && c.includes('to-transparent') && VELO_DEL_VIDEO.alfaBajoElTexto >= 0.7
}
const textoEnPapel = (html: string): boolean => [...aperturas(html, 'h2'), ...aperturas(html, 'p')].every((a) => clasesDe(a).includes('text-fondo')) && aperturas(html, 'h2').length === 1
afirmar(veloComoDice(CLASES_DEL_VELO) && BLOQUE_DEL_VIDEO.includes(`<div aria-hidden="true" class="absolute inset-0 ${CLASES_DEL_VELO}">`) && textoEnPapel(BLOQUE_DEL_VIDEO),
  `el velo es tinta en degradé: ${pct(VELO_DEL_VIDEO.alfaAlPie)} % al pie y ${pct(VELO_DEL_VIDEO.alfaBajoElTexto)} % (0,7 o más) hasta el ${pct(VELO_DEL_VIDEO.altoDelTexto)} % del alto; el título y la línea van en text-fondo encima`)
// Las clases del control se arman por partes: escritas enteras, el escaneo de Tailwind (que lee los tests) las emitiría.
controlPositivo('  un velo al 60 % bajo el texto se detecta', CLASES_DEL_VELO.replace(`via-tinta/${pct(VELO_DEL_VIDEO.alfaBajoElTexto)}`, `via-tinta/${'6'}0`), veloComoDice)
controlPositivo('  y una línea en tinta sobre el velo', BLOQUE_DEL_VIDEO.replace(/(<p[^>]*class="[^"]*)text-fondo/, '$1text-tinta'), textoEnPapel)

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
