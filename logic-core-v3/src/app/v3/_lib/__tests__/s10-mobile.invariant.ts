/**
 * INVARIANTE — MOBILE: el segundo sitio, el que se sirve abajo de 1025 y que
 * nadie miró nunca porque todo lo que se construyó se juzgó a 1440.
 *
 * Corre con `npx tsx src/app/v3/_lib/__tests__/s10-mobile.invariant.ts`.
 *
 * ⚠️ **Modo pulido lo desarmó a dos secciones.** La geometría de mobile —cuánto
 * mide cada sección, la pastilla, la escala tipográfica, el pie— era composición
 * y se sacó entera, con sus archivos de apoyo (`s10-mobile-pastilla.ts`,
 * `s10-mobile-escala.ts`, `s10-mobile-pie.ts`). Lo que queda: el setup/supuestos
 * de §1 y el peso del bundle bajo 1025 de §10 (`./s10-mobile-peso`).
 */

import { SECCIONES } from '../secciones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  ALTOS_DECLARADOS,
  ANCHOS_DE_REFERENCIA,
  QUE_SIRVE_CADA_RAMA,
  SUPUESTOS_DEL_BANCO,
  VIEWPORTS_MEDIDOS,
  marcadoDelHome,
} from './s10-banco'
import { SUPUESTOS_DEL_MODELO_DE_CSS } from './s10-css'
import { ordenDeSecciones } from './s10-lectura'
import { afirmarElPeso } from './s10-mobile-peso'

const html = marcadoDelHome('quieta')
const animada = marcadoDelHome('animada')

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

// ═════════════════════════════════════════════════════════════════════════
// §10 vive en `s10-mobile-peso.ts`: es la única sección que lee el disco de
// `.next` en vez del marcado, y el archivo había cruzado las 300 líneas.
afirmarElPeso()

cerrar('s10-mobile.invariant')
