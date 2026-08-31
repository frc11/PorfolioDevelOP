/**
 * INVARIANTE — EL CONTRASTE DE LA TINTA, Y UN DEFECTO HEREDADO QUE SE PUBLICA.
 *
 * Corre con `npm run test:s6-contraste`. Es aritmética pura sobre los tokens: no
 * monta React, no lee el build y no habla con `git`.
 *
 * ── Lo propio se afirma; lo heredado se publica ───────────────────────────
 *
 * Este archivo afirma lo que este lane controla —que su rótulo de sección pasa
 * AA sobre el peor fondo, y por qué el alfa que traía no alcanzaba— y **publica
 * con atribución** un defecto de un componente de S1 que este lane no puede
 * tocar. Un invariante puesto a fallar por algo que su sprint no produce ni
 * puede arreglar no protege: entrena a ignorarlo (regla 13).
 */

import { afirmar, afirmarIgual, cerrar, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { SECCIONES } from '../../_lib/secciones'
import { COLORES_DEL_CANVAS_DE_PRUEBA, SUPERFICIES, TINTA_HEX } from '../../_lib/superficies'
import { codigoDelLane, leer } from './soporte'

/** El alfa compuesto a 8 bits ANTES de medir: es lo que pinta la pantalla. */
function componer(hex: string, fondo: string, alfa: number): string {
  const canal = (h: string, i: number) => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const mezcla = (i: number) => Math.round(alfa * canal(hex, i) + (1 - alfa) * canal(fondo, i))
  return `#${[0, 1, 2].map((i) => mezcla(i).toString(16).padStart(2, '0')).join('')}`
}

const AA = 4.5
const AAA = 7
const TINTA_MEDIA_HEX = '#535353'
const OSCURO_HEX = '#0E0E0E'
const peorCanvas = COLORES_DEL_CANVAS_DE_PRUEBA[COLORES_DEL_CANVAS_DE_PRUEBA.length - 1].hex

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La calculadora, antes de creerle un número')

afirmarIgual(razonDeContraste('#000000', '#FFFFFF').toFixed(4), '21.0000', 'negro contra blanco')
afirmarIgual(razonDeContraste(TINTA_HEX, TINTA_HEX).toFixed(4), '1.0000', 'y un color contra sí mismo')
afirmar(
  razonDeContraste(TINTA_HEX, COLORES_DEL_CANVAS_DE_PRUEBA[0].hex) !==
    razonDeContraste(TINTA_HEX, peorCanvas),
  'y distingue los dos colores del canvas: no devuelve lo mismo para entradas distintas',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La tinta sobre el canvas de prueba — lo que se ve en un panel transparente')

for (const { token, hex } of COLORES_DEL_CANVAS_DE_PRUEBA) {
  console.log(`  tinta ${TINTA_HEX} sobre ${token} (${hex})   ${razonDeContraste(TINTA_HEX, hex).toFixed(4)}:1`)
}
const peorSobreElCanvas = Math.min(...COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => razonDeContraste(TINTA_HEX, c.hex)))
afirmar(peorSobreElCanvas >= AA, 'el rótulo en tinta plena pasa AA sobre el peor color del canvas', `${peorSobreElCanvas.toFixed(4)}:1`)
afirmar(peorSobreElCanvas >= AAA, '  y pasa AAA', `${peorSobreElCanvas.toFixed(4)}:1`)

console.log('  ⚠️ Estas cifras valen para el MARCADOR DE POSICIÓN, que es plano y pinta dos tokens.')
console.log('     La escena real es una sala con gradiente y NO hereda este número: hay que volver a medirlo.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Por qué este lane RETIRÓ el alfa de su rótulo')

const conAlfa = razonDeContraste(componer(TINTA_HEX, peorCanvas, 0.6), peorCanvas)
console.log(`  tinta al 60 % (\`--opacity-casi\`) sobre ${peorCanvas} → ${conAlfa.toFixed(4)}:1`)
afirmar(conAlfa < AA, '`--opacity-casi` NO llega a AA sobre el canvas — por eso el rótulo de este lane va en tinta plena', `${conAlfa.toFixed(4)}:1`)

/** Bajar el alfa EMPEORA: menos tinta es más fondo claro, no menos. */
const conMenosAlfa = razonDeContraste(componer(TINTA_HEX, peorCanvas, 0.5), peorCanvas)
afirmar(
  conMenosAlfa < conAlfa,
  '  y bajar el alfa empeora, así que no hay escalón del sistema que sirva',
  `0,5 → ${conMenosAlfa.toFixed(4)}:1 contra ${conAlfa.toFixed(4)}:1 de 0,6`,
)

const mediaSobreCanvas = razonDeContraste(TINTA_MEDIA_HEX, peorCanvas)
const mediaSobreOscuro = razonDeContraste(TINTA_MEDIA_HEX, OSCURO_HEX)
afirmar(
  mediaSobreCanvas >= AA && mediaSobreOscuro < AA,
  '  y `text-tinta-media` tampoco sirve: pasa sobre el canvas y NO sobre la sección invertida, que el tema no le da vuelta',
  `${mediaSobreCanvas.toFixed(4)}:1 sobre el canvas · ${mediaSobreOscuro.toFixed(4)}:1 sobre ${OSCURO_HEX}`,
)

/** El rótulo de este lane sí funciona en los dos sentidos. */
afirmar(
  razonDeContraste(TINTA_HEX, OSCURO_HEX) < AA,
  '  la tinta oscura sobre la sección invertida NO se usa: ahí el token de tinta se da vuelta solo',
  `${razonDeContraste(TINTA_HEX, OSCURO_HEX).toFixed(4)}:1 si alguien la fijara a mano`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · HEREDADO — `RotuloDePanel` (S1) sobre un panel transparente')

/**
 * ⚠️ SE PUBLICA, NO SE AFIRMA. `_componentes/Panel.tsx` es de S1 y este lane
 * tiene prohibido tocarlo. Lo que se afirma acá es lo que este lane controla:
 * que NINGUNA de sus cuatro secciones usa ese componente. La cifra del defecto
 * y su disparador se imprimen con atribución.
 *
 * ── El disparador, y por qué ahora importa ────────────────────────────────
 *
 * `RotuloDePanel` pinta el número de sección a `--opacity-casi`, igual que hacía
 * este lane hasta que se midió. Mientras las ocho secciones fueron
 * `papel-opaco`, el número cae sobre el papel y da 4,83:1 — pasa AA raspando.
 * Sobre el canvas, en cambio, da **4,4043:1**, por debajo de AA.
 *
 * `/v3/page.tsx` renderiza `RotuloDePanel` para **las ocho** secciones (siete por
 * `Panel` y la pinneada por `PanelPinneado`). O sea que el defecto se dispara
 * para toda sección que pase a `papel-transparente`, y no hay que hacer nada más
 * que cambiar ese valor en la tabla.
 */
const RUTA_DEL_PANEL = 'src/app/v3/_componentes/Panel.tsx'
const fuenteDelPanel = leer(RUTA_DEL_PANEL)
const usaElAlfa = /opacity-casi/.test(fuenteDelPanel)

afirmar(usaElAlfa, `\`RotuloDePanel\` consume \`--opacity-casi\` en su número — leído de ${RUTA_DEL_PANEL}`)

/** El papel se LEE del tema, no se escribe: si cambia, la cifra se mueve con él. */
const PAPEL_HEX = /--color-fondo:\s*(#[0-9A-Fa-f]{6})/.exec(
  leer('src/app/theme-develop.css').replace(/\/\*[\s\S]*?\*\//g, ''),
)?.[1]
afirmar(PAPEL_HEX !== undefined, 'el papel se leyó del tema', String(PAPEL_HEX))
const sobreElPapel = razonDeContraste(componer(TINTA_HEX, PAPEL_HEX ?? '#F7F7F5', 0.6), PAPEL_HEX ?? '#F7F7F5')
console.log(`  su número sobre el PAPEL   → ${sobreElPapel.toFixed(4)}:1   ${sobreElPapel >= AA ? 'pasa AA' : 'NO pasa AA'}`)
console.log(`  su número sobre el CANVAS  → ${conAlfa.toFixed(4)}:1   ${conAlfa >= AA ? 'pasa AA' : 'NO pasa AA'}`)

const transparentes = SECCIONES.filter((s) => SUPERFICIES[s.superficie].dejaVerElCanvas)
console.log(
  `  secciones \`papel-transparente\` en la tabla de ESTE árbol: ${transparentes.length}` +
    (transparentes.length > 0 ? ` — ${transparentes.map((s) => s.id).join(' · ')}` : ''),
)
console.log('  ⚠️ El lane A declara DOS transparentes (Hero y Por qué develOP) en su árbol de trabajo,')
console.log('     todavía sin commitear: el tip de `rediseno/secciones-a` sigue con las ocho en `papel-opaco`.')
console.log('     El día que eso se mergee, `/v3` pinta DOS números a 4,4043:1 sobre el canvas.')
console.log(`     No es de este lane y no se toca: el arreglo es sacar \`opacity-casi\` de ${RUTA_DEL_PANEL}.`)

/** LO QUE SÍ SE AFIRMA: ningún archivo de este lane monta el componente con el defecto. */
const queLoMontan = codigoDelLane().filter((a) => /<RotuloDePanel\b/.test(leer(a)))
afirmarIgual(
  queLoMontan,
  [],
  `ninguno de los ${codigoDelLane().length} archivos de producto del lane monta \`RotuloDePanel\`: usan \`EncabezadoDeSeccion\`, que va en tinta plena`,
)
/**
 * ⚠ EL CONTRAPESO CAMBIÓ DE LUGAR, Y ESO ES UNA NOTICIA.
 *
 * Miraba `/v3/page.tsx`, que montaba `RotuloDePanel` para las ocho secciones del
 * esqueleto. **SITIO-S7 compuso el home y esa página ya no lo monta**: cada
 * sección trae su propio rótulo, en tinta plena.
 *
 * O sea que el defecto que este bloque documenta —el número a `opacity-casi` da
 * 4,4043:1 sobre el canvas, abajo de AA— **dejó de estar en pantalla**: se
 * disparaba en cuanto un panel `papel-transparente` usara `RotuloDePanel`, y ya
 * no hay ninguno que lo use. El componente sigue existiendo para quien lo monte,
 * así que la comprobación sigue: lo que cambia es dónde vive el contrapeso.
 */
const QUIEN_LO_MONTA = 'src/app/v3/_componentes/PanelPinneado.tsx'
afirmar(
  /<RotuloDePanel\b/.test(leer(QUIEN_LO_MONTA)),
  `  el contrapeso: el detector SÍ lo encuentra donde está, que hoy es \`${QUIEN_LO_MONTA}\``,
  'sin esto, "ningún archivo lo monta" sería compatible con "el detector no sabe buscarlo"',
)
afirmar(
  !/<RotuloDePanel\b/.test(leer('src/app/v3/page.tsx')),
  '  y `/v3/page.tsx` ya NO lo monta: el home compuesto sacó el defecto de la pantalla',
)

cerrar('s6-contraste.invariant')
