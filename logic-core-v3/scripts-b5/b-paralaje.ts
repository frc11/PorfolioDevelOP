/**
 * B5 · EL PARALAJE DE MOUSE Y SU TECHO DE CONTRASTE.
 *
 *     npx tsx scripts-b5/b-paralaje.ts
 *
 * ── Qué mide, y por qué las dos cosas van en el mismo instrumento ─────────
 *
 * El bloque amplifica el offset de mouse hacia el orden de la referencia
 * (≥120 px de corrimiento contra nuestros 13). Mover la cámara así **mueve
 * dónde cae el logo y la celosía sobre el texto**, así que el techo no lo pone
 * el gusto: lo pone el contraste bajo el glifo. Medir el paralaje sin medir el
 * contraste en el mismo estado sería publicar una ganancia sin su costo.
 *
 * Por cada posición del puntero —las cuatro esquinas y el centro— y por cada una
 * de las dos secciones donde la escena se ve, se toman **tres capturas** (el
 * método de `B1-DELTAS` §4-bis: fondo, fondo otra vez, y con texto) y de ahí
 * salen las dos cifras.
 *
 * ── ⚠️ El movimiento del puntero es REAL, por CDP ─────────────────────────
 *
 * `Input.dispatchMouseEvent` produce un evento de confianza que r3f trata como
 * cualquier otro. Un `PointerEvent` sintético despachado desde la página
 * también llega, pero deja la duda de si lo que se midió fue el producto o el
 * instrumento; acá el navegador mueve el mouse.
 *
 * ⚠️ **Y se espera el asentamiento del puntero antes de capturar.** El offset
 * arrastra con `MOUSE_TAU = 0,45 s`; a 3τ son 1,35 s. Se esperan 2,5 s.
 */

import { mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, cuatro, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b5-comun'
import { cajaYTinta, moverElPuntero, ocultarPorSelector, verificarQueLaPaginaEstaEntera } from './pagina'
import { contrasteBajoElGlifo, corrimientoHorizontal } from './glifo'

const PERFIL = perfilPorId('1440')

/** El envoltorio de la escena. Se apaga para sacar la máscara de glifo. */
const SELECTOR_DE_LA_ESCENA = '[data-escena]'
/**
 * ⚠️ **LAS CAPTURAS INTERMEDIAS NO SE COMMITEAN.** Son 63 PNG de viewport
 * completo — 52 MB por corrida. Van al scratchpad de la corrida, que está en
 * `.gitignore`; lo que SÍ se commitea son las cuatro del reporte, en
 * `docs/rediseno/capturas/b5/`, y el JSON con las cifras.
 */
const TEMP = '.b5-capturas'

/**
 * ⚠️ **EL PISO DE PIXELES DE GLIFO — contra el verde por vacio.**
 *
 * Un contraste «sin ningun pixel bajo AA» medido sobre 384 pixeles de glifo no
 * dice que el texto se lee: dice que **casi no habia texto**. Paso de verdad, y
 * la causa fue que a `scrollY = 14400` la coreografia todavia no habia revelado
 * los cuatro items del diferencial (opacidad heredada 0, con caja). Este piso
 * convierte ese caso en un rojo.
 */
const MINIMO_DE_GLIFO = 3000

/**
 * Las posiciones del puntero. Las cinco que la instrucción pide para el
 * contraste —las cuatro esquinas y el centro— más **el par a media altura**,
 * que es el que mide el paralaje comparable.
 *
 * ⚠️ El par de media altura no es un lujo: `sup-izq → sup-der` e
 * `inf-izq → inf-der` también son barridos de azimut puro, pero cada uno con la
 * cámara **fuera** de su altura neutra, y ahí el paralaje del piso cambia de
 * orden. La referencia se midió a `y = 450`; para comparar contra su número hay
 * que barrer a la misma altura.
 */
const PUNTEROS = [
  { id: 'centro', x: 720, y: 450 },
  { id: 'sup-izq', x: 24, y: 24 },
  { id: 'sup-der', x: 1416, y: 24 },
  { id: 'inf-izq', x: 24, y: 876 },
  { id: 'inf-der', x: 1416, y: 876 },
  { id: 'medio-izq', x: 24, y: 450 },
  { id: 'medio-der', x: 1416, y: 450 },
] as const

/**
 * Las DOS secciones donde la escena se ve a través del panel. No son elegidas:
 * son las dos ventanas de `visibilidad.ts`, o sea los únicos lugares del
 * recorrido donde el texto cae sobre la escena y el contraste puede moverse.
 */
const ESCENARIOS = [
  {
    id: 'hero-titular',
    scrollY: 0,
    /**
     * ⚠️ **NO es el `<h1>`.** El `<h1>` de esta pantalla es `sr-only`: mide
     * **1×1 px** con `clip-path: inset(50%)`, o sea que no pinta un píxel. El
     * titular que se ve —y el que B1 midió en 10,45:1— es el `div.font-titulo`
     * de al lado. Apuntar al `<h1>` devuelve 50 píxeles de «glifo» en vez de
     * 40.143, y ése fue el primer resultado de este instrumento.
     */
    selectorDelTexto: '[data-panel="hero"] .font-titulo',
    textoGrande: true,
  },
  {
    id: 'diferencial-titular',
    scrollY: 14400,
    selectorDelTexto: '[data-panel="por-que-develop"] .text-fluido-titulo-xl',
    textoGrande: true,
  },
  {
    /** El cuerpo de 15 px: el texto MÁS exigente del recorrido sobre la escena. */
    id: 'diferencial-cuerpo',
    /**
     * ⚠️ **14.800 y no 14.400, y la diferencia es entre medir y no medir.**
     * A 14.400 los cuatro items existen en el DOM con caja, pero su opacidad
     * heredada es **0** —la coreografia todavia no los revelo— y este
     * instrumento devolvia **384 pixeles de glifo con 0 bajo AA**: verde por
     * vacio, con la forma exacta que el bloque tiene prohibida. A 14.800 los
     * cuatro estan en opacidad 1 y dentro del cuadro. `MINIMO_DE_GLIFO` es lo
     * que convierte ese caso en un rojo en vez de en un verde.
     */
    scrollY: 14800,
    selectorDelTexto: '[data-panel="por-que-develop"] .font-cuerpo',
    textoGrande: false,
  },
] as const

async function principal(): Promise<void> {
  mkdirSync(TEMP, { recursive: true })
  const filas: unknown[] = []

  await conLaPagina(
    PERFIL,
    '/v3',
    async ({ pagina, estado }) => {
      const etapa = await medir<string>(
        pagina,
        `document.querySelector('[data-escena]')?.getAttribute('data-intro') ?? '(sin escena)'`,
      )
      if (etapa === 'covering' || etapa === 'revealing') {
        throw new Error(`la escena está RETENIDA (data-intro="${etapa}"): con la pose clavada en 0 no hay paralaje que medir`)
      }
      const motor = await medir<string | null>(
        pagina,
        `document.documentElement.getAttribute('data-v3-scroll-suave')`,
      )
      await esperarElPrimerCuadro(pagina)
      await verificarQueLaPaginaEstaEntera(pagina, PERFIL)

      for (const escenario of ESCENARIOS) {
        const yReal = await scrollA(pagina, escenario.scrollY)
        await esperarElPrimerCuadro(pagina)
        const { cajas, caja, tinta, texto, elementos, nodosSalteadosPorRecorte } = await cajaYTinta(
          pagina,
          escenario.selectorDelTexto,
        )

        const capturasPorPuntero: Record<string, string> = {}
        for (const puntero of PUNTEROS) {
          await moverElPuntero(pagina, PERFIL, puntero.x, puntero.y)
          // 2,5 s = 5,5 × MOUSE_TAU. El offset ya no se mueve.
          await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 2500)); return true })()')

          /**
           * ⚠️ **LAS TRES CAPTURAS, Y CUÁL APAGA QUÉ.** El porqué —con el rojo
           * medido que lo obligó— está en el docblock de `glifo.ts`. En una
           * línea: la máscara sale de una captura **sin escena**, no de
           * diferenciar píxeles contra una escena que se mueve.
           */
          if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) {
            throw new Error('la escena no quedó oculta: la máscara no sería del texto sobre papel plano')
          }
          const mascaraT = `${TEMP}/${escenario.id}-${puntero.id}-T.png`
          await capturar(pagina, mascaraT)
          await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)

          if (!(await ocultarPorSelector(pagina, escenario.selectorDelTexto, true))) {
            throw new Error('el texto no quedó oculto: la captura del fondo no sería del fondo')
          }
          const fondoA = `${TEMP}/${escenario.id}-${puntero.id}-A.png`
          await capturar(pagina, fondoA)
          await ocultarPorSelector(pagina, escenario.selectorDelTexto, false)

          const conTexto = `${TEMP}/${escenario.id}-${puntero.id}-C.png`
          await capturar(pagina, conTexto)
          capturasPorPuntero[puntero.id] = conTexto

          const lectura = contrasteBajoElGlifo(mascaraT, fondoA, cajas, tinta, escenario.textoGrande)
          if (lectura.pixelesDeGlifo < MINIMO_DE_GLIFO) {
            throw new Error(
              `${escenario.id} @ ${yReal}: solo ${lectura.pixelesDeGlifo} pixeles de glifo (piso ${MINIMO_DE_GLIFO}). ` +
                'El texto no esta pintado en la mascara: cualquier contraste de aca seria verde por vacio.',
            )
          }
          filas.push({
            seccion: escenario.id,
            puntero: puntero.id,
            scrollY: yReal,
            caja,
            tinta,
            texto,
            elementos,
            nodosSalteadosPorRecorte,
            ...lectura,
          })
        }

        // El paralaje: el fondo con el puntero en una esquina contra la opuesta.
        // Se mide sobre las capturas CON texto, que es lo que el visitante ve, y
        // sobre tres bandas para que un solo plano no decida.
        const bandas = [
          { id: 'alta', desde: Math.round(PERFIL.alto * 0.11), hasta: Math.round(PERFIL.alto * 0.33) },
          { id: 'media', desde: Math.round(PERFIL.alto * 0.39), hasta: Math.round(PERFIL.alto * 0.61) },
          { id: 'baja', desde: Math.round(PERFIL.alto * 0.67), hasta: Math.round(PERFIL.alto * 0.87) },
        ]
        for (const banda of bandas) {
          filas.push({
            seccion: escenario.id,
            paralaje: `${banda.id}`,
            /** El comparable con la referencia: azimut puro a altura neutra. */
            medio: corrimientoHorizontal(
              capturasPorPuntero['medio-izq'],
              capturasPorPuntero['medio-der'],
              banda,
            ),
            arriba: corrimientoHorizontal(
              capturasPorPuntero['sup-izq'],
              capturasPorPuntero['sup-der'],
              banda,
            ),
            abajo: corrimientoHorizontal(
              capturasPorPuntero['inf-izq'],
              capturasPorPuntero['inf-der'],
              banda,
            ),
          })
        }
      }

      const ruta = guardarJson('b5-paralaje', {
        que: 'el paralaje de mouse y el contraste bajo el glifo, en las cinco posiciones del puntero',
        instrumento: 'scripts-b5/b-paralaje.ts — puntero movido por Input.dispatchMouseEvent, tres capturas por posición (B1-DELTAS §4-bis)',
        perfil: PERFIL.id,
        estrangulamiento: 'ninguno',
        motorDeScroll: motor,
        etapaDelIntro: etapa,
        estadoDeLaPagina: estado,
        punteros: PUNTEROS,
        filas,
      })
      console.log(`escrito: ${ruta}`)
      for (const f of filas as Record<string, unknown>[]) {
        if (f.paralaje !== undefined) {
          const m = f.medio as { px: number; saturado: boolean }
          const a = f.arriba as { px: number; saturado: boolean }
          const b = f.abajo as { px: number; saturado: boolean }
          const fmt = (v: { px: number; saturado: boolean }): string =>
            `${String(v.px).padStart(5)}px${v.saturado ? '+' : ' '}`
          console.log(
            `  paralaje ${String(f.seccion).padEnd(20)} banda ${String(f.paralaje).padEnd(6)} MEDIO ${fmt(m)} · arriba ${fmt(a)} · abajo ${fmt(b)}`,
          )
        } else {
          console.log(
            `  contraste ${String(f.seccion).padEnd(20)} ${String(f.puntero).padEnd(9)} peor ${String(f.peorContraste).padStart(7)}:1  p1 ${String(f.p1Contraste).padStart(7)}  mediana ${String(f.medianaContraste).padStart(7)}  glifo ${String(f.pixelesDeGlifo).padStart(7)} px  bajo AA(${f.umbralAA}) ${f.bajoAA}`,
          )
        }
      }
      console.log(`  (cuatro decimales de control: ${cuatro(1 / 3)})`)
      return null
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )
}

void principal()
