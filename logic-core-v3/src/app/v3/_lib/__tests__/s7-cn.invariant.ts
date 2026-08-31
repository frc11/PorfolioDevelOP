/**
 * INVARIANTE — EL ARREGLO DE `cn()`, Y QUE EL SISTEMA VIEJO NO CAMBIÓ.
 *
 * Corre con `npm run test:s7-cn`.
 *
 * ── El defecto, y por qué el arreglo va en la raíz ────────────────────────
 *
 * `cn()` es `twMerge` sobre `clsx`, y `tailwind-merge` **no puede adivinar** si
 * `text-<nombre>` es un tamaño o un color: los dos utilities se escriben igual.
 * Sin una lista que se lo diga los mete en el mismo grupo y **descarta uno de
 * los dos, en silencio** — sin error de build, de tipos ni de consola.
 *
 * `src/lib/utils.ts` **ya advertía por escrito de este mismísimo defecto** y
 * traía la lista para los tokens del sistema viejo, con su caso medido. La
 * lista nunca se extendió a los de `/v3`. Los dos lanes de secciones lo
 * encontraron por separado, cada uno por su camino, y los dos dejaron rodeos
 * locales en vez de tocar código compartido.
 *
 * ── Por qué este archivo es más que "probar que anda" ─────────────────────
 *
 * Porque `utils.ts` es **código compartido con el sitio vivo**, y el riesgo real
 * de extender un `twMerge` no es que el arreglo no funcione: es que cambie
 * cómo resuelve algo que ya resolvía bien. El comentario del archivo decía que
 * eso estaba "verificado contra los strings reales, 6/6 casos de control". Seis
 * casos elegidos a mano no son una verificación de una propiedad como ésa.
 *
 * Acá el corpus **se deriva del propio código**: se extraen todas las cadenas de
 * clase del sitio vivo —todo `className` y todo argumento literal de `cn(`— y se
 * corren las DOS configuraciones, la de antes del arreglo y la de ahora. Tienen
 * que dar idéntico en todas. Y el control positivo es el corpus de `/v3`, donde
 * las dos configuraciones **tienen** que diferir: sin eso, "no cambió nada"
 * sería compatible con un comparador ciego.
 */

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import { CLASES_DE_PESO_DECLARADAS, CLASES_DE_TAMANO_DECLARADAS, cn } from '@/lib/utils'

import { CLASE_PESO, NIVELES_TIPOGRAFICOS } from '../tipografia'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const TEMA_V3 = 'src/app/theme-develop.css'

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

/**
 * LA CONFIGURACIÓN DE ANTES DEL ARREGLO — reconstruida acá, no importada.
 *
 * Es la lista del sistema viejo y nada más, que es exactamente lo que `utils.ts`
 * tenía. Vive en el instrumento porque es la vara: una vara que viviera en el
 * mismo archivo que el dato no mediría nada.
 */
const DS_FONT_SIZE_CLASSES = CLASES_DE_TAMANO_DECLARADAS.filter((c) => c.startsWith('text-ds-'))
const twMergeViejo = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [...DS_FONT_SIZE_CLASSES] } },
})
const cnViejo = (...clases: string[]): string => twMergeViejo(clsx(clases))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las listas cubren TODOS los tokens del tema, sin faltar uno')

/**
 * `utils.ts` no puede importar de `src/app/v3/` —es código compartido y no puede
 * depender del árbol de /v3— así que las listas están escritas allá. Lo que
 * impide que se desincronicen es esto: se derivan del CSS y de la tabla de
 * niveles, y se comparan.
 */
const tema = leer(TEMA_V3)
const tokensDeTexto = [...tema.matchAll(/^\s*--text-([a-z0-9-]+):/gm)].map((m) => `text-${m[1]}`)
const tokensDePeso = [...tema.matchAll(/^\s*--font-weight-([a-z0-9-]+):/gm)].map((m) => `font-${m[1]}`)

afirmar(tokensDeTexto.length > 0, `el tema declara ${tokensDeTexto.length} tokens de tamaño`)
afirmar(tokensDePeso.length > 0, `  y ${tokensDePeso.length} de peso`)

const faltanTamanos = tokensDeTexto.filter((c) => !CLASES_DE_TAMANO_DECLARADAS.includes(c))
afirmarIgual(faltanTamanos, [], 'la lista de `utils.ts` cubre TODOS los `--text-*` de /v3')

/**
 * Los pesos son distintos: `font-normal` NO entra en la lista porque
 * `tailwind-merge` ya lo reconoce, y declararlo dos veces sería declarar dos
 * veces lo mismo. Así que la comprobación es que los que NO reconoce estén.
 */
const PESOS_QUE_TW_YA_CONOCE = ['font-normal']
const faltanPesos = tokensDePeso.filter(
  (c) => !PESOS_QUE_TW_YA_CONOCE.includes(c) && !CLASES_DE_PESO_DECLARADAS.includes(c),
)
afirmarIgual(faltanPesos, [], '  y todos los `--font-weight-*` que `tailwind-merge` no conoce')

/** Y desde el otro lado: la tabla de niveles del sistema, que es la que los usa. */
const clasesDeNivel = Object.values(NIVELES_TIPOGRAFICOS).flatMap((d) =>
  d.claseFluida === null ? [d.claseFija] : [d.claseFija, d.claseFluida],
)
afirmarIgual(
  clasesDeNivel.filter((c) => !CLASES_DE_TAMANO_DECLARADAS.includes(c)),
  [],
  '  y las ocho filas de `NIVELES_TIPOGRAFICOS`, fija y fluida',
)
afirmarIgual(
  Object.values(CLASE_PESO).filter(
    (c) => !PESOS_QUE_TW_YA_CONOCE.includes(c) && !CLASES_DE_PESO_DECLARADAS.includes(c),
  ),
  [],
  '  y los cuatro pesos que `CLASE_PESO` emite',
)

controlPositivo(
  'el comparador ve una lista a la que le falta un token',
  CLASES_DE_TAMANO_DECLARADAS.filter((c) => c !== 'text-micro'),
  (lista: readonly string[]) => tokensDeTexto.every((c) => lista.includes(c)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LAS DOS FORMAS DEL DEFECTO, arregladas')

interface Caso {
  readonly entrada: readonly string[]
  readonly desaparecia: string
  readonly forma: string
}

const CASOS: readonly Caso[] = [
  { entrada: ['text-micro', 'text-tinta-media'], desaparecia: 'text-micro', forma: 'tamaño fijo + color' },
  {
    entrada: ['text-fluido-micro', 'text-tinta-media'],
    desaparecia: 'text-fluido-micro',
    forma: 'tamaño fluido + color',
  },
  { entrada: ['text-titulo-xl', 'text-tinta'], desaparecia: 'text-titulo-xl', forma: 'titular + tinta' },
  {
    entrada: ['text-fluido-caption', 'text-acento'],
    desaparecia: 'text-fluido-caption',
    forma: 'caption fluido + acento',
  },
  { entrada: ['font-cuerpo', 'font-medio'], desaparecia: 'font-cuerpo', forma: 'familia + peso medio' },
  { entrada: ['font-titulo', 'font-fuerte'], desaparecia: 'font-titulo', forma: 'familia + peso fuerte' },
  { entrada: ['font-cuerpo', 'font-semi'], desaparecia: 'font-cuerpo', forma: 'familia + peso semi' },
]

for (const { entrada, desaparecia, forma } of CASOS) {
  const antes = cnViejo(...entrada)
  const ahora = cn(...entrada)
  afirmar(
    !antes.split(' ').includes(desaparecia),
    `ANTES — \`${forma}\`: \`${desaparecia}\` desaparecía`,
    `${entrada.join(' + ')} → "${antes}"`,
  )
  afirmar(
    ahora.split(' ').includes(desaparecia) && entrada.every((c) => ahora.split(' ').includes(c)),
    `  AHORA sobreviven las dos`,
    `→ "${ahora}"`,
  )
}

/**
 * Y la TERCERA forma, la que no necesita que nadie pase una clase: los
 * componentes de texto emiten familia y peso juntos, así que `<Caption
 * peso="medio">` perdía su familia por su cuenta.
 */
const conPeso = cn('font-cuerpo', 'text-caption', 'leading-texto', 'tracking-texto', 'font-medio')
afirmar(
  conPeso.includes('font-cuerpo') && conPeso.includes('font-medio') && conPeso.includes('text-caption'),
  'la TERCERA forma: un componente de texto con `peso="medio"` conserva familia, peso y tamaño',
  `→ "${conPeso}"`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Y lo que TIENE que seguir colapsando, colapsa')

/**
 * El arreglo agrega nombres que reconocer. Si de paso rompiera el
 * comportamiento correcto —dos tamaños, dos pesos o dos familias en la misma
 * cadena— sería peor que el defecto: las clases muertas quedarían en el HTML.
 */
afirmarIgual(cn('text-micro', 'text-caption'), 'text-caption', 'dos tamaños: gana el último')
afirmarIgual(cn('font-medio', 'font-fuerte'), 'font-fuerte', 'dos pesos: gana el último')
afirmarIgual(cn('font-cuerpo', 'font-codigo'), 'font-codigo', 'dos familias: gana la última')
afirmarIgual(cn('text-tinta', 'text-acento'), 'text-acento', 'dos colores de texto: gana el último')
afirmarIgual(cn('text-sm', 'text-micro'), 'text-micro', 'un tamaño de Tailwind y uno de v3 también colapsan')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL SISTEMA VIEJO NO CAMBIÓ — sobre el corpus real, no seis casos')

/**
 * El corpus se DERIVA del código: todas las cadenas de clase del sitio vivo.
 * `/v3` queda afuera —es el corpus del control positivo— y también los
 * instrumentos, que llevan cadenas rotas a propósito.
 */
function recorrer(relativo: string, acumulado: string[] = []): string[] {
  for (const entrada of readdirSync(path.join(RAIZ, relativo), { withFileTypes: true })) {
    const hijo = `${relativo}/${entrada.name}`
    if (entrada.isDirectory()) recorrer(hijo, acumulado)
    else if (/\.tsx?$/.test(hijo)) acumulado.push(hijo)
  }
  return acumulado
}

/**
 * Toda cadena que se pueda leer como una lista de clases.
 *
 * ⚠ **Los comentarios se sacan antes de mirar, y no es una optimización.** La
 * primera corrida de este archivo reportó DOS cadenas del sitio vivo que
 * cambiaban de resultado, y las dos eran `cn('font-cuerpo', 'font-medio')` y
 * `cn('text-fluido-micro', 'text-tinta-media')` **escritas en el docblock de
 * `src/lib/utils.ts`**: los ejemplos del defecto que el propio arreglo
 * documenta. El instrumento estaba midiendo su explicación.
 *
 * Es la CUARTA vez que este proyecto se cruza con un instrumento que se mide a
 * sí mismo, y las cuatro fueron en sprints distintos. La regla que queda: **un
 * escáner que lee código fuente lee comentarios, y un comentario que ejemplifica
 * lo que el escáner busca es indistinguible de lo que busca.** Se saca el
 * comentario antes de escanear, siempre, y se dice por qué.
 */
function cadenasDeClase(fuenteConComentarios: string): string[] {
  const fuente = fuenteConComentarios
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/[^\n]*$/gm, ' ')
  const salida: string[] = []
  for (const m of fuente.matchAll(/className=(?:"([^"]*)"|\{`([^`$]*)`\}|\{'([^']*)'\})/g)) {
    salida.push(m[1] ?? m[2] ?? m[3])
  }
  for (const m of fuente.matchAll(/\bcn\(([\s\S]{0,600}?)\)/g)) {
    const literales = [...m[1].matchAll(/'([^']*)'/g)].map((l) => l[1])
    if (literales.length > 0) salida.push(literales.join(' '))
  }
  return salida.map((c) => c.trim()).filter((c) => c.length > 0 && !c.includes('${'))
}

const ARCHIVOS_DEL_SITIO = recorrer('src').filter(
  (a) => !a.startsWith('src/app/v3/') && !/\.invariant\.tsx?$/.test(a),
)
const CORPUS_VIEJO = [...new Set(ARCHIVOS_DEL_SITIO.flatMap((a) => cadenasDeClase(leer(a))))]

afirmar(
  CORPUS_VIEJO.length > 200,
  `el corpus del sitio vivo son ${CORPUS_VIEJO.length} cadenas de clase distintas, de ${ARCHIVOS_DEL_SITIO.length} archivos`,
  'no es una muestra elegida a mano',
)

const cambiaron = CORPUS_VIEJO.filter((c) => cn(c) !== cnViejo(c))
afirmarIgual(
  cambiaron.map((c) => `"${c}" — antes "${cnViejo(c)}" · ahora "${cn(c)}"`),
  [],
  'ninguna cadena del sitio vivo cambia de resultado con el arreglo puesto',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL CONTROL POSITIVO — sobre /v3 las dos configuraciones SÍ difieren')

/**
 * Sin esto, la §4 pasaría en verde con un comparador que no compara nada. El
 * corpus de `/v3` es el mismo código, extraído de la misma forma, y ahí las dos
 * configuraciones tienen que dar distinto: si no, el arreglo no arregla.
 */
const ARCHIVOS_DE_V3 = recorrer('src/app/v3').filter((a) => !/\.invariant\.tsx?$/.test(a))
const CORPUS_V3 = [...new Set(ARCHIVOS_DE_V3.flatMap((a) => cadenasDeClase(leer(a))))]

afirmar(CORPUS_V3.length > 20, `el corpus de /v3 son ${CORPUS_V3.length} cadenas de clase distintas`)

const difieren = CORPUS_V3.filter((c) => cn(c) !== cnViejo(c))
afirmar(
  difieren.length > 0,
  `el arreglo cambia el resultado de ${difieren.length} cadenas de /v3: el comparador NO está ciego`,
)
console.log('  las que cambian, con lo que el sistema viejo se comía:')
for (const c of difieren.slice(0, 12)) {
  const perdidas = cn(c)
    .split(' ')
    .filter((clase) => !cnViejo(c).split(' ').includes(clase))
  console.log(`    "${c}"`)
  console.log(`      recuperado: ${perdidas.join(' ')}`)
}
if (difieren.length > 12) console.log(`    … y ${difieren.length - 12} más`)

controlPositivo(
  'el comparador de configuraciones ve dos salidas iguales como iguales',
  'flex items-center gap-2',
  (clase: string) => cn(clase) !== cnViejo(clase),
)

controlPositivo(
  'y el extractor de cadenas NO mira los comentarios, que es donde se documenta el defecto',
  "/* cn('text-micro', 'text-tinta-media') */ const x = 1",
  (fuente: string) => cadenasDeClase(fuente).length > 0,
)

cerrar('s7-cn.invariant')
