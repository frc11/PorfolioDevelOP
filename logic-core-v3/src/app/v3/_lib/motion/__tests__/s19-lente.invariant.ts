/**
 * INVARIANTE — B6-A · EL LENTE DE LA ESCENA.
 *
 *     npx tsx src/app/v3/_lib/motion/__tests__/s19-lente.invariant.ts
 *     npm run test:s19-lente
 *
 * Que el contrato consuma el lente y Trabajos lo pida, sin que el árbol
 * quieto importe un valor del sistema de motion. La aritmética del lente
 * (FOV, perspectiva, profundidad, origen) era composición y se desarmó
 * (Modo pulido).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL CABLEADO — el contrato lo consume y Trabajos lo pide')

const ANIMADO = leer('src/app/v3/_secciones/_contrato/coreografia-animada.tsx')
const QUIETO = leer('src/app/v3/_secciones/_contrato/coreografia.tsx')
const TRABAJOS = leer('src/app/v3/_secciones/trabajos/Trabajos.tsx')
afirmar(ANIMADO.includes("props.lente === 'escena' ? perspectivaDeLaEscena()"), 'el módulo animado escribe la perspectiva del lente cuando el bloque lo pide')
afirmar(ANIMADO.includes('useOrigenDeLaLente(refDelBloque'), '  y el origen lo escribe el hook, sobre el propio bloque')
afirmar(QUIETO.includes("readonly lente?: 'escena'"), 'el contrato declara la prop `lente`')
afirmar(!/from '\.\.\/\.\.\/_lib\/motion\/lente'/.test(QUIETO), '  y el árbol quieto NO importa el lente: un valor del sistema de motion no cruza la compuerta')
afirmar(/<Bloque patron="P7" anclaje="seccion" lente="escena"/.test(TRABAJOS), 'Trabajos pide el lente en el bloque de P7, y en ningún otro')
afirmarIgual((TRABAJOS.match(/<Bloque[^>]*lente="escena"/g) ?? []).length, 1, '  en UN solo bloque')
controlPositivo('el detector ve un bloque de P7 sin lente', '<Bloque patron="P7" anclaje="seccion" className="relative">', (t: string) => /<Bloque patron="P7" anclaje="seccion" lente="escena"/.test(t))

cerrar('s19-lente')
