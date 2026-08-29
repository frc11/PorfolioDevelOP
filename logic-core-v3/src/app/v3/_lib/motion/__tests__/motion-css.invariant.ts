/**
 * INVARIANTE — las utilidades de CSS que la ruta escribe EXISTEN en el servido.
 *
 * Corre con `npm run build` y después `npm run test:s2-css`.
 * Acepta un distDir alternativo: `npx tsx …/motion-css.invariant.ts .next-s2-control`.
 *
 * ── Por qué es su propia comprobación ──────────────────────────────────────
 *
 * Una clase que Tailwind no generó es un atributo en el HTML sin regla detrás:
 * la página se ve "casi bien", no hay error en consola, y no lo caza ni el
 * tipado ni el linter. Es un modo de falla distinto del de la compuerta —ahí la
 * pregunta es qué archivos se descargan; acá, si el CSS servido tiene la regla—
 * y por eso va aparte.
 *
 * Las que se listan son las que si faltan rompen algo que se nota: el recorte de
 * línea, la copia accesible, la fase de medición, y las utilidades del sistema
 * de develOP que la ruta escribe.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'

// Seis niveles: __tests__ → motion → _lib → v3 → app → src → raíz del proyecto.
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const DIST = path.join(RAIZ, process.argv[2] ?? '.next')

if (!existsSync(DIST)) {
  console.error(`\nNo existe ${DIST}. Corré \`npm run build\` primero.`)
  process.exit(1)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('CSS — las utilidades que la ruta usa EXISTEN en el CSS servido')

/**
 * Una clase que Tailwind no generó es un atributo en el HTML sin regla detrás:
 * la página se ve "casi bien", no hay error en consola, y no lo caza ni el
 * tipado ni el linter. Estas son las que si faltan rompen algo que se nota:
 * el recorte de línea, la copia accesible, la fase de medición.
 */
const cssDir = path.join(DIST, 'static', 'css')
const hojas = existsSync(cssDir) ? readdirSync(cssDir).filter((f) => f.endsWith('.css')) : []
afirmar(hojas.length > 0, `el build emitió ${hojas.length} hoja(s) de CSS`)
const cssServido = hojas.map((f) => readFileSync(path.join(cssDir, f), 'utf8')).join('\n')

const escapar = (clase: string): string => clase.replace(/[-[\]/.:]/g, '\\$&')
const tieneRegla = (clase: string): boolean =>
  new RegExp(`\\.${escapar(clase)}(?![a-zA-Z0-9_-])`).test(cssServido)

const CLASES_DE_LA_RUTA = [
  // El divisor de líneas y su protección.
  'sr-only',
  'invisible',
  'overflow-hidden',
  'py-1',
  '-my-1',
  // Las piezas.
  'will-change-transform',
  'aspect-square',
  'rounded-sutil',
  // El sistema de develOP que la ruta escribe.
  'font-titulo',
  'font-cuerpo',
  'font-codigo',
  'text-micro',
  'text-caption',
  'text-cuerpo',
  'text-titulo-s',
  'text-titulo-m',
  'text-titulo-l',
  'leading-micro',
  'leading-texto',
  'leading-titulo',
  'tracking-micro',
  'tracking-texto',
  'tracking-titulo',
  'text-tinta',
  'text-tinta-media',
  'text-tinta-tenue',
  'bg-fondo',
  'bg-superficie-1',
  'bg-superficie-2',
  'border-borde',
  'border-borde-fuerte',
  'max-w-tope',
]
const sinRegla = CLASES_DE_LA_RUTA.filter((c) => !tieneRegla(c))
afirmarIgual(
  sinRegla,
  [],
  `las ${CLASES_DE_LA_RUTA.length} utilidades que la ruta escribe tienen regla emitida`,
)

controlPositivo(
  'el buscador de utilidades ve una clase que NO existe',
  'rounded-que-no-existe',
  (clase: string) => tieneRegla(clase),
)

cerrar('motion-css.invariant')
