/**
 * B7 · FASE 0 — ¿SE REPRODUCEN HOY?
 *
 *     npx tsx scripts-b7/f0-reproduccion.ts
 *
 * El bloque hereda defectos anotados por B1, B2, B4-A, B4-B y B5. Entre el más
 * viejo y hoy pasó B5, que tocó el scroll, la escena y el cursor. **Un defecto
 * que ya no se reproduce no se arregla: se cierra con la medición que lo
 * desmiente**, y para eso hace falta volver a medirlos todos antes de repartir
 * trabajo.
 *
 * ── Lo que este archivo NO hace ───────────────────────────────────────────
 *
 * No arregla nada y no toca un archivo de producto. Es el equivalente de la
 * Fase 0 de B4-B: mide, escribe el JSON y calla.
 *
 * ── ⚠️ LA PREFERENCIA VIENE DEL ENTORNO ───────────────────────────────────
 *
 * `conLaPagina` la baja por `Emulation.setEmulatedMedia` y `b7-comun` verifica
 * con `matchMedia` que llegó al documento. Ningún render la fuerza. Es la regla
 * «verde por arnés» aplicada desde el primer minuto del bloque.
 *
 * ── ⚠️ Y LAS DEFINICIONES SON LAS HEREDADAS, LITERALES ────────────────────
 *
 * La cuenta de transformadas **acumula sobre un barrido de media pantalla**,
 * que es lo que hace `scripts-b4/c-reducido-discriminador.ts`. Una foto en
 * `scrollY = 0` da 70 donde aquél publicó 2.380: no es una discrepancia, son
 * dos definiciones. Comparar contra la cifra heredada exige la definición
 * heredada.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, dos, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import { CENSO_BARRIDO, type CensoBarrido } from './lectores'
import {
  CENSO_DE_STICKIES,
  CENSO_DE_TOQUE,
  LECTURA_DE_DESBORDE,
  LECTURA_DE_PEGADO,
  LECTURA_DEL_TITULAR,
  type FichaDeSticky,
  type ObjetivoDeToque,
} from './lectores-layout'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]

/** El paso del barrido de pines. 120 px es el de `b-pines.json`, para comparar. */
const PASO_DEL_BARRIDO = 120

interface ParadaDePegado {
  readonly top: number
  readonly pegado: boolean
}

interface BarridoDeSticky {
  readonly ficha: FichaDeSticky
  readonly paradasPegado: number
  readonly recorridoRealPx: number
}

/**
 * D1 · `prefers-reduced-motion` — el mismo barrido con y sin la preferencia.
 *
 * La cifra que decide es la comparación, no cada mitad: 2.380 contra 2.380 es
 * el defecto; 2.380 contra 0 es el arreglo. Y el barrido trae el CONTENIDO al
 * lado, porque «cero transformadas» con la página apagada no es el arreglo.
 */
async function barridoDeMovimiento(idPerfil: string, reducido: boolean): Promise<CensoBarrido> {
  const perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 4000)); return true })()')
      return medir<CensoBarrido>(pagina, CENSO_BARRIDO)
    },
    { antesDelPintado: ANTES, movimientoReducido: reducido, quien: 'b7-reducido' },
  )
}

/**
 * D2 y D3 · los pines, con el barrido real y **el padre al lado del hijo**.
 *
 * B4-B midió la posición del hijo y publicó cero. Este censo publica además
 * `recorridoDisponible`, que es lo que discrimina «está roto» de «nunca tuvo
 * recorrido»: un `sticky` que llena a su contenedor da cero en las dos
 * mediciones y sólo la segunda dice por qué.
 */
async function barridoDePines(idPerfil: string): Promise<{
  readonly stickies: readonly BarridoDeSticky[]
  readonly paradas: number
  readonly documento: number
}> {
  const perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      const fichas = await medir<readonly FichaDeSticky[]>(pagina, CENSO_DE_STICKIES)
      const documento = await medir<number>(pagina, 'document.documentElement.scrollHeight')
      const pegado = fichas.map(() => 0)
      const primera = fichas.map<number | null>(() => null)
      const ultima = fichas.map<number | null>(() => null)
      let paradas = 0
      for (let y = 0; y + perfil.alto <= documento; y += PASO_DEL_BARRIDO) {
        const yReal = await scrollA(pagina, y)
        const lectura = await medir<readonly ParadaDePegado[]>(pagina, LECTURA_DE_PEGADO)
        paradas += 1
        for (let i = 0; i < lectura.length && i < pegado.length; i += 1) {
          if (lectura[i].pegado) {
            pegado[i] += 1
            if (primera[i] === null) primera[i] = yReal
            ultima[i] = yReal
          }
        }
      }
      await scrollA(pagina, 0)
      return {
        documento,
        paradas,
        stickies: fichas.map((ficha, i) => ({
          ficha,
          paradasPegado: pegado[i],
          recorridoRealPx:
            primera[i] === null || ultima[i] === null ? 0 : (ultima[i] as number) - (primera[i] as number),
        })),
      }
    },
    { antesDelPintado: ANTES, quien: 'b7-pines' },
  )
}

/**
 * D6 · las áreas de toque contra los 24 × 24 px de WCAG 2.5.8.
 *
 * ⚠️ Se mide **con el scroll en la sección**, no en `scrollY = 0`: los enlaces
 * de proyecto viven adentro de un plano que la coreografía escala, y
 * `getBoundingClientRect` devuelve la caja TRANSFORMADA. Medidos desde arriba
 * dan 11,99 × 3,75 px; en su reposo, otra cifra. Las dos son ciertas y sólo una
 * describe lo que una persona toca.
 */
async function censoDeToque(
  idPerfil: string,
  scrollY: number,
): Promise<{ readonly total: number; readonly bajoVeinticuatro: readonly ObjetivoDeToque[] }> {
  const perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await scrollA(pagina, scrollY)
      await esperarElPrimerCuadro(pagina, 600)
      const todos = await medir<readonly ObjetivoDeToque[]>(pagina, CENSO_DE_TOQUE)
      return { total: todos.length, bajoVeinticuatro: todos.filter((o) => o.ancho < 24 || o.alto < 24) }
    },
    { antesDelPintado: ANTES, quien: 'b7-toque' },
  )
}

/**
 * D7 · el desborde de `/v3/tipografia/muestra` a 375. Con dos rutas de control.
 *
 * ⚠️ **La verificación de la receta FALLA en la ruta rota, y eso ES la
 * medición.** `verificarLaPagina` tira porque `innerWidth` devuelve 638 cuando
 * se pidieron 375 — que es exactamente la firma del desborde. Se atrapa y se
 * publica el texto del error en vez de dejar que corte la corrida.
 */
async function desbordes(): Promise<readonly unknown[]> {
  const perfil = perfilPorId('375')
  const filas: unknown[] = []
  for (const ruta of ['/v3', '/v3/tipografia', '/v3/tipografia/muestra']) {
    try {
      const lectura = await conLaPagina(
        perfil,
        ruta,
        async ({ pagina }) => {
          await esperarElPrimerCuadro(pagina)
          return medir<Record<string, number | null>>(pagina, LECTURA_DE_DESBORDE)
        },
        { antesDelPintado: ANTES, quien: 'b7-desborde' },
      )
      filas.push({ ruta, ...lectura, desborda: (lectura.scrollWidth ?? 0) > perfil.ancho })
    } catch (error) {
      filas.push({ ruta, desborda: true, laRecetaTiro: error instanceof Error ? error.message : String(error) })
    }
  }
  return filas
}

/** D-B5.2 · el `<h1>` que cambia de identidad. Se mide el DOM hidratado. */
async function titular(idPerfil: string): Promise<unknown> {
  const perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      return medir<unknown>(pagina, LECTURA_DEL_TITULAR)
    },
    { antesDelPintado: ANTES, quien: 'b7-titular' },
  )
}

async function principal(): Promise<void> {
  const salida: Record<string, unknown> = {}

  console.log('· D1 — el barrido de movimiento a 1920, SIN la preferencia')
  const sin = await barridoDeMovimiento('1920', false)
  console.log('· D1 — el mismo barrido CON la preferencia emulada')
  const con = await barridoDeMovimiento('1920', true)
  salida.d1 = {
    sinLaPreferencia: sin,
    conLaPreferencia: con,
    identicas: sin.conTransform === con.conTransform,
    veredicto:
      sin.conTransform === con.conTransform
        ? 'SE REPRODUCE — el sitio ignora la preferencia'
        : 'NO se reproduce con esta medición',
  }
  console.log(
    `  transformadas acumuladas: ${sin.conTransform} sin · ${con.conTransform} con · piezas ${sin.piezasDeLineas}/${con.piezasDeLineas} · matchMedia ${con.matchMedia}`,
  )
  console.log(
    `  contenido: visibles ${sin.caracteresVisibles}/${con.caracteresVisibles} · invisibles ${sin.caracteresInvisibles}/${con.caracteresInvisibles} en ${sin.nodosInvisibles}/${con.nodosInvisibles} nodos`,
  )

  for (const idPerfil of ['1920', '1024']) {
    console.log(`· D2/D3 — el barrido de pines a ${idPerfil}`)
    const barrido = await barridoDePines(idPerfil)
    salida[`pines${idPerfil}`] = barrido
    for (const s of barrido.stickies) {
      console.log(
        `  ${s.ficha.huella.slice(0, 78)}\n     alto ${s.ficha.altoPropio} · padre ${s.ficha.altoDelPadre} · recorrido disponible ${s.ficha.recorridoDisponible} → pegado en ${s.paradasPegado}/${barrido.paradas} paradas (${dos(s.recorridoRealPx)} px)`,
      )
    }
  }

  for (const [idPerfil, y] of [
    ['1920', 0],
    ['1920', 9720],
    ['375', 0],
  ] as const) {
    console.log(`· D6 — las áreas de toque a ${idPerfil}, scrollY ${y}`)
    const toque = await censoDeToque(idPerfil, y)
    salida[`toque${idPerfil}y${y}`] = toque
    console.log(`  ${toque.bajoVeinticuatro.length} de ${toque.total} bajo 24 px`)
    for (const o of toque.bajoVeinticuatro) console.log(`    ${o.ancho}×${o.alto} — «${o.texto}»`)
  }

  console.log('· D7 — el desborde a 375')
  const d7 = await desbordes()
  salida.desbordes375 = d7
  for (const f of d7 as readonly Record<string, unknown>[]) {
    console.log(`  ${f.ruta}: innerWidth ${f.innerWidth ?? '(tiró)'} · scrollWidth ${f.scrollWidth ?? '—'} · desborda ${f.desborda}`)
  }

  console.log('· D-B5.2 — el titular a 1920')
  const t = await titular('1920')
  salida.titular1920 = t
  console.log(`  ${JSON.stringify(t)}`)

  console.log(`\n→ ${guardarJson('f0-reproduccion', salida)}`)
}

void principal()
