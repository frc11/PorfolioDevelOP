/**
 * B7 · FRENTE C — LAS CUATRO PALANCAS DE `D-B5.1`, CADA UNA CON SU NÚMERO.
 *
 *     npx tsx scripts-b7/c-palancas.ts [antes|despues]
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * La instrucción enumera cuatro palancas —el tamaño del cuerpo, su color, dónde
 * cae respecto de la escena, y su ancho de columna— y pide elegir una. Elegir
 * probando es caro y, peor, deja sin publicar lo que las otras tres habrían
 * dado. Este archivo las evalúa **las cuatro sobre las MISMAS dos capturas** que
 * `c-contraste.ts` ya dejó en `os.tmpdir()`, y publica el techo de cada una.
 *
 * ── Cómo se evalúa una palanca sin tocar el producto ──────────────────────
 *
 * La máscara de glifo sale de la captura con la escena apagada: un píxel es
 * glifo si se aparta del papel. **Esa clasificación no depende del color de la
 * tinta que después se compara**, así que se puede preguntar «¿qué daría este
 * mismo texto, en esta misma posición, con otra tinta?» pasándole a
 * `contrasteBajoElGlifo` —la misma función, el mismo criterio— otro `tintaRgb`.
 * Y «¿qué daría con otro umbral?» pasándole `textoGrande`.
 *
 *   · **TAMAÑO** → el umbral. WCAG baja de 4,5:1 a 3:1 sólo cuando el texto es
 *     grande (24 px, o 18,66 px en negrita). No hay tamaño intermedio que
 *     cambie nada: la razón de contraste no depende del cuerpo. Así que el
 *     techo de esta palanca es «los mismos píxeles, contra 3:1».
 *   · **COLOR** → la tinta. Se prueban las dos direcciones extremas —negro puro
 *     y el papel del sistema— que acotan por arriba cualquier token intermedio.
 *   · **POSICIÓN** y **ANCHO DE COLUMNA** → no se evalúan acá: las contesta
 *     `c-mapa.ts`, que dibuja el fondo entero y muestra dónde hay banda limpia.
 *
 * ⚠️ **Esto NO afirma que ninguna palanca esté aplicada.** Es una cuenta sobre
 * una captura: dice el TECHO de cada palanca, o sea lo mejor que podría dar. Lo
 * que el sitio hace lo sigue midiendo `c-contraste.ts`.
 *
 * ⚠️ **Y no reabre la escena.** Reusa el PNG de la corrida que produjo la tabla
 * que acompaña: con otra captura, de otro instante de una escena que se mueve,
 * los techos no explicarían esas cifras.
 */

import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { contrasteBajoElGlifo, type CajaDeTexto } from '../scripts-b5/glifo'

import { cuatro, dos, guardarJson } from './b7-comun'
import { exigirElSello, type Sello } from './c-sello'

const TEMP = path.join(tmpdir(), 'b7-c-contraste')

interface Palanca {
  readonly id: string
  readonly tinta: readonly [number, number, number]
  readonly textoGrande: boolean
  readonly que: string
}

/** Los cuatro tokens de tinta que el tema declara, más el negro puro que los acota. */
const PALANCAS: readonly Palanca[] = [
  { id: 'hoy', tinta: [17, 17, 17], textoGrande: false, que: 'lo que el sitio hace: --color-tinta #111111 contra AA 4,5:1' },
  { id: 'tamano-grande', tinta: [17, 17, 17], textoGrande: true, que: 'PALANCA TAMAÑO — la misma tinta contra el umbral de texto grande (3:1), que exige 24 px o 18,66 px en negrita' },
  { id: 'tinta-negra', tinta: [0, 0, 0], textoGrande: false, que: 'PALANCA COLOR, hacia abajo — negro puro, que acota por arriba a cualquier tinta más oscura que #111111' },
  { id: 'tinta-papel', tinta: [247, 247, 245], textoGrande: false, que: 'PALANCA COLOR, hacia arriba — el papel del sistema como tinta, o sea el registro invertido' },
  { id: 'tinta-media', tinta: [83, 83, 83], textoGrande: false, que: 'PALANCA COLOR — --color-tinta-media #535353, el token secundario' },
]

interface Entrada {
  readonly id: string
  readonly perfil: string
  readonly tinta: readonly [number, number, number]
  readonly porElemento: readonly {
    readonly indice: number
    readonly rotulo: { readonly tamano?: string; readonly texto?: string }
    readonly caja: CajaDeTexto & { readonly derecha: number }
    readonly pixelesDeGlifo: number
  }[]
}

function principal(): void {
  const sufijo = process.argv[2] ?? 'antes'
  const ruta = `docs/rediseno/outputs/b7/c-contraste-${sufijo}.json`
  const datos = JSON.parse(readFileSync(ruta, 'utf8')) as {
    filas: readonly Entrada[]
    sello?: Sello
  }
  /**
   * ⚠️ **ANTES DE DERIVAR UN SOLO NÚMERO.** Este archivo lee la GEOMETRÍA del
   * JSON versionado y los PÍXELES del `tmpdir`, y los dos tienen que ser de la
   * misma corrida. Sin esta línea publicaba una quimera —caja de una corrida
   * sobre píxeles de otra— sin advertir nada. El número que lo destapó está en
   * `c-sello.ts`.
   */
  exigirElSello(TEMP, datos.sello, `c-palancas ${sufijo}`)

  const salida: Record<string, unknown> = {}
  for (const fila of datos.filas) {
    if (!fila.id.includes('cuerpo')) continue
    const mascara = path.join(TEMP, `${fila.id}-T.png`)
    const fondo = path.join(TEMP, `${fila.id}-A.png`)
    const cajas: CajaDeTexto[] = fila.porElemento
      .filter((e) => e.pixelesDeGlifo > 0)
      .map((e) => ({ x: e.caja.x, y: e.caja.y, ancho: e.caja.ancho, alto: e.caja.alto }))

    console.log(`\n=== ${fila.id} — ${cajas.length} cajas con glifo`)
    const porPalanca = PALANCAS.map((p) => {
      const l = contrasteBajoElGlifo(mascara, fondo, cajas, p.tinta, p.textoGrande)
      const pct = l.pixelesDeGlifo === 0 ? 0 : cuatro((l.bajoAA / l.pixelesDeGlifo) * 100)
      console.log(
        `  ${p.id.padEnd(14)} umbral ${String(l.umbralAA).padStart(3)}:1 · glifo ${l.pixelesDeGlifo} · ` +
          `mediana ${dos(l.medianaContraste)}:1 · peor ${dos(l.peorContraste)}:1 · bajo umbral ${l.bajoAA} (${pct} %)`,
      )
      console.log(`                 ${p.que}`)
      return {
        ...p,
        umbral: l.umbralAA,
        pixelesDeGlifo: l.pixelesDeGlifo,
        medianaContraste: dos(l.medianaContraste),
        peorContraste: dos(l.peorContraste),
        p1Contraste: dos(l.p1Contraste),
        bajoUmbral: l.bajoAA,
        porcientoBajoUmbral: pct,
      }
    })
    salida[fila.id] = { perfil: fila.perfil, cajas: cajas.length, porPalanca }
  }
  console.log(`\n→ ${guardarJson(`c-palancas-${sufijo}`, salida)}`)
}

principal()
