/**
 * INVARIANTE — EL BANCO DE MEDICIÓN DE SITIO-S10: que mida algo, y que no
 * invente lo que no puede medir.
 *
 * Corre con `npm run test:s10-banco`.
 *
 * ── Por qué el banco necesita su propio invariante, y va PRIMERO ───────────
 *
 * Porque los cuatro frentes del sprint publican cifras que salen de acá. Un
 * extractor ciego no produce un error: produce una tabla **vacía que se lee
 * como un resultado limpio** —«cero saltos de encabezado», «cero paradas fuera
 * de orden»— y es exactamente el modo de falla que este repo viene cazando
 * desde S10 de la escena. Cada extractor de `s10-lectura.ts` se corre acá
 * contra un marcado fabricado que TIENE el defecto, y si no lo ve, el sprint
 * entero se cae antes de despachar un solo frente.
 *
 * ── Y por qué el resolvedor de `clamp()` se prueba contra el tema ──────────
 *
 * `theme-develop.css` publica el método con el que se derivaron las seis
 * expresiones fluidas: `a = (max − min) / (1440 − 375)` y `b = min − a × 375`.
 * O sea que el propio tema dice cuánto tiene que valer cada `clamp()` en los
 * dos extremos de la banda. Eso convierte al tema en el control del
 * resolvedor: si en 375 no da el mínimo y en 1440 el máximo, el resolvedor
 * está mal y toda cifra tipográfica del sprint con él.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  ALTOS_DECLARADOS,
  ANCHOS,
  ANCHOS_DE_REFERENCIA,
  HUECOS,
  QUE_SIRVE_CADA_RAMA,
  RAMAS,
  SUPUESTOS_DEL_BANCO,
  envoltorioDelLayout,
  marcadoAnimadoConPreferenciaForzada,
  marcadoConMovimientoReducido,
  marcadoDeSeccion,
  marcadoDelDocumento,
  marcadoDelHome,
} from './s10-banco'
import {
  BREAKPOINTS,
  SUPUESTOS_DEL_MODELO_DE_CSS,
  anchoDeContenido,
  cajaDeLinea,
  clasesEfectivas,
  hayToken,
  resolverLongitud,
  tokenPx,
  valorDeToken,
  variantesActivas,
} from './s10-css'
import {
  cajasDeTexto,
  candidatosALandmark,
  encabezados,
  esRolDeLandmark,
  landmarks,
  ordenDeSecciones,
  paradasDeTabulacion,
  saltosDeNivel,
  tabindexPositivos,
} from './s10-lectura'
import { nodosDe, textoDe, type Nodo } from './s10-recorrido'
import { BANCO, FRENTES, INTOCABLES, NO_ENTREGADOS, duenoDe, entregablesQueFaltan, existe, padronCompleto } from './s10-padron'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { NIVELES_TIPOGRAFICOS, NIVELES } from '../tipografia'

const DOC = marcadoDelDocumento('quieta')
const DOC_ANIMADO = marcadoDelDocumento('animada')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El banco RENDERIZA el home entero, en las dos ramas')

for (const rama of RAMAS) {
  const html = marcadoDelHome(rama)
  afirmar(html.length > 10_000, `rama ${rama}: el marcado sale y no está vacío`, `${html.length} caracteres`)
  afirmarIgual(
    ordenDeSecciones(html),
    [...IDS_DE_SECCION],
    `  y trae las ocho secciones en el orden de la tabla`,
  )
  console.log(`  ${rama} se sirve ${QUE_SIRVE_CADA_RAMA[rama]}`)
}

afirmar(
  marcadoDelHome('quieta') !== marcadoDelHome('animada'),
  'las dos ramas NO son el mismo marcado: el banco distingue lo que la compuerta decide',
  `${marcadoDelHome('quieta').length} contra ${marcadoDelHome('animada').length} caracteres`,
)
/**
 * ⚠ **ESTE PAR DE AFIRMACIONES ES UN ARREGLO DE LA INTEGRACIÓN, Y LO PIDIÓ EL
 * FRENTE DE ACCESIBILIDAD.** `marcadoConMovimientoReducido()` forzaba el árbol
 * ANIMADO con la preferencia puesta y devolvía 52 transformadas: un estado que
 * producción nunca sirve, porque la compuerta no instala una sola primitiva
 * animada con la preferencia puesta. Ahora devuelve lo que se sirve —el árbol
 * quieto— y el estado imposible queda aparte, como CONTROL.
 */
const MARCAS_DE_MOVIMIENTO = ['transform:', 'will-change']
const conMarcas = (html: string): number =>
  MARCAS_DE_MOVIMIENTO.reduce((n, m) => n + (html.split(m).length - 1), 0)

afirmarIgual(
  conMarcas(marcadoConMovimientoReducido()),
  0,
  'con `prefers-reduced-motion` no se escribe una sola transformada ni un `will-change`: es lo que producción sirve',
)
afirmar(
  conMarcas(marcadoAnimadoConPreferenciaForzada()) > 0,
  '  y el CONTROL —el árbol animado, que con la preferencia puesta no existe— sí las tiene: el detector no está ciego',
  `${conMarcas(marcadoAnimadoConPreferenciaForzada())} marcas`,
)
afirmarIgual(
  conMarcas(marcadoDelHome('quieta')),
  0,
  '  y la rama quieta tampoco: es el MISMO árbol, que es lo que hace comparable mobile con movimiento reducido',
)
controlPositivo(
  'el lector de secciones ve un documento al que le falta una',
  DOC.replace('data-seccion-id="numeros"', 'data-seccion-id-borrado="numeros"'),
  (html: string) => JSON.stringify(ordenDeSecciones(html)) === JSON.stringify([...IDS_DE_SECCION]),
)

for (const id of IDS_DE_SECCION) {
  afirmar(marcadoDeSeccion(id, 'quieta').includes(`data-panel="${id}"`), `  \`${id}\` se puede pedir sola`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El envoltorio del layout se DERIVA del fuente, y trae el `<main>`')

const envoltorio = envoltorioDelLayout()
afirmar(envoltorio.raiz.includes('data-v3'), 'la raíz derivada lleva `data-v3`', envoltorio.raiz)
afirmar(envoltorio.main.startsWith('<main'), 'y el `<main>` está en el layout, no en la página', envoltorio.main)
afirmar(!envoltorio.raiz.includes('${'), '  y las interpolaciones de `next/font` no se cuelan al marcado')
afirmar(DOC.startsWith(envoltorio.raiz), 'el documento del banco arranca por ese envoltorio')
controlPositivo(
  'el derivador NO inventa un `<main>` cuando el layout no tiene ninguno',
  'export default function X(){ return <div data-v3=""><section/></div> }',
  (fuente: string) => envoltorioDelLayout(fuente).main !== '',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los cinco anchos y los tres altos, cada uno con su razón')

afirmarIgual(ANCHOS, [375, 390, 768, 1024, 1025], 'los cinco anchos son los que el sprint pide')
afirmar(
  ANCHOS_DE_REFERENCIA.every((a) => a.porQue.length > 20),
  'y los cinco traen escrito qué pregunta contestan',
)
afirmar(
  ALTOS_DECLARADOS.every((a) => a.fuente.includes('.md') || a.fuente.includes('.ts') || a.fuente.includes('§')),
  'los tres altos citan de dónde salen: ninguno se inventó acá',
  ALTOS_DECLARADOS.map((a) => `${a.px}`).join(' · '),
)
afirmarIgual(
  tokenPx('--fluido-piso', 0),
  ANCHOS[0],
  'el ancho más chico ES el piso de la banda fluida, leído del tema y no escrito acá',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los supuestos y los huecos se PUBLICAN, no se esconden')

afirmar(SUPUESTOS_DEL_BANCO.length >= 4, `el banco declara ${SUPUESTOS_DEL_BANCO.length} supuestos`)
for (const s of SUPUESTOS_DEL_BANCO) console.log(`  · ${s}`)
afirmar(SUPUESTOS_DEL_MODELO_DE_CSS.length >= 4, `y el modelo de CSS otros ${SUPUESTOS_DEL_MODELO_DE_CSS.length}`)
for (const s of SUPUESTOS_DEL_MODELO_DE_CSS) console.log(`  · ${s}`)
afirmar(HUECOS.length >= 5, `${HUECOS.length} huecos declarados, y ninguno se estima`)
for (const h of HUECOS) console.log(`  ⚠ HUECO — ${h.nombre}: ${h.porQue}. Lo cerraría: ${h.queLoCerraria}`)
afirmar(
  HUECOS.some((h) => h.nombre === 'LCP') && HUECOS.some((h) => h.nombre === 'Lighthouse'),
  'LCP y Lighthouse están entre los huecos: el sprint NO los estima',
)
afirmar(
  DOC_ANIMADO.length !== DOC.length,
  'el documento animado y el quieto se distinguen también con los envoltorios puestos',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El padrón de entrega — la lección de §7.21, cableada')

afirmar(BANCO.every((a) => existe(a)), `los ${BANCO.length} archivos del banco están en disco`)
afirmarIgual(
  FRENTES.filter((f) => f.cambiaProducto).map((f) => f.id),
  ['D'],
  'un solo frente puede tocar código de producto, y es el D',
)
afirmarIgual(
  FRENTES.filter((f) => !f.cambiaProducto).flatMap((f) => f.editables),
  [],
  '  y los otros tres no declaran una sola edición de algo que ya existe: miden y reportan',
)
afirmar(
  BANCO.every((a) => INTOCABLES.includes(a)),
  'el banco entero está entre los intocables: ningún frente lo puede mover',
)
afirmarIgual(duenoDe('src/app/v3/_lib/secciones.ts'), null, 'la tabla del recorrido no es de ningún frente')
afirmar(duenoDe(BANCO[0]) !== null, '  y el banco sí tiene dueño declarado', String(duenoDe(BANCO[0])))
controlPositivo('el padrón no le da dueño a un archivo inventado', 'src/app/v3/no-existe.ts', (a: string) => duenoDe(a) !== null)

/**
 * ⚠ **LO QUE SE DECLARÓ Y NO SE ENTREGÓ SE IMPRIME, no se borra.** Un padrón que
 * pasa en verde porque le sacaron la fila que no se cumplió no es un contrato:
 * es un espejo. Acá el freno se lee, con su razón medida.
 */
afirmar(
  NO_ENTREGADOS.every((n) => n.porQue.length > 100),
  `${NO_ENTREGADOS.length} entregable(s) declarados y NO entregados, cada uno con su razón escrita`,
)
for (const n of NO_ENTREGADOS) {
  console.log(`  ⛔ NO ENTREGADO — frente ${n.frente}: ${n.archivo}`)
  console.log(`     ${n.porQue}`)
}
afirmarIgual(
  NO_ENTREGADOS.filter((n) => existe(n.archivo)),
  [],
  '  y ninguno está en disco: si apareciera, la razón del freno ya no valdría y hay que borrarla',
)

const faltan = entregablesQueFaltan()
for (const f of faltan) console.log(`  falta — frente ${f.frente}: ${f.archivo}`)
afirmarIgual(
  faltan,
  [],
  `los ${padronCompleto().length} archivos declarados del sprint están entregados`,
)

cerrar('s10-banco.invariant')
