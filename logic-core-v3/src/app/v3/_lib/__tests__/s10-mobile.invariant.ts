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
 * y dueño— todo defecto que el sprint decidió no arreglar (regla 13 del repo).
 *
 * ⚠️ **SITIO-S11 lo partió en tres.** El censo se dio vuelta —de afirmar la forma
 * del defecto a afirmar la del arreglo— y con eso el archivo cruzó las 300
 * líneas. Tres secciones salieron, y el corte es por tema y no por tamaño: §8 (la
 * pastilla) vive con su modelo en `./s10-mobile-pastilla`, §9 (la escala) en
 * `./s10-mobile-escala` —la única que mira la hoja y no el marcado— y §10 (el
 * peso) en `./s10-mobile-peso`, la única que lee el disco de `.next`.
 */

import { SERVICIOS } from '../../_secciones/_contrato/acento'
import { pantallasDe } from '../../_secciones/_contrato/forma'
import { GEOMETRIA } from '../../_secciones/numeros/Numeros'
import { CONTENIDO as NUMEROS } from '../../_secciones/numeros/contenido'
import { CONTENIDO as TRABAJOS } from '../../_secciones/trabajos/contenido'
import { SECCIONES } from '../secciones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  ALTOS,
  ALTOS_DECLARADOS,
  ANCHOS_DE_REFERENCIA,
  QUE_SIRVE_CADA_RAMA,
  SUPUESTOS_DEL_BANCO,
  VIEWPORTS_MEDIDOS,
  marcadoDelHome,
} from './s10-banco'
import { SUPUESTOS_DEL_MODELO_DE_CSS, anchoDeContenido, clasesEfectivas, tokenPx } from './s10-css'
import { ordenDeSecciones } from './s10-lectura'
import * as M from './s10-mobile'
import { afirmarLaPastilla } from './s10-mobile-pastilla'
import { afirmarLaEscala } from './s10-mobile-escala'
import { afirmarElPeso } from './s10-mobile-peso'
import { afirmarElCorteDelCierre, modeloDelCierre } from './s10-mobile-pie'
import { atributo, nodosDe } from './s10-recorrido'

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

/**
 * ⚠️ **LA LISTA `SIN_CAJA_DE_PANTALLA` SE BORRA EN B1, y no queda vacía: se va.**
 *
 * Tenía dos —`por-que-develop` y `cierre`— y afirmaba de las dos que su alto era
 * intrínseco: el contenido caía apilado y el `min-height` de la tabla sólo hacía
 * de piso. **Eso era también su defecto.** Sin una caja de pantalla no hay contra
 * qué repartir, y las dos acumulaban su aire en una banda al final: 443,06 px en
 * por qué develOP y 337 px en el Cierre, a 1920.
 *
 * Las dos reciben UNA caja en B1 y reparten sobre ella: la banda baja a 88,90 px
 * y a la del Cierre se le suma la cadena de tres `grid` que estira el pie. **En
 * ninguna de las dos cambia el alto en ningún ancho de esta tabla** —las dos ya
 * tenían `min-height: 100svh` de la tabla— así que las dos pasan a la lista de
 * arriba y se afirman con la misma cuenta que las otras seis: su flujo llena las
 * pantallas que declaran.
 *
 * ⚠ La lista se BORRA en vez de quedar vacía. Un `for` sobre una lista sin
 * elementos no afirma nada y se pone verde igual: es exactamente la comprobación
 * vacía que la regla 8 de este proyecto prohíbe. **Con las dos adentro, el
 * recorrido pasa a ser `SECCIONES` entero y no una lista escrita a mano**, que
 * es lo que impide que una sección nueva quede sin afirmar por olvido.
 *
 * ── Cómo llegó a ser una lista de ocho, en dos pasos ──────────────────────
 *
 * **SITIO-S11 metió a `servicios` y `trabajos`**, que estaban afuera porque los
 * dos tenían un defecto de composición: Servicios medía 1 de 3 pantallas en los
 * cuatro anchos (la caja clavada del §3) y Trabajos 1 de 3 a 768 y 1024 (la fila
 * de la grilla arrancaba en 768 y el despinneo en 1025). Con los dos arreglos la
 * lista pasó de cuatro a seis, y la afirmación suelta que cubría a Trabajos sólo
 * en 375 y 390 se borró porque ésta la subsume. **B1 mete las dos últimas.**
 */
for (const s of SECCIONES) {
  const decl = pantallasDe(s)
  const iguales = ANCHOS_DE_MOBILE.every((a) => flujo.get(s.id)?.get(a)?.pantallas === decl)
  afirmar(iguales, `${s.id}: el flujo llena las ${decl} pantallas declaradas en los cuatro anchos`)
}
controlPositivo('la cuenta ve una sección cuyo flujo NO llena lo declarado', 'cierre', (id: string) => ANCHOS_DE_MOBILE.every((a) => (flujo.get(id)?.get(a)?.pantallas ?? 0) === 0))
console.log(
  '  ✅ DEFECTO 3 — ARREGLADO en SITIO-S11 · `trabajos/Trabajos.tsx` — el colapso de la grilla se corrió de 768 a 1025, que es el MISMO ' +
    'umbral donde el pin se apaga (`pinneada: "desde-escritorio"`) y donde `escritorio:min-h-0` deja de dar una pantalla por proyecto. ' +
    `Los tres bordes caen ahora en el mismo píxel y no queda tramo huérfano: entre 768 y 1024 los tres proyectos entraban EN FILA y el flujo ` +
    `medía 1 pantalla contra las 3 declaradas — DOS PANTALLAS DE BANDA OSCURA VACÍA. Hoy mide ${flujo.get('trabajos')?.get(768)?.pantallas} en los cuatro anchos.`,
)
console.log(
  '    ⚠️ consecuencia forzada, y la sección la declara: el `sizes` de la captura describe la CAJA, y el arreglo le movió su único corte. ' +
    'De 768 a 1024 la captura pasó a ocupar el ancho entero, así que los dos tramos de arriba de `sizesPorTresTramos` decían lo mismo; ' +
    'con un solo corte el ayudante correcto es `sizesPorViewport`. Lo afirma `trabajos.invariant`, no este frente.',
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

/**
 * ⚠️ **CENSO MOVIDO EN SITIO-S11, Y ES EL SPRINT QUE EXISTÍA PARA MOVERLO.**
 *
 * Hasta S10 esta sección afirmaba la FORMA DEL DEFECTO —«hay UNA caja de alto
 * fijo y es la de servicios», «desborda en los cuatro anchos»— porque el frente
 * medía y no arreglaba. S11 arregló el envoltorio (`_contrato/Seccion.tsx`:
 * `pinneada: 'siempre'` pasa de `h-svh` a `min-h-svh`) y esas afirmaciones
 * quedaron describiendo un marcado que ya no existe. Se dan vuelta: ahora se
 * afirma que NO queda ninguna caja clavada abajo del umbral y que ninguna
 * sección desborda. **Los dos controles positivos no se tocan** —corren sobre
 * marcado fabricado— así que el detector sigue teniendo que ver una caja
 * clavada desbordada donde la hay.
 */
const desbordes = ANCHOS_DE_MOBILE.flatMap((a) =>
  secciones.flatMap((r) => M.medirPantallas(r, a).desbordes.map((d) => `${d.seccion}@${a}`)),
)
const clavadasPorAncho = (a: number): string[] =>
  nodosDe(html).filter((n) => clasesEfectivas(atributo(n, 'class') ?? '', a).includes('h-svh')).map((n) => n.seccion ?? '?')
for (const a of ANCHOS_DE_MOBILE) {
  afirmarIgual(clavadasPorAncho(a), [], `@${a}: NO queda una sola caja de alto fijo abajo del umbral — la de servicios era el defecto 1`)
}
afirmarIgual(clavadasPorAncho(1025).sort(), ['trabajos'], '@1025 aparece la única que queda, y es la que corresponde: el `escritorio:h-svh` de trabajos NO rige abajo del umbral')
afirmarIgual(desbordes, [], 'y NINGUNA sección esconde contenido detrás de un alto fijo, en ninguno de los cuatro anchos')
/** El envoltorio pinneado de Servicios, que es el que llevaba el alto fijo. */
const envoltorioDeServicios = nodosDe(html).find((n) => atributo(n, 'data-pinneado') === 'siempre')
const tintaDeServicios = (a: number): number =>
  envoltorioDeServicios === undefined
    ? 0
    : M.altoDeTinta(html, envoltorioDeServicios.indice, M.finDelSubarbol(html, envoltorioDeServicios), a)
afirmar(envoltorioDeServicios !== undefined, 'el envoltorio pinneado de servicios sigue existiendo: el arreglo cambió su alto, no lo borró')
afirmarIgual(M.tintaDeLaCajaClavada(html, 375), 0, '  y ya no hay caja clavada suya que medir — el cero es «no hay caja», no «la caja está vacía»')
console.log(
  '  ✅ DEFECTO 1 (mitad de abajo) — ARREGLADO en SITIO-S11 · `_contrato/Seccion.tsx` — el envoltorio pinneado de ' +
    '`pinneada: "siempre"` pasa de `h-svh` (alto FIJO, una pantalla) a `min-h-svh` (piso), que es la regla que el propio ' +
    '`servicios/geometria.ts` ya tenía escrita y que el envoltorio violaba. La caja CRECE con su contenido en vez de ' +
    'recortarlo, así que los tres bloques de servicio se reparten las tres pantallas declaradas (ver §2) en vez de ' +
    'quedar dos escondidos detrás de un pin de 200svh.',
)
for (const [a, alto] of [[375, 667], [390, 844], [768, 900]] as const) {
  const tinta = tintaDeServicios(a)
  console.log(
    `    @${a}x${alto}: la TINTA sola de Servicios mide ${px0(tinta)} px · su caja son los 300svh declarados = ${3 * alto} px, ` +
      `así que entra (${(tinta / (3 * alto)).toFixed(2)}x). [piso: ignora rellenos y separaciones]`,
  )
}
console.log(
  '    ⚠️ contra los 963 / 942 / 1583 px que S10 midió: la tinta SUBIÓ, y no por este arreglo sino por el de §9 — ' +
    '`--text-fluido-micro` 8→10 px y `--text-fluido-titulo-s` 16→17 px hacen más altas las mismas líneas. El cambio ' +
    'que importa no es la tinta: es contra qué caja se compara (antes 1 pantalla, ahora las 3 declaradas).',
)
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
afirmarIgual([...new Set(tamanos)].sort((x, y) => y - x), [36, 24, 18, 17], 'a 375 los cuatro niveles de display se comprimen a 36 · 24 · 18 · 17 px — reproduce la cifra del docblock de `Numeros.tsx`')
afirmar(new Set(tamanos).size === 4, `y siguen siendo CUATRO tamaños distintos para las cinco cifras: la asimetría de escala sobrevive`, tamanos.map(px0).join(' · '))
console.log(
  '  ⚠️ DECISIÓN, NO DEFECTO [dueño: `Numeros.tsx`] — a 375 y 390 la composición dispersa COLAPSA a una columna en orden ' +
    `de documento (${NUMEROS.cifras.map((c) => c.clave).join(' → ')}) y lo único que queda de la asimetría son los tamaños. ` +
    'Está declarado en el docblock y el docblock dice la verdad: lo verifiqué.',
)
afirmar(
  tokenPx('--text-fluido-titulo-s', 375) > tokenPx('--text-base', 375),
  `  y la más chica de las cinco (\`${GEOMETRIA.celdas.anios.nivel}\`) vuelve a leerse como cifra: a 375 pasa a \`--text-base\``,
  `${px0(tokenPx('--text-fluido-titulo-s', 375))} px contra ${px0(tokenPx('--text-base', 375))} de base y ${px0(tokenPx('--text-cuerpo', 375))} de cuerpo`,
)
console.log(
  `  ✅ DEFECTO 13 — ARREGLADO en SITIO-S11 · \`theme-develop.css\` — el piso de \`--text-fluido-titulo-s\` sube de 16 a 17 px. ` +
    `A 375 resolvía a ${px0(tokenPx('--text-base', 375))} px EXACTOS, o sea \`--text-base\`, y un solo píxel arriba de \`--text-cuerpo\`: en el ancho donde vive ` +
    `la mitad de los visitantes, una de las cinco cifras dejaba de leerse como cifra. 17 es el ÚNICO entero que pasa \`base\` y ` +
    `se queda abajo del piso de \`titulo-m\` (${px0(tokenPx('--text-fluido-titulo-m', 375))}), que es donde el defecto volvería del otro lado. El techo, intacto: ` +
    `${px0(tokenPx('--text-fluido-titulo-s', 1440))} px a 1440.`,
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
afirmarElCorteDelCierre(px0)

controlPositivo('el modelo distingue la familia de tokens: fluido y fijo NO dan lo mismo a 375', 375, (a: number) =>
  px0(modeloDelCierre(a, true).total) === px0(modeloDelCierre(a, false).total))
controlPositivo('el cortador de líneas no está ciego: el titular NO cabe en dos renglones de 40 px', 375, (a: number) =>
  modeloDelCierre(a).lineasDelTitular >= Math.ceil(anchoDeContenido(a) / 40))

// ═════════════════════════════════════════════════════════════════════════
// §8 vive en `s10-mobile-pastilla.ts`, con el modelo que la mide: la
// comprobación y su aritmética son la misma pieza.
afirmarLaPastilla(px0)

// ═════════════════════════════════════════════════════════════════════════
// §9 vive en `s10-mobile-escala.ts`: es la única sección que mira la hoja y no
// el marcado del documento.
afirmarLaEscala(px0)

// ═════════════════════════════════════════════════════════════════════════
// §10 vive en `s10-mobile-peso.ts`: es la única sección que lee el disco de
// `.next` en vez del marcado, y el archivo había cruzado las 300 líneas.
afirmarElPeso()

cerrar('s10-mobile.invariant')
