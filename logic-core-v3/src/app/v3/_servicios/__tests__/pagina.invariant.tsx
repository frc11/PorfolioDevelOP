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
 *
 * [R1] El gatillo y su máquina son los del home (P-H18 + P-H25). REEMPLAZADOS POR EL COMÚN DEL HOME, no retirados: lo que se afirmaba de
 * la máquina (§10) sigue afirmándose, ahora sobre `_contrato/disparo.ts`, y se suman las afirmaciones del reemplazo (en _servicios no queda
 * copia propia, los tres bloques importan el común y la nota del pedido se fue). La pausa (§12) sigue siendo la nuestra por P-H27: s77 fija
 * que ningún archivo de producto importa `BotonPausa` todavía; la nota del pedido pasó de P-H21 a P-H27.
 *
 * [V1] P-H27 · la pausa (§12) es la del home, REEMPLAZADA POR LA COMÚN, no retirada: lo que se afirmaba de la nuestra (el botón, el nombre
 * fijo, `aria-pressed`, el lugar) se afirma sobre `BotonPausa`, y se suman que no queda la nuestra, que es sólo para el teclado (el F7 del
 * panel) y que con movimiento reducido no hay pausa. Que alterne lo fija s77 §1 sobre el mismo componente. La nota del pedido se fue.
 *
 * [V1] LA INTRO CON LA ESCENA: la intro es la del home (`IntroDeLaPagina`, B12a-API §2) y la tapa interina se fue. REEMPLAZADAS POR LA
 * SPEC NUEVA, no aflojadas (SPRINT-V1 §4), cada una con su control:
 *   · §1 la intro: el atributo es el del home (`data-intro-de-pagina`, en una `<section>`) y va después del encabezado, que quedó fuera
 *     de ella; se suma que el `h1` está a la vista (sin el preset del título 3D, P-H14, es el que se ve);
 *   · §2 el orden: el problema ya no es un bloque (es la bajada de la intro del home); la intro no lleva bloques;
 *   · §3 P-S1 acotado: `data-servicio` va UNA vez, en la intro, con el id del servicio (lo pone el home: su tema pinta el claro); en el
 *     cuerpo y en los CTA, ninguno;
 *   · §5 `data-seccion="invertida"` va en la intro y en el encabezado (los dos sobre la escena); en el cuerpo, ninguno;
 *   · §6 el acento de la intro: por `data-servicio` (el claro del tema), ya no por un `style` propio;
 *   · §9 el encabezado: antes de la intro, en claro; el código de cliente suma la raíz de la página (la salida de la variante) y la
 *     variante de la escena;
 *   · §10 la tapa: ya no hay ninguna, y ni la intro ni el encabezado pintan fondo (se ve la escena); el cuerpo sigue en papel.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ResolvedMetadata } from 'next'
import { renderToStaticMarkup } from 'react-dom/server'

import { PRECARGA_POR_SERVICIO } from '../../_chrome/contacto/contenido'
import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { nombreDeLaPausa } from '../../_componentes/medios/BotonPausa'
import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA as ATRIBUTO_DE_LA_INTRO } from '../../_componentes/pagina/IntroDeLaPagina'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { ENTRADAS_AL_TRAMO } from '../../_secciones/_contrato/cruce'
import { ESTADOS_DEL_GATILLO, LINEA_DEL_DISPARO, estaALaVista, siguienteEstado, type EstadoDelGatillo } from '../../_secciones/_contrato/disparo'
import { MARCA_HOME_QUIETO } from '../../_secciones/_contrato/marcaHomeQuieto'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import { CLASE_DE_LA_PAUSA_DEL_PANEL } from '../../_secciones/trabajos/portfolio/MedioDeLaTira'
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
import { DE_LA_PAUSA, debeReproducirse, type MomentoDelVideo } from '../movimiento/reproduccion'
import { CLASE_DE_LA_PAUSA_DEL_VIDEO, CapaDelVideo, PausaDelVideo } from '../movimiento/VideoDeFondo'
import { Intro } from '../Intro'
import { JsonLd } from '../JsonLd'
import { CuerpoDelServicio } from '../PaginaDeServicio'
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
// [L7a] Lo que la página arma ella misma: el JSON-LD, la intro y el cuerpo, en el orden de `PaginaDeServicio`. El cierre (Seis razones, el
// CTA, el pie y el FAQ) es el común del home (`CierreDeLaPagina`) y lo prueban sus invariantes (s78-b13, s78-b10); que la página lo monte
// con su preset y sus preguntas lo afirma §12.
const pagina = (servicio: Servicio, enDesarrollo: boolean): string =>
  renderToStaticMarkup(<><JsonLd servicio={servicio} /><Intro servicio={servicio} /><CuerpoDelServicio servicio={servicio} enDesarrollo={enDesarrollo} /></>)

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
/** [L7a] La apertura del cuerpo (el div que fija el acento del papel): el ancla de los controles que meten algo en el cuerpo. */
const APERTURA_DEL_CUERPO = /<div style="--color-acento:[^"]*"[^>]*>/.exec(pagina(PAGINAS_WEB, false))?.[0] ?? '<div style="--color-acento:'
const enElCuerpo = (html: string, extra: string): string => html.replace(APERTURA_DEL_CUERPO, `${APERTURA_DEL_CUERPO}${extra}`)

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
// [L7a] Más «de qué se trata» (B12a.8): su párrafo es lo que hacemos (`queHacemos.texto`), después de la bajada.
const bajadaEnDosParrafos = (servicio: Servicio) => (marcado: string): boolean =>
  JSON.stringify(parrafos(marcado).slice(0, 2)) === JSON.stringify([servicio.problema.titulo, servicio.problema.texto]) &&
  parrafos(marcado).slice(2).every((t) => t === servicio.queHacemos.texto || t === 'De qué se trata') &&
  !encabezados(marcado).some((t) => t === servicio.problema.titulo || t === servicio.problema.texto)
/**
 * [L7a] Lo que va antes de la intro: sólo los documentos JSON-LD (no se ven). El encabezado del V1 se fue (la navbar es del layout).
 * `null` si antes de la intro hay otra cosa.
 */
const antesDeLaIntro = (html: string): string | null => /^((?:<script type="application\/ld\+json">[\s\S]*?<\/script>)*)<section /.exec(html)?.[1] ?? null
const laIntro = (servicio: Servicio) => (html: string): boolean => {
  const marcado = intro(html)
  const encabezado = antesDeLaIntro(html)
  if (marcado === null || encabezado === null) return false
  return html.indexOf(`${encabezado}${aperturaDe(marcado)}`) === 0 && aperturaDe(marcado).startsWith('<section ') && aperturaDe(marcado).includes(` ${ATRIBUTO_DE_LA_INTRO}="${servicio.idEnElHome}"`) &&
    h1Dice(servicio)(marcado) && aperturas(cuerpo(html), 'h1').length === 0 && bajadaEnDosParrafos(servicio)(marcado) &&
    !textoVisible(cuerpo(html)).includes(servicio.problema.texto)
}
afirmarIgual(fallan((p) => laIntro(p.servicio)(p.html)), [], `y ese h1 va en la intro: [V1] la del home (una <section> con ${ATRIBUTO_DE_LA_INTRO} y el IdDeServicio, P-H20), [L7a] lo primero que se ve (antes, sólo el JSON-LD); el h1 y la bajada en dos párrafos; el cuerpo no lleva ninguno de los dos`)
controlPositivo('una intro sin su atributo se detecta', WEB_PROD.replace(` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.idEnElHome}"`, ''), laIntro(PAGINAS_WEB))
controlPositivo('  y una con el slug en vez del IdDeServicio', WEB_PROD.replace(` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.idEnElHome}"`, ` ${ATRIBUTO_DE_LA_INTRO}="${PAGINAS_WEB.slug}"`), laIntro(PAGINAS_WEB))
controlPositivo('un h1 que se va al cuerpo se detecta', enElCuerpo(WEB_PROD.replace(/<h1(?=[\s>])/, '<h2').replace('</h1>', '</h2>'), `<h1>${PAGINAS_WEB.nombre}</h1>`), laIntro(PAGINAS_WEB))
controlPositivo('algo visible antes de la intro se detecta', `<p>antes</p>${WEB_PROD}`, laIntro(PAGINAS_WEB))
controlPositivo('  y algo entre el JSON-LD y la intro', WEB_PROD.replace('</script><section ', '</script><p>en el medio</p><section '), laIntro(PAGINAS_WEB))
// [V1] El h1 siempre en el DOM y, sin el preset del título 3D (P-H14, B12a.4), A LA VISTA: ni él ni nada que lo contenga en la intro lo
// esconde (ni sr-only, ni hidden, ni invisible, ni opacidad cero, ni aria-hidden).
const ESCONDE = /\s(aria-hidden="true"|hidden(?:="")?)(?=[\s>])|\sclass="[^"]*(?<![\w:-])(sr-only|hidden|invisible|opacity-0)(?![\w-])[^"]*"/
const h1ALaVista = (html: string): boolean => {
  const marcado = intro(html) ?? ''
  const hastaElH1 = marcado.slice(0, Math.max(0, marcado.search(/<h1(?=[\s>])/)) + (/<h1[^>]*>/.exec(marcado)?.[0].length ?? 0))
  // Las aperturas que siguen abiertas en el h1 (las que lo contienen), y la del h1.
  const pila: string[] = []
  for (const m of hastaElH1.matchAll(/<(\/?)([a-z][a-z0-9]*)(?=[\s>/])[^>]*>/g)) {
    if (m[1] === '/') pila.pop()
    else pila.push(m[0])
  }
  return marcado !== '' && /<h1(?=[\s>])/.test(marcado) && pila.every((apertura) => !ESCONDE.test(apertura))
}
afirmarIgual(fallan((p) => h1ALaVista(p.html)), [], '  [V1] y está a la vista: el h1 y lo que lo contiene en la intro no lo esconden (sin el título 3D, es el que se ve)')
controlPositivo('  un h1 sólo para el lector (sr-only) se detecta', WEB_PROD.replace(/<h1(?=[\s>])/, '<h1 class="sr-only"'), h1ALaVista)
controlPositivo('  y uno adentro de algo escondido a la vista', WEB_PROD.replace(/(<section [^>]*data-intro-de-pagina[^>]*>)/, '$1<div aria-hidden="true">').replace('</h1>', '</h1></div>'), h1ALaVista)
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

// [M1] El orden de la maqueta: los diez del cuerpo. «Prueba» y «Del blog» salieron (funcionalidad quitada). [V1] El problema ya no es un
// bloque: es la bajada de la intro del home (REEMPLAZADO por la spec: la intro no lleva bloques).
// [L7a] REEMPLAZADO por la spec (L7a ítem 3): se suman «Para qué te sirve», «Lo que podemos construir» (software e IA, en el lugar de los
// trabajos), «Qué recibís al final» y «Después de la entrega»; el FAQ, el llamado y el cierre provisorio salen (el cierre común del home).
// [M3] REEMPLAZADO por la spec (M3): después de «Qué hacemos», el momento de cada página (web: la pantalla; software: lo de siempre y el
// orden; IA: el chat y las automatizaciones). Cada página lleva SÓLO los suyos.
const ORDEN_DE_LA_MAQUETA = ['que-hacemos', 'la-pantalla', 'lo-de-siempre', 'el-orden', 'el-chat', 'automatizaciones', 'ejemplos', 'que-incluye', 'precio', 'llamado-del-precio', 'extra', 'trabajos', 'posibles', 'proceso', 'entrega', 'despues']
const sin = (...fuera: string[]): string[] => ORDEN_DE_LA_MAQUETA.filter((b) => !fuera.includes(b))
const DE_WEB = ['la-pantalla']
const DE_SOFTWARE = ['lo-de-siempre', 'el-orden']
const DE_IA = ['el-chat', 'automatizaciones']
/** Lo que lleva cada página: Extra y [M3] el video de trabajos solo existen en web, en los dos modos. */
const ESPERADO: Readonly<Record<string, { readonly dev: readonly string[]; readonly prod: readonly string[] }>> = {
  'paginas-web': { dev: sin('posibles', ...DE_SOFTWARE, ...DE_IA), prod: sin('posibles', ...DE_SOFTWARE, ...DE_IA) },
  'software-a-medida': { dev: sin('extra', 'trabajos', ...DE_WEB, ...DE_IA), prod: sin('extra', 'trabajos', ...DE_WEB, ...DE_IA) },
  'ia-y-automatizaciones': { dev: sin('extra', 'trabajos', ...DE_WEB, ...DE_SOFTWARE), prod: sin('extra', 'trabajos', ...DE_WEB, ...DE_SOFTWARE) },
}
afirmarIgual(fallan((p) => JSON.stringify(bloquesEnOrden(p.html)) === JSON.stringify(ESPERADO[p.servicio.slug]?.[p.enDesarrollo ? 'dev' : 'prod'])), [], 'las tres páginas, en los dos modos: exactamente los bloques que les tocan, en el orden de la maqueta')
afirmarIgual(fallan((p) => respetaElOrden(bloquesEnOrden(p.html), ORDEN_DE_LA_MAQUETA)), [], '  y ninguno fuera de su lugar')
controlPositivo('dos bloques cambiados de lugar se detectan', ['que-incluye', 'que-hacemos', 'precio'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('un bloque que no es de la maqueta se detecta', ['que-hacemos', 'inventado'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('  y el problema de antes, como bloque', ['problema', 'que-hacemos'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('  y la sección de casos de antes, «prueba», también', [...sin('trabajos', 'posibles', 'proceso', 'entrega', 'despues'), 'prueba'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
controlPositivo('  y el FAQ de antes, en el cuerpo (L7a: va en el cierre común)', [...sin('posibles', 'entrega', 'despues'), 'faq'], (s: string[]) => respetaElOrden(s, ORDEN_DE_LA_MAQUETA))
// Del blog salió del orden: ni con un artículo que sí tenga href se monta.
const conBlog = pagina({ ...PAGINAS_WEB, articulos: [{ titulo: 'Una nota', href: '/v3/blog/una-nota' }] }, false)
const sinDelBlog = (html: string): boolean => !bloquesEnOrden(html).includes('del-blog') && !textoVisible(html).includes('Del blog')
afirmar(sinDelBlog(conBlog) && JSON.stringify(bloquesEnOrden(conBlog)) === JSON.stringify(ESPERADO['paginas-web']?.prod), 'Del blog no se monta, ni con un artículo que tiene href: salió del orden hasta que exista el blog')
controlPositivo('  una página con Del blog se detecta', `${WEB_PROD}<section data-bloque="del-blog"><h2>Del blog</h2></section>`, sinDelBlog)
// S3b · el orden, ajustado a la intro: el cuerpo arranca en Qué hacemos. [V1] La intro es la del home: no lleva ningún bloque.
const partidaEnDos = (html: string): boolean =>
  intro(html) !== null && bloquesEnOrden(intro(html) ?? '').length === 0 && bloquesEnOrden(cuerpo(html))[0] === 'que-hacemos' &&
  respetaElOrden(bloquesEnOrden(cuerpo(html)), ORDEN_DE_LA_MAQUETA)
afirmarIgual(fallan((p) => partidaEnDos(p.html)), [], 'las tres páginas, en los dos modos: la intro no lleva bloques (el h1 y la bajada son de la intro del home), y el cuerpo empieza en Qué hacemos y sigue el orden del SPEC')
controlPositivo('un bloque del cuerpo metido en la intro se detecta', `<div><section ${ATRIBUTO_DE_LA_INTRO}="x"><section data-bloque="que-hacemos"></section></section><main><section data-bloque="que-incluye"></section></main></div>`, partidaEnDos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El CTA abre el contacto y precarga el servicio — [V1] data-servicio sólo en la intro del home (P-S1 acotado)')

const envoltorios = (html: string): string[] => aperturas(html, 'div').filter((d) => d.includes('data-abre-contacto'))
const lleva = (idEnElHome: string) => (apertura: string): boolean =>
  apertura.includes('data-abre-contacto="panel"') && apertura.includes(`data-precarga="${idEnElHome}"`)
// [L7a] REEMPLAZADO por la spec: el llamado y el cierre provisorio salieron; el CTA del final es el del cierre común (con la precarga del preset).
afirmarIgual(envoltorios(WEB_PROD).length, 1, 'Desarrollo web: un envoltorio de apertura en lo que arma la página, el CTA del precio (el del final es el del cierre común)')
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
// [V1] P-S1 ACOTADO por la API (B12a-API §2): la intro del home lleva `data-servicio` con el acento de la página (la regla del tema pone
// su claro). Es el único: ni en el cuerpo, ni en los CTA (que precargan por `data-precarga`), ni en el encabezado.
const dataServicioSoloEnLaIntro = (servicio: Servicio) => (html: string): boolean =>
  valoresDe(html, 'data-servicio').length === 1 && aperturaDe(intro(html)).includes(` data-servicio="${servicio.idEnElHome}"`) && !cuerpo(html).includes('data-servicio')
afirmarIgual(fallan((p) => dataServicioSoloEnLaIntro(p.servicio)(p.html)), [], 'data-servicio va una sola vez en cada página, en la intro del home y con el id de SU servicio; ni en el cuerpo ni en los CTA')
controlPositivo('un data-servicio en un CTA se detecta', WEB_PROD.replace('data-abre-contacto="panel"', 'data-servicio="web" data-abre-contacto="panel"'), dataServicioSoloEnLaIntro(PAGINAS_WEB))
controlPositivo('  uno en la intro con el slug', WEB_PROD.replace(' data-servicio="web"', ' data-servicio="paginas-web"'), dataServicioSoloEnLaIntro(PAGINAS_WEB))
controlPositivo('  y una intro sin él', WEB_PROD.replace(' data-servicio="web"', ''), dataServicioSoloEnLaIntro(PAGINAS_WEB))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · «[a definir]» solo en desarrollo')

const cuenta = (html: string, aguja: string): number => html.split(aguja).length - 1
const hayMarcador = (html: string): boolean => cuenta(html, MARCADOR_A_DEFINIR) > 0
// [M3] El marcador del video se RETIRÓ con su funcionalidad: el video existe, y el slot de trabajos se monta en los dos modos.
// [M2a] El precio de web va en dos versiones (la de debajo de 768 y las diagonales): la Simple lleva su marcador en cada una.
// [M2b] La de debajo de 768 son las historias: su lista quieta es la que llega en el HTML servido.
const versionDelPrecio = (html: string, cual: 'historias' | 'diagonales'): string => elementoConAtributo(bloqueDe(html, 'precio') ?? '', 'data-precio="' + cual + '"') ?? ''
afirmarIgual([cuenta(WEB_DEV, MARCADOR_A_DEFINIR), cuenta(versionDelPrecio(WEB_DEV, 'historias'), MARCADOR_A_DEFINIR), cuenta(versionDelPrecio(WEB_DEV, 'diagonales'), MARCADOR_A_DEFINIR)], [3, 1, 1], 'Páginas web en desarrollo: tres marcadores — la Simple (autogestionable), una vez en cada versión del precio, y el plan mensual del mantenimiento')
afirmar(!(bloqueDe(WEB_DEV, 'trabajos') ?? MARCADOR_A_DEFINIR).includes(MARCADOR_A_DEFINIR) && bloqueDe(WEB_PROD, 'trabajos') !== null, '  [M3] el slot de trabajos ya no lleva marcador: se monta con el video, en desarrollo y en producción')
afirmar(textoVisible(WEB_DEV).includes('Plan mensual') && !textoVisible(WEB_PROD).includes('Plan mensual'), '  la fila «Plan mensual» solo existe en desarrollo')
afirmarIgual((['historias', 'diagonales'] as const).map((cual) => [cuenta(versionDelPrecio(WEB_DEV, cual), 'Autogestionable'), cuenta(versionDelPrecio(WEB_PROD, cual), 'Autogestionable')]), [[3, 2], [3, 2]], '  «Autogestionable», en cada versión del precio: tres veces en desarrollo, dos en producción (la Simple no lo dice mientras esté en [a definir])')
afirmarIgual(fallan((p) => p.enDesarrollo || !hayMarcador(p.html)), [], 'en producción no sale ningún marcador, en ninguna de las tres páginas')
// [L7a] REEMPLAZADO por la spec: software ya no tiene casos ni respuestas sin dato (L7a: sin marcadores), así que en desarrollo no muestra ninguno.
// La página usa el modo de producción siempre (`EN_DESARROLLO = false` en `PaginaDeServicio`): esto prueba la rama de los bloques.
afirmarIgual(fallan((p) => !p.enDesarrollo || hayMarcador(p.html) === (p.servicio.slug !== 'software-a-medida')), [], 'y en desarrollo, web e IA lo muestran (web: la Simple y el plan mensual; IA: funcionalidades e implementación); software no tiene datos pendientes')
controlPositivo('los modos cruzados: producción no puede mostrar el marcador', WEB_DEV, (h: string) => !hayMarcador(h))
controlPositivo('los modos cruzados: desarrollo tiene que mostrarlo', WEB_PROD, hayMarcador)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Nada del home: ni ids, ni atributos de la escena; data-seccion sólo sobre la escena')

const limpio = (html: string): boolean => reservadosEnElMarcado(html, ATRIBUTO_DE_LA_INTRO).length === 0
afirmarIgual(fallan((p) => limpio(p.html)), [], 'ninguna página emite un id que el home busque, ni portfolio-…, ni data-panel, data-seccion-id o data-signo-de-la-tuya; data-seccion solo es «invertida» y [V1] va en lo que está sobre la escena, una vez en cada uno: la intro y el encabezado (S3b: no en la raíz; ninguno en el cuerpo)')
controlPositivo('un id="cierre" se detecta', `${WEB_PROD}<i id="cierre"></i>`, limpio)
controlPositivo('  un encabezado propio en claro (el del V1) se detecta', `<header data-seccion="invertida"></header>${WEB_PROD}`, limpio)
controlPositivo('un id portfolio-la-tuya se detecta', `${WEB_PROD}<i id="portfolio-la-tuya"></i>`, limpio)
controlPositivo('un data-panel se detecta', `${WEB_PROD}<i data-panel="x"></i>`, limpio)
controlPositivo('un data-seccion que no es «invertida» se detecta', `${WEB_PROD}<i data-seccion="claro"></i>`, limpio)
controlPositivo('un segundo data-seccion «invertida», en el cuerpo, se detecta', enElCuerpo(WEB_PROD, '<i data-seccion="invertida"></i>'), limpio)
controlPositivo('  y una intro sin el suyo', WEB_PROD.replace(/(<section [^>]*?) data-seccion="invertida"/, '$1'), limpio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Ningún hex: la intro lleva el claro de SU servicio y el cuerpo el oscuro, los dos del tema')

// [M1] P-H2 cerrado: el claro dejó de ser un hex en los datos y es el token del tema. Ningún hex en ninguna parte del marcado.
const sinHex = (html: string): boolean => hexSueltos(html).length === 0
afirmarIgual(fallan((p) => sinHex(p.html)), [], 'ninguna página tiene un hex en el marcado, ni en el cuerpo ni en la intro')
controlPositivo('un hex en el cuerpo se detecta', enElCuerpo(WEB_PROD, '<p style="color:#1D5B8F">x</p>'), sinHex)
controlPositivo('  y uno escrito en el style de la raíz', WEB_PROD.replace('--color-acento:var(--color-acento-web)', '--color-acento:#1D5B8F'), sinHex)
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
// [V1] REEMPLAZADO por la API: la intro es la del home y su acento entra por `data-servicio` con el id de SU servicio (la regla del tema
// de ese id pone el claro, el token de arriba), ya no por un `style` propio. Ni la intro ni el encabezado fijan el acento a mano.
const acentoDeLaIntro = (servicio: Servicio) => (html: string): boolean => {
  const apertura = aperturaDe(intro(html))
  // [L7a] El style de la intro es el de los altos del home (`--pantallas-de-la-intro`, `--tramo-del-titulo`): nunca el acento.
  const estilo = /\sstyle="([^"]*)"/.exec(apertura)?.[1] ?? ''
  return apertura.includes(` data-servicio="${servicio.idEnElHome}"`) && claroSegunElTema(servicio.idEnElHome) === tokenDelAcentoClaro(servicio.idEnElHome) &&
    !/acento/.test(estilo) && estilo.split(';').every((d) => d === '' || /^--(pantallas-de-la-intro|tramo-del-titulo):/.test(d))
}
afirmarIgual(fallan((p) => acentoDeLaIntro(p.servicio)(p.html)), [], '  y la intro lleva el claro de SU servicio por data-servicio (la regla del tema de ese id), derivado de idEnElHome; ni ella ni el encabezado lo fijan con un style')
controlPositivo('  el acento de otro servicio en la intro se detecta', WEB_PROD.replace(' data-servicio="web"', ' data-servicio="software"'), acentoDeLaIntro(PAGINAS_WEB))
controlPositivo('  y el style de antes, con el claro a mano', WEB_PROD.replace(/(<section [^>]*?data-servicio="web")/, `$1 style="--color-acento:var(${claroSegunElTema('web')})"`), acentoDeLaIntro(PAGINAS_WEB))
afirmarIgual(IDS_DE_SERVICIO.filter((id) => !TOKENS_DEL_TEMA.has(tokenSegunElTema(id)) || tokenDelAcento(id) !== tokenSegunElTema(id)), [], `el token oscuro de cada servicio es el que el tema le da en su contexto, y está declarado en su @theme static: ${IDS_DE_SERVICIO.map(tokenSegunElTema).join(', ')}`)
controlPositivo('un token que el tema no declara se detecta', '--color-acento-otro', (token: string) => TOKENS_DEL_TEMA.has(token))
controlPositivo('un servicio que el tema no conoce se detecta', 'otro', (id: string) => ACENTO_DEL_TEMA.has(id))
const acentoDelCuerpo = (servicio: Servicio) => (html: string): boolean =>
  (/^<div style="([^"]*)"/.exec(cuerpo(html).replace(antesDeLaIntro(html) ?? '', ''))?.[1] ?? '') === `--color-acento:var(${tokenSegunElTema(servicio.idEnElHome)})`
afirmarIgual(fallan((p) => acentoDelCuerpo(p.servicio)(p.html)), [], '  y el cuerpo fija el acento del papel con el token de SU servicio, derivado de idEnElHome, por var(): ningún hex')
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
// [V1] REEMPLAZADO por la spec: la regla es de NUESTRO marcado (todo lo que no es la intro). La intro es la del home (`IntroDeLaPagina`): sus
// clases arbitrarias son las de su fuente (el alto de 1,5 pantallas que fija s78 y el ancho de la bajada) y ninguna más.
// [L7a] La intro del home son sus piezas: el bloque, la composición, la bajada y el título de la página.
const FUENTE_DE_LA_INTRO_DEL_HOME = ['pagina/IntroDeLaPagina.tsx', 'pagina/ComposicionDeLaIntro.tsx', 'pagina/BajadaDeLaIntro.tsx', 'titulos3d/TituloDePagina.tsx']
  .map((f) => readFileSync(path.join(AQUI, '../../_componentes', f), 'utf8')).join('\n')
const arbitrariasEnSuLugar = (html: string): boolean => arbitrariasSinToken(cuerpo(html)).length === 0 && arbitrariasSinToken(intro(html) ?? '').every((c) => FUENTE_DE_LA_INTRO_DEL_HOME.includes(c))
afirmar(CON_TOKEN > 0 && fallan((p) => arbitrariasEnSuLugar(p.html)).length === 0, `toda clase arbitraria de nuestro marcado lee un token con var() (${CON_TOKEN} en la página, ninguna suelta); las de la intro son las del componente del home, tal cual`)
controlPositivo('una clase arbitraria sin var() se detecta', `<div class="${['w-', '[', '37px', ']'].join('')}">`, (h: string) => arbitrariasSinToken(h).length === 0)
controlPositivo('  y una en la intro que no es del home', WEB_PROD.replace(/(<section [^>]*data-intro-de-pagina[^>]*>)/, `$1<div class="${['w-', '[', '37px', ']'].join('')}"></div>`), arbitrariasEnSuLugar)
const listasConRol = (html: string): boolean => [...aperturas(html, 'ul'), ...aperturas(html, 'ol')].every((l) => l.includes('role="list"'))
afirmarIgual(fallan((p) => listasConRol(p.html)), [], 'toda lista (ul y ol) lleva role="list": sin marcadores, el navegador le saca la semántica de lista al lector de pantalla')
controlPositivo('una lista sin role se detecta', '<ul class="flex"><li>a</li></ul>', listasConRol)
// [M1] Más los deep links del Portfolio del home (las anclas que el home publica, `portfolio/anclas.ts`).
const PERMITIDOS = new Set<string>([HREF_DEL_HOME, ...PUBLICADOS.map(hrefDe), '/login', ...ANCLAS_DEL_PORTFOLIO.map((a) => `${HREF_DEL_HOME}#${a.id}`)])
const enlacesBien = (html: string): boolean => aperturas(html, 'a').every((a) => /\shref="[^"]+"/.test(a)) && enlacesInternos(html).every((h) => PERMITIDOS.has(h))
afirmarIgual(fallan((p) => enlacesBien(p.html)), [], 'todo <a> tiene href, y los internos solo llevan al home, a una página de PUBLICADOS, a /login o a un ancla del Portfolio del home')
controlPositivo('un enlace a una página que no es de PUBLICADOS se detecta', '<a href="/v3/otra-pagina">x</a>', enlacesBien)
controlPositivo('  y uno a un ancla del Portfolio que no existe', `<a href="${HREF_DEL_HOME}#portfolio-otro">x</a>`, enlacesBien)
afirmarIgual(PUBLICADOS, SERVICIOS.map((s) => s.slug), 'PUBLICADOS tiene los tres servicios, en el orden del SPEC (S2b)')
controlPositivo('un PUBLICADOS al que le falta uno se detecta', ['paginas-web', 'software-a-medida'], (l: readonly string[]) => JSON.stringify(l) === JSON.stringify(SERVICIOS.map((s) => s.slug)))
// [L7a] REEMPLAZADO por la spec: el encabezado del V1 se fue (la navbar la monta el layout de /v3) y el FAQ pasó al cierre común. La página
// monta `CierreDeLaPagina` con su preset (el mismo objeto que declara la intro) y sus 6 preguntas, al final de su <main>, y nada después.
const FUENTE_DE_LA_PAGINA = sinComentarios(readFileSync(path.join(AQUI, '../PaginaDeServicio.tsx'), 'utf8'))
const montaElCierre = (f: string): boolean => /<CierreDeLaPagina preset=\{preset\} preguntas=\{servicio\.faq\} \/>\s*<\/main>/.test(f) && /const preset = PRESETS_DE_LAS_PAGINAS\[servicio\.idEnElHome\]/.test(f) && !/<header|Encabezado|<details/.test(f)
afirmar(montaElCierre(FUENTE_DE_LA_PAGINA) && aperturas(WEB_PROD, 'details').length === 0 && aperturas(WEB_PROD, 'header').length === 0, 'la página monta el cierre común con su preset y sus 6 preguntas, al final del <main>; ni encabezado propio ni FAQ en el cuerpo')
controlPositivo('  un cierre sin las preguntas de la página se detecta', FUENTE_DE_LA_PAGINA.replace(' preguntas={servicio.faq}', ''), montaElCierre)

const raiz = path.join(AQUI, '..')
const fuentes = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === '__tests__' ? [] : fuentes(path.join(dir, e.name))) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [])
const FUENTES = fuentes(raiz).map((f) => ({ f: path.relative(raiz, f), codigo: sinComentarios(readFileSync(f, 'utf8')) }))
const navegaConElRouter = (codigo: string): boolean => /next\/link|next\/navigation|useRouter|router\.push|triggerTransition/.test(codigo)
afirmarIgual(FUENTES.filter((x) => navegaConElRouter(x.codigo)).map((x) => x.f), [], `ninguno de los ${FUENTES.length} fuentes de _servicios usa next/link, el router ni triggerTransition: [L7a] navegan con EnlaceDeRuta (el velo y la salida de la variante)`)
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
// [M3 · 2026-10-30] REEMPLAZADO por la spec (M3): se suman los momentos de cada página, que se mueven con el scroll o solos (`momentos/`).
afirmarIgual(dondeEsDeCliente(FUENTES), ['escena/VarianteDeWeb.tsx', 'momentos/atiende/ChatQueAtiende.tsx', 'momentos/atiende/PasaSolo.tsx', 'momentos/orden/ElOrden.tsx', 'momentos/orden/RenglonesTachados.tsx', 'momentos/pantalla/LaPantalla.tsx', 'momentos/pantalla/useVideosDeLaPantalla.ts', 'momentos/useAvanceDelRecorrido.ts', 'movimiento/PrecioEnHistorias.tsx', 'movimiento/RepartoDelPrecio.tsx', 'movimiento/Revelado.tsx', 'movimiento/TitularQueEntra.tsx', 'movimiento/VideoDeFondo.tsx'], 'el código de cliente son los cinco de movimiento/ (los dos envoltorios del revelado, [M2a] el reparto del precio en diagonales, [M3] el video de trabajos y [M2b] el precio en historias; [L7a] la raíz con la salida se fue: la pide EnlaceDeRuta) y [V1] la variante de la escena, que carga la ranura del home por el registro: todo lo demás es de servidor. [R1] El gatillo ya no es nuestro: es el del contrato del home')
controlPositivo('un bloque de cliente fuera de movimiento/ se detecta', ["'use client'", 'export const x = 1'].join('\n'), (c: string) => !deCliente(c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Papel y movimiento: el cuerpo es papel opaco, la intro se lee sobre la escena, sin vidrio, revelados del home')

const clasesDe = (apertura: string): string[] => (/\sclass="([^"]*)"/.exec(apertura)?.[1] ?? '').split(/\s+/)
// [V1] La tapa interina se fue (REEMPLAZADO por la spec: era «una sola, adentro de la intro»): ningún fondo opaco fijo a todo el cuadro, en
// ninguna parte de la página; la escena se ve detrás del encabezado y de la intro.
const tapas = (html: string): string[] => fondosOpacos(html).filter((clases) => ['fixed', 'inset-0'].every((c) => clases.split(/\s+/).includes(c)))
afirmarIgual(fallan((p) => tapas(p.html).length === 0), [], 'no queda la tapa interina: ningún fondo opaco fijo a todo el cuadro (fixed, inset-0) en ninguna página; la intro se ve sobre la escena')
controlPositivo('  la tapa de antes, en la intro, se detecta', WEB_PROD.replace(/(<section [^>]*data-intro-de-pagina[^>]*>)/, '$1<div aria-hidden="true" class="fixed inset-0 -z-10 bg-fondo"></div>'), (h: string) => tapas(h).length === 0)
const sobreLaEscenaSinFondo = (html: string): boolean => {
  const marcado = intro(html) ?? ''
  return marcado !== '' && fondosOpacos(marcado).length === 0 && !aperturas(marcado, '[a-z]+').some((a) => clasesDe(a).some((c) => c.startsWith('bg-')))
}
afirmarIgual(fallan((p) => sobreLaEscenaSinFondo(p.html)), [], '  y la intro no pinta fondo: nada adentro de ella lleva un bg- (se ve la escena)')
const APERTURA_DE_LA_INTRO = aperturaDe(intro(WEB_PROD))
controlPositivo('una intro con fondo propio se detecta', WEB_PROD.replace(APERTURA_DE_LA_INTRO, APERTURA_DE_LA_INTRO.replace(' class="', ' class="bg-fondo ')), sobreLaEscenaSinFondo)
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
  ejemplos: { arbol: 2, gatillo: 0 },
  'que-incluye': { arbol: 2, gatillo: 0 },
  precio: { arbol: 2, gatillo: 0 },
  'llamado-del-precio': { arbol: 0, gatillo: 1 },
  extra: { arbol: 2, gatillo: 0 },
  trabajos: { arbol: 0, gatillo: 1 }, // [M3] el texto entero con el gatillo: el título vive al pie de un cuadro de una pantalla
  posibles: { arbol: 2, gatillo: 0 },
  proceso: { arbol: 2, gatillo: 0 },
  entrega: { arbol: 2, gatillo: 0 },
  despues: { arbol: 2, gatillo: 0 },
  // [M3] Los momentos: el título entra por línea como en todos; lo de adentro se mueve por su cuenta (con el scroll o solo), sin revelado.
  'la-pantalla': { arbol: 1, gatillo: 0 },
  'lo-de-siempre': { arbol: 1, gatillo: 0 },
  'el-orden': { arbol: 1, gatillo: 0 },
  'el-chat': { arbol: 1, gatillo: 0 },
  automatizaciones: { arbol: 1, gatillo: 0 },
}
const cuentaEnElBloque = (html: string, nombre: string, aguja: string): number => (bloqueDe(html, nombre) ?? '').split(aguja).length - 1
// [M2a] El precio en diagonales (web) suma el Bloque del contrato que reparte el progreso a los tres paneles: una marca más.
// [M2b] Y la versión de debajo de 768 deja el panel revelado: las historias (y su lista quieta) son la caja anclada, no un panel que
// entra con el scroll. El título sigue entrando por línea: título, más el Bloque de las diagonales.
const ESPERADO_DE_LAS_DIAGONALES = { arbol: 2, gatillo: 0 }
const entraComoDice = (html: string): boolean => bloquesEnOrden(html).every((b) => {
  const esperado = b === 'precio' && (bloqueDe(html, 'precio') ?? '').includes('data-precio="diagonales"') ? ESPERADO_DE_LAS_DIAGONALES : REVELADO_ESPERADO[b]
  return esperado !== undefined && cuentaEnElBloque(html, b, `data-arbol="${MARCA_HOME_QUIETO}"`) === esperado.arbol && cuentaEnElBloque(html, b, ' data-gatillo="') === esperado.gatillo
})
afirmarIgual(fallan((p) => entraComoDice(p.html)), [], 'cada bloque entra como dice la tabla: progresivo (título y panel) y [L7a] los bloques nuevos igual; el CTA del precio y el slot del video con el gatillo')
controlPositivo('un CTA del precio con el panel progresivo en vez del gatillo se detecta', `<section data-bloque="llamado-del-precio"><div data-arbol="${MARCA_HOME_QUIETO}"></div><div data-arbol="${MARCA_HOME_QUIETO}"></div></section>`, entraComoDice)
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
// La máquina del gatillo, pura (`_contrato/disparo.ts`, [R1] la del home): las reglas del remate, sobre las cuatro entradas de `_contrato/cruce.ts`.
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
// [R1] Desde P-H18 el remate toma la línea del contrato. [L7a] `tu-panel/entrada.ts` ya no existe en el home: la línea es la del contrato
// (`_contrato/disparo.ts`), la única, y vale lo que el home fija (6 %, como la clava s42).
const lineaDelRemate = (linea: number): boolean => linea === 6
afirmar(lineaDelRemate(LINEA_DEL_DISPARO), `la línea de disparo es la del contrato: ${String(LINEA_DEL_DISPARO)} % desde abajo (_contrato/disparo.ts)`)
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
// [R1] REEMPLAZADO POR EL COMÚN DEL HOME (P-H18 + P-H25): el gatillo y su máquina ya no son nuestros. En _servicios no queda su componente ni
// su máquina, los tres bloques que lo usan lo importan del contrato, y nadie define por su cuenta la máquina, la línea, el margen ni la guarda.
const enBarras = (f: string): string => f.split(path.sep).join('/')
const ARCHIVOS_DE_SERVICIOS = FUENTES.map((x) => enBarras(x.f))
const COPIAS_DEL_GATILLO = ['movimiento/Gatillo.tsx', 'movimiento/disparo.ts']
const sinCopiasDelGatillo = (archivos: readonly string[]): boolean => !archivos.some((f) => COPIAS_DEL_GATILLO.includes(f))
afirmar(sinCopiasDelGatillo(ARCHIVOS_DE_SERVICIOS), `el gatillo es el del home (P-H18 + P-H25, reemplazado por el común): en _servicios ya no están ${COPIAS_DEL_GATILLO.join(' ni ')}`)
controlPositivo('  una copia propia del componente se detecta', [...ARCHIVOS_DE_SERVICIOS, 'movimiento/Gatillo.tsx'], sinCopiasDelGatillo)
controlPositivo('  y una de su máquina', [...ARCHIVOS_DE_SERVICIOS, 'movimiento/disparo.ts'], sinCopiasDelGatillo)
interface Fuente { readonly f: string; readonly codigo: string }
const usaElGatillo = (x: Fuente): boolean => /<Gatillo[\s>]/.test(x.codigo)
const delContrato = (x: Fuente): boolean => /from '(?:\.\.\/)+_secciones\/_contrato\/Gatillo'/.test(x.codigo)
const gatillosAjenos = (lista: readonly Fuente[]): string[] => lista.filter((x) => usaElGatillo(x) && !delContrato(x)).map((x) => enBarras(x.f))
afirmarIgual(FUENTES.filter(usaElGatillo).map((x) => enBarras(x.f)).sort(), ['bloques/Bloque.tsx', 'bloques/Llamado.tsx', 'bloques/Trabajos.tsx'], '  lo usan tres bloques: el panel con gatillo del Bloque, el CTA del precio y el texto del video de trabajos')
afirmarIgual(gatillosAjenos(FUENTES), [], '  y los tres lo importan del contrato (_secciones/_contrato/Gatillo): ninguno de uno propio')
controlPositivo('  un bloque que lo importa de movimiento/ se detecta', [{ f: 'bloques/Llamado.tsx', codigo: "import { Gatillo } from '../movimiento/Gatillo'\n<Gatillo>x</Gatillo>" }], (l: readonly Fuente[]) => gatillosAjenos(l).length === 0)
const DEFINE_LA_MAQUINA = /export (?:function|const) (?:siguienteEstado|margenDelDisparo|LINEA_DEL_DISPARO|aLaVistaEn|vigilarElReposo)\b/
const conMaquinaPropia = (lista: readonly Fuente[]): string[] => lista.filter((x) => DEFINE_LA_MAQUINA.test(x.codigo)).map((x) => enBarras(x.f))
afirmarIgual(conMaquinaPropia(FUENTES), [], '  y ningún fuente de _servicios define la máquina, la línea, el margen ni la guarda en reposo: son del contrato, una sola vez')
controlPositivo('  un fuente con su propia máquina se detecta', [{ f: 'movimiento/otra.ts', codigo: 'export function siguienteEstado(estado: string): string { return estado }' }], (l: readonly Fuente[]) => conMaquinaPropia(l).length === 0)
// La nota de un pedido ya cumplido («P-H18: reemplazar…», «P-H21: reemplazar…», [V1] «P-H27: reemplazar…») no queda en ningún fuente: se
// lee cruda, con comentarios.
const PEDIDOS_CUMPLIDOS = ['P-H18: reemplazar', 'P-H21: reemplazar', 'P-H27: reemplazar']
const CRUDOS: readonly Fuente[] = fuentes(raiz).map((f) => ({ f: path.relative(raiz, f), codigo: readFileSync(f, 'utf8') }))
const conPedidoPendiente = (lista: readonly Fuente[]): string[] => lista.filter((x) => PEDIDOS_CUMPLIDOS.some((p) => x.codigo.includes(p))).map((x) => enBarras(x.f))
afirmarIgual(conPedidoPendiente(CRUDOS), [], `  y ningún fuente guarda la nota de un pedido ya cumplido (${PEDIDOS_CUMPLIDOS.join(', ')}): el gatillo y la pausa quedaron reemplazados por los comunes del home (§12)`)
controlPositivo('  una nota «P-H21: reemplazar por BotonPausa» sin cumplir se detecta', [{ f: 'movimiento/VideoDeFondo.tsx', codigo: '// P-H21: reemplazar por BotonPausa' }], (l: readonly Fuente[]) => conPedidoPendiente(l).length === 0)
controlPositivo('  y la de P-H27, la de la pausa', [{ f: 'movimiento/VideoDeFondo.tsx', codigo: '// P-H27: reemplazar por BotonPausa cuando llegue el ajuste de s77' }], (l: readonly Fuente[]) => conPedidoPendiente(l).length === 0)

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

// [L7a] REEMPLAZADO por la spec: el FAQ lo renderiza el cierre común (`FaqDelPie`, con su `FAQPage`; s78-b10 lo prueba). Acá, que cada
// servicio le pase sus 6 preguntas, sin repetirse y con respuesta.
const seisParaElCierre = (s: Servicio): boolean => s.faq.length === 6 && s.faq.every((f) => f.respuesta.trim() !== '')
afirmarIgual(fallan((p) => seisParaElCierre(p.servicio)), [], 'cada página le pasa al cierre común sus 6 preguntas, todas con respuesta')
controlPositivo('  una con cinco se detecta', { ...PAGINAS_WEB, faq: PAGINAS_WEB.faq.slice(1) }, seisParaElCierre)
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
// [M3 · 2026-10-30] La pantalla que se dibuja trae sus dos videos (escritorio y celular, con las mismas reglas: los afirma momentos.invariant §1):
// el «uno solo en la página» pasa a «uno solo fuera de la pantalla».
const SIN_LA_PANTALLA = WEB_PROD.replace(bloqueDe(WEB_PROD, 'la-pantalla') ?? '', '')
afirmar(videoServido(bloqueDe(WEB_PROD, 'trabajos') ?? '') && videoServido(bloqueDe(WEB_DEV, 'trabajos') ?? '') && videoServido(SIN_LA_PANTALLA), 'Páginas web, en los dos modos, sin movimiento reducido: un solo <video> —muted, loop, playsInline, preload="none", data-video-de-trabajos—, en el slot de trabajos, sin autoplay ni src (la fuente se pide al acercarse)')
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
// La pausa (D5, WCAG 2.2.2). [V1] P-H27 · REEMPLAZADA POR LA COMÚN DEL HOME: es `BotonPausa`, un botón conmutable con nombre fijo y
// `aria-pressed` (que alterna lo fija s77 §1 sobre el mismo componente); se afirma sobre el botón servido, como se afirmaba la nuestra.
const botonDeLaPausa = (html: string): string => /<button[^>]*data-pieza="boton-pausa"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0] ?? ''
const NOMBRE_DE_LA_PAUSA = nombreDeLaPausa(DE_LA_PAUSA)
const laPausaDelHome = (html: string): boolean => {
  const boton = botonDeLaPausa(html)
  return boton.includes(' type="button"') && boton.includes(` aria-label="${NOMBRE_DE_LA_PAUSA}"`) && boton.includes(' aria-pressed="false"') && boton.includes('lucide-pause') &&
    !html.includes('data-pieza="pausa-del-video"')
}
afirmar(laPausaDelHome(BLOQUE_DEL_VIDEO), `la pausa del slot es la del home (BotonPausa): type="button", nombre fijo «${NOMBRE_DE_LA_PAUSA}», aria-pressed="false" con el ícono de pausa; la nuestra ya no está`)
controlPositivo('  la nuestra de antes se detecta', BLOQUE_DEL_VIDEO.replace('data-pieza="boton-pausa"', 'data-pieza="pausa-del-video"'), laPausaDelHome)
controlPositivo('  una con otro nombre', BLOQUE_DEL_VIDEO.replace(NOMBRE_DE_LA_PAUSA, 'Pausar el video'), laPausaDelHome)
controlPositivo('  y una página sin el botón', SIN_LA_PANTALLA.replace(botonDeLaPausa(SIN_LA_PANTALLA), ''), laPausaDelHome)
const clasesDeLaPausa = (html: string): string[] => (/\sclass="([^"]*)"/.exec(/<button[^>]*>/.exec(botonDeLaPausa(html))?.[0] ?? '')?.[1] ?? '').split(/\s+/)
// [V1] Sólo para el teclado, como el panel después de su F7: el botón lleva TODAS las clases de comportamiento de la pausa del panel
// (`CLASE_DE_LA_PAUSA_DEL_PANEL`: en escala 0 y sin puntero, entera con :focus-visible); el lugar es el nuestro.
const DEL_LUGAR = /^(top|right|bottom|left)-/
const COMPORTAMIENTO_DEL_PANEL = CLASE_DE_LA_PAUSA_DEL_PANEL.split(/\s+/).filter((c) => c !== '' && !DEL_LUGAR.test(c))
const soloParaElTeclado = (html: string): boolean => COMPORTAMIENTO_DEL_PANEL.length >= 3 && COMPORTAMIENTO_DEL_PANEL.every((c) => clasesDeLaPausa(html).includes(c))
afirmar(soloParaElTeclado(BLOQUE_DEL_VIDEO) && CLASE_DE_LA_PAUSA_DEL_VIDEO.split(/\s+/).filter((c) => !DEL_LUGAR.test(c)).join(' ') === COMPORTAMIENTO_DEL_PANEL.join(' '), `  y es sólo para el teclado, como la del panel del home (F7): ${COMPORTAMIENTO_DEL_PANEL.join(', ')}`)
controlPositivo('  una a la vista con el mouse (sin la escala 0) se detecta', BLOQUE_DEL_VIDEO.replace(' scale-0 ', ' '), soloParaElTeclado)
controlPositivo('  y una que el puntero alcanza', BLOQUE_DEL_VIDEO.replace('pointer-events-none ', ''), soloParaElTeclado)
// Va abajo a la derecha del cuadro (arriba la tapaba la barra fija del sitio): lo dicen las clases del botón servido.
const abajoALaDerecha = (html: string): boolean => {
  const clases = clasesDeLaPausa(html)
  return ['absolute', 'right-4', 'bottom-4'].every((c) => clases.includes(c)) && !clases.some((c) => c.startsWith('top-') || c.startsWith('left-'))
}
afirmar(abajoALaDerecha(BLOQUE_DEL_VIDEO), '  y va abajo a la derecha del cuadro (la barra fija del sitio tapaba el de arriba): absolute, right-4 y bottom-4')
controlPositivo('  uno arriba a la derecha se detecta', BLOQUE_DEL_VIDEO.replace('bottom-4', 'top-4'), abajoALaDerecha)
// [V1] Con movimiento reducido no hay pausa: queda el póster, quieto (la capa sin <video>, arriba).
const pausaSegun = (pausa: typeof PausaDelVideo, reducido: boolean): string => renderToStaticMarkup(pausa({ reducido, pausado: false, alCambiar: () => undefined }))
const sinPausaConReducido = (pausa: typeof PausaDelVideo): boolean => pausaSegun(pausa, true) === '' && laPausaDelHome(pausaSegun(pausa, false))
afirmar(sinPausaConReducido(PausaDelVideo), '  con movimiento reducido no hay pausa (no hay video que pausar); sin reducir, la del home')
controlPositivo('  una pausa que ignora el reducido se detecta', ((props: Parameters<typeof PausaDelVideo>[0]) => PausaDelVideo({ ...props, reducido: false })) as typeof PausaDelVideo, sinPausaConReducido)
// [V1] La nuestra se fue: ningún fuente de _servicios arma una pausa propia, y el video importa la del home.
const FUENTE_DEL_VIDEO = sinComentarios(readFileSync(path.join(AQUI, '../movimiento/VideoDeFondo.tsx'), 'utf8'))
const conPausaPropia = (lista: readonly Fuente[]): string[] => lista.filter((x) => /pausa-del-video|BotonDePausa|siguienteDeLaPausa|ROTULO_DE_LA_PAUSA/.test(x.codigo)).map((x) => enBarras(x.f))
afirmar(conPausaPropia(FUENTES).length === 0 && /from '\.\.\/\.\.\/_componentes\/medios\/BotonPausa'/.test(FUENTE_DEL_VIDEO), '  y no queda la nuestra: ningún fuente arma una pausa propia, y el video importa BotonPausa del home (s77 lo deja: está en su lista)')
controlPositivo('  un fuente con la pausa de antes se detecta', [{ f: 'movimiento/VideoDeFondo.tsx', codigo: '<button data-pieza="pausa-del-video" />' }], (l: readonly Fuente[]) => conPausaPropia(l).length === 0)
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
const sinVideoDeTrabajos = (html: string): boolean =>
  bloqueDe(html, 'trabajos') === null && videos(html).length === 0 && !html.includes('data-video-de-trabajos') && !html.includes('pausa-del-video') && !html.includes('boton-pausa')
afirmarIgual(fallan((p) => p.servicio.slug === 'paginas-web' || sinVideoDeTrabajos(p.html)), [], 'en Software e IA, en los dos modos, el slot de trabajos no se monta: ni el bloque, ni un <video>, ni la pausa (la nuestra ni la del home)')
controlPositivo('  Software con el video de web se detecta', pagina({ ...SOFTWARE_A_MEDIDA, prueba: { ...SOFTWARE_A_MEDIDA.prueba, video: VIDEO } }, false), sinVideoDeTrabajos)
controlPositivo('  y un botón de pausa suelto (el nuestro)', '<div><button type="button" data-pieza="pausa-del-video"></button></div>', sinVideoDeTrabajos)
controlPositivo('  y el del home', '<div><button type="button" data-pieza="boton-pausa"></button></div>', sinVideoDeTrabajos)
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
