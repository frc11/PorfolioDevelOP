/**
 * INVARIANTE — SERVICIOS S1a · LOS DATOS DE LAS TRES PÁGINAS.
 *
 *     npx tsx src/app/v3/_servicios/__tests__/datos.invariant.ts
 *
 * Que lo publicado sea lo que dice el SPEC §7 y nada más: los números, las preguntas, lo que queda en `null`, y que
 * ninguna respuesta del FAQ salga sin su línea del SPEC (regla D9). Cada comprobación lleva su control positivo: el
 * MISMO predicado, contra una entrada equivocada a propósito, tiene que fallar.
 *
 * Todavía no lo cablea ningún script de `package.json` (P-H7): se corre a mano.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { FUENTE_DE_PROYECTOS } from '../datos/fuenteDeProyectos'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { SERVICIOS, servicioDe } from '../datos/servicios'
import { SOFTWARE_A_MEDIDA } from '../datos/software-a-medida'
import { hrefDe } from '../rutas'
import { SLUGS_DE_SERVICIO, esServicioSlug } from '../tipos'
import type { Servicio } from '../tipos'

const RAIZ = process.cwd()
const CARPETA = 'src/app/v3/_servicios'
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')
const ARCHIVOS_DE_DATOS = readdirSync(path.join(RAIZ, CARPETA, 'datos')).filter((f) => f.endsWith('.ts')).sort()

/** Cada archivo `.ts(x)` de servicios que no es un test, con su ruta desde la raíz del repo. */
function fuentesDeServicios(dir: string, acumulado: string[] = []): string[] {
  for (const e of readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== '__tests__') fuentesDeServicios(`${dir}/${e.name}`, acumulado)
    } else if (/\.tsx?$/.test(e.name)) acumulado.push(`${dir}/${e.name}`)
  }
  return acumulado.sort()
}

// Copias de un servicio con UN dato cambiado: las entradas equivocadas de los controles.
function conCalibre(s: Servicio, i: number, desde: number): Servicio {
  const p = s.precio
  if (p.tipo !== 'calibres') return s
  return { ...s, precio: { ...p, calibres: p.calibres.map((c, j) => (j === i ? { ...c, desde } : c)) } }
}
function conImplementacion(s: Servicio, valor: number | null): Servicio {
  const p = s.precio
  return p.tipo === 'planes' ? { ...s, precio: { ...p, implementacionDesde: valor } } : s
}
const conPasos = (s: Servicio, pasos: readonly string[]): Servicio => ({ ...s, proceso: { ...s.proceso, pasos } })

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · los números publicados son los del SPEC §7')

interface Publicado {
  readonly calibres: readonly number[]
  readonly mantenimiento: readonly number[]
  readonly software: readonly number[]
  readonly mensual: readonly number[]
  readonly conversaciones: readonly number[]
}
const ESPERADO: Publicado = {
  calibres: [200, 600, 1000],
  mantenimiento: [50, 100],
  software: [1000],
  mensual: [49, 90, 150],
  conversaciones: [500, 3000, 5000],
}
/** «Desde USD 1.000» → 1000. */
const usdDeTexto = (texto: string | null): number | null => {
  const m = texto === null ? null : /USD\s*([\d.]+)/.exec(texto)
  return m === null ? null : Number(m[1].replace(/\./g, ''))
}
const publicado = (web: Servicio, software: Servicio, ia: Servicio): Publicado => ({
  calibres: web.precio.tipo === 'calibres' ? web.precio.calibres.map((c) => c.desde) : [],
  mantenimiento: (web.extra?.items ?? []).map((i) => usdDeTexto(i.precio)).filter((n): n is number => n !== null),
  software: software.precio.tipo === 'proyecto' ? [software.precio.desde] : [],
  mensual: ia.precio.tipo === 'planes' ? ia.precio.planes.map((p) => p.mensual) : [],
  conversaciones: ia.precio.tipo === 'planes' ? ia.precio.planes.map((p) => p.conversaciones) : [],
})
const coincideConElSpec = (p: Publicado): boolean => JSON.stringify(p) === JSON.stringify(ESPERADO)

afirmar(
  coincideConElSpec(publicado(PAGINAS_WEB, SOFTWARE_A_MEDIDA, IA_Y_AUTOMATIZACIONES)),
  'calibres 200/600/1.000 · mantenimiento desde 50 y 100 · software desde 1.000 · planes 49/90/150 con 500/3.000/5.000',
)
controlPositivo('el detector VE un calibre alterado', publicado(conCalibre(PAGINAS_WEB, 0, 250), SOFTWARE_A_MEDIDA, IA_Y_AUTOMATIZACIONES), coincideConElSpec)
controlPositivo('  y un software alterado', publicado(PAGINAS_WEB, { ...SOFTWARE_A_MEDIDA, precio: { tipo: 'proyecto', desde: 900, nota: '' } }, IA_Y_AUTOMATIZACIONES), coincideConElSpec)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · los casos de proyecto salen de PROYECTOS')

const SLUGS_DE_LA_FUENTE: readonly string[] = FUENTE_DE_PROYECTOS.map((p) => p.slug)
interface CasoSuelto {
  readonly tipo: string
  readonly slug?: string
}
const casosExisten = (casos: readonly CasoSuelto[]): boolean =>
  casos.every((c) => c.tipo !== 'proyecto' || (c.slug !== undefined && SLUGS_DE_LA_FUENTE.includes(c.slug)))

afirmar(SERVICIOS.every((s) => casosExisten(s.prueba.casos)), 'todo caso de tipo proyecto existe en la fuente')
controlPositivo('el detector VE un slug que no existe', [{ tipo: 'proyecto', slug: 'no-existe' }], casosExisten)
afirmarIgual(
  PAGINAS_WEB.prueba.casos.map((c) => (c.tipo === 'proyecto' ? c.slug : null)),
  SLUGS_DE_LA_FUENTE,
  'Páginas web muestra los tres proyectos, en el orden de PROYECTOS',
)
afirmar(PAGINAS_WEB.prueba.casos.every((c) => c.tipo === 'proyecto' && c.texto.length > 0), '  y cada uno lleva su texto propio')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · calibres y planes van de menor a mayor')

const ascendente = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || xs[i - 1] < x)
const PUBLICADO = publicado(PAGINAS_WEB, SOFTWARE_A_MEDIDA, IA_Y_AUTOMATIZACIONES)
afirmar(ascendente(PUBLICADO.calibres), 'los calibres: de menor a mayor precio', PUBLICADO.calibres.join(' < '))
afirmar(ascendente(PUBLICADO.mensual) && ascendente(PUBLICADO.conversaciones), 'los planes: de menor a mayor precio y cuota', PUBLICADO.mensual.join(' < '))
controlPositivo('el detector VE los calibres invertidos', [1000, 600, 200], ascendente)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · lo que el SPEC deja en [a definir] es null, no 0 ni vacío')

interface Pendiente {
  readonly campo: string
  readonly valor: unknown
}
function pendientesDe(s: Servicio): readonly Pendiente[] {
  const p = s.precio
  const salida: Pendiente[] = []
  if (p.tipo === 'calibres') salida.push({ campo: 'Simple.autogestionable', valor: p.calibres.find((c) => c.nombre === 'Simple')?.autogestionable })
  if (p.tipo === 'planes') {
    salida.push({ campo: 'implementacionDesde', valor: p.implementacionDesde })
    for (const plan of p.planes) salida.push({ campo: `${plan.nombre}.funcionalidades`, valor: plan.funcionalidades })
  }
  if (s.extra !== null) salida.push({ campo: 'extra «Plan mensual».precio', valor: s.extra.items.find((i) => i.nombre === 'Plan mensual')?.precio })
  return salida
}
const todoNull = (ps: readonly Pendiente[]): boolean => ps.every((x) => x.valor === null)
const PENDIENTES = SERVICIOS.flatMap(pendientesDe)

afirmar(todoNull(PENDIENTES), 'los campos [a definir] valen null', PENDIENTES.map((x) => x.campo).join(' · '))
afirmarIgual(PENDIENTES.length, 6, '  y son seis (la Simple, el plan mensual, la implementación y las tres funcionalidades): el predicado mira algo')
controlPositivo('el detector VE un 0 en implementacionDesde', pendientesDe(conImplementacion(IA_Y_AUTOMATIZACIONES, 0)), todoNull)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · el FAQ: las preguntas del SPEC, y respuesta solo si sale del SPEC (D9)')

const PREGUNTAS_DEL_SPEC: Readonly<Record<string, readonly string[]>> = {
  'paginas-web': ['¿Cuánto tarda una web?', '¿Puedo editarla yo después?', '¿Qué pasa después de la entrega?', '¿Qué incluye el portal del cliente?', '¿El chatbot viene incluido?'],
  'software-a-medida': ['¿Cómo sé si necesito un sistema propio?', '¿Qué pasa si después necesito cambios?', '¿El sistema es mío?', '¿Cuánto soporte incluye?'],
  'ia-y-automatizaciones': ['¿El bot reemplaza a mi equipo?', '¿Puedo ver las conversaciones?', '¿Qué pasa si no sabe responder?', '¿Qué cuenta como una conversación?', '¿Qué pasa si se agota la cuota del mes?', '¿Qué pasa con los datos de mis visitantes?'],
}
const preguntasIguales = (s: Servicio): boolean => JSON.stringify(s.faq.map((f) => f.pregunta)) === JSON.stringify(PREGUNTAS_DEL_SPEC[s.slug])
afirmar(SERVICIOS.every(preguntasIguales), 'cada servicio trae las preguntas del SPEC, en su orden')
controlPositivo('el detector VE una pregunta que falta', { ...SOFTWARE_A_MEDIDA, faq: SOFTWARE_A_MEDIDA.faq.slice(1) }, preguntasIguales)

const SIN_RESPUESTA = ['¿Qué pasa si después necesito cambios?', '¿El sistema es mío?', '¿El bot reemplaza a mi equipo?']
afirmarIgual(
  SERVICIOS.flatMap((s) => s.faq.filter((f) => f.respuesta === null).map((f) => f.pregunta)),
  SIN_RESPUESTA,
  'sin respuesta (null): cambios, «¿El sistema es mío?» y «¿El bot reemplaza a mi equipo?»',
)
afirmar(SERVICIOS.every((s) => s.faq.every((f) => f.respuesta === null || f.respuesta.trim().length > 0)), '  y ninguna respuesta es un texto vacío')

const COMENTARIO_DEL_SPEC = /\/\/\s*SPEC §7\.\d/
/** Las líneas de un `respuesta:` que no es null y no tiene `// SPEC §7.x` en su línea ni en la de arriba. */
function respuestasSinFuente(texto: string): number[] {
  const lineas = texto.split('\n')
  const sin: number[] = []
  lineas.forEach((linea, i) => {
    if (!/^\s*respuesta:/.test(linea) || /^\s*respuesta:\s*null\b/.test(linea)) return
    if (!COMENTARIO_DEL_SPEC.test(linea) && !(i > 0 && COMENTARIO_DEL_SPEC.test(lineas[i - 1]))) sin.push(i + 1)
  })
  return sin
}
const todasConFuente = (texto: string): boolean => respuestasSinFuente(texto).length === 0
const FUENTES_DE_DATOS = ARCHIVOS_DE_DATOS.map((f) => leer(`${CARPETA}/datos/${f}`))
afirmar(FUENTES_DE_DATOS.every(todasConFuente), 'cada respuesta escrita lleva `// SPEC §7.x` en su línea o en la de arriba')
afirmar(FUENTES_DE_DATOS.some((t) => /^\s*respuesta:\s*[^n\s]/m.test(t)), '  y hay respuestas escritas: el barrido mira algo')
controlPositivo('el detector VE una respuesta sin su línea del SPEC', "{ pregunta: 'x',\n  respuesta: 'algo',\n}", todasConFuente)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · el bot de WhatsApp no se ofrece')

/** Cada texto del servicio, salvo los títulos del blog: listan notas, no ofrecen nada. */
function textosDe(valor: unknown, omitir: ReadonlySet<string>, acumulado: string[] = []): string[] {
  if (typeof valor === 'string') acumulado.push(valor)
  else if (Array.isArray(valor)) for (const v of valor as readonly unknown[]) textosDe(v, omitir, acumulado)
  else if (valor !== null && typeof valor === 'object') {
    for (const [clave, v] of Object.entries(valor)) if (!omitir.has(clave)) textosDe(v, omitir, acumulado)
  }
  return acumulado
}
const NO_SON_TEXTO = new Set(['articulos'])
const noOfreceWhatsApp = (textos: readonly string[]): boolean => !textos.some((t) => /whats\s?app/i.test(t) && !/pr[oó]ximamente|en desarrollo/i.test(t))
afirmar(SERVICIOS.every((s) => noOfreceWhatsApp(textosDe(s, NO_SON_TEXTO))), 'ningún texto ofrece WhatsApp como servicio activo')
afirmar(noOfreceWhatsApp(['Próximamente: bot de WhatsApp']), '  «próximamente» sí se admite')
afirmar(!noOfreceWhatsApp(textosDe(IA_Y_AUTOMATIZACIONES, new Set())), '  y el barrido llega hasta los títulos del blog, que sí nombran WhatsApp: recorre el objeto entero, no está ciego')
controlPositivo('el detector VE un texto que ofrece WhatsApp', ['Bot de WhatsApp incluido en todos los planes'], noOfreceWhatsApp)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · la marca sale de LOGOTIPO, no se escribe suelta')

const sinMarcaSuelta = (texto: string): boolean => !/develop/i.test(texto)
afirmar(FUENTES_DE_DATOS.every(sinMarcaSuelta), 'la marca no aparece escrita en ningún datos/*.ts')
controlPositivo('el detector VE la marca suelta', "title: 'Páginas web · develOP'", sinMarcaSuelta)
afirmar(SERVICIOS.every((s) => s.seo.title === `${s.nombre} · ${LOGOTIPO}`), 'seo.title = nombre · LOGOTIPO')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · el acento: el único hex; el copy provisorio, marcado')

const CLARO_DEL_SPEC = { 'paginas-web': '#8FC0E8', 'software-a-medida': '#AFA0E8', 'ia-y-automatizaciones': '#7FCBA4' } as const
afirmar(SLUGS_DE_SERVICIO.every((slug) => servicioDe(slug).acento.claro === CLARO_DEL_SPEC[slug]), 'acento.claro de cada servicio es el de SPEC §9')

/** Las líneas con un hex que no son un `claro:` con `// P-H2`. */
function hexSueltos(texto: string): number[] {
  const sin: number[] = []
  texto.split('\n').forEach((linea, i) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(linea) && !(/\bclaro:/.test(linea) && /\/\/\s*P-H2/.test(linea))) sin.push(i + 1)
  })
  return sin
}
const sinHexSueltos = (texto: string): boolean => hexSueltos(texto).length === 0
const FUENTES = fuentesDeServicios(CARPETA)
const TEXTOS = FUENTES.map(leer)
afirmar(TEXTOS.every(sinHexSueltos), 'el único hex de `_servicios/` es `acento.claro`, en una línea con `// P-H2`', `${FUENTES.length} archivos`)
afirmarIgual(TEXTOS.join('\n').match(/#[0-9a-fA-F]{6}\b/g)?.length ?? 0, 3, '  y son tres: el barrido mira algo')
controlPositivo('el detector VE un hex suelto', "const rojo = '#FF0000'", sinHexSueltos)
controlPositivo('  y un `claro` sin su `// P-H2`', "claro: '#8FC0E8',", sinHexSueltos)

/** Las líneas de copy provisorio (botón, title, description) sin `// C2`. */
function copySinMarca(texto: string): number[] {
  const sin: number[] = []
  texto.split('\n').forEach((linea, i) => {
    if (/^\s*(boton|title|description):/.test(linea) && !/\/\/\s*C2/.test(linea)) sin.push(i + 1)
  })
  return sin
}
const copyMarcado = (texto: string): boolean => copySinMarca(texto).length === 0
afirmar(FUENTES_DE_DATOS.every(copyMarcado), 'el botón del CTA y el title y la description del SEO llevan `// C2`')
afirmar(FUENTES_DE_DATOS.some((t) => /^\s*boton:/m.test(t)), '  y hay botones: el barrido mira algo')
controlPositivo('el detector VE un botón sin `// C2`', "boton: 'Quiero mi web',", copyMarcado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · ninguna cifra inventada, el orden y la forma de cada servicio')

const CIFRAS_DEL_SPEC = new Set([1, 2, 3, 4, 7, 24, 49, 50, 90, 100, 150, 200, 500, 600, 1000, 3000, 5000])
const cifrasDe = (textos: readonly string[]): number[] => textos.flatMap((t) => [...t.matchAll(/\d{1,3}(?:\.\d{3})+|\d+/g)].map((m) => Number(m[0].replace(/\./g, ''))))
const todasSonDelSpec = (textos: readonly string[]): boolean => cifrasDe(textos).every((n) => CIFRAS_DEL_SPEC.has(n))
const NO_VAN_AL_TEXTO = new Set(['acento', 'slug', 'idEnElHome', 'href', 'imagen'])
afirmar(SERVICIOS.every((s) => todasSonDelSpec(textosDe(s, NO_VAN_AL_TEXTO))), 'toda cifra escrita en un texto está en el SPEC §7', [...CIFRAS_DEL_SPEC].join(' '))
const CIFRAS_EN_LOS_TEXTOS = new Set(cifrasDe(SERVICIOS.flatMap((s) => textosDe(s, NO_VAN_AL_TEXTO))))
afirmar(CIFRAS_EN_LOS_TEXTOS.size >= 5, '  y el barrido encuentra cifras en los textos: mira algo', [...CIFRAS_EN_LOS_TEXTOS].sort((a, b) => a - b).join(' '))
controlPositivo('el detector VE una cifra inventada', ['Desde USD 999'], todasSonDelSpec)

const ORDEN_DEL_SPEC = ['paginas-web', 'software-a-medida', 'ia-y-automatizaciones']
const enElOrdenDelSpec = (slugs: readonly string[]): boolean => JSON.stringify(slugs) === JSON.stringify(ORDEN_DEL_SPEC)
afirmar(enElOrdenDelSpec(SERVICIOS.map((s) => s.slug)) && enElOrdenDelSpec(SLUGS_DE_SERVICIO), 'SERVICIOS y SLUGS_DE_SERVICIO: los tres slugs, en el orden del SPEC')
controlPositivo('el detector VE dos servicios cambiados de lugar', ['software-a-medida', 'paginas-web', 'ia-y-automatizaciones'], enElOrdenDelSpec)
afirmar(SLUGS_DE_SERVICIO.every((slug) => servicioDe(slug).slug === slug), 'servicioDe(slug) devuelve el servicio de ese slug')
afirmar(esServicioSlug('paginas-web') && !esServicioSlug('xyz') && !esServicioSlug(''), 'esServicioSlug acepta los tres y rechaza el resto')
afirmarIgual(SLUGS_DE_SERVICIO.map(hrefDe), ['/v3/paginas-web', '/v3/software-a-medida', '/v3/ia-y-automatizaciones'], 'hrefDe arma /v3/<slug>')

const IDS_EN_EL_HOME = { 'paginas-web': 'web', 'software-a-medida': 'software', 'ia-y-automatizaciones': 'ia-automatizacion' } as const
afirmar(SERVICIOS.every((s) => s.idEnElHome === IDS_EN_EL_HOME[s.slug]), 'idEnElHome es el id del servicio en el home (web, software, ia-automatizacion)')
const cincoPasos = (s: Servicio): boolean => s.proceso.pasos.length === 5
afirmar(SERVICIOS.every(cincoPasos), 'cada proceso tiene 5 pasos (SPEC §5)')
controlPositivo('el detector VE un proceso de 4 pasos', conPasos(PAGINAS_WEB, ['Charla', 'Propuesta', 'Diseño', 'Entrega']), cincoPasos)
afirmar(SERVICIOS.every((s) => s.seo.description === s.queHacemos.texto), 'seo.description = queHacemos.texto (D10)')
afirmar(IA_Y_AUTOMATIZACIONES.prueba.ctaPanel?.href === '/login' && PAGINAS_WEB.prueba.ctaPanel === null && SOFTWARE_A_MEDIDA.prueba.ctaPanel === null, '«Probá el panel» lleva a /login (D11) y solo está en IA')

cerrar('servicios-datos')
