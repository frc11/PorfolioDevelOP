/**
 * INVARIANTE — EL PEDIDO: los marcadores de la pantalla y el documento dicen lo
 * mismo, en los dos sentidos.
 *
 * Corre con `npm run test:s7-pedido`.
 * Regenera el documento: `npm run test:s7-pedido -- --escribir`.
 *
 * ── Las dos direcciones, y por qué hacen falta las dos ────────────────────
 *
 *   · **un marcador que se ve y no está pedido** → alguien dejó un agujero sin
 *     decir qué va ahí. Es lo que la lista existe para impedir.
 *   · **un pedido que ya no se ve** → la lista se quedó vieja mientras parecía
 *     completa. Es el defecto que ninguna revisión encuentra, porque un
 *     documento desactualizado se lee exactamente igual que uno al día.
 *
 * El segundo es el que casi nunca se comprueba, y es el peor de los dos.
 *
 * ── Y el documento se compara, no se cree ─────────────────────────────────
 *
 * `CONTENIDO-PENDIENTE.md` lo produce `s7-documento.ts` desde el mismo dato del
 * que sale la pantalla. Acá se afirma que el archivo en disco **es** lo que ese
 * dato produce. Un pedido que cambie sin regenerar el documento hace fallar el
 * gate, que es la única forma de que un documento no se quede viejo.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MARCADORES, marcadoresDe } from '../../_secciones/_contrato/marcadores'
import { escanearContenido, textoVisible } from '../../_secciones/_contrato/escaneo'
import { marcadoresDelPedido } from '../../_secciones/_contrato/pedido'
import { REGISTRO } from '../../_secciones/_contrato/registro'
import { marcar } from '../../_secciones/_invariantes/render'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RUTA_DEL_DOCUMENTO, documentoDePedidos } from './s7-documento'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')

/** El texto que la persona lee en cada sección, en su rama quieta. */
const TEXTO_POR_SECCION = new Map<string, string>(
  REGISTRO.map(({ id, Componente, seccion }) => [
    id,
    textoVisible(marcar(<Componente seccion={seccion} />, { anima: false })),
  ]),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alcance: las ocho, con texto de verdad')

afirmarIgual(TEXTO_POR_SECCION.size, 8, 'se miraron las ocho secciones')
for (const [id, texto] of TEXTO_POR_SECCION) {
  afirmar(texto.length > 0, `\`${id}\` — su texto no está vacío`, `${texto.length} caracteres`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Todo marcador que se VE está pedido')

const sinPedir: string[] = []
for (const { id, pedido } of REGISTRO) {
  const enPantalla = [...new Set(marcadoresDe(TEXTO_POR_SECCION.get(id) ?? ''))]
  const pedidos = marcadoresDelPedido(pedido)
  for (const m of enPantalla) {
    if (!pedidos.includes(m as (typeof MARCADORES)[number])) sinPedir.push(`${id}: ${m}`)
  }
}
afirmarIgual(sinPedir, [], 'ningún marcador aparece en pantalla sin una entrada de pedido que lo nombre')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Y todo marcador PEDIDO se ve — la lista no se quedó vieja')

const yaNoSeVe: string[] = []
for (const { id, pedido } of REGISTRO) {
  const texto = TEXTO_POR_SECCION.get(id) ?? ''
  for (const m of marcadoresDelPedido(pedido)) {
    if (!texto.includes(m)) yaNoSeVe.push(`${id}: ${m}`)
  }
}
afirmarIgual(yaNoSeVe, [], 'ninguna entrada del pedido nombra un marcador que ya no está en pantalla')

controlPositivo(
  'el detector ve un marcador pedido que no aparece',
  { texto: 'el panel muestra [CIFRA]', pedidos: ['[CIFRA]', '[TESTIMONIO]'] },
  (caso: { texto: string; pedidos: string[] }) => caso.pedidos.every((m) => caso.texto.includes(m)),
)

controlPositivo(
  'y uno que aparece sin estar pedido',
  { texto: 'el panel muestra [CIFRA] y [MÉTRICA]', pedidos: ['[CIFRA]'] },
  (caso: { texto: string; pedidos: string[] }) =>
    marcadoresDe(caso.texto).every((m) => caso.pedidos.includes(m)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LOS MARCADORES DEL HOME — la cifra, derivada')

/**
 * ⚠ La cuenta NO está escrita. Se cuenta lo que se ve, sección por sección, y
 * es la única forma de que el número del reporte y el de la pantalla sean el
 * mismo. Este proyecto ya corrigió dos veces el defecto de afirmar una
 * cardinalidad literal.
 */
let ocurrencias = 0
const censo = new Map<string, number>()
console.log('  marcadores VISIBLES por sección:')
for (const { id, seccion } of REGISTRO) {
  const encontrados = marcadoresDe(TEXTO_POR_SECCION.get(id) ?? '')
  ocurrencias += encontrados.length
  for (const m of encontrados) censo.set(m, (censo.get(m) ?? 0) + 1)
  const detalle =
    encontrados.length === 0
      ? '(ninguno — lo suyo es prosa)'
      : [...new Set(encontrados)]
          .map((m) => `${m}×${encontrados.filter((x) => x === m).length}`)
          .join(' · ')
  console.log(`    ${seccion.numero} ${id.padEnd(18)} ${String(encontrados.length).padStart(2)}  ${detalle}`)
}
console.log(`  TOTAL: ${ocurrencias} marcadores visibles en el home.`)
console.log('  por clase:')
for (const [m, n] of [...censo.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${m.padEnd(22)} ${n}`)
}

afirmar(ocurrencias > 0, `el home muestra ${ocurrencias} marcadores: el escáner no está ciego`)

const entradasDePedido = REGISTRO.reduce((n, s) => n + s.pedido.length, 0)
console.log(
  `  y el pedido tiene ${entradasDePedido} entradas: ${ocurrencias} agujeros a la vista más la prosa de relleno, ` +
    'que no se ve como agujero y hay que reemplazar igual.',
)
afirmar(
  entradasDePedido > 0,
  `el pedido declara ${entradasDePedido} entradas en total`,
  REGISTRO.map((s) => `${s.id}×${s.pedido.length}`).join(' · '),
)

/** Todo marcador visible está en el vocabulario cerrado: nadie inventó uno. */
const inventados = [...censo.keys()].filter((m) => !MARCADORES.includes(m as (typeof MARCADORES)[number]))
afirmarIgual(inventados, [], 'ningún marcador visible está fuera del vocabulario cerrado')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El escáner de contenido inventado, sobre LAS OCHO')

/**
 * Es lo que impide que la primera cifra falsa entre cuando empiecen a poblar. El
 * lane B lo construyó sobre el texto renderizado —que es lo que la persona
 * lee— y acá corre sobre las ocho, que es donde tiene que correr desde que el
 * home existe.
 */
for (const { id } of REGISTRO) {
  const hallazgos = escanearContenido(TEXTO_POR_SECCION.get(id) ?? '')
  afirmarIgual(
    hallazgos.map((h) => `${h.fragmento} — ${h.razon}`),
    [],
    `\`${id}\` — ni una cifra, ni un precio, ni un número sin declarar`,
  )
}

const CONTENIDO_PROHIBIDO =
  'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'
afirmar(
  escanearContenido(CONTENIDO_PROHIBIDO).length > 0,
  `el escáner SÍ ve la deuda real de develOP: ${escanearContenido(CONTENIDO_PROHIBIDO).length} hallazgos`,
  escanearContenido(CONTENIDO_PROHIBIDO)
    .map((h) => h.fragmento)
    .join(' · '),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El documento está al día')

const esperado = documentoDePedidos()
const archivo = path.join(RAIZ, RUTA_DEL_DOCUMENTO)

if (process.argv.includes('--escribir')) {
  writeFileSync(archivo, esperado, 'utf8')
  console.log(`  ESCRITO ${RUTA_DEL_DOCUMENTO} (${esperado.split('\n').length} líneas)`)
}

let enDisco = ''
try {
  enDisco = readFileSync(archivo, 'utf8')
} catch {
  enDisco = ''
}

afirmar(enDisco.length > 0, `\`${RUTA_DEL_DOCUMENTO}\` existe`, `${enDisco.split('\n').length} líneas`)
afirmarIgual(
  enDisco === esperado,
  true,
  'y dice exactamente lo que el dato produce: el documento no se puede quedar viejo',
)

/** Y que el documento nombre de verdad lo que hay que llenar. */
for (const { id, archivoDeContenido, pedido } of REGISTRO) {
  afirmar(enDisco.includes(archivoDeContenido), `\`${id}\` — el documento dice en qué archivo se edita`)
  for (const e of pedido) {
    afirmar(
      enDisco.includes(e.formato),
      `  y el formato de \`${e.ruta}\``,
      e.formato.slice(0, 48),
    )
  }
}

controlPositivo(
  'el comparador ve un documento desactualizado',
  `${esperado}\nuna línea de más`,
  (texto: string) => texto === esperado,
)

cerrar('s7-pedido.invariant')
