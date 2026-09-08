/**
 * B7 · FRENTE C — `/v3/tipografia/muestra` A 375 (`D7`), Y LAS DOS MITADES (`D9`).
 *
 *     npx tsx scripts-b7/c-tipografia.ts [antes|despues]
 *
 * ── Las dos mitades de D7, y por qué hacen falta las dos ──────────────────
 *
 * D7 dice que la ruta desborda a 375: la receta del banco **tira** con
 * «innerWidth=638, se pidió 375». Arreglar el desborde devuelve el `innerWidth`
 * a 375, y ahí termina la mitad fácil. La que importa es la segunda: la ruta
 * existe para resolver `clamp()` con `vw` contra un viewport de verdad, así que
 * el arreglo sólo sirvió para algo si **los seis niveles fluidos resuelven
 * contra 375**.
 *
 * Y eso se afirma contra una referencia EXTERNA al instrumento: 375 es
 * `--fluido-piso`, el ancla de abajo de la banda, así que a 375 cada `clamp()`
 * tiene que valer **su primer argumento**, que se lee de `theme-develop.css`.
 * El instrumento no elige ese número ni lo calcula: lo saca del archivo que
 * gobierna el tema y lo compara contra lo que el navegador computó.
 *
 * ⚠️ **Ésa es la diferencia con un verde por arnés.** Si la cifra esperada la
 * hubiera puesto este archivo, la comparación mediría este archivo. La pone el
 * tema; la entrada bajo prueba —el ancho del viewport— la pone el navegador por
 * `Emulation.setDeviceMetricsOverride`; y la salida la lee `getComputedStyle`.
 * Ninguna de las tres la escribe el instrumento.
 *
 * ── EL GATE ES `medirNiveles()`; LA LUPA VIVE EN OTRO ARCHIVO ─────────────
 *
 * `c-tipografia-lupa.ts` abre la página SIN verificarla, a propósito: con D7
 * vivo la verificación de la receta era el defecto y por esa puerta no se podía
 * mirar qué lo causaba. Está aparte para que no se confundan: **lo único que
 * cierra un defecto acá es `medirNiveles()`**, que usa la receta entera, paso 4
 * incluido. Lo de la lupa es diagnóstico y se imprime rotulado como tal.
 *
 * ── D9 — las dos mitades del empate de la cap height ──────────────────────
 *
 * `Escala` renderiza los ocho niveles. La cap height manda en Title Case y la
 * x-height en minúscula, así que los ocho tienen que mostrarse en las dos
 * formas o la comparación que la ruta existe para permitir sólo se puede hacer
 * en dos de los ocho. Se cuenta `[data-muestra]` contra
 * `[data-muestra-minusculas]`, y se afirma que hay **ocho de cada uno**.
 *
 * ⚠️ **El empate en sí NO se decide acá.** Está cerrado por decisión del dueño
 * en V3-E: el tema queda como está. Lo que se afirma es que la ruta MUESTRA las
 * dos mitades, no cuál gana.
 */

import { readFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'

import { conLaPagina, dos, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import { diagnosticarElDesborde } from './c-tipografia-lupa'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]
const RUTA = '/v3/tipografia/muestra'
/** El viewport de LAYOUT que D7 producía a 375. Medido en B4-B y reproducido en
 *  la columna «antes» de este mismo archivo. Sólo se usa para DERIVAR el costo. */
const ANCHO_DEL_DESBORDE = 638
const RUTA_MADRE = '/v3/tipografia'

/** Los ocho niveles, con el token del que sale su tamaño a 375. */
const NIVELES: readonly { readonly nivel: string; readonly token: string; readonly fluido: boolean }[] = [
  { nivel: 'micro', token: '--text-fluido-micro', fluido: true },
  { nivel: 'caption', token: '--text-fluido-caption', fluido: true },
  { nivel: 'cuerpo', token: '--text-cuerpo', fluido: false },
  { nivel: 'base', token: '--text-base', fluido: false },
  { nivel: 'titulo-s', token: '--text-fluido-titulo-s', fluido: true },
  { nivel: 'titulo-m', token: '--text-fluido-titulo-m', fluido: true },
  { nivel: 'titulo-l', token: '--text-fluido-titulo-l', fluido: true },
  { nivel: 'titulo-xl', token: '--text-fluido-titulo-xl', fluido: true },
]

const TEMA = readFileSync('src/app/theme-develop.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** La declaración cruda del token, tal cual está escrita en el tema. */
function valorDelTema(token: string): string {
  const m = new RegExp(`${token}\\s*:\\s*([^;]+);`).exec(TEMA)
  if (m === null) throw new Error(`el token ${token} no está en theme-develop.css`)
  return m[1].trim()
}

/**
 * El piso del nivel, LEÍDO DEL TEMA. Para un `clamp()` es su primer argumento
 * —el valor en el ancla de abajo de la banda, o sea a `--fluido-piso` = 375—; y
 * para un nivel invariante es su valor a secas.
 */
function pisoDeclarado(token: string): number {
  const valor = valorDelTema(token)
  const clamp = /^clamp\(\s*([0-9.]+)px\s*,/.exec(valor)
  if (clamp !== null) return Number.parseFloat(clamp[1])
  const px = /^([0-9.]+)px$/.exec(valor)
  if (px !== null) return Number.parseFloat(px[1])
  const rem = /^([0-9.]+)rem$/.exec(valor)
  if (rem !== null) return Number.parseFloat(rem[1]) * 16
  throw new Error(`no sé leer el valor de ${token}: "${valor}"`)
}

/**
 * EL MISMO `clamp()` DEL TEMA, EVALUADO A UN ANCHO CUALQUIERA — **derivado, no
 * medido**, y por eso va etiquetado así donde se imprime.
 *
 * Existe para poner número a lo que D7 costaba: con el viewport de layout en
 * 638 los seis niveles fluidos no se rompían, resolvían **contra 638**, o sea
 * devolvían el tamaño de otro ancho. Ese estado ya no se puede medir en el
 * navegador —la ruta no desborda más—, así que la cifra se deriva de la MISMA
 * declaración que el navegador consume, y se dice que se derivó.
 */
function valorDeLaBanda(token: string, anchoPx: number): number {
  const valor = valorDelTema(token)
  const m = /^clamp\(\s*([0-9.]+)px\s*,\s*([0-9.]+)rem\s*\+\s*([0-9.]+)vw\s*,\s*([0-9.]+)px\s*\)$/.exec(valor)
  if (m === null) return pisoDeclarado(token)
  const [piso, rem, vw, techo] = [1, 2, 3, 4].map((i) => Number.parseFloat(m[i]))
  return Math.min(techo, Math.max(piso, rem * 16 + (vw * anchoPx) / 100))
}

const LECTOR_DE_NIVELES = `[...document.querySelectorAll('[data-muestra]')].map((el) => ({
  nivel: el.dataset.muestra,
  forma: 'titulo',
  fontSizePx: parseFloat(getComputedStyle(el).fontSize),
}))`

/**
 * ⚠️ Las dos formas se leen por atributos DISTINTOS y se comparan sus TEXTOS,
 * no sólo sus conteos: dos renglones que digan lo mismo con la misma caja no
 * son «Title Case y minúscula», son el mismo renglón dos veces. Y las clases
 * también, porque una diferencia de clase metería una segunda causa.
 */
const LECTOR_DE_FORMAS = `(() => {
  const de = (attr) => [...document.querySelectorAll('[' + attr + ']')].map((el) => ({
    nivel: el.getAttribute(attr),
    texto: (el.textContent || '').trim(),
    clases: el.className,
    fontSizePx: parseFloat(getComputedStyle(el).fontSize),
  }))
  return { titulo: de('data-muestra'), minusculas: de('data-muestra-minusculas') }
})()`

interface NivelLeido {
  readonly nivel: string
  readonly forma: string
  readonly fontSizePx: number
}
interface Forma {
  readonly nivel: string
  readonly texto: string
  readonly clases: string
  readonly fontSizePx: number
}
interface Formas {
  readonly titulo: readonly Forma[]
  readonly minusculas: readonly Forma[]
}

/** EL GATE — la receta entera, paso 4 incluido. Si D7 sigue vivo, tira acá. */
async function medirNiveles(
  perfil: Perfil,
): Promise<{ niveles: readonly NivelLeido[]; formas: Formas; innerWidth: number }> {
  return conLaPagina(
    perfil,
    RUTA,
    async ({ pagina, estado }) => {
      await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 800)); return true })()')
      const niveles = await medir<NivelLeido[]>(pagina, LECTOR_DE_NIVELES)
      const formas = await medir<Formas>(pagina, LECTOR_DE_FORMAS)
      return { niveles, formas, innerWidth: estado.innerWidth }
    },
    { antesDelPintado: ANTES, quien: 'b7-c' },
  )
}

async function principal(): Promise<void> {
  const sufijo = process.argv[2] ?? ''
  const p375 = perfilPorId('375')
  const salida: Record<string, unknown> = {}

  console.log('── LA LUPA (sin verificar) ────────────────────────────────────')
  for (const [nombre, ruta] of [
    ['muestra', RUTA],
    ['madre', RUTA_MADRE],
  ] as const) {
    const d = await diagnosticarElDesborde(p375, ruta)
    salida[`desborde-${nombre}`] = { ruta, ...d }
    console.log(
      `${ruta}\n  innerWidth ${d.innerWidth} · outerWidth ${d.outerWidth} · visual ${d.visualWidth} · docWidth ${d.docWidth} · bodyWidth ${d.bodyWidth}`,
    )
    for (const c of d.culpables) {
      console.log(
        `    <${String(c.etiqueta)}${c.muestra === '' ? '' : ` data-muestra="${String(c.muestra)}"`}> ` +
          `derecha ${String(c.derecha)} · ancho ${String(c.ancho)} · scrollW ${String(c.scrollWidth)} · overflow-x ${String(c.overflowX)} · «${String(c.texto)}»`,
      )
    }
  }

  console.log('\n── EL GATE (la receta entera) ─────────────────────────────────')
  try {
    const { niveles, formas, innerWidth } = await medirNiveles(p375)
    const enTitulo = niveles.filter((n) => n.forma === 'titulo')
    const tabla = NIVELES.map((n) => {
      const leido = enTitulo.find((x) => x.nivel === n.nivel)
      const piso = pisoDeclarado(n.token)
      const medido = leido === undefined ? Number.NaN : dos(leido.fontSizePx)
      return {
        ...n,
        pisoDeclarado: piso,
        medidoPx: medido,
        coincide: Math.abs(medido - piso) <= 0.05,
        // [DERIVADO del tema] lo que este nivel valía cuando el viewport de
        // layout era 638 — el costo exacto de D7, nivel por nivel.
        derivadoA638: dos(valorDeLaBanda(n.token, ANCHO_DEL_DESBORDE)),
      }
    })
    salida.gate = { innerWidth, tabla, formas }
    console.log(`  innerWidth ${innerWidth} (se pidió ${p375.ancho})`)
    for (const f of tabla) {
      console.log(
        `  ${f.nivel.padEnd(10)} ${f.token.padEnd(26)} tema ${String(f.pisoDeclarado).padStart(6)} px · medido ${String(f.medidoPx).padStart(6)} px  ${f.coincide ? '✓' : '✗'}` +
          `   · [derivado] a ${ANCHO_DEL_DESBORDE} habría dado ${String(f.derivadoA638).padStart(6)} px`,
      )
    }
    const noCoinciden = tabla.filter((f) => !f.coincide).map((f) => f.nivel)
    console.log(
      noCoinciden.length === 0
        ? `  → los ${tabla.length} niveles resuelven contra 375`
        : `  → NO resuelven contra 375: ${noCoinciden.join(', ')}`,
    )
    // D9 — se derivan los tres hechos, no se escriben: cuántos niveles tienen
    // cada forma, en cuáles las DOS existen, y en cuáles el renglón en
    // minúscula es realmente otro texto con la misma cadena de clases.
    const pares = NIVELES.map((n) => {
      const t = formas.titulo.find((x) => x.nivel === n.nivel)
      const m = formas.minusculas.find((x) => x.nivel === n.nivel)
      return {
        nivel: n.nivel,
        tieneLasDos: t !== undefined && m !== undefined,
        esOtraForma: t !== undefined && m !== undefined && m.texto !== t.texto && m.texto === t.texto.toLowerCase(),
        mismasClases: t !== undefined && m !== undefined && m.clases === t.clases,
      }
    })
    salida.d9 = pares
    console.log(
      `  D9 — Title Case: ${formas.titulo.length} niveles · minúscula: ${formas.minusculas.length} niveles\n` +
        `       con las dos formas: ${pares.filter((p) => p.tieneLasDos).length}/${NIVELES.length} · ` +
        `la segunda es el mismo texto en minúscula: ${pares.filter((p) => p.esOtraForma).length}/${NIVELES.length} · ` +
        `con la misma cadena de clases: ${pares.filter((p) => p.mismasClases).length}/${NIVELES.length}`,
    )
    const incompletos = pares.filter((p) => !(p.tieneLasDos && p.esOtraForma && p.mismasClases)).map((p) => p.nivel)
    console.log(incompletos.length === 0 ? '       → los ocho, completos' : `       → incompletos: ${incompletos.join(', ')}`)
    /**
     * ⚠️ **UN GATE QUE IMPRIME NO ES UN GATE.** Esta corrida salía con código 0
     * pasara lo que pasara: D7 y D9 quedaban cerrados por un reporte legible y
     * no por una comprobación que se rompa sola si alguien devuelve el defecto.
     * `process.exitCode` es lo que convierte al instrumento en algo que un
     * agregado pueda correr. (El script todavía no está en `package.json`, que
     * está fuera de la zona de este frente: el nombre propuesto queda en el
     * reporte del bloque.)
     */
    if (incompletos.length > 0) process.exitCode = 1
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error)
    salida.gate = { error: mensaje }
    console.log(`  ✗ el gate tiró: ${mensaje}`)
    process.exitCode = 1
  }

  console.log(`\n→ ${guardarJson(sufijo === '' ? 'c-tipografia' : `c-tipografia-${sufijo}`, salida)}`)
}

void principal()
