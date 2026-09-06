/**
 * FRENTE B · 4 — LA ESCALA TIPOGRÁFICA RESUELTA en los cuatro perfiles de abajo
 * del umbral.
 *
 * ⚠️ **ESTE SCRIPT NO CORRE, Y ES EL QUE DESTAPÓ EL DEFECTO D7.** Se queda en el
 * repo como evidencia, no como instrumento vigente.
 *
 * Mide sobre `/v3/tipografia/muestra`, y **esa ruta desborda horizontalmente a
 * 375**: viewport de layout 638 px contra una ventana visual de 375. El paso 4
 * de la receta lo frena con «la página no está en condiciones de medirse —
 * innerWidth=638, se pidió 375», que es exactamente su trabajo: los seis niveles
 * fluidos usan `clamp()` con `vw`, así que resolverlos contra 638 devolvería el
 * tamaño de otro ancho.
 *
 * **El instrumento vigente es `b-tipografia-piso.ts`**, que monta las sondas en
 * `/v3` —donde el viewport sí es el pedido— y escribe el mismo
 * `b-tipografia.json`. Ver D7 y D8 en `docs/rediseno/outputs/B4-B-MEDICION.md`.
 *
 * ── Qué se mide y sobre qué ───────────────────────────────────────────────
 *
 * El `font-size` **computado** de los ocho niveles de `_lib/tipografia.ts`, en
 * `/v3/tipografia/muestra`, que emite `data-muestra="<nivel>"` por nivel. Es una
 * ruta de instrumento del propio repo —`robots: noindex`, con fecha de baja
 * escrita en su docblock— y existe exactamente para esto: los seis niveles
 * fluidos usan `clamp()` con `vw`, que se resuelve contra el **viewport**, así
 * que la única forma de ver la banda entera es cambiar el viewport de verdad.
 *
 * ⚠️ **375 es el piso de la banda** (`--fluido-piso`) y **1440 es el techo**
 * (`--fluido-techo`), así que los dos van en la tabla aunque 1440 no sea un
 * perfil de este frente: sin los dos extremos, un `clamp()` no se puede leer.
 * Los cuatro perfiles que la instrucción pide están marcados en el JSON.
 *
 * ── Y el contrachequeo sobre el sitio de verdad ───────────────────────────
 *
 * La muestra prueba que la escala **puede** resolver ocho tamaños distintos. No
 * prueba que `/v3` los use. Por eso este archivo mide también el histograma de
 * `font-size` computados sobre los nodos de texto reales de `/v3`: si un nivel
 * de la tabla no aparece en el histograma, existe en el sistema y no en el
 * sitio.
 */

import { medir } from './navegador'
import { perfilPorId, type Perfil } from './perfiles'
import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'

/** Los cuatro del frente, más los dos extremos de la banda fluida. */
const A_MEDIR: readonly Perfil[] = ['375', '393', '768', '1024', '1440', '1920'].map(perfilPorId)

const NIVELES_ESPERADOS = [
  'micro',
  'caption',
  'cuerpo',
  'base',
  'titulo-s',
  'titulo-m',
  'titulo-l',
  'titulo-xl',
] as const

interface Nivel {
  readonly nivel: string
  readonly fontSizePx: number
  readonly lineHeightPx: number
  readonly letterSpacingPx: number
  readonly familia: string
  readonly peso: string
  readonly clases: string
}

const FUENTE_MUESTRA = `[...document.querySelectorAll('[data-muestra]')].map((el) => {
  const e = getComputedStyle(el)
  return {
    nivel: el.dataset.muestra,
    fontSizePx: parseFloat(e.fontSize),
    lineHeightPx: parseFloat(e.lineHeight),
    letterSpacingPx: e.letterSpacing === 'normal' ? 0 : parseFloat(e.letterSpacing),
    familia: e.fontFamily.split(',')[0].replace(/['"]/g, ''),
    peso: e.fontWeight,
    clases: el.className,
  }
})`

/** El histograma del sitio real: qué tamaños de letra hay de verdad en `/v3`. */
const FUENTE_SITIO = `(() => {
  const cuenta = {}
  for (const el of document.querySelectorAll('*')) {
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
    if (!propio) continue
    const e = getComputedStyle(el)
    if (e.display === 'none' || e.visibility === 'hidden') continue
    const k = String(Math.round(parseFloat(e.fontSize) * 100) / 100)
    cuenta[k] = (cuenta[k] ?? 0) + 1
  }
  return Object.keys(cuenta).map((k) => ({ px: Number(k), elementos: cuenta[k] })).sort((a, b) => a.px - b.px)
})()`

interface Salto {
  readonly de: string
  readonly a: string
  readonly saltoPx: number
  readonly razon: number
  readonly colapsado: boolean
}

/** ⚠️ Dos niveles consecutivos que resuelven al MISMO px son una escala colapsada ahí. */
function saltos(niveles: readonly Nivel[]): readonly Salto[] {
  const orden = NIVELES_ESPERADOS.map((n) => niveles.find((x) => x.nivel === n)).filter(
    (n): n is Nivel => n !== undefined,
  )
  const out: Salto[] = []
  for (let i = 1; i < orden.length; i += 1) {
    const salto = orden[i].fontSizePx - orden[i - 1].fontSizePx
    out.push({
      de: orden[i - 1].nivel,
      a: orden[i].nivel,
      saltoPx: dos(salto),
      razon: dos(orden[i].fontSizePx / orden[i - 1].fontSizePx),
      colapsado: Math.abs(salto) < 0.01,
    })
  }
  return out
}

async function principal(): Promise<void> {
  const filas: {
    readonly perfil: string
    readonly ancho: number
    readonly delFrente: boolean
    readonly niveles: readonly Nivel[]
    readonly saltos: readonly Salto[]
    readonly histogramaDelSitio: readonly { readonly px: number; readonly elementos: number }[]
  }[] = []

  for (const perfil of A_MEDIR) {
    const niveles = await conLaPagina(perfil, '/v3/tipografia/muestra', async ({ pagina }) =>
      medir<Nivel[]>(pagina, FUENTE_MUESTRA),
    )
    const vistos = niveles.map((n) => n.nivel)
    for (const n of NIVELES_ESPERADOS) {
      if (!vistos.includes(n)) throw new Error(`falta el nivel "${n}" a ${perfil.id}: se vieron ${vistos.join(', ')}`)
    }
    const histograma = await conLaPagina(perfil, '/v3', async ({ pagina }) =>
      medir<{ px: number; elementos: number }[]>(pagina, FUENTE_SITIO),
    )
    filas.push({
      perfil: perfil.id,
      ancho: perfil.ancho,
      delFrente: perfil.debajoDelUmbral,
      niveles: niveles.map((n) => ({ ...n, fontSizePx: dos(n.fontSizePx), lineHeightPx: dos(n.lineHeightPx), letterSpacingPx: dos(n.letterSpacingPx) })),
      saltos: saltos(niveles),
      histogramaDelSitio: histograma,
    })
    console.log(
      `${perfil.id.padEnd(5)} ` +
        NIVELES_ESPERADOS.map((n) => {
          const x = niveles.find((y) => y.nivel === n)
          return `${n}=${x === undefined ? '?' : dos(x.fontSizePx)}`
        }).join('  '),
    )
  }

  console.log('\n── saltos entre niveles consecutivos, a 375 (el piso de la banda) ──')
  const en375 = filas.find((f) => f.perfil === '375')
  if (en375 !== undefined) {
    for (const s of en375.saltos) {
      console.log(
        `  ${s.de} → ${s.a}: ${s.saltoPx >= 0 ? '+' : ''}${s.saltoPx} px (×${s.razon})${s.colapsado ? '  ⚠️ COLAPSADO' : ''}`,
      )
    }
  }

  const ruta = guardarJson('tipografia', {
    procedencia: procedencia(
      'scripts-b4/b-tipografia.ts',
      'font-size computado de [data-muestra] en /v3/tipografia/muestra, más el histograma de tamaños reales de /v3. Sin estrangular. Emulado: el viewport es un override de layout, no un teléfono; la NITIDEZ del glifo no se mide (dpr fijo en 1).',
    ),
    banda: { piso: 375, techo: 1440, nota: '`--fluido-piso` y `--fluido-techo`; los seis niveles fluidos son clamp() contra vw.' },
    nivelesEsperados: NIVELES_ESPERADOS,
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
