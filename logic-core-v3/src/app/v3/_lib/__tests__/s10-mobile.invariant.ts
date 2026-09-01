/**
 * INVARIANTE — MOBILE: el segundo sitio, el que se sirve abajo de 1025 y que
 * nadie miró nunca porque todo lo que se construyó se juzgó a 1440.
 *
 * Corre con `npx tsx src/app/v3/_lib/__tests__/s10-mobile.invariant.ts`.
 *
 * Los detectores puros y las entradas fabricadas rotas viven en `./s10-mobile`,
 * para que cada control positivo corra LA MISMA función contra una entrada
 * equivocada. Ese archivo queda fuera del escaneo de tokens y lo dice en su
 * docblock.
 *
 * ⚠️ **LO QUE ESTE FRENTE MIDE Y LO QUE PUBLICA.** Se AFIRMA lo que es cierto y
 * este instrumento controla; se PUBLICA con `console.log` —con número, gravedad
 * y dueño— todo defecto que este sprint decidió no arreglar. Es la regla 13 del
 * repo. Un rojo acá sería un frente de medición bloqueando un sprint que no le
 * pidió que arregle nada.
 */

import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

import { pisoDelFramework } from '../../../../components/layout/carga-diferida/__tests__/soporte'
import { SERVICIOS } from '../../_secciones/_contrato/acento'
import { pantallasDe } from '../../_secciones/_contrato/forma'
import { GEOMETRIA } from '../../_secciones/numeros/Numeros'
import { CONTENIDO as NUMEROS } from '../../_secciones/numeros/contenido'
import { CONTENIDO as TRABAJOS } from '../../_secciones/trabajos/contenido'
import { DESCUENTO_UMBRAL_PX, umbralPx } from '../navegacion'
import { SECCIONES } from '../secciones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import {
  ALTOS,
  ALTOS_DECLARADOS,
  ANCHOS_DE_REFERENCIA,
  HUECOS,
  QUE_SIRVE_CADA_RAMA,
  SUPUESTOS_DEL_BANCO,
  VIEWPORTS_MEDIDOS,
  marcadoDelHome,
} from './s10-banco'
import { SUPUESTOS_DEL_MODELO_DE_CSS, anchoDeContenido, clasesEfectivas, tokenPx } from './s10-css'
import { ordenDeSecciones } from './s10-lectura'
import * as M from './s10-mobile'
import { modeloDelCierre } from './s10-mobile-pie'
import { atributo, nodosDe } from './s10-recorrido'
import { DIST, conjuntoInicial, contiene, kib, pesar } from './s3-bundle'
import { leer } from './s5-archivos'

/** Los cuatro anchos de este frente: los cinco del banco menos 1025, que es el
 *  otro sitio. 1025 entra sólo como contraste, para que los detectores no
 *  queden ciegos por medir un solo lado del umbral. */
const ANCHOS_DE_MOBILE = [375, 390, 768, 1024] as const
const html = marcadoDelHome('quieta')
const animada = marcadoDelHome('animada')
const secciones = M.seccionesDe(M.arbolDe(html))
const px0 = (n: number): string => n.toFixed(0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La ventana de validez: qué se mide, sobre qué, y con qué supuestos')

console.log(`  rama quieta = ${QUE_SIRVE_CADA_RAMA.quieta}`)
for (const a of ANCHOS_DE_REFERENCIA) console.log(`  ${String(a.px).padStart(4)} px — ${a.porQue}`)
for (const a of ALTOS_DECLARADOS) console.log(`  ${String(a.px).padStart(4)} px de ALTO — ${a.fuente}`)
console.log(`  pares que este repo midió juntos: ${VIEWPORTS_MEDIDOS.map((v) => `${v.ancho}x${v.alto}`).join(' · ')}. ⚠ para 768, 1024 y 1025 NO hay alto medido: lo que dependa del alto va evaluado en los TRES.`)
for (const s of [...SUPUESTOS_DEL_BANCO, ...SUPUESTOS_DEL_MODELO_DE_CSS]) console.log(`    supuesto · ${s}`)

const MARCAS = ['will-change', 'transform:']
afirmarIgual(MARCAS.filter((m) => html.includes(m)), [], 'la rama quieta no trae una sola marca de coreografía')
afirmarIgual(MARCAS.filter((m) => !animada.includes(m)), [], '  y la animada las trae todas — el detector no está ciego')
afirmarIgual(ordenDeSecciones(html), SECCIONES.map((s) => s.id), 'las ocho salen enteras y en el orden de la tabla')
controlPositivo('el detector de coreografía ve la rama animada', animada, (h: string) => MARCAS.every((m) => !h.includes(m)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Pantallas de FLUJO contra pantallas DECLARADAS, por ancho')

console.log('  [modelado, no medido] cajas de pantalla del marcado, combinadas por columna (suma) o por fila (máximo).')
const flujo = new Map<string, Map<number, M.Medida>>()
for (const rama of secciones) {
  const id = atributo(rama.nodo, 'id') ?? '?'
  const fila = new Map<number, M.Medida>()
  for (const a of [...ANCHOS_DE_MOBILE, 1025]) fila.set(a, M.medirPantallas(rama, a))
  flujo.set(id, fila)
  const decl = pantallasDe(SECCIONES.find((s) => s.id === id) ?? SECCIONES[0])
  const cols = ANCHOS_DE_MOBILE.map((a) => String(fila.get(a)?.pantallas ?? 0).padStart(6)).join('')
  console.log(`  ${id.padEnd(16)} declarado ${decl}  ·  flujo @375/390/768/1024:${cols}`)
}

const SIN_CAJA_DE_PANTALLA = ['por-que-develop', 'cierre']
for (const id of ['hero', 'quienes-somos', 'numeros', 'tu-panel']) {
  const decl = pantallasDe(SECCIONES.find((s) => s.id === id) ?? SECCIONES[0])
  const iguales = ANCHOS_DE_MOBILE.every((a) => flujo.get(id)?.get(a)?.pantallas === decl)
  afirmar(iguales, `${id}: el flujo llena las ${decl} pantallas declaradas en los cuatro anchos`)
}
for (const id of SIN_CAJA_DE_PANTALLA) {
  afirmar(ANCHOS_DE_MOBILE.every((a) => flujo.get(id)?.get(a)?.pantallas === 0), `${id}: CERO cajas de pantalla — su alto es intrínseco y el \`min-height\` de la tabla es el piso`)
}
afirmar(ANCHOS_DE_MOBILE.slice(0, 2).every((a) => flujo.get('trabajos')?.get(a)?.pantallas === 3), 'trabajos: a 375 y 390 los tres proyectos llenan los 300svh — la decisión de SITIO-S5 se cumple donde la grilla colapsa')
console.log(
  '  🔴 DEFECTO 2 [gravedad alta · dueño: `Grilla` + `Trabajos.tsx`, NO se arregla acá] — a 768 y 1024 la grilla de tres NO colapsa ' +
    `(\`tablet:grid-cols-3\` ya aplica en 768), así que los tres proyectos entran EN FILA y el flujo mide ${flujo.get('trabajos')?.get(768)?.pantallas} pantalla contra las 3 ` +
    'declaradas: quedan DOS PANTALLAS DE BANDA OSCURA VACÍA. El `escritorio:min-h-0` que apaga la pantalla por proyecto arranca en ' +
    '1025 y la fila arranca en 768: entre esos dos anchos nadie sostiene el alto. Es lo que la instrucción mandó a verificar.',
)
for (const [a, alto] of [[375, 667], [390, 844], [768, 900]] as const) {
  const crecen = nodosDe(html).filter((n) => clasesEfectivas(atributo(n, 'class') ?? '', a).includes('min-h-svh'))
    .map((n) => ({ s: n.seccion ?? '?', t: M.altoDeTinta(html, n.indice, M.finDelSubarbol(html, n), a) })).filter((x) => x.t > alto)
  console.log(`  @${a}x${alto}: cajas de pantalla cuya TINTA sola ya no entra — la caja CRECE, no recorta: ${crecen.length === 0 ? 'ninguna' : crecen.map((g) => `${g.s} ${px0(g.t)} px`).join(' · ')}`)
}
controlPositivo('el contador ve la variante de ancho: tres cajas en fila miden UNA, no tres', 768, (a: number) => M.medirPantallas(M.arbolDe(M.TRES_EN_FILA)[0], a).pantallas === 3)
afirmarIgual(M.medirPantallas(M.arbolDe(M.TRES_EN_FILA)[0], 375).pantallas, 3, '  y a 375, donde la grilla es de una columna, las mismas tres miden TRES')
controlPositivo('el contador no se pone verde sobre un marcado sin cajas de pantalla', M.SIN_PANTALLAS, (h: string) => M.medirPantallas(M.arbolDe(h)[0], 375).pantallas > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cajas CLAVADAS: `h-svh` es un alto fijo y `min-h-svh` es un piso')

const desbordes = ANCHOS_DE_MOBILE.flatMap((a) => (flujo.get('servicios')?.get(a)?.desbordes ?? []).map((d) => ({ a, d })))
const clavadasPorAncho = (a: number): string[] =>
  nodosDe(html).filter((n) => clasesEfectivas(atributo(n, 'class') ?? '', a).includes('h-svh')).map((n) => n.seccion ?? '?')
for (const a of ANCHOS_DE_MOBILE) {
  afirmarIgual(clavadasPorAncho(a), ['servicios'], `@${a}: hay UNA sola caja de alto fijo en todo el home, y es la de servicios`)
}
afirmarIgual(clavadasPorAncho(1025).sort(), ['servicios', 'trabajos'], '@1025 aparece la segunda: el `escritorio:h-svh` de trabajos NO rige abajo del umbral')
afirmar(desbordes.length === ANCHOS_DE_MOBILE.length, `la caja clavada de servicios desborda en los ${ANCHOS_DE_MOBILE.length} anchos de mobile`)
console.log(
  '  🔴 DEFECTO 1 [gravedad CRÍTICA · dueño: `_contrato/Seccion.tsx` + `servicios/Servicios.tsx`, NO se arregla acá] — ' +
    `\`Seccion\` envuelve a Servicios en \`sticky top-0 h-svh\` (alto FIJO, una pantalla) y adentro Servicios pone su ` +
    `propio \`Bloque\` de \`min-height: 300svh\` con los TRES bloques apilados: ${desbordes[0]?.d.contenido} pantallas de contenido dentro de ` +
    'UNA clavada. Es la doble contención que dejó la unificación de contratos de SITIO-S7: la rama pinneada del lane A ' +
    'se sumó a la contención propia que el lane B ya traía, y nadie las restó.',
)
for (const [a, alto] of [[375, 667], [390, 844], [768, 900]] as const) {
  const tinta = M.tintaDeLaCajaClavada(html, a)
  console.log(`    @${a}x${alto}: la TINTA sola de la caja clavada mide ${px0(tinta)} px contra los ${alto} de su caja — ${(tinta / alto).toFixed(2)}x. [piso: ignora rellenos y separaciones]`)
}
console.log('    consecuencia leída del mecanismo (NO medida en navegador): la caja queda pegada 200svh, así que el 2º y el 3er servicio nunca suben a cuadro dentro del rango de pegado.')
controlPositivo('el detector ve una caja clavada desbordada', M.CLAVADA_QUE_DESBORDA, (h: string) =>
  M.medirPantallas(M.arbolDe(h)[0], 375).desbordes.length === 0)
afirmarIgual(M.medirPantallas(M.arbolDe(M.CLAVADA_QUE_ENTRA)[0], 375).desbordes, [], '  y no la ve donde el contenido entra — no está gritando por cualquier `h-svh`')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Números: qué le pasa a la dispersión cuando el ancho se achica')

const POSICIONES = [GEOMETRIA.cabecera, ...NUMEROS.cifras.flatMap((c) => [GEOMETRIA.celdas[c.clave].celda, GEOMETRIA.celdas[c.clave].desplome])]
const CUANTAS = POSICIONES.flatMap((c) => c.split(/\s+/).filter(Boolean)).length
const clasesDePosicion = (a: number): string[] => POSICIONES.flatMap((c) => clasesEfectivas(c, a))
afirmarIgual(clasesDePosicion(375), [], `a 375 NO sobrevive ni una clase de posición: las ${CUANTAS} viven en la variante \`tablet:\``)
afirmarIgual(clasesDePosicion(390), [], '  ni a 390')
afirmarIgual(clasesDePosicion(768).length, CUANTAS, `a 768 vuelven las ${CUANTAS} — el detector no está ciego`)
const tamanos = NUMEROS.cifras.map((c) => Number(tokenPx(`--text-fluido-${GEOMETRIA.celdas[c.clave].nivel}`, 375).toFixed(2)))
afirmarIgual([...new Set(tamanos)].sort((x, y) => y - x), [36, 24, 18, 16], 'a 375 los cuatro niveles de display se comprimen a 36 · 24 · 18 · 16 px — reproduce la cifra del docblock de `Numeros.tsx`')
afirmar(new Set(tamanos).size === 4, `y siguen siendo CUATRO tamaños distintos para las cinco cifras: la asimetría de escala sobrevive`, tamanos.map(px0).join(' · '))
console.log(
  '  ⚠️ DECISIÓN, NO DEFECTO [dueño: `Numeros.tsx`] — a 375 y 390 la composición dispersa COLAPSA a una columna en orden ' +
    `de documento (${NUMEROS.cifras.map((c) => c.clave).join(' → ')}) y lo único que queda de la asimetría son los tamaños. ` +
    'Está declarado en el docblock y el docblock dice la verdad: lo verifiqué.',
)
console.log(
  `  ⚠️ HALLAZGO [gravedad media · dueño: la escala fluida de \`theme-develop.css\`] — a 375 la cifra más chica (\`${GEOMETRIA.celdas.anios.nivel}\`) resuelve a ` +
    `${px0(tokenPx('--text-fluido-titulo-s', 375))} px, que es EXACTAMENTE \`--text-base\` (${px0(tokenPx('--text-base', 375))}) y un solo píxel arriba de \`--text-cuerpo\` ` +
    `(${px0(tokenPx('--text-cuerpo', 375))}): en el ancho donde vive la mitad de los visitantes, una de las cinco cifras dejó de leerse como cifra.`,
)
controlPositivo('el filtro de variantes distingue los dos lados del breakpoint', 767, (a: number) => clasesEfectivas('tablet:col-start-1', a).length === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Trabajos: los 300svh sin pin, y el ~810 px que el docblock publica')

const tarjetas = nodosDe(html).filter((n) => n.seccion === 'trabajos' && atributo(n, 'data-proyecto') !== null)
afirmarIgual(tarjetas.length, TRABAJOS.proyectos.length, `las tres tarjetas salen enteras en la rama quieta`)
for (const [a, alto] of [[375, 667], [390, 844], [768, 900]] as const) {
  const una = M.altoDeTinta(html, tarjetas[0].indice, M.finDelSubarbol(html, tarjetas[0]), a)
  console.log(`  @${a}: una tarjeta mide ${px0(una)} px de tinta y las tres apiladas ${px0(3 * una)} px [piso: captura 2:1 + rótulo, sin separaciones ni rellenos] · la caja de cada una es \`min-h-svh\` = ${alto} px`)
}
console.log(
  `  ⚠️ CIFRA HEREDADA VENCIDA [dueño: los docblocks de \`_lib/secciones.ts\` y \`Trabajos.tsx\`] — los «~810 px» que los dos publican para las tres capturas apiladas a 375 NO se reproducen: mi instrumento da ${px0(3 * M.altoDeTinta(html, tarjetas[0].indice, M.finDelSubarbol(html, tarjetas[0]), 375))} px. ` +
    'Y la cifra ya no gobierna nada: desde que cada proyecto lleva `min-h-svh` la pila mide TRES PANTALLAS y no su alto intrínseco. El número describe una versión del marcado que ya no existe.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Servicios: la secuencia perdida tiene que seguir teniendo sentido')

const bloques = nodosDe(html).filter((n) => atributo(n, 'data-servicio') !== null)
afirmarIgual(bloques.length, SERVICIOS.length, 'sobre el HOME COMPUESTO hay exactamente tres bloques de servicio, uno por servicio')
afirmarIgual(bloques.filter((b) => bloques.some((o) => o !== b && o.desde < b.desde && o.hasta > b.hasta)).length, 0, '  y ninguno está anidado adentro de otro: son hermanos, así que nunca hay dos acentos en el mismo cuadro')
const visible = html.replace(/<[^>]*>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')
afirmarIgual(SERVICIOS.filter((s) => !visible.includes(s.nombre)), [], '  y los tres nombres se leen enteros sin una sola animación')
controlPositivo('el buscador ve un nombre que falta', 'Un servicio que no existe', (t: string) => visible.includes(t))
console.log('  ⚠️ pero los tres viven ADENTRO de la caja clavada del §3: la secuencia no se pierde por falta de coreografía — se pierde por geometría.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El pie y el alto del Cierre — el modelo de `s8-cierre` §14, generalizado')

const fijoA1440 = modeloDelCierre(1440, false)
afirmarIgual(Number(px0(fijoA1440.total)), 741, 'CONTROL EXTERNO: con los tokens FIJOS a 1440 el modelo reproduce los 741 px que `s8-cierre.invariant` publica')
for (const a of [375, 390, 768, 1024, 1440]) {
  const m = modeloDelCierre(a)
  console.log(`  @${a}: ${px0(m.total)} px · columnas ${m.columnas.map(px0).join(' / ')} · titular en ${m.lineasDelTitular} línea(s) · ${m.apiladas ? 'APILADAS' : 'en fila'}`)
  afirmar(m.columnas[0] === Math.max(...m.columnas), `  @${a} la columna del RECORRIDO sigue siendo la más alta — la conclusión de SITIO-S8 vale también abajo de 1025`)
}
afirmar(modeloDelCierre(375).apiladas && !modeloDelCierre(768).apiladas, 'las tres columnas se apilan sólo ABAJO de 768, no abajo de 1025: a 768 y 1024 ya van en fila')
console.log(`  @375 el Cierre crece más allá de su 100svh: ${ALTOS.map((h) => `${h}→${(modeloDelCierre(375).total / h).toFixed(2)} pantallas`).join(' · ')}`)
console.log(
  `  ⚠️ CORRECCIÓN AL MODELO PUBLICADO [dueño: \`s8-cierre.invariant.tsx\` §14, NO se toca acá] — su cifra de 1029 px a 375 ` +
    `sale de leer los tokens FIJOS (\`--text-micro\`, \`--text-caption\`, \`--text-titulo-xl\`) donde el marcado emite las clases ` +
    `FLUIDAS, y de suponer un titular de tres líneas donde el corte real da ${modeloDelCierre(375).lineasDelTitular}. Con las dos entradas corregidas da ` +
    `${px0(modeloDelCierre(375).total)} px. **La conclusión de §7.28 sobrevive**: sigue pasándose de una pantalla a 375 y sigue entrando a 1440.`,
)
controlPositivo('el modelo distingue la familia de tokens: fluido y fijo NO dan lo mismo a 375', 375, (a: number) =>
  px0(modeloDelCierre(a, true).total) === px0(modeloDelCierre(a, false).total))
controlPositivo('el cortador de líneas no está ciego: el titular NO cabe en dos renglones de 40 px', 375, (a: number) =>
  modeloDelCierre(a).lineasDelTitular >= Math.ceil(anchoDeContenido(a) / 40))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · La pastilla de navegación: dónde nace, dónde queda, y si entra')

const pastilla = M.anchoDeLaPastilla(375)
afirmarIgual(DESCUENTO_UMBRAL_PX, 96, 'el umbral es `100svh − 96px`, derivado de los cuatro tokens de `_lib/navegacion.ts`')
for (const alto of ALTOS) {
  afirmar(umbralPx(alto) > 0, `@alto ${alto}: nace en ${px0(pastilla.nacimiento(alto))} y queda en reposo tras ${umbralPx(alto)} px de scroll (${((umbralPx(alto) / alto) * 100).toFixed(0)}% de la primera pantalla)`)
}
console.log(`  el alto de la pastilla es ${pastilla.alto} px y no depende del ancho (\`--text-cuerpo\` es invariante). ⚠️ el umbral se acorta con el viewport: ${ALTOS.map((h) => `${h}→${umbralPx(h)}`).join(' · ')}. A 667 el viaje dura ${umbralPx(667)} px, ${umbralPx(900) - umbralPx(667)} menos que a 900: el gesto se lee más rápido y no se rompe, porque la aritmética es relativa a \`100svh\` y no tiene un solo número copiado.`)
const CSS_DE_LA_PASTILLA = leer('src/app/v3/_estilos/navegacion.css')
afirmar(!/flex-wrap|max-inline-size|inline-size:\s*min/.test(CSS_DE_LA_PASTILLA), 'la pastilla NO declara `flex-wrap` ni ningún tope de ancho: es una fila de cinco enlaces que no puede plegarse')
afirmar(!/@media|escritorio/.test(CSS_DE_LA_PASTILLA), '  y no tiene una sola media query: se monta idéntica en los cinco anchos')
console.log(
  `  🔴 DEFECTO 3 [gravedad alta · dueño: \`_componentes/chrome/Navegacion.tsx\` + \`_estilos/navegacion.css\`, NO se arregla acá] — ` +
    `la pastilla mide ${px0(pastilla.total)} px de ancho [modelado con los avances del \`.woff2\` que /v3 sirve; es un PISO, porque los rótulos van ` +
    `en \`font-semi\` y el lector mide la instancia por defecto]. Es \`position:absolute; left:50%; translateX(-50%)\`, así que a 375 se sale ` +
    `${px0((pastilla.total - 375) / 2)} px por CADA lado y a 390, ${px0((pastilla.total - 390) / 2)}. Entra recién a partir de ~${px0(pastilla.total)} px de viewport.`,
)
console.log(`    enlace por enlace: ${pastilla.enlaces.map((e) => `${e.rotulo} ${px0(e.px)}`).join(' · ')}`)
afirmar(pastilla.total < 768, `  y a 768 sí entra (${px0(pastilla.total)} < 768): el detector no está diciendo que nunca entra`)
controlPositivo('el medidor de ancho reacciona al rótulo: no es un número escrito al lado', 375, (a: number) =>
  M.anchoDeLaPastilla(a).enlaces[0].px === M.anchoDeLaPastilla(a).enlaces[1].px)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · La escala tipográfica a 375, que es el PISO de la banda fluida')

const escala = M.escalaA(375)
for (const n of escala) console.log(`  ${n.nivel.padEnd(10)} ${n.fluido ? 'fluido' : 'FIJO  '} ${n.token.padEnd(26)} ${n.px.toFixed(2).padStart(6)} px  (a 1440: ${tokenPx(n.token, 1440).toFixed(2)})`)
afirmarIgual(escala.filter((n) => !n.fluido).map((n) => n.nivel), ['cuerpo', 'base'], 'los dos niveles invariantes son `cuerpo` y `base`, y a 375 valen lo mismo que a 1440')
const fluidos = escala.filter((n) => n.fluido)
afirmar(
  fluidos.every((n) => Math.abs(n.px - tokenPx(n.token, 0)) < 0.01),
  'los seis fluidos tocan el MÍNIMO de su propio `clamp()` a 375 (a menos de 0,01 px): 375 es `--fluido-piso`',
  fluidos.map((n) => `${n.nivel} ${n.px.toFixed(4)} vs min ${tokenPx(n.token, 0)}`).join(' · '),
)
const VARA = tokenPx('--text-micro', 375)
console.log(`  la vara: el escalón FIJO más chico que el propio sistema declara, \`--text-micro\` = ${px0(VARA)} px. No es WCAG —que no fija un tamaño mínimo de texto— y por eso se declara de dónde sale.`)
const bajoLaVara = escala.filter((n) => n.px < VARA)
afirmarIgual(bajoLaVara.map((n) => n.nivel), ['micro'], `contra esa vara cae UN nivel: \`micro\`, a ${px0(tokenPx('--text-fluido-micro', 375))} px`)
console.log(
  `  ⚠️ HALLAZGO [gravedad media · dueño: \`theme-develop.css\`, la banda fluida — NO se arregla acá] — \`--text-fluido-micro\` llega a ${px0(tokenPx('--text-fluido-micro', 375))} px en 375, ` +
    `un 20% por debajo del propio piso fijo del sistema. Lo consumen los rótulos de las cifras, las etiquetas de sección y la nota legal del pie. ` +
    `\`--text-fluido-caption\` queda en ${tokenPx('--text-fluido-caption', 375).toFixed(0)} px, arriba de la vara por 1 px.`,
)
console.log(`  el ancho útil de contenido es ${anchoDeContenido(375)} px a 375 y ${anchoDeContenido(390)} a 390: el relleno lateral es FIJO (32 px por lado) y no se afloja al angostar.`)
controlPositivo('la escala no es una tabla escrita: si fuera fija, 375 y 1440 darían lo mismo', 1440, (a: number) => M.escalaA(a).every((n, i) => n.px === escala[i].px))
controlPositivo('y el piso del `clamp()` no se toca a 1440: si se tocara, la banda fluida no sería fluida', 1440, (a: number) =>
  M.escalaA(a).filter((n) => n.fluido).every((n) => Math.abs(n.px - tokenPx(n.token, 0)) < 0.01))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El peso que baja abajo de 1025 — sobre el build que ya existe')

const ID = path.join(DIST, 'BUILD_ID')
if (!existsSync(ID)) {
  noCorre('el peso de la carga inicial de /v3', `no existe ${DIST}: este frente tiene PROHIBIDO correr un build`)
} else {
  console.log(`  build leído: ${leer('.next/BUILD_ID').trim()} · manifiesto del ${statSync(path.join(DIST, 'build-manifest.json')).mtime.toISOString()}`)
  const inicial = conjuntoInicial('/v3')
  const piso = pisoDelFramework(DIST)
  const sobre = inicial.filter((f) => !piso.includes(f))
  const home = conjuntoInicial('/')
  const propios = sobre.filter((f) => !home.includes(f))
  afirmar(inicial.length > 0, `la carga inicial de /v3 son ${inicial.length} archivos y ${kib(pesar(inicial).gzip)} gzip`)
  afirmar(pesar(sobre).gzip / 1024 < 300, `SOBRE EL PISO —lo que este repo puede mover— ${kib(pesar(sobre).gzip)} gzip en ${sobre.length} archivos, abajo del techo de 300`)
  console.log(`  PISO del framework (se publica, no se afirma): ${kib(pesar(piso).gzip)} en ${piso.length} archivos, de los cuales ${kib(pesar(piso.filter((f) => contiene(f, 'browserTracingIntegration'))).gzip)} son el SDK de Sentry (§7.30: NO se difiere).`)
  console.log(`  de los ${sobre.length} de arriba del piso, ${sobre.length - propios.length} (${kib(pesar(sobre.filter((f) => home.includes(f))).gzip)}) también los pide \`/\`: son del layout RAÍZ. Propios de /v3: ${propios.length} archivos, ${kib(pesar(propios).gzip)}.`)
  for (const f of [...sobre].sort((x, y) => pesar([y]).gzip - pesar([x]).gzip)) {
    console.log(`    ${kib(pesar([f]).gzip).padStart(10)}  ${home.includes(f) ? 'heredado' : 'DE /v3  '}  ${f}`)
  }
  const three = sobre.filter((f) => contiene(f, 'THREE.') || contiene(f, 'react-three-fiber'))
  afirmarIgual(three, [], 'la ESCENA no viaja en la carga inicial: cero chunks con three o r3f — la compuerta de 1025 hace su trabajo')
  const coreografia = sobre.filter((f) => contiene(f, 'InstaladorDeCoreografia'))
  afirmarIgual(coreografia, [], '  y el instalador de coreografía tampoco: entra por `dynamic(..., { ssr: false })`')
  const lenis = sobre.filter((f) => contiene(f, 'lenis'))
  const motion = sobre.filter((f) => contiene(f, 'framer'))
  console.log(
    `  ⚠️ HALLAZGO DE PESO CON DUEÑO AJENO [gravedad baja · dueño: \`components/layout/SmoothScroll.tsx\` y el layout RAÍZ] — ${lenis.length} chunk(s) con Lenis, ` +
      `${kib(pesar(lenis).gzip)} gzip, viajan en la carga inicial de /v3 **en todos los anchos**, y \`SmoothScroll\` se sale de /v3 por \`pathname.startsWith("/v3")\`: ` +
      `es peso que ninguna rama de /v3 puede usar nunca. Y el candidato obvio NO lo es: los ${kib(pesar(motion).gzip)} gzip del sistema de motion ` +
      `(${motion.join(', ')}) los pide \`/\` también, o sea que entran por el layout raíz. Diferirlos abajo de 1025 desde este track NO baja un byte de esta ruta.`,
  )
}
for (const h of HUECOS.filter((x) => ['LCP', 'Lighthouse'].includes(x.nombre))) {
  noCorre(`${h.nombre} de /v3 abajo de 1025`, `${h.porQue}. Lo cerraría: ${h.queLoCerraria}`)
}

cerrar('s10-mobile.invariant')
