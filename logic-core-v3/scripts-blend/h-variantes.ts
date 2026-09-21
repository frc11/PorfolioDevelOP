/**
 * H — LAS CUATRO VARIANTES, EN LAS DOS PARADAS, CON SU CIFRA Y SU CAPTURA.
 *
 *     npx tsx scripts-blend/h-variantes.ts [--ancho=768|375|todos]
 *
 * ── Las dos paradas, y por que la segunda es la que mata ──────────────────
 *
 *   · **CRUCE** — la da el pedido (768 en 1262, 375 en 848) y es donde la bajada
 *     queda sobre la masa del logo. Ahi se mide si el tratamiento SIRVE.
 *   · **LIMPIO** — el mismo texto sobre papel sin logo detras. Ahi se mide si el
 *     tratamiento deja MARCA donde no deberia, que es la pregunta que hunde a V4
 *     y a V5.
 *
 * ⚠️ **LA PARADA LIMPIA NO EXISTE COMO POSICION DE SCROLL, Y ESO SE MIDIO.** El
 * pedido la describe como «una parada donde el mismo texto esta sobre papel sin
 * logo detras». Se barrio la ventana entera en la que la bajada entra COMPLETA en
 * cuadro —a 768 son los scrolls 1057 a 1467, y afuera de ahi el parrafo ya no
 * entra— y en las tres paradas validas el logo le queda detras cubriendo entre el
 * 75,1 % y el 98,8 % del rect. La mas «limpia» es el cruce mismo. O sea: a este
 * ancho el texto NUNCA esta sobre papel desnudo.
 *
 * Asi que LIMPIO se construye con la primitiva que el banco ya tiene: **la escena
 * apagada**, en la misma parada del cruce. Es exactamente la condicion que el
 * pedido pide —papel sin logo detras— y es mas limpia que cualquier scroll:
 * el fondo es el token `--color-fondo` exacto, sin una sola mota. El barrido se
 * conserva en la salida como la evidencia de por que hubo que hacerlo asi.
 *
 * ── La geometria de las burbujas, derivada y no tanteada ──────────────────
 *
 * Una elipse que tiene que cubrir las CUATRO ESQUINAS de un rectangulo ancho es
 * mucho mas grande que el rectangulo, y eso no es un detalle de gusto: es lo que
 * decide si la nube tapa el texto entero o le deja las puntas afuera.
 *
 * Con `ellipse farthest-side` los radios son la mitad del ancho y del alto de la
 * caja de la capa; el punto (x, y) medido desde el centro y normalizado cae en la
 * parada `t` del degradado con `t^2 = (x/rx)^2 + (y/ry)^2`. Si la caja de la capa
 * es `k` veces la del texto en cada eje, la esquina del texto cae en
 * `t^2 = (1/kx)^2 + (1/ky)^2`, y para que quede en la zona OPACA hace falta
 * `t <= s`, con `s` la parada donde el degradado deja de ser solido.
 *
 * Con `s = 0,78` (0,6084):
 *
 *   · **V5a**, una burbuja por bloque: `kx = ky = 1,9` da 0,277 + 0,277 = 0,554
 *     <= 0,6084 ✓. Con `k = 2` daria 0,5 y tambien, pero con `k = 1,8`
 *     (0,617) **no**: las esquinas del parrafo caerian en el degradado.
 *   · **V5b**, una por renglon: el alto ya no es el problema, asi que
 *     `ky = 3,0` (0,111) y el ancho se acota con `kx = 1,45` (0,476) — suma
 *     0,587 <= 0,6084 ✓.
 *
 * O sea: la nube del bloque mide **1,9 veces el texto en los dos ejes** y la del
 * renglon **1,45 de ancho**. Eso es «margen generoso» con un numero atras, y es
 * tambien el costo de la variante: hay que pintar mucho mas papel del que el
 * texto ocupa.
 *
 * ── Lo que NO se mide, y por que ───────────────────────────────────────────
 *
 * El titular. A 768 y 375 no cruza el logo: VIDRIO lo barrio y dio 17,60:1 —el
 * contraste del papel limpio— en ocho de nueve paradas. Medirlo agregaria una
 * columna de ruido.
 */

import { cajaYTinta, ocultarPorSelector } from '../scripts-b5/pagina'
import { medir } from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'
import type { Imagen, Mascara } from '../scripts-b8/glifo-alfa'

import { argumento, asentarElHome, conLaPagina, guardarJson, type Sesion } from './blend-comun'
import {
  ASENTAMIENTO_MS,
  BAJADA,
  CRUCE,
  DESTRABAR,
  ESCENA,
  LECTOR_DE_CAJAS,
  PERFILES,
  PONER_EL_BLEND,
  PONER_LAS_CAPAS,
  SACAR_LAS_CAPAS,
  aPixeles,
  apagarElOverlayDeDev,
  asegurarCarpetas,
  blendDerivado,
  blendPintado,
  conTintaFija,
  entregar,
  esperar,
  foto,
  fotoDeLaMascara,
  fotoDelFondo,
  inflar,
  marcaEnElRect,
  mascara,
  planicie,
  scrollA,
  unir,
  verificarElDestrabe,
  zonaMuerta,
  type CajasDelTexto,
  type Lectura,
  type Marca,
  type Puesto,
  type Rect,
} from './f-comun'

/** La parada del degradado donde deja de ser solido, y los factores derivados arriba. */
const SOLIDO_HASTA = 78
const K_DEL_BLOQUE = 1.9
const K_ANCHO_DEL_RENGLON = 1.45
const K_ALTO_DEL_RENGLON = 3.0

/** Los brillos que se barren en el cruce. El 2,2 es el que el pedido nombra. */
const BRILLOS: readonly number[] = [2.2, 4, 8]

/** Las opacidades que se prueban si la nube deja marca sobre el papel. */
const OPACIDADES: readonly number[] = [1, 0.9, 0.8, 0.6, 0.4]

/** Cuantas paradas se prueban al buscar el LIMPIO. */
const PASOS_DEL_BARRIDO = 10

const papel = (alfa: number): string => `color-mix(in srgb, var(--color-fondo) ${Math.round(alfa * 100)}%, transparent)`

function nubeCss(alfa: number): string {
  const centro = papel(alfa)
  const borde = papel(0)
  return `background-image: radial-gradient(ellipse farthest-side at 50% 50%, ${centro} 0%, ${centro} ${SOLIDO_HASTA}%, ${borde} 100%);`
}

const brilloCss = (k: number): string => `backdrop-filter: brightness(${k}); -webkit-backdrop-filter: brightness(${k});`

interface Parada {
  readonly nombre: 'cruce' | 'limpio'
  readonly scrollY: number
  readonly planicieDelRect: { readonly medio: number; readonly minimo: number; readonly pctOscuro: number }
}

interface Pose {
  readonly cajas: CajasDelTexto
  readonly rectDelBloque: Rect
  readonly rectDeLaNube: Rect
  readonly rectsDeLosRenglones: readonly Rect[]
  readonly T: Imagen
  readonly A0: Imagen
  readonly m: Mascara
  readonly tinta: readonly [number, number, number]
}

/**
 * Deja la pagina en una parada y devuelve todo lo que no depende del tratamiento.
 *
 * Con `escenaApagada` la captura T no vuelve a apagar la escena —ya esta apagada
 * y volver a prenderla rompería la pose—, asi que la mascara sale de una foto
 * derecha. Es la misma imagen: T es «el texto sobre papel plano» y con la escena
 * apagada eso es lo que hay.
 */
async function posar(s: Sesion, y: number, etiqueta: string, escenaApagada = false): Promise<Pose> {
  await scrollA(s.pagina, y)
  await esperar(1100)
  const cajas = await medir<CajasDelTexto>(s.pagina, LECTOR_DE_CAJAS)
  if (cajas.bloque === null || cajas.renglones.length === 0) throw new Error('no se leyo la caja de la bajada')
  const texto = await cajaYTinta(s.pagina, BAJADA)
  if (texto.cajas.length === 0) throw new Error('la bajada no devolvio caja de texto')
  const T = escenaApagada ? await foto(s.pagina, `h-${etiqueta}-t`) : await fotoDeLaMascara(s.pagina, `h-${etiqueta}-t`)
  const A0 = await fotoDelFondo(s.pagina, `h-${etiqueta}-a0`)
  return {
    cajas,
    rectDelBloque: aPixeles(cajas.bloque),
    rectDeLaNube: aPixeles(inflar(cajas.bloque, K_DEL_BLOQUE, K_DEL_BLOQUE)),
    rectsDeLosRenglones: cajas.renglones.map((r) => aPixeles(inflar(r, K_ANCHO_DEL_RENGLON, K_ALTO_DEL_RENGLON))),
    T,
    A0,
    m: mascara(T, texto.cajas),
    tinta: [texto.tinta[0], texto.tinta[1], texto.tinta[2]],
  }
}

interface FilaDeVariante {
  readonly variante: string
  readonly detalle: string
  readonly lectura: Lectura
  readonly marca: Marca | null
}

function linea(f: FilaDeVariante): string {
  const l = f.lectura
  const m = f.marca
  const marca = m === null ? '' : `  | marca max ${m.maximo} borde ${m.enElBorde} deriva ${m.derivaAfuera} (${m.deja ? 'DEJA' : 'no deja'})`
  return `    ${f.variante.padEnd(12)} ${String(l.bajoAA).padStart(6)}/${l.pixeles}  ${String(l.bajoAAPct).padStart(6)}%  peor ${String(l.peor).padStart(5)}  mediana ${String(l.mediana).padStart(6)}${marca}  ${f.detalle}`
}

/** Pone un tratamiento, fotografia el compuesto y el fondo, lo saca, y devuelve las dos cifras. */
async function conTratamiento(
  s: Sesion,
  pose: Pose,
  rects: readonly Rect[],
  css: string,
  etiqueta: string,
  rectDeLaMarca: Rect,
): Promise<{ readonly lectura: Lectura; readonly marca: Marca; readonly puesto: Puesto; readonly compuesto: string }> {
  // ⚠️ EL CONTROL SE TOMA APAREADO, no una vez por parada. La pastilla de
  // navegacion aparece y desaparece sola, y comparar contra un control viejo le
  // atribuia 224 niveles de marca a la nube (`Marca.derivaAfuera` es el centinela).
  const antes = await fotoDelFondo(s.pagina, `h-${etiqueta}-antes`)
  const puesto = await medir<Puesto>(s.pagina, PONER_LAS_CAPAS(rects, css))
  if (!puesto.tomo) throw new Error(`la capa de ${etiqueta} no tomo: ${puesto.porque}`)
  const compuesto = `h-${etiqueta}`
  await foto(s.pagina, compuesto)
  const A = await fotoDelFondo(s.pagina, `h-${etiqueta}-a`)
  await medir<Puesto>(s.pagina, SACAR_LAS_CAPAS)
  await esperar(240)
  return {
    lectura: conTintaFija(pose.m, A, pose.tinta),
    marca: marcaEnElRect(antes, A, rectDeLaMarca),
    puesto,
    compuesto,
  }
}

async function conElAncho(perfil: Perfil): Promise<Record<string, unknown>> {
  const yDelCruce = CRUCE[perfil.id]
  return conLaPagina(
    perfil,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      await apagarElOverlayDeDev(s.pagina)

      // ── 1 · las dos paradas ─────────────────────────────────────────────
      const enElCruce = await posar(s, yDelCruce, `${perfil.id}-cruce`)
      const cruce: Parada = {
        nombre: 'cruce',
        scrollY: yDelCruce,
        planicieDelRect: planicie(enElCruce.A0, enElCruce.rectDeLaNube),
      }
      console.log(`\n  === ${perfil.id} | CRUCE en ${yDelCruce}`)
      console.log(`      caja del bloque ${JSON.stringify(enElCruce.rectDelBloque)} | ${enElCruce.cajas.renglones.length} renglones | ${enElCruce.m.indices.length} px de glifo`)
      console.log(`      fondo bajo la nube: medio ${cruce.planicieDelRect.medio} | minimo ${cruce.planicieDelRect.minimo} | ${cruce.planicieDelRect.pctOscuro}% abajo de 230`)

      // El barrido: la parada mas plana con la caja del texto entera en cuadro.
      const alto = enElCruce.cajas.ventana.alto
      const desde = Math.max(0, yDelCruce - alto)
      const hasta = yDelCruce + alto
      const candidatas: { y: number; pctOscuro: number; medio: number; dentro: boolean }[] = []
      console.log(`      barriendo ${desde}..${hasta} en ${PASOS_DEL_BARRIDO + 1} paradas`)
      for (let i = 0; i <= PASOS_DEL_BARRIDO; i += 1) {
        const y = Math.round(desde + ((hasta - desde) * i) / PASOS_DEL_BARRIDO)
        await scrollA(s.pagina, y)
        await esperar(800)
        const cajas = await medir<CajasDelTexto>(s.pagina, LECTOR_DE_CAJAS)
        if (cajas.bloque === null) continue
        const nube = aPixeles(inflar(cajas.bloque, K_DEL_BLOQUE, K_DEL_BLOQUE))
        const dentro = cajas.bloque.y > 80 && cajas.bloque.y + cajas.bloque.alto < cajas.ventana.alto - 80
        const A = await fotoDelFondo(s.pagina, `h-${perfil.id}-barrido`)
        const p = planicie(A, nube)
        candidatas.push({ y, pctOscuro: p.pctOscuro, medio: p.medio, dentro })
        console.log(`        y=${String(y).padStart(5)}  ${dentro ? 'vale ' : 'fuera'}  fondo medio ${String(p.medio).padStart(6)}  ${String(p.pctOscuro).padStart(6)}% oscuro`)
      }
      const validas = candidatas.filter((c) => c.dentro)
      if (validas.length === 0) throw new Error('ninguna parada dejo la bajada entera en cuadro')
      const mejor = validas.reduce((a, b) => (b.pctOscuro < a.pctOscuro ? b : a))
      console.log(`      la parada mas plana con la bajada ENTERA en cuadro es ${mejor.y}, y todavia tiene el ${mejor.pctOscuro}% del rect abajo de 230.`)
      console.log('      No hay papel desnudo a este ancho: LIMPIO se arma apagando la escena, en la parada del cruce.')

      // LIMPIO = la misma parada del cruce con la escena apagada. Ver el docblock.
      if (!(await ocultarPorSelector(s.pagina, ESCENA, true))) throw new Error('no se pudo apagar la escena')
      const enLimpio = await posar(s, yDelCruce, `${perfil.id}-limpio`, true)
      const limpio: Parada = {
        nombre: 'limpio',
        scrollY: yDelCruce,
        planicieDelRect: planicie(enLimpio.A0, enLimpio.rectDeLaNube),
      }
      if (!(await ocultarPorSelector(s.pagina, ESCENA, false))) throw new Error('no se pudo volver a prender la escena')
      console.log(`      LIMPIO (escena apagada): fondo medio ${limpio.planicieDelRect.medio} | minimo ${limpio.planicieDelRect.minimo} | ${limpio.planicieDelRect.pctOscuro}% oscuro`)

      // ── 2 · las variantes, parada por parada ────────────────────────────
      const salida: Record<string, unknown> = {
        ancho: perfil.id,
        paradas: { cruce, limpio },
        laParadaLimpiaNoExisteComoScroll: { masPlanaValida: mejor, validas: validas.length },
        barrido: candidatas,
        geometria: { solidoHasta: SOLIDO_HASTA, kBloque: K_DEL_BLOQUE, kAnchoRenglon: K_ANCHO_DEL_RENGLON, kAltoRenglon: K_ALTO_DEL_RENGLON },
        porParada: {} as Record<string, unknown>,
      }
      const porParada = salida.porParada as Record<string, unknown>

      for (const [parada, pose] of [
        ['cruce', enElCruce],
        ['limpio', enLimpio],
      ] as const) {
        const y = parada === 'cruce' ? cruce.scrollY : limpio.scrollY
        await scrollA(s.pagina, y)
        // La parada limpia es la del cruce con la escena apagada: el papel desnudo no existe como scroll.
        if (!(await ocultarPorSelector(s.pagina, ESCENA, parada === 'limpio'))) throw new Error('no se pudo poner el estado de la escena')
        await esperar(1100)
        console.log(`\n    --- ${perfil.id} | ${parada.toUpperCase()} (scroll ${y})`)
        const filas: FilaDeVariante[] = []
        const marcarLaEntrega = (temporal: string, variante: string): void => entregar(temporal, `${variante}-${perfil.id}-${parada}`)

        // V0 · el control: la tinta de hoy sobre el fondo de hoy.
        await foto(s.pagina, `h-${perfil.id}-${parada}-v0`)
        marcarLaEntrega(`h-${perfil.id}-${parada}-v0`, 'v0')
        const v0 = conTintaFija(pose.m, pose.A0, pose.tinta)
        const zm = zonaMuerta(pose.m, pose.A0)
        filas.push({ variante: 'V0 tinta', detalle: `zona muerta AA ${zm.pctAA}% | nucleo ${zm.pctNucleo}% | fondo mediano ${zm.fondoMediano}`, lectura: v0, marca: null })

        // V3 · el blend. Dos columnas: el arbol de hoy y la cadena destrabada.
        const blendHoyPuesto = await medir<Puesto>(s.pagina, PONER_EL_BLEND(true))
        await foto(s.pagina, `h-${perfil.id}-${parada}-v3cortado`)
        marcarLaEntrega(`h-${perfil.id}-${parada}-v3cortado`, 'v3-cortado')
        const Bhoy = await foto(s.pagina, `h-${perfil.id}-${parada}-bhoy`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(false))
        const v3Hoy = blendPintado(pose.m, pose.A0, Bhoy)

        const destrabe = await medir<Puesto>(s.pagina, DESTRABAR(true))
        const Ad = await fotoDelFondo(s.pagina, `h-${perfil.id}-${parada}-ad`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(true))
        await foto(s.pagina, `h-${perfil.id}-${parada}-v3`)
        marcarLaEntrega(`h-${perfil.id}-${parada}-v3`, 'v3')
        const Bd = await foto(s.pagina, `h-${perfil.id}-${parada}-bd`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(false))
        const v3Pintado = blendPintado(pose.m, Ad, Bd)
        const v3Derivado = blendDerivado(pose.m, pose.A0)
        const vuelta = await medir<Puesto>(s.pagina, DESTRABAR(false))
        if (!vuelta.tomo) throw new Error(`el destrabe no volvio: ${vuelta.porque}`)
        await esperar(400)

        filas.push({ variante: 'V3 cortado', detalle: `lo que el arbol de hoy pinta | coincidencia ${v3Hoy.coincidencia}%`, lectura: v3Hoy, marca: null })
        filas.push({ variante: 'V3 pintado', detalle: `cadena destrabada | coincidencia ${v3Pintado.coincidencia}% | derivado ${v3Derivado.bajoAAPct}%`, lectura: v3Pintado, marca: null })

        // V4 · el backdrop. Barrido de brillos en el cruce, uno solo en limpio.
        const brillos = parada === 'cruce' ? BRILLOS : [BRILLOS[0]]
        for (const k of brillos) {
          const r = await conTratamiento(s, pose, [pose.rectDelBloque], brilloCss(k), `${perfil.id}-${parada}-v4-${k}`, pose.rectDelBloque)
          if (k === BRILLOS[0]) marcarLaEntrega(r.compuesto, 'v4')
          filas.push({ variante: `V4 x${k}`, detalle: `rect del bloque ${pose.rectDelBloque.ancho}x${pose.rectDelBloque.alto}`, lectura: r.lectura, marca: r.marca })
        }

        // V5a · una burbuja por bloque. V5b · una por renglon. Con barrido de opacidad si deja marca.
        for (const forma of ['v5a', 'v5b'] as const) {
          const rects = forma === 'v5a' ? [pose.rectDeLaNube] : pose.rectsDeLosRenglones
          const rectDeLaMarca = unir(rects)
          let elegida: { alfa: number; lectura: Lectura; marca: Marca; compuesto: string } | null = null
          for (const alfa of OPACIDADES) {
            const r = await conTratamiento(s, pose, rects, nubeCss(alfa), `${perfil.id}-${parada}-${forma}-${Math.round(alfa * 100)}`, rectDeLaMarca)
            const detalle =
              forma === 'v5a'
                ? `1 nube de ${pose.rectDeLaNube.ancho}x${pose.rectDeLaNube.alto}`
                : `${rects.length} nubes de ${rects[0].ancho}x${rects[0].alto}`
            filas.push({ variante: `${forma.toUpperCase()} a${alfa}`, detalle, lectura: r.lectura, marca: r.marca })
            if (elegida === null) elegida = { alfa, lectura: r.lectura, marca: r.marca, compuesto: r.compuesto }
            // La primera que no deja marca es la que se entrega; si la de alfa 1 ya no deja, se corta.
            if (!r.marca.deja) {
              elegida = { alfa, lectura: r.lectura, marca: r.marca, compuesto: r.compuesto }
              break
            }
          }
          if (elegida !== null) marcarLaEntrega(elegida.compuesto, forma)
        }

        for (const f of filas) console.log(linea(f))
        porParada[parada] = {
          scrollY: y,
          rectDelBloque: pose.rectDelBloque,
          rectDeLaNube: pose.rectDeLaNube,
          renglones: pose.rectsDeLosRenglones.length,
          pixelesDeGlifo: pose.m.indices.length,
          tinta: pose.tinta,
          zonaMuerta: zm,
          blendPuesto: blendHoyPuesto.tomo,
          destrabeTomo: destrabe.tomo,
          derivadoDelBlend: v3Derivado,
          filas,
        }
      }
      if (!(await ocultarPorSelector(s.pagina, ESCENA, false))) throw new Error('la escena quedo apagada')
      return salida
    },
    { quien: 'blend2' },
  )
}

async function principal(): Promise<void> {
  verificarElDestrabe()
  asegurarCarpetas()
  const pedido = argumento('ancho', 'todos')
  const perfiles = pedido === 'todos' ? PERFILES : PERFILES.filter((p) => p.id === pedido)
  const salida: Record<string, unknown>[] = []
  for (const perfil of perfiles) salida.push(await conElAncho(perfil))
  console.log(`\n  ${guardarJson('f-variantes', { brillos: BRILLOS, opacidades: OPACIDADES, anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
