/**
 * COMPO-2 · C — EL «ANTES» DEL A/B DE PESO, reconstruido y verificado.
 *
 *     node scripts-compo2/c-antes.mjs escribir <carpeta-de-respaldo>
 *     node scripts-compo2/c-antes.mjs restaurar <carpeta-de-respaldo>
 *
 * ── Por qué se RECONSTRUYE en vez de copiarse ─────────────────────────────
 *
 * Este sprint abre sobre el árbol de **PAPEL-2**, que sigue sin commitear —y
 * arriba de COMPO-1, MOVIL-1, TEXTO-2 y TEXTO-3, que tampoco—. Devolver los
 * archivos a `HEAD` mediría los seis sprints juntos. Y **no se puede usar `git
 * stash`**: con `core.autocrlf=true` el `apply` reescribe el árbol entero en
 * CRLF y los invariantes que parsean el fuente se ponen rojos sin causa visible.
 *
 * Así que el «antes» se arma quitando de cada archivo EXACTAMENTE lo que este
 * sprint le puso. Cada quite lleva su `assert`: si una cadena no aparece tal
 * cual, o aparece más de una vez, el script **tira** en vez de escribir un
 * archivo a medias. Un «antes» mal armado no da un número feo: da un número
 * lindo y falso.
 *
 * ── ⚠️ QUÉ SE RECONSTRUYE Y QUÉ NO, Y POR QUÉ ES SUFICIENTE ──────────────
 *
 * Se reconstruye **sólo lo que llega al bundle**: literales de clase, marcado,
 * contenido y nombres exportados. **No se reconstruyen los docblocks**, que son
 * la mayor parte del diff de este sprint, porque el minificador los borra y no
 * pesan un byte. El control de que eso alcanza es el de siempre: el número del
 * «antes» tiene que reproducir el que PAPEL-2 dejó publicado.
 *
 * Tampoco se tocan los archivos de INVARIANTE (`papel.ts`, `ajuste.ts`,
 * `s10-acceso-landmarks.ts`, `tokens.invariant.ts`, `padron-de-tokens.ts`): no
 * los importa ni una línea de la aplicación, así que no entran en el grafo del
 * build. `next build` no los compila y `tsc` corre aparte.
 *
 * ⚠ El respaldo guarda el «después» ANTES de escribir nada, y `restaurar` lo
 * devuelve. El sha256 de los dos estados se publica en las dos corridas.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const MODO = process.argv[2]
const RESPALDO = process.argv[3]
if (MODO !== 'escribir' && MODO !== 'restaurar') throw new Error('modo: escribir | restaurar')
if (RESPALDO === undefined) throw new Error('falta la carpeta de respaldo')

/** Un quite: la cadena que este sprint puso, y lo que había en su lugar. */
const quitar = (puso, habia = '') => ({ puso, habia })

const CAMBIOS = {
  /**
   * ⚠️ **EL `tsconfig` — Y ESTO NO ES UN ATAJO, ES UN HECHO DEL «ANTES».**
   *
   * `next build` **SÍ corre el typecheck** en esta versión (16.2.9) — contra lo
   * que este repo tenía anotado —, y los INSTRUMENTOS de este sprint hablan de
   * una API que el «antes» no tiene: `ajuste.ts` mide el factor de la marca,
   * `papel.ts` afirma las tres clases nuevas y `hero.invariant.tsx` lee
   * `CONTENIDO.bajada`. Un «antes» que los conserve no compila, y reconstruir
   * también los instrumentos sería reconstruir el sprint entero.
   *
   * Sacarlos del typecheck **no cambia un byte del bundle**: ninguna línea de la
   * aplicación los importa, así que no están en el grafo del build. El control
   * es el de siempre — que el número del «antes» reproduzca el publicado.
   */
  'tsconfig.json': [
    quitar(
      `    "node_modules",
    "scripts/**"
  ]`,
      `    "node_modules",
    "scripts/**",
    "scripts-compo2/**",
    "src/app/v3/_lib/__tests__/**",
    "src/app/v3/_secciones/hero/ajuste.ts",
    "src/app/v3/_secciones/hero/papel.ts",
    "src/app/v3/_secciones/hero/composicion.ts",
    "src/app/v3/_secciones/hero/soporte.ts",
    "src/app/v3/_secciones/hero/hero.invariant.tsx"
  ]`,
    ),
  ],

  // ── El tema: el token de la banda portátil. No pesa (el techo cuenta sólo
  //    `<script src>`), pero se saca igual para que el «antes» sea el árbol.
  'src/app/theme-develop.css': [
    quitar(
      /\n\n  \/\* ═══ COMPO-2 · EL REGISTRO 1 EN PORTÁTIL[\s\S]*?--text-display-r1-portatil: clamp\(67px, -1\.0625rem \+ 10\.9375vw, 95px\);/,
      '',
    ),
  ],

  // ── `cn()`: el token nuevo en la lista de tamaños.
  'src/lib/utils.ts': [
    quitar(
      /\n  \/\/ COMPO-2: el registro 1 en la banda portátil \(768–1024\)[\s\S]*?\n  'text-display-r1-portatil',/,
      '',
    ),
  ],

  // ── La geometría: seis literales y una constante.
  'src/app/v3/_secciones/hero/geometria.ts': [
    quitar(
      "  claseDelAireDelPieEnPortatil:\n    'tablet:mb-[calc(var(--text-base)*var(--leading-texto))] medio:mb-4 escritorio:mb-0',",
      "  claseDelAireDelPieEnPortatil: 'medio:mb-4 escritorio:mb-0',",
    ),
    quitar(
      "    'h-[calc(var(--text-display-r1-papel)*var(--leading-titulo)*2.63219)] max-angosto:h-[calc(var(--text-display-r1-papel-angosto)*var(--leading-titulo)*2.63219)]',",
      "    'h-[calc(var(--text-display-r1-papel)*var(--leading-titulo))] max-angosto:h-[calc(var(--text-display-r1-papel-angosto)*var(--leading-titulo))]',",
    ),
    quitar(
      "  claseDelLogotipoDelHero: 'text-[length:calc(var(--text-fluido-caption)*2.63219)]',",
      "  claseDelLogotipoDelHero: 'text-fluido-caption',",
    ),
    quitar(/\n  \/\*\*\n   \* EL FACTOR, como NÚMERO[\s\S]*?\n  factorDeLaMarca: 2\.63219,/, ''),
    quitar(/\n  \/\*\*\n   \* ── COMPO-2 · §1 · EL BLOQUE CENTRADO[\s\S]*?\n  claseDelBloqueCentradoEnPapel: 'max-chico:justify-center',/, ''),
    quitar(/\n  \/\*\*\n   \* ── COMPO-2 · §1 · EL AIRE DE ARRIBA[\s\S]*?\n  claseDelAireDeArribaEnPapel: 'max-chico:pt-2',/, ''),
    quitar(/\n  \/\*\*\n   \* ── COMPO-2 · §1 · LA CELDA LATERAL VACÍA[\s\S]*?\n  claseDeLaCeldaLateralEnPapel: 'max-chico:hidden',/, ''),
    quitar(' tablet:text-display-r1-portatil escritorio:text-fluido-display', ''),
  ],

  // ── El contenido: la bajada vuelve a ser dos filas, y el pedido a tres.
  'src/app/v3/_secciones/hero/contenido.ts': [
    quitar(
      "  bajada: 'Tu sitio, tu chat y tu seguimiento.',",
      "  bajadaFila1: 'Tu sitio, tu chat',\n  bajadaFila2: 'y tu seguimiento.',",
    ),
    quitar(
      /  \{\n    ruta: 'bajada',\n    clase: 'prosa',[\s\S]*?\n  \},\n/,
      `  {
    ruta: 'bajadaFila1',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'La PRIMERA fila del renglon abajo del titular.',
    formato: 'UNA fila, 34 caracteres COMO MAXIMO. Texto plano.',
  },
  {
    ruta: 'bajadaFila2',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'La SEGUNDA fila del mismo renglon.',
    formato: 'UNA fila, 34 caracteres COMO MAXIMO. Texto plano.',
  },
`,
    ),
  ],

  // ── El contrato del chrome: los dos nombres y la banda.
  'src/app/v3/_chrome/contrato.ts': [
    quitar('export const PASTILLA_APAGADA_ABAJO_DE_MEDIO = true', 'export const PASTILLA_APAGADA_EN_PAPEL = true'),
    quitar(
      "export const CLASE_DE_LA_PASTILLA_APAGADA = 'max-medio:hidden'",
      "export const CLASE_DE_LA_PASTILLA_EN_PAPEL = 'max-chico:hidden'",
    ),
  ],

  'src/app/v3/_chrome/ChromeDelHome.tsx': [
    quitar('import { CLASE_DE_LA_PASTILLA_APAGADA, ', 'import { CLASE_DE_LA_PASTILLA_EN_PAPEL, '),
    quitar('className={CLASE_DE_LA_PASTILLA_APAGADA}', 'className={CLASE_DE_LA_PASTILLA_EN_PAPEL}'),
  ],

  // ── El Hero: el marcado de la bajada, las dos clases del §1 y la celda.
  'src/app/v3/_secciones/hero/Hero.tsx': [
    quitar(
      '      <TextoBase>{CONTENIDO.bajada}</TextoBase>',
      `      <TextoBase className={GEOMETRIA.claseDelEnvoltorioDeFilas}>
        <span>{CONTENIDO.bajadaFila1}</span>
        {' '}
        <span>{CONTENIDO.bajadaFila2}</span>
      </TextoBase>`,
    ),
    quitar(
      '            GEOMETRIA.claseDelPieSinPastilla,\n            GEOMETRIA.claseDelAireDeArribaEnPapel,\n            GEOMETRIA.claseDelBloqueCentradoEnPapel,\n',
      '            GEOMETRIA.claseDelPieSinPastilla,\n',
    ),
    quitar('<div className={GEOMETRIA.claseDeLaCeldaLateralEnPapel} />', '<div />'),
  ],
}

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16)

mkdirSync(RESPALDO, { recursive: true })

for (const [archivo, quites] of Object.entries(CAMBIOS)) {
  const destino = path.join(RESPALDO, archivo.replace(/[\\/]/g, '__'))

  if (MODO === 'restaurar') {
    const guardado = readFileSync(destino, 'utf8')
    writeFileSync(archivo, guardado)
    console.log(`  restaurado  ${archivo}  sha ${sha(guardado)}`)
    continue
  }

  const despues = readFileSync(archivo, 'utf8')
  writeFileSync(destino, despues)
  let antes = despues
  for (const { puso, habia } of quites) {
    if (typeof puso === 'string') {
      const cuantas = antes.split(puso).length - 1
      if (cuantas !== 1) throw new Error(`en ${archivo}: la cadena aparece ${cuantas} veces, se esperaba 1 — «${puso.slice(0, 70)}»`)
      antes = antes.replace(puso, habia)
    } else {
      const m = puso.exec(antes)
      if (m === null) throw new Error(`en ${archivo}: el patrón no encontró nada — ${puso}`)
      antes = antes.replace(puso, habia)
      if (puso.exec(antes) !== null) throw new Error(`en ${archivo}: el patrón sigue encontrando algo después del quite — ${puso}`)
    }
  }
  if (antes === despues) throw new Error(`en ${archivo}: el «antes» quedó idéntico al «después»`)
  writeFileSync(archivo, antes)
  console.log(`  ANTES escrito  ${archivo}\n     despues sha ${sha(despues)}  ->  antes sha ${sha(antes)}  (${despues.length} -> ${antes.length} caracteres)`)
}

console.log(
  MODO === 'escribir'
    ? `\n  el arbol quedo en el estado «ANTES». El respaldo del «despues» esta en ${RESPALDO}.\n  Para volver: node scripts-compo2/c-antes.mjs restaurar ${RESPALDO}`
    : `\n  el arbol volvio al estado «DESPUES».`,
)
