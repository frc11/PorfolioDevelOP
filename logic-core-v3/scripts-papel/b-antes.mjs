/**
 * PAPEL-2 · B — EL «ANTES» DEL A/B DE PESO, reconstruido y verificado.
 *
 *     node scripts-papel/b-antes.mjs <carpeta-de-respaldo>
 *
 * ── Por qué se RECONSTRUYE en vez de copiarse ─────────────────────────────
 *
 * Este sprint abre sobre el árbol de **COMPO-1**, que sigue sin commitear —y
 * arriba de MOVIL-1, TEXTO-2 y TEXTO-3, que tampoco—. Devolver los archivos a
 * `HEAD` mediría los cinco sprints juntos y le cargaría a éste los 589 B que
 * COMPO-1 ya declaró, más los de los otros tres. Y **no se puede usar `git
 * stash`**: con `core.autocrlf=true` el `apply` reescribe el árbol entero en
 * CRLF y los invariantes que parsean el fuente se ponen rojos sin causa visible.
 *
 * Así que el «antes» se arma quitando de cada archivo EXACTAMENTE lo que este
 * sprint le puso. Cada quite lleva su `assert`: si una sola cadena no aparece
 * tal cual, el script **tira** en vez de escribir un archivo a medias. Un
 * «antes» mal armado no da un número feo, da un número lindo y falso.
 *
 * ── ⚠️ EL CONTROL QUE HACE QUE LA RESTA SIGNIFIQUE ALGO ──────────────────
 *
 * El «antes» de este A/B tiene que reproducir el «después» del A/B de COMPO-1
 * —**66.895,2 B**, publicado en `s5-presupuesto-recibos-de-compo1.ts`— porque es
 * exactamente el mismo árbol. Si no lo reproduce, la reconstrucción está mal y
 * la resta no vale. Es el mismo control que COMPO-1 usó contra TEXTO-3.
 *
 * ⚠ Este script NO toca el árbol: escribe el «antes» en la carpeta de respaldo y
 * publica el sha256 de cada archivo. El swap lo hace `c-peso.mjs`.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const RESPALDO = process.argv[2]
if (RESPALDO === undefined) throw new Error('falta la carpeta de respaldo')

/** Un quite: la cadena que este sprint puso, y lo que había en su lugar. */
const quitar = (puso, habia = '') => ({ puso, habia })

/**
 * ⚠ El orden importa: un quite que contiene a otro tiene que ir primero.
 * Cada entrada se aplica UNA vez y se verifica que aparezca UNA vez.
 */
const CAMBIOS = {
  'src/app/theme-develop.css': [
    // El bloque de los dos tokens del registro 1, con su docblock.
    quitar(
      /\n  \/\* ═══ PAPEL-2 · EL REGISTRO 1 IGUALADO AL REGISTRO 2\. \[derivado\] ════════\n[\s\S]*?--text-display-r1-papel-angosto: calc\(var\(--text-display-xl-angosto\) \* 1\.11025\);\n/,
      '\n',
    ),
    // El quinto breakpoint, con su docblock.
    quitar(
      /\n\n  \/\* ⚠️ PAPEL-2 · EL QUINTO, Y EL SEGUNDO QUE MIRA HACIA ABAJO\. \[derivado\]\n[\s\S]*?--breakpoint-chico: 390px;\n/,
      '\n',
    ),
    // Las tres correcciones de prosa.
    quitar(
      /   \* Nació por un solo consumidor, escrito y acotado: `max-angosto:bg-fondo` en\n[\s\S]*?siempre hacia arriba\.\n/,
      `   * Nace por un solo consumidor, escrito y acotado: \`max-angosto:bg-fondo\` en
   * el Hero, que a 320 tapa la escena porque ahí el bloque de texto y la masa
   * del logo suman más del 100 % de la pantalla y NO existe posición limpia
   * (\`TEXTO-1\` barrió 16 configuraciones de tipografía; \`TEXTO-3\` §2 tiene las
   * cifras y las palancas descartadas). Es el ÚNICO \`max-\` de todo el lane: los
   * otros tres breakpoints se usan siempre hacia arriba.
`,
    ),
    quitar(
      /\n   \* ⚠️ \*\*PAPEL-2 · Y EL PAR SIGUE SIENDO UN PAR[\s\S]*?quedó exactamente como estaba\.\n/,
      '\n',
    ),
  ],
  'src/app/v3/_lib/superficies.ts': [
    quitar(
      /\/\*\*\n \* Lo que cada modo pinta \*\*sólo abajo de `--breakpoint-chico`\*\* \(390px\)\.\n[\s\S]*?'papel-opaco': 'max-chico:bg-fondo',/,
      `/**
 * Lo que cada modo pinta **sólo abajo de \`--breakpoint-angosto\`** (375px).
 *
 * \`max-angosto:\` es la variante que Tailwind emite para ese token, y es el
 * ÚNICO \`max-\` del lane entero: los otros tres breakpoints se usan siempre
 * hacia arriba. La clase va escrita ENTERA y literal por la razón de siempre —
 * Tailwind escanea el fuente y una clase armada no la ve nadie.
 *
 * El transparente pinta cadena vacía y no se omite del mapa: que los dos modos
 * admitidos estén acá es lo que hace que \`Panel\` no tenga una rama.
 */
export const CLASES_DE_LA_BANDA_ANGOSTA: Readonly<Record<ModoSuperficieAngosta, string>> = {
  'papel-opaco': 'max-angosto:bg-fondo',`,
    ),
  ],
  'src/app/v3/_lib/secciones.ts': [
    quitar(
      /   \* `papel-transparente` de \*\*390\*\* para arriba[\s\S]*?ancho en el que conmutan es del CSS, porque `Panel` es un componente de\n   \* servidor y no tiene ancho en su render\.\n/,
      `   * \`papel-transparente\` de 375 para arriba —la sala se ve a través del panel,
   * que es lo que esta pantalla tiene y ninguna otra— y \`papel-opaco\` abajo,
   * donde no hay composición posible: el bloque de texto ocupa el 51 % del
   * viewport y la masa del logo otro 37 %, y TEXTO-1 barrió 16 configuraciones
   * de tipografía sin encontrar una limpia. El porqué entero, con las palancas
   * descartadas y sus cifras, está en \`CLASES_DE_LA_BANDA_ANGOSTA\`.
`,
    ),
  ],
  'src/app/v3/_componentes/marca/Marca.tsx': [
    quitar("import { LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'\n"),
    quitar(/\/\*\*\n \* EL ISOTIPO — la marca dibujada, en 2D y en el DOM[\s\S]*?\n}\n\n(?=\/\*\*\n \* EL PREFIJO DE SERVICIO)/, ''),
  ],
  'src/app/v3/_secciones/hero/geometria.ts': [
    quitar(/\n  \/\*\*\n   \* ── PAPEL-2 · §2 · LA MARCA, SÓLO EN LOS ANCHOS DE PAPEL\. \[derivado\] ────\n[\s\S]*?claseDelPieSinPastilla: 'max-chico:pb-2',\n/, '\n'),
    quitar(
      /\n \* ── ⚠️ PAPEL-2 · EL TAMAÑO CONMUTA DOS VECES EN LA BANDA DE PAPEL ────────\n[\s\S]*?declara intocables\.\n/,
      '\n',
    ),
    quitar(
      "'font-display text-fluido-display max-chico:text-display-r1-papel max-angosto:text-display-r1-papel-angosto leading-titulo tracking-display font-fuerte uppercase'",
      "'font-display text-fluido-display leading-titulo tracking-display font-fuerte uppercase'",
    ),
  ],
  'src/app/v3/_secciones/hero/Hero.tsx': [
    quitar("import { Isotipo, Logotipo } from '../../_componentes/marca/Marca'\n"),
    quitar(/\/\*\*\n \* LA MARCA ARRIBA DEL TITULAR[\s\S]*?\n}\n\n(?=function BajadaYCta)/, ''),
    quitar(
      /        \{\/\* ⚠️ \*\*PAPEL-2 · `max-chico:pb-2`[\s\S]*?          \)\}\n        >/,
      `        <div
          data-pantalla="hero"
          className="flex min-h-svh w-full flex-col justify-end pt-20 pb-20 escritorio:justify-center"
        >`,
    ),
    quitar(/                \{\/\* ⚠️ \*\*PAPEL-2 · §2 · LA MARCA, PRIMERA DE LA COLUMNA\.\*\*[\s\S]*?<MarcaDelHero \/>\n/, ''),
  ],
  'src/app/v3/_chrome/contrato.ts': [
    quitar(/\n\n\/\*\*\n \* ⏳ \*\*LA PASTILLA, APAGADA EN LOS ANCHOS DE PAPEL[\s\S]*?export const CLASE_DE_LA_PASTILLA_EN_PAPEL = 'max-chico:hidden'/, ''),
  ],
  'src/app/v3/_chrome/ChromeDelHome.tsx': [
    quitar(
      "import { CLASE_DE_LA_PASTILLA_EN_PAPEL, CURSOR_PROPIO_EN_EL_HOME } from './contrato'",
      "import { CURSOR_PROPIO_EN_EL_HOME } from './contrato'",
    ),
    quitar(
      /      \{\/\*\*\n       \* ⏳ \*\*PAPEL-2 · LA PASTILLA NO ESTÁ[\s\S]*?<Navegacion como="header" className=\{CLASE_DE_LA_PASTILLA_EN_PAPEL\} \/>/,
      '      <Navegacion como="header" />',
    ),
  ],
  'src/lib/utils.ts': [
    quitar(/\n  \/\/ PAPEL-2: el registro 1 igualado al registro 2 en la banda de papel[\s\S]*?'text-display-r1-papel-angosto',/, ''),
  ],
}

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16)

/**
 * ⚠️ **LOS FINALES DE LÍNEA SE NORMALIZAN PARA BUSCAR Y SE DEVUELVEN AL SALIR.**
 *
 * Este repo corre con `core.autocrlf=true` y varios archivos del lane están en
 * disco con CRLF mientras las ediciones nuevas entran con LF, o sea que el mismo
 * archivo tiene los dos. Un patrón escrito con `\n` no encuentra una línea
 * CRLF y el `assert` de arriba tira por una razón que no es la real.
 *
 * Se normaliza a LF para buscar y se reescribe con el final DOMINANTE del
 * archivo original. Si no se devolviera, el «antes» diferiría del «después» en
 * un byte por línea y el A/B mediría los finales de línea en vez del sprint.
 */
const finalDominante = (s) => ((s.match(/\r\n/g) ?? []).length * 2 > (s.match(/\n/g) ?? []).length ? '\r\n' : '\n')

for (const [archivo, cambios] of Object.entries(CAMBIOS)) {
  const original = readFileSync(archivo, 'utf8')
  const FINAL = finalDominante(original)
  let texto = original.replace(/\r\n/g, '\n')
  for (const { puso, habia } of cambios) {
    if (typeof puso === 'string') {
      const veces = texto.split(puso).length - 1
      if (veces !== 1) throw new Error(`${archivo}: la cadena aparece ${veces} veces, se esperaba 1\n  ${puso.slice(0, 80)}`)
      texto = texto.replace(puso, habia)
      continue
    }
    const m = texto.match(puso)
    if (m === null) throw new Error(`${archivo}: el patrón no aparece\n  ${String(puso).slice(0, 110)}`)
    texto = texto.replace(puso, habia)
    if (puso.test(texto)) throw new Error(`${archivo}: el patrón sigue apareciendo después del quite`)
  }
  const salida = FINAL === '\r\n' ? texto.replace(/\n/g, '\r\n') : texto
  const destino = path.join(RESPALDO, archivo)
  mkdirSync(path.dirname(destino), { recursive: true })
  writeFileSync(destino, salida)
  console.log(
    `  ${archivo.padEnd(48)} ${String(original.length).padStart(7)} B → ${String(salida.length).padStart(7)} B  (−${original.length - salida.length})  ${FINAL === '\r\n' ? 'CRLF' : 'LF  '}  sha ${sha(salida)}`,
  )
}
console.log(`\n«antes» reconstruido en ${RESPALDO}`)
